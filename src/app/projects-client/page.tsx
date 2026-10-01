"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Megaphone,
  Layers,
  Play,
  Check,
  Share2,
  TrendingUp,
} from "lucide-react";

export interface AdSetVariant {
  id: string;
  name: string;
  aspectRatio: "9:16" | "1:1" | "16:9";
  format: string;
  headline: string;
  hook: string;
  state: "draft" | "review" | "approved";
  thumbnail: string;
}

export interface CampaignData {
  platform: string;
  objective: string;
  targetAudience: string;
  budget: string;
  overallState: "draft" | "review" | "approved";
  adSets: AdSetVariant[];
}

export interface ProjectItem {
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
  campaignData?: CampaignData;
}

export default function ClientProjectsPage() {
  const [filter, setFilter] = useState<"all" | "review" | "progress" | "completed">("all");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [campaignActionMsg, setCampaignActionMsg] = useState("");

  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: "p-3",
      title: "Diwali Festive Omni-Channel Meta Ads Campaign",
      service: "Digital Marketing & Meta Ads",
      progress: 70,
      currentMilestone: "Creative Ad Sets Staged for Client Approval",
      dueDate: "Oct 12, 2026",
      status: "review",
      statusLabel: "In Review / Awaiting Approval",
      revisionRound: 1,
      maxRevisions: 3,
      campaignData: {
        platform: "Meta Ads (Instagram Reels & Facebook Feed)",
        objective: "Conversions & High-Intent ROAS (4.8x Target)",
        targetAudience: "Luxury Real Estate & Architectural Connoisseurs (Ages 28–54, Tier 1 Metros)",
        budget: "₹2,50,000 / month",
        overallState: "review",
        adSets: [
          {
            id: "ad-1",
            name: "Ad Set 01: High-Impact Video Hook",
            aspectRatio: "9:16",
            format: "Vertical Video Reel (15s)",
            headline: "Elevate Your Living Sanctuary with Sacred Indian Proportions",
            hook: "Architectural craftsmanship meets modern digital luxury. Explore our heritage spaces.",
            state: "review",
            thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
          },
          {
            id: "ad-2",
            name: "Ad Set 02: Multi-Room Staging Carousel",
            aspectRatio: "1:1",
            format: "Square Carousel (5 Cards)",
            headline: "Timeless Interiors Crafted for Modern Heirs",
            hook: "Swipe through our handcrafted sandstone & teakwood master suites.",
            state: "review",
            thumbnail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
          },
          {
            id: "ad-3",
            name: "Ad Set 03: 360 VR Interactive Retargeting",
            aspectRatio: "16:9",
            format: "Landscape Dynamic Display",
            headline: "Take an Interactive 360° Walkthrough of Your Next Villa",
            hook: "Experience the architectural flow live in immersive virtual reality.",
            state: "draft",
            thumbnail: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80",
          },
        ],
      },
      milestones: [
        { name: "Audience Persona Blueprint & Pixel Calibration", completed: true, date: "Sep 28, 2026" },
        { name: "Ad Copywriting Angles & Headline Testing Matrix", completed: true, date: "Sep 30, 2026" },
        { name: "Creative Ad Sets Staging (9:16, 1:1, 16:9)", completed: true, date: "Oct 01, 2026" },
        { name: "Client Creative Sign-off & Live Meta Dispatch", completed: false, date: "Pending Approval" },
      ],
      documents: [
        { name: "Meta_Campaign_Targeting_Blueprint.pdf", size: "2.1 MB", type: "Strategy Deck" },
        { name: "Ad_Copy_Matrix_V1.pdf", size: "680 KB", type: "Copywriting" },
        { name: "Ad_Set_Assets_Pack.zip", size: "48 MB", type: "Creative Suite" },
      ],
    },
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

  const handleUpdateAdSetState = (
    projectId: string,
    adSetId: string,
    newState: "draft" | "review" | "approved"
  ) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId || !p.campaignData) return p;
        const updatedAdSets = p.campaignData.adSets.map((ad) =>
          ad.id === adSetId ? { ...ad, state: newState } : ad
        );
        const allApproved = updatedAdSets.every((ad) => ad.state === "approved");
        return {
          ...p,
          status: allApproved ? "completed" : "review",
          statusLabel: allApproved
            ? "Campaign Approved & Live"
            : "In Review / Awaiting Approval",
          campaignData: {
            ...p.campaignData,
            overallState: allApproved ? "approved" : "review",
            adSets: updatedAdSets,
          },
        };
      })
    );
    setCampaignActionMsg(
      `Ad Set state updated to "${newState.toUpperCase()}". Syncing to campaign brief.`
    );
    setTimeout(() => setCampaignActionMsg(""), 3000);
  };

  const handleApproveAllAdSets = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId || !p.campaignData) return p;
        const approvedSets = p.campaignData.adSets.map((ad) => ({
          ...ad,
          state: "approved" as const,
        }));
        return {
          ...p,
          progress: 100,
          status: "completed",
          statusLabel: "Campaign Approved & Live",
          currentMilestone: "All Ad Sets Approved — Campaign Dispatched to Meta Ads",
          campaignData: {
            ...p.campaignData,
            overallState: "approved",
            adSets: approvedSets,
          },
        };
      })
    );
    setCampaignActionMsg(
      "All 3 Meta Ad Sets approved! Dispatched to client Google Drive campaign vault."
    );
    setTimeout(() => setCampaignActionMsg(""), 4000);
  };

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

        <main id="main-content" className="flex-1 p-6 sm:p-8 lg:p-10 max-w-6xl pb-24 md:pb-12 space-y-8">
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
                Track creative stages, inspect digital marketing campaigns, and review milestones in real-time.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="inline-flex rounded-full bg-[#FFFDF9] border border-[#EADFCB] p-1 shadow-xs flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  filter === "all"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                All ({projects.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("review")}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                  filter === "review"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <span>Awaiting Review</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A35A]" />
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
                In Progress
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
                Completed
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {campaignActionMsg && (
            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] flex items-center justify-between text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span className="font-medium">{campaignActionMsg}</span>
              </div>
              <span className="text-[10px] font-mono text-[#15803D]">Google Drive Synced</span>
            </div>
          )}

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
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-bold text-[#5C3A1E]">
                        {project.service}
                      </span>
                      <Badge
                        variant={
                          project.status === "completed"
                            ? "completed"
                            : project.status === "review"
                            ? "gold"
                            : "progress"
                        }
                      >
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

                {/* ========================================================
                    META ADS CAMPAIGN UI & CREATIVE REVIEW MATRIX
                    ======================================================== */}
                {project.campaignData && (
                  <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADFCB]/60 pb-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-center">
                          <Megaphone className="w-4 h-4 text-[#5C3A1E]" />
                        </div>
                        <div>
                          <h4 className="font-serif font-semibold text-sm text-[#0F172A]">
                            Meta Ads Campaign & Creative Review Matrix
                          </h4>
                          <span className="text-[11px] text-[#64748B] block font-mono">
                            {project.campaignData.platform} • Budget: {project.campaignData.budget}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-[#64748B]">
                          Audience: {project.campaignData.targetAudience.split("(")[0]}
                        </span>
                        {project.campaignData.overallState !== "approved" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApproveAllAdSets(project.id)}
                            leftIcon={<Check className="w-3.5 h-3.5" />}
                          >
                            Approve All Sets
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 3 Creative Variant Cards with Draft / Review / Approval States */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {project.campaignData.adSets.map((adSet) => (
                        <div
                          key={adSet.id}
                          className="rounded-xl bg-[#FAF9F5] border border-[#EADFCB] p-3.5 flex flex-col justify-between space-y-3 hover:border-[#D4A35A] transition-all"
                        >
                          <div className="space-y-2">
                            {/* Preview Thumbnail */}
                            <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-[#F4EFE6] border border-[#EADFCB]/60">
                              <Image
                                src={adSet.thumbnail}
                                alt={adSet.name}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                                <span className="bg-[#0F172A]/85 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
                                  {adSet.aspectRatio}
                                </span>
                              </div>

                              <div className="absolute top-2 right-2 z-10">
                                {adSet.state === "draft" && (
                                  <span className="bg-[#FAF9F5] text-[#64748B] border border-[#EADFCB] px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                                    Draft
                                  </span>
                                )}
                                {adSet.state === "review" && (
                                  <span className="bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-2 py-0.5 rounded text-[10px] font-semibold uppercase flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
                                    In Review
                                  </span>
                                )}
                                {adSet.state === "approved" && (
                                  <span className="bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] px-2 py-0.5 rounded text-[10px] font-semibold uppercase flex items-center gap-1">
                                    <Check className="w-3 h-3 text-[#16A34A]" />
                                    Approved
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] font-mono text-[#D4A35A] uppercase tracking-wider block">
                                {adSet.format}
                              </span>
                              <h5 className="font-serif font-semibold text-xs text-[#0F172A] leading-snug line-clamp-1">
                                {adSet.headline}
                              </h5>
                              <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                                {adSet.hook}
                              </p>
                            </div>
                          </div>

                          {/* State Control Action Bar */}
                          <div className="pt-2 border-t border-[#EADFCB]/60 flex items-center justify-between gap-1 text-[11px]">
                            <span className="text-[#94A3B8] font-mono text-[10px]">State:</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateAdSetState(project.id, adSet.id, "draft")}
                                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                  adSet.state === "draft"
                                    ? "bg-[#64748B] text-white"
                                    : "bg-white text-[#64748B] border border-[#EADFCB] hover:text-[#0F172A]"
                                }`}
                              >
                                Draft
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateAdSetState(project.id, adSet.id, "review")}
                                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                  adSet.state === "review"
                                    ? "bg-[#D97706] text-white"
                                    : "bg-white text-[#64748B] border border-[#EADFCB] hover:text-[#0F172A]"
                                }`}
                              >
                                Review
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateAdSetState(project.id, adSet.id, "approved")}
                                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                  adSet.state === "approved"
                                    ? "bg-[#16A34A] text-white"
                                    : "bg-white text-[#64748B] border border-[#EADFCB] hover:text-[#0F172A]"
                                }`}
                              >
                                Approve
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                  Project initialized under isolated generative review pipeline. Raw render outputs, Meta ad sets, and contractual deliverables synchronize directly to your client Google Drive vault.
                </p>
              </div>

              {selectedProject.campaignData && (
                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] space-y-3">
                  <h4 className="font-serif text-sm font-semibold text-[#0F172A]">
                    Campaign Strategy Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#94A3B8] block text-[10px] uppercase font-mono">Platform</span>
                      <span className="font-medium text-[#0F172A]">{selectedProject.campaignData.platform}</span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block text-[10px] uppercase font-mono">Objective</span>
                      <span className="font-medium text-[#0F172A]">{selectedProject.campaignData.objective}</span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block text-[10px] uppercase font-mono">Target Audience</span>
                      <span className="font-medium text-[#0F172A]">{selectedProject.campaignData.targetAudience}</span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block text-[10px] uppercase font-mono">Monthly Budget</span>
                      <span className="font-serif font-bold text-[#5C3A1E]">{selectedProject.campaignData.budget}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Revision Request Section */}
              <div className="space-y-3 pt-2">
                <h4 className="font-serif text-sm font-semibold text-[#0F172A]">
                  Submit Milestone Feedback or Ad Copy Revision
                </h4>
                {feedbackSent ? (
                  <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] text-xs text-[#166534] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span>Feedback dispatched to Campaign Director & Lead Copywriter!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFeedback} className="space-y-3">
                    <textarea
                      rows={3}
                      placeholder="Enter specific notes on ad hooks, audience targeting adjustment, or creative styling..."
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
