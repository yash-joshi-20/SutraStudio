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
    desc: "Autonomous studio pipelines, generative diffusion models, and modern web architectures delivering accelerated commercial turnarounds.",
  },
];

const MILESTONES = [
  {
    year: "2024",
    title: "Studio Inception",
    desc: "Founded as an elite creative synthesis laboratory merging Indian design principles with emerging generative AI technologies.",
  },
  {
    year: "2025",
    title: "Global Client Expansion",
    desc: "Delivered over 300 commercial visual, 3D, and web projects across Europe, the Middle East, and North America.",
  },
  {
    year: "2026",
    title: "Autonomous Delivery Platform",
    desc: "Integrated Firebase Cloud Firestore and automated delivery pipelines, launching the 24/7 client workspace and real-time AI Assistant.",
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
                  Bridging Millennia of <span className="text-gold-gradient">Indian Aesthetic Tradition</span> with Modern AI Engineering
                </h1>

                <p className="text-base sm:text-lg text-[#64748B] leading-relaxed font-sans">
                  &quot;Sutra&quot; translates from Sanskrit to an aphorism, a thread,
                  or a foundational principle connecting disparate disciplines into a
                  coherent whole. At Sutra Studio, we are the thread connecting classical
                  artistic heritage with state-of-the-art generative intelligence.
                </p>

                <p className="text-sm text-[#475569] leading-relaxed">
                  We engineer high-fidelity commercial imagery, immersive 3D spatial
                  environments, and bespoke web platforms for forward-thinking brands
                  who demand the warmth, depth, and prestige of traditional craftsmanship
                  without sacrificing digital speed.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link href="/contact">
                    <Button variant="primary" size="lg" withArrow>
                      Start a Conversation
                    </Button>
                  </Link>
                  <Link href="/services">
                    <Button variant="secondary" size="lg">
                      Explore Capabilities
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Architectural Visual Card */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FFFDF9] bg-[#EADFCB]">
                  <Image
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80"
                    alt="Sutra Studio Craft and Architectural Heritage"
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-black/10" />

                  <div className="absolute bottom-6 inset-x-6">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-center shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mx-auto mb-3">
                  <Award className="w-5 h-5 text-[#5C3A1E]" />
                </div>
                <p className="font-serif text-3xl font-bold text-[#5C3A1E]">500+</p>
                <p className="text-xs font-semibold text-[#0F172A] mt-1">Projects Delivered</p>
                <p className="text-[11px] text-[#64748B]">Across 14 countries worldwide</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-center shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mx-auto mb-3">
                  <Users className="w-5 h-5 text-[#5C3A1E]" />
                </div>
                <p className="font-serif text-3xl font-bold text-[#5C3A1E]">200+</p>
                <p className="text-xs font-semibold text-[#0F172A] mt-1">Client Partnerships</p>
                <p className="text-[11px] text-[#64748B]">From luxury brands to startups</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-center shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-5 h-5 text-[#5C3A1E]" />
                </div>
                <p className="font-serif text-3xl font-bold text-[#5C3A1E]">48 Hours</p>
                <p className="text-xs font-semibold text-[#0F172A] mt-1">Average Turnaround</p>
                <p className="text-[11px] text-[#64748B]">Rapid iterative AI pipelines</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-center shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-5 h-5 text-[#5C3A1E]" />
                </div>
                <p className="font-serif text-3xl font-bold text-[#5C3A1E]">100%</p>
                <p className="text-xs font-semibold text-[#0F172A] mt-1">Commercial Rights</p>
                <p className="text-[11px] text-[#64748B]">Full IP transfer & Drive delivery</p>
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

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact">
                <Button variant="primary" size="lg" withArrow>
                  Schedule Discovery Call
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary" size="lg">
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
