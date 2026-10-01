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

                  {/* Stats Strip Divided by Hairlines */}
                  <div className="hero-stats pt-8 mt-6 border-t border-[#EADFCB] grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div className="hero-stats-item">
                      <p className="font-serif text-2xl sm:text-3xl font-bold text-[#5C3A1E]">
                        500+
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                        Projects Delivered
                      </p>
                    </div>

                    <div className="hero-stats-item">
                      <p className="font-serif text-2xl sm:text-3xl font-bold text-[#5C3A1E]">
                        200+
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                        Happy Clients
                      </p>
                    </div>

                    <div className="hero-stats-item">
                      <p className="font-serif text-2xl sm:text-3xl font-bold text-[#5C3A1E]">
                        12
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                        Creative Pillars
                      </p>
                    </div>

                    <div className="hero-stats-item">
                      <p className="font-serif text-2xl sm:text-3xl font-bold text-[#5C3A1E]">
                        24/7
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                        AI Workflow Support
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Architectural Visual Card with SUTRA Emblem */}
                <div className="hero-visual-card lg:col-span-5 relative">
                  <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FFFDF9] bg-[#EADFCB]">
                    {/* Architectural Living & Design Visual */}
                    <Image
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
                      alt="Sutra Studio Architecture and Living"
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-black/20" />

                    {/* Center Video Play Badge */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => setDemoModalOpen(true)}
                        className="group flex items-center gap-3 bg-[#FFFDF9]/95 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/60 shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer"
                      >
                        <span className="w-8 h-8 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </span>
                        <span className="text-xs font-semibold text-[#0F172A] tracking-wider uppercase">
                          Watch Reel
                        </span>
                      </button>
                    </div>

                    {/* Bottom Floating Badge */}
                    <div className="absolute bottom-6 inset-x-6">
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
                <span>Full Commercial License & Google Drive Storage</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            3. WHY SUTRA STUDIO (Core Pillars)
            =================================================== */}
        <section className="py-20 bg-[#F8F5EF] border-t border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              badge="WHY SUTRA STUDIO"
              title="More Than a Tool — A Creative Partner"
              subtitle="We harmonize traditional Indian aesthetic proportions with autonomous AI pipelines and experienced human craftsmanship."
              className="mb-14"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="interactive-card rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-8 hover:border-[#D4A35A]">
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
              <div className="interactive-card rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-8 hover:border-[#D4A35A]">
                <div className="w-12 h-12 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-[#5C3A1E]" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                  Autonomous AI Workflows (n8n)
                </h3>
                <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
                  State-of-the-art multimodal reasoning models, automated render
                  dispatchers, and continuous progress updates delivered to your portal.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="interactive-card rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-8 hover:border-[#D4A35A]">
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
                      className={`interactive-pill focus-ring px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer ${
                        isActive
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
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center relative shadow-inner">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
            alt="Video Reel Preview"
            fill
            className="object-cover opacity-80"
          />
          <div className="relative z-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#D4A35A] text-[#0F172A] flex items-center justify-center mx-auto shadow-2xl transition-transform hover:scale-110 cursor-pointer">
              <Play className="w-7 h-7 fill-current ml-1" />
            </div>
            <p className="text-white text-xs font-semibold tracking-wider uppercase">
              Sutra Studio 2026 Reel Active
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
