"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/authContext";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
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
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Square,
  ChevronDown,
  ArrowDown,
  Settings,
  List,
  Layers,
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
  codeSnippet?: string;
}

const AI_INITIAL_MESSAGES: Message[] = [
  {
    id: "ai-1",
    sender: "ai",
    text: "Namaste Yash! 🙏 I am Sutra AI, your dedicated creative studio assistant. Tell me in plain words what you would like to create—such as 4K architectural renders, commercial motion video, 3D product models, Meta Ads campaigns, or Next.js web applications—and I will prepare an order draft for you.",
    time: "10:00 AM",
    codeSnippet: `// Example: Automated 3D Spatial Render Pipeline Trigger
const commission = await sutra.workflows.launch({
  service: "3D_VISUALIZATION",
  resolution: "4K_PRORES",
  driveSync: true
});`,
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
    "Commission 3D architectural spatial render",
    "Create 15-second 4K commercial motion reel",
    "Launch Meta Ads growth creative campaign",
    "Develop bespoke Next.js luxury flagship",
  ],
  admin: [
    "Inquire about 4K render delivery time",
    "Request specular revision on wood texture",
    "Confirm Google Drive vault synchronization",
    "Schedule 15-min producer consultation",
  ],
};

const CALL_TRANSCRIPTS = [
  { speaker: "Sutra AI Agent", text: "Namaste! Connecting to Sutra Studio Neural Audio Engine...", time: "00:02" },
  { speaker: "Client", text: "Hi! Can you check the delivery status for our Luxury Suite 4K render?", time: "00:08" },
  { speaker: "Sutra AI Agent", text: "Certainly Yash. Pass 02 has finished denoising and is waiting for your 1-click approval in the Client Vault.", time: "00:15" },
];

