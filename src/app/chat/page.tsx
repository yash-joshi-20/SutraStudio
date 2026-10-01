"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import {
  Send,
  Bot,
  UserCheck,
  Paperclip,
  Sparkles,
  ArrowRight,
  HardDrive,
  CheckCircle2,
  Clock,
  ShieldCheck,
  X,
  FileText,
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  sender: "ai" | "admin" | "client";
  text: string;
  workflowTriggered?: string;
  confidence?: number;
  time: string;
  attachment?: { name: string; size: string };
  actionLink?: { label: string; href: string };
}

const AI_INITIAL_MESSAGES: Message[] = [
  {
    id: "ai-1",
    sender: "ai",
    text: "Namaste Yash! 🙏 I am Sutra AI, your dedicated creative studio assistant. I can parse your concepts across 3D spatial modeling, commercial video ads, architectural renders, or Next.js engineering and map them to our autonomous n8n generative review pipelines. What would you like to conceptualize or commission today?",
    time: "10:00 AM",
  },
];

const ADMIN_INITIAL_MESSAGES: Message[] = [
  {
    id: "adm-1",
    sender: "admin",
    text: "Greetings Yash! I'm Raghavan Sharma, Principal Art Director at Sutra Studio. I've been personally supervising the 4K render passes for your Luxury Living Suite (#ORD-001). Feel free to share revision notes or direct questions regarding your Google Drive vault deliverables here.",
    time: "10:15 AM",
    actionLink: { label: "Review Pending Deliverable (#ORD-001)", href: "/orders" },
  },
];

const SUGGESTIONS = {
  ai: [
    "Design 3D spatial architectural renders",
    "Generate 15-second 4K commercial video",
    "Structure Next.js brand flagship",
    "Create Sanskrit-inspired brand identity",
  ],
  admin: [
    "Inquire about 4K render delivery time",
    "Request specular revision on wood texture",
    "Confirm Google Drive vault synchronization",
    "Schedule 15-min producer consultation",
  ],
};

