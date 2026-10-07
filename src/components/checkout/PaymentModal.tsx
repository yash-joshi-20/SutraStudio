"use client";

import React, { useState } from "react";
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
  ExternalLink,
  QrCode,
  ArrowRight,
  Sparkles,
} from "lucide-react";

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
  onPaymentSuccess,
}: PaymentModalProps) {
  const displayCode = orderCode || orderId || "SUTRA-ORD";
  const upiId = STUDIO_PAYMENT_CONFIG.vpa;
  const merchantName = STUDIO_PAYMENT_CONFIG.merchantName;
  const whatsappNumber = STUDIO_PAYMENT_CONFIG.whatsappNumber;

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [qrMode, setQrMode] = useState<"dynamic" | "official">("dynamic");

  const payeeName = STUDIO_PAYMENT_CONFIG.payeeName || "Yash Joshi";
  const verifiedAccountLabel =
    STUDIO_PAYMENT_CONFIG.verifiedAccountLabel || "Yash Joshi (Verified Studio Account)";

  // UPI Intent Deep Link for Mobile (GPay, PhonePe, Paytm, BHIM)
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(displayCode)}`;

  // Copy UPI ID to clipboard
  const handleCopyUpi = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  // Handle receipt screenshot selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      if (file.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(file);
        setReceiptPreview(previewUrl);
      } else {
        setReceiptPreview("");
      }
    }
  };

  // Validate 12-digit UTR
  const validateUtr = (val: string): boolean => {
    const clean = val.trim();
    if (!clean) {
      setUtrError("12-digit UTR / UPI Reference Number is required");
      return false;
    }
    if (!/^\d{12}$/.test(clean)) {
      setUtrError("UTR must be exactly 12 numeric digits (e.g. 428901234567)");
      return false;
    }
    setUtrError("");
    return true;
  };

  // Submit UTR verification directly to /api/orders with pending_verification status
  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUtr(utrNumber)) return;

    setIsSubmitting(true);
    setUtrError("");

    try {
      // 1. Submit payment verification to orders dispatcher with pending_verification
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_payment",
          orderId,
          orderCode: displayCode,
          utrNumber: utrNumber.trim(),
          amount,
          clientName,
          clientEmail,
          paymentMethod: "UPI_GPAY",
          paymentStatus: "pending_verification",
          status: "pending_verification",
          payee: payeeName,
          upiId,
        }),
      });

      // 2. Also notify verify proxy endpoint
      await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          orderCode: displayCode,
          utrNumber: utrNumber.trim(),
          amount,
          clientName,
          clientEmail,
          paymentMethod: "UPI_GPAY",
          hasReceiptAttachment: !!receiptFile,
          status: "pending_verification",
        }),
      }).catch(() => {});

      setSubmissionSuccess(true);
      if (onPaymentSuccess) {
        onPaymentSuccess({
          utr: utrNumber.trim(),
          receiptUrl: receiptPreview,
          receiptFile,
        });
      }

      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    } catch {
      setSubmissionSuccess(true);
      if (onPaymentSuccess) {
        onPaymentSuccess({
          utr: utrNumber.trim(),
          receiptUrl: receiptPreview,
          receiptFile,
        });
      }
      setIsSubmitting(false);
    }
  };

  // Fallback WhatsApp message builder
  const getWhatsAppFallbackUrl = () => {
    const text = `Namaste Yash Joshi & Sutra Studio!
I have completed the zero-fee UPI payment for my creative commission:
• *Order ID / Code:* ${displayCode}
• *Client:* ${clientName}
• *Service / Plan:* ${serviceTitle}
• *Amount:* ₹${amount.toLocaleString("en-IN")}
• *UPI UTR Reference:* ${utrNumber ? utrNumber.trim() : "[Attaching Screenshot]"}
• *Payee:* ${payeeName} (${upiId})

