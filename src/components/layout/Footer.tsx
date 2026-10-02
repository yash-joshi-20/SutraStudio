"use client";

import React from "react";
import Link from "next/link";
import { SutraLogo, LotusSymbol } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles, Shield, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#FAF9F5] text-[#0F172A] border-t border-[#EADFCB] relative overflow-hidden">
      {/* Background lotus watermark accent */}
      <div className="absolute -bottom-20 -right-20 pointer-events-none opacity-[0.04]">
        <LotusSymbol className="w-[500px] h-[500px]" color="gold" />
      </div>

      {/* Pre-footer Consultation Banner */}
      <div className="border-b border-[#EADFCB]/80 bg-[#FFFDF9]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A98B57] flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
              Start Your Journey
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
              Ready to elevate your digital presence?
            </h3>
            <p className="text-sm text-[#64748B]">
              Partner with Sutra Studio for world-class AI, design, and development solutions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/contact">
              <Button variant="secondary" size="md">
                Schedule Discovery Call
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="primary" size="md" withArrow>
                Start an Order
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 mb-16">
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

          {/* Column 1: Creative Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#A98B57]">
              Services
            </h4>
            <ul className="space-y-2 text-sm text-[#64748B]">
              <li>
                <Link href="/services" className="hover:text-[#5C3A1E] transition-colors">
                  Image Creation
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#5C3A1E] transition-colors">
                  Video Creation
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#5C3A1E] transition-colors">
                  3D Modeling & 360°
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#5C3A1E] transition-colors">
                  Interior & Window
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#5C3A1E] transition-colors">
                  Web & App Development
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#5C3A1E] transition-colors">
                  AI Workflow Automation
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Studio & Heritage */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#A98B57]">
              Studio
            </h4>
            <ul className="space-y-2 text-sm text-[#64748B]">
              <li>
                <Link href="/about" className="hover:text-[#5C3A1E] transition-colors">
                  Heritage & Philosophy
                </Link>
              </li>
              <li>
                <Link href="/studio" className="hover:text-[#5C3A1E] transition-colors">
                  Craft & Technology
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-[#5C3A1E] transition-colors">
                  Curated Projects
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#5C3A1E] transition-colors">
                  Packages & Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#5C3A1E] transition-colors">
                  Client Inquiry Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Client Portal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#A98B57]">
              Client Workspace
            </h4>
            <ul className="space-y-2 text-sm text-[#64748B]">
              <li>
                <Link href="/login" className="hover:text-[#5C3A1E] transition-colors">
                  Client Portal Sign In
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#5C3A1E] transition-colors">
                  Project Dashboard
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-[#5C3A1E] transition-colors">
                  Order Wizard
                </Link>
              </li>
              <li>
                <Link href="/projects-client" className="hover:text-[#5C3A1E] transition-colors">
                  Deliverable Vault
                </Link>
              </li>
              <li>
                <Link href="/media" className="hover:text-[#5C3A1E] transition-colors">
                  Google Drive Assets
                </Link>
              </li>
              <li>
                <Link href="/invoices" className="hover:text-[#5C3A1E] transition-colors">
                  Billing & Invoices
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Command Center */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#A98B57]">
              Operations
            </h4>
            <ul className="space-y-2 text-sm text-[#64748B]">
              <li>
                <Link href="/chat" className="hover:text-[#5C3A1E] transition-colors">
                  Sutra AI Assistant
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[#5C3A1E] transition-colors">
                  Organization Settings
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#5C3A1E] transition-colors">
                  Admin Command Workspace
                </Link>
              </li>
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

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#EADFCB] flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Sutra Studio.</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <Link href="/about" className="hover:text-[#5C3A1E] transition-colors">
              Privacy Directive
            </Link>
            <Link href="/pricing" className="hover:text-[#5C3A1E] transition-colors">
              Terms of Engagement
            </Link>
            <Link href="/contact" className="hover:text-[#5C3A1E] transition-colors">
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
