"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/authContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  Building2,
  Layers,
  ShoppingBag,
  DollarSign,
  HelpCircle,
  Phone,
  FileText,
  Bot,
  Sparkles,
  ShieldCheck,
  Clock,
  AlertCircle,
  Edit,
  ArrowRight,
  Eye,
  CheckCircle2,
  X,
  Send,
  RefreshCw,
} from "lucide-react";
import { ClientSubmission } from "@/lib/types/knowledge";

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [submission, setSubmission] = useState<ClientSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  // Chatbot Preview Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewMessages, setPreviewMessages] = useState<
    Array<{ sender: "user" | "bot"; text: string; time: string; sources?: any[] }>
  >([
    {
      sender: "bot",
      text: "Namaste! This is your Client Chatbot Preview. It tests only your Admin-Approved Knowledge Base. Ask me anything about your services or company!",
      time: "Just now",
    },
  ]);
  const [previewInput, setPreviewInput] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchSubmission = useCallback(async () => {
    try {
      const res = await fetch(`/api/submissions?client_id=${user?.uid || "client_shriram"}`);
      if (res.ok) {
        const data = await res.json();
        if (data.submissions && data.submissions.length > 0) {
          setSubmission(data.submissions[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch submission:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  const handleSendPreview = async () => {
    if (!previewInput.trim() || previewLoading) return;
    const q = previewInput.trim();
    setPreviewInput("");
    setPreviewMessages((prev) => [
      ...prev,
      { sender: "user", text: q, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setPreviewLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, client_id: user?.uid || "client_shriram", preview_mode: true }),
      });
      const data = await res.json();
      setPreviewMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.answer || "I don't have verified information about that yet.",
          sources: data.sources,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setPreviewMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I don't have verified information about that yet.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setPreviewLoading(false);
    }
  };

  const status = submission?.status || "DRAFT";

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "APPROVED":
      case "PUBLISHED":
        return <span className="px-3 py-1 rounded-full bg-[#EDF7F0] text-[#2E7D4F] text-xs font-bold">Approved & Published</span>;
      case "PENDING_REVIEW":
      case "CLIENT_UPDATED":
        return <span className="px-3 py-1 rounded-full bg-[#FEF6EE] text-[#C2761A] text-xs font-bold">Under Admin Review</span>;
      case "CHANGES_REQUESTED":
        return <span className="px-3 py-1 rounded-full bg-[#FEF3F2] text-[#B42318] text-xs font-bold">Changes Requested</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-[#F1F5F9] text-[#475569] text-xs font-bold">Draft</span>;
    }
  };

  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <Navbar />

        <main id="main-content" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#FFFDF9] border border-[#EADFCB] rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-xs font-semibold uppercase tracking-wider text-[#5C3A1E]">
                <Bot className="w-3.5 h-3.5 text-[#D4A35A]" />
                <span>CLIENT KNOWLEDGE & AI COCKPIT</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A]">
                {submission?.company?.name || "Client Knowledge Workspace"}
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Manage verified company facts, services, pricing plans, and preview your RAG AI Assistant.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {getStatusBadge(status)}
              <Button
                onClick={() => setShowPreviewModal(true)}
                variant="secondary"
                size="sm"
                leftIcon={<Eye className="w-4 h-4 text-[#D4A35A]" />}
              >
                Chatbot Preview
              </Button>
              <Link href="/client-form">
                <Button variant="primary" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
                  Edit Information
                </Button>
              </Link>
            </div>
          </div>

          {/* Admin Changes Requested Alert */}
          {status === "CHANGES_REQUESTED" && submission?.changes_requested_message && (
            <div className="p-6 rounded-3xl bg-[#FEF3F2] border border-[#FDA29B] flex items-start justify-between gap-4 text-[#B42318]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertCircle className="w-5 h-5" />
                  <span>Admin Feedback & Action Required</span>
                </div>
                <p className="text-xs leading-relaxed">{submission.changes_requested_message}</p>
              </div>
              <Link href="/client-form">
                <Button variant="primary" size="sm" className="shrink-0 bg-[#B42318] hover:bg-[#912018] text-white">
                  Update Form Now
                </Button>
              </Link>
            </div>
          )}

          {/* 8 Knowledge Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Company Profile Card */}
            <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] space-y-3 shadow-2xs hover:border-[#D4A35A] transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-center text-[#5C3A1E]">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-[#A98B57]">Step 01</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#0F172A]">Company Profile</h3>
              <p className="text-xs text-[#64748B] line-clamp-2">
                {submission?.company?.description || "Company identity and background."}
              </p>
              <div className="pt-2 text-[11px] text-[#5C3A1E] font-semibold flex items-center gap-1">
                <span>{submission?.company?.industry || "Technology"}</span>
                <span>•</span>
                <span>{submission?.company?.foundedYear || "2022"}</span>
              </div>
            </div>

            {/* 2. Services Card */}
            <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] space-y-3 shadow-2xs hover:border-[#D4A35A] transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-center text-[#5C3A1E]">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-[#A98B57]">Step 02</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#0F172A]">Services</h3>
              <p className="text-xs text-[#64748B]">
                {submission?.services?.length || 0} active dynamic services configured.
              </p>
              <div className="pt-2 text-[11px] text-[#5C3A1E] font-semibold flex flex-wrap gap-1">
                {submission?.services?.slice(0, 2).map((s) => (
                  <span key={s.id} className="px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-[#EADFCB]">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Products Card */}
            <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] space-y-3 shadow-2xs hover:border-[#D4A35A] transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-center text-[#5C3A1E]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-[#A98B57]">Step 03</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#0F172A]">Products</h3>
              <p className="text-xs text-[#64748B]">
                {submission?.products?.length || 0} product catalog items registered.
              </p>
              <div className="pt-2 text-[11px] text-[#5C3A1E] font-semibold">
                <span>{submission?.products?.[0]?.name || "Catalog Ready"}</span>
              </div>
            </div>

            {/* 4. Pricing / Plans Card */}
            <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] space-y-3 shadow-2xs hover:border-[#D4A35A] transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-center text-[#5C3A1E]">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-[#A98B57]">Step 04</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#0F172A]">Pricing & Plans</h3>
              <p className="text-xs text-[#64748B]">
                {submission?.pricing_plans?.length || 0} commercial pricing tiers active.
              </p>
              <div className="pt-2 text-[11px] text-[#5C3A1E] font-semibold">
                <span>{submission?.pricing_plans?.[0]?.price || "₹5,999"}</span> / mo
              </div>
            </div>

            {/* 5. FAQs Card */}
            <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] space-y-3 shadow-2xs hover:border-[#D4A35A] transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-center text-[#5C3A1E]">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-[#A98B57]">Step 05</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#0F172A]">FAQs</h3>
              <p className="text-xs text-[#64748B]">
                {submission?.faqs?.length || 0} Q&A pairs grounded in RAG database.
              </p>
            </div>

            {/* 6. Contact Information Card */}
            <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] space-y-3 shadow-2xs hover:border-[#D4A35A] transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-center text-[#5C3A1E]">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-[#A98B57]">Step 06</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#0F172A]">Contact Channels</h3>
              <p className="text-xs text-[#64748B] truncate">
                {submission?.contact?.email || "contact@shriramtech.com"}
              </p>
              <div className="pt-2 text-[11px] text-[#5C3A1E] font-semibold">
                <span>{submission?.contact?.city || "Noida"}, India</span>
              </div>
            </div>

            {/* 7. Policies Card */}
            <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] space-y-3 shadow-2xs hover:border-[#D4A35A] transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-center text-[#5C3A1E]">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-[#A98B57]">Step 07</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#0F172A]">Policies & Legal</h3>
              <p className="text-xs text-[#64748B]">Terms, Privacy & Refund policies defined.</p>
            </div>

            {/* 8. Documents Card */}
            <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] space-y-3 shadow-2xs hover:border-[#D4A35A] transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-center text-[#5C3A1E]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-mono text-[#A98B57]">Step 08</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#0F172A]">Vectorized Docs</h3>
              <p className="text-xs text-[#64748B]">
                {submission?.documents?.length || 0} documents processed into vectors.
              </p>
            </div>
          </div>

          {/* Quick CTA to Edit Form */}
          <div className="p-8 rounded-3xl bg-[#FAF9F5] border border-[#EADFCB] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-[#0F172A]">
                Need to update company details or launch a new service?
              </h3>
              <p className="text-xs text-[#64748B]">
                Edit any of the 8 steps in the Client Information Form. Your changes will be reviewed by the admin team.
              </p>
            </div>
            <Link href="/client-form">
              <Button variant="primary" size="md" withArrow>
                Open Multi-Step Form
              </Button>
            </Link>
          </div>
        </main>

        <Footer />
        <MobileBottomNav />

        {/* Chatbot Preview Modal */}
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFDF9] border border-[#EADFCB] rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col max-h-[600px] h-[80vh]">
              <div className="flex items-center justify-between pb-3 border-b border-[#EADFCB]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#5C3A1E] text-white flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#D4A35A]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm">Chatbot Knowledge Preview</h4>
                    <p className="text-[10px] text-[#64748B]">Testing verified RAG knowledge base</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                {previewMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        m.sender === "user"
                          ? "bg-[#5C3A1E] text-white rounded-br-xs"
                          : "bg-[#FAF9F5] border border-[#EADFCB] text-[#0F172A] rounded-bl-xs"
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                    </div>
                  </div>
                ))}
                {previewLoading && (
                  <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#64748B] w-fit">
                    Retrieving approved knowledge...
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#EADFCB] flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask a test question..."
                  value={previewInput}
                  onChange={(e) => setPreviewInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendPreview()}
                  className="flex-1 p-2.5 rounded-xl border border-[#EADFCB] bg-[#FAF9F5] text-xs focus:outline-none focus:border-[#D4A35A]"
                />
                <Button onClick={handleSendPreview} variant="primary" size="sm">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
