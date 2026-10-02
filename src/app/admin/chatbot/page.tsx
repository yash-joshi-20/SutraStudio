"use client";

import React, { useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function AdminChatbotPreviewPage() {
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
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error' }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };
  
  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#F8F5EF] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Chatbot Preview</h1>
            <p className="text-[#64748B] mt-2">Test newly approved knowledge before publishing publicly</p>
            <Badge className="mt-3">Preview Mode</Badge>
          </div>
          <div className="bg-white border border-[#EADFCB] rounded-lg h-[65vh] flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
                  <div className={`inline-block p-3 rounded-lg ${m.role === 'user' ? 'bg-[#D4A35A] text-white' : 'bg-[#F8F5EF]'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#EADFCB] p-4 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Test pricing, services, FAQs..."
                className="flex-1 border border-[#EADFCB] rounded p-2"
              />
              <Button onClick={send}>Send</Button>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
