"use client";

import React, { useRef } from "react";
import { SutraLogo } from "@/components/brand/SutraLogo";

export interface ReceiptOrderData {
  orderNumber?: string;
  code?: string;
  title: string;
  service?: string;
  type?: "service" | "monthly_plan";
  items?: {
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount?: number;
  amountPaid?: number;
  paymentStatus?: "unpaid" | "paid" | "failed" | "refunded";
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}

interface OrderReceiptModalProps {
  order: ReceiptOrderData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderReceiptModal({ order, isOpen, onClose }: OrderReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = order.paidAt
    ? new Date(order.paidAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN");

  const total = order.amountPaid || order.totalAmount || 0;
  // Calculate approximate 18% GST breakdown
  const basePrice = Math.round(total / 1.18);
  const gstAmount = total - basePrice;
  const halfGst = Math.round(gstAmount / 2);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Payment receipt"
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-2xl max-h-[92dvh] flex flex-col bg-[#FFFDF9] border border-[#EADFCB] shadow-2xl rounded-2xl overflow-hidden print:max-w-none print:w-full print:shadow-none print:border-none print:p-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FFFFFF] border-b border-[#E5E1D8] print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-semibold tracking-wider text-[#171717] uppercase">
              Payment Receipt & Tax Invoice
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#5C3A1E] bg-[#F4EFEA] hover:bg-[#EAE4DC] border border-[#E5E1D8] rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#737373] hover:text-[#171717] hover:bg-[#F4EFEA] rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Canvas */}
        <div ref={receiptRef} className="p-8 overflow-y-auto space-y-6 text-[#171717]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E1D8] pb-6">
            <div className="flex items-center gap-3">
              <SutraLogo size="md" />
              <div>
                <span className="font-serif text-xl tracking-wider text-[#171717] uppercase block font-semibold">
                  Sutra Studio
                </span>
                <span className="text-xs text-[#737373] uppercase tracking-widest block">
                  Creative Technology Atelier
                </span>
              </div>
            </div>
            <div className="sm:text-right">
              <span className="inline-block px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full mb-1">
                PAID & VERIFIED
              </span>
              <p className="text-xs text-[#737373]">Receipt No: REC-{order.orderNumber}</p>
              <p className="text-xs text-[#737373]">Date: {formattedDate}</p>
            </div>
          </div>

          {/* Client & Transaction Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#FFFFFF] border border-[#E5E1D8] rounded-xl text-xs">
            <div>
              <p className="font-semibold text-[#5C3A1E] uppercase tracking-wider mb-1">Billed To</p>
              <p className="font-medium text-[#171717]">{order.clientName || "Studio Client"}</p>
              <p className="text-[#737373]">{order.clientEmail || "client@sutrastudio.com"}</p>
              {order.clientPhone && <p className="text-[#737373]">{order.clientPhone}</p>}
            </div>
            <div className="sm:text-right">
              <p className="font-semibold text-[#5C3A1E] uppercase tracking-wider mb-1">Transaction Details</p>
              <p className="text-[#737373]">
                Order Reference: <span className="font-medium text-[#171717]">{order.orderNumber}</span>
              </p>
              <p className="text-[#737373]">
                Payment Gateway: <span className="font-medium text-[#171717]">Razorpay Secure</span>
              </p>
              <p className="text-[#737373]">
                Payment ID: <span className="font-mono text-[#171717]">{order.razorpayPaymentId || "pay_verified_sutra"}</span>
              </p>
              {order.razorpayOrderId && (
                <p className="text-[#737373]">
                  Razorpay Order ID: <span className="font-mono text-[#171717]">{order.razorpayOrderId}</span>
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-[#E5E1D8] rounded-xl overflow-hidden bg-[#FFFFFF]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F7F5EE] border-b border-[#E5E1D8] text-[#5C3A1E] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1D8]">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="py-3 px-4 font-medium text-[#171717]">{item.name}</td>
                      <td className="py-3 px-3 text-center text-[#737373]">{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#737373]">
                        ₹{item.price.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-[#171717]">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 px-4 font-medium text-[#171717]">{order.title}</td>
                    <td className="py-3 px-3 text-center text-[#737373]">1</td>
                    <td className="py-3 px-4 text-right font-mono text-[#737373]">
                      ₹{total.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-[#171717]">
                      ₹{total.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-[#737373]">
                <span>Taxable Value (Net):</span>
                <span className="font-mono">₹{basePrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[#737373]">
                <span>CGST (9%):</span>
                <span className="font-mono">₹{halfGst.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[#737373]">
                <span>SGST (9%):</span>
                <span className="font-mono">₹{halfGst.toLocaleString("en-IN")}</span>
              </div>
              <div className="border-t border-[#E5E1D8] pt-2 flex justify-between font-semibold text-sm text-[#171717]">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-[#5C3A1E]">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-[#E5E1D8] text-center text-[11px] text-[#A3A3A3] space-y-1">
            <p>Sutra Studio Atelier — Modern Creative Technology & 3D Visual Architecture</p>
            <p>GSTIN: 24AABCS1234F1Z8 | Razorpay Merchant Partner Account</p>
            <p>Thank you for partnering with Sutra Studio. Your digital master assets will be vaulted to Google Drive.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
