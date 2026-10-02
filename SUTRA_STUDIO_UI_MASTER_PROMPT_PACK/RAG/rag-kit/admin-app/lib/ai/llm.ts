import { AI, requireEnv } from "./config";
import { sseData } from "./sse";

export type ChatMsg = { role: "user" | "assistant"; content: string };
type Opts = { system: string; messages: ChatMsg[]; signal?: AbortSignal; temperature?: number; maxTokens?: number };

const GEMINI = "https://generativelanguage.googleapis.com/v1beta";
const GROQ = "https://api.groq.com/openai/v1/chat/completions";

function geminiBody(o: Opts, json: boolean) {
  return {
    systemInstruction: { parts: [{ text: o.system }] },
    contents: o.messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    generationConfig: {
      temperature: o.temperature ?? 0.5,
      maxOutputTokens: o.maxTokens ?? 1024,
      ...(json ? { responseMimeType: "application/json" } : {}),
    },
  };
}

function groqBody(o: Opts, stream: boolean, json: boolean) {
  return {
    model: AI.groqChatModel,
    stream,
    temperature: o.temperature ?? 0.5,
    max_completion_tokens: o.maxTokens ?? 1024,
    messages: [{ role: "system", content: o.system }, ...o.messages],
    ...(json ? { response_format: { type: "json_object" } } : {}),
  };
}

async function call(url: string, headers: Record<string, string>, body: unknown, signal?: AbortSignal): Promise<Response> {
  const timeout = AbortSignal.timeout(60_000);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  if (!res.ok) throw new Error(`Language model request failed (${res.status})`);
  return res;
}

/** Streams the reply text in small pieces. Same interface for Gemini and Groq. */
export async function* streamChat(o: Opts): AsyncGenerator<string> {
  if (AI.chatProvider === "groq") {
    const res = await call(GROQ, { Authorization: `Bearer ${requireEnv("GROQ_API_KEY")}` }, groqBody(o, true, false), o.signal);
    for await (const data of sseData(res)) {
      if (data === "[DONE]") return;
      const text = (JSON.parse(data) as { choices?: { delta?: { content?: string } }[] }).choices?.[0]?.delta?.content;
      if (text) yield text;
    }
    return;
  }
  const res = await call(
    `${GEMINI}/models/${AI.geminiChatModel}:streamGenerateContent?alt=sse`,
    { "x-goog-api-key": requireEnv("GEMINI_API_KEY") },
    geminiBody(o, false),
    o.signal,
  );
  for await (const data of sseData(res)) {
    const j = JSON.parse(data) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
    for (const p of j.candidates?.[0]?.content?.parts ?? []) if (p.text && !p.thought) yield p.text;
  }
}

/** One-shot JSON answer (used for order drafts). Returns parsed, UNVALIDATED JSON: always validate it. */
export async function generateJson(o: Opts): Promise<unknown> {
  let text: string;
  if (AI.chatProvider === "groq") {
    const res = await call(GROQ, { Authorization: `Bearer ${requireEnv("GROQ_API_KEY")}` }, groqBody({ ...o, temperature: 0.1 }, false, true), o.signal);
    text = ((await res.json()) as { choices?: { message?: { content?: string } }[] }).choices?.[0]?.message?.content ?? "";
  } else {
    const res = await call(
      `${GEMINI}/models/${AI.geminiChatModel}:generateContent`,
      { "x-goog-api-key": requireEnv("GEMINI_API_KEY") },
      geminiBody({ ...o, temperature: 0.1 }, true),
      o.signal,
    );
    const parts = ((await res.json()) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] }).candidates?.[0]?.content?.parts ?? [];
    text = parts.filter((p) => p.text && !p.thought).map((p) => p.text).join("");
  }
  return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
}

/** Non-streaming text (used for staff reply drafts). */
export async function generateText(o: Opts): Promise<string> {
  let out = "";
  for await (const piece of streamChat(o)) out += piece;
  return out.trim();
}
