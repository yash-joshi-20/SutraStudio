"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  PhoneCall,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  Building2,
  Layers,
  DollarSign,
  HelpCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  sender: "bot" | "user" | "system";
  text: string;
  time: string;
  sources?: Array<{ title: string; category: string }>;
  isLeadPrompt?: boolean;
}

const QUICK_ACTIONS = [
  { label: "Our Services", query: "What services do you offer and what are their features?" },
  { label: "Pricing & Plans", query: "What are your pricing plans and rates?" },
  { label: "About Company", query: "Tell me about your company background and expertise" },
  { label: "Office & Contact", query: "Where are you located and how can I contact you?" },
];

export function FloatingChatModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: "Namaste! 🙏 Welcome to Shri Ram Tech. I am your verified AI assistant, powered exclusively by our admin-approved knowledge base. How can I assist you today?",
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Human Handoff / Lead Capture Modal
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [handoffForm, setHandoffForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    requirement: "",
    message: "",
  });
  const [handoffSubmitted, setHandoffSubmitted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: data.answer || "I don't have verified information about that yet. Please contact our team for the most accurate information.",
        sources: data.sources,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: "bot",
        text: "I don't have verified information about that yet. Please contact our team for the most accurate information.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "msg-welcome-new",
        sender: "bot",
        text: "Chat cleared. I am ready to answer any questions about our approved services, pricing, and company details.",
        time: "Just now",
      },
    ]);
  };

  const handleHandoffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: handoffForm.name,
          email: handoffForm.email,
          phone: handoffForm.phone,
          company: handoffForm.company,
          requirement: handoffForm.requirement || handoffForm.message,
          source: "human_handoff",
        }),
      });

      setHandoffSubmitted(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `handoff_${Date.now()}`,
          sender: "system",
          text: `Thank you, ${handoffForm.name}! Your request has been dispatched to our Executive Team. A senior director will contact you at ${handoffForm.phone || handoffForm.email} shortly.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setTimeout(() => {
        setShowHandoffModal(false);
        setHandoffSubmitted(false);
        setHandoffForm({ name: "", email: "", phone: "", company: "", requirement: "", message: "" });
      }, 2000);
    } catch {
      alert("Failed to send request. Please try again.");
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:flex items-center gap-2 bg-[#FFFDF9] border border-[#EADFCB] px-3.5 py-2 rounded-full shadow-lg text-xs text-[#5C3A1E] font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
            <span>Ask AI Assistant</span>
          </motion.div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
          className="w-14 h-14 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center shadow-xl hover:bg-[#432A15] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-[#D4A35A]/50 focus:outline-none focus:ring-4 focus:ring-[#D4A35A]/30 cursor-pointer"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <div className="relative">
              <MessageSquare className="w-6 h-6 text-[#D4A35A]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#2E7D4F] rounded-full ring-2 ring-[#5C3A1E]" />
            </div>
          )}
        </button>
      </div>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[640px] h-[82vh] bg-[#FFFDF9] border border-[#EADFCB] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#0F172A]"
          >
            {/* Modal Header */}
            <div className="p-4 bg-[#F8F5EF] border-b border-[#EADFCB] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#5C3A1E] text-white flex items-center justify-center border border-[#D4A35A]/40 shadow-xs">
                  <Bot className="w-5 h-5 text-[#D4A35A]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif text-sm font-bold text-[#0F172A]">
                      Shri Ram Tech AI
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EDF7F0] text-[#2E7D4F] text-[10px] font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      Approved RAG
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    Grounded strictly in verified company knowledge
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Clear Conversation"
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#EADFCB]/50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize Chat"
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#EADFCB]/50 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div className="p-2.5 bg-[#FAF9F5] border-b border-[#EADFCB]/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {QUICK_ACTIONS.map((qa, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(qa.query)}
                  className="px-2.5 py-1 rounded-full bg-white border border-[#EADFCB] text-[11px] font-medium text-[#5C3A1E] hover:border-[#D4A35A] hover:bg-[#F8F5EF] whitespace-nowrap transition-colors shrink-0 shadow-2xs"
                >
                  {qa.label}
                </button>
              ))}
              <button
                onClick={() => setShowHandoffModal(true)}
                className="px-2.5 py-1 rounded-full bg-[#5C3A1E] text-white text-[11px] font-medium hover:bg-[#432A15] whitespace-nowrap transition-colors shrink-0 shadow-2xs flex items-center gap-1"
              >
                <PhoneCall className="w-3 h-3 text-[#D4A35A]" />
                <span>Talk to Human</span>
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === "user"
                      ? "items-end"
                      : m.sender === "system"
                      ? "items-center"
                      : "items-start"
                  }`}
                >
                  {m.sender === "system" ? (
                    <div className="p-3 rounded-2xl bg-[#EDF7F0] border border-[#2E7D4F]/20 text-[#2E7D4F] text-center w-full my-2">
                      <p className="font-semibold text-xs">{m.text}</p>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs relative group ${
                        m.sender === "user"
                          ? "bg-[#5C3A1E] text-white rounded-br-xs"
                          : "bg-white border border-[#EADFCB] text-[#0F172A] rounded-bl-xs"
                      }`}
                    >
                      <div className="whitespace-pre-line leading-relaxed">
                        {m.text}
                      </div>

                      {/* Sources pill if returned */}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-[#EADFCB]/60 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-[#A98B57] block">
                            Verified Sources:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {m.sources.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-[#EADFCB] text-[10px] text-[#5C3A1E]"
                              >
                                {s.category}: {s.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span
                          className={`text-[9px] ${
                            m.sender === "user" ? "text-white/60" : "text-[#94A3B8]"
                          }`}
                        >
                          {m.time}
                        </span>
                        {m.sender === "bot" && (
                          <button
                            onClick={() => handleCopy(m.id, m.text)}
                            className="text-[#94A3B8] hover:text-[#5C3A1E] opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy response"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-3 h-3 text-[#2E7D4F]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-white border border-[#EADFCB] rounded-2xl rounded-bl-xs w-fit shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-[#D4A35A] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[#5C3A1E] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-[#D4A35A] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-[#64748B] ml-1">
                    Retrieving approved knowledge...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#F8F5EF] border-t border-[#EADFCB] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about services, pricing, company..."
                  className="flex-1 bg-white border border-[#EADFCB] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A] focus:ring-1 focus:ring-[#D4A35A]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-xl bg-[#5C3A1E] text-white hover:bg-[#432A15] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4 text-[#D4A35A]" />
                </button>
              </form>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#94A3B8] px-1">
                <span>100% Admin-Approved Data Only</span>
                <button
                  onClick={() => setShowHandoffModal(true)}
                  className="text-[#5C3A1E] font-semibold hover:underline"
                >
                  Talk to Executive Team
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Talk to Human / Lead Modal */}
      <AnimatePresence>
        {showHandoffModal && (
          <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFFDF9] border border-[#EADFCB] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-[#0F172A]"
            >
              <button
                onClick={() => setShowHandoffModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F5EF]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#5C3A1E] text-white flex items-center justify-center border border-[#D4A35A]/40">
                  <PhoneCall className="w-5 h-5 text-[#D4A35A]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">Talk to Human Expert</h3>
                  <p className="text-xs text-[#64748B]">Direct escalation to our Executive Leadership</p>
                </div>
              </div>

              {handoffSubmitted ? (
                <div className="p-6 text-center space-y-2">
                  <Check className="w-10 h-10 text-[#2E7D4F] mx-auto" />
                  <h4 className="font-serif font-bold text-base">Request Dispatched!</h4>
                  <p className="text-xs text-[#64748B]">
                    Our Senior Producer will reach out to you immediately.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleHandoffSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold block mb-1">Your Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={handoffForm.name}
                      onChange={(e) => setHandoffForm({ ...handoffForm, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white text-xs focus:outline-none focus:border-[#D4A35A]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold block mb-1">Email Address *</label>
                      <input
                        required
                        type="email"
                        placeholder="name@company.com"
                        value={handoffForm.email}
                        onChange={(e) => setHandoffForm({ ...handoffForm, email: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white text-xs focus:outline-none focus:border-[#D4A35A]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Phone / WhatsApp *</label>
                      <input
                        required
                        type="tel"
                        placeholder="+91 98000 00000"
                        value={handoffForm.phone}
                        onChange={(e) => setHandoffForm({ ...handoffForm, phone: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white text-xs focus:outline-none focus:border-[#D4A35A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Company / Brand Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      value={handoffForm.company}
                      onChange={(e) => setHandoffForm({ ...handoffForm, company: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white text-xs focus:outline-none focus:border-[#D4A35A]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1">Project Requirement / Message</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly describe what you'd like to build or discuss..."
                      value={handoffForm.message}
                      onChange={(e) => setHandoffForm({ ...handoffForm, message: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#EADFCB] bg-white text-xs focus:outline-none focus:border-[#D4A35A] resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" variant="primary" size="md" className="w-full justify-center">
                      Submit & Connect with Team
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
