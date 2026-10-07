"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { SUTRA_PROJECTS } from "@/data/projectsData";

const PROJECT_CATEGORIES = [
  "All",
  "Image",
  "Video",
  "3D",
  "Interior",
  "Website",
  "Marketing",
];

export default function ProjectsPage() {
  const [selectedCat, setSelectedCat] = useState("All");

  const filtered =
    selectedCat === "All"
      ? SUTRA_PROJECTS
      : SUTRA_PROJECTS.filter((p) => p.category === selectedCat);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A]">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 w-full">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
            <span className="text-[#D4A35A] text-xs">◆</span>
            <span className="text-[10px] md:text-xs font-semibold tracking-[0.22em] text-[#5C3A1E] uppercase">
              PORTFOLIO SHOWCASE
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#0F172A] leading-tight">
            Featured Projects &amp; <span className="text-gold-gradient">Case Studies</span>
          </h1>

          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-2xl mx-auto font-sans">
            Explore our latest creative outputs across photorealistic 3D,
            architectural films, brand portals, and Meta growth campaigns.
          </p>

          {/* Mobile View: Custom Dropdown Filter */}
          <div className="w-full max-w-xs mx-auto pt-3 sm:hidden">
            <CustomDropdown
              options={PROJECT_CATEGORIES.map((cat) => ({
                label: cat === "All" ? "All Disciplines" : `${cat} Projects`,
                value: cat,
                badge: `${
                  cat === "All"
                    ? SUTRA_PROJECTS.length
                    : SUTRA_PROJECTS.filter((p) => p.category === cat).length
                }`,
              }))}
              value={selectedCat}
              onChange={(val) => setSelectedCat(val)}
              placeholder="Filter by Discipline"
              buttonClassName="!rounded-full !bg-[#FFFDF9] !border-[#EADFCB] py-2.5 shadow-xs"
            />
          </div>

          {/* Desktop / Tablet View: Tab Pills System */}
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-4">
            {PROJECT_CATEGORIES.map((cat) => {
              const isActive = selectedCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`interactive-pill focus-ring px-4 sm:px-5 py-2 rounded-full text-xs font-medium cursor-pointer transition-all ${
                    isActive
                      ? "bg-[#5C3A1E] text-white shadow-xs font-semibold ring-1 ring-[#D4A35A]"
                      : "bg-[#FFFDF9] text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A] hover:text-[#0F172A]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
