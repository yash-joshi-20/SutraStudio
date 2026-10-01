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

export { Badge } from "./Badge";
export type { BadgeProps, BadgeVariant } from "./Badge";

export { Input } from "./Input";
export type { InputProps } from "./Input";
