"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  Check,
  Sparkles,
  ShieldCheck,
  Clock,
  HardDrive,
  HelpCircle,
  ArrowRight,
  Bot,
  Zap,
} from "lucide-react";

interface PricingTier {
  name: string;
  projectPrice: string;
  monthlyPrice: string;
  description: string;
  features: string[];
  popular: boolean;
  cta: string;
  turnaround: string;
  driveAllocation: string;
}

const TIERS: PricingTier[] = [
  {
    name: "Starter Creative",
    projectPrice: "₹18,500",
    monthlyPrice: "₹45,000",
    description: "Ideal for boutique brands, luxury founders, and product launches needing immediate high-impact visuals.",
    features: [
      "Up to 5 Photorealistic 4K Renders",
      "1x 10-Second Commercial Video Ad",
      "Full Commercial Copyright License",
      "48-Hour Turnaround Pipeline",
      "Google Drive Organized Delivery",
      "2 Revision Rounds Included",
    ],
    popular: false,
    cta: "Start with Starter",
    turnaround: "48 Hours",
    driveAllocation: "10 GB Cloud Vault",
  },
  {
    name: "Studio Growth",
    projectPrice: "₹48,500",
    monthlyPrice: "₹1,25,000",
    description: "Comprehensive creative suite across 3D spatial renders, promotional video, and multi-channel Meta ad campaigns.",
    features: [
      "15x High-Resolution 3D & Product Renders",
      "3x 15-Second Video Ads with Voiceover",
      "Interactive 360° Space or Product Tour",
      "Meta Ads Creative Variation Pack (3 Sets)",
      "Dedicated Creative Lead & Slack Sync",
      "Priority 24-72 Hour Delivery Pipeline",
      "Unlimited Minor Revisions (7 Days)",
    ],
    popular: true,
    cta: "Choose Growth",
    turnaround: "24–72 Hours",
    driveAllocation: "50 GB Cloud Vault",
  },
  {
    name: "Bespoke Enterprise",
    projectPrice: "₹95,000+",
    monthlyPrice: "₹2,50,000",
    description: "Full digital studio ecosystem: custom Next.js web application, autonomous 3D pipelines, and AI cloud automation.",
    features: [
      "Bespoke Next.js 16 Web Application Build",
      "Custom n8n Automated Creative Pipelines",
      "Unlimited 3D Modeling & Spatial Renders",
      "Cross-Platform Mobile App Setup (Expo/PWA)",
      "Custom AI Classifier & Real-Time Sync",
      "Same-Day Priority Turnaround",
      "Dedicated Senior Art Director & SLA",
    ],
    popular: false,
    cta: "Inquire for Enterprise",
    turnaround: "Same-Day / Dedicated",
    driveAllocation: "Unlimited Cloud Storage",
  },
];

const FAQS = [
  {
    q: "How does Google Drive delivery work?",
    a: "Every client is provisioned a dedicated, encrypted Google Drive folder upon account creation. All master 4K TIFF/PNG renders, ProRes videos, and 3D models auto-synchronize to your drive with permanent ownership.",
  },
  {
    q: "What is your revision policy?",
    a: "Every project tier includes revision rounds overseen directly by our Principal Art Director. You can annotate feedback, request lighting passes, or submit copy edits through the client portal with guaranteed 24-hour turnaround.",
  },
  {
    q: "Can I upgrade or customize my scope mid-project?",
    a: "Yes. Our modular service architecture allows you to easily attach additional 3D renders, video aspect ratios, or Meta ad sets to any active commission with transparent prorated billing.",
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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-16">
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
            Honest studio packages with zero hidden fees. Every asset crafted under
            experienced art-direction and delivered directly into your Google Drive vault.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex rounded-full bg-[#FFFDF9] border border-[#EADFCB] p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setBillingCycle("project")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  billingCycle === "project"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Per-Project Commission
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === "monthly"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <span>Monthly Studio Retainer</span>
                <span className="text-[10px] bg-[#D4A35A] text-[#0F172A] px-2 py-0.5 rounded-full font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Tier Grid (Responsive 1-col on mobile, 3-col on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
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

                {/* Price Display */}
                <div className="flex items-baseline gap-1.5 pb-6 border-b border-[#EADFCB]/60">
                  <span className="font-serif text-4xl sm:text-5xl font-bold text-[#5C3A1E]">
                    {billingCycle === "project" ? tier.projectPrice : tier.monthlyPrice}
                  </span>
                  <span className="text-xs text-[#64748B] font-mono">
                    {billingCycle === "project" ? "/ commission" : "/ month"}
                  </span>
                </div>

                {/* Metadata Pills */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center gap-1.5 text-[#5C3A1E]">
                    <Clock className="w-3.5 h-3.5 text-[#A98B57]" />
                    <span>{tier.turnaround}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center gap-1.5 text-[#5C3A1E]">
                    <HardDrive className="w-3.5 h-3.5 text-[#A98B57]" />
                    <span>{tier.driveAllocation}</span>
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
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link href="/orders">
                  <Button
                    variant={tier.popular ? "primary" : "secondary"}
                    size="md"
                    className="w-full justify-center"
                    withArrow
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

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
              <h5 className="font-semibold text-[#0F172A] text-sm">Encrypted Drive Archive</h5>
              <p className="text-[11px] mt-0.5">Private cloud vault with permanent asset storage.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#EADFCB] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#C2761A]" />
            </div>
            <div>
              <h5 className="font-semibold text-[#0F172A] text-sm">24-72 Hour Delivery</h5>
              <p className="text-[11px] mt-0.5">Autonomous generative pipelines with human supervision.</p>
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
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact">
              <Button variant="primary" size="md" withArrow>
                Request Custom Proposal
              </Button>
            </Link>
            <Link href="/chat">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Bot className="w-4 h-4 text-[#D4A35A]" />}
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
