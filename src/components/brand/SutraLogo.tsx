"use client";

import React from "react";
import Link from "next/link";

export type LogoVariant =
  | "horizontal"
  | "horizontal-dark"
  | "stacked"
  | "vertical"
  | "symbol"
  | "favicon"
  | "app-icon"
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
  const gradientId = React.useId();

  const isGold = color === "gold";
  const fillColor =
    color === "white"
      ? "#FFFFFF"
      : color === "black"
      ? "#171717"
      : color === "watermark-light"
      ? "rgba(212,163,90,0.18)"
      : color === "watermark-dark"
      ? "rgba(255,255,255,0.12)"
      : `url(#${gradientId}-grad)`;

  const shineColor = isGold ? `url(#${gradientId}-shine)` : fillColor;
  const petalLColor = isGold ? `url(#${gradientId}-petal-l)` : fillColor;
  const petalRColor = isGold ? `url(#${gradientId}-petal-r)` : fillColor;

  return (
    <svg
      viewBox="0 0 1000 1000"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {isGold && (
        <defs>
          <linearGradient id={`${gradientId}-grad`} x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#F2CB7E" />
            <stop offset="25%" stopColor="#DEAA52" />
            <stop offset="55%" stopColor="#B87B28" />
            <stop offset="85%" stopColor="#8E5316" />
            <stop offset="100%" stopColor="#6E3D0E" />
          </linearGradient>
          <linearGradient id={`${gradientId}-shine`} x1="0" y1="0" x2="1" y2="0.8">
            <stop offset="0%" stopColor="#FCE5A6" />
            <stop offset="40%" stopColor="#D99F45" />
            <stop offset="80%" stopColor="#9C5E1B" />
            <stop offset="100%" stopColor="#693B0F" />
          </linearGradient>
          <linearGradient id={`${gradientId}-petal-l`} x1="0" y1="0.2" x2="1" y2="0.8">
            <stop offset="0%" stopColor="#EDC06D" />
            <stop offset="50%" stopColor="#C58C36" />
            <stop offset="100%" stopColor="#7D4913" />
          </linearGradient>
          <linearGradient id={`${gradientId}-petal-r`} x1="1" y1="0.2" x2="0" y2="0.8">
            <stop offset="0%" stopColor="#EDC06D" />
            <stop offset="50%" stopColor="#C58C36" />
            <stop offset="100%" stopColor="#7D4913" />
          </linearGradient>
        </defs>
      )}

      {/* Top Diamond Accent */}
      <polygon points="500,52 538,122 500,192 462,122" fill={fillColor} />

      {/* Central Lotus 'S' Flourish */}
      <path
        d="M 500,200 C 525,198 568,206 605,236 C 645,268 652,318 602,362 C 592,342 562,316 525,302 C 490,290 488,252 500,200 Z"
        fill={shineColor}
      />
      <path
        d="M 500,200 C 430,225 350,295 320,380 C 290,465 340,545 425,600 C 505,650 560,705 540,770 C 518,830 435,845 375,790 C 355,770 345,745 342,715 C 330,735 320,770 338,810 C 370,875 460,895 535,865 C 625,825 660,730 630,640 C 600,550 500,490 430,440 C 365,395 355,330 380,285 C 408,235 455,208 500,200 Z"
        fill={fillColor}
      />
      <path
        d="M 395,528 C 372,558 355,605 358,660 C 365,745 435,800 505,790 C 565,780 595,720 575,655 C 550,578 468,515 412,475 C 402,492 398,510 395,528 Z"
        fill={shineColor}
      />

      {/* Left Flanking Lotus Petals */}
      <path
        d="M 390,795 C 320,785 195,750 115,670 C 50,605 35,535 45,540 C 80,540 150,600 220,680 C 270,735 330,775 390,795 Z"
        fill={petalLColor}
      />
      <path
        d="M 330,735 C 260,670 190,560 190,420 C 220,440 260,520 300,610 C 320,655 335,700 330,735 Z"
        fill={petalLColor}
      />
      <path
        d="M 345,610 C 320,530 270,395 240,320 C 275,345 320,430 345,520 C 350,545 352,580 345,610 Z"
        fill={petalLColor}
      />

      {/* Right Flanking Lotus Petals */}
      <path
        d="M 610,795 C 680,785 805,750 885,670 C 950,605 965,535 955,540 C 920,540 850,600 780,680 C 730,735 670,775 610,795 Z"
        fill={petalRColor}
      />
      <path
        d="M 670,735 C 740,670 810,560 810,420 C 780,440 740,520 700,610 C 680,655 665,700 670,735 Z"
        fill={petalRColor}
      />
      <path
        d="M 655,610 C 680,530 730,395 760,320 C 725,345 680,430 655,520 C 650,545 648,580 655,610 Z"
        fill={petalRColor}
      />

      {/* Bottom Accents */}
      <path
        d="M 235,845 C 300,835 380,838 440,855 C 380,858 300,862 235,845 Z"
        fill={fillColor}
      />
      <path
        d="M 765,845 C 700,835 620,838 560,855 C 620,858 700,862 765,845 Z"
        fill={fillColor}
      />
      <polygon points="500,820 558,890 500,968 442,890" fill={fillColor} />
    </svg>
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
    <div
      className={`relative inline-flex items-center justify-center rounded-[22%] bg-[#0F172A] border border-[#D4A35A]/50 shadow-md overflow-hidden p-2 ${className}`}
      style={{ width: size, height: size }}
    >
      <LotusSymbol className="w-full h-full object-contain" color="gold" />
    </div>
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
    <div
      className={`relative inline-flex items-center justify-center rounded-[22%] bg-[#0F172A] border border-[#D4A35A]/50 shadow-sm overflow-hidden p-1 ${className}`}
      style={{ width: size, height: size }}
    >
      <LotusSymbol className="w-full h-full object-contain" color="gold" />
    </div>
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

  const sizeClasses = {
    sm: { symbol: "w-8 h-8", text: "text-xl", tagline: "text-[10px]" },
    md: { symbol: "w-11 h-11", text: "text-2xl", tagline: "text-xs" },
    lg: { symbol: "w-16 h-16", text: "text-3xl", tagline: "text-sm" },
    xl: { symbol: "w-24 h-24", text: "text-5xl", tagline: "text-base" },
  }[size];

  const isStacked = variant === "vertical" || variant === "stacked";
  const isWhite = variant === "monochrome-white" || variant === "white";
  const isBlack = variant === "monochrome-black" || variant === "black";
  const isDarkHoriz = variant === "horizontal-dark";

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

  const symbolColor = isWhite
    ? "white"
    : isBlack
    ? "black"
    : variant === "watermark-dark"
    ? "watermark-dark"
    : variant === "watermark" || variant === "watermark-light"
    ? "watermark-light"
    : "gold";

  // Official Brand Asset file mapping
  const assetSrc =
    variant === "horizontal"
      ? "/brand/sutra-logo-horizontal.svg"
      : variant === "horizontal-dark"
      ? "/brand/sutra-logo-horizontal-dark.svg"
      : isWhite
      ? "/brand/sutra-logo-monochrome-white.svg"
      : isBlack
      ? "/brand/sutra-logo-monochrome-black.svg"
      : isStacked
      ? "/brand/sutra-logo-vertical.svg"
      : variant === "symbol"
      ? "/brand/sutra-mark.svg"
      : variant === "watermark-dark"
      ? "/brand/watermark_dark.svg"
      : variant === "watermark" || variant === "watermark-light"
      ? "/brand/watermark_light.svg"
      : "/brand/sutra-logo-horizontal.svg";

  const content = (
    <div
      className={`inline-flex items-center transition-opacity hover:opacity-95 ${
        isStacked ? "flex-col text-center" : "flex-row gap-3"
      } ${className}`}
    >
      {/* Official Vector Logo File Render */}
      <img
        src={assetSrc}
        alt="Sutra Studio"
        className={`${heightClasses} w-auto max-w-full object-contain`}
        onError={(e) => {
          // If image fails, fallback to inline SVG component
          (e.currentTarget as HTMLElement).style.display = "none";
        }}
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
