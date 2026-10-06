"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * High-End Luxury Animated Status Icons for Sutra Studio
 *
 * Micro-animations engineered with smooth vector easing,
 * warm-ivory / golden palette, and zero raster GIF lag.
 */

// 1. Animated Notification Bell with swinging bell and glowing wave ripples
export function AnimatedBellIcon({
  hasUnread = false,
  className = "w-5 h-5",
}: {
  hasUnread?: boolean;
  className?: string;
}) {
  return (
    <div className="relative inline-flex items-center justify-center">
      {hasUnread && (
        <motion.span
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-[#D4A35A]/30 pointer-events-none"
        />
      )}
      <motion.svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        animate={
          hasUnread
            ? {
                rotate: [0, -14, 14, -10, 10, -4, 4, 0],
              }
            : {}
        }
        transition={
          hasUnread
            ? {
                duration: 2.2,
                repeat: Infinity,
                repeatDelay: 2.5,
                ease: "easeInOut",
              }
            : {}
        }
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </motion.svg>
    </div>
  );
}

// 2. Animated Success Checkmark (Celebratory stroke draw + golden ring pulse)
export function AnimatedCheckSuccess({
  size = 64,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Expanding ambient golden aura */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.9, 1.15, 1], opacity: [0.3, 0.6, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute rounded-full bg-[#D4A35A]/20 pointer-events-none"
        style={{ width: size * 1.35, height: size * 1.35 }}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Background circle badge */}
        <motion.circle
          cx="32"
          cy="32"
          r="28"
          fill="#F0FDF4"
          stroke="#86EFAC"
          strokeWidth="2.5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        />

        {/* Decorative rotating sparkle ring */}
        <motion.circle
          cx="32"
          cy="32"
          r="28"
          stroke="#16A34A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="180"
          strokeDashoffset="180"
          initial={{ strokeDashoffset: 180 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Animated Checkmark Path */}
        <motion.path
          d="M20 33 L28 41 L44 24"
          fill="none"
          stroke="#16A34A"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}

// 3. Animated Payment Verified Badge (Golden coin shimmer + verified shield)
export function AnimatedPaymentBadge({
  size = 56,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.95, 1.08, 0.95], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute rounded-full bg-[#D4A35A]/25 pointer-events-none"
        style={{ width: size * 1.3, height: size * 1.3 }}
      />

      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="relative z-10 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#FAF9F5] via-[#FFFDF9] to-[#F5EAD4] border-2 border-[#D4A35A] shadow-md text-[#5C3A1E]"
        style={{ width: size, height: size }}
      >
        <motion.span
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="font-serif font-bold text-2xl text-[#5C3A1E]"
        >
          ₹
        </motion.span>
        {/* Shimmer line across badge */}
        <motion.div
          animate={{ x: [-size, size] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
          className="absolute inset-y-0 w-3 bg-white/40 skew-x-12 pointer-events-none"
        />
      </motion.div>
    </div>
  );
}

// 4. Animated Welcome Lotus Badge (Blooming petals with gentle pulse)
export function AnimatedWelcomeBadge({
  size = 60,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute rounded-full bg-gradient-to-tr from-[#D4A35A]/30 to-[#5C3A1E]/20 blur-sm pointer-events-none"
        style={{ width: size * 1.25, height: size * 1.25 }}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex items-center justify-center rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-sm"
        style={{ width: size, height: size }}
      >
        <motion.svg
          width={size * 0.65}
          height={size * 0.65}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Central Petal */}
          <motion.path
            d="M50 15 C45 35, 45 65, 50 85 C55 65, 55 35, 50 15 Z"
            fill="#D4A35A"
            initial={{ pathLength: 0, scale: 0.8 }}
            animate={{ pathLength: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          />
          {/* Left Petal */}
          <motion.path
            d="M50 35 C30 45, 20 60, 25 78 C35 72, 45 58, 50 35 Z"
            fill="#5C3A1E"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 0.9, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          />
          {/* Right Petal */}
          <motion.path
            d="M50 35 C70 45, 80 60, 75 78 C65 72, 55 58, 50 35 Z"
            fill="#5C3A1E"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 0.9, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          />
        </motion.svg>
      </motion.div>
    </div>
  );
}

// 5. Animated Reminder Clock (Pulsing amber dial with turning hands)
export function AnimatedReminderClock({
  size = 56,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute rounded-full bg-[#FEF3C7] pointer-events-none"
        style={{ width: size * 1.3, height: size * 1.3 }}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <circle cx="28" cy="28" r="24" fill="#FFFDF0" stroke="#F59E0B" strokeWidth="2.5" />
        {/* Hour Hand */}
        <motion.line
          x1="28"
          y1="28"
          x2="28"
          y2="17"
          stroke="#92400E"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ originX: "28px", originY: "28px" }}
        />
        {/* Minute Hand */}
        <motion.line
          x1="28"
          y1="28"
          x2="36"
          y2="28"
          stroke="#D97706"
          strokeWidth="2.5"
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ originX: "28px", originY: "28px" }}
        />
        <circle cx="28" cy="28" r="2.5" fill="#92400E" />
      </svg>
    </div>
  );
}
