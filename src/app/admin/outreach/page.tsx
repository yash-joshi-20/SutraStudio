"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  Send,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Smartphone,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  User,
  Layers,
  FileCheck,
  Info,
  CheckCircle2,
} from "lucide-react";

interface LeadOption {
  id: string;
  orderNumber?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  source?: string;
  service?: string;
  packageName?: string;
  isDraft?: boolean;
  status: string;
  channelMetadata?: {
    platformSenderId?: string;
    replyWindowExpiresAt?: string;
    isReplyWindowActive?: boolean;
  };
  confirmToken?: string;
}

interface DraftResult {
  id: string;
  title: string;
  text: string;
  tone: string;
}

export default function OutreachDeskPage() {
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);

  // Selected or custom lead
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "instagram" | "facebook" | "email">("whatsapp");
  const [intent, setIntent] = useState<"inquiry_followup" | "confirm_link" | "proposal" | "asset_delivery" | "custom">("inquiry_followup");
  const [serviceOrPlan, setServiceOrPlan] = useState("Visual Imagery Suite");
  const [clientNote, setClientNote] = useState("");

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState<DraftResult[]>([]);
  const [actionUrls, setActionUrls] = useState<{
    waLink?: string;
    mailtoLink?: string;
    igInboxLink?: string;
    fbInboxLink?: string;
  }>({});
  const [complianceNotice, setComplianceNotice] = useState<{
    replyWindowActive: boolean;
    replyWindowHoursRemaining: number;
    warning: string | null;
  } | null>(null);

  // Feedback states
  const [copiedDraftId, setCopiedDraftId] = useState<string | null>(null);
  const [isLoggingSent, setIsLoggingSent] = useState<string | null>(null);
  const [logSuccessMessage, setLogSuccessMessage] = useState<string | null>(null);

  // Fetch leads and draft orders
  const loadLeads = useCallback(async () => {
    setIsLoadingLeads(true);
    try {
      const res = await fetch("/api/orders?limit=100");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          setLeads(data.orders);
        }
      }
    } catch (e) {
      console.warn("Failed to load leads for Outreach Desk:", e);
    } finally {
      setIsLoadingLeads(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // When an order is selected, populate form fields
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    if (!orderId) {
      setLeadName("");
      setLeadPhone("");
      setLeadEmail("");
      return;
    }

    const found = leads.find((l) => l.id === orderId);
    if (found) {
      setLeadName(found.clientName || "");
      setLeadPhone(found.clientPhone || found.channelMetadata?.platformSenderId || "");
      setLeadEmail(found.clientEmail || "");
      setServiceOrPlan(found.packageName || found.service || "Visual Imagery Suite");

      if (found.source === "whatsapp") setChannel("whatsapp");
      else if (found.source === "instagram") setChannel("instagram");
      else if (found.source === "facebook") setChannel("facebook");
      else if (found.source === "email") setChannel("email");

      if (found.isDraft || found.status === "draft") {
        setIntent("confirm_link");
      }
    }
  };

  // Generate drafts
  const handleGenerateDrafts = async () => {
    setIsGenerating(true);
    setLogSuccessMessage(null);
    try {
      const res = await fetch("/api/admin/outreach/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadName,
          leadPhone,
          leadEmail,
          handle,
          channel,
          intent,
          serviceOrPlan,
          clientNote,
          orderId: selectedOrderId || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDrafts(data.drafts || []);
        setActionUrls(data.actions || {});
        if (data.metaCompliance) {
          setComplianceNotice({
            replyWindowActive: data.metaCompliance.replyWindowActive,
            replyWindowHoursRemaining: data.metaCompliance.replyWindowHoursRemaining,
            warning: data.metaCompliance.warning,
          });
        }
      }
    } catch (e) {
      console.error("Failed to generate drafts:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy text to clipboard
  const handleCopyText = (draftId: string, text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedDraftId(draftId);
      setTimeout(() => setCopiedDraftId(null), 2500);
    }
  };

  // Record manual message to order conversation history
  const handleMarkAsSent = async (draftId: string, text: string) => {
    if (!selectedOrderId) {
      alert("Please select an associated Order / Inquiry from the dropdown above to log this message to its history.");
      return;
    }

    setIsLoggingSent(draftId);
    try {
      const res = await fetch("/api/admin/outreach/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderId,
          channel,
          text,
          recipientHandle: leadPhone || leadEmail || handle,
        }),
      });

      if (res.ok) {
        setLogSuccessMessage("Message successfully appended to this order's unified conversation history!");
        loadLeads();
      } else {
        const err = await res.json();
        alert(`Failed to log: ${err.error || "Unknown error"}`);
      }
    } catch (e: any) {
      alert(`Error logging message: ${e.message}`);
    } finally {
      setIsLoggingSent(null);
    }
  };

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#F8F5EF] text-[#0F172A]">
        {/* Studio Admin Header */}
        <header className="sticky top-0 z-30 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#EADFCB] px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 text-[#5C3A1E] hover:opacity-80 transition-opacity">
              <LotusSymbol className="w-6 h-6" color="gold" />
              <span className="font-serif font-bold text-sm tracking-wider">SUTRA STUDIO</span>
            </Link>
            <span className="text-xs text-[#94A3B8]">/</span>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <Link href="/admin" className="hover:text-[#5C3A1E] font-medium transition-colors">
                Admin Console
              </Link>
              <span className="text-[#94A3B8]">/</span>
              <span className="text-[#0F172A] font-semibold">Outreach &amp; Concierge Desk</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] hover:border-[#D4A35A] hover:bg-[#FFFFFF] text-xs font-semibold text-[#5C3A1E] transition-all shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Orders Pipeline</span>
            </Link>
            <Link
              href="/admin/marketing"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] hover:border-[#D4A35A] hover:bg-[#FFFFFF] text-xs font-semibold text-[#8C6D32] transition-all shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A98B57]" />
              <span>Marketing Hub</span>
            </Link>
            <NotificationBell align="right" />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Main Title & Compliance Shield */}
          <div className="rounded-3xl bg-gradient-to-r from-[#FFFDF9] via-[#FAF6EE] to-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-warm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D4F]" />
                <span>Meta &amp; WhatsApp Policy Compliant</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A]">
                Outreach &amp; Concierge Desk
              </h1>
              <p className="text-sm text-[#64748B] max-w-2xl leading-relaxed">
                Prepare tailored, luxury-crafted message drafts for inbound inquiries and leads across WhatsApp, Instagram, Facebook, and Email. Zero automated bots or mass spam — every communication is reviewed and dispatched manually by you.
              </p>
            </div>

            {/* Platform Rules Notice Badge */}
            <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-4 text-xs space-y-2 shrink-0 min-w-[280px] shadow-2xs">
              <div className="flex items-center gap-1.5 font-semibold text-[#5C3A1E]">
                <Clock className="w-3.5 h-3.5 text-[#D4A35A]" />
                <span>24-Hour Reply-Window Policy:</span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-tight">
                WhatsApp Cloud and Meta Graph strictly require replies within 24h of client contact. Free-form outside 24h requires approved template or client initiation.
              </p>
              <div className="pt-1 border-t border-[#EADFCB] flex items-center justify-between text-[11px]">
                <span className="text-[#2E7D4F] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Manual Send Guard Active
                </span>
              </div>
            </div>
          </div>

          {/* Two-Column Working Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Lead Configuration & Intent (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl bg-white border border-[#EADFCB] p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#EADFCB]">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#5C3A1E]" />
                  <h3 className="font-serif font-bold text-base text-[#0F172A]">Lead &amp; Inquiry Setup</h3>
                </div>
                <button
                  type="button"
                  onClick={loadLeads}
                  disabled={isLoadingLeads}
                  className="text-xs text-[#5C3A1E] hover:text-[#8B6508] flex items-center gap-1 font-medium cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingLeads ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Order / Inquiry Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Select Existing Lead or Draft Order (Optional):
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => handleSelectOrder(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#EADFCB] bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/50 font-sans"
                >
                  <option value="">-- Manual Custom Lead --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.orderNumber || l.id} • {l.clientName} ({l.source || "web"}) - {l.status} {l.isDraft ? "[Draft]" : ""}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-[#64748B] mt-1 block">
                  Selecting an order will auto-fill contact info and embed the private payment/verification link.
                </span>
              </div>

              {/* 24-Hour Window Badge if order selected */}
              {selectedOrderId && (
                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B]">24h Customer Care Window:</span>
                    {complianceNotice?.replyWindowActive ?? true ? (
                      <span className="font-semibold text-[#2E7D4F] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Active ({complianceNotice?.replyWindowHoursRemaining ?? 24}h remaining)
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Window Expired (Template Mode)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Client / Lead Name</label>
                  <input
                    type="text"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="e.g. Yashvardhan Joshi"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#EADFCB] bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">WhatsApp / Phone</label>
                  <input
                    type="text"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#EADFCB] bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Client Email</label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="client@luxurybrand.com"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#EADFCB] bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Social Handle / PSID</label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@brand_instagram"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#EADFCB] bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/50"
                  />
                </div>
              </div>

              {/* Outreach Channel */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Target Channel</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "whatsapp", label: "WhatsApp", icon: Smartphone },
                    { id: "instagram", label: "Instagram DM", icon: MessageSquare },
                    { id: "facebook", label: "Facebook DM", icon: MessageSquare },
                    { id: "email", label: "Email", icon: Mail },
                  ].map((c) => {
                    const Icon = c.icon;
                    const isSel = channel === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setChannel(c.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          isSel
                            ? "bg-[#FAF6EE] border-[#D4A35A] text-[#5C3A1E] shadow-2xs font-bold"
                            : "bg-[#FAF9F5] border-[#EADFCB] text-[#64748B] hover:border-[#D4A35A]/50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Outreach Intent */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Outreach Purpose</label>
                <select
                  value={intent}
                  onChange={(e) => setIntent(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#EADFCB] bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/50"
                >
                  <option value="inquiry_followup">Inquiry Follow-up &amp; Aesthetic Consultation</option>
                  <option value="confirm_link">Send Draft Confirmation &amp; Payment Portal Link</option>
                  <option value="proposal">Present Design Proposal &amp; Custom Quote</option>
                  <option value="asset_delivery">Vault Deliverables Ready &amp; Drive Link</option>
                  <option value="custom">General Brand Advisory Outreach</option>
                </select>
              </div>

              {/* Service or Plan */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Target Service / Package</label>
                <input
                  type="text"
                  value={serviceOrPlan}
                  onChange={(e) => setServiceOrPlan(e.target.value)}
                  placeholder="e.g. Visual Imagery Suite (₹2,499) or Starter Growth Retainer"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#EADFCB] bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/50"
                />
              </div>

              {/* Custom Specifics */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Additional Context / Custom Note</label>
                <textarea
                  rows={2}
                  value={clientNote}
                  onChange={(e) => setClientNote(e.target.value)}
                  placeholder="e.g. Wants golden sandstone facade renders for heritage boutique hotel..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#EADFCB] bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/50 resize-none"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleGenerateDrafts}
                disabled={isGenerating}
                isLoading={isGenerating}
                className="w-full justify-center text-xs"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Synthesize 3 Tailored Luxury Drafts
              </Button>
            </div>

            {/* Right Column: Drafts & 1-Click Dispatch Actions (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {logSuccessMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{logSuccessMessage}</span>
                </div>
              )}

              {complianceNotice?.warning && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Meta Platform Warning:</span>
                    <span>{complianceNotice.warning}</span>
                  </div>
                </div>
              )}

              {drafts.length === 0 ? (
                /* Empty state / Prompt to generate */
                <div className="rounded-2xl bg-white border border-[#EADFCB] p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#FAF6EE] border border-[#D4A35A]/40 flex items-center justify-center mx-auto text-[#5C3A1E]">
                    <MessageSquare className="w-6 h-6 text-[#A98B57]" />
                  </div>
                  <h4 className="font-serif font-bold text-lg text-[#0F172A]">No Drafts Generated Yet</h4>
                  <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                    Select an inquiry or configure a custom lead on the left, then click &ldquo;Synthesize 3 Tailored Luxury Drafts&rdquo; to prepare studio responses.
                  </p>
                </div>
              ) : (
                /* Render 3 Generated Drafts */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-base text-[#0F172A]">
                      Prepared Concierge Drafts ({drafts.length})
                    </span>
                    <span className="text-xs text-[#64748B]">Channel: <strong className="text-[#5C3A1E] uppercase">{channel}</strong></span>
                  </div>

                  {drafts.map((draft) => {
                    const isCopied = copiedDraftId === draft.id;
                    const isLogging = isLoggingSent === draft.id;

                    return (
                      <div
                        key={draft.id}
                        className="rounded-2xl bg-white border border-[#EADFCB] p-5 shadow-2xs space-y-3 hover:border-[#D4A35A]/60 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-sm text-[#0F172A]">{draft.title}</span>
                            <Badge variant="neutral" size="sm">
                              {draft.tone}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-[#94A3B8] font-mono">{draft.text.length} chars</span>
                        </div>

                        {/* Draft Content Box */}
                        <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] font-sans text-xs text-[#1E293B] whitespace-pre-wrap leading-relaxed select-all">
                          {draft.text}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EADFCB]/60">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopyText(draft.id, draft.text)}
                              className="px-3 py-1.5 rounded-xl bg-white border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] flex items-center gap-1.5 hover:bg-[#FAF6EE] transition-colors cursor-pointer"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isCopied ? "Copied!" : "Copy Text"}</span>
                            </button>

                            {/* Direct Launch Shortcuts */}
                            {channel === "whatsapp" && (
                              <a
                                href={actionUrls.waLink || `https://wa.me/?text=${encodeURIComponent(draft.text)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-xs font-semibold text-[#128C7E] flex items-center gap-1.5 hover:bg-[#25D366]/20 transition-colors"
                              >
                                <Smartphone className="w-3.5 h-3.5" />
                                <span>Open WhatsApp Web</span>
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                              </a>
                            )}

                            {channel === "email" && leadEmail && (
                              <a
                                href={actionUrls.mailtoLink || `mailto:${leadEmail}?body=${encodeURIComponent(draft.text)}`}
                                className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Launch Mail Client</span>
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                              </a>
                            )}

                            {channel === "instagram" && (
                              <a
                                href={actionUrls.igInboxLink || "https://www.instagram.com/direct/inbox/"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-pink-50 border border-pink-200 text-xs font-semibold text-pink-700 flex items-center gap-1.5 hover:bg-pink-100 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Open Instagram Inbox</span>
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                              </a>
                            )}

                            {channel === "facebook" && (
                              <a
                                href={actionUrls.fbInboxLink || "https://business.facebook.com/latest/inbox/"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 flex items-center gap-1.5 hover:bg-indigo-100 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Open Meta Business Inbox</span>
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                              </a>
                            )}
                          </div>

                          {/* Record as Sent & Log */}
                          {selectedOrderId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsSent(draft.id, draft.text)}
                              disabled={isLogging}
                              isLoading={isLogging}
                              className="text-xs text-[#5C3A1E]"
                              leftIcon={<FileCheck className="w-3.5 h-3.5" />}
                            >
                              Mark Sent &amp; Log to Order
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Safety and Anti-Ban Guidelines */}
              <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#5C3A1E] font-semibold">
                  <Info className="w-4 h-4 text-[#D4A35A]" />
                  <span>Meta Platform Best Practices &amp; Account Protection</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[#64748B] text-[11px] leading-relaxed">
                  <li><strong>Manual Dispatch Only:</strong> No headless browser bots or batch WhatsApp auto-dispatching are permitted.</li>
                  <li><strong>Explicit Consent:</strong> Inbound conversations should originate from customer requests, website drafts, or comment interactions.</li>
                  <li><strong>24-Hour Active Window:</strong> Outside this window, send official utility/marketing templates pre-approved in Meta WhatsApp Business Manager.</li>
                  <li><strong>Single Conversation History:</strong> Use &ldquo;Mark Sent &amp; Log to Order&rdquo; after manual sending to ensure the entire studio team has complete timeline context.</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}
