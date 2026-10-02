"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RouteGuard } from "@/components/auth/RouteGuard";
import {
  Download,
  Receipt,
  CheckCircle2,
  Clock,
  ArrowRight,
  HardDrive,
  FileText,
  CreditCard,
  ShieldCheck,
  Search,
} from "lucide-react";

interface InvoiceRecord {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  service: string;
  amount: string;
  status: "paid" | "pending";
  statusLabel: string;
  paymentMethod: string;
  driveFile: string;
}

export default function InvoicesPage() {
  const [downloadMsg, setDownloadMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const invoices: InvoiceRecord[] = [
    {
      id: "inv-101",
      number: "INV-2026-001",
      date: "Sep 28, 2026",
      dueDate: "Paid on Sep 28",
      service: "3D Modeling & Luxury Fragrance Renders Pack",
      amount: "₹62,500",
      status: "paid",
      statusLabel: "Paid & Cleared",
      paymentMethod: "Stripe / Corporate Visa ending in 4022",
      driveFile: "INV_2026_001_Signed.pdf",
    },
    {
      id: "inv-102",
      number: "INV-2026-002",
      date: "Sep 15, 2026",
      dueDate: "Paid on Sep 15",
      service: "Social Media Reel & 4K Video Production",
      amount: "₹37,500",
      status: "paid",
      statusLabel: "Paid & Cleared",
      paymentMethod: "Razorpay / UPI corporate transfer",
      driveFile: "INV_2026_002_Signed.pdf",
    },
    {
      id: "inv-103",
      number: "INV-2026-003",
      date: "Oct 01, 2026",
      dueDate: "Due on Oct 10, 2026",
      service: "Diwali Festive Omni-Channel Meta Ads Creative Suite",
      amount: "₹75,000",
      status: "pending",
      statusLabel: "Payment Due",
      paymentMethod: "Net Banking / NEFT pending",
      driveFile: "INV_2026_003_Draft.pdf",
    },
  ];

  const handleDownloadInvoice = (invNumber: string) => {
    setDownloadMsg(`Downloading official tax receipt for ${invNumber}...`);
    setTimeout(() => {
      setDownloadMsg(`Receipt ${invNumber} downloaded and archived to Google Drive.`);
      setTimeout(() => setDownloadMsg(""), 3000);
    }, 1000);
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <PortalSidebar />

        <main id="main-content" className="flex-1 p-6 sm:p-8 lg:p-10 max-w-5xl pb-24 md:pb-12 space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EADFCB] gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-semibold uppercase tracking-wider text-[#5C3A1E] mb-2">
                <span>BILLING & STATEMENTS</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
                Invoices & Tax Receipts
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Review verified studio statements, GST milestone invoices, and encrypted receipts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex items-center w-full sm:w-60">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search invoice or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>
            </div>
          </div>

          {/* Financial Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">Total Billed Volume</span>
              <p className="font-serif text-2xl font-bold text-[#0F172A]">₹1,75,000</p>
              <span className="text-[11px] text-[#2E7D4F] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 3 Statements Verified
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">Paid to Date</span>
              <p className="font-serif text-2xl font-bold text-[#2E7D4F]">₹1,00,000</p>
              <span className="text-[11px] text-[#64748B]">Receipts synchronized in Drive</span>
            </div>

            <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">Pending Milestone</span>
              <p className="font-serif text-2xl font-bold text-[#D4A35A]">₹75,000</p>
              <span className="text-[11px] text-[#A98B57] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Due in 9 days
              </span>
            </div>
          </div>

          {/* Toast Notification */}
          {downloadMsg && (
            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span className="font-medium">{downloadMsg}</span>
              </div>
              <span className="text-[10px] font-mono text-[#15803D]">Google Drive Synced</span>
            </div>
          )}

          {/* Invoices List */}
          <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] divide-y divide-[#EADFCB]/60 shadow-xs overflow-hidden">
            {filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-[#FAF9F5]/60 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#5C3A1E] tracking-wider">
                      {inv.number}
                    </span>
                    <Badge variant={inv.status === "paid" ? "completed" : "gold"}>
                      {inv.statusLabel}
                    </Badge>
                    <span className="text-[11px] text-[#64748B] font-mono">
                      Issued: {inv.date}
                    </span>
                  </div>

                  <h3 className="font-serif text-base sm:text-lg font-semibold text-[#0F172A]">
                    {inv.service}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-[#64748B] flex-wrap">
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-[#5C3A1E]" />
                      <span>{inv.paymentMethod}</span>
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-[#5C3A1E]">
                      {inv.driveFile}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-[#EADFCB]/60">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                      Total Amount (Inc. GST)
                    </span>
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#0F172A]">
                      {inv.amount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {inv.status === "pending" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setDownloadMsg(`Initializing Razorpay secure checkout for ${inv.amount}...`);
                          setTimeout(() => {
                            setDownloadMsg(`Payment of ${inv.amount} for ${inv.number} cleared via Razorpay UPI. Receipt archived.`);
                            setTimeout(() => setDownloadMsg(""), 4000);
                          }, 1500);
                        }}
                        leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                      >
                        Pay Now
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownloadInvoice(inv.number)}
                      leftIcon={<Download className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                    >
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Drive Vault Storage Notice */}
          <div className="p-5 rounded-3xl bg-[#FAF9F5] border border-[#EADFCB] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-[#5C3A1E] shrink-0" />
              <div>
                <h4 className="font-serif font-semibold text-sm text-[#0F172A]">
                  Encrypted Tax Archive
                </h4>
                <p className="text-[#64748B] mt-0.5">
                  All signed agreements and official GST tax invoices are automatically preserved in your private Google Drive folder <code className="font-mono text-[#5C3A1E]">/LEGAL_DOCS</code>.
                </p>
              </div>
            </div>
            <Link href="/media" className="shrink-0">
              <Button variant="secondary" size="sm" withArrow>
                Open Vault
              </Button>
            </Link>
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </RouteGuard>
  );
}
