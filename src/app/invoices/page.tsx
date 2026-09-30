"use client";

import React from "react";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Badge } from "@/components/ui/Card";
import { Download } from "lucide-react";

export default function InvoicesPage() {
  const invoices = [
    {
      id: "inv-101",
      number: "INV-2026-001",
      date: "Sep 28, 2026",
      service: "3D Modeling & Fragrance Renders",
      amount: "$750.00",
      status: "completed",
      statusLabel: "Paid",
    },
    {
      id: "inv-102",
      number: "INV-2026-002",
      date: "Sep 15, 2026",
      service: "Social Media Reel Production",
      amount: "$450.00",
      status: "completed",
      statusLabel: "Paid",
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A]">
      <PortalSidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-5xl pb-24 md:pb-10 space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
            FINANCIALS
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#0F172A] mt-1">
            Invoices & Receipts
          </h1>
          <p className="text-xs text-[#64748B]">
            Review your studio statements, milestone invoices, and tax receipts.
          </p>
        </div>

        <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] divide-y divide-[#EADFCB]/60 shadow-xs overflow-hidden">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8F5EF]/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#5C3A1E]">
                    {inv.number}
                  </span>
                  <Badge variant="completed">{inv.statusLabel}</Badge>
                </div>
                <h3 className="font-serif text-base font-semibold text-[#0F172A]">
                  {inv.service}
                </h3>
                <p className="text-xs text-[#64748B]">Billed on {inv.date}</p>
              </div>

              <div className="flex items-center gap-4 sm:shrink-0">
                <span className="font-serif text-lg font-bold text-[#0F172A]">
                  {inv.amount}
                </span>
                <button
                  onClick={() => alert(`Downloading PDF receipt for ${inv.number}`)}
                  className="p-2 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] text-[#5C3A1E] hover:bg-[#5C3A1E] hover:text-white transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
