"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Share2,
  TrendingUp,
} from "lucide-react";

interface MetaAdCreativeMockupProps {
  className?: string;
  adTitle?: string;
  headline?: string;
  creativeImageUrl?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function MetaAdCreativeMockup({
  className = "",
  adTitle = "Sutra Studio • Meta Growth Pipeline",
  headline = "Transform your brand with 4K CGI visuals & Vedic spatial craft.",
  creativeImageUrl = "https://image.pollinations.ai/prompt/architectural%20interior%20rendering%2C%20minimalist%20luxury%20living%20space%2C%20intricate%20golden%20jali%20screens%2C%20calacatta%20gold%20marble%20floors%2C%20recessed%203000k%20warm%20led%2C%20hasselblad%20photography%2C%208k?width=1200&height=800&nologo=true",
  ctaText = "Book Studio Pipeline",
  ctaHref = "/orders?service=meta-ads-launcher",
}: MetaAdCreativeMockupProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(1482);

  const toggleLike = () => {
    if (isLiked) {
      setLikeCount((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikeCount((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  return (
    <div
      className={`w-full max-w-md mx-auto rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] overflow-hidden shadow-warm transition-all duration-300 hover:border-[#D4A35A] ${className}`}
    >
      {/* Instagram Post Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-[#EADFCB]/60 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-[#D4A35A] via-[#A98B57] to-[#5C3A1E]">
            <div className="w-full h-full rounded-full bg-[#171717] overflow-hidden flex items-center justify-center p-1">
              <img
                src="/brand/sutra-app-icon.png"
                alt="Sutra Studio"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-[#171717]">
                yashsutrastudio
              </span>
              <span className="w-1 h-1 rounded-full bg-[#94A3B8]" />
              <span className="text-[10px] font-medium text-[#2E7D4F]">
                Sponsored
              </span>
            </div>
            <p className="text-[9px] text-[#64748B] font-mono">
              Creative Tech Atelier • India
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="More ad options"
          className="text-[#94A3B8] hover:text-[#171717] p-1 rounded-full cursor-pointer"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Post Creative Visual */}
      <div className="relative aspect-square w-full bg-[#171717] overflow-hidden group">
        <Image
          src={creativeImageUrl}
          alt="Meta Ad Creative"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 400px"
          priority
        />

        {/* Shimmer / Accent Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {/* Top Floating Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full bg-[#171717]/85 backdrop-blur-md text-[9px] font-mono font-bold text-[#D4A35A] border border-[#A98B57]/50 shadow-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-[#D4A35A]" />
            4K CAMPAIGN CREATIVE
          </span>
        </div>

        {/* Bottom Ad Action Banner Inside Image */}
        <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between p-2.5 rounded-2xl bg-[#171717]/90 backdrop-blur-md border border-[#A98B57]/40 shadow-lg">
          <div className="truncate pr-2">
            <p className="text-[10px] font-mono text-[#D4A35A] truncate font-semibold">
              Meta Ads Growth Engine
            </p>
            <p className="text-xs font-serif font-bold text-white truncate">
              {headline}
            </p>
          </div>

          <Link
            href={ctaHref}
            className="shrink-0 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#D4A35A] to-[#A98B57] hover:from-[#E5BC70] hover:to-[#BFA065] text-[#171717] text-xs font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Engagement Actions Bar */}
      <div className="p-3.5 space-y-2 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleLike}
              className="cursor-pointer transition-transform active:scale-125"
            >
              <Heart
                className={`w-5 h-5 ${
                  isLiked
                    ? "text-[#DC2626] fill-[#DC2626]"
                    : "text-[#171717] hover:text-[#DC2626]"
                }`}
              />
            </button>

            <button
              type="button"
              aria-label="Comment"
              className="text-[#171717] hover:text-[#5C3A1E] cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            <button
              type="button"
              aria-label="Share"
              className="text-[#171717] hover:text-[#5C3A1E] cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className="cursor-pointer transition-transform active:scale-125"
          >
            <Bookmark
              className={`w-5 h-5 ${
                isSaved
                  ? "text-[#A98B57] fill-[#A98B57]"
                  : "text-[#171717] hover:text-[#A98B57]"
              }`}
            />
          </button>
        </div>

        {/* Likes Count */}
        <p className="text-xs font-bold text-[#171717]">
          {likeCount.toLocaleString()} likes
        </p>

        {/* Ad Caption Body */}
        <div className="text-xs text-[#171717] space-y-1">
          <p className="leading-relaxed">
            <span className="font-bold mr-1.5">yashsutrastudio</span>
            Elevate your creative presence with high-converting Meta Ad campaigns powered by Indian aesthetic symmetry, computational rendering speed, and precision human art direction.
          </p>
          <p className="text-[11px] text-[#A98B57] font-medium">
            #SutraStudio #SpatialDesign #CreativeTech #MetaAds #BrandGrowth #VedicDesign
          </p>
        </div>
      </div>
    </div>
  );
}
