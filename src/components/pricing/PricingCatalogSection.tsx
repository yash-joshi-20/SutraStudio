"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import {
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  APPROVED_MONTHLY_PACKAGES,
  APPROVED_COMMISSION_PACKAGES,
  APPROVED_STANDALONE_PACKAGES,
} from "@/config/packages";
import {
  CANONICAL_SERVICES,
  formatCurrencyINR,
} from "@/config/services";

export const SERVICE_CATEGORY_TABS = [
  "All",
  "Image",
  "Video",
  "3D & Spatial",
  "Design",
  "Marketing",
  "Development",
];

export interface PricingCatalogSectionProps {
  id?: string;
  variant?: "page" | "home";
  className?: string;
  initialTab?: "monthly" | "services" | "packs";
}

export function PricingCatalogSection({
  id = "pricing",
  variant = "page",
  className = "",
  initialTab = "monthly",
}: PricingCatalogSectionProps) {
  const [activeTab, setActiveTab] = useState<"monthly" | "services" | "packs">(initialTab);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>("All");

  // Sync tab with URL search parameter if provided (e.g. ?cycle=monthly, ?tab=packs, ?cycle=project, ?tab=services)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") || params.get("cycle");
      if (tabParam === "monthly" || tabParam === "retainer") {
        setActiveTab("monthly");
      } else if (tabParam === "packs" || tabParam === "packages") {
        setActiveTab("packs");
      } else if (tabParam === "services" || tabParam === "project" || tabParam === "standalone") {
        setActiveTab("services");
      }
    }
  }, []);

  const activeCanonicalServices = CANONICAL_SERVICES.filter((s) => s.active);

  const filteredStandaloneServices = activeCanonicalServices.filter((s) => {
    if (selectedServiceCategory === "All") return true;
    if (selectedServiceCategory === "3D & Spatial") return s.category === "3D & Spatial";
    return s.category.toLowerCase() === selectedServiceCategory.toLowerCase();
  });

  const isHomePage = variant === "home";

  return (
    <section id={id} className={`w-full space-y-12 sm:space-y-16 ${className}`}>
      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 w-full flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
          <span className="text-[#D4A35A] text-xs">◆</span>
          <span className="text-[10px] md:text-xs font-semibold tracking-[0.22em] text-[#5C3A1E] uppercase">
            {isHomePage ? "TRANSPARENT STUDIO INVESTMENT" : "CANONICAL STUDIO PRICING"}
          </span>
        </div>

        {isHomePage ? (
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#0F172A] leading-[1.1]">
            Transparent Investment:{" "}
            <span className="text-gold-gradient">Choose the Right Plan for Your Goals</span>
          </h2>
        ) : (
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#0F172A] leading-[1.1]">
            Transparent Investment:{" "}
            <span className="text-gold-gradient">Choose the Plan That Fits Your Goals</span>
          </h1>
        )}

        <p className="text-sm sm:text-base md:text-lg text-[#64748B] leading-relaxed max-w-2xl font-sans">
          Clean, fixed-rate creative technology commissions with zero hidden surprises. Every deliverable produced under senior art direction and delivered to your private Google Drive vault.
        </p>

        {/* Primary Catalog Navigation Switcher */}
        <div className="pt-4 flex flex-col items-center justify-center w-full">
          {/* Mobile View: Custom Dropdown Menu (Guaranteed Zero Squishing / Overflow) */}
          <div className="w-full md:hidden max-w-xs mx-auto">
            <CustomDropdown
              options={[
                {
                  label: "30-Day Retainers (Flagship)",
                  value: "monthly",
                  badge: "Daily 1+1",
                  description: "Continuous creative queue (₹19,999/mo)",
                },
                {
                  label: "Individual Solutions",
                  value: "services",
                  badge: "Single Orders",
                  description: "Single standalone deliverables on demand",
                },
                {
                  label: "Essential Deliverable Packs",
                  value: "packs",
                  badge: "Bundles",
                  description: "High-velocity multi-asset packs",
                },
              ]}
              value={activeTab}
              onChange={(val) => setActiveTab(val as "monthly" | "services" | "packs")}
              placeholder="Select Pricing Model"
              buttonClassName="!rounded-full !bg-[#FFFDF9] !border-[#EADFCB] py-2.5 shadow-xs font-semibold text-[#5C3A1E]"
            />
          </div>

          {/* Desktop View: Tablist Pill Switcher (Unbreakable Single Line) */}
          <div className="hidden md:flex items-center justify-center w-full">
            <div
              role="tablist"
              aria-label="Pricing catalog navigation"
              className="grid grid-cols-3 w-full max-w-2xl rounded-full bg-[#FFFDF9] border border-[#EADFCB] p-1.5 shadow-xs gap-1.5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "monthly"}
                onClick={() => setActiveTab("monthly")}
                className={`py-2.5 px-3 lg:px-4 rounded-full text-xs lg:text-sm font-semibold cursor-pointer transition-all text-center flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeTab === "monthly"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <span className="whitespace-nowrap">30-Day Retainers</span>
                <span className="text-[10px] bg-[#D4A35A] text-[#0F172A] px-1.5 py-0.5 rounded-full font-bold shrink-0">
                  Flagship
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "services"}
                onClick={() => setActiveTab("services")}
                className={`py-2.5 px-3 lg:px-4 rounded-full text-xs lg:text-sm font-semibold cursor-pointer transition-all text-center whitespace-nowrap ${
                  activeTab === "services"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <span className="whitespace-nowrap">Individual Solutions</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "packs"}
                onClick={() => setActiveTab("packs")}
                className={`py-2.5 px-3 lg:px-4 rounded-full text-xs lg:text-sm font-semibold cursor-pointer transition-all text-center whitespace-nowrap ${
                  activeTab === "packs"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <span className="whitespace-nowrap">Essential Deliverable Packs</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION A: 30-DAY MONTHLY RETAINER PACKAGES
          ========================================================================= */}
      {activeTab === "monthly" && (
        <div className="w-full space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
              CONTINUOUS CREATIVE PRODUCTION
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
              Approved 30-Day Subscription Retainers
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B]">
              High-velocity creative output engineered for emerging brands, content creators, and scaling e-commerce.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-7xl mx-auto w-full">
            {APPROVED_MONTHLY_PACKAGES.map((tier) => (
              <div
                key={tier.id}
                className={`rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  tier.popular
                    ? "bg-[#FFFDF9] border-2 border-[#D4A35A] shadow-warm relative ring-2 ring-[#D4A35A]/30"
                    : "bg-[#FFFDF9] border border-[#EADFCB] shadow-sm hover:border-[#D4A35A]/60"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#5C3A1E] text-white px-4 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase shadow-xs whitespace-nowrap border border-[#D4A35A]/50">
                    FLAGSHIP • DAILY 1 IMAGE + 1 VIDEO
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-serif text-2xl font-bold text-[#0F172A]">
                        {tier.name}
                      </h4>
                      {tier.popular && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A35A] bg-[#5C3A1E] px-2 py-0.5 rounded-full">
                          Flagship
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                      {tier.description}
                    </p>
                  </div>

                  {/* Price and Duration */}
                  <div className="flex items-baseline justify-between pb-5 border-b border-[#EADFCB]/60">
                    <div>
                      <span className="font-serif text-3xl sm:text-4xl font-bold text-[#5C3A1E]">
                        {formatCurrencyINR(tier.numericPrice)}
                      </span>
                      <span className="text-xs text-[#64748B] font-mono ml-1.5">
                        / {tier.duration}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[#5C3A1E] font-semibold">
                      {tier.duration} SLA
                    </span>
                  </div>

                  {/* Quota Specs */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-semibold text-[#0F172A]">
                      <span>Monthly Deliverable Quota:</span>
                      <span className="text-[#5C3A1E] font-bold">{tier.quantity} Total Assets</span>
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      {tier.monthlyQuotaDescription}
                    </p>
                  </div>

                  {/* 5-Step Production Pipeline Callout (Featured on Daily Trend Creator) */}
                  {tier.popular && (
                    <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#D4A35A]/40 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A98B57] block">
                        5-Step Daily Production Workflow:
                      </span>
                      <div className="space-y-1.5 text-[11px] text-[#475569]">
                        <div className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                          <span className="w-4 h-4 rounded-full bg-[#5C3A1E] text-white text-[9px] flex items-center justify-center font-bold">1</span>
                          <span>Daily Trend Research &amp; Hook Discovery</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                          <span className="w-4 h-4 rounded-full bg-[#5C3A1E] text-white text-[9px] flex items-center justify-center font-bold">2</span>
                          <span>Brand Creative Direction &amp; Content Planning</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                          <span className="w-4 h-4 rounded-full bg-[#5C3A1E] text-white text-[9px] flex items-center justify-center font-bold">3</span>
                          <span>Dual Asset Production (1 Image + 1 Video)</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                          <span className="w-4 h-4 rounded-full bg-[#5C3A1E] text-white text-[9px] flex items-center justify-center font-bold">4</span>
                          <span>Rigorous Studio Quality &amp; Color Calibration</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                          <span className="w-4 h-4 rounded-full bg-[#5C3A1E] text-white text-[9px] flex items-center justify-center font-bold">5</span>
                          <span>Private Google Drive Vault Delivery</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feature Checklist */}
                  <ul className="space-y-2.5 text-xs text-[#475569]">
                    {tier.features.slice(0, 5).map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-[#EADFCB]/60 flex flex-col gap-4">
                  <Link href={`/orders?package=${tier.id}&cycle=monthly`} className="block w-full">
                    <Button
                      variant={tier.popular ? "primary" : "secondary"}
                      size="md"
                      className="w-full justify-center shadow-xs text-xs sm:text-sm py-3 px-4 font-semibold whitespace-nowrap"
                      withArrow
                    >
                      {tier.ctaText}
                    </Button>
                  </Link>
                  <p className="text-xs text-[#64748B] text-center font-medium leading-relaxed">
                    {tier.turnaround} SLA • 1 revision round included
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION B: INDIVIDUAL STANDALONE SERVICES
          ========================================================================= */}
      {activeTab === "services" && (
        <div className="w-full space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
              SINGLE COMMISSIONS
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
              Canonical Standalone Services
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Order individual single deliverables on demand with transparent fixed pricing and guaranteed studio SLA.
            </p>

            {/* Mobile & Tablet View: Category Custom Dropdown (Guaranteed Clean Responsive Experience) */}
            <div className="w-full md:hidden max-w-xs mx-auto pt-2">
              <CustomDropdown
                options={SERVICE_CATEGORY_TABS.map((cat) => ({
                  label: cat === "All" ? "All Categories" : `${cat} Services`,
                  value: cat,
                  badge: `${
                    cat === "All"
                      ? activeCanonicalServices.length
                      : activeCanonicalServices.filter((s) =>
                          cat === "3D & Spatial"
                            ? s.category === "3D & Spatial"
                            : s.category.toLowerCase() === cat.toLowerCase()
                        ).length
                  }`,
                }))}
                value={selectedServiceCategory}
                onChange={(val) => setSelectedServiceCategory(val)}
                placeholder="Filter by Category"
                buttonClassName="!rounded-full !bg-[#FFFDF9] !border-[#EADFCB] py-2.5 shadow-xs font-medium"
              />
            </div>

            {/* Desktop View: Tab Pills System */}
            <div className="hidden md:flex items-center justify-center flex-wrap gap-2 pt-4">
              {SERVICE_CATEGORY_TABS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedServiceCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedServiceCategory === cat
                      ? "bg-[#5C3A1E] text-white shadow-xs"
                      : "bg-[#FFFDF9] border border-[#EADFCB] text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
            {filteredStandaloneServices.map((service) => (
              <div
                key={service.id}
                className="rounded-3xl p-6 bg-[#FFFDF9] border border-[#EADFCB] hover:border-[#D4A35A] transition-all duration-300 shadow-xs flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[#5C3A1E] font-semibold uppercase tracking-wider">
                      {service.category}
                    </span>
                    <span className="text-[11px] font-mono text-[#64748B]">
                      {service.turnaround}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif text-xl font-bold text-[#0F172A] group-hover:text-[#5C3A1E] transition-colors">
                      {service.name}
                    </h4>
                    <p className="text-xs font-semibold text-[#A98B57] mt-0.5">
                      {service.tagline}
                    </p>
                    <p className="text-xs text-[#64748B] mt-2 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Price Block */}
                  <div className="flex items-baseline justify-between pt-3 border-t border-[#EADFCB]/60">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] block font-mono">
                        {service.pricingType === "starting_at" ? "Starting From" : "Rate"}
                      </span>
                      <span className="font-serif text-2xl font-bold text-[#5C3A1E]">
                        {formatCurrencyINR(service.numericPrice)}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#64748B]">
                      {service.priceDisplay || "Fixed Commission"}
                    </span>
                  </div>

                  {/* Scope & Deliverables */}
                  <div className="space-y-1.5 pt-2 border-t border-[#EADFCB]/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A98B57] block">
                      Deliverables Scope:
                    </span>
                    <ul className="space-y-1 text-xs text-[#475569]">
                      {service.deliverables.slice(0, 3).map((d, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0" />
                          <span className="truncate">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-[#EADFCB]/60 flex flex-col gap-4">
                  <Link href={`/orders?service=${service.slug}`} className="block w-full">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full justify-center text-xs font-semibold"
                      withArrow
                    >
                      Commission Deliverable
                    </Button>
                  </Link>
                  <p className="text-xs text-[#64748B] text-center font-medium leading-relaxed">
                    Turnaround: {service.turnaround} • Direct Google Drive
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION C: ESSENTIAL DELIVERABLE PACKS
          ========================================================================= */}
      {/* =========================================================================
          SECTION C: CURATED BUNDLES & ESSENTIAL DELIVERABLE PACKS
          ========================================================================= */}
      {activeTab === "packs" && (
        <div className="w-full space-y-12">
          {/* Subsection 1: Curated Multi-Service Bundles */}
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
                ONE-TIME PROJECTS
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
                Curated Studio Bundles
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Complete multi-discipline campaign packages combining visuals, video reels, brand assets, and 3D visualization.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
              {APPROVED_COMMISSION_PACKAGES.filter((p) => p.active !== false).map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-3xl p-6 bg-[#FFFDF9] border transition-all flex flex-col justify-between shadow-xs group ${
                    pkg.popular
                      ? "border-2 border-[#D4A35A] ring-2 ring-[#D4A35A]/20"
                      : "border-[#EADFCB] hover:border-[#D4A35A]"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[#5C3A1E] font-semibold uppercase tracking-wider">
                        ONE-TIME PACK
                      </span>
                      {pkg.popular && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A35A] bg-[#5C3A1E] px-2 py-0.5 rounded-full">
                          Most Popular
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-xl text-[#0F172A] group-hover:text-[#5C3A1E] transition-colors">
                        {pkg.name}
                      </h4>
                      <p className="font-serif font-bold text-2xl text-[#5C3A1E] mt-1">
                        {formatCurrencyINR(pkg.numericPrice)}
                      </p>
                      <p className="text-xs text-[#64748B] leading-relaxed mt-2 line-clamp-2">
                        {pkg.description}
                      </p>
                    </div>

                    {/* Features list */}
                    <div className="space-y-1.5 pt-2 border-t border-[#EADFCB]/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A98B57] block">
                        Included Deliverables:
                      </span>
                      <ul className="space-y-1 text-xs text-[#475569]">
                        {(pkg.features || pkg.deliverables || []).slice(0, 5).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0 mt-0.5" />
                            <span className="leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-[#EADFCB]/60 flex items-center justify-between text-[11px] text-[#64748B]">
                      <span>Turnaround:</span>
                      <span className="font-medium text-[#0F172A]">{pkg.turnaround}</span>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-[#EADFCB]/60 flex flex-col gap-3">
                    <Link href={`/orders?package=${pkg.id}`} className="block w-full">
                      <Button
                        variant={pkg.popular ? "primary" : "secondary"}
                        size="sm"
                        className="w-full justify-center text-xs font-semibold"
                        withArrow
                      >
                        {pkg.ctaText}
                      </Button>
                    </Link>
                    <p className="text-xs text-[#64748B] text-center font-medium leading-relaxed">
                      {pkg.turnaround} SLA • Google Drive Vault
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subsection 2: Standalone Deliverable Packs */}
          <div className="space-y-8 pt-8 border-t border-[#EADFCB]">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
                HIGH VELOCITY PACKS
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
                Essential Deliverable Packs
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Curated multi-asset packs for rapid social media content drops, promo reels, and swipe carousels.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
              {APPROVED_STANDALONE_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className="rounded-3xl p-6 bg-[#FFFDF9] border border-[#EADFCB] hover:border-[#D4A35A] transition-all flex flex-col justify-between shadow-xs group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-lg text-[#0F172A] group-hover:text-[#5C3A1E] transition-colors">
                        {pkg.name}
                      </h4>
                      <span className="font-serif font-bold text-xl text-[#5C3A1E]">
                        {formatCurrencyINR(pkg.numericPrice)}
                      </span>
                    </div>

                    <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                      {pkg.description}
                    </p>

                    {/* Deliverable Specifications */}
                    <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-1 text-xs">
                      <div className="flex items-center justify-between font-semibold text-[#0F172A]">
                        <span>Quantity:</span>
                        <span className="text-[#5C3A1E] font-bold">{pkg.quantity} Deliverables</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                        <span>Price Display:</span>
                        <span className="font-mono font-medium">{pkg.priceDisplay}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                        <span>Turnaround SLA:</span>
                        <span className="font-medium text-[#0F172A]">{pkg.turnaround}</span>
                      </div>
                    </div>

                    {/* Deliverable Checklist */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A98B57] block">
                        Included in Bundle:
                      </span>
                      <ul className="space-y-1 text-xs text-[#475569]">
                        {pkg.deliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0 mt-0.5" />
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Revision limits & Exclusions */}
                    <div className="pt-2 border-t border-[#EADFCB]/60 space-y-1 text-[11px] text-[#64748B]">
                      <div className="flex items-center justify-between">
                        <span>Revision Limit:</span>
                        <span className="font-medium text-[#0F172A]">{pkg.revisionPolicy}</span>
                      </div>
                      {pkg.exclusions && pkg.exclusions.length > 0 && (
                        <div className="pt-1 text-[10px] text-[#DC2626]">
                          {pkg.exclusions.map((ex, idx) => (
                            <p key={idx} className="flex items-center gap-1 truncate">
                              <span className="font-bold">✕</span>
                              <span>{ex}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-[#EADFCB]/60 flex flex-col gap-4">
                    <Link href={`/orders?package=${pkg.id}`} className="block w-full">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full justify-center text-xs font-semibold"
                        withArrow
                      >
                        {pkg.ctaText}
                      </Button>
                    </Link>
                    <p className="text-xs text-[#64748B] text-center font-medium leading-relaxed">
                      {pkg.turnaround} SLA • Google Drive
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
