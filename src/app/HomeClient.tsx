"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Modal } from "@/components/ui/Modal";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { FeaturedSpotlightDuo } from "@/components/portfolio/FeaturedSpotlightDuo";
import { HeroAnimation } from "@/components/motion/HeroAnimation";
import { BackgroundVideo } from "@/components/media/BackgroundVideo";
import { VideoCard } from "@/components/media/VideoCard";
import { SutraParticleWings } from "@/components/canvas/SutraParticleWings";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { SutraStudioIntroLanding } from "@/components/motion/SutraStudioIntroLanding";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { MainServiceCard } from "@/components/services/MainServiceCard";
import { PricingCatalogSection } from "@/components/pricing/PricingCatalogSection";
import { MAIN_SERVICES, getMainServices } from "@/config/mainServices";
import { SUTRA_PROJECTS } from "@/data/projectsData";
import { useCms } from "@/components/providers/CmsThemeProvider";

import {
  Play,
  Sparkles,
  Layers,
  Zap,
  Target,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Check,
  X as XIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FILTER_CATEGORIES = [
  "All",
  "Website",
  "Design",
  "3D",
  "Image",
  "Video",
  "Interior",
  "Marketing",
];

/**
 * Eight main studio services (hero spotlight) — derived from the unified
 * `MAIN_SERVICES` configuration so the hero, catalogue grid, services page,
 * footer and chat concierge always agree. Links open the existing
 * `/services/[slug]` detail routes.
 */
const HERO_DISCIPLINES = MAIN_SERVICES.map((service) => ({
  id: service.slug,
  label: service.heroLabel,
  output: service.heroOutput,
  href: `/services/${service.slug}`,
}));

export default function HomePage() {
  const { cmsData } = useCms();
  const heroData = cmsData?.hero;
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [activeHeroDiscipline, setActiveHeroDiscipline] = useState("image-creation");
  const [heroRightTab, setHeroRightTab] = useState<"video" | "atelier" | "particle">("video");

  const filteredProjects =
    selectedCategory === "All"
      ? SUTRA_PROJECTS
      : SUTRA_PROJECTS.filter((p) => p.category === selectedCategory);

  const activeDisciplineData =
    HERO_DISCIPLINES.find((d) => d.id === activeHeroDiscipline) || HERO_DISCIPLINES[0];

  return (
    <div className="flex-1 flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      {/* First-Visit Atelier Cinematic Landing Splash with Animated 'S' Emblem */}
      <SutraStudioIntroLanding />

      <main id="main-content" className="flex-1 pb-28 md:pb-0 overflow-x-hidden">
        {/* ===================================================
            1. HERO SECTION (Clean White / Warm Ivory Luxury Atelier)
            =================================================== */}
        <section
          className="relative overflow-hidden pt-6 pb-16 md:pt-12 md:pb-24 transition-colors"
          style={{
            backgroundColor: heroData?.bgColor || undefined,
            backgroundImage: heroData?.bgImage ? `url("${heroData.bgImage}")` : undefined,
            backgroundSize: heroData?.bgImage ? "cover" : undefined,
            backgroundPosition: "center",
          }}
        >
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
                      {heroData?.tagline || "IDEAS ◆ DESIGN ◆ DEVELOPMENT ◆ GROWTH"}
                    </span>
                  </div>

                  {/* Main Display Headline */}
                  <h1 className="hero-heading font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.06] tracking-tight text-[#0F172A]">
                    {heroData?.title ? (
                      heroData.title
                    ) : (
                      <>
                        <span className="text-gold-gradient font-bold">Tradition</span> Meets Modern Creative Technology
                      </>
                    )}
                  </h1>

                  {/* Subtitle */}
                  <p className="hero-subhead text-base sm:text-lg text-[#64748B] max-w-xl leading-relaxed font-sans">
                    {heroData?.description ||
                      "Bespoke Creative Technology, 3D Spatial Design, Full-Stack Engineering & Digital Marketing Solutions. Rooted in traditional Indian aesthetics, executed with high-precision studio craftsmanship."}
                  </p>

                  {/* Action Buttons */}
                  <div className="hero-cta flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
                    <Link href="/orders" className="w-full sm:w-auto">
                      <Button variant="primary" size="lg" withArrow className="w-full sm:w-auto shadow-warm justify-center">
                        {heroData?.primaryCtaText || "Start Your Project Today"}
                      </Button>
                    </Link>
                    <Link href="/services" className="w-full sm:w-auto">
                      <Button variant="secondary" size="lg" className="w-full sm:w-auto justify-center">
                        {heroData?.secondaryCtaText || "Explore Solutions & Work"}
                      </Button>
                    </Link>
                  </div>

                  {/* Reassurance Micro-Strip */}
                  <div className="pt-2 flex items-center gap-4 text-xs text-[#64748B] flex-wrap">
                    <span className="flex items-center gap-1.5 font-medium text-[#5C3A1E]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F]" />
                      Fixed Scope Directives
                    </span>
                    <span className="text-[#EADFCB]">•</span>
                    <span className="font-medium">Transparent Fixed Rates</span>
                    <span className="text-[#EADFCB]">•</span>
                    <span className="font-medium">Private Drive Delivery</span>
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
                        onClick={() => setHeroRightTab("atelier")}
                        className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                          heroRightTab === "atelier"
                            ? "bg-[#5C3A1E] text-white"
                            : "text-[#64748B] hover:text-[#0F172A]"
                        }`}
                      >
                        Atelier View
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
                        3D Matrix
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
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                          <button
                            type="button"
                            onClick={() => setDemoModalOpen(true)}
                            className="group pointer-events-auto flex items-center gap-2.5 sm:gap-3 bg-[#FFFDF9]/95 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/60 shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer touch-target whitespace-nowrap"
                          >
                            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center shrink-0">
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            </span>
                            <span className="text-xs font-semibold text-[#0F172A] tracking-wider uppercase whitespace-nowrap">
                              Watch Full Reel
                            </span>
                          </button>
                        </div>

                        {/* Bottom Floating Badge */}
                        <div className="absolute bottom-3 sm:bottom-5 inset-x-3 sm:inset-x-5 z-10">
                          <div className="bg-[#FFFDF9]/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-3.5 border border-[#EADFCB] shadow-warm flex items-center justify-between gap-2.5 sm:gap-3">
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4A35A]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#0F172A] truncate">
                                  Studio Craftsmanship Reel
                                </p>
                                <p className="text-[10px] sm:text-[11px] text-[#64748B] truncate">
                                  Tradition Meets Modern Creative Technology
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] sm:text-[11px] font-semibold text-[#A98B57] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#EADFCB] shrink-0 whitespace-nowrap">
                              Studio Verified
                            </span>
                          </div>
                        </div>
                      </>
                    ) : heroRightTab === "atelier" ? (
                      <div className="w-full h-full relative">
                        <Image
                          src="/images/studio/sutra-atelier-hero.jpg"
                          alt="Sutra Studio Atelier — Editorial Creative Workspace"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 450px"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/85 via-black/20 to-transparent pointer-events-none" />
                        <div className="absolute bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-4 z-10 bg-[#FFFDF9]/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-3.5 border border-[#EADFCB] shadow-warm">
                          <div className="flex items-center justify-between gap-2.5 sm:gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg sm:rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4 text-[#D4A35A]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#0F172A] truncate">
                                  Sutra Studio Atelier
                                </p>
                                <p className="text-[10px] text-[#64748B] truncate">
                                  Warm ivory, walnut &amp; brass creative sanctuary
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold text-[#A98B57] bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#EADFCB] shrink-0 whitespace-nowrap">
                              Physical Studio
                            </span>
                          </div>
                        </div>
                      </div>
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
                  <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute -top-12 -right-12 opacity-20">
                      <LotusSymbol className="w-72 h-72" color="gold" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Full-Width Luxury Reassurance Strip (Spacious, Airy, Elegant) */}
              <div className="pt-10 border-t border-[#EADFCB] grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
                <div className="space-y-1">
                  <p className="font-serif text-sm sm:text-base font-bold text-[#5C3A1E] leading-snug">
                    Thoughtful Creative Direction
                  </p>
                  <p className="text-xs text-[#64748B] font-sans">
                    Artistic oversight across all commissions
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-serif text-sm sm:text-base font-bold text-[#5C3A1E] leading-snug">
                    Tailored Project Solutions
                  </p>
                  <p className="text-xs text-[#64748B] font-sans">
                    Scoped to your brand requirements
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-serif text-sm sm:text-base font-bold text-[#5C3A1E] leading-snug">
                    Clear Communication
                  </p>
                  <p className="text-xs text-[#64748B] font-sans">
                    Transparent milestones and reviews
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-serif text-sm sm:text-base font-bold text-[#5C3A1E] leading-snug">
                    Organized Project Delivery
                  </p>
                  <p className="text-xs text-[#64748B] font-sans">
                    Structured files in your private drive
                  </p>
                </div>
              </div>
            </div>
          </HeroAnimation>
        </section>

        {/* ===================================================
            2. STUDIO SERVICES CATALOG (Curated Demo Showcase)
            =================================================== */}
        <section id="services" className="py-20 md:py-28 bg-[#FAF9F5] border-t border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-[11px] font-semibold text-[#A98B57] uppercase tracking-widest shadow-2xs">
                  <span>◆</span>
                  <span>FLAGSHIP STUDIO DISCIPLINES</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#0F172A] tracking-tight">
                  Three Core Studio Services
                </h2>
                <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                  Engineered with senior creative direction, computational precision, and transparent milestone delivery. Explore our three primary disciplines below or view our complete catalog.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/services">
                  <Button variant="secondary" size="md" withArrow className="shadow-xs text-xs font-semibold">
                    Explore All 8 Services
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="md" className="shadow-xs text-xs font-semibold bg-[#FFFDF9] hover:bg-[#F8F5EF] text-[#5C3A1E] border-[#EADFCB]">
                    Request a Quote
                  </Button>
                </Link>
              </div>
            </div>

            {/* Exactly 3 Primary Service Cards: Digital Marketing, Web Development, App Development */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {[
                getMainServices().find((s) => s.slug === "digital-marketing"),
                getMainServices().find((s) => s.slug === "web-app-development"),
                getMainServices().find((s) => s.slug === "mobile-app-setup"),
              ]
                .filter((s): s is NonNullable<typeof s> => Boolean(s))
                .map((service) => (
                  <div key={service.id} className="transition-transform duration-300 hover:-translate-y-1">
                    <MainServiceCard service={service} />
                  </div>
                ))}
            </div>

            {/* Explore All Services Banner & Retainer Strip */}
            <div className="mt-8 p-8 sm:p-10 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-warm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-[#5C3A1E] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#D4A35A]" />
                  <span>Looking for 3D Modeling, 360° Tours, or Product Imagery?</span>
                </div>
                <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
                  We also deliver precision 3D CAD modeling, 360° virtual spaces, commercial photography renders, and curated monthly growth retainers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link href="/services">
                  <Button variant="primary" size="md" withArrow className="shadow-warm text-xs font-semibold">
                    Explore All Services
                  </Button>
                </Link>
                <Link href="/packages">
                  <Button variant="secondary" size="md" className="text-xs font-medium">
                    Browse Packages
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bottom Service Assurance Strip */}
            <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] flex flex-wrap items-center justify-around gap-6 text-xs text-[#64748B] shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D4F]" />
                <span className="font-medium text-[#0F172A]">Thoughtful Creative Direction on Every Order</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#C2761A]" />
                <span className="font-medium text-[#0F172A]">Clear Milestone-Based Project Delivery</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#5C3A1E]" />
                <span className="font-medium text-[#0F172A]">Organized Project Files in Private Client Drive</span>
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
              subtitle="Generic online tools produce distorted drafts. Freelancers are fragmented. Traditional agencies charge bloated retainers. Sutra Studio pairs disciplined design precision with senior art direction for production-ready creative work."
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
                  Streamlined Studio Production
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  High-efficiency digital production pipelines, dedicated creative
                  direction, and continuous progress updates delivered to your portal.
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

              {/* Reference-Inspired Two-Column Clarity Comparison Card */}
              <div className="mb-10 rounded-2xl bg-[#FFFFFF] border border-[#E5E1D8] shadow-xs overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E5E1D8]">
                  {/* Left Column: Traditional / Generic Roadblocks */}
                  <div className="p-6 sm:p-8 space-y-4 bg-[#FAF9F5]/40">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">
                        TRADITIONAL AGENCY &amp; FREELANCE ROADBLOCKS
                      </h4>
                    </div>
                    <p className="text-xs text-[#64748B] font-medium">
                      What usually holds back brand growth and creative momentum:
                    </p>
                    <ul className="space-y-3 text-xs text-[#64748B]">
                      <li className="flex items-start gap-2.5">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span><strong>Vague hourly billing</strong> with unpredictable invoice creep &amp; hidden charges</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span><strong>Scattered files &amp; assets</strong> across lost email threads, WhatsApp, and expiring links</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span><strong>Junior execution</strong> with unverified AI artifacts, prompt guesswork, and inconsistent quality</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span><strong>Slow 4–8 week turnarounds</strong> paired with rigid long-term agency lock-in contracts</span>
                      </li>
                    </ul>
                  </div>

                  {/* Right Column: The Sutra Studio Standard */}
                  <div className="p-6 sm:p-8 space-y-4 bg-[#FFFFFF]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D4F]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E7D4F]">
                        THE SUTRA STUDIO STANDARD (WHAT YOU GET)
                      </h4>
                    </div>
                    <p className="text-xs text-[#0F172A] font-medium">
                      Clear, customer-focused excellence delivered every time:
                    </p>
                    <ul className="space-y-3 text-xs text-[#171717]">
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                        <span><strong>Transparent fixed rates</strong> agreed upfront with zero hidden fees</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                        <span><strong>Dedicated Google Drive vault</strong> with structured, permanent client access</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                        <span><strong>Senior Art Director polish</strong> &amp; 4K UHD master render verification</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                        <span><strong>Agile daily/weekly milestones</strong> with 100% full commercial rights</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Responsive Grid Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Generic Online Tools */}
                <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Option 1</span>
                      <span className="text-xs font-bold text-[#64748B] bg-[#E5E1D8]/60 px-2.5 py-0.5 rounded-full">Free / Low-Cost Tools</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#0F172A] mb-2">Generic Online Generators</h4>
                    <p className="text-xs text-[#64748B] mb-5 leading-relaxed">Uncalibrated consumer-grade generators.</p>
                    
                    <ul className="space-y-3 text-xs text-[#64748B]">
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Trial-and-error guesswork &amp; distorted details</span>
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
                      <span className="text-xs font-bold text-[#64748B] bg-[#E5E1D8]/60 px-2.5 py-0.5 rounded-full">Per-Project Fees</span>
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
                      <span className="text-xs font-bold text-[#64748B] bg-[#E5E1D8]/60 px-2.5 py-0.5 rounded-full">Monthly Retainers</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#0F172A] mb-2">Traditional Agencies</h4>
                    <p className="text-xs text-[#64748B] mb-5 leading-relaxed">Big marketing agencies with account managers.</p>
                    
                    <ul className="space-y-3 text-xs text-[#64748B]">
                      <li className="flex items-start gap-2">
                        <XIcon className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span>Bloated long-term monthly retainers</span>
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
                      <span className="text-xs font-bold text-[#5C3A1E] bg-[#D4A35A]/20 px-2.5 py-0.5 rounded-full">Fixed Scoped Rates</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#0F172A] mb-2">Sutra Studio Atelier</h4>
                    <p className="text-xs text-[#64748B] mb-5 leading-relaxed">High-Precision Production + Senior Art Director Polish + Client Vault.</p>
                    
                    <ul className="space-y-3 text-xs text-[#171717]">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                        <span className="font-medium"><strong>Guaranteed 4K UHD Master Deliverables</strong> (curated production renders)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                        <span className="font-medium"><strong>Human Art Director Polish</strong> on every single asset</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                        <span className="font-medium"><strong>Clear Project Milestones</strong> with regular progress updates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                        <span className="font-medium"><strong>All Core Disciplines in 1 Place</strong> (Visuals, Video, 3D, Interior, Web, Ads, Marketing)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                        <span className="font-medium"><strong>Organized Project Files</strong> &amp; full commercial usage rights</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E5E1D8]">
                    <Link href="/services">
                      <Button variant="primary" size="sm" className="w-full justify-center text-xs">
                        Get Started Today
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            4. SERVICES CTA BAND (routes to services & packages)
            =================================================== */}
        <section className="py-12 bg-[#FAF9F5] border-t border-[#EADFCB]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
              <div className="text-center sm:text-left space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A98B57]">
                  Services &amp; Packages
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#0F172A]">
                  Browse our full service catalog &amp; curated packages
                </h2>
                <p className="text-sm text-[#64748B]">
                  From single creative deliverables to complete website builds and monthly retainers — every scope is listed upfront.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <Link href="/services">
                  <Button variant="primary" size="md" withArrow className="whitespace-nowrap">
                    View All Services
                  </Button>
                </Link>
                <Link href="/packages">
                  <Button variant="secondary" size="md" className="whitespace-nowrap">
                    Browse Packages
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            4B. CANONICAL PRICING & PACKAGES (SHARED COMPONENT)
            =================================================== */}
        <section id="pricing" className="py-16 md:py-24 bg-[#FAF9F5] border-t border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PricingCatalogSection variant="home" />
          </div>
        </section>

        {/* ===================================================
            5. FEATURED WORK / PORTFOLIO
            =================================================== */}
        <section id="projects" className="py-20 bg-[#F8F5EF] border-t border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A98B57] flex items-center gap-1.5 mb-2">
                <span className="text-[#D4A35A] text-[10px]">◆</span>
                <span>FEATURED WORK &amp; CLIENT DELIVERABLES</span>
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#0F172A]">
                Recent Studio Showcases
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] mt-2 max-w-2xl font-sans">
                Explore verified client platforms, interactive 3D digital twins, and architectural digital experiences created by Sutra Studio.
              </p>
            </div>

            {/* Curated Premier Duo Showcase (Koenigsegg Apex Velocity & Vitrine Salon) */}
            <FeaturedSpotlightDuo />

            {/* Complete Portfolio Archive Grid with Filter System */}
            <div className="pt-8 border-t border-[#EADFCB] space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                    Complete Portfolio Archive
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">
                    Filter by discipline to explore deliverables across website, 3D, motion, and design.
                  </p>
                </div>

                {/* Mobile View: Category Dropdown */}
                <div className="w-full md:hidden pt-2">
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

                {/* Desktop View: Tab Pills System */}
                <div className="hidden md:flex flex-wrap items-center gap-2">
                  {FILTER_CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`interactive-pill focus-ring px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap shrink-0 ${
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
                    Leading the synthesis of classical Indian aesthetic doctrines (Pramana, Rasa, Yantra) with modern spatial workflows, 4K digital production, and high-conversion commercial digital experiences.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center md:justify-start gap-2.5 sm:gap-3 w-full">
                    <a
                      href="https://www.facebook.com/yashjoshisutrastudio/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center sm:justify-start gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] hover:border-[#D4A35A] hover:bg-[#FFFFFF] text-xs font-semibold text-[#5C3A1E] shadow-2xs transition-all text-center"
                    >
                      <svg className="w-4 h-4 fill-current text-[#1877F2] shrink-0" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span className="truncate">Yash Joshi (Facebook)</span>
                    </a>

                    <a
                      href="https://www.instagram.com/yashsutrastudio/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center sm:justify-start gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] hover:border-[#D4A35A] hover:bg-[#FFFFFF] text-xs font-semibold text-[#5C3A1E] shadow-2xs transition-all text-center"
                    >
                      <svg className="w-4 h-4 fill-current text-[#E4405F] shrink-0" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      <span className="truncate">@yashsutrastudio</span>
                    </a>

                    <a
                      href="https://wa.me/918200192781?text=Hello%20Yash%2C%20I%20would%20like%20to%20discuss%20a%20project%20with%20Sutra%20Studio."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center sm:justify-start gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#2E7D4F]/40 hover:border-[#2E7D4F] hover:bg-[#FFFFFF] text-xs font-semibold text-[#2E7D4F] shadow-2xs transition-all text-center"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping shrink-0" />
                      <span className="truncate">Studio WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

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
