"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { STUDIO_PAYMENT_CONFIG } from "@/config/pricing";
import { DynamicUPIQRCode } from "@/components/checkout/DynamicUPIQRCode";
import {
  Copy,
  Check,
  Smartphone,
  Upload,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { soundSystem } from "@/lib/audio/soundSystem";

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderCode?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  serviceTitle: string;
  amount: number;
  isCustomQuote?: boolean;
  confirmToken?: string;
  onPaymentSuccess?: (verificationData: {
    utr: string;
    receiptUrl?: string;
    receiptFile?: File | null;
  }) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  orderId,
  orderCode,
  clientName,
  clientEmail,
  clientPhone,
  serviceTitle,
  amount,
  isCustomQuote,
  confirmToken,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [lockedPayment, setLockedPayment] = useState<{
    amountINR: number;
    currency: string;
    vpa: string;
    payeeName: string;
    orderNumber: string;
    upiUri: string;
    status: string;
  } | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [initError, setInitError] = useState("");

  const displayCode = lockedPayment?.orderNumber || orderCode || orderId || "SUTRA-ORD";
  const upiId = lockedPayment?.vpa || STUDIO_PAYMENT_CONFIG.vpa || "yashjoshi7355-1@okicici";
  const payeeName = lockedPayment?.payeeName || STUDIO_PAYMENT_CONFIG.payeeName || "Yash Joshi";
  const effectiveAmount = lockedPayment?.amountINR ?? amount;
  const whatsappNumber = STUDIO_PAYMENT_CONFIG.whatsappNumber || "918200192781";

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Initialize and synchronize authoritative server payment on open
  useEffect(() => {
    if (!isOpen || !orderId) return;

    let isCancelled = false;
    setIsLoadingPayment(true);
    setInitError("");

    fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        confirmToken,
        clientEmail,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (isCancelled) return;
        if (!res.ok) {
          setInitError(data.error || "Failed to initialize payment session.");
          setIsLoadingPayment(false);
          return;
        }
        setLockedPayment({
          amountINR: data.amountINR,
          currency: data.currency || "INR",
          vpa: data.vpa,
          payeeName: data.payeeName,
          orderNumber: data.orderNumber || orderCode || orderId,
          upiUri: data.upiUri,
          status: data.status,
        });
        setIsLoadingPayment(false);
      })
      .catch((err) => {
        if (!isCancelled) {
          setInitError(err instanceof Error ? err.message : "Failed to load payment session.");
          setIsLoadingPayment(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, orderId, confirmToken, clientEmail, orderCode]);

  // UPI Intent Deep Link for Mobile (uses server locked values)
  const upiDeepLink =
    lockedPayment?.upiUri ||
    `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      payeeName
    )}&am=${effectiveAmount}&cu=INR&tn=${encodeURIComponent(displayCode)}`;

  const handleCopyUpi = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setReceiptPreview("");
      }
    }
  };

  const validateUtr = (val: string): boolean => {
    const clean = val.trim();
    if (!clean) {
      setUtrError("12-16 digit bank UTR / UPI reference number is required.");
      return false;
    }
    if (!/^[0-9A-Za-z]{12,16}$/.test(clean)) {
      setUtrError("UTR must be 12 to 16 alphanumeric characters (e.g. 428901234567).");
      return false;
    }
    setUtrError("");
    return true;
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUtr(utrNumber)) return;

    setIsSubmitting(true);
    setUtrError("");

    try {
      // Submit UTR directly to /api/payments/submit-utr (enforces single-use & server-locked amount)
      const res = await fetch("/api/payments/submit-utr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          confirmToken,
          clientEmail,
          utrNumber: utrNumber.trim().toUpperCase(),
          screenshotUrl: receiptPreview || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        soundSystem.play("warning");
        setUtrError(data.error || "Failed to submit UTR. Please check the reference number.");
        setIsSubmitting(false);
        return;
      }

      soundSystem.play("payment_success");
      setSubmissionSuccess(true);
      if (onPaymentSuccess) {
        onPaymentSuccess({
          utr: utrNumber.trim().toUpperCase(),
          receiptUrl: receiptPreview,
          receiptFile,
        });
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("sutra_orders_changed"));
        }
      }, 1500);
    } catch (err) {
      soundSystem.play("warning");
      setUtrError(err instanceof Error ? err.message : "Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const getWhatsAppFallbackUrl = () => {
    const text = `Namaste Yash Joshi & Sutra Studio!
I have submitted the payment for my commission:
• Order Ref: ${displayCode}
• Client: ${clientName}
• Service: ${serviceTitle}
• Amount: ₹${amount.toLocaleString("en-IN")}
• UPI UTR: ${utrNumber ? utrNumber.trim() : "[Screenshot attached]"}
• Payee: ${payeeName} (${upiId})

Please verify payment receipt and commence studio production.`;

    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pay by UPI QR"
      description={`Order ${displayCode} • ${serviceTitle}`}
      maxWidth="lg"
    >
      {isLoadingPayment ? (
        <div className="py-12 px-4 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#A98B57] mx-auto" />
          <p className="text-xs font-mono text-[#64748B]">
            Verifying order ownership and locking studio ledger pricing...
          </p>
        </div>
      ) : initError ? (
        <div className="py-8 px-4 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif text-lg font-bold text-[#0F172A]">Payment Session Error</h4>
            <p className="text-xs text-red-600 max-w-md mx-auto">{initError}</p>
          </div>
          <div className="pt-2 flex justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      ) : lockedPayment?.status === "paid" ? (
        <div className="py-8 px-4 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
            <Check className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-[#0F172A]">Payment Already Verified</h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              This order ({displayCode}) has already been confirmed and marked as paid in the studio ledger.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
            >
              Done & Return
            </Button>
          </div>
        </div>
      ) : submissionSuccess ? (
        <div className="py-6 px-2 text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center mx-auto text-[#059669]">
            <Check className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-bold text-[#0F172A]">
              Payment Submitted
            </h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              Your reference (
              <span className="font-mono font-semibold text-[#5C3A1E]">{utrNumber.toUpperCase()}</span>
              ) has been queued for verification. Production starts as soon as payment is verified.
            </p>
            <p className="text-[11px] font-semibold text-[#059669] animate-pulse pt-1">
              ✓ Closing and updating your order list...
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-left max-w-sm mx-auto space-y-2 text-xs">
            <div className="flex justify-between text-[#64748B]">
              <span>Order Number:</span>
              <span className="font-mono font-bold text-[#0F172A]">{displayCode}</span>
            </div>
            <div className="flex justify-between text-[#64748B]">
              <span>Amount Due:</span>
              <span className="font-serif font-bold text-[#5C3A1E]">
                ₹{effectiveAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-[#64748B]">
              <span>UTR Reference:</span>
              <span className="font-mono font-semibold text-[#2E7D4F]">{utrNumber.toUpperCase()}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <a
              href={getWhatsAppFallbackUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] text-white hover:bg-[#20BD5A] transition-colors text-xs font-semibold shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
              <span>Send Receipt on WhatsApp</span>
            </a>

            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Done & Return
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 pt-1">
          {/* Top Amount Banner */}
          <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block">
                Total Amount Due (Authoritative)
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#5C3A1E]">
                ₹{effectiveAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-[#64748B] block">Order Ref</span>
              <span className="font-mono text-xs font-bold text-[#0F172A]">{displayCode}</span>
            </div>
          </div>

          {/* Grid Layout: Left QR Code, Right Payment Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: QR Code & Verified Credentials */}
            <div className="space-y-3">
              <DynamicUPIQRCode
                amount={effectiveAmount}
                orderId={displayCode}
                payeeVpa={upiId}
                payeeName={payeeName}
              />

              {/* Mobile "Pay with UPI app" intent button */}
              <a
                href={upiDeepLink}
                className="w-full py-3.5 bg-[#5C3A1E] hover:bg-[#462B16] text-white rounded-xl text-center font-medium shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm min-h-[48px] touch-manipulation cursor-pointer md:hidden"
              >
                <Smartphone className="w-4 h-4 text-amber-200" />
                <span>Pay with UPI app</span>
              </a>
            </div>

            {/* Right Column: UTR Verification Form */}
            <form onSubmit={handleSubmitVerification} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-xs text-[#64748B] space-y-1">
                <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D4F]" />
                  <span>How to Pay by UPI QR:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 pt-1 text-[11px] text-[#64748B]">
                  <li>Scan the QR code or send payment to UPI ID <strong className="text-[#0F172A] font-mono">{upiId}</strong>.</li>
                  <li>Pay the exact locked amount: <strong className="text-[#5C3A1E]">₹{effectiveAmount.toLocaleString("en-IN")}</strong>.</li>
                  <li>Copy the 12-digit UTR / UPI Reference Number from your payment confirmation.</li>
                  <li>Submit the UTR below. Studio admin verifies the bank credit before production starts.</li>
                </ol>
              </div>

              {/* 12-16 Digit UTR Input */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  12-Digit UPI Reference No. / UTR <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="e.g. 428901234567"
                  value={utrNumber}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
                    setUtrNumber(clean);
                    if (utrError) setUtrError("");
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border text-xs font-mono tracking-wider text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-0 ${
                    utrError
                      ? "border-red-400 focus:border-red-500"
                      : "border-[#EADFCB] focus:border-[#D4A35A]"
                  }`}
                />
                {utrError ? (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{utrError}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-[#94A3B8] mt-1 font-mono">
                    Found in your UPI app receipt or bank confirmation SMS
                  </p>
                )}
              </div>

              {/* Screenshot Upload (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Payment Screenshot (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="w-full text-xs text-[#64748B] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#F4EFE6] file:text-[#5C3A1E] hover:file:bg-[#EADFCB] cursor-pointer"
                  />
                </div>
                {receiptPreview && (
                  <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-[#EADFCB]">
                    <Image
                      src={receiptPreview}
                      alt="Receipt Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2 space-y-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting || utrNumber.length < 12}
                  className="w-full justify-center"
                  leftIcon={
                    isSubmitting ? undefined : <ShieldCheck className="w-4 h-4" />
                  }
                >
                  {isSubmitting
                    ? "Submitting for Studio Verification..."
                    : `Submit UTR for Verification (${utrNumber.length}/12+)`}
                </Button>

                {/* WhatsApp Alternative */}
                <div className="text-center pt-1">
                  <span className="text-[11px] text-[#94A3B8] block mb-1.5">
                    Questions about verification?
                  </span>
                  <a
                    href={getWhatsAppFallbackUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-xs text-[#2E7D4F] hover:text-[#1E5635] font-semibold hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-[#2E7D4F] text-[#FAF9F5]" />
                    <span>Send details via WhatsApp</span>
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </Modal>
  );
}
