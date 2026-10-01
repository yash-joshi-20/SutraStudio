"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ServiceItem } from "@/data/servicesData";
import {
  Image as ImageIcon,
  Video,
  Box,
  Compass,
  ArrowUpRight,
  Play,
  Clock,
  Layers,
} from "lucide-react";

export function ServiceCard({ service }: { service: ServiceItem }) {
  return (
    <Link
      href={`/orders?service=${service.slug}`}
      className="group relative flex flex-col justify-between rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#D4A35A] hover:shadow-warm-hover"
    >
      <div>
        {/* Visual Media Presentation Banner */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F4EFE6]">
          <Image
            src={service.thumbnail}
            alt={service.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />

          {/* Media Presentation Badges Overlay */}
          <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 flex-wrap">
            <span className="rounded-full bg-[#171717]/85 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white border border-white/10 uppercase tracking-wider">
              {service.category}
            </span>

            {service.mediaType === "video" && (
              <span className="rounded-full bg-[#D4A35A] px-2 py-0.5 text-[10px] font-bold text-[#0F172A] flex items-center gap-1 shadow-sm">
                <Play className="w-2.5 h-2.5 fill-current" />
                Reel
              </span>
            )}

            {service.mediaType === "360" && (
              <span className="rounded-full bg-[#D4A35A] px-2 py-0.5 text-[10px] font-bold text-[#0F172A] flex items-center gap-1 shadow-sm">
                <Compass className="w-2.5 h-2.5" />
                360° VR
              </span>
            )}

            {service.mediaType === "3d" && (
              <span className="rounded-full bg-[#D4A35A] px-2 py-0.5 text-[10px] font-bold text-[#0F172A] flex items-center gap-1 shadow-sm">
                <Box className="w-2.5 h-2.5" />
                3D GLTF
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
            <span className="rounded-full bg-white/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono font-medium text-[#5C3A1E] border border-[#EADFCB] shadow-xs flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-[#A98B57]" />
              {service.turnaround.split(" ")[0]}
            </span>
          </div>

          {/* Subtle Bottom Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Bottom Banner Strip */}
          <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-[11px] font-mono text-white/90 z-10">
            <span className="truncate max-w-[180px] drop-shadow-sm text-[10px] text-[#F8F5EF]/90">
              {service.pipelineEngine.split("+")[0].trim()}
            </span>
            <span className="text-[10px] text-[#D4A35A] font-semibold drop-shadow-sm">
              {service.badge}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-semibold text-[#0F172A] group-hover:text-[#5C3A1E] transition-colors leading-snug">
              {service.name}
            </h3>
          </div>

          <p className="text-xs font-semibold text-[#A98B57] tracking-wide">
            {service.tagline}
          </p>

          <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
            {service.description}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 pb-5 pt-3 border-t border-[#EADFCB]/60 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#94A3B8] uppercase block tracking-wider font-mono">
            Starting from
          </span>
          <span className="font-serif text-base font-bold text-[#5C3A1E]">
            {service.startingPrice}
          </span>
        </div>

        <div className="w-8 h-8 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center transition-all group-hover:bg-[#5C3A1E] group-hover:border-[#5C3A1E] group-hover:text-white shadow-xs">
          <ArrowUpRight className="w-4 h-4 text-[#5C3A1E] group-hover:text-white transition-colors" />
        </div>
      </div>
    </Link>
  );
}
