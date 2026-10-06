import React from "react";
import { LotusSymbol } from "@/components/brand/SutraLogo";

export default function RootLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F5EF] text-[#0F172A] px-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative animate-pulse">
          <LotusSymbol className="w-16 h-16" color="gold" />
        </div>
        <div className="h-1.5 w-48 bg-[#EADFCB] rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-[#D4A35A] to-[#5C3A1E] rounded-full animate-indeterminate" />
        </div>
        <p className="text-xs font-serif tracking-widest text-[#5C3A1E] uppercase font-semibold">
          Sutra Studio
        </p>
      </div>
    </div>
  );
}
