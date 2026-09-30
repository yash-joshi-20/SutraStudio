"use client";

import React from "react";
import Link from "next/link";
import { ServiceItem } from "@/data/servicesData";
import {
  Image as ImageIcon,
  Video,
  Box,
  Compass,
  Home,
  Grid,
  TrendingUp,
  Share2,
  Globe,
  Layout,
  Smartphone,
  Cpu,
  ArrowUpRight,
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  Image: <ImageIcon className="w-6 h-6 text-[#5C3A1E]" />,
  Video: <Video className="w-6 h-6 text-[#5C3A1E]" />,
  Box: <Box className="w-6 h-6 text-[#5C3A1E]" />,
  Compass: <Compass className="w-6 h-6 text-[#5C3A1E]" />,
  Home: <Home className="w-6 h-6 text-[#5C3A1E]" />,
  Grid: <Grid className="w-6 h-6 text-[#5C3A1E]" />,
  TrendingUp: <TrendingUp className="w-6 h-6 text-[#5C3A1E]" />,
  Share2: <Share2 className="w-6 h-6 text-[#5C3A1E]" />,
  Globe: <Globe className="w-6 h-6 text-[#5C3A1E]" />,
  Layout: <Layout className="w-6 h-6 text-[#5C3A1E]" />,
  Smartphone: <Smartphone className="w-6 h-6 text-[#5C3A1E]" />,
  Cpu: <Cpu className="w-6 h-6 text-[#5C3A1E]" />,
};

export function ServiceCard({ service }: { service: ServiceItem }) {
  const icon = ICON_MAP[service.icon] || <Cpu className="w-6 h-6 text-[#5C3A1E]" />;

  return (
    <Link
      href={`/orders?service=${service.slug}`}
      className="group relative flex flex-col justify-between rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#D4A35A] hover:shadow-warm-hover"
    >
      <div>
        {/* Icon Pill */}
        <div className="w-12 h-12 rounded-xl bg-[#F8F5EF] border border-[#EADFCB]/60 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105 group-hover:bg-[#F4EFE6]">
          {icon}
        </div>

        {/* Title & Tagline */}
        <h3 className="font-serif text-lg font-semibold text-[#0F172A] tracking-wide group-hover:text-[#5C3A1E] transition-colors">
          {service.name}
        </h3>
        <p className="text-xs font-medium text-[#64748B] mt-1 mb-3">
          {service.tagline}
        </p>
        <p className="text-xs text-[#525252] leading-relaxed line-clamp-2">
          {service.description}
        </p>
      </div>

      {/* Footer / CTA Link */}
      <div className="mt-5 pt-4 border-t border-[#EADFCB]/50 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#D4A35A] tracking-wider uppercase">
          From {service.startingPrice}
        </span>
        <div className="w-8 h-8 rounded-full bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center transition-colors group-hover:bg-[#5C3A1E] group-hover:border-[#5C3A1E] group-hover:text-white">
          <ArrowUpRight className="w-4 h-4 text-[#5C3A1E] group-hover:text-white transition-colors" />
        </div>
      </div>
    </Link>
  );
}
