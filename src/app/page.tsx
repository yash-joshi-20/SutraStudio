"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SutraLogo, LotusSymbol } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import { SUTRA_SERVICES } from "@/data/servicesData";
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  Layers,
  ChevronRight,
  HardDrive,
  Check,
  Globe,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E] relative overflow-hidden">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#EADFCB] pt-safe">
        <div className="app-container-cap px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <SutraLogo variant="horizontal" size="md" href="/" />

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<User className="w-4 h-4" />}
                className="text-xs uppercase tracking-wider font-semibold touch-target"
              >
                Client Login
              </Button>
            </Link>
            <Link href="/home">
              <Button
                variant="primary"
                size="sm"
                withArrow
                className="text-xs uppercase tracking-wider font-semibold touch-target"
              >
                Enter Studio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* ===================================================
            1. HERO SECTION (Full-Screen Luxury Atelier Hero)
            =================================================== */}
        <section className="relative py-16 sm:py-24 lg:py-32 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          {/* Subtle Background Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-[0.035] pointer-events-none">
            <LotusSymbol className="w-[600px] sm:w-[900px] h-[600px] sm:h-[900px]" color="gold" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
              <span className="text-[#D4A35A] text-xs">◆</span>
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-[#5C3A1E] uppercase">
                IDEAS ◆ DESIGN ◆ DEVELOPMENT ◆ GROWTH
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] tracking-tight text-[#0F172A]">
              <span className="text-gold-gradient font-bold">Tradition</span> Meets Technology
            </h1>

            {/* Promise Copy */}
            <p className="text-base sm:text-lg md:text-xl text-[#64748B] max-w-2xl mx-auto leading-relaxed">
              AI-Powered Creative, Design, Development & Digital Marketing Solutions for Modern Businesses. Rooted in traditional Indian symmetry, executed with high-precision engineering.
            </p>

            {/* 3 Core Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link href="/home" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" withArrow className="w-full justify-center text-sm font-semibold tracking-wide">
                  Enter the Studio
                </Button>
              </Link>
              <Link href="/orders" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<ShoppingBag className="w-4 h-4 text-[#5C3A1E]" />}
                  className="w-full justify-center text-sm font-semibold"
                >
                  Place an Order
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="lg"
                  leftIcon={<User className="w-4 h-4 text-[#5C3A1E]" />}
                  className="w-full justify-center text-sm font-semibold border border-[#EADFCB] bg-[#FFFDF9] hover:bg-[#F4EFE6]"
                >
                  Client Login
                </Button>
              </Link>
            </div>

            {/* Trust Assurance Strip */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[#64748B] border-t border-[#EADFCB]/70 max-w-2xl mx-auto mt-8">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#2E7D4F]" />
                <span className="font-medium">24–48h SLA Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#2E7D4F]" />
                <span className="font-medium">Senior Art Director Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#2E7D4F]" />
                <span className="font-medium">Private Google Drive Vault</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ===================================================
            2. 12 SERVICES STRIP (Visual Quick Browse)
            =================================================== */}
        <section className="py-14 bg-[#FFFDF9] border-y border-[#EADFCB]">
          <div className="app-container-cap px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A98B57] block mb-1">
                  12 CREATIVE PILLARS
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
                  Complete Multidisciplinary Studio
                </h2>
              </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#5C3A1E] hover:text-[#D4A35A] transition-colors"
              >
                <span>View All 12 Capabilities</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 12-Service Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {SUTRA_SERVICES.map((srv) => (
                <Link
                  key={srv.id}
                  href={`/services#${srv.slug}`}
                  className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] hover:border-[#D4A35A] hover:bg-[#FFFDF9] transition-all flex flex-col items-start gap-2 shadow-2xs group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-[#EADFCB] flex items-center justify-center text-[#5C3A1E] group-hover:scale-105 transition-transform shadow-2xs">
                    <Sparkles className="w-4 h-4 text-[#A98B57]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-[#0F172A] leading-tight line-clamp-2">
                      {srv.name}
                    </p>
                    <p className="text-[10px] text-[#A98B57] font-mono font-medium mt-1">
                      From {srv.startingPrice}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================
            3. HOW IT WORKS (3-Step Precision Row)
            =================================================== */}
        <section className="py-16 sm:py-20 bg-[#FAF9F5]">
          <div className="app-container-cap px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A98B57] block mb-1">
                EFFORTLESS COLLABORATION
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
                How Sutra Studio Works
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
                No meetings, no hourly guesswork. Commission 4K deliverables in 3 transparent steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#5C3A1E] text-white font-serif font-bold text-base flex items-center justify-center border border-[#A98B57]/40 shadow-2xs">
                  1
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F172A]">
                  Choose Service or Retainer
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Select single commissions starting from ₹5,499 (3–5 curated deliverables) or an all-inclusive monthly retainer starting from ₹5,999/mo with a 3-day money-back trial.
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#5C3A1E] text-white font-serif font-bold text-base flex items-center justify-center border border-[#A98B57]/40 shadow-2xs">
                  2
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F172A]">
                  Share Brief or Speak to AI
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Type your brief, upload moodboard files, or talk directly in Gujarati, English, or Hindi to our AI Concierge. Autonomous pipelines spin up instantly.
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#5C3A1E] text-white font-serif font-bold text-base flex items-center justify-center border border-[#A98B57]/40 shadow-2xs">
                  3
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F172A]">
                  Receive 4K Masters in 24–48h
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Your finished 4K UHD masters, source files, and brand deliverables are automatically vaulted in your private Google Drive folder with 100% commercial ownership.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Trust & Legal Footer */}
      <footer className="bg-[#FFFDF9] border-t border-[#EADFCB] py-10 text-xs text-[#64748B]">
        <div className="app-container-cap px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <SutraLogo variant="horizontal" size="sm" href="/" />
            <span className="text-[11px] text-[#94A3B8]">© {new Date().getFullYear()} Sutra Studio. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px]">
            <Link href="/home" className="hover:text-[#5C3A1E] transition-colors">Studio Home</Link>
            <Link href="/services" className="hover:text-[#5C3A1E] transition-colors">Services</Link>
            <Link href="/pricing" className="hover:text-[#5C3A1E] transition-colors">Pricing</Link>
            <Link href="/privacy" className="hover:text-[#5C3A1E] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#5C3A1E] transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-[#5C3A1E] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
