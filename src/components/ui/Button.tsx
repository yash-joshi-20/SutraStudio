"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "gold" | "outline" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  withArrow?: boolean;
  leftIcon?: React.ReactNode;
  href?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  withArrow = false,
  leftIcon,
  className = "",
  disabled,
  href,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A35A] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer";

  const sizeStyles = {
    sm: "text-xs px-4 py-2 min-h-[44px] gap-1.5",
    md: "text-sm px-6 py-2.5 min-h-[44px] gap-2",
    lg: "text-base px-8 py-3.5 min-h-[48px] gap-2.5",
  }[size];

  const variantStyles = {
    // Primary deep brown button
    primary:
      "bg-[#5C3A1E] text-[#FFFDF9] hover:bg-[#4A2E17] shadow-sm hover:shadow-md active:scale-[0.98]",
    // Gold gradient brand button
    gold: "bg-gradient-to-r from-[#D4A35A] to-[#A87933] text-[#FFFDF9] hover:from-[#C7964E] hover:to-[#966B2B] shadow-sm active:scale-[0.98]",
    // Secondary lotus cream button with subtle border
    secondary:
      "bg-[#FFFDF9] text-[#0F172A] border border-[#EADFCB] hover:border-[#D4A35A] hover:bg-[#FAF6EE] active:scale-[0.98]",
    // Outline
    outline:
      "bg-transparent text-[#5C3A1E] border border-[#5C3A1E]/30 hover:border-[#5C3A1E] hover:bg-[#5C3A1E]/5 active:scale-[0.98]",
    // Ghost
    ghost:
      "bg-transparent text-[#0F172A] hover:bg-[#EADFCB]/30 hover:text-[#5C3A1E]",
    // On Dark
    dark: "bg-gradient-to-r from-[#E2B872] via-[#D4A35A] to-[#8A5A2B] text-[#0F172A] font-semibold hover:opacity-95 shadow-md active:scale-[0.98]",
  }[variant];

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      >
        {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {withArrow && (
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        )}
      </Link>
    );
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {withArrow && !isLoading && (
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
      )}
    </button>
  );
}
