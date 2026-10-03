"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SutraLogo, LotusSymbol } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  Shield,
  Heart,
  ChevronDown,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const serviceLinks = [
    { label: "Image Creation", href: "/services" },
    { label: "Video Creation", href: "/services" },
    { label: "3D Modeling & Spatial", href: "/services" },
    { label: "Interior & Architectural", href: "/services" },
    { label: "Web & App Flagships", href: "/services" },
    { label: "AI Creative Automation", href: "/services" },
  ];

  const studioLinks = [
    { label: "Heritage & Philosophy", href: "/about" },
    { label: "Craft & Technology", href: "/studio" },
    { label: "Curated Projects", href: "/projects" },
    { label: "Investment & Pricing", href: "/pricing" },
    { label: "Mobile App for iOS & Android", href: "/mobile-app" },
    { label: "Client Inquiry Desk", href: "/contact" },
  ];

  const clientLinks = [
    { label: "Client Sign In", href: "/login" },
    { label: "Project Dashboard", href: "/dashboard" },
    { label: "Order Wizard", href: "/orders" },
    { label: "Deliverable Vault", href: "/projects-client" },
    { label: "Google Drive Media", href: "/media" },
    { label: "Billing & Invoices", href: "/invoices" },
  ];

  // Deliberately no admin entry here: the admin portal must not be advertised
