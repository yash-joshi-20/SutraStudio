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
    { label: "Digital Workflow Automation", href: "/services" },
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
    { label: "Sutra Cloud Vault", href: "/media" },
    { label: "Billing & Invoices", href: "/invoices" },
  ];

  // Deliberately no admin entry here: the admin portal must not be advertised
// on the public footer. It is only reachable by an account that already
// carries the role:"admin" custom claim.
  const operationLinks = [
    { label: "Sutra Studio Concierge", href: "/chat" },
    { label: "Account Profile", href: "/profile" },
    { label: "Offline Mode", href: "/offline" },
  ];

  return (
    <footer className="w-full bg-[#FAF9F5] text-[#0F172A] border-t border-[#EADFCB] relative overflow-hidden pb-18 md:pb-10">
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
              Partner with Sutra Studio for world-class design, 3D spatial, and software engineering solutions.
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
      <div className="app-container-cap px-4 sm:px-6 lg:px-8 pt-10 lg:pt-14 pb-8 md:pb-10 relative z-10">
        {/* Desktop Grid Layout (Hidden on Mobile) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Studio Brand Column (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <SutraLogo variant="horizontal" size="md" href="/" />
            <p className="text-sm text-[#64748B] max-w-sm leading-relaxed mt-4">
              A high-precision creative technology studio rooted in traditional
              Indian aesthetics, powered by state-of-the-art computational rendering and
              digital craftsmanship.
            </p>
            <div className="pt-2 flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs text-[#5C3A1E] w-fit shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
                <span className="font-medium">Studio Online • Real-Time Creative Engine</span>
              </div>
              <p className="text-xs text-[#94A3B8] tracking-wide">
                Ideas ◆ Design ◆ Development ◆ Growth
              </p>

              {/* Official Social Media Channels & Studio Concierge */}
              <div className="pt-2 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.instagram.com/yashsutrastudio/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Sutra Studio Instagram"
                    className="p-2 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-[#5C3A1E] hover:text-[#D4A35A] hover:border-[#D4A35A] hover:shadow-xs transition-all flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/yashsutrastudio/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Sutra Studio Facebook Page"
                    className="p-2 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-[#5C3A1E] hover:text-[#D4A35A] hover:border-[#D4A35A] hover:shadow-xs transition-all flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/yashjoshisutrastudio/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Founder Profile Facebook"
                    className="px-2.5 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-[#5C3A1E] hover:text-[#D4A35A] hover:border-[#D4A35A] hover:shadow-xs transition-all flex items-center gap-1.5 text-xs font-medium"
                  >
                    <span>Founder Profile</span>
                    <ExternalLink className="w-3 h-3 text-[#A98B57]" />
                  </a>
                </div>

                <a
                  href="https://wa.me/918200192781?text=Hello%20Sutra%20Studio%2C%20I%20would%20like%20to%20discuss%20a%20project."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] hover:border-[#2E7D4F] text-xs font-semibold text-[#2E7D4F] transition-all shadow-xs w-fit"
                >
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
                  <span>Studio WhatsApp Concierge</span>
                </a>
              </div>
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
                    Client isolation, encrypted Firestore and Sutra Cloud Vaults.
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
              Traditional Indian aesthetic principles fused with high-velocity spatial computing and modern engineering.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-[11px] text-[#5C3A1E]">
                <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
                <span>Studio Engine Online</span>
              </div>
              <a
                href="https://wa.me/918200192781?text=Hello%20Sutra%20Studio%2C%20I%20would%20like%20to%20discuss%20a%20project."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#2E7D4F]/40 text-[11px] font-semibold text-[#2E7D4F]"
              >
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
                <span>Studio WhatsApp Concierge</span>
              </a>
            </div>

            {/* Mobile Social Links */}
            <div className="pt-1 flex items-center gap-2">
              <a
                href="https://www.instagram.com/yashsutrastudio/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sutra Studio Instagram"
                className="p-2 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-[#5C3A1E] hover:text-[#D4A35A] flex items-center justify-center min-h-[38px] min-w-[38px]"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/yashsutrastudio/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sutra Studio Facebook Page"
                className="p-2 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-[#5C3A1E] hover:text-[#D4A35A] flex items-center justify-center min-h-[38px] min-w-[38px]"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/yashjoshisutrastudio/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Founder Profile Facebook"
                className="px-2.5 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-[#5C3A1E] hover:text-[#D4A35A] flex items-center gap-1 text-[11px] font-medium min-h-[38px]"
              >
                <span>Founder Profile</span>
                <ExternalLink className="w-3 h-3 text-[#A98B57]" />
              </a>
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
