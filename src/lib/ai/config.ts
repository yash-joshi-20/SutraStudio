export const AI = {
  chatProvider: (process.env.AI_CHAT_PROVIDER || "gemini") as "gemini" | "groq",
  geminiChatModel: process.env.GEMINI_CHAT_MODEL || "gemini-3.6-flash",
  geminiModelCascade: [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-3.8-flash",
  ],
  groqChatModel: process.env.GROQ_CHAT_MODEL || "llama-3.3-70b-versatile",
  topK: 4,
  maxDistance: 0.85,
  historyMessages: 10,
};

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    return "";
  }
  return value;
}
