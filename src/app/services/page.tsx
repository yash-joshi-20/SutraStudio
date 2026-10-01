"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { SUTRA_SERVICES, ServiceItem } from "@/data/servicesData";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import {
  Image as ImageIcon,
  Video,
  Box,
  Compass,
  Home,
  Grid,
  TrendingUp,
  Share2,
  Globe,
  Layout,
  Smartphone,
  Cpu,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Shield,
  Search,
  Sparkles,
  Bot,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  "All",
  "Creative",
  "Design",
  "Development",
  "Marketing",
  "Automation",
];

const ICON_MAP: Record<string, React.ReactNode> = {
  Image: <ImageIcon className="w-5 h-5 text-[#5C3A1E]" />,
  Video: <Video className="w-5 h-5 text-[#5C3A1E]" />,
  Box: <Box className="w-5 h-5 text-[#5C3A1E]" />,
  Compass: <Compass className="w-5 h-5 text-[#5C3A1E]" />,
  Home: <Home className="w-5 h-5 text-[#5C3A1E]" />,
  Grid: <Grid className="w-5 h-5 text-[#5C3A1E]" />,
  TrendingUp: <TrendingUp className="w-5 h-5 text-[#5C3A1E]" />,
  Share2: <Share2 className="w-5 h-5 text-[#5C3A1E]" />,
  Globe: <Globe className="w-5 h-5 text-[#5C3A1E]" />,
  Layout: <Layout className="w-5 h-5 text-[#5C3A1E]" />,
  Smartphone: <Smartphone className="w-5 h-5 text-[#5C3A1E]" />,
  Cpu: <Cpu className="w-5 h-5 text-[#5C3A1E]" />,
};

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const filteredServices = SUTRA_SERVICES.filter((service) => {
    const matchesCategory =
      activeCategory === "All" || service.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Subtle Background Lotus Watermark */}
        <div className="absolute top-10 right-10 -z-10 opacity-[0.03] pointer-events-none">
          <LotusSymbol className="w-[700px] h-[700px]" color="gold" />
        </div>

        {/* ===================================================
            1. HEADER INTRO & SEARCH BAR
            =================================================== */}
        <section className="pt-12 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
              <span className="text-[#D4A35A] text-xs">◆</span>
              <span className="text-[10px] md:text-xs font-semibold tracking-[0.22em] text-[#5C3A1E] uppercase">
                STUDIO CAPABILITIES & DELIVERABLES
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] text-[#0F172A]">
              12 Creative & Digital <span className="text-gold-gradient">Service Solutions</span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed font-sans">
              Precision visual generation, architectural rendering, enterprise web
              architecture, and autonomous marketing pipelines engineered to accelerate
              your brand growth.
            </p>

            {/* Search Input Bar */}
            <div className="pt-4 max-w-md mx-auto">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search service, keyword or deliverable..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A] focus:ring-2 focus:ring-[#D4A35A]/30 transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 text-xs font-semibold text-[#94A3B8] hover:text-[#0F172A]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                const count =
                  cat === "All"
                    ? SUTRA_SERVICES.length
                    : SUTRA_SERVICES.filter((s) => s.category === cat).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#5C3A1E] text-white shadow-xs border border-[#5C3A1E]"
                        : "bg-[#FFFDF9] text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A]"
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#F8F5EF] text-[#64748B]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================
            2. SERVICES GRID
            =================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {filteredServices.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-12 max-w-lg mx-auto space-y-4">
              <Search className="w-12 h-12 text-[#94A3B8] mx-auto opacity-50" />
              <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                No Services Found
              </h3>
              <p className="text-sm text-[#64748B]">
                No creative services matched your query &quot;{searchQuery}&quot;. Try resetting your filters.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {filteredServices.map((service) => {
                  const icon = ICON_MAP[service.icon] || <Cpu className="w-5 h-5 text-[#5C3A1E]" />;

                  return (
                    <motion.div
                      key={service.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="group flex flex-col justify-between rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 transition-all duration-300 hover:border-[#D4A35A] hover:shadow-warm-hover"
                    >
                      <div>
                        {/* Top Meta Bar */}
                        <div className="flex items-center justify-between mb-5">
                          <div className="w-12 h-12 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB]/80 flex items-center justify-center transition-colors group-hover:bg-[#F4EFE6]">
                            {icon}
                          </div>
                          <Badge variant="gold" size="sm" showDot={false}>
                            {service.category}
                          </Badge>
                        </div>

                        {/* Title & Tagline */}
                        <h3 className="font-serif text-xl font-semibold text-[#0F172A] tracking-tight group-hover:text-[#5C3A1E] transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-xs font-semibold text-[#A98B57] mt-0.5 mb-3 tracking-wide">
                          {service.tagline}
                        </p>
                        <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3 mb-4">
                          {service.description}
                        </p>

                        {/* Deliverables Checklist */}
                        <div className="space-y-1.5 pt-3 border-t border-[#EADFCB]/50">
                          {service.deliverables.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-[11px] text-[#475569]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0" />
                              <span className="truncate">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer: Starting Price & Quick Actions */}
                      <div className="mt-6 pt-4 border-t border-[#EADFCB]/60 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#94A3B8] uppercase block tracking-wider font-semibold">
                            Starting from
                          </span>
                          <span className="font-serif text-lg font-bold text-[#5C3A1E]">
                            {service.startingPrice}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedService(service)}
                            title="Inspect Scope & Workflow"
                            className="p-2 rounded-xl bg-[#F8F5EF] text-[#5C3A1E] border border-[#EADFCB] hover:border-[#D4A35A] transition-colors cursor-pointer text-xs"
                          >
                            Details
                          </button>
                          <Link href={`/orders?service=${service.slug}`}>
                            <div className="w-9 h-9 rounded-xl bg-[#5C3A1E] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-xs cursor-pointer">
                              <ArrowUpRight className="w-4 h-4" />
                            </div>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        {/* ===================================================
            3. STUDIO DELIVERY GUARANTEES
            =================================================== */}
        <section className="py-12 bg-[#FAF9F5] border-y border-[#EADFCB] mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4 p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#2E7D4F]" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                    Dedicated Art Director
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    Every deliverable is supervised and refined by an experienced
                    creative lead ensuring high artistic rigor.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#C2761A]" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                    24 – 72 Hour Turnarounds
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    Autonomous n8n generative pipelines and accelerated review
                    cycles designed for fast-moving businesses.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-[#5C3A1E]" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                    Google Drive Vault Storage
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    Raw source files, 4K renders, and 3D assets automatically
                    archived in your private encrypted Google Drive.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            4. PRE-FOOTER CUSTOM SCOPE CTA
            =================================================== */}
        <section className="py-20 bg-[#FFFDF9]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em] bg-[#F4EFE6] text-[#5C3A1E] border border-[#EADFCB] mx-auto">
              <span className="text-[#D4A35A] text-[10px]">◆</span>
              <span>BESPOKE PACKAGES</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#0F172A]">
              Need a Custom Cross-Discipline Scope?
            </h2>
            <p className="text-base text-[#64748B] max-w-xl mx-auto leading-relaxed">
              Combine 3D spatial renders, promotional video creation, and custom web
              architecture under a single unified studio retainer.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact">
                <Button variant="primary" size="lg" withArrow>
                  Request Custom Proposal
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

      {/* ===================================================
          SERVICE DETAIL INSPECTION MODAL
          =================================================== */}
      <Modal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        title={selectedService?.name || "Service Scope"}
        description={selectedService?.tagline}
        maxWidth="lg"
      >
        {selectedService && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#64748B]">Category</span>
                <p className="font-bold text-[#0F172A]">{selectedService.category}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#64748B]">Starting Investment</span>
                <p className="font-serif text-xl font-bold text-[#5C3A1E]">
                  {selectedService.startingPrice}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A98B57] mb-2">
                Deliverable Specifications
              </h4>
              <ul className="space-y-2">
                {selectedService.deliverables.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-sm text-[#0F172A]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D4F] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A98B57] mb-2">
                Workflow & Pipeline
              </h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Executed through our {selectedService.workflow} generative pipeline.
                Includes initial creative moodboarding, automated draft render,
                art-director human pass, and cloud delivery to your Google Drive vault.
              </p>
            </div>

            <div className="pt-4 border-t border-[#EADFCB] flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedService(null)}
              >
                Close Preview
              </Button>
              <Link href={`/orders?service=${selectedService.slug}`} className="w-full sm:w-auto">
                <Button variant="primary" size="md" withArrow className="w-full">
                  Commission {selectedService.name}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
