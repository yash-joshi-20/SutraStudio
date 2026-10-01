"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { RouteGuard } from "@/components/auth/RouteGuard";
import {
  FolderGit2,
  Calendar,
  CheckCircle2,
  Clock,
  HardDrive,
  FileText,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Eye,
  Send,
  ShieldCheck,
} from "lucide-react";

interface ProjectItem {
  id: string;
  title: string;
  service: string;
  progress: number;
  currentMilestone: string;
  dueDate: string;
  status: "progress" | "completed" | "review";
  statusLabel: string;
  milestones: { name: string; completed: boolean; date: string }[];
  documents: { name: string; size: string; type: string }[];
  revisionRound: number;
  maxRevisions: number;
}

export default function ClientProjectsPage() {
  const [filter, setFilter] = useState<"all" | "progress" | "completed">("all");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: "p-1",
      title: "Vedic Living Pavilion — 360° VR Spatial Experience",
      service: "3D Visualization",
      progress: 75,
      currentMilestone: "Lighting Bake & Diffuse Shader Pass Completed",
      dueDate: "Oct 15, 2026",
      status: "progress",
      statusLabel: "In Production",
      revisionRound: 1,
      maxRevisions: 2,
      milestones: [
        { name: "Creative Moodboard & Spatial Geometry", completed: true, date: "Sep 20, 2026" },
        { name: "High-Poly Architectural Meshing", completed: true, date: "Sep 26, 2026" },
        { name: "Lighting & Texture Shader Pass", completed: true, date: "Oct 01, 2026" },
        { name: "4K Master Render & Drive Sync", completed: false, date: "Pending" },
      ],
      documents: [
        { name: "Vedic_Pavilion_SOW_Agreement.pdf", size: "1.2 MB", type: "Contract" },
        { name: "Architectural_Spatial_Brief_V1.pdf", size: "3.4 MB", type: "Creative Brief" },
        { name: "Commercial_License_Certificate.pdf", size: "850 KB", type: "License" },
      ],
    },
    {
      id: "p-2",
      title: "Commercial Perfume Visuals — 4K Render Pack",
      service: "Image Creation",
      progress: 100,
      currentMilestone: "Final Retouched Master Files Delivered to Google Drive",
      dueDate: "Delivered",
      status: "completed",
      statusLabel: "Completed & Archived",
      revisionRound: 2,
      maxRevisions: 2,
      milestones: [
        { name: "Bottle 3D Silhouette & Glass Refraction", completed: true, date: "Sep 12, 2026" },
        { name: "Liquid Simulation & Caustics", completed: true, date: "Sep 16, 2026" },
        { name: "Art Director Color Grading Pass", completed: true, date: "Sep 20, 2026" },
        { name: "Google Drive Master Archive", completed: true, date: "Sep 24, 2026" },
      ],
      documents: [
        { name: "Perfume_Render_Agreement.pdf", size: "1.1 MB", type: "Contract" },
        { name: "Final_Delivery_Manifest.pdf", size: "540 KB", type: "Delivery Sign-off" },
      ],
    },
  ]);

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((p) => p.status === filter);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionFeedback) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setRevisionFeedback("");
      setSelectedProject(null);
    }, 1400);
  };

  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <PortalSidebar />

        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-6xl pb-24 md:pb-12 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EADFCB] gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-semibold uppercase tracking-wider text-[#5C3A1E] mb-2">
                <span>PORTAL WORKSPACE</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
                My Projects & Milestones
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Track creative stages, inspect contractual documents, and review milestones in real-time.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="inline-flex rounded-full bg-[#FFFDF9] border border-[#EADFCB] p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  filter === "all"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                All Projects ({projects.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("progress")}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  filter === "progress"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                In Progress (1)
              </button>
              <button
                type="button"
                onClick={() => setFilter("completed")}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  filter === "completed"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Completed (1)
              </button>
            </div>
          </div>

          {/* Project Cards List */}
          <div className="space-y-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6 hover:border-[#D4A35A]/70 transition-all"
              >
                {/* Top Details Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-[#5C3A1E]">
                        {project.service}
                      </span>
                      <Badge variant={project.status === "completed" ? "completed" : "progress"}>
                        {project.statusLabel}
                      </Badge>
                      <span className="text-[11px] text-[#64748B] bg-[#F8F5EF] px-2 py-0.5 rounded-full border border-[#EADFCB]">
                        Round {project.revisionRound} of {project.maxRevisions} Revisions
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#0F172A]">
                      {project.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <Calendar className="w-4 h-4 text-[#5C3A1E]" />
                      <span>Target: {project.dueDate}</span>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedProject(project)}
                    >
                      Project Details
                    </Button>
                  </div>
                </div>

                {/* Progress Metric Bar */}
                <div className="space-y-2 bg-[#FAF9F5] p-4 rounded-2xl border border-[#EADFCB]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#64748B]">
                      Current Milestone: <strong className="text-[#0F172A]">{project.currentMilestone}</strong>
                    </span>
                    <span className="font-mono font-bold text-[#5C3A1E] text-sm">
                      {project.progress}% Complete
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#EADFCB]/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#D4A35A] to-[#5C3A1E] transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* 4-Phase Milestone Stepper */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  {project.milestones.map((ms, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        ms.completed
                          ? "bg-[#FDFBF7] border-[#D4A35A]/50 text-[#0F172A]"
                          : "bg-[#FFFFFF] border-[#EADFCB]/60 text-[#94A3B8]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-[10px] text-[#A98B57]">
                          PHASE 0{idx + 1}
                        </span>
                        {ms.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F]" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                        )}
                      </div>
                      <p className="font-medium truncate">{ms.name}</p>
                      <span className="text-[10px] text-[#94A3B8] block">{ms.date}</span>
                    </div>
                  ))}
                </div>

                {/* Documents & Contracts Preview */}
                <div className="pt-2 border-t border-[#EADFCB]/60 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-[#64748B]">Project Docs:</span>
                    {project.documents.map((doc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A]"
                      >
                        <FileText className="w-3 h-3 text-[#5C3A1E]" />
                        <span>{doc.name}</span>
                        <span className="text-[10px] text-[#94A3B8]">({doc.size})</span>
                      </span>
                    ))}
                  </div>

                  <Link href="/media">
                    <span className="text-xs font-semibold text-[#5C3A1E] hover:underline inline-flex items-center gap-1">
                      <span>View in Google Drive</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>

        <MobileBottomNav />

        {/* Project Detailed Drawer / Modal */}
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject?.title || "Project Specification"}
          description={`${selectedProject?.service} • Target Completion: ${selectedProject?.dueDate}`}
          maxWidth="lg"
        >
          {selectedProject && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] space-y-2">
                <span className="text-xs font-semibold text-[#64748B]">Production Summary</span>
                <p className="text-xs text-[#0F172A] leading-relaxed">
                  Project initialized under isolated generative review pipeline. Raw render outputs and assets synchronize directly to your client Google Drive vault.
                </p>
              </div>

              {/* Revision Request Section */}
              <div className="space-y-3 pt-2">
                <h4 className="font-serif text-sm font-semibold text-[#0F172A]">
                  Submit Milestone Feedback or Revision
                </h4>
                {feedbackSent ? (
                  <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] text-xs text-[#166534] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span>Feedback dispatched to Art Director Raghavan Sharma!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFeedback} className="space-y-3">
                    <textarea
                      rows={3}
                      placeholder="Enter specific notes on lighting, geometry adjustments, or asset delivery..."
                      value={revisionFeedback}
                      onChange={(e) => setRevisionFeedback(e.target.value)}
                      className="w-full p-3 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A] focus:ring-2 focus:ring-[#D4A35A]/20"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProject(null)}
                      >
                        Close
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        leftIcon={<Send className="w-3.5 h-3.5" />}
                      >
                        Submit Feedback
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </RouteGuard>
  );
}
