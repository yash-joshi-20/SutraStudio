import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "surface" | "cream" | "outline" | "elevated";
  hoverable?: boolean;
}

export function Card({
  children,
  variant = "surface",
  hoverable = false,
  className = "",
  ...props
}: CardProps) {
  const variantStyles = {
    surface: "bg-[#FFFFFF] border border-[#EADFCB]",
    cream: "bg-[#FFFDF9] border border-[#EADFCB]",
    outline: "bg-transparent border border-[#EADFCB]",
    elevated: "bg-[#FFFFFF] border border-[#EADFCB] shadow-warm",
  }[variant];

  const hoverStyles = hoverable
    ? "transition-all duration-200 hover:-translate-y-1 hover:border-[#D4A35A] hover:shadow-warm-hover cursor-pointer"
    : "";

  return (
    <div
      className={`rounded-2xl p-6 ${variantStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "progress" | "completed" | "review" | "pending" | "error" | "gold";
  className?: string;
}) {
  const styles = {
    default: "bg-[#F4EFE6] text-[#5C3A1E] border border-[#EADFCB]",
    progress: "bg-[#FFF8E6] text-[#C2761A] border border-[#F6D089]",
    completed: "bg-[#EDF7F0] text-[#2E7D4F] border border-[#B6E2C6]",
    review: "bg-[#EEF4FC] text-[#3B6FB6] border border-[#BED7F7]",
    pending: "bg-[#FFF5EB] text-[#B45309] border border-[#FDD0A8]",
    error: "bg-[#FDF2F2] text-[#B42318] border border-[#F8B4B4]",
    gold: "bg-[#FDF9F0] text-[#8A5A2B] border border-[#EADFCB]",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide ${styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
}

export function Input({
  label,
  error,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-xl bg-[#FFFDF9] border border-[#EADFCB] px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus:border-[#D4A35A] focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/30 disabled:opacity-50 ${
          error ? "border-[#B42318] focus:ring-[#B42318]/20" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[#B42318]">{error}</p>}
    </div>
  );
}
