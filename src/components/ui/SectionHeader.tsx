import React from "react";

export interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  subtitle,
  align = "center",
  className = "",
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div
      className={`space-y-3 ${
        isCenter ? "text-center max-w-2xl mx-auto" : "text-left max-w-2xl"
      } ${className}`}
    >
      {badge && (
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em] bg-[#F4EFE6] text-[#5C3A1E] border border-[#EADFCB] ${
            isCenter ? "mx-auto" : ""
          }`}
        >
          <span className="text-[#D4A35A] text-[10px]">◆</span>
          <span>{badge}</span>
        </div>
      )}

      <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#0F172A] tracking-tight leading-[1.15]">
        {title}
      </h2>

      {subtitle && (
        <p className="text-base sm:text-lg text-[#64748B] leading-relaxed font-sans">
          {subtitle}
        </p>
      )}
    </div>
  );
}
