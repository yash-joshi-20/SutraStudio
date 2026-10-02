import "server-only";
import { generateJson, type ChatMsg } from "@/lib/ai/llm";
import { SERVICE_SLUGS } from "./catalog";

export type OrderDraft = {
  serviceSlug: string | null;
  title: string;
  summary: string;
  details: Record<string, string>;
  missing: string[];
};

const str = (v: unknown, max: number): string => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Never trust model output: every field is checked and clamped before it is used. */
export function validateOrderDraft(raw: unknown): OrderDraft {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const slug = typeof o.serviceSlug === "string" && SERVICE_SLUGS.includes(o.serviceSlug) ? o.serviceSlug : null;
  const details: Record<string, string> = {};
  if (o.details && typeof o.details === "object") {
    for (const [k, v] of Object.entries(o.details as Record<string, unknown>).slice(0, 20)) {
      const key = str(k, 40);
      const val = str(v, 300);
      if (key && val) details[key] = val;
    }
  }
  const missing = Array.isArray(o.missing) ? o.missing.map((m) => str(m, 120)).filter(Boolean).slice(0, 10) : [];
  return { serviceSlug: slug, title: str(o.title, 120), summary: str(o.summary, 600), details, missing };
}

/** Turns the chat so far into a structured order draft for the 4-step order screen (client still confirms it). */
export async function draftOrderFromConversation(messages: ChatMsg[]): Promise<OrderDraft> {
  const system = `You read a chat between a client and Sutra Studio and extract an order draft.
Return ONLY a JSON object with these keys:
- "serviceSlug": one of ${JSON.stringify(SERVICE_SLUGS)} or null if unclear
- "title": a short title for the order (max 80 characters)
- "summary": 2-4 sentences describing what the client wants
- "details": an object of short key/value facts the client stated (e.g. "format", "size", "deadline", "audience", "style")
- "missing": a list of important details still missing
Use only facts stated by the client. Do not invent anything. Write values in the client's language.`;
  const raw = await generateJson({ system, messages, maxTokens: 700 });
  return validateOrderDraft(raw);
}
