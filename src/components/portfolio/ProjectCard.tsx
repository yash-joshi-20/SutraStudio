"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ProjectItem } from "@/data/projectsData";
import { Play, Compass, ArrowUpRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ProjectCard({ project }: { project: ProjectItem }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] transition-all duration-300 hover:border-[#D4A35A] hover:shadow-warm-hover"
      >
        {/* Aspect Ratio Container (4:5) */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F4EFE6]">
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="rounded-full bg-[#171717]/80 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-white border border-white/10">
              {project.category}
            </span>
            {project.badge === "360°" && (
              <span className="rounded-full bg-[#D4A35A] px-2.5 py-1 text-[11px] font-bold text-[#0F172A] flex items-center gap-1 shadow-sm">
                <Compass className="w-3 h-3" />
                360°
              </span>
            )}
            {project.badge === "Video" && (
              <span className="w-7 h-7 rounded-full bg-white/90 text-[#0F172A] flex items-center justify-center shadow-md">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </span>
            )}
          </div>

          {/* Bottom Gradient and Info */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/85 via-[#0F172A]/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

          <div className="absolute bottom-0 inset-x-0 p-5 text-white z-10">
            <p className="text-[11px] uppercase tracking-wider text-[#D4A35A] font-semibold">
              {project.client} • {project.year}
            </p>
            <h4 className="font-serif text-lg font-semibold mt-1 tracking-wide leading-snug group-hover:text-[#F8F5EF] transition-colors">
              {project.title}
            </h4>
          </div>
        </div>
      </div>

      {/* Project Detail Modal (Framer Motion) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-2xl p-6 sm:p-8"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-[#F8F5EF] text-[#0F172A] hover:bg-[#EADFCB] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-6 bg-[#F4EFE6]">
                <Image
                  src={project.thumbnail}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#5C3A1E] text-white text-xs px-3 py-1 font-medium">
                    {project.category}
                  </span>
                  <span className="text-xs text-[#64748B]">
                    Client: {project.client} ({project.year})
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                  {project.title}
                </h3>

                <p className="text-sm text-[#475569] leading-relaxed">
                  {project.description}
                </p>

                <div className="pt-4 border-t border-[#EADFCB] flex items-center justify-between">
                  <span className="text-xs text-[#64748B]">
                    Engineered with Sutra Creative Workflow
                  </span>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-xs font-semibold text-[#5C3A1E] hover:underline"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
