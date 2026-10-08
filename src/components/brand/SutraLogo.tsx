"use client";

import React from "react";
import Link from "next/link";

export type LogoVariant =
  | "horizontal"
  | "horizontal-dark"
  | "stacked"
  | "vertical"
  | "symbol"
  | "monogram"
  | "favicon"
  | "app-icon"
  | "social-icon"
  | "white"
  | "black"
  | "monochrome-white"
  | "monochrome-black"
  | "watermark"
  | "watermark-light"
  | "watermark-dark";

export interface SutraLogoProps {
  variant?: LogoVariant;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTagline?: boolean;
  href?: string;
}

export function LotusSymbol({
  className = "w-8 h-8",
  color = "gold",
}: {
  className?: string;
  color?: "gold" | "white" | "black" | "watermark-light" | "watermark-dark";
}) {
  const src =
    color === "white"
      ? "/brand/sutra-logo-white.png"
      : color === "black"
      ? "/brand/sutra-logo-black.png"
      : color === "watermark-dark"
      ? "/brand/sutra-watermark-dark.png"
      : color === "watermark-light"
      ? "/brand/sutra-watermark-light.png"
      : "/brand/sutra-symbol.png";

  return (
    <img
      src={src}
      alt="Sutra Studios Lotus Symbol"
      className={`${className} object-contain shrink-0`}
      loading="eager"
    />
  );
}

export function SutraAppIcon({
  className = "w-12 h-12",
  size = 48,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <img
      src="/brand/sutra-app-icon.png"
      alt="Sutra App Icon"
      className={`rounded-[22%] object-contain shrink-0 shadow-md ${className}`}
      style={{ width: size, height: size }}
      loading="eager"
    />
  );
}

export function SutraFavicon({
  className = "w-8 h-8",
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <img
      src="/brand/sutra-favicon.png"
      alt="Sutra Favicon"
      className={`object-contain shrink-0 ${className}`}
      style={{ width: size, height: size }}
      loading="eager"
    />
  );
}

export const SutraSymbol = LotusSymbol;

export function SutraLogo({
  variant = "horizontal",
  size = "md",
  className = "",
  showTagline = true,
  href = "/",
}: SutraLogoProps) {
  const isStacked = variant === "vertical" || variant === "stacked";
  const isWhite = variant === "monochrome-white" || variant === "white";
  const isBlack = variant === "monochrome-black" || variant === "black";

  if (variant === "app-icon") {
    const iconSize = size === "sm" ? 32 : size === "md" ? 44 : size === "lg" ? 64 : 96;
    const badge = <SutraAppIcon size={iconSize} className={className} />;
    return href ? <Link href={href} className="inline-block">{badge}</Link> : badge;
  }

  if (variant === "favicon") {
    const iconSize = size === "sm" ? 24 : size === "md" ? 32 : size === "lg" ? 48 : 64;
    const badge = <SutraFavicon size={iconSize} className={className} />;
    return href ? <Link href={href} className="inline-block">{badge}</Link> : badge;
  }

  if (variant === "symbol" || variant === "monogram") {
    const symbolSizeClass = {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-14 h-14",
      xl: "w-20 h-20",
    }[size];
    const badge = (
      <LotusSymbol
        className={`${symbolSizeClass} ${className}`}
        color={isWhite ? "white" : isBlack ? "black" : "gold"}
      />
    );
    return href ? <Link href={href} className="inline-block">{badge}</Link> : badge;
  }

  const sizeClasses = {
    sm: { symbol: "w-7 h-7 sm:w-8 sm:h-8", text: "text-base sm:text-lg", tagline: "text-[7.5px]" },
    md: { symbol: "w-9 h-9 sm:w-10 sm:h-10", text: "text-lg sm:text-xl md:text-2xl", tagline: "text-[8.5px]" },
    lg: { symbol: "w-12 h-12 sm:w-14 sm:h-14", text: "text-2xl sm:text-3xl", tagline: "text-[10px]" },
    xl: { symbol: "w-16 h-16 sm:w-20 sm:h-20", text: "text-4xl sm:text-5xl", tagline: "text-[12px]" },
  }[size];

  const content = (
    <div
      className={`inline-flex items-center transition-all duration-300 group-hover:opacity-95 ${
        isStacked ? "flex-col text-center gap-1.5" : "flex-row items-center gap-2.5 sm:gap-3"
      } ${className}`}
    >
      <LotusSymbol
        className={`${sizeClasses.symbol} shrink-0`}
        color={isWhite ? "white" : isBlack ? "black" : "gold"}
      />
      <div className={`flex flex-col ${isStacked ? "items-center" : "items-start"} leading-none select-none`}>
        <div className={`flex items-baseline gap-1.5 font-bold uppercase ${sizeClasses.text} font-serif tracking-[0.16em]`}>
          <span className={isWhite ? "text-white" : isBlack ? "text-black" : "text-[#171717]"}>
            SUTRA
          </span>
          <span className={isWhite ? "text-[#EADFCB]" : isBlack ? "text-black/80" : "text-[#A98B57]"}>
            STUDIOS
          </span>
        </div>
        {showTagline && size !== "sm" && (
          <span
            className={`uppercase tracking-[0.26em] ${sizeClasses.tagline} font-medium mt-1 ${
              isWhite ? "text-white/60" : "text-[#8C7A6B]"
            }`}
          >
            Digital Atelier
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block group focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
