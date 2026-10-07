"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Modal } from "@/components/ui/Modal";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { HeroAnimation } from "@/components/motion/HeroAnimation";
import { BackgroundVideo } from "@/components/media/BackgroundVideo";
import { VideoCard } from "@/components/media/VideoCard";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { SUTRA_SERVICES } from "@/data/servicesData";
import { SUTRA_PROJECTS } from "@/data/projectsData";
import {
  Play,
  Sparkles,
  Bot,
  Layers,
  Zap,
  Target,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  Check,
  X as XIcon,
  HardDrive,
  Gem,
  Award,
  UploadCloud,
  FileCheck2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FILTER_CATEGORIES = [
  "All",
  "Image",
  "Video",
  "3D",
  "Interior",
  "Website",
  "App",
  "Marketing",
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const filteredProjects =
    selectedCategory === "All"
      ? SUTRA_PROJECTS
      : SUTRA_PROJECTS.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      <Navbar />

      <main id="main-content" className="flex-1 pb-16 md:pb-0">
        {/* ===================================================
            1. HERO SECTION (Clean White / Warm Ivory Editorial)
            =================================================== */}
        <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24">
          {/* Subtle Background Watermark */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 -z-10 opacity-[0.03] pointer-events-none">
            <LotusSymbol className="w-[800px] h-[800px]" color="gold" />
          </div>

          <HeroAnimation>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                {/* Left Column: Hero Narrative & CTAs */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Eyebrow Badge */}
                  <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
                    <span className="text-[#D4A35A] text-xs">◆</span>
                    <span className="text-[10px] md:text-xs font-semibold tracking-[0.22em] text-[#5C3A1E] uppercase">
                      IDEAS ◆ DESIGN ◆ DEVELOPMENT ◆ GROWTH
                    </span>
                  </div>

                  {/* Main Display Headline */}
                  <h1 className="hero-heading font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-tight text-[#0F172A]">
                    <span className="text-gold-gradient font-bold">Tradition</span>{" "}
                    Meets Technology
                  </h1>

                  {/* Subtitle */}
                  <p className="hero-subhead text-base sm:text-lg text-[#64748B] max-w-xl leading-relaxed font-sans">
                    AI-Powered Creative, Design, Development & Digital Marketing
                    Solutions for Modern Businesses. Rooted in traditional Indian
                    symmetry, executed with high-precision engineering.
                  </p>

                  {/* Action Buttons */}
                  <div className="hero-cta flex flex-wrap items-center gap-4 pt-2">
                    <Link href="#services">
                      <Button variant="primary" size="lg" withArrow>
                        Explore Services
                      </Button>
                    </Link>

                    <Button
                      variant="secondary"
                      size="lg"
                      leftIcon={<Play className="w-4 h-4 text-[#5C3A1E] fill-current" />}
                      onClick={() => setDemoModalOpen(true)}
                    >
                      Watch Showreel
                    </Button>
                  </div>

                  {/* Studio Capability Highlights Divided by Hairlines */}
                  <div className="hero-stats pt-8 mt-6 border-t border-[#EADFCB] grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div className="hero-stats-item">
                      <p className="font-serif text-lg sm:text-xl font-bold text-[#5C3A1E]">
                        High-Precision
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                        Studio Engine
                      </p>
                    </div>

                    <div className="hero-stats-item">
                      <p className="font-serif text-lg sm:text-xl font-bold text-[#5C3A1E]">
                        Autonomous
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                        AI Creative Pipelines
                      </p>
                    </div>

                    <div className="hero-stats-item">
                      <p className="font-serif text-lg sm:text-xl font-bold text-[#5C3A1E]">
                        Enterprise
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                        Production Rigor
                      </p>
                    </div>

                    <div className="hero-stats-item">
                      <p className="font-serif text-lg sm:text-xl font-bold text-[#5C3A1E]">
                        Ultra-HD 4K
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                        Master Deliverables
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Architectural Ambient Video Card */}
                <div className="hero-visual-card lg:col-span-5 relative">
                  <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FFFDF9] bg-[#0F172A]">
                    {/* Background Video Ambient Stream */}
                    <BackgroundVideo
                      video="hero-showcase"
                      layout="fill"
                      overlay="dark-editorial"
                      overlayOpacity={0.65}
                      priority
                      showPlayPauseToggle
                    />

                    {/* Center Video Play Badge */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <button
                        onClick={() => setDemoModalOpen(true)}
                        className="group flex items-center gap-3 bg-[#FFFDF9]/95 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/60 shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer touch-target"
                      >
                        <span className="w-8 h-8 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </span>
                        <span className="text-xs font-semibold text-[#0F172A] tracking-wider uppercase">
                          Watch Full Reel
                        </span>
                      </button>
                    </div>

                    {/* Bottom Floating Badge */}
                    <div className="absolute bottom-6 inset-x-6 z-10">
                      <div className="bg-[#FFFDF9]/95 backdrop-blur-md rounded-2xl p-4 border border-[#EADFCB] shadow-warm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center shrink-0">
                          <Sparkles className="w-5 h-5 text-[#D4A35A]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0F172A]">
                            Sutra Creative Technology
                          </p>
                          <p className="text-[11px] text-[#64748B]">
                            AI Workflow Router & Bespoke Craftsmanship
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative background watermark */}
                  <div className="absolute -top-12 -right-12 -z-10 opacity-20 pointer-events-none">
                    <LotusSymbol className="w-72 h-72" color="gold" />
                  </div>
                </div>
              </div>
            </div>
          </HeroAnimation>
        </section>

        {/* ===================================================
            2. 12 SERVICES CATALOG
            =================================================== */}
        <section id="services" className="py-20 bg-[#FAF9F5] border-t border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              badge="OUR SERVICES"
              title="Complete Creative & Digital Solutions"
              subtitle="From photorealistic visual generation to enterprise web platforms — everything your business requires, crafted in one studio."
              className="mb-14"
            />

            {/* 12-Card Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {SUTRA_SERVICES.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {/* Bottom Service Assurance Strip */}
            <div className="mt-12 p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] flex flex-wrap items-center justify-around gap-6 text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D4F]" />
                <span>Dedicated Art Director on Every Order</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C2761A]" />
                <span>Rapid 24-72 Hour Delivery Pipelines</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#5C3A1E]" />
                <span>Full Commercial License & Sutra Cloud Vault</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            3. WHY SUTRA STUDIO & VALUE COMPARISON MATRIX
            =================================================== */}
        <section className="py-20 bg-[#F8F5EF] border-t border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              badge="WHY SUTRA STUDIO"
              title="Why Pay Sutra Studio vs Free AI, Freelancers & Agencies?"
              subtitle="Free AI generates distorted drafts. Freelancers are fragmented. Big agencies charge ₹2,00,000/mo. Sutra Studio blends AI computational speed with Senior Human Art Direction for production-ready perfection in 24–48 hours."
              className="mb-14"
            />

            {/* Core 3 Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {/* Feature 1 */}
              <div className="interactive-card rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-8 hover:border-[#D4A35A] transition-all shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mb-6">
                  <Layers className="w-6 h-6 text-[#5C3A1E]" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                  Heritage Aesthetics + Precision
                </h3>
                <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
                  Every asset is balanced through traditional geometric principles,
                  warm color harmonies, and timeless typographic hierarchy.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="interactive-card rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-8 hover:border-[#D4A35A] transition-all shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-[#5C3A1E]" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                  Autonomous Creative Intelligence
                </h3>
                <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
                  State-of-the-art computational design models, automated render
                  dispatchers, and continuous progress updates delivered to your portal.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="interactive-card rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-8 hover:border-[#D4A35A] transition-all shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-[#5C3A1E]" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                  Business Growth & Conversion
                </h3>
                <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
                  Creative work engineered specifically to elevate luxury brand
                  perception, command premium pricing, and expand market presence.
                </p>
              </div>
            </div>

            {/* 4-Way Side-by-Side Comparison Matrix */}
            <div className="bg-[#FFFDF9] border border-[#EADFCB] rounded-3xl p-6 sm:p-10 shadow-sm mb-16">
              <div className="text-center max-w-3xl mx-auto mb-10">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A98B57] flex items-center justify-center gap-1.5 mb-2">
                  <span className="text-[#D4A35A] text-[10px]">◆</span>
                  <span>THE HONEST COMPARISON</span>
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
                  See the Direct Difference
                </h3>
                <p className="text-sm text-[#64748B] mt-2">
                  Why modern founders, brands, and agencies choose our dedicated atelier over guesswork and bloated retainers.
                </p>
              </div>

              {/* Responsive Grid Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Free AI Tools */}
                <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Option 1</span>
                      <span className="text-xs font-bold text-[#64748B] bg-[#E5E1D8]/60 px-2.5 py-0.5 rounded-full">Free / ₹1.5k/mo</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#0F172A] mb-2">Free AI Tools</h4>
                    <p className="text-xs text-[#64748B] mb-5 leading-relaxed">ChatGPT, Midjourney prompt-and-pray generators.</p>
                    
                    <ul className="space-y-3 text-xs text-[#64748B]">
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Prompt guesswork & distorted hands/text</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Low-resolution (72 DPI, 1080p compressed)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>No commercial copyright safety</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Zero 3D meshes, CAD, or production code</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>No human accountability or brand alignment</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 2. Freelancers */}
                <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Option 2</span>
                      <span className="text-xs font-bold text-[#64748B] bg-[#E5E1D8]/60 px-2.5 py-0.5 rounded-full">₹15k – ₹40k</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#0F172A] mb-2">Freelancers</h4>
                    <p className="text-xs text-[#64748B] mb-5 leading-relaxed">Solo designers on Upwork, Fiverr, or WhatsApp.</p>
                    
                    <ul className="space-y-3 text-xs text-[#64748B]">
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Inconsistent quality across disciplines</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Must hire 4–5 different specialists</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Unpredictable turnaround & ghosting risk</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Runaway hourly billing with no cap</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Files scattered in emails & expiring links</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 3. Traditional Agencies */}
                <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Option 3</span>
                      <span className="text-xs font-bold text-[#64748B] bg-[#E5E1D8]/60 px-2.5 py-0.5 rounded-full">₹1L – ₹5L/mo</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#0F172A] mb-2">Traditional Agencies</h4>
                    <p className="text-xs text-[#64748B] mb-5 leading-relaxed">Big marketing agencies with account managers.</p>
                    
                    <ul className="space-y-3 text-xs text-[#64748B]">
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Bloated retainers (₹1L – ₹5L/month)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Slow 4–8 week project turnarounds</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Long-term lock-in contracts (6–12 months)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Junior designers doing the actual work</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Extra charges for revisions and raw files</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 4. SUTRA STUDIO (Featured) */}
                <div className="p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4A35A] shadow-md flex flex-col justify-between relative ring-2 ring-[#D4A35A]/20">
                  <div className="absolute -top-3 right-6 bg-[#5C3A1E] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs border border-[#A98B57]/40">
                    RECOMMENDED
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#A98B57]">Sutra Studio</span>
                      <span className="text-xs font-bold text-[#5C3A1E] bg-[#D4A35A]/20 px-2.5 py-0.5 rounded-full">From ₹3,499</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#0F172A] mb-2">Autonomous Atelier</h4>
                    <p className="text-xs text-[#64748B] mb-5 leading-relaxed">AI speed + Senior Art Director Polish + Cloud Vault.</p>
                    
                    <ul className="space-y-3 text-xs text-[#171717]">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                        <span className="font-medium"><strong>Guaranteed 4K UHD Master Deliverables</strong> (up to 5 curated renders)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                        <span className="font-medium"><strong>Human Art Director Polish</strong> on every single asset</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                        <span className="font-medium"><strong>24–48h SLA Delivery</strong> straight to your dashboard</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                        <span className="font-medium"><strong>All 12 Disciplines in 1 Place</strong> (3D, Video, Web, Brand)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                        <span className="font-medium"><strong>Private Sutra Cloud Vault</strong> & 100% Commercial IP</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E5E1D8]">
                    <Link href="/services">
                      <Button variant="primary" size="sm" className="w-full justify-center text-xs">
                        Explore Deliverables
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Simple 3-Step "How It Works" Flow (Universal for ages 18-60) */}
            <div className="mb-14">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A98B57] flex items-center justify-center gap-1.5 mb-2">
                  <span className="text-[#D4A35A] text-[10px]">◆</span>
                  <span>HOW IT WORKS</span>
                </span>
                <h3 className="font-serif text-3xl font-semibold text-[#0F172A]">
                  Simple, Transparent & Frictionless
                </h3>
                <p className="text-sm text-[#64748B] mt-2">
                  No lengthy meetings, no hourly ambiguity. Commission creative work in 3 intuitive steps.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="relative p-8 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-center shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-[#5C3A1E] text-[#FAF9F5] font-serif font-bold text-lg flex items-center justify-center mx-auto mb-5 shadow-xs border border-[#A98B57]/40">
                    1
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#0F172A] mb-2">
                    Choose Service or Retainer
                  </h4>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Select a single project (e.g. 3D Product, Branding, AI Visuals) starting at ₹3,499, or the Autonomous Growth Retainer at ₹14,999/mo for daily continuous active queue output.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative p-8 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-center shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-[#5C3A1E] text-[#FAF9F5] font-serif font-bold text-lg flex items-center justify-center mx-auto mb-5 shadow-xs border border-[#A98B57]/40">
                    2
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#0F172A] mb-2">
                    Share Brief or Talk to AI
                  </h4>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Type your requirements, upload sketches and reference photos, or speak directly to our AI Concierge. Our automated pipeline initializes your creative workspace immediately.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative p-8 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-center shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-[#5C3A1E] text-[#FAF9F5] font-serif font-bold text-lg flex items-center justify-center mx-auto mb-5 shadow-xs border border-[#A98B57]/40">
                    3
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#0F172A] mb-2">
                    Receive 4K Masters in 24–48h
                  </h4>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Get finished 4K UHD masters, source files, and brand assets delivered directly into your private, permanent Sutra Cloud Vault with full commercial rights.
                  </p>
                </div>
              </div>
            </div>

            {/* Transparent Deliverables & Quantity Scaling Callout Banner */}
            <div className="bg-linear-to-r from-[#FFFDF9] via-[#FAF9F5] to-[#FFFDF9] border border-[#D4A35A]/50 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF3ED] text-[#2E7D4F] border border-[#2E7D4F]/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Exact Deliverables Guarantee</span>
                </div>
                <h4 className="font-serif text-xl font-bold text-[#0F172A]">
                  Starter Commissions (₹3,499) Include Up to 5 Curated 4K Deliverables
                </h4>
                <p className="text-xs text-[#64748B] max-w-2xl leading-relaxed">
                  Need more? Scale with Studio Growth (₹7,999) for 15x 3D renders, video ads, and 360° virtual tours, or activate the Autonomous Growth Retainer (₹14,999/mo) for daily active queue fulfillment.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link href="/pricing">
                  <Button variant="primary" size="md" withArrow>
                    View All Pricing
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="secondary" size="md">
                    Commission Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            4. FEATURED WORK / PORTFOLIO
            =================================================== */}
        <section id="projects" className="py-20 bg-[#FAF9F5] border-t border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A98B57] flex items-center gap-1.5 mb-2">
                  <span className="text-[#D4A35A] text-[10px]">◆</span>
                  <span>FEATURED WORK</span>
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
                  Our Latest Creations
                </h2>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {FILTER_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`interactive-pill focus-ring px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer ${isActive
                          ? "bg-[#5C3A1E] text-white shadow-xs"
                          : "bg-[#FFFDF9] text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A] hover:text-[#0F172A]"
                        }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* ===================================================
            5. WHITE PREMIUM EDITORIAL CTA BAND (No Dark Band)
            =================================================== */}
        <section className="relative overflow-hidden bg-[#FFFDF9] text-[#0F172A] py-20 border-t border-[#EADFCB]">
          {/* Subtle Lotus Watermark Accent */}
          <div className="absolute -bottom-16 -left-16 pointer-events-none opacity-[0.05]">
            <LotusSymbol className="w-96 h-96" color="gold" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em] bg-[#F4EFE6] text-[#5C3A1E] border border-[#EADFCB] mx-auto">
              <span className="text-[#D4A35A] text-[10px]">◆</span>
              <span>COMMISSION A PROJECT</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight text-[#0F172A]">
              Ready to Transform Your Ideas into Reality?
            </h2>
            <p className="text-base sm:text-lg text-[#64748B] max-w-xl mx-auto leading-relaxed">
              Partner with Sutra Studio to craft unforgettable digital visuals,
              immersive 3D environments, and modern applications.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/orders">
                <Button variant="primary" size="lg" withArrow>
                  Start Project
                </Button>
              </Link>

              <Link href="/chat">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<Bot className="w-4 h-4 text-[#D4A35A]" />}
                >
                  Consult AI Assistant
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Showreel Demo Modal */}
      <Modal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        title="Sutra Studio — Creative Showreel & Capabilities"
        description="A curated montage of our generative visual, 3D spatial, and architectural work."
        maxWidth="lg"
      >
        <div className="w-full">
          <VideoCard
            video="studio-reel"
            badgeText="OFFICIAL REEL"
            showTranscriptToggle
            allowExpand
          />
        </div>
      </Modal>
    </div>
  );
}
