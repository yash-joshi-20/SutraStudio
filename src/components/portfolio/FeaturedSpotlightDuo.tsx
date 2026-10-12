"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SUTRA_PROJECTS, ProjectItem } from "@/data/projectsData";
import { ArrowUpRight, CheckCircle2, Sparkles, X, Box, Globe, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FeaturedSpotlightDuo() {
  const [activeModalProject, setActiveModalProject] = useState<ProjectItem | null>(null);

  const koenigsegg = SUTRA_PROJECTS.find((p) => p.id === "proj-koenigsegg-velocity");
  const vitrine = SUTRA_PROJECTS.find((p) => p.id === "proj-vitrine-salon");

  if (!koenigsegg || !vitrine) return null;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
            <span>Curated Studio Spotlights</span>
          </div>
          <span className="text-xs text-[#64748B] hidden sm:inline">
            Click any showcase to inspect deliverables
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* =========================================================
              1. KOENIGSEGG APEX VELOCITY (3D Digital Automotive Twin)
              ========================================================= */}
          <div
            onClick={() => setActiveModalProject(koenigsegg)}
            className="group relative cursor-pointer overflow-hidden rounded-3xl bg-[#090D14] border border-[#1E293B] shadow-2xl transition-all duration-500 hover:border-[#38BDF8]/60 hover:shadow-[0_20px_50px_rgba(56,189,248,0.15)] flex flex-col justify-between"
          >
            <div>
              {/* Image Preview Container */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#020617]">
                <Image
                  src={koenigsegg.thumbnail}
                  alt={koenigsegg.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090D14] via-transparent to-black/30" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-[#0284C7]/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white shadow-sm flex items-center gap-1.5">
                    <Box className="w-3 h-3" />
                    3D Digital Twin
                  </span>
                  <span className="rounded-full bg-black/75 backdrop-blur-md px-3 py-1 text-[11px] font-mono text-[#38BDF8] border border-[#38BDF8]/30">
                    Agera RS × Regera
                  </span>
                </div>

                <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowUpRight className="w-4 h-4 text-[#38BDF8]" />
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-8 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
                  <span className="text-[#38BDF8] font-semibold">APEX VELOCITY</span>
                  <span>Interactive 3D Twin • 2026</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                  Koenigsegg Apex Velocity
                </h3>

                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed line-clamp-2">
                  The duality of extreme velocity. Interactive 3D vehicle reveal sequence, comparative powertrain specifications, and aerodynamic telemetry visualization.
                </p>

                {/* Key Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#0F172A] border border-[#1E293B] text-[#E2E8F0]">
                    Reveal Sequence
                  </span>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#0F172A] border border-[#1E293B] text-[#E2E8F0]">
                    Comparative Specs
                  </span>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#0F172A] border border-[#1E293B] text-[#E2E8F0]">
                    Powertrain &amp; Aero
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0">
              <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between text-xs text-[#94A3B8]">
                <span className="text-[#38BDF8] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
                  Interactive Sequence Ready
                </span>
                <span className="group-hover:translate-x-1 transition-transform font-medium text-white flex items-center gap-1">
                  Inspect Showcase →
                </span>
              </div>
            </div>
          </div>

          {/* =========================================================
              2. VITRINE SALON & SPA (Luxury Beauty Atelier & Booking Portal)
              ========================================================= */}
          <div
            onClick={() => setActiveModalProject(vitrine)}
            className="group relative cursor-pointer overflow-hidden rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-warm transition-all duration-500 hover:border-[#D4A35A] hover:shadow-[0_20px_50px_rgba(92,58,30,0.12)] flex flex-col justify-between"
          >
            <div>
              {/* Image Preview Container */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#F8F5EF]">
                <Image
                  src={vitrine.thumbnail}
                  alt={vitrine.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FFFDF9] via-transparent to-black/20" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-[#5C3A1E] backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white shadow-sm flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-[#D4A35A]" />
                    Client Deliverable
                  </span>
                  <span className="rounded-full bg-[#2E7D4F] backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white shadow-xs">
                    CRM Portal Live
                  </span>
                </div>

                <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-[#0F172A] border border-[#EADFCB] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm">
                  <ArrowUpRight className="w-4 h-4 text-[#5C3A1E]" />
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-8 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#64748B]">
                  <span className="text-[#5C3A1E] font-semibold">VITRINE ATELIER</span>
                  <span>Brand &amp; Web Platform • 2026</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A] group-hover:text-[#5C3A1E] transition-colors">
                  Vitrine Salon &amp; Spa
                </h3>

                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed line-clamp-2">
                  Look better, feel brighter. Serene beauty atelier digital presence engineered with arched architectural aesthetic motifs, treatment menus, and live appointment booking.
                </p>

                {/* Key Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#FAF9F5] border border-[#EADFCB] text-[#5C3A1E]">
                    Editorial Architecture
                  </span>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#FAF9F5] border border-[#EADFCB] text-[#5C3A1E]">
                    Online Appointments
                  </span>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#FAF9F5] border border-[#EADFCB] text-[#5C3A1E]">
                    CRM Portal
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0">
              <div className="pt-4 border-t border-[#EADFCB] flex items-center justify-between text-xs text-[#64748B]">
                <span className="text-[#2E7D4F] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
                  Live Client Deployment
                </span>
                <span className="group-hover:translate-x-1 transition-transform font-medium text-[#5C3A1E] flex items-center gap-1">
                  Inspect Showcase →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          INSPECTION MODAL FOR SPOTLIGHT PROJECTS
          ========================================================= */}
      <AnimatePresence>
        {activeModalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalProject(null)}
              className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 md:p-10 shadow-2xl z-10 space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalProject(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[#0F172A] flex items-center justify-center hover:bg-[#EADFCB] transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-2 pr-12">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-[#5C3A1E] text-[#D4A35A] text-xs font-bold uppercase tracking-wider">
                    {activeModalProject.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#2E7D4F] text-white text-xs font-semibold">
                    {activeModalProject.projectType}
                  </span>
                  <span className="text-xs font-mono text-[#64748B]">
                    Client: {activeModalProject.client} • {activeModalProject.year}
                  </span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A]">
                  {activeModalProject.title}
                </h3>
              </div>

              {/* Large Image View */}
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[#EADFCB] bg-[#0F172A] shadow-md">
                <Image
                  src={activeModalProject.thumbnail}
                  alt={activeModalProject.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1200px) 100vw, 900px"
                />
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h4 className="font-serif text-lg font-bold text-[#0F172A]">
                  Project Overview &amp; Specifications
                </h4>
                <p className="text-sm text-[#475569] leading-relaxed">
                  {activeModalProject.description}
                </p>
              </div>

              {/* Deliverables Checklist */}
              {activeModalProject.deliverables && activeModalProject.deliverables.length > 0 && (
                <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-3">
                  <span className="text-xs font-mono font-bold text-[#5C3A1E] uppercase tracking-wider block">
                    Verified Project Deliverables:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#0F172A]">
                    {activeModalProject.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#EADFCB]">
                <span className="text-xs text-[#64748B]">
                  Status: <strong className="text-[#0F172A]">{activeModalProject.status}</strong>
                </span>

                <div className="flex items-center gap-3">
                  {activeModalProject.liveUrl && (
                    <a
                      href={activeModalProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5C3A1E] text-white text-xs font-semibold hover:bg-[#432A15] transition-colors shadow-sm"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#D4A35A]" />
                      Visit Live Platform
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => setActiveModalProject(null)}
                    className="px-5 py-2.5 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-xs font-semibold text-[#0F172A] hover:bg-[#EADFCB] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
