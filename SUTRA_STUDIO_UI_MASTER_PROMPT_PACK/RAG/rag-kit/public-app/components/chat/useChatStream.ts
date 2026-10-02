"use client";
import { useCallback, useRef, useState } from "react";

export type ChatItem = { id: string; role: "user" | "assistant" | "staff" | "system"; content: string };
type Mode = "ai" | "human";

/**
 * Sends a message to /api/chat and appends the streamed reply to `messages`.
 * UI labels: "assistant" = Sutra AI, "staff" = Sutra Studio team. Do not hide which one is talking.
 */
export function useChatStream(initial: ChatItem[] = [], initialConversationId?: string) {
  const [messages, setMessages] = useState<ChatItem[]>(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("ai");
  const [handoff, setHandoff] = useState(false);
  const conversationId = useRef<string | undefined>(initialConversationId);

  const send = useCallback(async (text: string) => {
    const message = text.trim();
    if (!message || pending) return;
    setError(null);
    setPending(true);
    const aiId = `a_${Date.now()}`;
    setMessages((m) => [...m, { id: `u_${Date.now()}`, role: "user", content: message }]);
    let assistantAdded = false;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conversationId.current, message }),
      });
      if (!res.ok || !res.body) {
        const j = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(j?.message ?? "Something went wrong. Please try again.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf("\n\n")) >= 0) {
          const block = buf.slice(0, i);
          buf = buf.slice(i + 2);
          const line = block.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          const ev = JSON.parse(line.slice(5)) as { type: string; text?: string; message?: string; conversationId?: string; mode?: Mode };
          if (ev.type === "meta") {
            conversationId.current = ev.conversationId;
            setMode(ev.mode ?? "ai");
          } else if (ev.type === "delta" && ev.text) {
            const chunk = ev.text;
            setMessages((m) =>
              assistantAdded
                ? m.map((x) => (x.id === aiId ? { ...x, content: x.content + chunk } : x))
                : [...m, { id: aiId, role: "assistant", content: chunk }],
            );
            assistantAdded = true;
          } else if (ev.type === "handoff") {
            setHandoff(true);
          } else if (ev.type === "error") {
            setError(ev.message ?? "Something went wrong. Please try again.");
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }, [pending]);

  return { messages, send, pending, error, mode, handoff, conversationId: conversationId.current };
}
