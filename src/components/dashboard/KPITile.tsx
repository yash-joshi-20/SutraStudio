"use client";

import React from "react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

interface KPITileProps {
  label: string;
  value: string | number;
  sublabel?: string;
  variant?: "ink" | "progress" | "completed" | "pending";
}

export function KPITile({
  label,
  value,
  sublabel,
  variant = "ink",
}: KPITileProps) {
  const valueColors = {
    ink: "text-[#0F172A]",
    progress: "text-[#C2761A]",
    completed: "text-[#2E7D4F]",
    pending: "text-[#B45309]",
  }[variant];

  const isNumeric = typeof value === "number";

  return (
    <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-5 shadow-sm transition-all hover:border-[#D4A35A]/60 min-w-0 flex flex-col justify-between">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] truncate" title={label}>
        {label}
      </p>
      <p className={`font-serif text-2xl sm:text-3xl font-bold mt-2 truncate ${valueColors}`} title={String(value)}>
        {isNumeric ? <AnimatedNumber value={value} /> : value}
      </p>
      {sublabel && (
        <p className="text-xs text-[#94A3B8] mt-1 font-medium truncate" title={sublabel}>
          {sublabel}
        </p>
      )}
    </div>
  );
}
