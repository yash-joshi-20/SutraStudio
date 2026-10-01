"use client";

import React from "react";
import Link from "next/link";

interface SutraLogoProps {
  variant?: "horizontal" | "horizontal-dark" | "vertical" | "symbol" | "app-icon" | "monochrome-white" | "monochrome-black" | "watermark-light" | "watermark-dark";
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

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient
          id={`${gradientId}-gold`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#E2B872" />
          <stop offset="45%" stopColor="#D4A35A" />
          <stop offset="100%" stopColor="#8A5A2B" />
        </linearGradient>
      </defs>

      {/* Top Diamond Accent */}
      <path
        d="M50 4L54 11L50 18L46 11Z"
        fill={
          color === "white"
            ? "#FFFFFF"
            : color === "black"
            ? "#171717"
            : color === "watermark-light"
            ? "rgba(212,163,90,0.18)"
            : color === "watermark-dark"
            ? "rgba(255,255,255,0.12)"
            : `url(#${gradientId}-gold)`
        }
      />

      {/* Central stylized 'S' spine and core */}
      <path
        d="M50 16C58 20 62 26 58 36C54 44 43 47 43 56C43 65 52 70 59 66C63 64 65 60 66 57C67 55 69 57 68 59C66 65 61 72 52 73C41 74 35 66 35 56C35 45 48 41 50 33C52 27 49 22 43 23C40 23 37 25 35 28C34 29 33 28 34 26C37 20 43 15 50 16Z"
        fill={
          color === "white"
            ? "#FFFFFF"
            : color === "black"
            ? "#171717"
            : color === "watermark-light"
            ? "rgba(212,163,90,0.18)"
            : color === "watermark-dark"
            ? "rgba(255,255,255,0.12)"
            : `url(#${gradientId}-gold)`
        }
      />

      {/* Left Petals */}
      <path
        d="M42 38C34 32 20 37 18 52C22 56 31 54 39 46C41 44 42 41 42 38Z"
        fill={
          color === "white"
            ? "#FFFFFF"
            : color === "black"
            ? "#171717"
            : color === "watermark-light"
            ? "rgba(212,163,90,0.18)"
            : color === "watermark-dark"
            ? "rgba(255,255,255,0.12)"
            : `url(#${gradientId}-gold)`
        }
      />
      <path
        d="M37 54C28 52 14 59 13 72C20 76 30 71 36 62C38 59 38 56 37 54Z"
        fill={
          color === "white"
            ? "#FFFFFF"
            : color === "black"
            ? "#171717"
            : color === "watermark-light"
            ? "rgba(212,163,90,0.18)"
            : color === "watermark-dark"
            ? "rgba(255,255,255,0.12)"
            : `url(#${gradientId}-gold)`
        }
      />
      <path
        d="M45 68C38 72 26 77 22 88C31 89 42 84 48 76C47 73 46 70 45 68Z"
        fill={
          color === "white"
            ? "#FFFFFF"
            : color === "black"
            ? "#171717"
            : color === "watermark-light"
            ? "rgba(212,163,90,0.18)"
            : color === "watermark-dark"
            ? "rgba(255,255,255,0.12)"
            : `url(#${gradientId}-gold)`
        }
      />

      {/* Right Petals */}
      <path
        d="M58 38C66 32 80 37 82 52C78 56 69 54 61 46C59 44 58 41 58 38Z"
        fill={
          color === "white"
            ? "#FFFFFF"
            : color === "black"
            ? "#171717"
            : color === "watermark-light"
            ? "rgba(212,163,90,0.18)"
            : color === "watermark-dark"
            ? "rgba(255,255,255,0.12)"
            : `url(#${gradientId}-gold)`
        }
      />
      <path
        d="M63 54C72 52 86 59 87 72C80 76 70 71 64 62C62 59 62 56 63 54Z"
        fill={
          color === "white"
            ? "#FFFFFF"
            : color === "black"
            ? "#171717"
            : color === "watermark-light"
            ? "rgba(212,163,90,0.18)"
            : color === "watermark-dark"
            ? "rgba(255,255,255,0.12)"
            : `url(#${gradientId}-gold)`
        }
      />
      <path
        d="M55 68C62 72 74 77 78 88C69 89 58 84 52 76C53 73 54 70 55 68Z"
        fill={
          color === "white"
            ? "#FFFFFF"
            : color === "black"
            ? "#171717"
            : color === "watermark-light"
            ? "rgba(212,163,90,0.18)"
            : color === "watermark-dark"
            ? "rgba(255,255,255,0.12)"
            : `url(#${gradientId}-gold)`
        }
      />

      {/* Bottom Lotus Diamond Accent */}
      <path
        d="M50 82L55 90L50 98L45 90Z"
        fill={
          color === "white"
            ? "#FFFFFF"
            : color === "black"
            ? "#171717"
            : color === "watermark-light"
            ? "rgba(212,163,90,0.18)"
            : color === "watermark-dark"
            ? "rgba(255,255,255,0.12)"
            : `url(#${gradientId}-gold)`
        }
      />
    </svg>
  );
}

export function SutraLogo({
  variant = "horizontal",
  size = "md",
  className = "",
  showTagline = true,
  href = "/",
}: SutraLogoProps) {
  const sizeClasses = {
    sm: { symbol: "w-7 h-7", text: "text-lg", tagline: "text-[9px]" },
    md: { symbol: "w-9 h-9", text: "text-xl", tagline: "text-[10px]" },
    lg: { symbol: "w-14 h-14", text: "text-3xl", tagline: "text-xs" },
    xl: { symbol: "w-20 h-20", text: "text-4xl", tagline: "text-sm" },
  }[size];

  const content = (
    <div
      className={`inline-flex items-center transition-opacity hover:opacity-95 ${
        variant === "vertical" ? "flex-col text-center" : "flex-row gap-3"
      } ${className}`}
    >
      {/* Symbol */}
      <LotusSymbol
        className={sizeClasses.symbol}
        color={
          variant === "monochrome-white"
            ? "white"
            : variant === "monochrome-black"
            ? "black"
            : variant === "watermark-light"
            ? "watermark-light"
            : variant === "watermark-dark"
            ? "watermark-dark"
            : "gold"
        }
      />

      {/* Typography */}
      {variant !== "symbol" && (
        <div
          className={`flex flex-col ${
            variant === "vertical" ? "items-center mt-2" : "items-start"
          }`}
        >
          <div className="flex items-center tracking-[0.14em]">
            <span
              className={`font-serif font-semibold tracking-wider ${sizeClasses.text} ${
                variant === "monochrome-white" || variant === "horizontal-dark"
                  ? "text-white"
                  : variant === "monochrome-black"
                  ? "text-[#171717]"
                  : "text-[#0F172A]"
              }`}
            >
              SUTRA STUDIO
            </span>
          </div>

          {showTagline && (
            <span
              className={`font-sans tracking-[0.24em] uppercase font-medium mt-0.5 ${sizeClasses.tagline} ${
                variant === "monochrome-white"
                  ? "text-white/70"
                  : variant === "horizontal-dark"
                  ? "text-[#94A3B8]"
                  : "text-[#64748B]"
              }`}
            >
              IDEAS ◆ DESIGN ◆ DEVELOPMENT ◆ GROWTH
            </span>
          )}
        </div>
      )}
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
