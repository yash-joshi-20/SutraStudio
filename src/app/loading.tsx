import React from "react";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Sutra Studio"
      className="min-h-[70vh] flex flex-col items-center justify-center bg-[#F8F5EF] px-4"
    >
      <div className="relative flex flex-col items-center gap-5">
        {/* Animated Brand Emblem Silhouette */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-[#D4A35A]/15 animate-ping opacity-40" />
          <div className="relative w-14 h-14 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-warm flex items-center justify-center">
            <svg
              viewBox="0 0 64 64"
              className="w-8 h-8 text-[#5C3A1E] animate-pulse"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Sacred Geometric Lotus Motif */}
              <path d="M32 10 C32 10, 42 24, 42 36 C42 46, 32 54, 32 54 C32 54, 22 46, 22 36 C22 24, 32 10, 32 10 Z" />
              <path d="M32 24 C38 28, 52 34, 50 46 C48 54, 38 54, 32 54" />
              <path d="M32 24 C26 28, 12 34, 14 46 C16 54, 26 54, 32 54" />
              <circle cx="32" cy="38" r="3" fill="#D4A35A" />
            </svg>
          </div>
        </div>

        {/* Studio Monogram & Status */}
        <div className="text-center space-y-1.5">
          <p className="font-serif text-sm font-semibold tracking-wider text-[#0F172A] uppercase">
            Sutra Studio
          </p>
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A35A] animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#5C3A1E] animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#A98B57] animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>

        {/* Minimal Loading Bar */}
        <div className="w-36 h-1 bg-[#EADFCB] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#D4A35A] to-[#5C3A1E] w-1/2 rounded-full animate-[shimmer_1.4s_infinite_linear]" />
        </div>
      </div>
    </div>
  );
}
