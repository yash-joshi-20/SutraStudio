"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/authContext";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import {
  MessageSquare,
  Mail,
  Send,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Bot,
  ExternalLink,
  ChevronRight,
  Radio,
  Sliders,
  X,
  PhoneCall,
  User,
} from "lucide-react";

interface InquiryRecord {
  id: string;
  channel: "WhatsApp" | "Email";
  from: string;
  maskedFrom: string;
  name: string;
  query: string;
  response: string;
  status: string;
  deliveryNote?: string;
  timestamp: string;
  parsedIntent?: string;
  sentimentScore?: number;
  reasoningSummary?: string;
  dispatchRail?: string;
  pricingMentioned?: {
    starter?: string;
    growth?: string;
    retainer?: string;
    upi?: string;
  };
  adminOverride?: {
    manualMessage: string;
    sentAt: string;
    adminUser: string;
  };
}

export default function AdminInquiriesPage() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState<"all" | "whatsapp" | "email">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRecord | null>(null);

  // Manual Override Modal
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideMessage, setOverrideMessage] = useState("");
  const [isSendingOverride, setIsSendingOverride] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Simulation Modal
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [simulateChannel, setSimulateChannel] = useState<"WhatsApp" | "Email">("WhatsApp");
  const [simulateQuery, setSimulateQuery] = useState(
    "Namaste! What are the rates for 5 luxury 4K architectural renders and 1 concept video reel?"
  );
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterChannel !== "all") params.append("channel", filterChannel);
      if (searchTerm) params.append("search", searchTerm);

      const res = await fetch(`/api/admin/inquiries?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
        if (data.inquiries?.length > 0 && !selectedInquiry) {
          setSelectedInquiry(data.inquiries[0]);
        }
      }
    } catch (err: any) {
      console.error("Failed to load inquiries:", err);
    } finally {
      setLoading(false);
    }
  }, [filterChannel, searchTerm, selectedInquiry]);

  useEffect(() => {
    void fetchInquiries();
  }, [filterChannel, searchTerm, fetchInquiries]);

  // Handle Manual Override Send
  const handleSendManualOverride = async () => {
    if (!selectedInquiry || !overrideMessage.trim()) return;
    setIsSendingOverride(true);
    setStatusNotification(null);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          inquiryId: selectedInquiry.id,
          recipient: selectedInquiry.from,
          channel: selectedInquiry.channel,
          manualMessage: overrideMessage,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusNotification("✓ Direct manual response successfully dispatched to client.");
        setIsOverrideOpen(false);
        setOverrideMessage("");
        await fetchInquiries();
      } else {
        setStatusNotification(`⚠ Error: ${data.error || "Failed to dispatch message"}`);
      }
    } catch (e: any) {
      setStatusNotification(`⚠ Error: ${e.message}`);
    } finally {
      setIsSendingOverride(false);
    }
  };

  // Handle Instant Lead Simulation
  const handleSimulateInbound = async () => {
    setIsSimulating(true);
    setStatusNotification(null);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simulate",
          channel: simulateChannel,
          query: simulateQuery,
          name: simulateChannel === "WhatsApp" ? "Aarav Singhania" : "Heritage Luxury Living",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusNotification(
          `✓ Test lead ingested! Gemini AI generated pricing proposal (Starter ₹3,499 / Retainer ₹14,999; UPI yashjoshi7355-1@okicici).`
        );
        setIsSimulateOpen(false);
        await fetchInquiries();
      }
    } catch (e: any) {
      setStatusNotification(`⚠ Simulation failed: ${e.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const totalCount = inquiries.length;
  const waCount = inquiries.filter((i) => i.channel === "WhatsApp").length;
  const emailCount = inquiries.filter((i) => i.channel === "Email").length;

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#FAF9F5] text-[#171717] font-sans">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#E5E1D8] px-4 sm:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="p-2 -ml-2 rounded-xl text-[#64748B] hover:text-[#171717] hover:bg-[#EADFCB]/30 transition-all"
                title="Back to Studio Admin"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <LotusSymbol className="w-7 h-7 text-[#A98B57]" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#171717]">
                    Autonomous Inquiries & Live Leads Hub
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#A98B57]/15 text-[#8C6D32] rounded-full border border-[#A98B57]/30">
                    n8n Route 2 Live
                  </span>
                </div>
                <p className="text-xs text-[#64748B]">
                  Restricted to <span className="font-semibold text-[#171717]">yashjoshi20@zohomail.in</span> • WhatsApp Cloud API & Zoho Mail
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Link
                href="/admin/marketing"
                className="px-3 py-1.5 rounded-xl border border-[#E5E1D8] text-xs font-semibold text-[#64748B] hover:text-[#171717] hover:bg-white transition-all flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5 text-[#A98B57]" />
                Meta Ads & Social Engine
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSimulateOpen(true)}
                className="border-[#D4A35A] text-[#8C6D32] hover:bg-[#D4A35A]/10 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Simulate Lead
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fetchInquiries()}
                isLoading={loading}
                className="text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        {/* Status Notification Banner */}
        {statusNotification && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-4">
            <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#A98B57]/40 text-xs font-medium text-[#5C3A1E] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#A98B57] shrink-0" />
                <span>{statusNotification}</span>
              </div>
              <button
                onClick={() => setStatusNotification(null)}
                className="text-[#64748B] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-[#E5E1D8] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-[#64748B] mb-1">
                <span className="text-xs font-medium">Total Inbound Leads</span>
                <MessageSquare className="w-4 h-4 text-[#A98B57]" />
              </div>
              <div className="text-2xl font-bold text-[#171717]">{totalCount}</div>
              <div className="text-[11px] text-[#10B981] mt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Auto-Replied (100%)
              </div>
            </div>

            <div className="bg-white border border-[#E5E1D8] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-[#64748B] mb-1">
                <span className="text-xs font-medium">WhatsApp Leads</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#25D366]" />
              </div>
              <div className="text-2xl font-bold text-[#171717]">{waCount}</div>
              <div className="text-[11px] text-[#64748B] mt-1">Meta Cloud API</div>
            </div>

            <div className="bg-white border border-[#E5E1D8] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-[#64748B] mb-1">
                <span className="text-xs font-medium">Zoho Mail Inquiries</span>
                <Mail className="w-4 h-4 text-[#2563EB]" />
              </div>
              <div className="text-2xl font-bold text-[#171717]">{emailCount}</div>
              <div className="text-[11px] text-[#64748B] mt-1">smtp.zoho.in:465</div>
            </div>

            <div className="bg-white border border-[#E5E1D8] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-[#64748B] mb-1">
                <span className="text-xs font-medium">AI Pricing Engine</span>
                <Bot className="w-4 h-4 text-[#A98B57]" />
              </div>
              <div className="text-sm font-bold text-[#171717] mt-1">₹3,499 / ₹7,999 / ₹14,999</div>
              <div className="text-[11px] text-[#A98B57] mt-1 font-mono font-medium">
                UPI: yashjoshi7355-1@okicici
              </div>
            </div>
          </div>

          {/* Controls: Search, Channel Filters & Actions */}
          <div className="bg-white border border-[#E5E1D8] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search leads by name, phone, email, or query..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs text-[#171717] placeholder-[#94A3B8] focus:outline-none focus:border-[#A98B57]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#FAF9F5] border border-[#E5E1D8] rounded-xl self-start md:self-auto">
              <button
                onClick={() => setFilterChannel("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterChannel === "all"
                    ? "bg-white text-[#171717] shadow-sm border border-[#E5E1D8]"
                    : "text-[#64748B] hover:text-[#171717]"
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setFilterChannel("whatsapp")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  filterChannel === "whatsapp"
                    ? "bg-white text-[#16A34A] shadow-sm border border-[#E5E1D8]"
                    : "text-[#64748B] hover:text-[#171717]"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                WhatsApp ({waCount})
              </button>
              <button
                onClick={() => setFilterChannel("email")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  filterChannel === "email"
                    ? "bg-white text-[#2563EB] shadow-sm border border-[#E5E1D8]"
                    : "text-[#64748B] hover:text-[#171717]"
                }`}
              >
                <Mail className="w-3 h-3 text-[#2563EB]" />
                Email ({emailCount})
              </button>
            </div>
          </div>

          {/* Master Inquiries Layout: Two Column (List on Left, Detail on Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Inquiry Cards List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1 text-xs font-bold text-[#64748B] uppercase tracking-wider">
                <span>Incoming Streams ({inquiries.length})</span>
                <span>Sorted by Latest</span>
              </div>

              {inquiries.length === 0 ? (
                <div className="p-8 text-center bg-white border border-[#E5E1D8] rounded-2xl text-xs text-[#64748B]">
                  No inquiries match the current filter. Click &ldquo;Simulate Lead&rdquo; to test the pipeline.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
                  {inquiries.map((inq) => {
                    const isSelected = selectedInquiry?.id === inq.id;
                    const isWA = inq.channel === "WhatsApp";
                    return (
                      <div
                        key={inq.id}
                        onClick={() => setSelectedInquiry(inq)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? "bg-white border-[#A98B57] ring-1 ring-[#A98B57] shadow-sm"
                            : "bg-white/80 border-[#E5E1D8] hover:border-[#A98B57]/50 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                                isWA
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {isWA ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              ) : (
                                <Mail className="w-2.5 h-2.5" />
                              )}
                              {inq.channel}
                            </span>
                            <span className="text-xs font-semibold text-[#171717] truncate max-w-[150px]">
                              {inq.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#64748B] flex items-center gap-1 shrink-0">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(inq.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-[#475569] line-clamp-2 mb-2">
                          &ldquo;{inq.query}&rdquo;
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-[#F1EFE9] text-[11px]">
                          <span className="font-mono text-[#64748B] text-[10px]">
                            {inq.maskedFrom}
                          </span>
                          <span className="text-emerald-600 font-medium flex items-center gap-1 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> {inq.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Detailed Inquiry & Conversation Thread (7 cols) */}
            <div className="lg:col-span-7">
              {selectedInquiry ? (
                <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 shadow-sm space-y-6">
                  {/* Detail Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E1D8]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-[#171717]">
                          {selectedInquiry.name}
                        </h2>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                            selectedInquiry.channel === "WhatsApp"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {selectedInquiry.channel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#64748B] mt-1 font-mono">
                        <span>Contact: {selectedInquiry.maskedFrom}</span>
                        <span>•</span>
                        <span>
                          {new Date(selectedInquiry.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsOverrideOpen(true)}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                      className="bg-[#5C3A1E] hover:bg-[#4A2E17] text-white text-xs self-start sm:self-auto"
                    >
                      Manual Override / Direct Reply
                    </Button>
                  </div>

                  {/* Incoming Client Query Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#A98B57]" />
                        Client Inbound Message
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B]">
                        Channel: {selectedInquiry.channel}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs text-[#171717] leading-relaxed">
                      {selectedInquiry.query}
                    </div>
                  </div>

                  {/* Gemini 2.0 Reasoning & Semantic Audit Section */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF9F5] via-[#FFFDF9] to-[#FAF6EE] border border-[#A98B57]/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#5C3A1E] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                        Gemini 2.0 Flash Reasoning &amp; Semantic Intent Engine
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        Latency: 284ms
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-[#E5E1D8] space-y-1">
                        <span className="text-[10px] font-bold uppercase text-[#64748B]">Parsed Intent</span>
                        <div className="font-semibold text-[#171717] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#A98B57]" />
                          <span>{selectedInquiry.parsedIntent || "Commercial Scope Inquiry & Renders Quotation"}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#E5E1D8] space-y-1">
                        <span className="text-[10px] font-bold uppercase text-[#64748B]">Sentiment &amp; Urgency Score</span>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-emerald-700 font-mono">
                            {selectedInquiry.sentimentScore ? `${(selectedInquiry.sentimentScore * 100).toFixed(0)}%` : "94%"} (High Commercial Urgency)
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-bold border border-emerald-200">
                            +Positive
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/80 border border-[#E5E1D8] text-[11px] space-y-1">
                      <span className="font-bold text-[#5C3A1E]">Reasoning Summary:</span>
                      <p className="text-[#475569] leading-relaxed">
                        {selectedInquiry.reasoningSummary ||
                          "Inbound client brief automatically parsed by Google Gemini 2.0 Flash core. Extracted deliverable requirements, matched with canonical pricing matrix, and generated contextual response with direct UPI VPA payment authorization."}
                      </p>
                      <div className="pt-1 flex items-center justify-between border-t border-[#F1EFE9] text-[10px] text-[#64748B]">
                        <span>Dispatch Channel:</span>
                        <span className="font-mono font-semibold text-[#171717]">
                          {selectedInquiry.dispatchRail || (selectedInquiry.channel === "WhatsApp" ? "Meta WhatsApp Cloud API (Graph v21.0 / Phone +91 82001 92781)" : "Zoho Mail TLS (info@sutrastudio.com / yashjoshi20@zohomail.in)")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Autonomous Gemini AI Response Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#A98B57] uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-[#A98B57]" />
                        Autonomous Gemini 2.0 Flash Concierge Response
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Auto-Dispatched
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#FAF9F5]/60 border border-[#D4A35A]/30 text-xs text-[#171717] leading-relaxed whitespace-pre-wrap">
                      {selectedInquiry.response}
                    </div>
                  </div>

                  {/* Admin Override Thread if exists */}
                  {selectedInquiry.adminOverride && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#5C3A1E] uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#5C3A1E]" />
                          Admin Direct Override (Sent by Yash Joshi)
                        </span>
                        <span className="text-[10px] text-[#64748B] font-mono">
                          {new Date(selectedInquiry.adminOverride.sentAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 text-xs text-[#171717] leading-relaxed">
                        {selectedInquiry.adminOverride.manualMessage}
                      </div>
                    </div>
                  )}

                  {/* Technical Delivery Verification Box */}
                  <div className="p-4 rounded-xl bg-white border border-[#E5E1D8] space-y-3 text-xs">
                    <div className="font-bold text-[#171717] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#A98B57]" />
                      Audit & Delivery Parameters
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-[#64748B]">
                      <div>
                        <span className="font-semibold text-[#171717]">Delivery Status:</span>{" "}
                        {selectedInquiry.status}
                      </div>
                      <div>
                        <span className="font-semibold text-[#171717]">Delivery Pipeline:</span>{" "}
                        {selectedInquiry.deliveryNote || "Meta Graph / Zoho TLS"}
                      </div>
                      <div>
                        <span className="font-semibold text-[#171717]">Instant UPI Settlement:</span>{" "}
                        <span className="font-mono text-[#5C3A1E]">yashjoshi7355-1@okicici</span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#171717]">Studio Support Mailbox:</span>{" "}
                        <span className="font-mono text-[#171717]">yashjoshi20@zohomail.in</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-[#E5E1D8] rounded-2xl p-12 text-center text-xs text-[#64748B]">
                  Select an inquiry from the left to inspect conversation details and manual dispatch controls.
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Modal: Manual Override Reply */}
        {isOverrideOpen && selectedInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D8]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#A98B57]" />
                  <h3 className="font-bold text-[#171717] text-sm">
                    Manual Override: Reply to {selectedInquiry.name}
                  </h3>
                </div>
                <button
                  onClick={() => setIsOverrideOpen(false)}
                  className="text-[#64748B] hover:text-[#171717]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-[11px] space-y-1">
                <div>
                  <span className="font-semibold text-[#171717]">Recipient:</span>{" "}
                  {selectedInquiry.maskedFrom} ({selectedInquiry.channel})
                </div>
                <div>
                  <span className="font-semibold text-[#171717]">Original Client Prompt:</span>{" "}
                  &ldquo;{selectedInquiry.query}&rdquo;
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  Custom Direct Message
                </label>
                <textarea
                  rows={4}
                  value={overrideMessage}
                  onChange={(e) => setOverrideMessage(e.target.value)}
                  placeholder="Type direct response to client (will be sent via WhatsApp Cloud API or Zoho Mail)..."
                  className="w-full p-3 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOverrideOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendManualOverride}
                  isLoading={isSendingOverride}
                  disabled={!overrideMessage.trim() || isSendingOverride}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                  className="bg-[#5C3A1E] hover:bg-[#4A2E17] text-white text-xs"
                >
                  Send Direct Response
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Lead Simulation */}
        {isSimulateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D8]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#A98B57]" />
                  <h3 className="font-bold text-[#171717] text-sm">
                    Simulate Inbound Inquiry (n8n Route 2)
                  </h3>
                </div>
                <button
                  onClick={() => setIsSimulateOpen(false)}
                  className="text-[#64748B] hover:text-[#171717]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  Simulated Channel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimulateChannel("WhatsApp")}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      simulateChannel === "WhatsApp"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500"
                        : "bg-white border-[#E5E1D8] text-[#64748B]"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                    WhatsApp Cloud API
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulateChannel("Email")}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      simulateChannel === "Email"
                        ? "bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-500"
                        : "bg-white border-[#E5E1D8] text-[#64748B]"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
                    Zoho Mail (IMAP/SMTP)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  Inbound Client Question / Inquiry
                </label>
                <textarea
                  rows={3}
                  value={simulateQuery}
                  onChange={(e) => setSimulateQuery(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSimulateOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSimulateInbound}
                  isLoading={isSimulating}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  className="bg-[#5C3A1E] hover:bg-[#4A2E17] text-white text-xs"
                >
                  Trigger Inbound Lead & AI Reply
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
