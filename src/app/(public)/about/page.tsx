"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BackgroundVideo } from "@/components/media/BackgroundVideo";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import {
  Award,
  Shield,
  Clock,
  Users,
  Compass,
  Sparkles,
  Layers,
  ArrowRight,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

const PILLARS = [
  {
    icon: Compass,
    sanskrit: "प्रमाण (Pramana)",
    title: "Proportion & Symmetry",
    desc: "Rooted in classical Vastu and temple architectural mathematics, every layout, 3D model, and digital frame respects timeless geometric balance.",
  },
  {
    icon: Sparkles,
    sanskrit: "रस (Rasa)",
    title: "Emotional Resonance",
    desc: "Visuals that go beyond generic corporate aesthetics to evoke tactile warmth, understated luxury, and genuine human connection.",
  },
  {
    icon: Layers,
    sanskrit: "यन्त्र (Yantra)",
    title: "Algorithmic Precision",
    desc: "Autonomous studio pipelines, distributed rendering clusters, and modern web architectures delivering accelerated commercial turnarounds.",
  },
];

const MILESTONES = [
  {
    year: "2024",
    title: "Studio Inception",
    desc: "Founded as an elite creative synthesis laboratory merging Indian design principles with high-performance computational systems.",
  },
  {
    year: "2025",
    title: "Global Client Expansion",
    desc: "Delivered over 300 commercial visual, 3D, and web projects across Europe, the Middle East, and North America.",
  },
  {
    year: "2026",
    title: "Autonomous Delivery Platform",
    desc: "Integrated Firebase Cloud Firestore and automated delivery pipelines, launching the 24/7 client workspace and real-time Studio Concierge.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      <Navbar />

      <main id="main-content" className="flex-1 pb-20">
        {/* ===================================================
            1. HERO SECTION (Split Editorial)
            =================================================== */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28">
          <div className="absolute top-10 right-10 -z-10 opacity-[0.03] pointer-events-none">
            <LotusSymbol className="w-[600px] h-[600px]" color="gold" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Narrative */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
                  <span className="text-[#D4A35A] text-xs">◆</span>
                  <span className="text-[10px] md:text-xs font-semibold tracking-[0.22em] text-[#5C3A1E] uppercase">
                    HERITAGE & PHILOSOPHY
                  </span>
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.12] tracking-tight text-[#0F172A]">
                  Bridging Millennia of <span className="text-gold-gradient">Indian Aesthetic Tradition</span> with Advanced Computational Engineering
                </h1>

                <p className="text-base sm:text-lg text-[#64748B] leading-relaxed font-sans">
                  &quot;Sutra&quot; translates from Sanskrit to an aphorism, a thread,
                  or a foundational principle connecting disparate disciplines into a
                  coherent whole. At Sutra Studio, we are the thread connecting classical
                  artistic heritage with state-of-the-art spatial and computational design.
                </p>

                <p className="text-sm text-[#475569] leading-relaxed">
                  We engineer high-fidelity commercial imagery, immersive 3D spatial
                  environments, and bespoke web platforms for forward-thinking brands
                  who demand the warmth, depth, and prestige of traditional craftsmanship
                  without sacrificing digital speed.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 max-w-md">
                  <Link href="/contact" className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" withArrow className="w-full sm:w-auto justify-center shadow-warm">
                      Start a Conversation
                    </Button>
                  </Link>
                  <Link href="/services" className="w-full sm:w-auto">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto justify-center">
                      Explore Capabilities
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Architectural Visual Card with Video */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FFFDF9] bg-[#0F172A]">
                  <BackgroundVideo
                    video="studio-reel"
                    layout="fill"
                    overlay="dark-editorial"
                    overlayOpacity={0.6}
                    priority
                    showPlayPauseToggle
                  />

                  <div className="absolute bottom-6 inset-x-6 z-10">
                    <div className="bg-[#FFFDF9]/95 backdrop-blur-md rounded-2xl p-4 border border-[#EADFCB] shadow-warm">
                      <p className="text-xs font-serif font-bold text-[#0F172A]">
                        &quot;Form is empty without spirit; spirit is invisible without form.&quot;
                      </p>
                      <p className="text-[10px] text-[#A98B57] mt-1 font-semibold uppercase tracking-wider">
                        Sutra Studio Foundational Ethos
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-8 -left-8 -z-10 opacity-20 pointer-events-none">
                  <LotusSymbol className="w-56 h-56" color="gold" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            2. HERITAGE TRUST METRICS
            =================================================== */}
        <section className="py-12 bg-[#FAF9F5] border-y border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              <div className="p-4 sm:p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-center shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mx-auto mb-2.5">
                    <Award className="w-5 h-5 text-[#5C3A1E]" />
                  </div>
                  <p className="font-serif text-base sm:text-lg md:text-2xl font-bold text-[#5C3A1E] leading-tight">High-Precision</p>
                  <p className="text-xs font-semibold text-[#0F172A] mt-1">Studio Architecture</p>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#64748B] mt-1">Tradition meets computation</p>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-center shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mx-auto mb-2.5">
                    <Users className="w-5 h-5 text-[#5C3A1E]" />
                  </div>
                  <p className="font-serif text-base sm:text-lg md:text-2xl font-bold text-[#5C3A1E] leading-tight">Autonomous</p>
                  <p className="text-xs font-semibold text-[#0F172A] mt-1">Creative Pipelines</p>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#64748B] mt-1">Tailored client sanctum</p>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-center shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mx-auto mb-2.5">
                    <Clock className="w-5 h-5 text-[#5C3A1E]" />
                  </div>
                  <p className="font-serif text-base sm:text-lg md:text-2xl font-bold text-[#5C3A1E] leading-tight">24-48h SLA</p>
                  <p className="text-xs font-semibold text-[#0F172A] mt-1">Production Turnaround</p>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#64748B] mt-1">Rapid iterative studio cycles</p>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-center shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mx-auto mb-2.5">
                    <Shield className="w-5 h-5 text-[#5C3A1E]" />
                  </div>
                  <p className="font-serif text-base sm:text-lg md:text-2xl font-bold text-[#5C3A1E] leading-tight">100%</p>
                  <p className="text-xs font-semibold text-[#0F172A] mt-1">Commercial Rights</p>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#64748B] mt-1">Full IP transfer &amp; Sutra Cloud Vault</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            3. THE SUTRA TRIAD (Guiding Philosophy)
            =================================================== */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              badge="THE SUTRA TRIAD"
              title="Three Pillars of Creative Synthesis"
              subtitle="Our work stands at the intersection of classical Indian aesthetic doctrines and modern autonomous computing."
              className="mb-16"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="p-8 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs hover:border-[#D4A35A] hover:shadow-warm transition-all duration-300 space-y-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#5C3A1E]" />
                    </div>
                    <span className="text-xs font-semibold tracking-wider text-[#A98B57] block">
                      {pillar.sanskrit}
                    </span>
                    <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================
            4. STUDIO MILESTONES (Timeline)
            =================================================== */}
        <section className="py-16 bg-[#FAF9F5] border-t border-[#EADFCB]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              badge="PROGRESSION"
              title="The Evolution of Sutra Studio"
              subtitle="From an experimental creative lab to a full-stack design and automation power."
              className="mb-14"
            />

            <div className="space-y-6">
              {MILESTONES.map((item) => (
                <div
                  key={item.year}
                  className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-xs"
                >
                  <span className="px-4 py-2 rounded-xl bg-[#5C3A1E] text-white font-serif font-bold text-lg shrink-0">
                    {item.year}
                  </span>
                  <div>
                    <h4 className="font-serif text-lg font-semibold text-[#0F172A]">
                      {item.title}
                    </h4>
                    <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================
            4B. FOUNDER & ATELIER LEADERSHIP
            =================================================== */}
        <section className="py-20 bg-[#FFFDF9] border-t border-[#EADFCB]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              badge="LEADERSHIP & CRAFT"
              title="Founder & Atelier Direction"
              subtitle="Guided by a singular vision to harmonize ancient Indian proportion with cutting-edge computational intelligence."
              className="mb-12 text-center"
            />

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
                      <span>Connect with Yash Joshi (Founder Facebook Profile)</span>
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
            5. PRE-FOOTER INVITATION BANNER
            =================================================== */}
        <section className="py-20 bg-[#FFFDF9] border-t border-[#EADFCB]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em] bg-[#F4EFE6] text-[#5C3A1E] border border-[#EADFCB] mx-auto">
              <span className="text-[#D4A35A] text-[10px]">◆</span>
              <span>PARTNER WITH US</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#0F172A]">
              Let&apos;s Build Timeless Digital Experiences
            </h2>
            <p className="text-base text-[#64748B] max-w-xl mx-auto leading-relaxed">
              Whether you are revamping your architectural brand, commissioning
              photorealistic 3D assets, or scaling an enterprise web platform,
              we are your dedicated creative partner.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
              <Link href="/contact" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" withArrow className="w-full sm:w-auto justify-center shadow-warm">
                  Schedule Discovery Call
                </Button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto justify-center">
                  View Transparent Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