export default function ChatPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Per directive: The dedicated /chat page is deprecated from desktop & mobile.
    // Opening the main floating modal and routing the user to their dashboard/home.
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-sutra-chat"));
      router.replace(user ? "/dashboard" : "/");
    }
  }, [router, user]);

  const [chatChannel, setChatChannel] = useState<"ai" | "admin">("ai");
  const [aiMessages, setAiMessages] = useState<Message[]>(AI_INITIAL_MESSAGES);
  const [adminMessages, setAdminMessages] = useState<Message[]>(ADMIN_INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);

  // Phone AI Agent Call Mode State
  const [isCallMode, setIsCallMode] = useState(false);
  const [callState, setCallState] = useState<"idle" | "connecting" | "listening" | "speaking" | "thinking">("speaking");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(15);
  const [showTranscriptSheet, setShowTranscriptSheet] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);

  // Auto-scroll and copy state
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentMessages = chatChannel === "ai" ? aiMessages : adminMessages;

  // Track call timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCallMode) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCallMode]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, loading]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 150);
  };

  // Adjust textarea height up to 5 lines
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2500);
  };

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
    if (textareaRef.current) textareaRef.current.style.height = "auto";
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

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <PortalSidebar />

        <main id="main-content" className="flex-1 p-3 sm:p-6 lg:p-8 max-w-6xl flex flex-col h-[100dvh] pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-6 relative overflow-hidden">
          {/* ========================================================
              IF IN PHONE AI AGENT CALL MODE (FULL SCREEN NATIVE APP)
              ======================================================== */}
          {isCallMode ? (
            <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 rounded-3xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF9F5] to-[#F4EFE6] border border-[#EADFCB] shadow-xl relative overflow-hidden">
              {/* Subtle top ambient glow */}
              <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[#D4A35A]/15 to-transparent pointer-events-none" />

              {/* Call Top Bar */}
              <div className="relative z-10 flex items-center justify-between pb-4 border-b border-[#EADFCB]/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] flex items-center justify-center shadow-xs">
                    <LotusSymbol className="w-6 h-6" color="gold" />
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-base sm:text-lg text-[#0F172A]">
                      Sutra AI Phone Agent
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
                      <span className="text-xs font-mono text-[#5C3A1E] font-medium">
                        {callState === "speaking"
                          ? "Speaking • Neural Voice"
                          : callState === "listening"
                          ? "Listening to Client..."
                          : "Processing Intent..."}
                      </span>
                      <span className="text-xs text-[#94A3B8] font-mono">({formatTimer(callDuration)})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowTranscriptSheet(true)}
                    leftIcon={<List className="w-3.5 h-3.5" />}
                    className="min-h-[44px]"
                  >
                    Transcript
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettingsSheet(true)}
                    className="p-2 min-h-[44px] min-w-[44px]"
                    aria-label="Agent settings"
                  >
                    <Settings className="w-4 h-4 text-[#64748B]" />
                  </Button>
                </div>
              </div>

              {/* Central Voice Resonator Orb / Waveform Area */}
              <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center space-y-8 py-6">
                {/* Sacred Lotus Pulsing Orb */}
                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: callState === "speaking" ? [1, 1.25, 1] : [1, 1.05, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-[#D4A35A]/30 via-[#5C3A1E]/15 to-transparent blur-xl"
                  />
                  <motion.div
                    animate={{
                      scale: callState === "speaking" ? [1, 1.15, 1] : 1,
                    }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#FFFDF9] border-2 border-[#D4A35A] shadow-2xl flex items-center justify-center relative z-10"
                  >
                    <LotusSymbol className="w-16 h-16 sm:w-20 sm:h-20" color="gold" />
                  </motion.div>
                </div>

                {/* Simulated Audio Waveform Bars */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-1.5 h-10">
                    {[30, 60, 95, 70, 45, 85, 100, 65, 80, 50, 75, 40].map((h, idx) => (
                      <motion.span
                        key={idx}
                        animate={{
                          height:
                            callState === "speaking"
                              ? [`${Math.max(15, h * 0.3)}%`, `${h}%`, `${Math.max(20, h * 0.5)}%`]
                              : "20%",
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6 + (idx % 4) * 0.15,
                          ease: "easeInOut",
                        }}
                        className="w-1.5 sm:w-2 bg-gradient-to-t from-[#5C3A1E] to-[#D4A35A] rounded-full"
                      />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#64748B] max-w-sm mx-auto">
                    &ldquo;Pass 02 render is archived in Google Drive. Would you like me to dispatch the final color grade?&rdquo;
                  </p>
                </div>
              </div>

              {/* Bottom Control Dock (48px+ touch targets) */}
              <div className="relative z-10 pt-4 border-t border-[#EADFCB]/60 flex items-center justify-center gap-4 sm:gap-6">
                {/* Mute Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-md touch-target ${
                    isMuted
                      ? "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]"
                      : "bg-[#FFFDF9] text-[#0F172A] border border-[#EADFCB] hover:bg-[#F4EFE6]"
                  }`}
                  aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  <span className="text-[9px] font-semibold mt-0.5">{isMuted ? "Muted" : "Mute"}</span>
                </button>

                {/* Speaker Button */}
                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-md touch-target ${
                    !isSpeakerOn
                      ? "bg-[#FAF9F5] text-[#64748B] border border-[#EADFCB]"
                      : "bg-[#FFFDF9] text-[#5C3A1E] border border-[#D4A35A]"
                  }`}
                  aria-label={isSpeakerOn ? "Turn speaker off" : "Turn speaker on"}
                >
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  <span className="text-[9px] font-semibold mt-0.5">Speaker</span>
                </button>

                {/* End Call / Return to Text Mode */}
                <button
                  onClick={() => setIsCallMode(false)}
                  className="w-16 h-16 rounded-full bg-[#B42318] hover:bg-[#991B1B] text-white flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer touch-target"
                  aria-label="End voice call and return to text chat"
                >
                  <PhoneOff className="w-6 h-6" />
                  <span className="text-[9px] font-bold mt-0.5">End</span>
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================
               NORMAL LLM / AI CHAT THREAD INTERFACE
               ======================================================== */
            <>
              {/* Top Channel Header & Voice Call Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#EADFCB] gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  {chatChannel === "ai" ? (
                    <div className="w-10 h-10 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] flex items-center justify-center shadow-xs shrink-0">
                      <LotusSymbol className="w-6 h-6" color="gold" />
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-serif font-semibold text-base sm:text-lg text-[#0F172A]">
                        {chatChannel === "ai" ? "Sutra AI Studio Assistant" : "Raghavan Sharma"}
                      </h2>
                      <Badge
                        variant={chatChannel === "ai" ? "gold" : "completed"}
                        size="sm"
                        showDot={true}
                      >
                        {chatChannel === "ai" ? "Creative LLM" : "Principal Art Director"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      {chatChannel === "ai"
                        ? "Conversational briefing, automated draft creation & pipeline orchestration."
                        : "Direct studio supervisory concierge with 24h turnaround SLA."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* Dedicated Voice Call Mode Trigger */}
                  {chatChannel === "ai" && (
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => setIsCallMode(true)}
                      leftIcon={<PhoneCall className="w-3.5 h-3.5" />}
                      className="shadow-xs touch-target font-semibold text-xs"
                    >
                      Voice Agent
                    </Button>
                  )}

                  {/* Channel Switcher Tabs */}
                  <div className="inline-flex rounded-full bg-[#FFFDF9] border border-[#EADFCB] p-1 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setChatChannel("ai")}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 touch-target ${
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
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 touch-target ${
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
              </div>

              {/* Scrollable Message List Container */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto py-4 sm:py-6 space-y-4 pr-1 overscroll-contain"
              >
                {currentMessages.map((msg) => {
                  const isClient = msg.sender === "client";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[78ch] ${
                        isClient ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      {/* Avatar */}
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

                      {/* Bubble */}
                      <div className="space-y-1 max-w-[85%] sm:max-w-[80%]">
                        <div
                          className={`p-3.5 sm:p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                            isClient
                              ? "bg-[#5C3A1E] text-white rounded-tr-none shadow-xs"
                              : "bg-[#FFFDF9] border border-[#EADFCB] text-[#0F172A] rounded-tl-none shadow-xs"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                          {/* Code block with 1-click copy button */}
                          {msg.codeSnippet && (
                            <div className="mt-3 rounded-2xl bg-[#0F172A] text-slate-100 p-3.5 relative text-xs font-mono overflow-x-auto">
                              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                                <span>Code Specification</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(msg.codeSnippet!, msg.id)}
                                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                                >
                                  {copiedSnippetId === msg.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-[#2E7D4F]" />
                                      <span className="text-[#2E7D4F]">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="text-[11px] leading-relaxed overflow-x-auto">
                                <code>{msg.codeSnippet}</code>
                              </pre>
                            </div>
                          )}

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

                          {/* Service Classification */}
                          {msg.workflowTriggered && (
                            <div className="mt-3 pt-2.5 border-t border-[#EADFCB]/60 text-xs flex items-center justify-between gap-2 text-[#5C3A1E]">
                              <div className="flex items-center gap-1.5 font-semibold">
                                <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                                <span>Track: {msg.workflowTriggered}</span>
                              </div>
                              {msg.confidence && (
                                <span className="text-[10px] font-mono text-[#2E7D4F] bg-[#EDF7F0] px-1.5 py-0.5 rounded">
                                  {Math.round(msg.confidence * 100)}% match
                                </span>
                              )}
                            </div>
                          )}

                          {/* Actionable Link */}
                          {msg.actionLink && (
                            <div className="mt-3 pt-2 border-t border-[#EADFCB]/60">
                              <Link href={msg.actionLink.href}>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="w-full justify-between min-h-[44px]"
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

                {/* Thinking Indicator */}
                {loading && (
                  <div className="flex gap-3 max-w-sm mr-auto">
                    <div className="w-8 h-8 rounded-full bg-[#FFFDF9] border border-[#EADFCB] flex items-center justify-center shrink-0 shadow-xs">
                      <LotusSymbol className="w-4 h-4" color="gold" />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] rounded-tl-none shadow-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D4A35A] animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-[#D4A35A] animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-[#D4A35A] animate-bounce [animation-delay:0.4s]" />
                      <span className="text-xs text-[#64748B] ml-1.5">Synthesizing response...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Scroll To Latest Float Button */}
              {showScrollBottom && (
                <button
                  onClick={scrollToBottom}
                  className="absolute bottom-24 right-6 z-20 px-3 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] shadow-md text-xs font-semibold text-[#5C3A1E] flex items-center gap-1.5 hover:bg-[#F4EFE6] transition-all cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-[#D4A35A]" />
                  <span>Latest</span>
                </button>
              )}

              {/* Swipeable Suggestion Pills */}
              <div className="py-1.5 flex items-center gap-2 overflow-x-auto shrink-0 pb-2 no-scrollbar">
                {SUGGESTIONS[chatChannel].map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(sug)}
                    className="text-xs bg-[#FFFDF9] border border-[#EADFCB] text-[#5C3A1E] hover:border-[#D4A35A] px-3.5 py-1.5 rounded-full whitespace-nowrap shadow-2xs transition-colors cursor-pointer shrink-0 min-h-[36px] touch-target"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Sticky Bottom Composer */}
              <div className="shrink-0 space-y-2 pt-1">
                {attachedFile && (
                  <div className="p-2 px-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] inline-flex items-center gap-2 text-xs text-[#0F172A]">
                    <FileText className="w-3.5 h-3.5 text-[#5C3A1E]" />
                    <span className="font-medium">{attachedFile.name}</span>
                    <span className="text-[10px] text-[#94A3B8]">({attachedFile.size})</span>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="text-[#94A3B8] hover:text-[#DC2626] ml-1 cursor-pointer"
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
                  className="flex items-end gap-2"
                >
                  <div className="flex-1 flex items-center bg-[#FFFDF9] border border-[#EADFCB] rounded-2xl px-3.5 py-2 shadow-xs focus-within:border-[#D4A35A] transition-all">
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      placeholder={
                        chatChannel === "ai"
                          ? "Message Sutra AI assistant..."
                          : "Message Raghavan Sharma..."
                      }
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="flex-1 bg-transparent text-base sm:text-sm text-[#0F172A] focus:outline-none placeholder:text-[#94A3B8] resize-none max-h-32 leading-relaxed"
                    />
                    <button
                      type="button"
                      onClick={handleAttachDummyFile}
                      className="text-[#94A3B8] hover:text-[#5C3A1E] p-2 transition-colors cursor-pointer shrink-0 touch-target"
                      title="Attach Reference Asset"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="rounded-2xl shrink-0 px-4 min-h-[44px] min-w-[44px]"
                    disabled={(!input.trim() && !attachedFile) || loading}
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          )}

          {/* Transcript Bottom Sheet / Modal */}
          <Modal
            isOpen={showTranscriptSheet}
            onClose={() => setShowTranscriptSheet(false)}
            title="Real-Time Call Transcript"
            description="Live speech-to-text transcript generated by Sutra Studio Audio Engine."
          >
            <div className="space-y-3 py-2">
              {CALL_TRANSCRIPTS.map((t, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#5C3A1E]">
                    <span>{t.speaker}</span>
                    <span className="font-mono text-[10px] text-[#94A3B8]">{t.time}</span>
                  </div>
                  <p className="text-xs text-[#0F172A] leading-relaxed">{t.text}</p>
                </div>
              ))}
            </div>
          </Modal>

          {/* Agent Settings Bottom Sheet */}
          <Modal
            isOpen={showSettingsSheet}
            onClose={() => setShowSettingsSheet(false)}
            title="AI Phone Agent Controls"
            description="Adjust neural voice synthesis and studio pipeline parameters."
          >
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-1">
                <span className="font-semibold text-[#0F172A] block">Voice Persona</span>
                <p className="text-[#64748B]">Sutra Neural Warm Ivory (Female / Fluent English + Sanskrit)</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-1">
                <span className="font-semibold text-[#0F172A] block">Pipeline Latency</span>
                <p className="text-[#2E7D4F] font-mono">140ms ultra-low latency streaming</p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowSettingsSheet(false)}
                className="w-full min-h-[44px]"
              >
                Save Preferences
              </Button>
            </div>
          </Modal>
        </main>

        <MobileBottomNav />
      </div>
    </RouteGuard>
  );
}
