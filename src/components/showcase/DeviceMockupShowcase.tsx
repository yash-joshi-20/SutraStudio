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
            Real vector device frames rendering Sutra Studio&apos;s Next.js 16 live client interface.
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

              {/* Screen Viewport */}
              <div className="relative aspect-[16/10] w-full rounded-t-lg bg-[#FAF9F5] overflow-hidden border border-[#E5E1D8] shadow-inner select-none">
                {/* Simulated Sutra Studio Mini Browser UI */}
                <div className="w-full h-full flex flex-col bg-[#FAF9F5] text-[#171717] overflow-hidden text-[10px] sm:text-xs">
                  {/* Browser Header Strip */}
                  <div className="px-3 py-1.5 bg-[#FFFDF9] border-b border-[#EADFCB] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#DC2626]/70" />
                      <div className="w-2 h-2 rounded-full bg-[#D4A35A]/70" />
                      <div className="w-2 h-2 rounded-full bg-[#2E7D4F]/70" />
                    </div>

                    <div className="flex items-center gap-1 px-3 py-0.5 rounded-md bg-[#F4EFE6] border border-[#EADFCB] text-[9px] text-[#64748B] font-mono max-w-[200px] truncate">
                      <Lock className="w-2.5 h-2.5 text-[#2E7D4F]" />
                      <span>sutrastudio-1.onrender.com</span>
                    </div>

                    <div className="flex items-center gap-1 text-[9px] text-[#A98B57] font-semibold">
                      <span>Next.js 16</span>
                    </div>
                  </div>

                  {/* Browser Page Body */}
                  <div className="flex-1 p-4 sm:p-6 bg-radial from-[#FFFDF9] to-[#FAF9F5] flex flex-col justify-between relative overflow-hidden">
                    {/* Lotus Watermark */}
                    <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                      <LotusSymbol className="w-48 h-48" color="gold" />
                    </div>

                    {/* Mini Hero */}
                    <div className="space-y-2 max-w-md relative z-10">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-[9px] font-bold text-[#5C3A1E] uppercase">
                        <span>◆</span>
                        <span>ATELIER CREATIVE TECHNOLOGY</span>
                      </div>
                      <h2 className="font-serif text-base sm:text-xl font-bold leading-tight text-[#171717]">
                        Where Vedic Craft Meets <span className="text-gold-gradient">Digital Intelligence</span>
                      </h2>
                      <p className="text-[10px] sm:text-xs text-[#64748B] line-clamp-2">
                        12 isolated production pipelines: photorealistic 3D, architectural rendering, Next.js web applications, and autonomous Meta ad growth engines.
                      </p>
                    </div>

                    {/* Mini Pipeline Cards Row */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 relative z-10 mt-2">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#EADFCB] shadow-2xs">
                        <span className="text-[8px] font-mono text-[#A98B57] uppercase block">Spatial Engine</span>
                        <p className="font-serif font-bold text-[10px] text-[#171717]">3D GLTF / VR</p>
                        <span className="text-[8px] text-[#2E7D4F] font-semibold">● 60 FPS PBR</span>
                      </div>
                      <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#EADFCB] shadow-2xs">
                        <span className="text-[8px] font-mono text-[#A98B57] uppercase block">Web Stack</span>
                        <p className="font-serif font-bold text-[10px] text-[#171717]">Turbopack</p>
                        <span className="text-[8px] text-[#5C3A1E] font-semibold">Zero-Jank</span>
                      </div>
                      <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#EADFCB] shadow-2xs">
                        <span className="text-[8px] font-mono text-[#A98B57] uppercase block">Cloud Media</span>
                        <p className="font-serif font-bold text-[10px] text-[#171717]">Drive Vault</p>
                        <span className="text-[8px] text-[#D4A35A] font-semibold">4K Sync</span>
                      </div>
                    </div>
                  </div>
                </div>
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

              {/* Screen Display */}
              <div className="relative aspect-[9/19.5] w-full rounded-[32px] bg-[#FAF9F5] overflow-hidden border border-[#E5E1D8] flex flex-col justify-between select-none">
                {/* Dynamic Island Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#000000] rounded-full z-30 flex items-center justify-between px-2">
                  <div className="w-2 h-2 rounded-full bg-[#111] border border-[#222]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1B4D3E]/80" />
                </div>

                {/* Mobile Top Bar */}
                <div className="pt-8 px-3.5 pb-2 bg-[#FFFDF9] border-b border-[#EADFCB] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <img
                      src="/brand/sutra-symbol.png"
                      alt="Sutra"
                      className="w-4 h-4 object-contain"
                    />
                    <span className="font-serif font-bold text-[10px] text-[#171717]">
                      SUTRA STUDIO
                    </span>
                  </div>
                  <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full bg-[#2E7D4F]/10 text-[#2E7D4F] font-bold">
                    ONLINE
                  </span>
                </div>

                {/* Mobile Content Viewport */}
                <div className="flex-1 p-3 bg-gradient-to-b from-[#FFFDF9] to-[#F8F5EF] space-y-2.5 overflow-hidden">
                  {/* Active Service Pill */}
                  <div className="p-2.5 rounded-2xl bg-white border border-[#EADFCB] shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full bg-[#D4A35A] text-[#171717] font-bold">
                        3D VR PASS
                      </span>
                      <span className="text-[9px] font-mono text-[#5C3A1E] font-bold">₹11,999</span>
                    </div>
                    <p className="font-serif font-bold text-[11px] text-[#171717] leading-tight">
                      360° Villa Virtual Tour
                    </p>
                    <p className="text-[8px] text-[#64748B]">
                      Equirectangular spatial tour with WebXR compatibility.
                    </p>
                  </div>

                  {/* Instant Checkout Sheet Card */}
                  <div className="p-2.5 rounded-2xl bg-[#5C3A1E] text-white shadow-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono text-[#D4A35A]">DIRECT UPI / GPAY</span>
                      <CheckCircle2 className="w-3 h-3 text-[#D4A35A]" />
                    </div>
                    <p className="font-serif font-bold text-[10px] text-[#FAF9F5]">
                      Instant Order Commissioning
                    </p>
                    <div className="w-full py-1 rounded-lg bg-white/10 text-center text-[8px] font-semibold text-[#D4A35A]">
                      Verified Zero-Fee Gateway
                    </div>
                  </div>
                </div>

                {/* Mobile Floating Concierge Launcher & Bottom Nav */}
                <div className="p-2 bg-[#FFFDF9] border-t border-[#EADFCB] flex items-center justify-around relative">
                  <div className="w-3 h-3 rounded-full bg-[#F4EFE6]" />
                  <div className="w-3 h-3 rounded-full bg-[#5C3A1E]" />
                  <div className="w-3 h-3 rounded-full bg-[#F4EFE6]" />

                  {/* Floating Concierge Orb */}
                  <div className="absolute -top-4 right-2 w-7 h-7 rounded-full bg-[#171717] border border-[#A98B57] flex items-center justify-center shadow-md">
                    <img
                      src="/brand/sutra-symbol.png"
                      alt="Sutra"
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
