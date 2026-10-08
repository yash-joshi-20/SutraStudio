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
import { SutraParticleWings } from "@/components/canvas/SutraParticleWings";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { SutraStudioIntroLanding } from "@/components/motion/SutraStudioIntroLanding";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { SUTRA_SERVICES } from "@/data/servicesData";
import { SUTRA_PROJECTS } from "@/data/projectsData";
import { PER_PROJECT_TIERS, MONTHLY_RETAINER_TIERS } from "@/config/pricing";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
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
  ExternalLink,
  Smartphone,
  Cpu,
  Palette,
  TrendingUp,
  Sliders,
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

const HERO_DISCIPLINES = [
  { id: "visuals", label: "4K Key Visuals", output: "4K UHD PNG / TIFF", price: "₹3,499" },
  { id: "video", label: "Cinematic Reels", output: "ProRes 422 60FPS", price: "₹7,999" },
  { id: "3d", label: "3D Spatial Meshes", output: "GLB / OBJ / USDZ", price: "₹7,999" },
  { id: "interior", label: "Architectural Living", output: "8K Photorealistic", price: "₹7,999" },
  { id: "meta", label: "Meta Ads Launcher", output: "Multi-Ratio Ad Bundles", price: "₹3,499" },
  { id: "web", label: "Full-Stack Web/App", output: "High-Performance Web", price: "Custom" },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [activeHeroDiscipline, setActiveHeroDiscipline] = useState("visuals");
  const [heroRightTab, setHeroRightTab] = useState<"video" | "particle">("video");
  const [pricingCycle, setPricingCycle] = useState<"project" | "monthly">("project");

  const filteredProjects =
    selectedCategory === "All"
      ? SUTRA_PROJECTS
      : SUTRA_PROJECTS.filter((p) => p.category === selectedCategory);

  const activeDisciplineData =
    HERO_DISCIPLINES.find((d) => d.id === activeHeroDiscipline) || HERO_DISCIPLINES[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      {/* First-Visit Atelier Cinematic Landing Splash with Animated 'S' Emblem */}
      <SutraStudioIntroLanding />

      <Navbar />

      <main id="main-content" className="flex-1 pb-16 md:pb-0">
        {/* ===================================================
            1. HERO SECTION (Clean White / Warm Ivory Luxury Atelier)
            =================================================== */}
        <section className="relative overflow-hidden pt-6 pb-16 md:pt-12 md:pb-24">
          {/* Subtle Background Lotus Watermark */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 -z-10 opacity-[0.03] pointer-events-none">
            <LotusSymbol className="w-[850px] h-[850px]" color="gold" />
          </div>

          <HeroAnimation>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                {/* Left Column: Hero Narrative & CTAs */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Eyebrow Status Badge */}
                  <div className="hero-badge inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
                    <span className="text-[10px] md:text-xs font-semibold tracking-[0.22em] text-[#5C3A1E] uppercase">
                      IDEAS ◆ DESIGN ◆ DEVELOPMENT ◆ GROWTH
                    </span>
                  </div>

                  {/* Main Display Headline */}
                  <h1 className="hero-heading font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.06] tracking-tight text-[#0F172A]">
                    <span className="text-gold-gradient font-bold">Tradition</span> Meets Modern Computational Engineering
                  </h1>

                  {/* Subtitle */}
                  <p className="hero-subhead text-base sm:text-lg text-[#64748B] max-w-xl leading-relaxed font-sans">
                    Bespoke Creative Technology, 3D Spatial Design, Full-Stack Engineering &amp;
                    Digital Marketing Solutions. Rooted in traditional Indian
                    symmetry, executed with high-precision autonomous pipelines.
                  </p>

                  {/* Quick Discipline Selector Bar */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A98B57] block">
                      Production Disciplines &amp; 4K Standards:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {HERO_DISCIPLINES.map((disc) => {
                        const isSelected = activeHeroDiscipline === disc.id;
                        return (
                          <button
                            key={disc.id}
                            type="button"
                            onClick={() => setActiveHeroDiscipline(disc.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#5C3A1E] text-white shadow-xs font-semibold ring-1 ring-[#D4A35A]"
                                : "bg-[#FFFDF9] text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A] hover:text-[#0F172A]"
                            }`}
                          >
                            <span>{disc.label}</span>
                            <span className={`ml-1.5 text-[10px] font-mono ${isSelected ? "text-[#D4A35A]" : "text-[#A98B57]"}`}>
                              {disc.price}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="hero-cta flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
                    <Link href="/orders" className="w-full sm:w-auto">
                      <Button variant="primary" size="lg" withArrow className="w-full sm:w-auto shadow-warm justify-center">
                        Start Commission ({activeDisciplineData.price})
                      </Button>
                    </Link>

                    <Button
                      variant="secondary"
                      size="lg"
                      leftIcon={<Play className="w-4 h-4 text-[#5C3A1E] fill-current" />}
                      onClick={() => setDemoModalOpen(true)}
                      className="w-full sm:w-auto justify-center"
                    >
                      Watch Showreel
                    </Button>

                    <Link href="/chat" className="w-full sm:w-auto">
                      <Button
                        variant="ghost"
                        size="lg"
                        leftIcon={<Bot className="w-4 h-4 text-[#D4A35A]" />}
                        className="w-full sm:w-auto justify-center text-[#5C3A1E] hover:bg-[#F4EFE6]"
                      >
                        Studio Concierge
                      </Button>
                    </Link>
                  </div>

                  {/* Studio Capability Highlights Divided by Hairlines */}
                  <div className="hero-stats pt-8 border-t border-[#EADFCB] grid grid-cols-2 sm:grid-cols-4 gap-6">
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
                        Studio Production Pipelines
                      </p>
                    </div>

                    <div className="hero-stats-item">
                      <p className="font-serif text-lg sm:text-xl font-bold text-[#5C3A1E]">
                        24-48h SLA
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                        Rapid Turnaround
                      </p>
                    </div>

                    <div className="hero-stats-item">
                      <p className="font-serif text-lg sm:text-xl font-bold text-[#5C3A1E]">
                        100% IP Rights
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                        Sutra Cloud Vault
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Interactive Video & Particle Matrix Spotlight Card */}
                <div className="hero-visual-card lg:col-span-5 relative space-y-3">
                  {/* Mode Switcher Tabs (Showreel vs 3D Vector Matrix) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A98B57]">
                      Atelier Interactive Spotlight
                    </span>
                    <div className="inline-flex rounded-full bg-[#FFFDF9] border border-[#EADFCB] p-0.5 shadow-2xs text-[11px] self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setHeroRightTab("video")}
                        className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                          heroRightTab === "video"
                            ? "bg-[#5C3A1E] text-white"
                            : "text-[#64748B] hover:text-[#0F172A]"
                        }`}
                      >
                        Studio Reel
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroRightTab("particle")}
                        className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                          heroRightTab === "particle"
                            ? "bg-[#5C3A1E] text-white"
                            : "text-[#64748B] hover:text-[#0F172A]"
                        }`}
                      >
                        3D Sacred Matrix
                      </button>
                    </div>
                  </div>

                  <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FFFDF9] bg-[#0F172A]">
                    {heroRightTab === "video" ? (
                      <>
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
                          <div className="bg-[#FFFDF9]/95 backdrop-blur-md rounded-2xl p-4 border border-[#EADFCB] shadow-warm flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center shrink-0">
                                <Sparkles className="w-5 h-5 text-[#D4A35A]" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#0F172A]">
                                  {activeDisciplineData.label}
                                </p>
                                <p className="text-[11px] text-[#64748B]">
                                  {activeDisciplineData.output}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-[#5C3A1E]">
                              {activeDisciplineData.price}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full relative">
                        <SutraParticleWings
                          height="100%"
                          initialMode="wings"
                          interactive={true}
                          showControls={false}
                          theme="warm-gold"
                        />
                        <div className="absolute bottom-4 inset-x-4 z-10 bg-[#0F172A]/80 backdrop-blur-md rounded-xl p-3 border border-[#EADFCB]/30 text-white text-center">
                          <p className="text-[11px] font-semibold text-[#D4A35A]">
                            Interactive Vector Light Field
                          </p>
                          <p className="text-[10px] text-[#94A3B8]">
                            Touch or drag to guide mathematical particle flow
                          </p>
                        </div>
                      </div>
                    )}
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <SectionHeader
              badge="OUR 12 DISCIPLINES"
              title="Complete Creative &amp; Digital Solutions"
              subtitle="From photorealistic visual generation to enterprise web platforms — everything your business requires, crafted in one unified atelier."
              className="text-center"
            />

            {/* 12-Card Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {SUTRA_SERVICES.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {/* Bottom Service Assurance Strip */}
            <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] flex flex-wrap items-center justify-around gap-6 text-xs text-[#64748B] shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D4F]" />
                <span className="font-medium text-[#0F172A]">Dedicated Art Director on Every Order</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#C2761A]" />
                <span className="font-medium text-[#0F172A]">Rapid 24-72 Hour Delivery Pipelines</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#5C3A1E]" />
                <span className="font-medium text-[#0F172A]">Full Commercial License &amp; Sutra Cloud Vault</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            3. WHY SUTRA STUDIO & HONEST COMPARISON MATRIX
            =================================================== */}
        <section className="py-20 bg-[#F8F5EF] border-t border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <SectionHeader
              badge="WHY SUTRA STUDIO"
              title="Why Pay Sutra Studio vs Freelancers &amp; Traditional Agencies?"
              subtitle="Generic online tools produce distorted drafts. Freelancers are fragmented. Big agencies charge ₹2,00,000/mo. Sutra Studio blends computational rendering speed with Senior Human Art Direction for production-ready perfection in 24–48 hours."
              className="text-center"
            />

            {/* Core 3 Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="interactive-card rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-8 hover:border-[#D4A35A] transition-all shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center">
                  <Layers className="w-6 h-6 text-[#5C3A1E]" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                  Heritage Aesthetics + Precision
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Every asset is balanced through traditional geometric principles,
                  warm color harmonies, and timeless typographic hierarchy.
                </p>
              </div>

              <div className="interactive-card rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-8 hover:border-[#D4A35A] transition-all shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#5C3A1E]" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                  Autonomous Creative Intelligence
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  State-of-the-art computational design models, automated render
                  dispatchers, and continuous progress updates delivered to your portal.
                </p>
              </div>

              <div className="interactive-card rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-8 hover:border-[#D4A35A] transition-all shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center">
                  <Target className="w-6 h-6 text-[#5C3A1E]" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                  Business Growth &amp; Conversion
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Creative work engineered specifically to elevate luxury brand
                  perception, command premium pricing, and expand market presence.
                </p>
              </div>
            </div>

            {/* 4-Way Side-by-Side Comparison Matrix */}
            <div className="bg-[#FFFDF9] border border-[#EADFCB] rounded-3xl p-6 sm:p-10 shadow-sm">
              <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A98B57] flex items-center justify-center gap-1.5">
                  <span className="text-[#D4A35A] text-[10px]">◆</span>
                  <span>THE HONEST COMPARISON</span>
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
                  See the Direct Difference
                </h3>
                <p className="text-sm text-[#64748B]">
                  Why modern founders, brands, and agencies choose our dedicated atelier over guesswork and bloated retainers.
                </p>
              </div>

              {/* Responsive Grid Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Generic Online Tools */}
                <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Option 1</span>
                      <span className="text-xs font-bold text-[#64748B] bg-[#E5E1D8]/60 px-2.5 py-0.5 rounded-full">Free / ₹1.5k/mo</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#0F172A] mb-2">Generic Online Generators</h4>
                    <p className="text-xs text-[#64748B] mb-5 leading-relaxed">Uncalibrated prompt-and-pray generators.</p>
                    
                    <ul className="space-y-3 text-xs text-[#64748B]">
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Prompt guesswork &amp; distorted hands/text</span>
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
                        <span>Unpredictable turnaround &amp; ghosting risk</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Runaway hourly billing with no cap</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Files scattered in emails &amp; expiring links</span>
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
                      <span className="text-xs font-bold text-[#5C3A1E] bg-[#D4A35A]/20 px-2.5 py-0.5 rounded-full">From ₹499</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#0F172A] mb-2">Autonomous Atelier</h4>
                    <p className="text-xs text-[#64748B] mb-5 leading-relaxed">Computational speed + Senior Art Director Polish + Cloud Vault.</p>
                    
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
                        <span className="font-medium"><strong>Private Sutra Cloud Vault</strong> &amp; 100% Commercial IP</span>
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
          </div>
        </section>

        {/* ===================================================
            4. TRANSPARENT PRICING & COMMISSION MATRIX
            =================================================== */}
        <section id="pricing" className="py-20 bg-[#FAF9F5] border-t border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
                <span className="text-[#D4A35A] text-xs">◆</span>
                <span className="text-[10px] md:text-xs font-semibold tracking-[0.22em] text-[#5C3A1E] uppercase">
                  TRANSPARENT STUDIO INVESTMENT
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#0F172A]">
                Clear Value, <span className="text-gold-gradient">Guaranteed Excellence</span>
              </h2>

              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                Choose between single high-impact standalone deliverables starting at ₹499, studio commission packs, or our 30-Day Autonomous Retainer with daily queue fulfillment.
              </p>

              {/* Billing Cycle Toggle */}
              <div className="pt-2 flex items-center justify-center">
                <div
                  role="tablist"
                  aria-label="Billing frequency"
                  className="grid grid-cols-2 w-full max-w-xs sm:max-w-md rounded-2xl sm:rounded-full bg-[#FFFDF9] border border-[#EADFCB] p-1 shadow-xs"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={pricingCycle === "project"}
                    onClick={() => setPricingCycle("project")}
                    className={`py-2 px-2 sm:px-4 rounded-xl sm:rounded-full text-xs font-semibold cursor-pointer transition-all text-center ${
                      pricingCycle === "project"
                        ? "bg-[#5C3A1E] text-white shadow-xs"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    Per-Project
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={pricingCycle === "monthly"}
                    onClick={() => setPricingCycle("monthly")}
                    className={`py-2 px-2 sm:px-4 rounded-xl sm:rounded-full text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all text-center ${
                      pricingCycle === "monthly"
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

            {/* Dynamic Pricing Cards Grid */}
            <AnimatePresence mode="wait">
              {pricingCycle === "project" ? (
                <motion.div
                  key="project-grid"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
                >
                  {PER_PROJECT_TIERS.map((tier) => (
                    <div
                      key={tier.id}
                      className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                        tier.popular
                          ? "bg-[#FFFDF9] border-2 border-[#D4A35A] shadow-warm relative ring-1 ring-[#D4A35A]/30"
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
                          <span className="font-serif text-3xl sm:text-4xl font-bold text-[#5C3A1E]">
                            {typeof tier.price === "number" ? (
                              <AnimatedNumber value={tier.price} prefix="₹" />
                            ) : (
                              "Custom Quote"
                            )}
                          </span>
                          <span className="text-xs text-[#64748B] font-mono">
                            {tier.price === "custom" ? "" : "/ commission"}
                          </span>
                        </div>

                        {/* Feature List */}
                        <ul className="space-y-3 text-xs text-[#475569]">
                          {tier.features.map((feat) => (
                            <li key={feat} className="flex items-start gap-2.5">
                              <Check className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-8 pt-6 border-t border-[#EADFCB]/60 space-y-3">
                        <Link href={tier.ctaHref || "/orders"}>
                          <Button
                            variant={tier.popular ? "primary" : "secondary"}
                            size="md"
                            className="w-full justify-center shadow-xs"
                            withArrow
                          >
                            {tier.ctaText}
                          </Button>
                        </Link>
                        <p className="text-[11px] text-[#94A3B8] text-center">
                          Turnaround: {tier.turnaround} • Direct UPI / Bank
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="monthly-grid"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch"
                >
                  {MONTHLY_RETAINER_TIERS.map((tier) => (
                    <div
                      key={tier.id}
                      className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                        tier.popular
                          ? "bg-[#FFFDF9] border-2 border-[#D4A35A] shadow-warm relative ring-1 ring-[#D4A35A]/30"
                          : "bg-[#FFFDF9] border border-[#EADFCB] shadow-sm hover:border-[#D4A35A]/60"
                      }`}
                    >
                      {tier.popular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#5C3A1E] text-white px-4 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase shadow-xs">
                          Continuous Active Queue
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
                          <span className="font-serif text-3xl sm:text-4xl font-bold text-[#5C3A1E]">
                            <AnimatedNumber value={tier.priceMonthly} prefix="₹" />
                          </span>
                          <span className="text-xs text-[#64748B] font-mono">
                            / 30-day billing
                          </span>
                        </div>

                        {/* Feature List */}
                        <ul className="space-y-3 text-xs text-[#475569]">
                          {tier.features.map((feat) => (
                            <li key={feat} className="flex items-start gap-2.5">
                              <Check className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-8 pt-6 border-t border-[#EADFCB]/60 space-y-3">
                        <Link href={tier.ctaHref || "/orders"}>
                          <Button
                            variant={tier.popular ? "primary" : "secondary"}
                            size="md"
                            className="w-full justify-center shadow-xs"
                            withArrow
                          >
                            {tier.ctaText}
                          </Button>
                        </Link>
                        <p className="text-[11px] text-[#94A3B8] text-center">
                          {tier.monthlyQuotaDescription}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ===================================================
            5. FEATURED WORK / PORTFOLIO
            =================================================== */}
        <section id="projects" className="py-20 bg-[#F8F5EF] border-t border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A98B57] flex items-center gap-1.5 mb-2">
                  <span className="text-[#D4A35A] text-[10px]">◆</span>
                  <span>FEATURED WORK</span>
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
                  Our Latest Creations
                </h2>
              </div>

              {/* Mobile View: Category Dropdown */}
              <div className="w-full sm:hidden pt-2">
                <CustomDropdown
                  options={FILTER_CATEGORIES.map((cat) => ({
                    label: cat === "All" ? "All Disciplines" : `${cat} Creations`,
                    value: cat,
                    badge: `${
                      cat === "All"
                        ? SUTRA_PROJECTS.length
                        : SUTRA_PROJECTS.filter((p) => p.category === cat).length
                    }`,
                  }))}
                  value={selectedCategory}
                  onChange={(val) => setSelectedCategory(val)}
                  placeholder="Filter Creations"
                  buttonClassName="!rounded-full !bg-[#FFFDF9] !border-[#EADFCB] py-2 shadow-xs"
                />
              </div>

              {/* Desktop / Tablet View: Tab Pills System */}
              <div className="hidden sm:flex flex-wrap items-center gap-2">
                {FILTER_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`interactive-pill focus-ring px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer ${
                        isActive
                          ? "bg-[#5C3A1E] text-white shadow-xs font-semibold"
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
            6. FOUNDER & ATELIER LEADERSHIP SECTION
            =================================================== */}
        <section className="py-20 bg-[#FFFDF9] border-t border-[#EADFCB]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-[#FAF9F5] border border-[#EADFCB] p-8 sm:p-10 shadow-warm">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#0F172A] flex items-center justify-center text-white shadow-md shrink-0 border border-[#D4A35A]/50 p-4">
                  <LotusSymbol className="w-full h-full" color="gold" />
                </div>

                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs font-semibold text-[#A98B57] uppercase tracking-wider mb-2">
                      <span>Founder &amp; Principal Creative Technologist</span>
                    </div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A]">
                      Yash Joshi
                    </h3>
                    <p className="text-xs text-[#64748B] font-mono mt-0.5">
                      Sutra Studio Atelier • Creative Technology &amp; Spatial Systems Engineering
                    </p>
                  </div>

                  <p className="text-sm text-[#475569] leading-relaxed max-w-2xl">
                    Leading the synthesis of classical Indian aesthetic doctrines (Pramana, Rasa, Yantra) with modern spatial workflows, 4K rendering pipelines, and high-conversion commercial digital experiences.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <a
                      href="https://www.facebook.com/yashjoshisutrastudio/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] hover:border-[#D4A35A] hover:bg-[#FFFFFF] text-xs font-semibold text-[#5C3A1E] shadow-2xs transition-all"
                    >
                      <svg className="w-4 h-4 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span>Connect with Founder (Facebook Profile)</span>
                    </a>

                    <a
                      href="https://www.instagram.com/yashsutrastudio/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] hover:border-[#D4A35A] hover:bg-[#FFFFFF] text-xs font-semibold text-[#5C3A1E] shadow-2xs transition-all"
                    >
                      <svg className="w-4 h-4 fill-current text-[#E4405F]" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      <span>@yashsutrastudio</span>
                    </a>

                    <a
                      href="https://wa.me/918200192781?text=Hello%20Yash%2C%20I%20would%20like%20to%20discuss%20a%20project%20with%20Sutra%20Studio."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFDF9] border border-[#2E7D4F]/40 hover:border-[#2E7D4F] hover:bg-[#FFFFFF] text-xs font-semibold text-[#2E7D4F] shadow-2xs transition-all"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
                      <span>Studio WhatsApp Concierge</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            7. WHITE LUXURY EDITORIAL CTA BANNER
            =================================================== */}
        <section className="relative overflow-hidden bg-[#FFFDF9] text-[#0F172A] py-20 border-t border-[#EADFCB]">
          <div className="absolute -bottom-16 -left-16 pointer-events-none opacity-[0.05]">
            <LotusSymbol className="w-96 h-96" color="gold" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em] bg-[#F4EFE6] text-[#5C3A1E] border border-[#EADFCB] mx-auto">
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
                <Button variant="primary" size="lg" withArrow className="shadow-warm">
                  Start Project
                </Button>
              </Link>

              <Link href="/chat">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<Bot className="w-4 h-4 text-[#D4A35A]" />}
                >
                  Consult Studio Concierge
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
        title="Sutra Studio — Creative Showreel &amp; Capabilities"
        description="A curated montage of our commercial visual, 3D spatial, and architectural work."
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
