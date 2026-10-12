"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  Check,
  ShieldCheck,
  Clock,
  HardDrive,
  HelpCircle,
  Bot,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import {
  APPROVED_MONTHLY_PACKAGES,
  APPROVED_STANDALONE_PACKAGES,
} from "@/config/packages";
import {
  CANONICAL_SERVICES,
  formatCurrencyINR,
} from "@/config/services";


const SERVICE_CATEGORY_TABS = [
  "All",
  "Image",
  "Video",
  "3D & Spatial",
  "Design",
  "Marketing",
  "Development",
];

const FAQS = [
  {
    q: "What is your revision policy?",
    a: "Every deliverable across our retainer plans and standalone packs includes 1 consolidated revision round overseen directly by our Principal Art Director. You can annotate feedback, request lighting/palette passes, or submit copy revisions through your client portal with guaranteed SLA turnaround.",
  },
  {
    q: "How does the Daily Trend Creator flagship package work?",
    a: "Daily Trend Creator (₹19,999 / 30 days) operates as your dedicated daily active creative queue. Every single day for 30 days, we conduct daily trend research, develop brand-aligned creative direction, produce 1 custom 4K image + 1 commercial short video/reel, perform rigorous QA, and deliver directly to your private Google Drive vault.",
  },
  {
    q: "Do I own full commercial rights to the deliverables?",
    a: "Yes. All creative visuals, video reels, 3D assets, copy decks, and web prototype deliverables come with irrevocable 100% commercial usage licensing and zero ongoing royalty fees.",
  },
  {
    q: "What is explicitly excluded from your standard pricing?",
    a: "Our transparent pricing covers digital creative production, creative direction & content planning, audio sync, color grading, and QA. Paid advertising budget/ad spend, on-location physical videography shoots, on-camera actors or voiceover talent fees, and multi-tenant enterprise server infrastructure are excluded unless explicitly agreed in a custom Statement of Work.",
  },
  {
    q: "How are payments processed?",
    a: "Orders are secured via direct Google Pay (GPay) or UPI QR payment settlement upon scope confirmation. Simply submit your bank UTR transaction reference to initiate instant production staging.",
  },
  {
    q: "Can I order standalone single deliverables without a monthly retainer?",
    a: "Absolutely. You can order single graphics from ₹99, video edits from ₹199, or rapid deliverable packs (such as 3 images for ₹249 or 3 reels for ₹1,299) on an individual per-project basis whenever you need them.",
  },
];

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<"monthly" | "services" | "packs">("monthly");
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>("All");

  // Sync tab with URL search parameter if provided (e.g. ?cycle=monthly, ?tab=packs, ?cycle=project)
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

  const filteredStandaloneServices = CANONICAL_SERVICES.filter((s) => {
    if (!s.active) return false;
    if (selectedServiceCategory === "All") return true;
    if (selectedServiceCategory === "3D & Spatial") return s.category === "3D & Spatial";
    return s.category.toLowerCase() === selectedServiceCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-28 sm:py-16 w-full flex flex-col items-center justify-center space-y-16">
        {/* Intro Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 w-full flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
            <span className="text-[#D4A35A] text-xs">◆</span>
            <span className="text-[10px] md:text-xs font-semibold tracking-[0.22em] text-[#5C3A1E] uppercase">
              CANONICAL STUDIO PRICING
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#0F172A] leading-[1.1]">
            Transparent Investment, <span className="text-gold-gradient">Guaranteed Excellence</span>
          </h1>

          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-2xl">
            Clean, fixed-rate creative technology commissions with zero hidden surprises. Every deliverable produced under senior art direction and delivered to your private Google Drive vault.
          </p>

          {/* Primary Catalog Navigation Switcher */}
          <div className="pt-4 flex items-center justify-center w-full">
            <div
              role="tablist"
              aria-label="Pricing catalog navigation"
              className="grid grid-cols-3 w-full max-w-xs sm:max-w-xl rounded-2xl sm:rounded-full bg-[#FFFDF9] border border-[#EADFCB] p-1.5 shadow-xs gap-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "monthly"}
                onClick={() => setActiveTab("monthly")}
                className={`py-2 px-2 sm:px-4 rounded-xl sm:rounded-full text-xs font-semibold cursor-pointer transition-all text-center flex items-center justify-center gap-1.5 ${
                  activeTab === "monthly"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <span>30-Day Retainers</span>
                <span className="text-[10px] bg-[#D4A35A] text-[#0F172A] px-1.5 py-0.2 rounded-full font-bold hidden sm:inline">
                  Flagship
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "services"}
                onClick={() => setActiveTab("services")}
                className={`py-2 px-2 sm:px-4 rounded-xl sm:rounded-full text-xs font-semibold cursor-pointer transition-all text-center ${
                  activeTab === "services"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Individual Services
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "packs"}
                onClick={() => setActiveTab("packs")}
                className={`py-2 px-2 sm:px-4 rounded-xl sm:rounded-full text-xs font-semibold cursor-pointer transition-all text-center ${
                  activeTab === "packs"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Bulk Deliverable Packs
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION A: 30-DAY MONTHLY RETAINER PACKAGES
            ========================================================================= */}
        {activeTab === "monthly" && (
          <section className="w-full space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
                CONTINUOUS CREATIVE PRODUCTION
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
                Approved 30-Day Subscription Retainers
              </h2>
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
                        <h3 className="font-serif text-2xl font-bold text-[#0F172A]">
                          {tier.name}
                        </h3>
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
                            <span>Daily Trend Research & Hook Discovery</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                            <span className="w-4 h-4 rounded-full bg-[#5C3A1E] text-white text-[9px] flex items-center justify-center font-bold">2</span>
                            <span>Brand Creative Direction & Content Planning</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                            <span className="w-4 h-4 rounded-full bg-[#5C3A1E] text-white text-[9px] flex items-center justify-center font-bold">3</span>
                            <span>Dual Asset Production (1 Image + 1 Video)</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                            <span className="w-4 h-4 rounded-full bg-[#5C3A1E] text-white text-[9px] flex items-center justify-center font-bold">4</span>
                            <span>Human Art Director QA & Verification</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium text-[#0F172A]">
                            <span className="w-4 h-4 rounded-full bg-[#5C3A1E] text-white text-[9px] flex items-center justify-center font-bold">5</span>
                            <span>Private Google Drive Vault Delivery</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Deliverables Checklist */}
                    <div className="space-y-2.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#A98B57] block">
                        Included Deliverables:
                      </span>
                      <ul className="space-y-2 text-xs text-[#475569]">
                        {tier.deliverables.slice(0, 6).map((item) => (
                          <li key={item} className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-[#EDF7F0] text-[#2E7D4F] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Revision Policy & Turnaround */}
                    <div className="pt-2 border-t border-[#EADFCB]/60 space-y-1.5 text-[11px] text-[#64748B]">
                      <div className="flex items-center justify-between">
                        <span>Revision Limit:</span>
                        <span className="font-semibold text-[#0F172A]">{tier.revisionPolicy}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Turnaround SLA:</span>
                        <span className="font-semibold text-[#0F172A]">{tier.estimatedTurnaround}</span>
                      </div>
                    </div>

                    {/* Exclusions */}
                    <div className="pt-2 border-t border-[#EADFCB]/60 space-y-1 text-[11px] text-[#DC2626]">
                      <span className="font-semibold text-[10px] uppercase tracking-wider text-[#A98B57] block">
                        Package Exclusions:
                      </span>
                      {tier.exclusions.map((ex, idx) => (
                        <p key={idx} className="flex items-center gap-1.5">
                          <span className="text-[12px] font-bold">✕</span>
                          <span>{ex}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Card CTA */}
                  <div className="mt-8 pt-6 border-t border-[#EADFCB]/60 space-y-2">
                    <Link href={`/orders?package=${tier.id}&cycle=monthly`} className="block">
                      <Button
                        variant={tier.popular ? "primary" : "secondary"}
                        size="md"
                        className="w-full justify-center text-xs font-semibold"
                        withArrow
                      >
                        {tier.ctaText}
                      </Button>
                    </Link>
                    <p className="text-[10px] text-[#94A3B8] text-center">
                      Direct Google Pay / UPI QR Settlement
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================================
            SECTION B: INDIVIDUAL STANDALONE SERVICES
            ========================================================================= */}
        {activeTab === "services" && (
          <section className="w-full space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
                SINGLE COMMISSIONS
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
                Canonical Standalone Services
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Order individual single deliverables on demand with transparent fixed pricing and guaranteed studio SLA.
              </p>

              {/* Service Category Filters */}
              <div className="pt-4 flex items-center justify-center flex-wrap gap-2">
                {SERVICE_CATEGORY_TABS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedServiceCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <h3 className="font-serif text-xl font-bold text-[#0F172A] group-hover:text-[#5C3A1E] transition-colors">
                        {service.name}
                      </h3>
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

                    {/* Metadata & Limits */}
                    <div className="pt-2 border-t border-[#EADFCB]/60 space-y-1 text-[11px] text-[#64748B]">
                      <div className="flex items-center justify-between">
                        <span>Quantity:</span>
                        <span className="font-semibold text-[#0F172A]">{service.quantity} Deliverable</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Revision Limit:</span>
                        <span className="font-semibold text-[#0F172A]">{service.revisionPolicy}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Turnaround SLA:</span>
                        <span className="font-semibold text-[#0F172A]">{service.estimatedTurnaround}</span>
                      </div>
                    </div>

                    {/* Exclusions */}
                    {service.exclusions && service.exclusions.length > 0 && (
                      <div className="pt-2 border-t border-[#EADFCB]/60 space-y-0.5 text-[10px] text-[#DC2626]">
                        <span className="font-semibold text-[10px] uppercase tracking-wider text-[#A98B57] block">
                          Exclusions:
                        </span>
                        {service.exclusions.map((ex, idx) => (
                          <p key={idx} className="flex items-center gap-1 truncate">
                            <span className="font-bold">✕</span>
                            <span>{ex}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action CTA */}
                  <div className="pt-5 mt-4 border-t border-[#EADFCB]/60 flex items-center gap-2">
                    <Link href={`/orders?service=${service.slug}`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full justify-center text-xs">
                        {service.isCustomQuote ? "Inquire Scope" : `Order ${formatCurrencyINR(service.numericPrice)}`}
                      </Button>
                    </Link>
                    <Link href={`/services#${service.slug}`} className="shrink-0" title="Inspect Specifications">
                      <Button variant="outline" size="sm" className="px-2.5 text-xs">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================================
            SECTION C: BULK DELIVERABLE PACKS
            ========================================================================= */}
        {activeTab === "packs" && (
          <section className="w-full space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
                RAPID TURNAROUND PACKS
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
                Approved Standalone Deliverable Packs
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]">
                High-volume deliverable bundles for social campaigns, multi-angle product tests, and weekly editorial schedules.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {APPROVED_STANDALONE_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className="rounded-3xl p-6 bg-[#FFFDF9] border border-[#EADFCB] hover:border-[#D4A35A] transition-all flex flex-col justify-between shadow-xs group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-lg text-[#0F172A] group-hover:text-[#5C3A1E] transition-colors">
                        {pkg.name}
                      </span>
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

                  <div className="pt-5 mt-4 border-t border-[#EADFCB]/60">
                    <Link href={`/orders?package=${pkg.id}`} className="block">
                      <Button variant="secondary" size="sm" className="w-full justify-center text-xs font-semibold" withArrow>
                        {pkg.ctaText}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================================
            SCOPE BOUNDARIES & PRODUCTION EXCLUSIONS POLICY
            ========================================================================= */}
        <section className="w-full p-6 sm:p-8 rounded-3xl bg-[#FFFDF9] border-2 border-[#EADFCB] space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#A98B57]">
            <ShieldAlert className="w-4 h-4 text-[#C2761A]" />
            <span>Studio Production Scope &amp; Exclusion Guardrails</span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Sutra Studio delivers senior art-directed digital creative assets, creative direction &amp; content planning, color grading, sound synchronization, and web architecture. To protect commercial transparency, the following items are <strong>strictly excluded</strong> from all standard catalog rates and retainers:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs text-[#475569]">
            <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-start gap-2">
              <span className="text-[#DC2626] font-bold text-sm shrink-0">✕</span>
              <div>
                <strong className="text-[#0F172A] block">Paid Advertising Media Spend</strong>
                <span>All ad placements (Meta, Google, TikTok, YouTube) are billed directly to client accounts.</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-start gap-2">
              <span className="text-[#DC2626] font-bold text-sm shrink-0">✕</span>
              <div>
                <strong className="text-[#0F172A] block">Physical On-Site Video Crews</strong>
                <span>On-location camera crews and physical production sets are excluded unless agreed in bespoke quote.</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-start gap-2">
              <span className="text-[#DC2626] font-bold text-sm shrink-0">✕</span>
              <div>
                <strong className="text-[#0F172A] block">Actor &amp; Talent Licensing Fees</strong>
                <span>On-camera actor appearance fees and third-party celebrity voice talent licensing fees are excluded.</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-start gap-2">
              <span className="text-[#DC2626] font-bold text-sm shrink-0">✕</span>
              <div>
                <strong className="text-[#0F172A] block">Third-Party Stock Subscriptions</strong>
                <span>Specialized proprietary commercial font licenses and niche archival stock purchases are excluded.</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-start gap-2">
              <span className="text-[#DC2626] font-bold text-sm shrink-0">✕</span>
              <div>
                <strong className="text-[#0F172A] block">Raw Working Project Files</strong>
                <span>Unrendered Premiere, After Effects, and 3D project source scene files are excluded (master exports provided).</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-start gap-2">
              <span className="text-[#DC2626] font-bold text-sm shrink-0">✕</span>
              <div>
                <strong className="text-[#0F172A] block">Custom Multi-Tenant Enterprise Backend</strong>
                <span>Custom database microservices and multi-tenant ERP setups require specialized solution scoping.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Studio Service Guarantees Strip */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF9F5] border border-[#EADFCB] grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#64748B] w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#EADFCB] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#2E7D4F]" />
            </div>
            <div>
              <h5 className="font-semibold text-[#0F172A] text-sm">Full Commercial License</h5>
              <p className="text-[11px] mt-0.5">Irrevocable rights with zero ongoing royalty fees.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#EADFCB] flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5 text-[#5C3A1E]" />
            </div>
            <div>
              <h5 className="font-semibold text-[#0F172A] text-sm">Client Deliverables Archive</h5>
              <p className="text-[11px] mt-0.5">Permanent private Google Drive Vault staging.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#EADFCB] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#C2761A]" />
            </div>
            <div>
              <h5 className="font-semibold text-[#0F172A] text-sm">Guaranteed Turnaround SLA</h5>
              <p className="text-[11px] mt-0.5">Rapid 24–48h SLA with dedicated Art Director review.</p>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-10 space-y-8 w-full">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
              CLARITY &amp; ASSURANCE
            </span>
            <h2 className="font-serif text-3xl font-semibold text-[#0F172A]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Everything you need to know about our commissioning workflow, deliverables, and production guarantees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-2"
              >
                <div className="flex items-center gap-2 text-[#5C3A1E] font-serif font-semibold text-sm">
                  <HelpCircle className="w-4 h-4 text-[#A98B57] shrink-0" />
                  <span>{faq.q}</span>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Scope CTA */}
        <div className="text-center max-w-3xl mx-auto p-8 sm:p-12 rounded-3xl bg-[#FAF9F5] border border-[#EADFCB] space-y-5 w-full">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
            BESPOKE REQUIREMENTS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
            Need a Specialized Commission or Custom Scope?
          </h2>
          <p className="text-sm text-[#64748B] max-w-xl mx-auto leading-relaxed">
            We partner with luxury architecture studios, heritage brands, and fast-growing businesses requiring cross-discipline creative technology.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md mx-auto sm:max-w-none">
            <Link href="/contact" className="w-full sm:w-auto">
              <Button variant="primary" size="md" withArrow className="w-full sm:w-auto justify-center shadow-warm">
                Request Custom Proposal
              </Button>
            </Link>
            <Link href="/chat" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Bot className="w-4 h-4 text-[#D4A35A]" />}
                className="w-full sm:w-auto justify-center"
              >
                Chat with Studio Concierge
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
