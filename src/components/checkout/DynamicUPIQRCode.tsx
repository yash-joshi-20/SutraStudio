"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { STUDIO_PAYMENT_CONFIG } from "@/config/pricing";
import { Copy, Check, ShieldCheck, Smartphone, Sparkles, RefreshCw } from "lucide-react";

export interface DynamicUPIQRCodeProps {
  amount: number;
  orderId: string;
  payeeVpa?: string;
  payeeName?: string;
  className?: string;
  showIntentButton?: boolean;
}

export function DynamicUPIQRCode({
  amount,
  orderId,
  payeeVpa,
  payeeName,
  className = "",
  showIntentButton = true,
}: DynamicUPIQRCodeProps) {
  const vpa = payeeVpa || STUDIO_PAYMENT_CONFIG.vpa || "yashjoshi7355-1@okicici";
  const name = payeeName || STUDIO_PAYMENT_CONFIG.payeeName || "Yash Joshi";
  const verifiedAccountLabel =
    STUDIO_PAYMENT_CONFIG.verifiedAccountLabel || "Yash Joshi (Verified Sutra Studio Account)";

  const [copiedUpi, setCopiedUpi] = useState(false);

  // Dynamic URI construction strictly following UPI specs:
  // upi://pay?pa=yashjoshi7355-1@okicici&pn=Yash%20Joshi&am=${amount}&cu=INR&tn=${orderId}&mode=02&purpose=00
  const upiUri = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(
    name
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(orderId)}&mode=02&purpose=00`;

  const handleCopyUpi = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(vpa);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-4 text-center ${className}`}
    >
      {/* Luxury Gold / Stone Framed Dynamic QR Matrix */}
      <div className="relative mx-auto bg-white p-4 sm:p-5 rounded-2xl shadow-xl border border-amber-200/60 flex flex-col items-center justify-center">
        <div className="p-2 bg-white rounded-xl">
          <QRCodeSVG
            value={upiUri}
            size={208}
            level="H"
            includeMargin={false}
            imageSettings={{
              src: "/brand/sutra-symbol.png",
              x: undefined,
              y: undefined,
              height: 32,
              width: 32,
              excavate: true,
            }}
            className="w-48 h-48 sm:w-52 sm:h-52"
          />
        </div>

        {/* Live Scan Target Indicator */}
        <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-mono text-[#5C3A1E]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Scan with any UPI App</span>
        </div>
      </div>

      {/* Amount Display Prominently Below QR */}
      <div className="space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block">
          Amount Locked to QR
        </span>
        <div className="font-serif text-lg sm:text-xl font-bold text-[#5C3A1E]">
          Pay Exact Amount: ₹{amount.toLocaleString("en-IN")}
        </div>
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
              {vpa}
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

      {/* Mobile 1-Tap UPI Intent Button */}
      {showIntentButton && (
        <a
          href={upiUri}
          className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl text-center font-medium shadow-md hover:from-amber-700 hover:to-amber-800 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm min-h-[48px] touch-manipulation cursor-pointer"
        >
          <Smartphone className="w-4 h-4 text-amber-200" />
          <span>Tap to Pay via GPay / PhonePe / Paytm</span>
        </a>
      )}

      <div className="space-y-0.5 pt-0.5">
        <p className="text-[11px] font-medium text-[#64748B]">
          Google Pay • PhonePe • Paytm • BHIM • Cred
        </p>
      </div>
    </div>
  );
}