export default function ChatPage() {
  const [chatChannel, setChatChannel] = useState<"ai" | "admin">("ai");
  const [aiMessages, setAiMessages] = useState<Message[]>(AI_INITIAL_MESSAGES);
  const [adminMessages, setAdminMessages] = useState<Message[]>(ADMIN_INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentMessages = chatChannel === "ai" ? aiMessages : adminMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, loading]);

  const sendMessage = async (textToSend?: string) => {
    const messageContent = textToSend || input;
    if (!messageContent.trim() && !attachedFile) return;

    const userMsg: Message = {
      id: `client-${Date.now()}`,
      sender: "client",
      text: messageContent || `Uploaded reference file: ${attachedFile?.name}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachment: attachedFile || undefined,
    };

    if (chatChannel === "ai") {
      setAiMessages((prev) => [...prev, userMsg]);
    } else {
      setAdminMessages((prev) => [...prev, userMsg]);
    }

    setInput("");
    setAttachedFile(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          mode: chatChannel,
        }),
      });

      const data = await res.json();

      const botMsg: Message = {
        id: `reply-${Date.now()}`,
        sender: chatChannel,
        text:
          data.reply ||
          (chatChannel === "admin"
            ? "I've noted this requirement and updated our production board. Our compositing team is applying the revision pass."
            : "Your requirement has been analyzed and classified for production."),
        workflowTriggered: data.classification?.service,
        confidence: data.classification?.confidence,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionLink:
          chatChannel === "ai" && data.classification?.service
            ? {
                label: `Commission ${data.classification.service} Project`,
                href: "/orders",
              }
            : undefined,
      };

      if (chatChannel === "ai") {
        setAiMessages((prev) => [...prev, botMsg]);
      } else {
        setAdminMessages((prev) => [...prev, botMsg]);
      }
    } catch {
      const fallbackMsg: Message = {
        id: `reply-${Date.now()}`,
        sender: chatChannel,
        text:
          chatChannel === "admin"
            ? `Thanks for your note on "${messageContent}". I have synchronized this directly with the creative leads on your active pipeline.`
            : `I have parsed your request regarding "${messageContent}". This aligns with our specialized studio pipeline. An order can be launched anytime.`,
        workflowTriggered: chatChannel === "ai" ? "Spatial 3D & Creative Workflow" : undefined,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      if (chatChannel === "ai") {
        setAiMessages((prev) => [...prev, fallbackMsg]);
      } else {
        setAdminMessages((prev) => [...prev, fallbackMsg]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAttachDummyFile = () => {
    setAttachedFile({
      name: "Sutra_Spatial_Reference_Pass.png",
      size: "2.4 MB",
    });
  };

  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <PortalSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl flex flex-col h-screen pb-24 md:pb-8">
          {/* ========================================================
              TOP CHANNEL SELECTOR HEADER
              ======================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EADFCB] gap-4 shrink-0">
            {/* Active Channel Details */}
            <div className="flex items-center gap-3">
              {chatChannel === "ai" ? (
                <div className="w-11 h-11 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] flex items-center justify-center shadow-xs">
                  <LotusSymbol className="w-7 h-7" color="gold" />
                </div>
              ) : (
                <Avatar
                  name="Raghavan Sharma"
                  size="md"
                  status="online"
                  className="shrink-0"
                />
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif font-semibold text-lg text-[#0F172A]">
                    {chatChannel === "ai" ? "Sutra AI Studio Assistant" : "Raghavan Sharma"}
                  </h2>
                  <Badge
                    variant={chatChannel === "ai" ? "gold" : "completed"}
                    size="sm"
                    showDot={true}
                  >
                    {chatChannel === "ai" ? "AI Workflow Core" : "Principal Art Director"}
                  </Badge>
                </div>
                <p className="text-xs text-[#64748B]">
                  {chatChannel === "ai"
                    ? "Autonomous scope classifier, Sanskrit aesthetic advisor & n8n pipeline routing."
                    : "Direct 1-on-1 concierge with studio leadership for active deliverables."}
                </p>
              </div>
            </div>

            {/* Conversation Switcher Tabs */}
            <div className="inline-flex rounded-full bg-[#FFFDF9] border border-[#EADFCB] p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setChatChannel("ai")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  chatChannel === "ai"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI Assistant</span>
              </button>
              <button
                type="button"
                onClick={() => setChatChannel("admin")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  chatChannel === "admin"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Art Director</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              MESSAGE THREAD STREAM
              ======================================================== */}
          <div className="flex-1 overflow-y-auto py-6 space-y-5 pr-1">
            {currentMessages.map((msg) => {
              const isClient = msg.sender === "client";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 max-w-2xl ${
                    isClient ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  {/* Sender Avatar */}
                  <div className="shrink-0 pt-0.5">
                    {isClient ? (
                      <div className="w-8 h-8 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        Y
                      </div>
                    ) : msg.sender === "admin" ? (
                      <Avatar name="Raghavan Sharma" size="sm" status="online" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#FFFDF9] border border-[#EADFCB] flex items-center justify-center shadow-xs">
                        <LotusSymbol className="w-4 h-4" color="gold" />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-1.5 max-w-[85%]">
                    <div
                      className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                        isClient
                          ? "bg-[#5C3A1E] text-white rounded-tr-none shadow-xs"
                          : "bg-[#FFFDF9] border border-[#EADFCB] text-[#0F172A] rounded-tl-none shadow-xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* File Attachment Chip */}
                      {msg.attachment && (
                        <div
                          className={`mt-2.5 p-2 rounded-xl border flex items-center gap-2 text-xs ${
                            isClient
                              ? "bg-white/10 border-white/20 text-white"
                              : "bg-[#F8F5EF] border-[#EADFCB] text-[#0F172A]"
                          }`}
                        >
                          <FileText className="w-4 h-4 shrink-0 text-[#D4A35A]" />
                          <span className="truncate">{msg.attachment.name}</span>
                          <span className="text-[10px] opacity-70">({msg.attachment.size})</span>
                        </div>
                      )}

                      {/* Workflow Classification Tag */}
                      {msg.workflowTriggered && (
                        <div className="mt-3 pt-2.5 border-t border-[#EADFCB]/60 text-xs flex items-center justify-between gap-2 text-[#5C3A1E]">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                            <span>Workflow: {msg.workflowTriggered}</span>
                          </div>
                          {msg.confidence && (
                            <span className="text-[10px] font-mono text-[#2E7D4F] bg-[#EDF7F0] px-1.5 py-0.2 rounded">
                              {Math.round(msg.confidence * 100)}% match
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actionable Deep Link */}
                      {msg.actionLink && (
                        <div className="mt-3 pt-2 border-t border-[#EADFCB]/60">
                          <Link href={msg.actionLink.href}>
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full justify-between"
                              withArrow
                            >
                              {msg.actionLink.label}
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>

                    <p
                      className={`text-[10px] text-[#94A3B8] px-1.5 ${
                        isClient ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex gap-3 max-w-sm mr-auto">
                <div className="w-8 h-8 rounded-full bg-[#FFFDF9] border border-[#EADFCB] flex items-center justify-center shrink-0 shadow-xs">
                  <LotusSymbol className="w-4 h-4" color="gold" />
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] rounded-tl-none shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D4A35A] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#D4A35A] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#D4A35A] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ========================================================
              SUGGESTION PILLS
              ======================================================== */}
          <div className="py-2 flex items-center gap-2 overflow-x-auto shrink-0 pb-2">
            {SUGGESTIONS[chatChannel].map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage(sug)}
                className="text-xs bg-[#FFFDF9] border border-[#EADFCB] text-[#5C3A1E] hover:border-[#D4A35A] px-3.5 py-1.5 rounded-full whitespace-nowrap shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* ========================================================
              ATTACHED FILE PREVIEW & INPUT BAR
              ======================================================== */}
          <div className="shrink-0 space-y-2">
            {attachedFile && (
              <div className="p-2 px-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] inline-flex items-center gap-2 text-xs text-[#0F172A]">
                <FileText className="w-3.5 h-3.5 text-[#5C3A1E]" />
                <span className="font-medium">{attachedFile.name}</span>
                <span className="text-[10px] text-[#94A3B8]">({attachedFile.size})</span>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="text-[#94A3B8] hover:text-[#DC2626] ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 flex items-center bg-[#FFFDF9] border border-[#EADFCB] rounded-2xl px-4 py-2.5 shadow-xs focus-within:border-[#D4A35A] transition-all">
                <input
                  type="text"
                  placeholder={
                    chatChannel === "ai"
                      ? "Ask about 3D rendering, video creation, web architecture or pipeline routing..."
                      : "Send message to Raghavan Sharma regarding active deliverables..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-[#0F172A] focus:outline-none placeholder:text-[#94A3B8]"
                />
                <button
                  type="button"
                  onClick={handleAttachDummyFile}
                  className="text-[#94A3B8] hover:text-[#5C3A1E] p-1.5 transition-colors cursor-pointer"
                  title="Attach Moodboard or Spec Reference"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="rounded-2xl shrink-0 px-5"
                disabled={(!input.trim() && !attachedFile) || loading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </RouteGuard>
  );
}