// on the public footer. It is only reachable by an account that already
// carries the role:"admin" custom claim.
  const operationLinks = [
    { label: "Sutra AI Assistant", href: "/chat" },
    { label: "Account Profile", href: "/profile" },
    { label: "Offline Mode", href: "/offline" },
  ];

  return (
    <footer className="w-full bg-[#FAF9F5] text-[#0F172A] border-t border-[#EADFCB] relative overflow-hidden pb-28 md:pb-16">
      {/* Background lotus watermark accent */}
      <div className="absolute -bottom-20 -right-20 pointer-events-none opacity-[0.04] hidden sm:block">
        <LotusSymbol className="w-[500px] h-[500px]" color="gold" />
      </div>

      {/* Pre-footer Consultation Banner */}
      <div className="border-b border-[#EADFCB]/80 bg-[#FFFDF9]/60">
        <div className="app-container-cap px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A98B57] flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
              Start Your Journey
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
              Ready to elevate your digital presence?
            </h3>
            <p className="text-sm text-[#64748B] max-w-xl">
              Partner with Sutra Studio for world-class AI, design, 3D, and development solutions.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
            <Link href="/contact" className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="w-full sm:w-auto min-h-[44px]">
                Discovery Call
              </Button>
            </Link>
            <Link href="/orders" className="w-full sm:w-auto">
              <Button variant="primary" size="md" withArrow className="w-full sm:w-auto min-h-[44px]">
                Start an Order
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links Container */}
      <div className="app-container-cap px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        {/* Desktop Grid Layout (Hidden on Mobile) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-16">
          {/* Studio Brand Column (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <SutraLogo variant="horizontal" size="md" href="/" />
            <p className="text-sm text-[#64748B] max-w-sm leading-relaxed mt-4">
              A high-precision creative technology studio rooted in traditional
              Indian aesthetics, powered by state-of-the-art AI generation and
              digital craftsmanship.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs text-[#5C3A1E] w-fit shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
                <span className="font-medium">Studio Online • Real-Time Creative Engine</span>
              </div>
              <p className="text-xs text-[#94A3B8] tracking-wide">
                Ideas ◆ Design ◆ Development ◆ Growth
              </p>
            </div>
          </div>

          {/* Column 1: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#A98B57]">
              Services
            </h4>
            <ul className="space-y-2 text-sm text-[#64748B]">
              {serviceLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-[#5C3A1E] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Studio */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#A98B57]">
              Studio
            </h4>
            <ul className="space-y-2 text-sm text-[#64748B]">
              {studioLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-[#5C3A1E] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Client Workspace */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#A98B57]">
              Workspace
            </h4>
            <ul className="space-y-2 text-sm text-[#64748B]">
              {clientLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-[#5C3A1E] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Operations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#A98B57]">
              Operations
            </h4>
            <ul className="space-y-2 text-sm text-[#64748B]">
              {operationLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (item.href === "/chat") {
                        e.preventDefault();
                        if (typeof window !== "undefined") {
                          window.dispatchEvent(new CustomEvent("open-sutra-chat"));
                        }
                      }
                    }}
                    className="hover:text-[#5C3A1E] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <div className="p-3 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5C3A1E]">
                    <Shield className="w-3.5 h-3.5 text-[#2E7D4F]" />
                    <span>Firebase Protected</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">
                    Client isolation, encrypted Firestore and Google Drive vaults.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile Accordion Layout (Visible on Phone/Small Screens) */}
        <div className="md:hidden space-y-4 mb-10">
          {/* Brand Introduction */}
          <div className="space-y-3 pb-4 border-b border-[#EADFCB]/60">
            <SutraLogo variant="horizontal" size="sm" href="/" />
            <p className="text-xs text-[#64748B] leading-relaxed">
              Traditional Indian aesthetic principles fused with high-velocity AI generation and modern engineering.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-[11px] text-[#5C3A1E]">
              <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
              <span>Studio Engine Online</span>
            </div>
          </div>

          {/* Accordion 1: Services */}
          <div className="border-b border-[#EADFCB]/60 pb-3">
            <button
              onClick={() => toggleSection("services")}
              className="w-full flex items-center justify-between py-2 text-left min-h-[44px] cursor-pointer"
            >
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#A98B57]">
                Creative Services
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${
                  openSection === "services" ? "rotate-180 text-[#5C3A1E]" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {openSection === "services" && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2.5 pt-2 pb-1 text-sm text-[#64748B]"
                >
                  {serviceLinks.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="block py-1 text-xs hover:text-[#5C3A1E] transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion 2: Studio */}
          <div className="border-b border-[#EADFCB]/60 pb-3">
            <button
              onClick={() => toggleSection("studio")}
              className="w-full flex items-center justify-between py-2 text-left min-h-[44px] cursor-pointer"
            >
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#A98B57]">
                Studio & Heritage
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${
                  openSection === "studio" ? "rotate-180 text-[#5C3A1E]" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {openSection === "studio" && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2.5 pt-2 pb-1 text-sm text-[#64748B]"
                >
                  {studioLinks.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="block py-1 text-xs hover:text-[#5C3A1E] transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion 3: Client Workspace */}
          <div className="border-b border-[#EADFCB]/60 pb-3">
            <button
              onClick={() => toggleSection("client")}
              className="w-full flex items-center justify-between py-2 text-left min-h-[44px] cursor-pointer"
            >
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#A98B57]">
                Client Workspace
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${
                  openSection === "client" ? "rotate-180 text-[#5C3A1E]" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {openSection === "client" && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2.5 pt-2 pb-1 text-sm text-[#64748B]"
                >
                  {clientLinks.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="block py-1 text-xs hover:text-[#5C3A1E] transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion 4: Operations & System */}
          <div className="border-b border-[#EADFCB]/60 pb-3">
            <button
              onClick={() => toggleSection("operations")}
              className="w-full flex items-center justify-between py-2 text-left min-h-[44px] cursor-pointer"
            >
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#A98B57]">
                Operations & Tools
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${
                  openSection === "operations" ? "rotate-180 text-[#5C3A1E]" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {openSection === "operations" && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2.5 pt-2 pb-1 text-sm text-[#64748B]"
                >
                  {operationLinks.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={(e) => {
                          if (item.href === "/chat") {
                            e.preventDefault();
                            if (typeof window !== "undefined") {
                              window.dispatchEvent(new CustomEvent("open-sutra-chat"));
                            }
                          }
                        }}
                        className="block py-1 text-xs hover:text-[#5C3A1E] transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#EADFCB] flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <span>© {new Date().getFullYear()} Sutra Studio.</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs">
            <Link href="/privacy" className="hover:text-[#5C3A1E] transition-colors py-1">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#5C3A1E] transition-colors py-1">
              Terms & Conditions
            </Link>
            <Link href="/contact" className="hover:text-[#5C3A1E] transition-colors py-1">
              Support Desk
            </Link>
            <span className="text-[#A98B57] flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 fill-current text-[#A98B57]" /> in India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
