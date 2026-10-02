import { AI, requireEnv } from "./config";
import { l2normalize } from "./vector";

const BASE = "https://generativelanguage.googleapis.com/v1beta";
const BATCH = 50;

type BatchResponse = { embeddings?: { values?: number[] }[] };

async function postWithRetry(url: string, body: unknown, attempts = 3): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": requireEnv("GEMINI_API_KEY") },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20_000),
      });
      if (res.ok) return res;
      if (res.status !== 429 && res.status < 500) throw new Error(`Embedding request failed (${res.status})`);
      lastErr = new Error(`Embedding request failed (${res.status})`);
    } catch (e) {
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, 400 * 2 ** i + Math.random() * 200));
  }
  throw lastErr instanceof Error ? lastErr : new Error("Embedding request failed");
}

/** Documents are embedded with RETRIEVAL_DOCUMENT, user questions with RETRIEVAL_QUERY (better matching). */
export async function embedTexts(texts: string[], kind: "document" | "query"): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const slice = texts.slice(i, i + BATCH);
    const res = await postWithRetry(`${BASE}/models/${AI.embeddingModel}:batchEmbedContents`, {
      requests: slice.map((text) => ({
        model: `models/${AI.embeddingModel}`,
        content: { parts: [{ text }] },
        taskType: kind === "document" ? "RETRIEVAL_DOCUMENT" : "RETRIEVAL_QUERY",
        outputDimensionality: AI.embeddingDims,
      })),
    });
    const json = (await res.json()) as BatchResponse;
    if (!json.embeddings || json.embeddings.length !== slice.length) throw new Error("Unexpected embedding response");
    for (const e of json.embeddings) {
      if (!e.values || e.values.length !== AI.embeddingDims) throw new Error("Embedding dimension mismatch");
      out.push(l2normalize(e.values));
    }
  }
  return out;
}
