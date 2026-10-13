"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ServiceItem } from "@/data/servicesData";
import {
  Image as ImageIcon,
  Box,
  Compass,
  ArrowUpRight,
  Play,
  Clock,
} from "lucide-react";

export function ServiceCard({ service }: { service: ServiceItem }) {
  const detailHref = `/services#${service.slug}`;
  const orderHref = `/orders?service=${service.slug}`;

  return (
    <div
      id={service.slug}
      className="group interactive-card relative flex flex-col justify-between rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] overflow-hidden transition-all duration-300 hover:border-[#D4A35A] hover:shadow-warm-hover"
    >
      <div>
        {/* Visual Media Presentation Banner linking to detail route */}
        <Link href={detailHref} className="block relative aspect-[16/10] w-full overflow-hidden bg-[#F4EFE6]">
          <Image
            src={service.thumbnail}
            alt={service.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Media Presentation Badges Overlay */}
          <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 flex-wrap">
            <span className="rounded-full bg-[#171717]/85 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white border border-white/10 uppercase tracking-wider">
              {service.category}
            </span>

            {service.mediaType === "video" && (
              <span className="rounded-full bg-[#D4A35A] px-2 py-0.5 text-[10px] font-bold text-[#0F172A] flex items-center gap-1 shadow-xs">
                <Play className="w-2.5 h-2.5 fill-current" />
                Reel
              </span>
            )}

            {service.mediaType === "360" && (
              <span className="rounded-full bg-[#D4A35A] px-2 py-0.5 text-[10px] font-bold text-[#0F172A] flex items-center gap-1 shadow-xs">
                <Compass className="w-2.5 h-2.5" />
                360° VR
              </span>
            )}

            {service.mediaType === "3d" && (
              <span className="rounded-full bg-[#D4A35A] px-2 py-0.5 text-[10px] font-bold text-[#0F172A] flex items-center gap-1 shadow-xs">
                <Box className="w-2.5 h-2.5" />
                3D Asset
              </span>
            )}

            {service.mediaType === "image" && (
              <span className="rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-[#5C3A1E] flex items-center gap-1 shadow-xs border border-[#EADFCB]">
                <ImageIcon className="w-2.5 h-2.5 text-[#5C3A1E]" />
                4K Pass
              </span>
            )}
          </div>

          {/* Turnaround Badge */}
          <div className="absolute top-3.5 right-3.5 z-10">
            <span className="rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-mono font-medium text-[#5C3A1E] border border-[#EADFCB] shadow-xs flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-[#A98B57]" />
              {service.turnaround.split(" ")[0]}
            </span>
          </div>

          {/* Subtle Bottom Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Bottom Banner Strip */}
          <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-[11px] font-mono text-white/90 z-10">
            <span className="truncate max-w-[180px] drop-shadow-sm text-[10px] text-[#F8F5EF]/90 font-sans">
              {service.duration || "Creative Commission"}
            </span>
            <span className="text-[10px] text-[#D4A35A] font-semibold drop-shadow-sm shrink-0 whitespace-nowrap">
              {service.badge}
            </span>
          </div>
        </Link>

        {/* Card Body */}
        <div className="p-5 space-y-2.5">
          <Link href={detailHref} className="block group/link">
            <h3 className="font-serif text-lg font-semibold text-[#0F172A] group-hover/link:text-[#5C3A1E] transition-colors leading-snug">
              {service.name}
            </h3>
          </Link>

          {service.priceDisplay && (
            <div className="p-2 rounded-xl bg-[#FAF9F5] border border-[#D4A35A]/30 text-[11px] font-semibold text-[#8C6D32] leading-tight">
              {service.priceDisplay}
            </div>
          )}

          <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3 min-h-[44px]">
            {service.description}
          </p>
        </div>
      </div>

      {/* Card Footer with explicit detail and order links */}
      <div className="px-5 pb-5 pt-4 border-t border-[#EADFCB]/60 flex items-center justify-between min-h-[52px] gap-2">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-[#94A3B8] uppercase block tracking-wider font-mono">
            {service.isCustomQuote ? "Scope" : "Starting from"}
          </span>
          <span className="font-serif text-base font-bold text-[#5C3A1E] whitespace-nowrap">
            {service.startingPrice}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href={detailHref}
            title={`View ${service.name} Specifications`}
            className="inline-flex items-center justify-center whitespace-nowrap min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[#F8F5EF] text-[#5C3A1E] border border-[#EADFCB] hover:border-[#D4A35A] text-xs font-medium transition-colors"
          >
            Details
          </Link>
          <Link
            href={orderHref}
            title={`Order ${service.name}`}
            className="inline-flex items-center justify-center whitespace-nowrap min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#5C3A1E] text-white hover:bg-[#4A2E17] text-xs font-semibold gap-1 transition-all shadow-xs cursor-pointer"
          >
            <span>{service.isCustomQuote ? "Inquire" : "Order"}</span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
