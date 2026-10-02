// Model names change often. Keep them in env vars, never hard-code them in call sites.
// Check the provider deprecation pages before launch and every few months:
//   Gemini: https://ai.google.dev/gemini-api/docs/deprecations
//   Groq:   https://console.groq.com/docs/deprecations
export type ChatProvider = "gemini" | "groq";

export const AI = {
  chatProvider: ((process.env.AI_CHAT_PROVIDER ?? "gemini") as ChatProvider),
  geminiChatModel: process.env.GEMINI_CHAT_MODEL ?? "gemini-3.6-flash",
  groqChatModel: process.env.GROQ_CHAT_MODEL ?? "openai/gpt-oss-120b",
  embeddingModel: process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001",
  /** Must equal the dimension of the Firestore vector index. Firestore allows up to 2048. */
  embeddingDims: Number(process.env.EMBEDDING_DIMS ?? 768),
  topK: Number(process.env.RAG_TOP_K ?? 3),
  /** COSINE distance = 1 - similarity (0 identical, 2 opposite). Matches farther than this are ignored. Tune with real data. */
  maxDistance: Number(process.env.RAG_MAX_DISTANCE ?? 0.55),
  historyMessages: 12,
} as const;

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}`);
  return v;
}
