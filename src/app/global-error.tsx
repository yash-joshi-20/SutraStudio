"use client";

import React, { useEffect } from "react";
import { LotusSymbol } from "@/components/brand/SutraLogo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global App Error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-[#F8F5EF] text-[#0F172A] p-4 selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <div className="max-w-md w-full text-center space-y-6 bg-[#FFFDF9] border border-[#EADFCB] p-8 rounded-3xl shadow-warm">
          <div className="flex justify-center">
            <LotusSymbol className="w-14 h-14" color="gold" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A]">
              Application Notice
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              A temporary interface interruption occurred. The studio environment is protected and your session remains secure.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl bg-[#5C3A1E] hover:bg-[#432914] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Reload Interface
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="px-5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] hover:bg-[#F4EFE6] text-[#5C3A1E] text-xs font-semibold transition-colors cursor-pointer"
            >
              Return to Studio
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
