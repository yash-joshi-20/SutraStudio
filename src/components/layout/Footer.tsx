"use client";

import React from "react";
import Link from "next/link";
import { SutraLogo, LotusSymbol } from "@/components/brand/SutraLogo";

export function Footer() {
  return (
    <footer className="w-full bg-[#171411] text-[#E8E0D2] border-t border-[#382E25] relative overflow-hidden">
      {/* Background lotus watermark accent */}
      <div className="absolute -bottom-16 -left-16 pointer-events-none opacity-[0.06]">
        <LotusSymbol className="w-96 h-96" color="white" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          {/* Studio Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <SutraLogo
              variant="horizontal"
              size="md"
              className="brightness-0 invert"
              href="/"
            />
            <p className="text-sm text-[#B4A795] max-w-sm leading-relaxed mt-4">
              AI-Powered Creative, Design, Development & Digital Marketing Solutions
              for Modern Businesses. Tradition meets technology.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
              <span className="text-xs font-medium text-[#C2B7A8]">
                Studio Online • 24/7 AI Creative Router Active
              </span>
            </div>
          </div>

          {/* Column 1: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
              Services
            </h4>
            <ul className="space-y-2 text-sm text-[#C2B7A8]">
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Image Creation
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Video Creation
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  3D Modeling & 360°
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Interior & Window Design
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Web & App Development
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  AI Automation (n8n)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Studio */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
              Studio
            </h4>
            <ul className="space-y-2 text-sm text-[#C2B7A8]">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Heritage
                </Link>
              </li>
              <li>
                <Link href="/studio" className="hover:text-white transition-colors">
                  Craft & Technology
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  Featured Projects
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Transparent Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Client Inquiry
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Client Portal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
              Portals
            </h4>
            <ul className="space-y-2 text-sm text-[#C2B7A8]">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Client Login
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Client Dashboard
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition-colors">
                  Order Creation Wizard
                </Link>
              </li>
              <li>
                <Link href="/chat" className="hover:text-white transition-colors">
                  Sutra AI Assistant
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Admin Workspace
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#382E25] flex flex-col sm:flex-row items-center justify-between text-xs text-[#9E9080] gap-4">
          <p>© {new Date().getFullYear()} Sutra Studio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Engagement</span>
            <span>Firebase Security Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
