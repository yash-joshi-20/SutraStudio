import React from "react";

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

  return (
    <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-5 shadow-sm transition-all hover:border-[#D4A35A]/60">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
        {label}
      </p>
      <p className={`font-serif text-3xl font-bold mt-2 ${valueColors}`}>
        {value}
      </p>
      {sublabel && (
        <p className="text-xs text-[#94A3B8] mt-1 font-medium">{sublabel}</p>
      )}
    </div>
  );
}

export function EmptyState({
  title = "No items yet",
  description = "Your workspace is ready. Place an order or start a conversation with the Studio Concierge.",
  actionLabel,
  actionHref,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#EADFCB] bg-[#FFFDF9]/60 p-12 text-center">
      <div className="w-12 h-12 rounded-full bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center text-[#5C3A1E] font-serif text-lg font-bold mb-4">
        ✦
      </div>
      <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
        {title}
      </h3>
      <p className="text-sm text-[#64748B] max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center text-sm font-medium px-5 py-2.5 rounded-full bg-[#5C3A1E] text-white hover:bg-[#4A2E17] transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
