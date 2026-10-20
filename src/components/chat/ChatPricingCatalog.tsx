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
  const [activeTab, setActiveTab] = useState<"services" | "packages">("services");

  return (
    <div
      className={`rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] p-3 text-[#171717] space-y-3 ${className}`}
      role="region"
      aria-label="Studio Services and Packages Catalog"
    >
      {/* Header & Tab Selector */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D8]">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#A98B57] block">
            Studio Rate Card
          </span>
          <h4 className="font-serif font-bold text-xs text-[#171717]">
            {activeTab === "services" ? "8 Core Disciplines" : "Packages & Retainers"}
          </h4>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-[#E5E1D8] text-[10px]">
          <button
            type="button"
            onClick={() => setActiveTab("services")}
            className={`px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "services"
                ? "bg-[#5C3A1E] text-white shadow-2xs"
                : "text-[#64748B] hover:text-[#171717]"
            }`}
          >
            Services (From ₹99)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("packages")}
            className={`px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === "packages"
                ? "bg-[#5C3A1E] text-white shadow-2xs"
                : "text-[#64748B] hover:text-[#171717]"
            }`}
          >
            Packages &amp; Retainers
          </button>
        </div>
      </div>

      {/* Tab 1: Studio Services */}
      {activeTab === "services" && (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {INTAKE_SERVICES.map((srv) => (
            <div
              key={srv.id}
              className="p-2.5 rounded-xl bg-white border border-[#E5E1D8] hover:border-[#A98B57] transition-all space-y-1.5 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FAF9F5] text-[#A98B57] font-semibold uppercase">
                    {srv.category}
                  </span>
                  <h5 className="font-bold text-[11px] text-[#171717] mt-0.5 truncate">
                    {srv.title}
                  </h5>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-serif font-bold text-xs text-[#5C3A1E] block">
                    From {formatCurrencyINR(srv.basePrice)}
                  </span>
                  <span className="text-[9px] text-[#64748B] font-mono">
                    {srv.turnaround}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-[#64748B] line-clamp-2 leading-relaxed">
                {srv.description}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-[#E5E1D8]/60">
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
                    className="text-[10px] text-[#64748B] hover:text-[#171717] flex items-center gap-1 cursor-pointer"
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
                  className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#5C3A1E] text-white text-[10px] font-bold hover:bg-[#462B16] transition-all cursor-pointer shadow-2xs"
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
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {INTAKE_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-2.5 rounded-xl border transition-all space-y-1.5 shadow-2xs ${
                pkg.popular
                  ? "bg-[#FFFDF9] border-[#D4A35A] ring-1 ring-[#D4A35A]/30"
                  : "bg-white border-[#E5E1D8] hover:border-[#A98B57]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FAF9F5] text-[#5C3A1E] font-semibold uppercase">
                      {pkg.billingCycle === "monthly" ? "30-Day Retainer" : "Deliverable Pack"}
                    </span>
                    {pkg.popular && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#D4A35A] text-[#171717] uppercase">
                        Flagship
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-[11px] text-[#171717] mt-0.5 truncate">
                    {pkg.title}
                  </h5>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-serif font-bold text-xs text-[#5C3A1E] block">
                    {formatCurrencyINR(pkg.price)}
                  </span>
                  {pkg.billingCycle === "monthly" && (
                    <span className="text-[9px] text-[#64748B] font-mono block">
                      / 30 days
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-[#64748B] line-clamp-2 leading-relaxed">
                {pkg.description}
              </p>

              {pkg.features && pkg.features.length > 0 && (
                <ul className="text-[9px] text-[#475569] space-y-0.5 pt-0.5">
                  {pkg.features.slice(0, 2).map((feat, i) => (
                    <li key={i} className="flex items-center gap-1 truncate">
                      <CheckCircle2 className="w-2.5 h-2.5 text-[#2E7D4F] shrink-0" />
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-[#E5E1D8]/60">
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
                    className="text-[10px] text-[#64748B] hover:text-[#171717] flex items-center gap-1 cursor-pointer"
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
                  className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#5C3A1E] text-white text-[10px] font-bold hover:bg-[#462B16] transition-all cursor-pointer shadow-2xs"
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
