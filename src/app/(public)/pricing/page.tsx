"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  ShieldCheck,
  Clock,
  HardDrive,
  HelpCircle,
  Bot,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle2,
  Package,
  Layers,
  Repeat,
  Info,
} from "lucide-react";
import { formatCurrencyINR } from "@/config/services";
import {
  DISPLAY_MONTHLY_PACKAGES,
  DISPLAY_SCOPED_PRICE_ITEMS,
  getCanonicalMonthlyPackage,
  getDisplayPriceCategories,
  getFixedPriceServiceGroups,
  getLowestFixedPrice,
} from "@/config/displayPricing";

const FAQS = [
  {
    q: "What is your revision policy?",
    a: "Every deliverable across our retainer plans and standalone packs includes 1 consolidated revision round overseen directly by our Principal Art Director. You can annotate feedback, request lighting/palette passes, or submit copy revisions through your client portal with dedicated milestone turnaround.",
  },
  {
    q: "How does the Daily Trend Creator flagship package work?",
    a: "Daily Trend Creator (₹19,999 / 30 days) operates as your dedicated daily active creative queue. Every single day for 30 days, we conduct daily trend research, develop brand-aligned creative direction, produce 1 custom 4K image + 1 commercial short video/reel, perform rigorous quality reviews, and deliver directly to your private Google Drive vault.",
  },
  {
    q: "Do I own full commercial rights to the deliverables?",
    a: "Yes. All creative visuals, video reels, 3D assets, copy decks, and web prototype deliverables come with irrevocable 100% commercial usage licensing and zero ongoing royalty fees.",
  },
  {
    q: "What is explicitly excluded from your standard pricing?",
    a: "Our transparent pricing covers digital creative production, creative direction & content planning, audio sync, color grading, and quality assurance. Paid advertising budget/ad spend, on-location physical videography shoots, on-camera actors or voiceover talent fees, and multi-tenant enterprise server infrastructure are excluded unless explicitly agreed in a custom Statement of Work.",
  },
  {
    q: "How are payments processed?",
    a: "Orders are secured via direct Google Pay (GPay) or UPI QR payment settlement upon scope confirmation. Simply submit your bank UTR transaction reference to initiate instant production staging.",
  },
  {
    q: "Can I order standalone single deliverables without a monthly retainer?",
    a: "Absolutely. Single graphics, reels, bundles and rapid deliverable packs can all be ordered on an individual per-project basis — see the single-service catalogue above for the current one-time items, and confirm your exact scope in the order flow.",
  },
];

