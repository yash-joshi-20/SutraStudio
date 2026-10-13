"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { VideoCard } from "@/components/media/VideoCard";
import { SUTRA_SERVICES } from "@/data/servicesData";
import {
  findServiceBySlug,
  getServiceDetailSpec,
  type CanonicalServiceItem,
} from "@/config/services";
import {
  SERVICE_CATALOG_GROUPS,
  type ServiceCatalogGroup,
  type ServiceCatalogEntry,
  getPriceBadge,
  formatCurrencyINR,
  computeItemTotal,
} from "@/config/serviceGroups";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { Interactive3DViewer } from "@/components/spatial/Interactive3DViewer";
import { PanoramicTourViewer } from "@/components/spatial/PanoramicTourViewer";
import { DeviceMockupShowcase } from "@/components/showcase/DeviceMockupShowcase";
import { MetaAdCreativeMockup } from "@/components/showcase/MetaAdCreativeMockup";
import {
  Image as ImageIcon,
  Box,
  Compass,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Shield,
  Search,
  Sparkles,
  Bot,
  Play,
  FileText,
  AlertCircle,
  HelpCircle,
  Layers,
  Minus,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Public disciplines used for deep-link resolution (?service= / #hash) only —
 * the purchasable catalog itself is rendered from SERVICE_CATALOG_GROUPS.
 */
const publicServices = SUTRA_SERVICES.filter((s) => s.active !== false);

/** Customer-facing catalog filters — grouped by what the customer wants to buy. */
const CATEGORIES = [
  { value: "All", label: "All Services" },
  { value: "logo-brand", label: "Logo & Brand" },
  { value: "ads-graphics", label: "Ads & Graphics" },
  { value: "video-reels", label: "Video & Reels" },
  { value: "spatial-3d", label: "3D & 360°" },
  { value: "web-digital", label: "Web & Digital" },
];

function matchesSearch(entry: ServiceCatalogEntry, query: string): boolean {
  if (!query) return true;
  const needle = query.toLowerCase();
  return (
    entry.item.name.toLowerCase().includes(needle) ||
    entry.item.tagline.toLowerCase().includes(needle) ||
    entry.item.description.toLowerCase().includes(needle) ||
    entry.item.deliverables.some((d) => d.toLowerCase().includes(needle))
  );
}

/* ============================================================================
   SERVICE CARD — minimal editorial card with verified price + quantity options
   ============================================================================ */
function ServiceCatalogCard({
  entry,
  onOpenDetail,
}: {
  entry: ServiceCatalogEntry;
  onOpenDetail: (service: CanonicalServiceItem) => void;
}) {
  const [optionIndex, setOptionIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const selectedOption = entry.options[optionIndex];
  const service = selectedOption ? selectedOption.item : entry.item;

  const hasOptions = entry.options.length > 1;
  const allowQuantity = !hasOptions && service.pricingType === "per_unit";
  const qty = allowQuantity ? Math.max(1, quantity) : 1;
  const total = computeItemTotal(service, qty);

  const rawHref = service.ctaHref || `/orders?service=${service.slug}`;
  const orderHref =
    qty > 1
      ? `${rawHref}${rawHref.includes("?") ? "&" : "?"}qty=${qty}`
      : rawHref;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] overflow-hidden transition-all duration-300 hover:border-[#D4A35A] hover:shadow-warm-hover"
    >
      {/* Media */}
      <div
        onClick={() => onOpenDetail(service)}
        className="relative aspect-[16/10] w-full overflow-hidden bg-[#F4EFE6] cursor-pointer"
      >
        <Image
          src={service.thumbnail}
          alt={service.name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Clear sample watermark */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[9px] font-mono font-medium text-white/90 tracking-wider uppercase border border-white/10">
            Studio Sample
          </span>
        </div>

        {/* Turnaround */}
        <div className="absolute top-3.5 right-3.5 z-10">
          <span className="rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-mono font-medium text-[#5C3A1E] border border-[#EADFCB] shadow-xs flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-[#A98B57]" />
            {service.turnaround.split(" ")[0]}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        <div className="absolute bottom-2.5 left-3.5 right-3.5 z-10 flex items-center justify-between gap-2 text-[10px] text-[#F8F5EF]/90">
          <span className="truncate">{service.mediaFormat || service.duration}</span>
          <span className="text-[#D4A35A] font-semibold shrink-0 whitespace-nowrap">
            {service.badge}
          </span>
        </div>
      </div>

      {/* Title, price & scope */}
      <div className="p-5 pb-3 space-y-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3
            onClick={() => onOpenDetail(service)}
            className="font-serif text-lg font-semibold text-[#0F172A] tracking-tight group-hover:text-[#5C3A1E] transition-colors leading-snug cursor-pointer"
          >
            {service.name}
          </h3>
          <button
            type="button"
            onClick={() => onOpenDetail(service)}
            title="Inspect Scope & Specifications"
            className="inline-flex items-center justify-center whitespace-nowrap min-h-[32px] px-3 py-1 rounded-xl bg-[#F8F5EF] text-[#5C3A1E] border border-[#EADFCB] hover:border-[#D4A35A] transition-colors cursor-pointer text-xs font-medium shrink-0"
          >
            Details
          </button>
        </div>

        {/* Verified price — single pricing block per card */}
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-mono block">
              {getPriceBadge(service)}
            </span>
            <span className="font-serif text-xl font-bold text-[#5C3A1E] block leading-tight">
              {service.priceDisplay}
            </span>
          </div>

          {allowQuantity && (
            <div className="flex items-center gap-1 rounded-xl border border-[#EADFCB] bg-[#FAF9F5] p-1 shrink-0">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5C3A1E] hover:bg-[#F4EFE6] disabled:opacity-35 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-mono font-bold text-[#0F172A]">
                {qty}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                disabled={qty >= 20}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5C3A1E] hover:bg-[#F4EFE6] disabled:opacity-35 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
          {service.description}
        </p>

        {/* What's included */}
        <div className="space-y-1.5 pt-3 border-t border-[#EADFCB]/50">
          {service.deliverables.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-[11px] text-[#475569]"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0" />
              <span className="truncate">{item}</span>
            </div>
          ))}
        </div>

        {/* Quantity / pack options (real canonical SKUs) */}
        {hasOptions && (
          <div className="pt-3 border-t border-[#EADFCB]/50 space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A98B57]">
              Choose quantity
            </span>
            <div className="flex flex-wrap gap-1.5">
              {entry.options.map((option, idx) => {
                const isActive = optionIndex === idx;
                return (
                  <button
                    key={option.item.slug}
                    type="button"
                    onClick={() => setOptionIndex(idx)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all border cursor-pointer ${
                      isActive
                        ? "bg-[#5C3A1E] text-white border-[#5C3A1E] shadow-xs"
                        : "bg-[#FFFFFF] text-[#475569] border-[#EADFCB] hover:border-[#D4A35A]"
                    }`}
                  >
                    {option.label}
                    <span
                      className={`block text-[10px] font-mono ${
                        isActive ? "text-[#D4A35A]" : "text-[#94A3B8]"
                      }`}
                    >
                      {formatCurrencyINR(option.item.numericPrice)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-[11px] text-[#94A3B8] font-mono pt-1 mt-auto">
          {service.turnaround} • {service.revisionPolicy}
        </div>
      </div>

      {/* Footer: live total + order CTA */}
      <div className="p-4 pt-3 border-t border-[#EADFCB]/60 bg-[#FAF9F5]/70 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] text-[#94A3B8] uppercase block tracking-wider font-mono">
            {qty > 1 ? `Total (${qty} units)` : "Total"}
          </span>
          <span className="font-serif text-lg font-bold text-[#5C3A1E] whitespace-nowrap">
            {formatCurrencyINR(total)}
          </span>
        </div>

        <Link
          href={orderHref}
          className="shrink-0"
          title="Commission Service"
        >
          <span className="inline-flex items-center justify-center whitespace-nowrap min-h-[40px] px-4 py-2 rounded-xl bg-[#5C3A1E] text-white hover:bg-[#4A2E17] text-xs font-semibold gap-1 transition-all shadow-xs cursor-pointer">
            <span>Order Service</span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
          </span>
        </Link>
      </div>
    </motion.div>
  );
}

/* ============================================================================
   SERVICES CATALOG PAGE
   ============================================================================ */
export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] =
    useState<CanonicalServiceItem | null>(null);

  // Groups → entries, filtered by selected group and free-text search.
  const visibleGroups: ServiceCatalogGroup[] = useMemo(() => {
    return SERVICE_CATALOG_GROUPS.map((group) => ({
      ...group,
      entries:
        activeCategory === "All" || activeCategory === group.id
          ? group.entries.filter((entry) => matchesSearch(entry, searchQuery))
          : [],
    })).filter((group) => group.entries.length > 0);
  }, [activeCategory, searchQuery]);

  const resultCount = visibleGroups.reduce(
    (acc, group) => acc + group.entries.length,
    0
  );

  // URL state synchronization: supports direct navigation, reload, back/forward
  const syncFromUrl = useCallback(() => {
    if (typeof window === "undefined") return;

    // 1. Query param: ?service=...
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get("service");

    // 2. Hash: #...
    const hashParam = window.location.hash.replace(/^#/, "");

    // 3. Pathname segment: /services/:slug
    const pathSegments = window.location.pathname.split("/services/");
    const pathSlug = pathSegments.length > 1
      ? pathSegments[1].replace(/\/$/, "")
      : null;

    const targetSlug = serviceParam || hashParam || pathSlug;

    if (targetSlug) {
      const match =
        publicServices.find(
          (s) => s.slug === targetSlug || s.id === targetSlug
        ) || findServiceBySlug(targetSlug);

      if (match) {
        setSelectedService(match);
        const cardElem = document.getElementById(match.slug);
        if (cardElem) {
          cardElem.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    } else {
      setSelectedService(null);
    }
  }, []);

  useEffect(() => {
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    window.addEventListener("hashchange", syncFromUrl);
    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener("hashchange", syncFromUrl);
    };
  }, [syncFromUrl]);

  const handleOpenDetail = (service: CanonicalServiceItem) => {
    setSelectedService(service);
    if (typeof window !== "undefined") {
      const newUrl = `/services?service=${encodeURIComponent(service.slug)}`;
      window.history.pushState({ service: service.slug }, "", newUrl);
    }
  };

  const handleCloseDetail = () => {
    setSelectedService(null);
    if (typeof window !== "undefined") {
      const currentParams = new URLSearchParams(window.location.search);
      if (currentParams.has("service")) {
        currentParams.delete("service");
        const remainingQuery = currentParams.toString();
        const cleanUrl = remainingQuery
          ? `/services?${remainingQuery}`
          : "/services";
        window.history.pushState({}, "", cleanUrl);
      } else {
        window.history.pushState({}, "", "/services");
      }
    }
  };

  const selectedSpec = selectedService
    ? getServiceDetailSpec(selectedService)
    : null;

  return (
    <div className="flex-1 flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      <main id="main-content" className="flex-1 pb-28 sm:pb-16">
        {/* Subtle Background Lotus Watermark */}
        <div className="absolute top-10 right-10 -z-10 opacity-[0.03] pointer-events-none">
          <LotusSymbol className="w-[700px] h-[700px]" color="gold" />
        </div>

        {/* ===================================================
            1. HEADER INTRO & SEARCH BAR
            =================================================== */}
        <section className="pt-12 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
              <span className="text-[#D4A35A] text-xs">◆</span>
              <span className="text-[10px] md:text-xs font-semibold tracking-[0.22em] text-[#5C3A1E] uppercase">
                Service Catalog &amp; Transparent Pricing
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] text-[#0F172A]">
              What Would You Like to{" "}
              <span className="text-gold-gradient">Buy Today?</span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed font-sans">
              Every service listed with its real scope, verified price and a
              clear order button — no packages to decode, no hidden tiers.
            </p>

            {/* Filter Controls: Search & Responsive Filter System */}
            <div className="pt-4 max-w-2xl mx-auto space-y-3">
              {/* Search Input Bar */}
              <div className="relative w-full flex items-center">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search service, deliverable or keyword..."
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

              {/* Mobile View: Clean Custom Dropdown Filter */}
              <div className="w-full md:hidden">
                <CustomDropdown
                  options={CATEGORIES.map((cat) => ({
                    label: cat.label,
                    value: cat.value,
                    badge: `${
                      cat.value === "All"
                        ? SERVICE_CATALOG_GROUPS.reduce(
                            (acc, g) => acc + g.entries.length,
                            0
                          )
                        : SERVICE_CATALOG_GROUPS.find((g) => g.id === cat.value)
                            ?.entries.length ?? 0
                    }`,
                  }))}
                  value={activeCategory}
                  onChange={(val) => setActiveCategory(val)}
                  placeholder="Filter by Service Group"
                  buttonClassName="!rounded-full !bg-[#FFFDF9] !border-[#EADFCB] py-2.5 shadow-xs"
                />
              </div>

              {/* Desktop View: Tab Pills System */}
              <div className="hidden md:flex flex-wrap items-center justify-center gap-2 pt-1">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.value;
                  const count =
                    cat.value === "All"
                      ? SERVICE_CATALOG_GROUPS.reduce(
                          (acc, g) => acc + g.entries.length,
                          0
                        )
                      : SERVICE_CATALOG_GROUPS.find((g) => g.id === cat.value)
                          ?.entries.length ?? 0;

                  return (
                    <button
                      key={cat.value}
                      onClick={() => setActiveCategory(cat.value)}
                      className={`interactive-pill focus-ring px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                        isActive
                          ? "bg-[#5C3A1E] text-white shadow-xs border border-[#5C3A1E]"
                          : "bg-[#FFFDF9] text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A] hover:text-[#0F172A]"
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-[#F8F5EF] text-[#64748B]"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            2. GROUPED SERVICE CATALOG
            =================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-14">
          {resultCount === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-12 max-w-lg mx-auto space-y-4">
              <Search className="w-12 h-12 text-[#94A3B8] mx-auto opacity-50" />
              <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                No Services Found
              </h3>
              <p className="text-sm text-[#64748B]">
                No services matched &quot;{searchQuery}&quot;. Try resetting
                your filters.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {visibleGroups.map((group) => (
                <motion.section
                  key={group.id}
                  id={group.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 scroll-mt-24"
                >
                  {/* Group header */}
                  <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-[#EADFCB] pb-3">
                    <div className="space-y-1.5 max-w-3xl">
                      <span className="inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#A98B57]">
                        <span className="font-serif text-sm text-[#5C3A1E]">
                          {group.index}.
                        </span>
                        <span>{group.title}</span>
                      </span>
                      <p className="text-sm text-[#64748B]">{group.blurb}</p>
                    </div>
                    <span className="text-[11px] font-mono text-[#94A3B8] shrink-0">
                      {group.entries.length} service
                      {group.entries.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.entries.map((entry) => (
                      <ServiceCatalogCard
                        key={entry.slug}
                        entry={entry}
                        onOpenDetail={handleOpenDetail}
                      />
                    ))}
                  </div>
                </motion.section>
              ))}
            </AnimatePresence>
          )}
        </section>

        {/* ===================================================
            3. PRICING TRANSPARENCY NOTES
            =================================================== */}
        <section className="py-12 bg-[#FAF9F5] border-y border-[#EADFCB] mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A98B57]">
                How Our Pricing Works
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
                Simple, Honest &amp; Final Before You Pay
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#A98B57]" />
                </div>
                <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                  Starting Price vs Final Price
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Cards marked <strong className="text-[#5C3A1E]">Starting at</strong>{" "}
                  show the lowest price for the simplest scope — the exact total
                  for your brief is confirmed before production. Everything else
                  is a fixed, final price.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center">
                  <Layers className="w-5 h-5 text-[#5C3A1E]" />
                </div>
                <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                  Quantity &amp; Packs
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Choose 1, 3 or 5 image packs (and reel packs) directly on the
                  card. The calculated total updates instantly and the same
                  figure is re-validated on our servers before checkout.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-[#C2761A]" />
                </div>
                <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                  Revisions &amp; Custom Scope
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Every card lists its included revision rounds and turnaround.
                  Extra revisions, complex requirements or additional
                  deliverables are quoted and agreed with you{" "}
                  <strong className="text-[#5C3A1E]">before</strong> you pay.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            4. STUDIO DELIVERY GUARANTEES
            =================================================== */}
        <section className="py-12 bg-[#FAF9F5] border-b border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4 p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#2E7D4F]" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                    Dedicated Art Director
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    Every deliverable is supervised and refined by an experienced
                    creative lead ensuring rigorous brand fidelity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#C2761A]" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                    24 – 72 Hour Turnarounds
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    Accelerated production workflows and responsive revision
                    cycles engineered for fast-moving businesses.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-[#5C3A1E]" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                    Client Deliverables Vault
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    4K master renders, 3D assets, and web deliverables securely
                    archived in your private Google Drive deliverables vault.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            5. PRE-FOOTER BESPOKE SCOPE CTA
            =================================================== */}
        <section className="py-20 bg-[#FFFDF9]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em] bg-[#F4EFE6] text-[#5C3A1E] border border-[#EADFCB] mx-auto">
              <span className="text-[#D4A35A] text-[10px]">◆</span>
              <span>BESPOKE STUDIO SCOPES</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#0F172A]">
              Need a Custom Cross-Discipline Scope?
            </h2>
            <p className="text-base text-[#64748B] max-w-xl mx-auto leading-relaxed">
              Combine 3D spatial renders, promotional video creation, and custom
              web architecture under a single unified studio retainer.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  withArrow
                  className="w-full sm:w-auto justify-center shadow-warm"
                >
                  Request Custom Proposal
                </Button>
              </Link>
              <Link href="/chat" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<Bot className="w-4 h-4 text-[#D4A35A]" />}
                  className="w-full sm:w-auto justify-center"
                >
                  Consult Studio Concierge
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ===================================================
          6. SERVICE DETAIL SPECIFICATION MODAL / DRAWER
          =================================================== */}
      <Modal
        isOpen={!!selectedService}
        onClose={handleCloseDetail}
        title={selectedService?.name || "Service Specification"}
        description={selectedService?.tagline}
        maxWidth="2xl"
        variant="auto"
      >
        {selectedService && selectedSpec && (
          <div className="space-y-6 text-[#0F172A]">
            {/* Studio Sample Disclaimer Watermark */}
            <div className="p-3 rounded-2xl bg-[#FFFDF9] border border-[#D4A35A]/35 text-xs text-[#5C3A1E] flex items-start gap-2.5 shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#A98B57] shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong className="font-semibold block text-[#0F172A]">
                  STUDIO TECHNICAL SAMPLE
                </strong>
                <span>{selectedSpec.sampleDisclaimer}</span>
              </div>
            </div>

            {/* Interactive Spatial / Real Device / Media Preview */}
            <div className="rounded-2xl overflow-hidden border border-[#EADFCB] bg-[#F4EFE6]">
              {selectedService.mediaType === "3d" ? (
                <Interactive3DViewer
                  height="340px"
                  title={`${selectedService.name} • 3D Mesh`}
                  subtitle="Interactive WebGL 2.0 PBR Orbit"
                  allowPresetSwitch={true}
                />
              ) : selectedService.mediaType === "360" ? (
                <PanoramicTourViewer
                  height="340px"
                  title={`${selectedService.name} • 360° VR`}
                  subtitle="Interactive Equirectangular Spatial Tour"
                />
              ) : selectedService.slug === "website-development" ||
                selectedService.slug === "mobile-app-setup" ||
                selectedService.slug === "web-app-development" ||
                selectedService.slug === "web-mobile-development" ? (
                <DeviceMockupShowcase initialMode="laptop" />
              ) : selectedService.slug === "meta-ads" ||
                selectedService.slug === "meta-ads-launcher" ||
                selectedService.slug === "digital-marketing-ads" ? (
                <MetaAdCreativeMockup
                  headline={selectedService.description}
                  ctaText="Order Meta Ad Bundle"
                  ctaHref={`/orders?service=${selectedService.slug}`}
                />
              ) : selectedService.mediaType === "video" ? (
                <VideoCard
                  video="service-ai-video"
                  badgeText={`${selectedService.category.toUpperCase()} REEL SAMPLE`}
                  allowExpand
                />
              ) : (
                <div className="relative aspect-video w-full">
                  <Image
                    src={selectedService.thumbnail}
                    alt={selectedService.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="rounded-full bg-[#171717]/85 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white border border-white/10 uppercase tracking-wider">
                      {selectedService.category}
                    </span>
                    <span className="rounded-full bg-[#D4A35A] px-3 py-1 text-xs font-bold text-[#0F172A] shadow-sm">
                      {selectedService.badge}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 z-10">
                    <span className="rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-xs font-mono font-medium text-[#5C3A1E] border border-[#EADFCB] shadow-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#A98B57]" />
                      {selectedService.turnaround}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Core Commercial Scope & Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                  {getPriceBadge(selectedService)}
                </span>
                <span className="font-serif text-lg font-bold text-[#5C3A1E] block">
                  {selectedService.startingPrice}
                </span>
                <span className="text-[10px] text-[#64748B] block">
                  {selectedSpec.pricingUnit}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                  Turnaround SLA
                </span>
                <span className="font-medium text-[#0F172A] block mt-0.5">
                  {selectedService.turnaround}
                </span>
                <span className="text-[10px] text-[#64748B] block">
                  Accelerated review
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                  Revision Rounds
                </span>
                <span className="font-medium text-[#0F172A] block mt-0.5">
                  {selectedService.revisionPolicy || "1 to 2 revision rounds"}
                </span>
                <span className="text-[10px] text-[#64748B] block">
                  Consolidated feedback
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                  Studio Department
                </span>
                <span
                  className="font-medium text-[#5C3A1E] truncate block mt-0.5"
                  title={selectedService.pipelineEngine}
                >
                  {selectedService.pipelineEngine.split("+")[0].trim()}
                </span>
                <span className="text-[10px] text-[#64748B] block">
                  Art-director led
                </span>
              </div>
            </div>

            {/* Standalone Pricing Callout */}
            {selectedService.priceDisplay && (
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#D4A35A]/40 text-xs font-semibold text-[#8C6D32] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#A98B57] shrink-0" />
                <span>{selectedService.priceDisplay}</span>
              </div>
            )}

            {/* Service Purpose & Target Audience */}
            <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A98B57] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#D4A35A]" />
                Service Purpose &amp; Intended Clients
              </h4>
              <p className="text-xs text-[#0F172A] leading-relaxed">
                {selectedService.description}
              </p>
              <div className="pt-1.5 border-t border-[#EADFCB]/60 text-xs text-[#64748B]">
                <strong className="text-[#5C3A1E] font-semibold">Ideal For: </strong>
                <span>{selectedSpec.intendedAudience}</span>
              </div>
            </div>

            {/* Master Technical Specifications & Dimensions */}
            <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A98B57] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#D4A35A]" />
                Master Deliverable Formats &amp; Dimensions
              </h4>
              <p className="text-xs text-[#0F172A] font-mono leading-relaxed">
                {selectedSpec.dimensionsSpecs}
              </p>
            </div>

            {/* Exact Deliverables & Quantities */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A98B57] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F]" />
                Exact Included Deliverables &amp; Quantities
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedService.deliverables.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2.5 text-xs text-[#0F172A] p-2.5 rounded-xl bg-[#FFFDF9] border border-[#EADFCB]/60"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D4F] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Client Inputs */}
            <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A98B57] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#D4A35A]" />
                Required Client Inputs &amp; Briefing Assets
              </h4>
              <ul className="space-y-1.5 text-xs text-[#475569]">
                {selectedSpec.clientInputs.map((inputItem, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#D4A35A] font-bold mt-0.5">•</span>
                    <span>{inputItem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5-Step Production Pipeline */}
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C3A1E] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                5-Step Production Process (Research → Creative Direction →
                Production → Studio QA → Delivery Vault)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {selectedSpec.productionSteps.map((step) => (
                  <div
                    key={step.step}
                    className="p-3 rounded-xl bg-[#FFFDF9] border border-[#EADFCB]/80 flex flex-col justify-between"
                  >
                    <div>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#5C3A1E] text-white text-[10px] font-bold mb-1.5">
                        {step.step}
                      </span>
                      <h5 className="font-semibold text-xs text-[#0F172A] leading-tight mb-1">
                        {step.title}
                      </h5>
                    </div>
                    <p className="text-[11px] text-[#64748B] leading-snug mt-1">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Scope Exclusions & Custom Scope Conditions */}
            <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-[#A98B57] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#C2761A]" />
                Production Scope Exclusions &amp; Custom Conditions
              </h4>
              <ul className="space-y-1 text-[#64748B]">
                {selectedService.exclusions.map((excl, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#C2761A] font-bold">•</span>
                    <span>{excl}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-[#8C6D32] pt-1.5 border-t border-[#EADFCB]/60">
                <strong>Custom Scope Note: </strong>
                {selectedSpec.customQuoteConditions}
              </p>
            </div>

            {/* Direct Order & Inquiry Action Buttons */}
            <div className="pt-4 border-t border-[#EADFCB] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 order-2 sm:order-1">
                <Link
                  href={`/services/${selectedService.slug}`}
                  className="order-2 sm:order-1"
                >
                  <Button
                    variant="ghost"
                    size="md"
                    className="w-full sm:w-auto justify-center"
                  >
                    Open Service Page
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 order-1 sm:order-2">
                <Link href="/chat" className="order-2 sm:order-2">
                  <Button
                    variant="secondary"
                    size="md"
                    leftIcon={<Bot className="w-4 h-4 text-[#D4A35A]" />}
                    className="w-full sm:w-auto"
                  >
                    Consult Concierge
                  </Button>
                </Link>
                <Link
                  href={selectedService.ctaHref || `/orders?service=${selectedService.slug}`}
                  className="order-1 sm:order-1"
                >
                  <Button
                    variant="primary"
                    size="md"
                    withArrow
                    className="w-full sm:w-auto justify-center"
                  >
                    {selectedService.isCustomQuote
                      ? "Inquire Custom Scope"
                      : `Order ${selectedService.name} (${selectedService.startingPrice})`}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
