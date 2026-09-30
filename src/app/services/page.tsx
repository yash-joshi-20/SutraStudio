"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ServiceCard } from "@/components/services/ServiceCard";
import { SUTRA_SERVICES } from "@/data/servicesData";

const CATEGORIES = [
  "All",
  "Creative",
  "Design",
  "Development",
  "Marketing",
  "Automation",
];

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredServices =
    activeCategory === "All"
      ? SUTRA_SERVICES
      : SUTRA_SERVICES.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4A35A]">
            STUDIO CAPABILITIES
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#0F172A] mt-2">
            Our Services
          </h1>
          <p className="text-base text-[#64748B] mt-3">
            12 powerful creative and digital services engineered to grow your
            business, elevate your brand, and accelerate product velocity.
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
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

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
