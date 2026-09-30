"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
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

      <main className="flex-1 pb-16 md:pb-0">
        {/* ===================================================
            HERO SECTION
            =================================================== */}
        <section className="relative overflow-hidden pt-8 pb-20 md:pt-16 md:pb-28">
          <HeroAnimation>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                {/* Left Column: Hero Text & CTAs */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Eyebrow */}
                  <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
                    <span className="text-[10px] md:text-xs font-semibold tracking-[0.24em] text-[#64748B] uppercase">
                      IDEAS ◆ DESIGN ◆ DEVELOPMENT ◆ GROWTH
                    </span>
                  </div>

                  {/* Main Display Headline */}
                  <h1 className="hero-heading font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-tight text-[#0F172A]">
                    <span className="text-gold-gradient font-bold">Tradition</span>{" "}
                    Meets Technology
                  </h1>

                  {/* Subtitle */}
                  <p className="hero-subhead text-base sm:text-lg text-[#475569] max-w-xl leading-relaxed">
                    AI-Powered Creative, Design, Development & Digital Marketing
                    Solutions for Modern Businesses.
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
                      Watch Demo
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
                        Creative Services
                      </p>
                    </div>

                    <div className="hero-stats-item">
                      <p className="font-serif text-2xl sm:text-3xl font-bold text-[#5C3A1E]">
                        24/7
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                        AI Support
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Hero Architectural Visual with Arches */}
                <div className="hero-visual-card lg:col-span-5 relative">
                  <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FFFDF9] bg-[#EADFCB]">
                    {/* Arched Architectural Visual */}
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

                    {/* Center Video Play Card */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => setDemoModalOpen(true)}
                        className="group flex items-center gap-3 bg-[#FFFDF9]/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/60 shadow-lg transition-transform duration-300 hover:scale-105"
                      >
                        <span className="w-8 h-8 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </span>
                        <span className="text-xs font-semibold text-[#0F172A] tracking-wider uppercase">
                          Creative Studio
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
                            Transforming Ideas into Real Experiences
                          </p>
                          <p className="text-[11px] text-[#64748B]">
                            AI Workflow Router & Bespoke Human Craft
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative background watermark */}
                  <div className="absolute -top-12 -right-12 -z-10 opacity-25 pointer-events-none">
                    <LotusSymbol className="w-72 h-72" color="gold" />
                  </div>
                </div>
              </div>
            </div>
          </HeroAnimation>
        </section>

        {/* ===================================================
            12 SERVICES CATALOG
            =================================================== */}
        <section id="services" className="py-20 bg-[#FAF8F3] border-t border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4A35A]">
                OUR SERVICES
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#0F172A] mt-2">
                Complete Creative & Digital Solutions
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] mt-3">
                From stunning visuals to powerful digital products — everything
                your business needs, in one studio.
              </p>
            </div>

            {/* 12-Card Grid (6-col desktop -> 3-col tablet -> 2-col mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {SUTRA_SERVICES.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================
            WHY SUTRA STUDIO (TRIO)
            =================================================== */}
        <section className="py-20 bg-[#F8F5EF] border-t border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4A35A]">
                WHY SUTRA STUDIO
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A] mt-2">
                More Than a Tool — A Creative Partner
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] mt-3">
                We combine creative direction, AI technology, and real human
                expertise to deliver exceptional results.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-8 transition-all hover:border-[#D4A35A] hover:shadow-warm">
                <div className="w-12 h-12 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mb-6">
                  <Layers className="w-6 h-6 text-[#5C3A1E]" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                  Creative + Technical Expertise
                </h3>
                <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
                  Designers, developers, 3D artists, and AI prompt engineers
                  working together seamlessly under unified direction.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-8 transition-all hover:border-[#D4A35A] hover:shadow-warm">
                <div className="w-12 h-12 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-[#5C3A1E]" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                  AI-Powered Efficiency
                </h3>
                <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
                  Latest generative visual models, reasoning pipelines, and n8n
                  automation for dramatically accelerated project delivery.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-8 transition-all hover:border-[#D4A35A] hover:shadow-warm">
                <div className="w-12 h-12 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-[#5C3A1E]" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                  Business-Focused Solutions
                </h3>
                <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
                  Creative work engineered specifically to drive conversion,
                  elevate luxury brand perception, and grow business revenue.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            FEATURED WORK / PORTFOLIO
            =================================================== */}
        <section id="projects" className="py-20 bg-[#FAF8F3] border-t border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4A35A]">
                  FEATURED WORK
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A] mt-2">
                  Our Latest Creations
                </h2>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {FILTER_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#5C3A1E] text-white shadow-xs"
                          : "bg-[#FFFDF9] text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A]"
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
            DARK CTA BAND
            =================================================== */}
        <section className="relative overflow-hidden bg-dark-band text-white py-20 border-t border-[#382E25]">
          {/* Subtle Lotus Watermark Accent */}
          <div className="absolute -bottom-16 -left-16 pointer-events-none opacity-[0.08]">
            <LotusSymbol className="w-96 h-96" color="white" />
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
              Ready to Transform Your Ideas?
            </h2>
            <p className="text-base sm:text-lg text-[#D6CEBF] max-w-xl mx-auto leading-relaxed">
              Let&apos;s create something extraordinary together. Start your order
              or speak directly with our creative AI assistant.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/orders">
                <Button variant="dark" size="lg" withArrow>
                  Get Started
                </Button>
              </Link>

              <Link href="/chat">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  leftIcon={<Bot className="w-4 h-4 text-[#D4A35A]" />}
                >
                  Talk to AI Assistant
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Demo Video Modal */}
      <AnimatePresence>
        {demoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDemoModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl bg-[#0F172A] border border-[#EADFCB]/30 shadow-2xl p-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <h3 className="text-white font-serif text-lg font-semibold">
                  Sutra Studio — Creative Reel & Capabilities
                </h3>
                <button
                  onClick={() => setDemoModalOpen(false)}
                  className="text-white/60 hover:text-white text-sm"
                >
                  Close
                </button>
              </div>
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center relative">
                <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                  alt="Video Reel Preview"
                  fill
                  className="object-cover opacity-80"
                />
                <div className="relative z-10 text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-[#D4A35A] text-[#0F172A] flex items-center justify-center mx-auto shadow-xl">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                  <p className="text-white text-xs font-medium tracking-wide">
                    Sutra Studio 2026 Creative Showreel
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
