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
      alt="Sutra Studio Lotus Symbol"
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
  const heightClasses = {
    sm: "h-9 sm:h-10 w-auto object-contain transition-all duration-300",
    md: "h-10 sm:h-11 md:h-12 w-auto object-contain transition-all duration-300",
    lg: "h-14 sm:h-16 md:h-18 w-auto object-contain transition-all duration-300",
    xl: "h-20 sm:h-24 md:h-28 w-auto object-contain transition-all duration-300",
  }[size];

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

  // Official Master PNG Asset file mapping
  const assetSrc =
    variant === "horizontal"
      ? "/brand/sutra-logo-primary.png"
      : variant === "horizontal-dark" || isBlack
      ? "/brand/sutra-logo-black.png"
      : isWhite
      ? "/brand/sutra-logo-white.png"
      : isStacked
      ? "/brand/sutra-logo-vertical.png"
      : variant === "symbol"
      ? "/brand/sutra-symbol.png"
      : variant === "monogram"
      ? "/brand/sutra-monogram.png"
      : variant === "social-icon"
      ? "/brand/sutra-social-icon.png"
      : variant === "watermark-dark"
      ? "/brand/sutra-watermark-dark.png"
      : variant === "watermark" || variant === "watermark-light"
      ? "/brand/sutra-watermark-light.png"
      : "/brand/sutra-logo-primary.png";

  const content = (
    <div
      className={`inline-flex items-center transition-opacity hover:opacity-95 ${
        isStacked ? "flex-col text-center" : "flex-row gap-3"
      } ${className}`}
    >
      {/* Official Master PNG Logo File Render */}
      <img
        src={assetSrc}
        alt="Sutra Studio"
        className={`${heightClasses} w-auto max-w-full object-contain`}
        loading="eager"
      />
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
