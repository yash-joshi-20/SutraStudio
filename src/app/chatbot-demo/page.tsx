"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function ChatbotDemoPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages([...messages, userMsg]);
    setLoading(true);
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, client_id: 'default_client' }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer, sources: data.sources }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Error' }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error' }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F8F5EF] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Studio Concierge Demo</h1>
          <p className="text-[#64748B]">Interactive knowledge discovery assistant</p>
        </div>
        <div className="bg-white border border-[#EADFCB] rounded-lg h-[60vh] flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
                <div className={`inline-block p-3 rounded-lg ${m.role === 'user' ? 'bg-[#D4A35A] text-white' : 'bg-[#F8F5EF]'}`}>
                  {m.content}
                </div>
                {m.sources && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {m.sources.map((s: any) => <Badge key={s.id}>{s.category}</Badge>)}
                  </div>
                )}
              </div>
            ))}
            {loading && <p className="text-[#64748B]">Thinking...</p>}
          </div>
          <div className="border-t border-[#EADFCB] p-4 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask about company info..."
              className="flex-1 border border-[#EADFCB] rounded p-2"
            />
            <Button onClick={send} disabled={loading}>Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