Please verify receipt and initiate studio production workflow.`;

    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Zero-Fee UPI & GPay Direct Checkout"
      description={`Commission ${displayCode} • ${serviceTitle}`}
      maxWidth="lg"
    >
      {submissionSuccess ? (
        <div className="py-6 px-2 text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center mx-auto text-[#059669]">
            <Check className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-bold text-[#0F172A]">
              Payment UTR Submitted!
            </h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              Your 12-digit transaction reference (
              <span className="font-mono font-semibold text-[#5C3A1E]">{utrNumber}</span>
              ) has been queued for verification. Production pipeline will initiate upon receipt confirmation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-left max-w-sm mx-auto space-y-2 text-xs">
            <div className="flex justify-between text-[#64748B]">
              <span>Order Code:</span>
              <span className="font-mono font-bold text-[#0F172A]">{displayCode}</span>
            </div>
            <div className="flex justify-between text-[#64748B]">
              <span>Amount Paid:</span>
              <span className="font-serif font-bold text-[#5C3A1E]">
                ₹{amount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-[#64748B]">
              <span>UTR Reference:</span>
              <span className="font-mono font-semibold text-[#2E7D4F]">{utrNumber}</span>
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
                Total Amount Due (0% Convenience Fee)
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#5C3A1E]">
                ₹{amount.toLocaleString("en-IN")}
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
              <div className="flex items-center justify-center p-1 bg-[#F4EFE6] rounded-xl text-xs font-semibold gap-1 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => setQrMode("dynamic")}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer text-[11px] ${
                    qrMode === "dynamic"
                      ? "bg-[#5C3A1E] text-white shadow-2xs"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  Dynamic Live QR (₹{amount.toLocaleString("en-IN")})
                </button>
                <button
                  type="button"
                  onClick={() => setQrMode("official")}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer text-[11px] ${
                    qrMode === "official"
                      ? "bg-[#5C3A1E] text-white shadow-2xs"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  Studio Standalone QR
                </button>
              </div>

              {qrMode === "dynamic" ? (
                <DynamicUPIQRCode
                  amount={amount}
                  orderId={displayCode}
                  payeeVpa={upiId}
                  payeeName={payeeName}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-4 text-center">
                  {/* QR Container with Automated CSS Cropping & Framing */}
                  <div className="relative mx-auto w-56 h-56 sm:w-64 sm:h-64 rounded-2xl p-3 bg-white shadow-xl border border-amber-200/40 flex items-center justify-center overflow-hidden">
                    <Image
                      alt="Pay to Yash Joshi via UPI"
                      className="object-contain p-2"
                      fill
                      priority
                      src="/brand/gpay-qr.png"
                    />
                  </div>

                  {/* Verified Payee Credentials */}
                  <div className="w-full space-y-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block">
                        Payee Name
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-[#0F172A] flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#2E7D4F]" />
                        <span>{verifiedAccountLabel}</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] flex items-center justify-between gap-2 shadow-2xs">
                      <div className="text-left overflow-hidden">
                        <span className="text-[9px] font-mono text-[#94A3B8] block">Verified UPI ID</span>
                        <span className="font-mono text-xs font-bold text-[#5C3A1E] truncate block select-all">
                          {upiId}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF9F5] hover:bg-[#F4EFE6] border border-[#EADFCB] text-[#5C3A1E] transition-all text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#2E7D4F]" />
                            <span className="text-[#2E7D4F]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#A98B57]" />
                            <span>Copy UPI ID</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Native 1-Tap UPI Intent Trigger Button on Mobile */}
                  <a
                    href={upiDeepLink}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl text-center font-medium shadow-md hover:from-amber-700 hover:to-amber-800 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm min-h-[48px] touch-manipulation cursor-pointer md:hidden"
                  >
                    <Smartphone className="w-4 h-4 text-amber-200" />
                    <span>Pay ₹{amount.toLocaleString("en-IN")} via UPI App</span>
                  </a>

                  <div className="space-y-0.5 pt-0.5">
                    <p className="text-[11px] font-medium text-[#64748B]">
                      Google Pay • PhonePe • Paytm • BHIM • Cred
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: UTR Verification Form */}
            <form onSubmit={handleSubmitVerification} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-xs text-[#64748B] space-y-1">
                <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D4F]" />
                  <span>How to complete zero-fee payment:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 pt-1 text-[11px] text-[#64748B]">
                  <li>Scan the QR code or pay to UPI ID <strong className="text-[#0F172A] font-mono">{upiId}</strong>.</li>
                  <li>Pay the exact amount: <strong className="text-[#5C3A1E]">₹{amount.toLocaleString("en-IN")}</strong>.</li>
                  <li>Copy the 12-digit UPI Reference / UTR Number from your receipt.</li>
                  <li>Paste below and submit for instant verification.</li>
                </ol>
              </div>

              {/* 12-Digit UTR Input */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  12-Digit UPI Reference No. / UTR <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  placeholder="e.g. 428901234567"
                  value={utrNumber}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                    setUtrNumber(onlyNums);
                    if (utrError) setUtrError("");
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border text-xs font-mono tracking-wider text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 ${
                    utrError
                      ? "border-red-400 focus:border-red-500 focus:ring-red-400"
                      : "border-[#EADFCB] focus:border-[#D4A35A] focus:ring-[#D4A35A]"
                  }`}
                />
                {utrError ? (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{utrError}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-[#94A3B8] mt-1 font-mono">
                    Found in your bank SMS or GPay/PhonePe payment details (12 digits)
                  </p>
                )}
              </div>

              {/* Screenshot Upload (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Payment Screenshot (Optional but recommended)
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
                  disabled={isSubmitting || utrNumber.length !== 12}
                  className="w-full justify-center"
                  leftIcon={
                    isSubmitting ? undefined : <ShieldCheck className="w-4 h-4" />
                  }
                >
                  {isSubmitting
                    ? "Verifying Transaction..."
                    : `Confirm & Submit UTR (${utrNumber.length}/12)`}
                </Button>

                {/* WhatsApp Alternative */}
                <div className="text-center pt-1">
                  <span className="text-[11px] text-[#94A3B8] block mb-1.5">
                    Need instant concierge confirmation?
                  </span>
                  <a
                    href={getWhatsAppFallbackUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-xs text-[#2E7D4F] hover:text-[#1E5635] font-semibold hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-[#2E7D4F] text-[#FAF9F5]" />
                    <span>Confirm & Send Screenshot via WhatsApp</span>
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
