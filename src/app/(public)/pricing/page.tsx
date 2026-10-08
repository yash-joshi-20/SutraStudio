"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import {
  PER_PROJECT_TIERS,
  MONTHLY_RETAINER_TIERS,
} from "@/config/pricing";
import { STANDALONE_PACKAGES } from "@/config/packages";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "What is your revision policy?",
    a: "Every project tier includes revision rounds overseen directly by our Principal Art Director. You can annotate feedback, request lighting passes, or submit copy edits through the client portal with guaranteed turnaround.",
  },
  {
    q: "How does the Monthly Autonomous Retainer fulfill daily requests?",
    a: "The Autonomous Growth Retainer operates as your dedicated daily active queue. Each business day, our automated creative engine and senior art director produce 4K graphics, commercial motion shorts, 3D meshes, and ad variations continuously vaulted into your private Sutra Cloud Vault.",
  },
  {
    q: "Do I own full commercial rights to the deliverables?",
    a: "Yes. All creative deliverables, code repositories, 3D meshes, and brand assets come with irrevocable commercial licensing and zero recurring royalty fees.",
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"project" | "monthly">("project");

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-16">
        {/* Intro Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
            <span className="text-[#D4A35A] text-xs">◆</span>
            <span className="text-[10px] md:text-xs font-semibold tracking-[0.22em] text-[#5C3A1E] uppercase">
              TRANSPARENT STUDIO INVESTMENT
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#0F172A] leading-[1.1]">
            Clear Value, <span className="text-gold-gradient">Guaranteed Excellence</span>
          </h1>

          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
            Honest studio commissions with zero hidden fees. Every asset crafted under
            experienced art-direction and delivered directly into your Sutra Cloud Vault.
          </p>

          {/* Standalone Quick-Order Deliverables Banner */}
          <div className="pt-2 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
            {STANDALONE_PACKAGES.map((pack) => (
              <div
                key={pack.id}
                className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#D4A35A]/60 shadow-xs flex flex-col justify-between hover:border-[#D4A35A] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A98B57] font-bold">
                      Standalone Deliverable
                    </span>
                    <span className="text-[11px] font-mono text-[#64748B]">{pack.turnaround}</span>
                  </div>
                  <h4 className="font-serif text-base font-semibold text-[#0F172A] mt-1">
                    {pack.name}
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                    {pack.description}
                  </p>
                </div>
                <div className="pt-3 flex items-center justify-between border-t border-[#EADFCB]/60 mt-3">
                  <span className="font-serif text-xl font-bold text-[#5C3A1E]">
                    {pack.formattedPrice}
                  </span>
                  <Link href={pack.ctaHref}>
                    <Button variant="secondary" size="sm" className="text-xs">
                      {pack.ctaText}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Billing Cycle Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div
              role="tablist"
              aria-label="Billing frequency"
              className="grid grid-cols-2 w-full max-w-xs sm:max-w-md rounded-2xl sm:rounded-full bg-[#FFFDF9] border border-[#EADFCB] p-1 shadow-xs"
            >
              <button
                type="button"
                role="tab"
                aria-selected={billingCycle === "project"}
                onClick={() => setBillingCycle("project")}
                className={`py-2 px-2 sm:px-4 rounded-xl sm:rounded-full text-xs font-semibold cursor-pointer transition-all text-center ${
                  billingCycle === "project"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Per-Project
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={billingCycle === "monthly"}
                onClick={() => setBillingCycle("monthly")}
                className={`py-2 px-2 sm:px-4 rounded-xl sm:rounded-full text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all text-center ${
                  billingCycle === "monthly"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <span>30-Day Retainer</span>
                <span className="text-[10px] bg-[#D4A35A] text-[#0F172A] px-1.5 py-0.2 rounded-full font-bold hidden sm:inline">
                  Daily
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Tier Grid with Smooth AnimatePresence Transition */}
        <AnimatePresence mode="wait">
          {billingCycle === "project" ? (
            <motion.div
              key="project"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch"
            >
              {PER_PROJECT_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                    tier.popular
                      ? "bg-[#FFFDF9] border-2 border-[#D4A35A] shadow-warm-hover relative"
                      : "bg-[#FFFDF9] border border-[#EADFCB] shadow-sm hover:border-[#D4A35A]/60"
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#5C3A1E] text-white px-4 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase shadow-xs">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                        {tier.name}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                        {tier.description}
                      </p>
                    </div>

                    {/* Price Display with Static Number (No Flicker) */}
                    <div className="flex items-baseline gap-1.5 pb-6 border-b border-[#EADFCB]/60">
                      <span className="font-serif text-3xl sm:text-4xl font-bold text-[#5C3A1E]">
                        {typeof tier.price === "number" ? tier.formattedPrice : "Custom Quote"}
                      </span>
                      <span className="text-xs text-[#64748B] font-mono">
                        {tier.price === "custom" ? "" : "/ commission"}
                      </span>
                    </div>

                    {/* Metadata Pills */}
                    <div className="grid grid-cols-1 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center gap-1.5 text-[#5C3A1E]">
                        <Clock className="w-3.5 h-3.5 text-[#A98B57]" />
                        <span>Turnaround: {tier.turnaround}</span>
                      </div>
                    </div>

                    {/* Features Checklist */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#A98B57] block">
                        What is Included:
                      </span>
                      <ul className="space-y-2.5 text-xs text-[#475569]">
                        {tier.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-[#EDF7F0] text-[#2E7D4F] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                            <span className="leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-8">
                    <Link href={tier.ctaHref || `/orders?package=${tier.id}`} className="block">
                      <Button
                        variant={tier.popular ? "primary" : "secondary"}
                        size="md"
                        className="w-full justify-center"
                        withArrow
                      >
                        {tier.ctaText}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="monthly"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl mx-auto w-full"
            >
              {MONTHLY_RETAINER_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className="rounded-3xl p-8 sm:p-10 bg-[#FFFDF9] border-2 border-[#D4A35A] shadow-warm-hover relative flex flex-col justify-between space-y-8"
                >
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#5C3A1E] text-white px-5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase shadow-xs">
                    Autonomous Campaign Engine
                  </div>

                  <div className="space-y-6">
                    <div className="text-center sm:text-left">
                      <h3 className="font-serif text-3xl font-semibold text-[#0F172A]">
                        {tier.name}
                      </h3>
                      <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
                        {tier.description}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-6 border-b border-[#EADFCB]/60 gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-4xl sm:text-5xl font-bold text-[#5C3A1E]">
                          {tier.formattedMonthlyPrice}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF9F5] border border-[#D4A35A]/50 text-xs font-mono font-bold text-[#5C3A1E]">
                        <Clock className="w-4 h-4 text-[#A98B57]" />
                        <span>{tier.turnaround}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#A98B57] block">
                        30-Day Autonomous Retainer Deliverables:
                      </span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#475569]">
                        {tier.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2.5 p-2 rounded-xl bg-[#FAF9F5]/80 border border-[#EADFCB]/60">
                            <span className="w-4 h-4 rounded-full bg-[#EDF7F0] text-[#2E7D4F] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                            <span className="leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link href={tier.ctaHref || `/orders?package=${tier.id}&cycle=monthly`} className="block">
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full justify-center text-sm font-semibold"
                        withArrow
                      >
                        {tier.ctaText}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Studio Service Guarantees Strip */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF9F5] border border-[#EADFCB] grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#64748B]">
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
              <h5 className="font-semibold text-[#0F172A] text-sm">Sutra Cloud Vault Archive</h5>
              <p className="text-[11px] mt-0.5">Encrypted cloud vault with permanent asset storage.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#EADFCB] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#C2761A]" />
            </div>
            <div>
              <h5 className="font-semibold text-[#0F172A] text-sm">24-72 Hour Delivery</h5>
              <p className="text-[11px] mt-0.5">Automated high-speed production pipelines with dedicated creative direction.</p>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
              CLARITY & ASSURANCE
            </span>
            <h2 className="font-serif text-3xl font-semibold text-[#0F172A]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Everything you need to know about our commissioning workflow, delivery, and guarantees.
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
        <div className="text-center max-w-3xl mx-auto p-8 sm:p-12 rounded-3xl bg-[#FAF9F5] border border-[#EADFCB] space-y-5">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
            BESPOKE REQUIREMENTS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
            Need a Specialized Retainer or Enterprise SLA?
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
                Chat with Studio Assistant
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
