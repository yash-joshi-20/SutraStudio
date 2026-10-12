"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ProjectItem } from "@/data/projectsData";
import { Play, Compass, ArrowUpRight, X, CheckCircle2, Globe, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ProjectCard({ project }: { project: ProjectItem }) {
  const [modalOpen, setModalOpen] = useState(false);

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "Studio Platform":
        return "bg-[#5C3A1E] text-[#D4A35A] border border-[#D4A35A]/40";
      case "Client Project":
        return "bg-[#2E7D4F] text-white";
      case "Personal Portfolio":
        return "bg-[#0284C7] text-white";
      default:
        return "bg-[#A98B57] text-white";
    }
  };

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
          <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 flex-wrap">
            <span className="rounded-full bg-[#171717]/85 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white border border-white/10 uppercase tracking-wider">
              {project.category}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider shadow-xs ${getBadgeStyle(
                project.projectType
              )}`}
            >
              {project.projectType}
            </span>
            {project.badge === "360°" && (
              <span className="rounded-full bg-[#D4A35A] px-2 py-0.5 text-[10px] font-bold text-[#0F172A] flex items-center gap-1 shadow-sm">
                <Compass className="w-2.5 h-2.5" />
                360°
              </span>
            )}
            {project.badge === "Video" && (
              <span className="w-6 h-6 rounded-full bg-white/90 text-[#0F172A] flex items-center justify-center shadow-md">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </span>
            )}
          </div>

          {/* Bottom Gradient and Info */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

          <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-white z-10 space-y-1">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#D4A35A] font-semibold">
              {project.client} • {project.year}
            </p>
            <h4 className="font-serif text-base sm:text-lg font-semibold tracking-wide leading-snug group-hover:text-[#F8F5EF] transition-colors">
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
              className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-2xl p-5 sm:p-8"
            >
              <button
                onClick={() => setModalOpen(false)}
                aria-label="Close project preview"
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-[#F8F5EF] text-[#0F172A] hover:bg-[#EADFCB] transition-colors z-20 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-6 bg-[#F4EFE6] border border-[#EADFCB]">
                <Image
                  src={project.thumbnail}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-[#5C3A1E] text-white text-xs px-3 py-1 font-medium">
                    {project.category}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getBadgeStyle(
                      project.projectType
                    )}`}
                  >
                    {project.projectType}
                  </span>
                  {project.status && (
                    <span className="rounded-full bg-[#F8F5EF] border border-[#EADFCB] text-xs px-2.5 py-1 text-[#64748B] font-mono">
                      {project.status}
                    </span>
                  )}
                  <span className="text-xs text-[#64748B]">
                    {project.client} • {project.year}
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                  {project.title}
                </h3>

                <p className="text-sm text-[#475569] leading-relaxed font-sans">
                  {project.description}
                </p>

                {/* Actual Deliverables List */}
                {project.deliverables && project.deliverables.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A98B57] block">
                      Scope Deliverables:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#0F172A]">
                      {project.deliverables.map((deliv) => (
                        <li key={deliv} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0 mt-0.5" />
                          <span>{deliv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t border-[#EADFCB] flex items-center justify-between gap-3">
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5C3A1E] text-white text-xs font-semibold hover:bg-[#4a2e14] transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#D4A35A]" />
                      <span>Visit Live Website</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-[#64748B] font-mono">
                      Sutra Studio Archive • {project.year}
                    </span>
                  )}

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
