"use client";

import React, { useState } from "react";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import { Send, Bot, UserCheck, Paperclip, Sparkles } from "lucide-react";

interface Message {
  id: string;
  sender: "ai" | "admin" | "client";
  text: string;
  workflowTriggered?: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m-1",
    sender: "ai",
    text: "Hi Yash! 👋 I am Sutra AI, your dedicated creative studio assistant. I can help classify your requirements across 3D modeling, commercial video ads, interior renders, or web development, and route them to our production pipelines. What would you like to create today?",
    time: "Just now",
  },
];

const SUGGESTIONS = [
  "Create a luxury product image",
  "Make a 10 sec commercial video",
  "Design a modern villa interior",
  "Build a Next.js website",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [chatMode, setChatMode] = useState<"ai" | "admin">("ai");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (textToSend?: string) => {
    const messageContent = textToSend || input;
    if (!messageContent.trim()) return;

    const userMsg: Message = {
      id: `client-${Date.now()}`,
      sender: "client",
      text: messageContent,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          mode: chatMode,
        }),
      });

      const data = await res.json();
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: chatMode === "admin" ? "admin" : "ai",
        text: data.reply || "Your requirement has been analyzed and classified.",
        workflowTriggered: data.classification?.service,
        time: "Just now",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Fallback response for offline or local preview
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: chatMode === "admin" ? "admin" : "ai",
        text: `Understood! I have analyzed your request regarding "${messageContent}". This fits our specialized creative pipeline. An order draft can be launched anytime.`,
        workflowTriggered: "Image / 3D Workflow",
        time: "Just now",
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A]">
      <PortalSidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-5xl flex flex-col h-[calc(100vh-2rem)] pb-24 md:pb-8">
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EADFCB] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] flex items-center justify-center shadow-xs">
              <LotusSymbol className="w-6 h-6" color="gold" />
            </div>
            <div>
              <h2 className="font-serif font-semibold text-lg text-[#0F172A] flex items-center gap-2">
                <span>{chatMode === "ai" ? "Sutra AI Assistant" : "Studio Admin Lead"}</span>
                <span className="w-2 h-2 rounded-full bg-[#2E7D4F]" />
              </h2>
              <p className="text-[11px] text-[#64748B]">
                {chatMode === "ai"
                  ? "AI Workflow Router & Creative Scoping"
                  : "Live Human Studio Producer"}
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#FFFDF9] border border-[#EADFCB] p-1 rounded-full text-xs">
            <button
              onClick={() => setChatMode("ai")}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                chatMode === "ai"
                  ? "bg-[#5C3A1E] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              AI Mode
            </button>
            <button
              onClick={() => setChatMode("admin")}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                chatMode === "admin"
                  ? "bg-[#5C3A1E] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Admin Mode
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
          {messages.map((msg) => {
            const isClient = msg.sender === "client";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${
                  isClient ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    isClient
                      ? "bg-[#5C3A1E] text-white"
                      : msg.sender === "admin"
                      ? "bg-[#D4A35A] text-[#0F172A]"
                      : "bg-[#FFFDF9] border border-[#EADFCB] text-[#5C3A1E]"
                  }`}
                >
                  {isClient ? "Y" : msg.sender === "admin" ? "A" : "✦"}
                </div>

                <div className="space-y-1">
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      isClient
                        ? "bg-[#5C3A1E] text-white rounded-tr-none shadow-xs"
                        : "bg-[#FFFDF9] border border-[#EADFCB] text-[#0F172A] rounded-tl-none shadow-xs"
                    }`}
                  >
                    <p>{msg.text}</p>

                    {msg.workflowTriggered && (
                      <div className="mt-3 pt-2 border-t border-black/10 text-xs flex items-center gap-1.5 text-[#D4A35A] font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Workflow Identified: {msg.workflowTriggered}</span>
                      </div>
                    )}
                  </div>
                  <p
                    className={`text-[10px] text-[#94A3B8] px-1 ${
                      isClient ? "text-right" : "text-left"
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggestion Chips */}
        <div className="py-2 flex items-center gap-2 overflow-x-auto shrink-0">
          {SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              onClick={() => sendMessage(sug)}
              className="text-xs bg-[#FFFDF9] border border-[#EADFCB] text-[#5C3A1E] hover:border-[#D4A35A] px-3.5 py-1.5 rounded-full whitespace-nowrap shadow-2xs transition-colors cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="pt-2 shrink-0 flex items-center gap-2"
        >
          <div className="flex-1 flex items-center bg-[#FFFDF9] border border-[#EADFCB] rounded-2xl px-4 py-2 shadow-xs focus-within:border-[#D4A35A]">
            <input
              type="text"
              placeholder="Ask about image creation, video ads, 3D, or interior design..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[#0F172A] focus:outline-none placeholder:text-[#94A3B8]"
            />
            <button
              type="button"
              className="text-[#94A3B8] hover:text-[#5C3A1E] p-1.5"
              title="Attach File"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="rounded-2xl shrink-0 px-4"
            disabled={!input.trim() || loading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </main>

      <MobileBottomNav />
    </div>
  );
}
