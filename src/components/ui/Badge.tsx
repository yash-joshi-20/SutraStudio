import React from "react";

export type BadgeVariant =
  | "default"
  | "progress"
  | "completed"
  | "review"
  | "pending"
  | "error"
  | "gold"
  | "outline"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  showDot?: boolean;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  showDot = true,
  className = "",
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-[#F4EFE6] text-[#5C3A1E] border-[#EADFCB]",
    progress: "bg-[#FFF8E6] text-[#C2761A] border-[#F6D089]",
    completed: "bg-[#EDF7F0] text-[#2E7D4F] border-[#B6E2C6]",
    review: "bg-[#EEF4FC] text-[#3B6FB6] border-[#BED7F7]",
    pending: "bg-[#FFF5EB] text-[#B45309] border-[#FDD0A8]",
    error: "bg-[#FDF2F2] text-[#B42318] border-[#F8B4B4]",
    gold: "bg-[#FDF9F0] text-[#8A5A2B] border-[#EADFCB]",
    outline: "bg-transparent text-[#5C3A1E] border-[#EADFCB]",
    neutral: "bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]",
  };

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-[11px]",
    md: "px-3 py-1 text-xs",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide border transition-colors ${sizeStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
      )}
      <span>{children}</span>
    </span>
  );
}
