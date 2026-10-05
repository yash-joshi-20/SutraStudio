"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  PhoneCall,
  Sparkles,
  Settings,
  List,
  Clock,
  CheckCircle2,
  HardDrive,
  MessageSquare,
  Shield,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PhoneAiAgentPage() {
  const [callState, setCallState] = useState<"idle" | "connecting" | "listening" | "speaking" | "thinking">("speaking");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(24);
  const [activeTab, setActiveTab] = useState<"call" | "logs" | "settings">("call");
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const callLogs = [
    {
      id: "call-101",
      date: "Today, 10:14 AM",
      duration: "04:12",
      topic: "4K Architectural Render Pass 02 Review",
      outcome: "Dispatched to Google Drive Vault",
      status: "completed",
    },
    {
      id: "call-102",
      date: "Yesterday, 3:45 PM",
      duration: "02:40",
      topic: "Meta Ads 15s Commercial Reel Briefing",
      outcome: "Brief ingested & 3 variants scoped",
      status: "completed",
    },
    {
      id: "call-103",
      date: "Sep 28, 2026",
      duration: "06:18",
      topic: "Brand Sanskrit Monogram Identity Design",
      outcome: "Vector export package signed off",
      status: "completed",
    },
  ];

  const liveTranscript = [
    { speaker: "Sutra Agent", text: "Namaste Yash! Sutra Studio neural voice bridge active.", time: "00:02" },
    { speaker: "Client", text: "Has the teak wood reflection been softened on the living room render?", time: "00:09" },
    { speaker: "Sutra Agent", text: "Yes, our lead compositor toned down the specular exponent by 25%. The updated 4K file is in your /3D_RENDERS folder.", time: "00:16" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      <Navbar />

      <main id="main-content" className="flex-1 py-4 sm:py-8 px-3 sm:px-6 lg:px-8 app-container-cap pb-28 md:pb-12">
        {/* Large screen 3-panel layout / Mobile full-screen call stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Panel 1: Agent Capabilities & Call Logs (Desktop side panel, mobile tab) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
            <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A98B57]">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                <span>Agent Profile</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-base text-[#0F172A]">
                  Sutra Studio Audio Agent
                </h3>
                <p className="text-xs text-[#64748B]">
                  Direct neural voice link to creative pipeline execution.
                </p>
              </div>
              <div className="pt-2 space-y-2 text-xs text-[#5C3A1E]">
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]">
                  <span>Engine Latency</span>
                  <span className="font-mono font-semibold text-[#2E7D4F]">140ms</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]">
                  <span>Drive Vault Integration</span>
                  <span className="font-mono font-semibold text-[#2E7D4F]">Active</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-5 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A98B57]">
                Recent Voice Sessions
              </h4>
              <div className="space-y-2.5">
                {callLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#94A3B8]">{log.date}</span>
                      <span className="font-mono text-[10px] text-[#5C3A1E] font-semibold">{log.duration}</span>
                    </div>
                    <p className="font-semibold text-[#0F172A]">{log.topic}</p>
                    <p className="text-[11px] text-[#2E7D4F] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {log.outcome}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel 2: Central Phone AI Agent Interface (Full screen native feel) */}
          <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF9F5] to-[#F4EFE6] border border-[#EADFCB] shadow-lg min-h-[560px] sm:min-h-[640px] relative overflow-hidden">
            {/* Ambient gold glow */}
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#D4A35A]/15 to-transparent pointer-events-none" />

            {/* Top Bar with agent name and state */}
            <div className="relative z-10 flex items-center justify-between pb-4 border-b border-[#EADFCB]/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] flex items-center justify-center shadow-xs">
                  <LotusSymbol className="w-6 h-6" color="gold" />
                </div>
                <div>
                  <h1 className="font-serif font-bold text-lg text-[#0F172A]">
                    Sutra AI Phone Agent
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
                    <span className="text-xs font-mono text-[#5C3A1E] font-medium">
                      {callState === "speaking" ? "Speaking • Neural Voice" : "Listening..."}
                    </span>
                    <span className="text-xs text-[#94A3B8] font-mono">({formatTimer(callDuration)})</span>
                  </div>
                </div>
              </div>

              <div className="lg:hidden flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFilterSheet(true)}
                  className="min-h-[44px]"
                >
                  Logs
                </Button>
              </div>
            </div>

            {/* Central Animated Orb & Waveform */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center space-y-6 py-6">
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: callState === "speaking" ? [1, 1.3, 1] : [1, 1.06, 1],
                    opacity: [0.35, 0.65, 0.35],
                  }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-gradient-to-tr from-[#D4A35A]/30 via-[#5C3A1E]/15 to-transparent blur-xl"
                />
                <motion.div
                  animate={{
                    scale: callState === "speaking" ? [1, 1.12, 1] : 1,
                  }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#FFFDF9] border-2 border-[#D4A35A] shadow-2xl flex items-center justify-center relative z-10"
                >
                  <LotusSymbol className="w-20 h-20 sm:w-24 sm:h-24" color="gold" />
                </motion.div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-1.5 h-10">
                  {[25, 60, 95, 75, 40, 85, 100, 65, 80, 50, 75, 35].map((h, idx) => (
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
                <p className="text-xs sm:text-sm text-[#64748B] max-w-sm mx-auto leading-relaxed">
                  &ldquo;Pass 02 render is archived in Google Drive. You can approve with 1-click or dictate revisions.&rdquo;
                </p>
              </div>
            </div>

            {/* Bottom Dock Controls */}
            <div className="relative z-10 pt-4 border-t border-[#EADFCB]/60 flex items-center justify-center gap-4 sm:gap-6">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-md touch-target ${
                  isMuted
                    ? "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]"
                    : "bg-[#FFFDF9] text-[#0F172A] border border-[#EADFCB]"
                }`}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span className="text-[9px] font-semibold mt-0.5">{isMuted ? "Muted" : "Mute"}</span>
              </button>

              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-md touch-target ${
                  !isSpeakerOn
                    ? "bg-[#FAF9F5] text-[#64748B] border border-[#EADFCB]"
                    : "bg-[#FFFDF9] text-[#5C3A1E] border border-[#D4A35A]"
                }`}
                aria-label={isSpeakerOn ? "Turn off speaker" : "Turn on speaker"}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                <span className="text-[9px] font-semibold mt-0.5">Speaker</span>
              </button>

              <Link href="/chat">
                <button
                  className="w-16 h-16 rounded-full bg-[#B42318] hover:bg-[#991B1B] text-white flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer touch-target"
                  aria-label="End call and switch to text mode"
                >
                  <PhoneOff className="w-6 h-6" />
                  <span className="text-[9px] font-bold mt-0.5">End</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Panel 3: Live Transcript & Fast Action Links (Desktop side panel) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
            <div className="flex-1 p-5 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-4 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-[#EADFCB]/60">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A98B57]">
                  <List className="w-3.5 h-3.5 text-[#D4A35A]" />
                  <span>Live Transcript</span>
                </div>
                <span className="text-[10px] font-mono text-[#2E7D4F] bg-[#EDF7F0] px-2 py-0.5 rounded-full">
                  Real-Time
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto">
                {liveTranscript.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#5C3A1E]">
                      <span>{t.speaker}</span>
                      <span className="font-mono text-[10px] text-[#94A3B8]">{t.time}</span>
                    </div>
                    <p className="text-[#0F172A] leading-relaxed">{t.text}</p>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#EADFCB]/60 space-y-2">
                <Link href="/orders" className="block">
                  <Button variant="primary" size="sm" withArrow className="w-full">
                    Inspect 4K Deliverables
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Sheet for Call Logs */}
        <Modal
          isOpen={showFilterSheet}
          onClose={() => setShowFilterSheet(false)}
          title="Voice Agent Call Logs & Transcripts"
          description="Archived voice interactions with the studio neural assistant."
        >
          <div className="space-y-3 py-2 text-xs">
            {callLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-1">
                <div className="flex items-center justify-between font-mono text-[10px] text-[#94A3B8]">
                  <span>{log.date}</span>
                  <span className="font-bold text-[#5C3A1E]">{log.duration}</span>
                </div>
                <h4 className="font-serif font-semibold text-sm text-[#0F172A]">{log.topic}</h4>
                <p className="text-[#2E7D4F] text-[11px]">{log.outcome}</p>
              </div>
            ))}
          </div>
        </Modal>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
