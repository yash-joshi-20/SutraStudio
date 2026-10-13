"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  APPROVED_MONTHLY_PACKAGES,
  APPROVED_COMMISSION_PACKAGES,
  APPROVED_STANDALONE_PACKAGES,
  type RetainerPackage,
  type CommissionPackage,
  type StandaloneDeliverablePackage,
} from "@/config/packages";
import { formatCurrencyINR } from "@/config/services";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import {
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  Search,
  Layers,
  Clock,
  ShieldCheck,
  Calendar,
  Box,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PACKAGE_CATEGORIES = [
  { value: "All", label: "All Packages" },
  { value: "monthly", label: "30-Day Retainers" },
  { value: "bundles", label: "Curated Bundles" },
  { value: "packs", label: "Deliverable Packs" },
];

export default function PackagesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const monthlyPackages = APPROVED_MONTHLY_PACKAGES;
  const bundlePackages = APPROVED_COMMISSION_PACKAGES.filter((p) => p.numericPrice > 0);
  const standalonePacks = APPROVED_STANDALONE_PACKAGES;

  const matchesSearch = (title: string, desc: string, features: string[]) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      title.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q) ||
      features.some((f) => f.toLowerCase().includes(q))
    );
  };

  const showMonthly =
    (activeCategory === "All" || activeCategory === "monthly") &&
    monthlyPackages.some((p) => matchesSearch(p.name, p.description, p.features));

  const showBundles =
    (activeCategory === "All" || activeCategory === "bundles") &&
    bundlePackages.some((p) => matchesSearch(p.name, p.description, p.features));

  const showPacks =
    (activeCategory === "All" || activeCategory === "packs") &&
    standalonePacks.some((p) => matchesSearch(p.name, p.description, p.deliverables));

  return (
    <div className="flex-1 flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      <main id="main-content" className="flex-1 pb-28 sm:pb-16">
        {/* Background Lotus Watermark */}
        <div className="absolute top-10 right-10 -z-10 opacity-[0.03] pointer-events-none">
          <LotusSymbol className="w-[700px] h-[700px]" color="gold" />
        </div>

        {/* 1. Header & Filters */}
        <section className="pt-12 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
              <span className="text-[#D4A35A] text-xs">◆</span>
              <span className="text-[10px] md:text-xs font-semibold tracking-[0.22em] text-[#5C3A1E] uppercase">
                Curated Studio Bundles &amp; Retainers
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] text-[#0F172A]">
              Curated Production <span className="text-gold-gradient">Packages</span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed font-sans">
              Save time and budget with comprehensive creative packages combining visual assets,
              video reels, brand systems, and continuous monthly active production queues.
            </p>

            {/* Search & Category Filter System */}
            <div className="pt-4 max-w-2xl mx-auto space-y-3">
              <div className="relative w-full flex items-center">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search package, deliverables, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A] focus:ring-2 focus:ring-[#D4A35A]/30 transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 text-xs font-semibold text-[#94A3B8] hover:text-[#0F172A] cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Mobile View: Custom Dropdown */}
              <div className="w-full md:hidden">
                <CustomDropdown
                  options={PACKAGE_CATEGORIES.map((c) => ({
                    label: c.label,
                    value: c.value,
                  }))}
                  value={activeCategory}
                  onChange={setActiveCategory}
                  placeholder="Filter by Package Type"
                  buttonClassName="!rounded-full !bg-[#FFFDF9] !border-[#EADFCB] py-2.5 shadow-xs"
                />
              </div>

              {/* Desktop View: Pill System */}
              <div className="hidden md:flex flex-wrap items-center justify-center gap-2 pt-1">
                {PACKAGE_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setActiveCategory(cat.value)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                        isActive
                          ? "bg-[#5C3A1E] text-white border-[#5C3A1E] shadow-xs"
                          : "bg-[#FFFDF9] text-[#64748B] border-[#EADFCB] hover:border-[#D4A35A] hover:text-[#0F172A]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Package Listings */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-16">
          {/* SECTION A: 30-Day Retainer Packages */}
          {showMonthly && (
            <div className="space-y-6">
              <div className="border-b border-[#EADFCB] pb-3 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A98B57]">
                    Flagship Subscriptions
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#0F172A]">
                    30-Day Creative Retainer Packages
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1">
                    Continuous creative pipeline with daily trend research, customized art direction, and private cloud storage.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#94A3B8]">
                  {monthlyPackages.length} packages
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {monthlyPackages
                  .filter((p) => matchesSearch(p.name, p.description, p.features))
                  .map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`relative flex flex-col justify-between rounded-3xl bg-[#FFFDF9] border p-6 transition-all duration-300 hover:shadow-warm-hover ${
                        pkg.popular
                          ? "border-[#D4A35A] ring-2 ring-[#D4A35A]/20 shadow-warm"
                          : "border-[#EADFCB] hover:border-[#D4A35A]"
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-[#5C3A1E] text-[#D4A35A] font-mono text-[10px] font-bold tracking-wider uppercase shadow-xs">
                          Studio Flagship
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#A98B57] font-semibold">
                            {pkg.dailyDeliverables}
                          </span>
                          <h3 className="font-serif text-2xl font-bold text-[#0F172A]">
                            {pkg.name}
                          </h3>
                          <p className="text-xs text-[#64748B] leading-relaxed">
                            {pkg.description}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                            Investment (30 Days)
                          </span>
                          <span className="font-serif text-3xl font-bold text-[#5C3A1E] block">
                            {pkg.formattedPrice}
                          </span>
                          <span className="text-[10px] text-[#A98B57] font-medium block">
                            {pkg.monthlyQuotaDescription}
                          </span>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-[#EADFCB]/60">
                          <span className="text-[10px] uppercase font-bold text-[#0F172A] tracking-wider block">
                            What&apos;s Included:
                          </span>
                          {pkg.features.slice(0, 5).map((f, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-[#475569]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 mt-6 border-t border-[#EADFCB]/60 flex items-center justify-between gap-3">
                        <Link
                          href={`/packages/${pkg.slug}`}
                          className="text-xs font-semibold text-[#5C3A1E] hover:underline"
                        >
                          View Breakdown
                        </Link>
                        <Link
                          href={`/new-order?package=${pkg.slug}`}
                          className="inline-flex items-center justify-center whitespace-nowrap min-h-[38px] px-4 py-2 rounded-xl bg-[#5C3A1E] text-white hover:bg-[#4A2E17] text-xs font-semibold gap-1 transition-all shadow-xs"
                        >
                          <span>Order Package</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* SECTION B: Curated Multi-Service Bundles */}
          {showBundles && (
            <div className="space-y-6">
              <div className="border-b border-[#EADFCB] pb-3 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A98B57]">
                    Curated Multi-Service Solutions
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#0F172A]">
                    Multi-Format Creative &amp; Engineering Bundles
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1">
                    Integrated bundles combining logo systems, marketing campaigns, 3D spatial renders, and full-stack web platforms.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#94A3B8]">
                  {bundlePackages.length} bundles
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bundlePackages
                  .filter((p) => matchesSearch(p.name, p.description, p.features))
                  .map((pkg) => (
                    <div
                      key={pkg.id}
                      className="flex flex-col justify-between rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 hover:border-[#D4A35A] transition-all duration-300 hover:shadow-warm-hover"
                    >
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#A98B57] font-semibold">
                            {pkg.turnaround}
                          </span>
                          <h3 className="font-serif text-xl font-bold text-[#0F172A]">
                            {pkg.name}
                          </h3>
                          <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                            {pkg.description}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                            Bundle Price
                          </span>
                          <span className="font-serif text-2xl font-bold text-[#5C3A1E] block">
                            {pkg.formattedPrice}
                          </span>
                          <span className="text-[10px] text-[#64748B] block truncate">
                            {pkg.tagline}
                          </span>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-[#EADFCB]/60">
                          <span className="text-[10px] uppercase font-bold text-[#0F172A] tracking-wider block">
                            Included in Bundle:
                          </span>
                          {pkg.deliverables.slice(0, 4).map((d, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-[#475569]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 mt-6 border-t border-[#EADFCB]/60 flex items-center justify-between gap-3">
                        <Link
                          href={`/packages/${pkg.slug}`}
                          className="text-xs font-semibold text-[#5C3A1E] hover:underline"
                        >
                          View Breakdown
                        </Link>
                        <Link
                          href={`/new-order?package=${pkg.slug}`}
                          className="inline-flex items-center justify-center whitespace-nowrap min-h-[38px] px-4 py-2 rounded-xl bg-[#5C3A1E] text-white hover:bg-[#4A2E17] text-xs font-semibold gap-1 transition-all shadow-xs"
                        >
                          <span>Order Bundle</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* SECTION C: Essential Standalone Deliverable Packs */}
          {showPacks && (
            <div className="space-y-6">
              <div className="border-b border-[#EADFCB] pb-3 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A98B57]">
                    High-Velocity Bundles
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#0F172A]">
                    Essential Deliverable Packs
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1">
                    Value bundles of 3, 5, or 10 visual and video assets with rapid turnaround.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#94A3B8]">
                  {standalonePacks.length} packs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {standalonePacks
                  .filter((p) => matchesSearch(p.name, p.description, p.deliverables))
                  .map((pack) => (
                    <div
                      key={pack.id}
                      className="flex flex-col justify-between rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-5 hover:border-[#D4A35A] transition-all duration-300 hover:shadow-warm-hover"
                    >
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-[#A98B57] font-semibold">
                            {pack.estimatedTurnaround}
                          </span>
                          <h4 className="font-serif text-base font-bold text-[#0F172A] leading-snug">
                            {pack.name}
                          </h4>
                          <p className="text-xs text-[#64748B] line-clamp-2">
                            {pack.description}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]">
                          <span className="font-serif text-xl font-bold text-[#5C3A1E] block">
                            {pack.priceDisplay}
                          </span>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-[#EADFCB]/60 text-xs text-[#475569]">
                          {pack.deliverables.slice(0, 2).map((d, i) => (
                            <div key={i} className="flex items-center gap-1.5 truncate">
                              <CheckCircle2 className="w-3 h-3 text-[#2E7D4F] shrink-0" />
                              <span className="truncate">{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#EADFCB]/60">
                        <Link
                          href={`/new-order?package=${pack.slug}`}
                          className="w-full inline-flex items-center justify-center whitespace-nowrap min-h-[36px] px-3 py-1.5 rounded-xl bg-[#5C3A1E] text-white hover:bg-[#4A2E17] text-xs font-semibold gap-1 transition-all shadow-xs"
                        >
                          <span>Order Pack</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
