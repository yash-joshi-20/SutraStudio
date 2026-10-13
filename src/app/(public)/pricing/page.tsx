"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  ShieldCheck,
  Clock,
  HardDrive,
  HelpCircle,
  Bot,
  ShieldAlert,
} from "lucide-react";
import { PricingCatalogSection } from "@/components/pricing/PricingCatalogSection";

const FAQS = [
  {
    q: "What is your revision policy?",
    a: "Every deliverable across our retainer plans and standalone packs includes 1 consolidated revision round overseen directly by our Principal Art Director. You can annotate feedback, request lighting/palette passes, or submit copy revisions through your client portal with dedicated milestone turnaround.",
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
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-28 sm:py-16 w-full flex flex-col items-center justify-center space-y-16">
        {/* Reusable Canonical Pricing Catalog with Responsive CustomDropdowns */}
        <PricingCatalogSection variant="page" />

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
              <h5 className="font-semibold text-[#0F172A] text-sm">Clear Project Milestones</h5>
              <p className="text-[11px] mt-0.5">Transparent milestone schedules with dedicated art director review.</p>
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
