import type { ChatMsg } from "@/lib/ai/llm";

export type StoredMessage = { role: "user" | "assistant" | "staff" | "system"; content: string };

/** Staff messages count as assistant turns. System notices are dropped. Consecutive same-role turns are merged and the list starts with a user turn. */
export function toModelMessages(stored: StoredMessage[]): ChatMsg[] {
  const out: ChatMsg[] = [];
  for (const m of stored) {
    if (m.role === "system" || !m.content.trim()) continue;
    const role: ChatMsg["role"] = m.role === "user" ? "user" : "assistant";
    const last = out[out.length - 1];
    if (last && last.role === role) last.content += `\n${m.content}`;
    else out.push({ role, content: m.content });
  }
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}
