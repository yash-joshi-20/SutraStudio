"use client";

import React, { useState } from "react";
import { formatCurrencyINR } from "@/config/pricing";
import {
  APPROVED_MONTHLY_PACKAGES,
  APPROVED_COMMISSION_PACKAGES,
  APPROVED_STANDALONE_PACKAGES,
} from "@/config/packages";
import { INTAKE_SERVICES, INTAKE_PACKAGES } from "@/components/orders/MasterOrderForm";
import {
  Sparkles,
  Layers,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  Zap,
} from "lucide-react";

export interface ChatCatalogItem {
  id: string;
  name: string;
  price: number;
  type: "service" | "package";
  billingCycle?: "monthly" | "one_time";
  turnaround?: string;
  category?: string;
  description?: string;
}

interface ChatPricingCatalogProps {
  onSelectItem: (item: ChatCatalogItem) => void;
  onOpenFullForm?: (item: ChatCatalogItem) => void;
  className?: string;
}

export function ChatPricingCatalog({
  onSelectItem,
  onOpenFullForm,
  className = "",
}: ChatPricingCatalogProps) {
  const [activeTab, setActiveTab] = useState<"services" | "packages">("packages");

  return (
    <div
      className={`rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] p-2.5 sm:p-3 text-[#171717] space-y-2.5 w-full min-w-0 shadow-2xs ${className}`}
      role="region"
      aria-label="Studio Services and Packages Catalog"
    >
      {/* Header & Tab Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E5E1D8] min-w-0">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#A98B57] block truncate">
            Studio Rate Card
          </span>
          <h4 className="font-serif font-bold text-xs text-[#171717] truncate">
            {activeTab === "packages" ? "Packages & Retainers" : "8 Core Disciplines"}
          </h4>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-[#E5E1D8] text-[10px] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("packages")}
            className={`px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "packages"
                ? "bg-[#5C3A1E] text-white shadow-2xs"
                : "text-[#64748B] hover:text-[#171717]"
            }`}
          >
            Packages
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("services")}
            className={`px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "services"
                ? "bg-[#5C3A1E] text-white shadow-2xs"
                : "text-[#64748B] hover:text-[#171717]"
            }`}
          >
            Services
          </button>
        </div>
      </div>

      {/* Tab 1: Studio Services */}
      {activeTab === "services" && (
        <div className="space-y-2 max-h-72 sm:max-h-80 overflow-y-auto overflow-x-hidden pr-0.5 [scrollbar-width:thin] [scrollbar-color:#E5E1D8_transparent]">
          {INTAKE_SERVICES.map((srv) => (
            <div
              key={srv.id}
              className="p-2.5 rounded-xl bg-white border border-[#E5E1D8] hover:border-[#A98B57] transition-all space-y-1.5 shadow-2xs min-w-0 w-full"
            >
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FAF9F5] text-[#A98B57] font-semibold uppercase inline-block">
                    {srv.category}
                  </span>
                  <h5 className="font-bold text-[11px] sm:text-xs text-[#171717] mt-0.5 break-words">
                    {srv.title}
                  </h5>
                </div>
                <div className="text-right shrink-0 whitespace-nowrap pl-1">
                  <span className="font-serif font-bold text-xs sm:text-sm text-[#5C3A1E] block">
                    From {formatCurrencyINR(srv.basePrice)}
                  </span>
                  <span className="text-[9px] text-[#64748B] font-mono block">
                    {srv.turnaround}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-[#64748B] leading-relaxed break-words">
                {srv.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[#E5E1D8]/60 min-w-0">
                {onOpenFullForm && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenFullForm({
                        id: srv.id,
                        name: srv.title,
                        price: srv.basePrice,
                        type: "service",
                        turnaround: srv.turnaround,
                      })
                    }
                    className="text-[10px] text-[#64748B] hover:text-[#171717] flex items-center gap-1 cursor-pointer shrink-0 py-0.5"
                  >
                    <span>Studio Form</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    onSelectItem({
                      id: srv.id,
                      name: srv.title,
                      price: srv.basePrice,
                      type: "service",
                      turnaround: srv.turnaround,
                      category: srv.category,
                      description: srv.description,
                    })
                  }
                  className="ml-auto inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-[#5C3A1E] text-white text-[10px] font-bold hover:bg-[#462B16] transition-all cursor-pointer shadow-2xs shrink-0"
                >
                  <span>Order Now ({formatCurrencyINR(srv.basePrice)})</span>
                  <ArrowRight className="w-2.5 h-2.5 text-[#D4A35A]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Packages & Retainers */}
      {activeTab === "packages" && (
        <div className="space-y-2 max-h-72 sm:max-h-80 overflow-y-auto overflow-x-hidden pr-0.5 [scrollbar-width:thin] [scrollbar-color:#E5E1D8_transparent]">
          {INTAKE_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-2.5 rounded-xl border transition-all space-y-1.5 shadow-2xs min-w-0 w-full ${
                pkg.popular
                  ? "bg-[#FFFDF9] border-[#D4A35A] ring-1 ring-[#D4A35A]/30"
                  : "bg-white border-[#E5E1D8] hover:border-[#A98B57]"
              }`}
            >
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FAF9F5] text-[#5C3A1E] font-semibold uppercase inline-block">
                      {pkg.billingCycle === "monthly" ? "30-Day Retainer" : "Deliverable Pack"}
                    </span>
                    {pkg.popular && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#D4A35A] text-[#171717] uppercase inline-block">
                        Flagship
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-[11px] sm:text-xs text-[#171717] mt-0.5 break-words">
                    {pkg.title}
                  </h5>
                </div>
                <div className="text-right shrink-0 whitespace-nowrap pl-1">
                  <span className="font-serif font-bold text-xs sm:text-sm text-[#5C3A1E] block">
                    {formatCurrencyINR(pkg.price)}
                  </span>
                  {pkg.billingCycle === "monthly" && (
                    <span className="text-[9px] text-[#64748B] font-mono block">
                      / 30 days
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-[#64748B] leading-relaxed break-words">
                {pkg.description}
              </p>

              {pkg.features && pkg.features.length > 0 && (
                <ul className="text-[9px] text-[#475569] space-y-0.5 pt-0.5 min-w-0">
                  {pkg.features.slice(0, 2).map((feat, i) => (
                    <li key={i} className="flex items-start gap-1 min-w-0">
                      <CheckCircle2 className="w-2.5 h-2.5 text-[#2E7D4F] shrink-0 mt-0.5" />
                      <span className="break-words leading-tight flex-1 min-w-0">{feat}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[#E5E1D8]/60 min-w-0">
                {onOpenFullForm && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenFullForm({
                        id: pkg.id,
                        name: pkg.title,
                        price: pkg.price,
                        type: "package",
                        turnaround: pkg.turnaround,
                      })
                    }
                    className="text-[10px] text-[#64748B] hover:text-[#171717] flex items-center gap-1 cursor-pointer shrink-0 py-0.5"
                  >
                    <span>Studio Form</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    onSelectItem({
                      id: pkg.id,
                      name: pkg.title,
                      price: pkg.price,
                      type: "package",
                      billingCycle: pkg.billingCycle,
                      turnaround: pkg.turnaround,
                      description: pkg.description,
                    })
                  }
                  className="ml-auto inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-[#5C3A1E] text-white text-[10px] font-bold hover:bg-[#462B16] transition-all cursor-pointer shadow-2xs shrink-0"
                >
                  <span>Order Package ({formatCurrencyINR(pkg.price)})</span>
                  <ArrowRight className="w-2.5 h-2.5 text-[#D4A35A]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
