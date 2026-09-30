"use client";

import React from "react";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Badge } from "@/components/ui/Card";
import { FolderGit2, Calendar, CheckCircle } from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function ClientProjectsPage() {
  const activeProjects = [
    {
      id: "p-1",
      title: "Vedic Living Pavilion — 360° VR Experience",
      service: "360 View / 3D Modeling",
      progress: 75,
      milestone: "Lighting & Texture Bake Completed",
      dueDate: "Oct 15, 2026",
      status: "progress",
      statusLabel: "In Progress",
    },
    {
      id: "p-2",
      title: "Commercial Perfume Visuals — 4K Render Pack",
      service: "Image Creation",
      progress: 100,
      milestone: "Final Retouched Master Files Delivered",
      dueDate: "Delivered",
      status: "completed",
      statusLabel: "Completed",
    },
  ];

  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A]">
      <PortalSidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-5xl pb-24 md:pb-10 space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
            PORTAL WORKSPACE
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#0F172A] mt-1">
            My Projects
          </h1>
          <p className="text-xs text-[#64748B]">
            Track delivery milestones, review creative drafts, and approve final assets.
          </p>
        </div>

        <div className="space-y-4">
          {activeProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#5C3A1E]">
                      {project.service}
                    </span>
                    <Badge variant={project.status === "completed" ? "completed" : "progress"}>
                      {project.statusLabel}
                    </Badge>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                    {project.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <Calendar className="w-4 h-4 text-[#5C3A1E]" />
                  <span>Target: {project.dueDate}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#64748B]">
                  <span>Current Milestone: {project.milestone}</span>
                  <span className="font-bold text-[#0F172A]">{project.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F4EFE6] overflow-hidden">
                  <div
                    className="h-full bg-[#5C3A1E] rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

        <MobileBottomNav />
      </div>
    </RouteGuard>
  );
}
