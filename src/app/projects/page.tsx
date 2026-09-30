"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4A35A]">
            PORTFOLIO SHOWCASE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#0F172A] mt-2">
            Featured Projects & Case Studies
          </h1>
          <p className="text-base text-[#64748B] mt-3">
            Explore our latest creative outputs across photorealistic 3D,
            architectural films, brand portals, and Meta growth campaigns.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {PROJECT_CATEGORIES.map((cat) => {
              const isActive = selectedCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
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
