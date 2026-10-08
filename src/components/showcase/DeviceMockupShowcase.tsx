"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Laptop,
  Smartphone,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Globe,
  Sliders,
  Play,
  ShoppingBag,
} from "lucide-react";
import { SutraLogo, LotusSymbol } from "@/components/brand/SutraLogo";

interface DeviceMockupShowcaseProps {
  initialMode?: "dual" | "laptop" | "mobile";
  className?: string;
}

export function DeviceMockupShowcase({
  initialMode = "dual",
  className = "",
}: DeviceMockupShowcaseProps) {
  const [deviceMode, setDeviceMode] = useState<"dual" | "laptop" | "mobile">(initialMode);

  return (
    <div
      className={`relative w-full rounded-3xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF9F5] to-[#F4EFE6] border border-[#EADFCB] p-4 sm:p-8 overflow-hidden shadow-warm ${className}`}
    >
      {/* Top Header & Device Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-[#EADFCB]">
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-[10px] font-semibold text-[#5C3A1E] uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3 text-[#D4A35A]" />
            <span>AUTHENTIC RESPONSIVE FRAME ENGINE</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#171717]">
            Pixel-Perfect Web &amp; Mobile Architecture
          </h3>
          <p className="text-xs text-[#64748B]">
            Real vector device frames rendering Sutra Studio&apos;s bespoke enterprise client interface.
          </p>
        </div>

        {/* Device Mode Switcher */}
        <div className="flex items-center bg-[#FFFDF9] p-1 rounded-full border border-[#EADFCB] shadow-xs">
          <button
            onClick={() => setDeviceMode("dual")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              deviceMode === "dual"
                ? "bg-[#5C3A1E] text-white shadow-2xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dual View</span>
          </button>
          <button
            onClick={() => setDeviceMode("laptop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              deviceMode === "laptop"
                ? "bg-[#5C3A1E] text-white shadow-2xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">MacBook</span>
          </button>
          <button
            onClick={() => setDeviceMode("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              deviceMode === "mobile"
                ? "bg-[#5C3A1E] text-white shadow-2xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">iPhone 16</span>
          </button>
        </div>
      </div>

      {/* Main Devices Display Area */}
      <div className="relative min-h-[440px] sm:min-h-[500px] flex items-center justify-center">
        {/* ===================================================
            1. MACBOOK PRO 16" LAPTOP FRAME (Dark Titanium)
            =================================================== */}
        {(deviceMode === "dual" || deviceMode === "laptop") && (
          <div
            className={`transition-all duration-500 ease-out ${
              deviceMode === "dual"
                ? "w-full max-w-2xl lg:max-w-3xl transform lg:-translate-x-12"
                : "w-full max-w-4xl"
            }`}
          >
            {/* Screen Bezel */}
            <div className="relative rounded-t-2xl bg-[#1C1B1A] p-2.5 sm:p-3 pb-0 border-t-2 border-x-2 border-[#383533] shadow-2xl">
              {/* Notch & Camera */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 sm:w-36 h-4 bg-[#1C1B1A] rounded-b-lg flex items-center justify-center z-30">
                <div className="w-2 h-2 rounded-full bg-[#0A0A0A] border border-[#333] flex items-center justify-center">
                  <div className="w-0.5 h-0.5 rounded-full bg-[#1B4D3E]" />
                </div>
              </div>

              {/* Screen Viewport: Authentic Sutra Live Desktop Interface */}
              <div className="relative aspect-[16/10] w-full rounded-t-lg bg-[#FAF9F5] overflow-hidden border border-[#E5E1D8] shadow-inner select-none">
                <Image
                  src="/assets/showcase/live-home-desktop.png"
                  alt="Sutra Studio Live Desktop Interface"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  priority
                />
              </div>
            </div>

            {/* Laptop Base & Keyboard Chassis */}
            <div className="relative h-3 sm:h-4 bg-[#383533] rounded-b-xl border-t border-[#4D4A47] shadow-xl flex items-center justify-center">
              <div className="w-16 sm:w-24 h-1 bg-[#262423] rounded-full" />
            </div>
            {/* Bottom Lip */}
            <div className="h-1 bg-[#1C1B1A] mx-auto w-[98%] rounded-b-md" />
          </div>
        )}

        {/* ===================================================
            2. IPHONE 16 PRO SMARTPHONE FRAME (Deep Obsidian)
            =================================================== */}
        {(deviceMode === "dual" || deviceMode === "mobile") && (
          <div
            className={`transition-all duration-500 ease-out z-20 ${
              deviceMode === "dual"
                ? "w-48 sm:w-60 absolute right-2 sm:right-6 bottom-0 shadow-2xl transform translate-y-4 hover:-translate-y-1"
                : "w-64 sm:w-72 shadow-2xl"
            }`}
          >
            {/* Outer Titanium Frame */}
            <div className="relative rounded-[40px] bg-[#121110] p-2.5 border-[3px] border-[#3D3A37] ring-1 ring-[#5C5752]/30 shadow-2xl">
              {/* Hardware Side Buttons */}
              <div className="absolute -left-[5px] top-20 w-[3px] h-7 bg-[#262422] rounded-l-xs" />
              <div className="absolute -left-[5px] top-32 w-[3px] h-10 bg-[#262422] rounded-l-xs" />
              <div className="absolute -right-[5px] top-24 w-[3px] h-12 bg-[#262422] rounded-r-xs" />

              {/* Screen Display: Authentic Sutra Live Mobile Interface */}
              <div className="relative aspect-[9/19.5] w-full rounded-[32px] bg-[#FAF9F5] overflow-hidden border border-[#E5E1D8] flex flex-col justify-between select-none">
                {/* Dynamic Island Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#000000] rounded-full z-30 flex items-center justify-between px-2">
                  <div className="w-2 h-2 rounded-full bg-[#111] border border-[#222]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1B4D3E]/80" />
                </div>

                <Image
                  src="/assets/showcase/live-home-mobile.png"
                  alt="Sutra Studio Live Mobile Interface"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 400px"
                  priority
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
