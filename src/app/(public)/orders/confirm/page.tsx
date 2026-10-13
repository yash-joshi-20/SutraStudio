"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth/authContext";
import { STUDIO_PAYMENT_CONFIG } from "@/config/pricing";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageCircle,
  MessageSquare,
  Mail,
  QrCode,
  CreditCard,
  Lock,
  Sparkles,
  ExternalLink,
  AlertCircle,
  User,
  Loader2,
} from "lucide-react";

function ChannelIcon({ channel }: { channel: string }) {
  switch (channel?.toLowerCase()) {
    case "whatsapp":
      return <MessageCircle className="w-4 h-4 text-[#25D366]" />;
    case "instagram":
      return <MessageSquare className="w-4 h-4 text-[#E1306C]" />;
    case "facebook":
      return <MessageSquare className="w-4 h-4 text-[#1877F2]" />;
    case "email":
      return <Mail className="w-4 h-4 text-[#5C3A1E]" />;
    default:
      return <Sparkles className="w-4 h-4 text-[#A98B57]" />;
  }
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const orderId = searchParams.get("orderId");
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftData, setDraftData] = useState<any | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<"gpay_upi" | "invoice">("gpay_upi");
  const [utrNumber, setUtrNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedSuccess, setConfirmedSuccess] = useState(false);

  useEffect(() => {
    if (!orderId || !token) {
      setError("Missing order reference or security token in confirmation link.");
      setLoading(false);
      return;
    }

    async function fetchDraft() {
      try {
        const res = await fetch(
          `/api/orders/drafts/confirm?orderId=${encodeURIComponent(orderId!)}&token=${encodeURIComponent(token!)}`
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load draft order.");
        }
        setDraftData(data.draft);
      } catch (err: any) {
        setError(err.message || "Failed to verify draft order link.");
      } finally {
        setLoading(false);
      }
    }

    fetchDraft();
  }, [orderId, token]);

  const handleConfirmOrder = async () => {
    if (!user) {
      alert("Please sign in or create an account to confirm this order.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders/drafts/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          token,
          clientUid: user.uid,
          clientEmail: user.email,
          clientName: user.displayName || (user as any).name || "Studio Client",
          paymentMethod: paymentMethod === "gpay_upi" ? "UPI_GPAY" : "invoice",
          paymentReference: utrNumber.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to confirm draft order.");
      }

      setConfirmedSuccess(true);
    } catch (err: any) {
      alert(`Confirmation Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-[#A98B57] animate-spin mb-4" />
        <p className="text-sm font-serif text-[#0F172A]">Verifying your studio commission link...</p>
        <p className="text-xs text-[#64748B] mt-1">Securing tokenized handshake with Sutra Studio vault.</p>
      </div>
    );
  }

  if (error || !draftData) {
    return (
      <div className="min-h-[60vh] max-w-xl mx-auto flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-[#0F172A] mb-2">Invalid or Expired Link</h1>
        <p className="text-sm text-[#64748B] leading-relaxed mb-6">
          {error || "This order confirmation link could not be validated. It may have already been confirmed or expired."}
        </p>
        <Link href="/orders">
          <Button variant="primary">Return to Client Portal</Button>
        </Link>
      </div>
    );
  }

  if (confirmedSuccess || !draftData.isDraft) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#EDF7F0] text-[#2E7D4F] flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div>
          <Badge variant="completed" size="md">
            Order Activated
          </Badge>
          <h1 className="font-serif text-3xl font-semibold text-[#0F172A] mt-3">
            Commission #{draftData.orderNumber || draftData.code} Confirmed
          </h1>
          <p className="text-sm text-[#64748B] mt-2 max-w-lg mx-auto leading-relaxed">
            Your brief has been successfully linked to your workspace and placed into the Studio Production Queue.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] text-left space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-[#EADFCB]/60 text-xs">
            <span className="text-[#64748B]">Service</span>
            <span className="font-semibold text-[#0F172A]">{draftData.service}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-[#EADFCB]/60 text-xs">
            <span className="text-[#64748B]">Total Investment</span>
            <span className="font-serif text-base font-bold text-[#5C3A1E]">
              ₹{draftData.totalAmount?.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#64748B]">Channel Origin</span>
            <span className="font-semibold uppercase tracking-wider text-[#A98B57] flex items-center gap-1.5">
              <ChannelIcon channel={draftData.source} />
              {draftData.source}
            </span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/orders" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full justify-center">
              View in Your Orders
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full justify-center">
              Go to Workspace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#5C3A1E] font-medium shadow-2xs">
          <ChannelIcon channel={draftData.source} />
          <span>Received via {draftData.source.toUpperCase()}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
          Review & Confirm Your Studio Order
        </h1>
        <p className="text-sm text-[#64748B] max-w-lg mx-auto leading-relaxed">
          Your commission draft has been prepared by our creative atelier. Please link your account and confirm payment to start production.
        </p>
      </div>

      {/* Order Summary Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EADFCB]/60 gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#A98B57] block">
              Draft #{draftData.orderNumber || draftData.code}
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#0F172A] mt-0.5">{draftData.service}</h2>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] block">Total Investment</span>
            <span className="font-serif text-3xl font-bold text-[#5C3A1E]">
              ₹{draftData.totalAmount?.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Requirements Brief */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A98B57] block">
            Commission Brief & Scope
          </span>
          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB]/60 text-xs text-[#475569] leading-relaxed whitespace-pre-wrap">
            {draftData.requirements}
          </div>
        </div>

        {/* Identity & Authentication Gate */}
        {!user ? (
          <div className="p-6 rounded-2xl bg-[#FFF9F2] border border-[#EADFCB] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#0F172A]">Sign in Required to Activate</h3>
                <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                  Log in or create a client account so this order is safely registered to your private workspace.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href={`/login?redirect=${encodeURIComponent(`/orders/confirm?orderId=${orderId}&token=${token}`)}`}
                className="w-full sm:w-auto flex-1"
              >
                <Button variant="primary" className="w-full justify-center text-xs">
                  Sign In to Continue
                </Button>
              </Link>
              <Link
                href={`/register?redirect=${encodeURIComponent(`/orders/confirm?orderId=${orderId}&token=${token}`)}`}
                className="w-full sm:w-auto flex-1"
              >
                <Button variant="outline" className="w-full justify-center text-xs">
                  Create New Client Account
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-4 border-t border-[#EADFCB]/60">
            {/* Authenticated Client Pill */}
            <div className="p-3.5 rounded-2xl bg-[#EDF7F0] border border-[#D5EAD8] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-[#2E7D4F]" />
                <span className="text-[#0F172A]">
                  Claiming as: <strong>{user.displayName || user.email}</strong> ({user.email})
                </span>
              </div>
              <Badge variant="completed" size="sm">
                Verified Client
              </Badge>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A98B57] block">
                Select Payment Method
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("gpay_upi")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === "gpay_upi"
                      ? "bg-[#FFFDF9] border-[#D4A35A] shadow-xs"
                      : "bg-[#FFFFFF] border-[#EADFCB] hover:border-[#D4A35A]/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-[#0F172A]">Google Pay (GPay) / UPI</span>
                    <QrCode className="w-4 h-4 text-[#5C3A1E]" />
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    Direct merchant settlement to Yash Joshi via UPI VPA ({STUDIO_PAYMENT_CONFIG.vpa}).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("invoice")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === "invoice"
                      ? "bg-[#FFFDF9] border-[#D4A35A] shadow-xs"
                      : "bg-[#FFFFFF] border-[#EADFCB] hover:border-[#D4A35A]/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-[#0F172A]">Confirm on Invoice</span>
                    <CreditCard className="w-4 h-4 text-[#5C3A1E]" />
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    Official tax invoice dispatched upon intake review. Settle within 48h.
                  </p>
                </button>
              </div>

              {/* UTR reference field for UPI */}
              {paymentMethod === "gpay_upi" && (
                <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-2 mt-2">
                  <label className="text-xs font-medium text-[#0F172A] block">
                    UPI Transaction UTR / Ref Number (Optional if already sent)
                  </label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 123456789012"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                  />
                  <p className="text-[10px] text-[#64748B]">
                    Merchant VPA: <span className="font-mono text-[#5C3A1E]">{STUDIO_PAYMENT_CONFIG.vpa}</span> • Yash Joshi
                  </p>
                </div>
              )}
            </div>

            {/* Confirm CTA */}
            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className="w-full justify-center text-sm py-3.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Activating Order & Commencing Production...
                  </>
                ) : (
                  <>
                    Confirm Order & Commence Production
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderConfirmPage() {
  return (
    <div className="flex-1 bg-[#FAF9F5] flex flex-col justify-between">
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="min-h-[50vh] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#A98B57] animate-spin" />
            </div>
          }
        >
          <OrderConfirmationContent />
        </Suspense>
      </main>
    </div>
  );
}