export default function PricingPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = getDisplayPriceCategories();
  const fixedGroups = getFixedPriceServiceGroups();

  const filteredFixedGroups = useMemo(
    () =>
      fixedGroups
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) =>
              activeCategory === "All" || item.category === activeCategory
          ),
        }))
        .filter((group) => group.items.length > 0),
    [activeCategory, fixedGroups]
  );

  const filteredScopedItems = useMemo(
    () =>
      DISPLAY_SCOPED_PRICE_ITEMS.filter(
        (item) => activeCategory === "All" || item.category === activeCategory
      ),
    [activeCategory]
  );

  // Cross-service comparison rows (all eight services, one table).
  const comparisonRows = useMemo(() => {
    const fixedRows = fixedGroups.map((group) => {
      const lowest = getLowestFixedPrice(group.serviceSlug);
      const lowestItem = group.items.reduce((best, item) =>
        item.price < best.price ? item : best
      );
      return {
        key: group.serviceSlug,
        serviceName: group.serviceName,
        category: group.category,
        model: "Fixed one-time items",
        priceLabel: lowest
          ? `From ${formatCurrencyINR(lowest)} ${lowestItem.unit}`
          : "Custom Quote",
        serviceHref: `/services/${group.serviceSlug}`,
        fixed: true,
      };
    });
    const scopedRows = DISPLAY_SCOPED_PRICE_ITEMS.map((item) => ({
      key: item.serviceSlug,
      serviceName: item.serviceName,
      category: item.category,
      model: "Scoped — quote per project",
      priceLabel: `${formatCurrencyINR(item.minPrice)} – ${formatCurrencyINR(
        item.maxPrice
      )}`,
      serviceHref: `/services/${item.serviceSlug}`,
      fixed: false,
    }));
    return [...fixedRows, ...scopedRows].filter(
      (row) => activeCategory === "All" || row.category === activeCategory
    );
  }, [activeCategory, fixedGroups]);

  const filterPills = ["All", ...categories];

  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F5] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      <main id="main-content" className="flex-1 flex flex-col">
        {/* =========================================================================
            HERO — Dedicated Packages & Pricing page
            ========================================================================= */}
        <section className="bg-[#FAF9F5] pt-12 sm:pt-16 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
              SUTRA STUDIOS
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#0F172A]">
              Packages &amp; Pricing
            </h1>
            <p className="text-sm sm:text-base text-[#64748B] max-w-2xl mx-auto leading-relaxed">
              Compare one-time single-service prices and monthly creative
              packages in two clearly separated sections — every amount is in
              Indian Rupees (INR).
            </p>

            {/* Frontend-only proposal notice */}
            <div className="max-w-3xl mx-auto flex items-start gap-3 rounded-2xl border border-[#EADFCB] bg-[#F8F5EF] p-4 text-left">
              <Info className="w-5 h-5 text-[#A98B57] shrink-0 mt-0.5" />
              <p className="text-xs text-[#64748B] leading-relaxed">
                <strong className="text-[#5C3A1E]">
                  Proposed display prices for review.
                </strong>{" "}
                This catalogue is for comparison only — every order is quoted
                and re-validated through the studio&apos;s approved price
                catalogue at checkout, so nothing here charges a customer on
                its own. Ranges are never a confirmed checkout price.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/orders" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  withArrow
                  className="w-full sm:w-auto justify-center shadow-warm"
                >
                  Start Order
                </Button>
              </Link>
              <Link href="/services" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full sm:w-auto justify-center"
                >
                  Browse Services
                </Button>
              </Link>
            </div>

            {/* Section anchors */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs">
              <a
                href="#single-service-pricing"
                className="inline-flex items-center gap-1.5 font-semibold text-[#5C3A1E] hover:underline"
              >
                <Layers className="w-3.5 h-3.5 text-[#A98B57]" />
                Section A — One-Time Services
              </a>
              <span className="text-[#EADFCB]">•</span>
              <a
                href="#monthly-packages"
                className="inline-flex items-center gap-1.5 font-semibold text-[#5C3A1E] hover:underline"
              >
                <Repeat className="w-3.5 h-3.5 text-[#A98B57]" />
                Section B — Monthly Packages
              </a>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION A — SINGLE-SERVICE PRICING (ONE-TIME, INR)
            ========================================================================= */}
        <section
          id="single-service-pricing"
          className="py-14 sm:py-16 bg-[#F8F5EF] border-y border-[#EADFCB]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="space-y-4 text-center">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A98B57] bg-[#FFFDF9] border border-[#EADFCB] rounded-full px-4 py-1.5">
                <Layers className="w-3.5 h-3.5" />
                Section A — One-Time Services
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
                Single-Service Pricing
              </h2>
              <p className="text-sm text-[#64748B] max-w-2xl mx-auto leading-relaxed">
                One-time items and scoped services — each order is charged once,
                never recurring. Filter by category, compare prices, then select
                a service to see its full scope.
              </p>
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {filterPills.map((pill) => {
                const isActive = activeCategory === pill;
                return (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => setActiveCategory(pill)}
                    aria-pressed={isActive}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-[#171717] text-[#FAF9F5] border-[#171717]"
                        : "bg-[#FFFDF9] text-[#5C3A1E] border-[#EADFCB] hover:border-[#D4A35A]"
                    }`}
                  >
                    {pill === "All" ? "All Services" : pill}
                  </button>
                );
              })}
            </div>

            {/* Cross-service comparison table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C3A1E] text-center">
                Compare All Service Prices
              </h3>
              <div className="rounded-3xl border border-[#EADFCB] bg-[#FFFDF9] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b border-[#EADFCB] bg-[#FAF9F5] text-[#94A3B8] uppercase text-[10px] tracking-wider font-mono">
                        <th className="px-4 sm:px-6 py-3">Service</th>
                        <th className="px-4 sm:px-6 py-3">Category</th>
                        <th className="px-4 sm:px-6 py-3">Pricing Model</th>
                        <th className="px-4 sm:px-6 py-3">Price (INR)</th>
                        <th className="px-4 sm:px-6 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row) => (
                        <tr
                          key={row.key}
                          className="border-b border-[#EADFCB]/60 last:border-b-0"
                        >
                          <td className="px-4 sm:px-6 py-3.5 font-semibold text-[#0F172A]">
                            {row.serviceName}
                          </td>
                          <td className="px-4 sm:px-6 py-3.5 text-[#64748B]">
                            {row.category}
                          </td>
                          <td className="px-4 sm:px-6 py-3.5 text-[#64748B]">
                            {row.model}
                          </td>
                          <td className="px-4 sm:px-6 py-3.5 font-mono text-[#5C3A1E] font-semibold whitespace-nowrap">
                            {row.priceLabel}
                          </td>
                          <td className="px-4 sm:px-6 py-3.5 text-right">
                            {row.fixed ? (
                              <Link
                                href={row.serviceHref}
                                className="inline-flex items-center gap-1 font-semibold text-[#5C3A1E] hover:underline"
                              >
                                Select Service
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </Link>
                            ) : (
                              <Link
                                href="/contact"
                                className="inline-flex items-center gap-1 font-semibold text-[#5C3A1E] hover:underline"
                              >
                                Request Quote
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Fixed one-time price tables */}
            {filteredFixedGroups.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C3A1E] text-center">
                  Fixed One-Time Items
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredFixedGroups.map((group) => (
                    <div
                      key={group.serviceSlug}
                      className="rounded-3xl border border-[#EADFCB] bg-[#FFFDF9] overflow-hidden flex flex-col"
                    >
                      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[#EADFCB] bg-[#FAF9F5]">
                        <div>
                          <h4 className="font-serif text-lg font-semibold text-[#0F172A]">
                            {group.serviceName}
                          </h4>
                          <span className="text-[10px] uppercase font-mono tracking-wider text-[#94A3B8]">
                            {group.category} · One-time prices
                          </span>
                        </div>
                        <Link
                          href={`/services/${group.serviceSlug}`}
                          className="text-xs font-semibold text-[#5C3A1E] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
                        >
                          Select Service
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      <ul className="divide-y divide-[#EADFCB]/60 flex-1">
                        {group.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-3 px-5 sm:px-6 py-3"
                          >
                            <span className="text-sm text-[#475569]">
                              {item.item}
                            </span>
                            <span className="flex items-center gap-3 sm:gap-4 shrink-0">
                              <span className="font-mono text-sm font-semibold text-[#5C3A1E] whitespace-nowrap">
                                {formatCurrencyINR(item.price)}
                                <span className="text-[10px] text-[#94A3B8] font-sans font-normal ml-1.5">
                                  {item.unit}
                                </span>
                              </span>
                              <Link
                                href={`/new-order?service=${group.serviceSlug}&deliverable=${item.id}`}
                                className="text-[11px] font-semibold text-[#5C3A1E] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
                                title={`Start an order for ${item.item} (${group.serviceName})`}
                              >
                                Start Order
                                <ArrowUpRight className="w-3 h-3" />
                              </Link>
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="px-5 sm:px-6 py-4 border-t border-[#EADFCB] bg-[#FAF9F5]">
                        <Link
                          href={`/new-order?service=${group.serviceSlug}`}
                          className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#171717] px-5 py-2.5 text-xs font-semibold text-[#FAF9F5] transition-colors hover:bg-[#2C2C2C]"
                        >
                          Start Order
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scoped services with price ranges */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C3A1E] text-center">
                Scoped Services — Quote Per Project
              </h3>
              {filteredScopedItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredScopedItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-3xl border border-[#EADFCB] bg-[#FFFDF9] p-5 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                            {item.serviceName}
                          </h4>
                          <span className="text-[9px] uppercase font-mono tracking-wider text-[#94A3B8]">
                            {item.category}
                          </span>
                        </div>
                        <p className="font-mono text-lg font-semibold text-[#5C3A1E]">
                          {formatCurrencyINR(item.minPrice)} –{" "}
                          {formatCurrencyINR(item.maxPrice)}
                        </p>
                        <p className="text-xs text-[#64748B] leading-relaxed">
                          Range shown {item.scopeNote} — this range is{" "}
                          <strong className="text-[#5C3A1E]">
                            not a confirmed checkout price
                          </strong>
                          . Request a quote for a scoped proposal.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Link
                          href="/contact"
                          className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#171717] px-4 py-2.5 text-xs font-semibold text-[#FAF9F5] transition-colors hover:bg-[#2C2C2C]"
                        >
                          Request Quote
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/services/${item.serviceSlug}`}
                          className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-[#EADFCB] bg-[#FAF9F5] px-4 py-2.5 text-xs font-semibold text-[#4A3B22] transition-colors hover:border-[#D4A35A]"
                        >
                          Select Service
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-[#94A3B8]">
                  No scoped services in this category — try another filter.
                </p>
              )}
              {filteredFixedGroups.length === 0 &&
                filteredScopedItems.length > 0 && (
                  <p className="text-center text-xs text-[#94A3B8]">
                    No fixed one-time items in this category — scoped services
                    are shown above.
                  </p>
                )}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION B — MONTHLY PACKAGES (RECURRING, INR PER 30 DAYS)
            ========================================================================= */}
        <div id="packages" className="scroll-mt-24" />
        <section
          id="monthly-packages"
          className="py-14 sm:py-16 bg-[#FFFDF9] border-b border-[#EADFCB]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="space-y-4 text-center">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A98B57] bg-[#F8F5EF] border-2 border-[#EADFCB] rounded-full px-4 py-1.5">
                <Repeat className="w-3.5 h-3.5" />
                Section B — Monthly Packages
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
                Monthly Creative Packages
              </h2>
              <p className="text-sm text-[#64748B] max-w-2xl mx-auto leading-relaxed">
                Recurring creative retainers — billed every 30 days in INR.
                These monthly subscription prices are kept visually separate
                from the one-time services above.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DISPLAY_MONTHLY_PACKAGES.map((pkg) => {
                const canonical = getCanonicalMonthlyPackage(
                  pkg.canonicalSlug
                );
                return (
                  <div
                    key={pkg.id}
                    className="rounded-3xl border-2 border-[#EADFCB] bg-[#FAF9F5] p-6 flex flex-col justify-between gap-5"
                  >
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-mono tracking-wider text-[#A98B57] bg-[#FFFDF9] border border-[#EADFCB] rounded-full px-2.5 py-1">
                          <Repeat className="w-3 h-3" />
                          Billed every 30 days
                        </span>
                        <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                          {pkg.name}
                        </h3>
                        <p className="text-xs text-[#64748B]">{pkg.tagline}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="font-serif text-3xl font-bold text-[#5C3A1E]">
                          {formatCurrencyINR(pkg.monthlyPrice)}
                          <span className="text-sm font-normal text-[#64748B]">
                            {" "}
                            / month
                          </span>
                        </p>
                        <p className="text-[10px] uppercase font-mono tracking-wider text-[#94A3B8]">
                          Monthly subscription · INR ·{" "}
                          {canonical?.billingCycle === "monthly"
                            ? "30-day billing cycle"
                            : canonical?.duration ?? "30 days"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A98B57]">
                          Monthly Quota
                        </h4>
                        <ul className="space-y-1.5">
                          {pkg.inclusions.map((line) => (
                            <li
                              key={line}
                              className="flex items-start gap-2 text-xs text-[#475569]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0 mt-0.5" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-[11px] text-[#64748B]">
                          <strong className="text-[#0F172A]">
                            Video length limit:
                          </strong>{" "}
                          each included video/reel is produced{" "}
                          {pkg.videoDurationLimit}.
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-1 border-t border-[#EADFCB]">
                        <p className="text-[11px] text-[#475569]">
                          <strong className="text-[#0F172A]">
                            Revisions:
                          </strong>{" "}
                          {canonical?.revisionPolicy ??
                            "1 consolidated revision round per deliverable"}
                        </p>
                        <div className="text-[11px] text-[#475569]">
                          <strong className="text-[#0F172A]">
                            Not included:
                          </strong>
                          <ul className="mt-0.5 space-y-0.5">
                            {(canonical?.exclusions ?? [
                              "Paid ad media spend excluded",
                              "Raw project/source files excluded",
                            ]).map((exclusion) => (
                              <li key={exclusion} className="text-[#64748B]">
                                • {exclusion}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <p className="text-[11px] text-[#64748B]">
                          <strong className="text-[#0F172A]">Billing:</strong>{" "}
                          {`Billed every 30 days, renewable monthly at ${formatCurrencyINR(
                            pkg.monthlyPrice
                          )} per cycle.`}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Link
                        href={`/packages/${pkg.canonicalSlug}`}
                        className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#171717] px-5 py-3 text-sm font-semibold text-[#FAF9F5] transition-colors hover:bg-[#2C2C2C]"
                      >
                        <Package className="w-4 h-4" />
                        Choose Package
                      </Link>
                      <Link
                        href={`/new-order?package=${pkg.canonicalSlug}`}
                        className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-[#EADFCB] bg-[#FFFDF9] px-5 py-3 text-sm font-semibold text-[#4A3B22] transition-colors hover:border-[#D4A35A]"
                      >
                        Start Order
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                      <p className="text-[10px] text-[#94A3B8] leading-relaxed pt-0.5">
                        Proposed package for review — final quantities and scope
                        are confirmed in the existing order flow before any
                        billing.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SCOPE BOUNDARIES & PRODUCTION EXCLUSIONS POLICY
            ========================================================================= */}
        <section className="py-14 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="w-full p-6 sm:p-8 rounded-3xl bg-[#FFFDF9] border-2 border-[#EADFCB] space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#A98B57]">
                <ShieldAlert className="w-4 h-4 text-[#C2761A]" />
                <span>Studio Production Scope &amp; Exclusion Guardrails</span>
              </div>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Sutra Studio delivers senior art-directed digital creative
                assets, creative direction &amp; content planning, color
                grading, sound synchronization, and web architecture. To protect
                commercial transparency, the following items are{" "}
                <strong>strictly excluded</strong> from all standard catalog
                rates and retainers:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs text-[#475569]">
                <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-start gap-2">
                  <span className="text-[#DC2626] font-bold text-sm shrink-0">
                    ✕
                  </span>
                  <div>
                    <strong className="text-[#0F172A] block">
                      Paid Advertising Media Spend
                    </strong>
                    <span>
                      All ad placements (Meta, Google, TikTok, YouTube) are
                      billed directly to client accounts.
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-start gap-2">
                  <span className="text-[#DC2626] font-bold text-sm shrink-0">
                    ✕
                  </span>
                  <div>
                    <strong className="text-[#0F172A] block">
                      Physical On-Site Video Crews
                    </strong>
                    <span>
                      On-location camera crews and physical production sets are
                      excluded unless agreed in bespoke quote.
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-start gap-2">
                  <span className="text-[#DC2626] font-bold text-sm shrink-0">
                    ✕
                  </span>
                  <div>
                    <strong className="text-[#0F172A] block">
                      Actor &amp; Talent Licensing Fees
                    </strong>
                    <span>
                      On-camera actor appearance fees and third-party celebrity
                      voice talent licensing fees are excluded.
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-start gap-2">
                  <span className="text-[#DC2626] font-bold text-sm shrink-0">
                    ✕
                  </span>
                  <div>
                    <strong className="text-[#0F172A] block">
                      Third-Party Stock Subscriptions
                    </strong>
                    <span>
                      Specialized proprietary commercial font licenses and niche
                      archival stock purchases are excluded.
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-start gap-2">
                  <span className="text-[#DC2626] font-bold text-sm shrink-0">
                    ✕
                  </span>
                  <div>
                    <strong className="text-[#0F172A] block">
                      Raw Working Project Files
                    </strong>
                    <span>
                      Unrendered Premiere, After Effects, and 3D project source
                      scene files are excluded (master exports provided).
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-start gap-2">
                  <span className="text-[#DC2626] font-bold text-sm shrink-0">
                    ✕
                  </span>
                  <div>
                    <strong className="text-[#0F172A] block">
                      Custom Multi-Tenant Enterprise Backend
                    </strong>
                    <span>
                      Custom database microservices and multi-tenant ERP setups
                      require specialized solution scoping.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Studio Service Guarantees Strip */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF9F5] border border-[#EADFCB] grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#64748B] w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#EADFCB] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#2E7D4F]" />
                </div>
                <div>
                  <h5 className="font-semibold text-[#0F172A] text-sm">
                    Full Commercial License
                  </h5>
                  <p className="text-[11px] mt-0.5">
                    Irrevocable rights with zero ongoing royalty fees.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#EADFCB] flex items-center justify-center shrink-0">
                  <HardDrive className="w-5 h-5 text-[#5C3A1E]" />
                </div>
                <div>
                  <h5 className="font-semibold text-[#0F172A] text-sm">
                    Client Deliverables Archive
                  </h5>
                  <p className="text-[11px] mt-0.5">
                    Permanent private Google Drive Vault staging.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#EADFCB] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#C2761A]" />
                </div>
                <div>
                  <h5 className="font-semibold text-[#0F172A] text-sm">
                    Clear Project Milestones
                  </h5>
                  <p className="text-[11px] mt-0.5">
                    Transparent milestone schedules with dedicated art director
                    review.
                  </p>
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
                  Everything you need to know about our commissioning workflow,
                  deliverables, and production guarantees.
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
                We partner with luxury architecture studios, heritage brands,
                and fast-growing businesses requiring cross-discipline creative
                technology.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md mx-auto sm:max-w-none">
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="md"
                    withArrow
                    className="w-full sm:w-auto justify-center shadow-warm"
                  >
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
          </div>
        </section>
      </main>
    </div>
  );
}
