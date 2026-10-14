"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Image as ImageIcon,
  Video,
  Box,
  Compass,
  Layout,
  TrendingUp,
  Globe,
  Smartphone,
  Layers,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import type { MainService, MainServiceIconKey } from "@/config/mainServices";

/**
 * Icon renderer for the eight main services — shared between cards and chat.
 */
export const MAIN_SERVICE_ICONS: Record<MainServiceIconKey, LucideIcon> = {
  image: ImageIcon,
  video: Video,
  box: Box,
  compass: Compass,
  layout: Layout,
  trendingUp: TrendingUp,
  globe: Globe,
  smartphone: Smartphone,
};

/**
 * Price-free card for the eight main studio services.
 * Shows an image/icon, title, concise description and a "View Service"
 * button navigating to the existing `/services/[slug]` detail route.
 * No prices, monthly rates, or package amounts are ever displayed.
 */
export function MainServiceCard({ service }: { service: MainService }) {
  const Icon = MAIN_SERVICE_ICONS[service.icon] ?? Layers;

  return (
    <article
      id={service.slug}
      className="group interactive-card relative flex flex-col justify-between rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] overflow-hidden transition-all duration-300 hover:border-[#D4A35A] hover:shadow-warm-hover"
    >
      <div>
        {/* Visual media banner linking to the service detail page */}
        <Link
          href={service.detailHref}
          aria-label={`View ${service.title} service details`}
          className="block relative aspect-[16/10] w-full overflow-hidden bg-[#F4EFE6]"
        >
          {service.thumbnail ? (
            <Image
              src={service.thumbnail}
              alt={`${service.title} — studio sample work`}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className="w-14 h-14 text-[#A98B57]" aria-hidden="true" />
            </div>
          )}

          {/* Icon chip overlay */}
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#171717]/85 backdrop-blur-md border border-white/10 shadow-xs">
              <Icon className="w-4.5 h-4.5 text-[#D4A35A]" aria-hidden="true" />
            </span>
          </div>

          {/* Turnaround badge (no pricing information) */}
          {service.turnaround && (
            <div className="absolute top-3.5 right-3.5 z-10">
              <span className="rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-mono font-medium text-[#5C3A1E] border border-[#EADFCB] shadow-xs flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 text-[#A98B57]" aria-hidden="true" />
                {service.turnaround.split(" ")[0]}
              </span>
            </div>
          )}

          {/* Subtle bottom gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Category strip */}
          <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-[10px] z-10">
            <span className="rounded-full bg-[#171717]/80 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-semibold text-white border border-white/10 uppercase tracking-wider">
              {service.category}
            </span>
            <span className="text-[#D4A35A] font-semibold drop-shadow-sm shrink-0 whitespace-nowrap">
              Studio Crafted
            </span>
          </div>
        </Link>

        {/* Card body */}
        <div className="p-5 space-y-2.5">
          <h3 className="font-serif text-lg font-semibold text-[#0F172A] leading-snug">
            <Link
              href={service.detailHref}
              className="hover:text-[#5C3A1E] transition-colors"
            >
              {service.title}
            </Link>
          </h3>

          <p className="text-xs text-[#64748B] leading-relaxed">
            {service.shortDescription}
          </p>

          {/* Concrete examples */}
          {service.examples.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 pt-1" aria-label={`${service.title} examples`}>
              {service.examples.slice(0, 3).map((example) => (
                <li
                  key={example}
                  className="inline-flex items-center gap-1 rounded-full bg-[#F8F5EF] border border-[#EADFCB] px-2 py-0.5 text-[10px] font-medium text-[#5C3A1E]"
                >
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#2E7D4F]" aria-hidden="true" />
                  {example}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Card footer with explicit detail navigation */}
      <div className="px-5 pb-5 pt-4 border-t border-[#EADFCB]/60 flex items-center justify-between min-h-[52px] gap-2">
        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-mono truncate">
          {service.category} Discipline
        </span>
        <Link
          href={service.detailHref}
          title={`View ${service.title}`}
          aria-label={`View Service: ${service.title}`}
          className="inline-flex items-center justify-center whitespace-nowrap min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#5C3A1E] text-white hover:bg-[#4A2E17] text-xs font-semibold gap-1 transition-all shadow-xs cursor-pointer shrink-0"
        >
          <span>View Service</span>
          <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
