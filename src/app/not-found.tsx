import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { Home, Sparkles, ArrowRight, Search, Compass, FolderGit2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      <Navbar />

      <main id="main-content" className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle background lotus emblem */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03]">
          <LotusSymbol className="w-[500px] h-[500px]" color="gold" />
        </div>

        <div className="max-w-xl w-full text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs font-semibold uppercase tracking-wider text-[#5C3A1E] shadow-xs">
            <Compass className="w-3.5 h-3.5 text-[#D4A35A]" />
            <span>Archive Index 404</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-5xl sm:text-6xl font-bold text-[#0F172A] tracking-tight">
              Page Not Found
            </h1>
            <p className="text-sm sm:text-base text-[#64748B] max-w-md mx-auto leading-relaxed">
              The creative artifact or route you are looking for has moved, been archived, or never existed in the studio catalog.
            </p>
          </div>

          {/* Quick links grid */}
          <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs text-left space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#A98B57]">
              Helpful Destinations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link
                href="/services"
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/60 text-xs font-medium text-[#0F172A] hover:bg-[#F4EFE6] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                  Creative Services
                </span>
                <ArrowRight className="w-3 h-3 text-[#94A3B8]" />
              </Link>
              <Link
                href="/projects"
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/60 text-xs font-medium text-[#0F172A] hover:bg-[#F4EFE6] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FolderGit2 className="w-3.5 h-3.5 text-[#5C3A1E]" />
                  Curated Projects
                </span>
                <ArrowRight className="w-3 h-3 text-[#94A3B8]" />
              </Link>
              <Link
                href="/mobile-app"
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/60 text-xs font-medium text-[#0F172A] hover:bg-[#F4EFE6] transition-colors"
              >
                <span>Mobile App</span>
                <ArrowRight className="w-3 h-3 text-[#94A3B8]" />
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/60 text-xs font-medium text-[#0F172A] hover:bg-[#F4EFE6] transition-colors"
              >
                <span>Client Desk</span>
                <ArrowRight className="w-3 h-3 text-[#94A3B8]" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />} className="w-full sm:w-auto min-h-[44px]">
                Back to Home
              </Button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="w-full sm:w-auto min-h-[44px]">
                Contact Studio Support
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
