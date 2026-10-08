"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Volume2, VolumeX } from "lucide-react";
import { soundSystem } from "@/lib/audio/soundSystem";

interface SutraStudioIntroLandingProps {
  onComplete?: () => void;
  autoDismissTimeMs?: number;
  alwaysShow?: boolean;
}

export function SutraStudioIntroLanding({
  onComplete,
  autoDismissTimeMs = 3800,
  alwaysShow = false,
}: SutraStudioIntroLandingProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioPlayedRef = useRef(false);

  useEffect(() => {
    // Check if user has already seen splash intro in this session unless alwaysShow is true
    if (!alwaysShow && typeof window !== "undefined") {
      const seen = sessionStorage.getItem("sutra_intro_dismissed");
      if (seen === "true") {
        setIsVisible(false);
        if (onComplete) onComplete();
        return;
      }
    }

    // Play subtle welcome chime if sound is enabled
    const playChime = () => {
      if (!audioPlayedRef.current) {
        audioPlayedRef.current = true;
        try {
          soundSystem.play("welcome");
        } catch (_) {}
      }
    };

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / autoDismissTimeMs) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [autoDismissTimeMs, alwaysShow, onComplete]);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sutra_intro_dismissed", "true");
    }
    setIsVisible(false);
    if (onComplete) {
      setTimeout(onComplete, 500);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="sutra-intro-landing"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.03, filter: "blur(6px)" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#FAF9F5] text-[#171717] overflow-hidden select-none p-6 sm:p-10"
      >
        {/* Background Ambient Glow & Sacred Geometry Aura */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          {/* Radial Gold Flare */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.8, 1.15, 0.95], opacity: [0.3, 0.65, 0.45] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-[500px] sm:w-[750px] h-[500px] sm:h-[750px] rounded-full bg-gradient-to-tr from-[#D4A35A]/20 via-[#A98B57]/15 to-transparent blur-3xl pointer-events-none"
          />

          {/* Concentric Rotating Sacred Lotus Rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute w-[420px] sm:w-[620px] h-[420px] sm:h-[620px] rounded-full border border-[#D4A35A]/20 pointer-events-none border-dashed"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
            className="absolute w-[320px] sm:w-[480px] h-[320px] sm:h-[480px] rounded-full border border-[#A98B57]/15 pointer-events-none"
          />
        </div>

        {/* Top Navigation Bar: Skip & Sound Toggle */}
        <div className="w-full max-w-5xl flex items-center justify-between relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#EADFCB] text-[11px] font-mono tracking-widest text-[#5C3A1E] shadow-2xs backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D4F] animate-pulse" />
            <span>SUTRA STUDIOS • ATELIER V7</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDismiss}
              className="px-4 py-1.5 rounded-full bg-white/80 hover:bg-[#FFFDF9] border border-[#EADFCB] hover:border-[#D4A35A] text-xs font-semibold text-[#5C3A1E] transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm flex items-center gap-1.5"
            >
              <span>Skip Intro</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4A35A]" />
            </button>
          </div>
        </div>

        {/* Centerpiece: Animated 'S' Lotus Emblem & Vertical Logo */}
        <div className="flex flex-col items-center justify-center text-center my-auto relative z-10 max-w-lg px-4 space-y-6">
          {/* Animated S Emblem with Golden Shimmer Aura */}
          <motion.div
            initial={{ scale: 0.82, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center"
          >
            {/* Glowing Aura Ring */}
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.5, 0.9, 0.5],
                boxShadow: [
                  "0 0 20px rgba(212,163,90,0.2)",
                  "0 0 45px rgba(212,163,90,0.5)",
                  "0 0 20px rgba(212,163,90,0.2)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full border-2 border-[#D4A35A]/50 bg-gradient-to-b from-[#FFFDF9] to-[#F8F5EF]"
            />

            {/* Interactive Animated S / Lotus Vector Layer */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center z-10">
              <motion.svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-md"
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                <defs>
                  <linearGradient id="sutraGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A98B57" />
                    <stop offset="50%" stopColor="#D4A35A" />
                    <stop offset="100%" stopColor="#5C3A1E" />
                  </linearGradient>
                  <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Outer Lotus Petals */}
                <motion.path
                  d="M50 12 C40 28, 25 40, 25 58 C25 72, 36 84, 50 88 C64 84, 75 72, 75 58 C75 40, 60 28, 50 12 Z"
                  fill="none"
                  stroke="url(#sutraGold)"
                  strokeWidth="2.2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.85 }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                />

                {/* Inner Animated 'S' Monogram Ribbon */}
                <motion.path
                  d="M62 34 C58 26, 42 26, 38 34 C34 42, 40 48, 50 52 C60 56, 66 62, 62 70 C58 78, 42 78, 36 70"
                  fill="none"
                  stroke="url(#sutraGold)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 0.3, ease: "easeInOut" }}
                />

                {/* Central Lotus Heart Sparkle */}
                <motion.circle
                  cx="50"
                  cy="52"
                  r="3.5"
                  fill="#D4A35A"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.8, delay: 1.5 }}
                />
              </motion.svg>

              {/* Master Vertical Logo Symbol overlay */}
              <motion.img
                src="/brand/sutra-symbol.png"
                alt="Sutra Studio"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 0.92 }}
                transition={{ duration: 1.2, delay: 0.6 }}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
            </div>
          </motion.div>

          {/* Master Vertical Logo Image & Typography */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="space-y-3"
          >
            <div className="flex justify-center">
              <img
                src="/brand/sutra-logo-vertical.png"
                alt="Sutra Studio Atelier"
                className="h-28 sm:h-36 w-auto object-contain drop-shadow-sm"
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-xs sm:text-sm font-sans tracking-[0.25em] text-[#5C3A1E] uppercase font-medium"
            >
              Indian Heritage • Spatial Design • Creative Engineering
            </motion.p>
          </motion.div>

          {/* Enter Atelier CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="pt-2"
          >
            <button
              onClick={handleDismiss}
              className="px-8 py-3 rounded-full bg-[#171717] hover:bg-[#262626] text-[#FAF9F5] border border-[#A98B57]/60 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2.5 mx-auto group text-sm font-semibold"
            >
              <span>Enter Atelier</span>
              <ArrowRight className="w-4 h-4 text-[#D4A35A] group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Bottom Progress Bar & Loading Indicator */}
        <div className="w-full max-w-md relative z-10 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#D4A35A] animate-spin" />
              Initializing Creative Engine...
            </span>
            <span>{progress}%</span>
          </div>

          <div className="h-1.5 w-full bg-[#EADFCB]/60 rounded-full overflow-hidden p-0.5 border border-[#EADFCB]">
            <motion.div
              className="h-full bg-gradient-to-r from-[#A98B57] via-[#D4A35A] to-[#5C3A1E] rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>

          <p className="text-[10px] text-center text-[#94A3B8] font-sans">
            Curating 12 studio capabilities • Real-Time GPU Workflows • Zero Noise
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
