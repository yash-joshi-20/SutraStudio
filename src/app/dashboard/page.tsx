"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { KPITile } from "@/components/dashboard/KPITile";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/authContext";
import {
  Plus,
  ArrowRight,
  Eye,
  Sparkles,
  HardDrive,
  Bot,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  FolderOpen,
  Send,
  SlidersHorizontal,
  Compass,
  Layers,
  Box,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientDashboardPage() {
  const { user } = useAuth();
  // By default, show the zero-state for new client demonstration, with instant toggle to active orders
  const [isZeroState, setIsZeroState] = useState(true);

  const mockOrders = [
    {
      id: "ord-1",
      code: "#ORD-001",
      title: "3D Spatial Architecture — Luxury Living Suite",
      service: "3D Visualization",
      status: "progress",
      statusLabel: "In Progress",
      deliverable: "Draft 4K renders ready for review in Google Drive",
      updatedAt: "2 hours ago",
      progress: 65,
    },
    {
      id: "ord-2",
      code: "#ORD-003",
      title: "Promotional Brand Film — 15s Showreel",
      service: "Video Production",
      status: "completed",
      statusLabel: "Delivered",
      deliverable: "Final ProRes 422 master uploaded to Drive vault",
      updatedAt: "Yesterday",
      progress: 100,
    },
    {
      id: "ord-3",
      code: "#ORD-005",
      title: "Enterprise Web Platform — Next.js Turbopack",
      service: "Web Development",
      status: "review",
      statusLabel: "In Review",
      deliverable: "Staging deployment preview ready for client sign-off",
      updatedAt: "3 days ago",
      progress: 88,
    },
    {
      id: "ord-4",
      code: "#ORD-004",
      title: "Diwali Festive Omni-Channel Meta Ads Campaign",
      service: "Digital Marketing",
      status: "review",
      statusLabel: "In Review (Awaiting Client Approval)",
      deliverable: "3 Multi-Ratio Ad Sets (9:16 Video, 1:1 Feed, 16:9 Banner) ready for client review",
      updatedAt: "Just now",
      progress: 70,
    },
  ];

  const quickStartServices = [
    {
      title: "Spatial & 3D Architecture",
      category: "Creative",
      desc: "Photorealistic spatial renders, material moodboards, and interior lighting passes.",
      price: "₹3,500",
      slug: "3d-visualization",
      icon: Box,
    },
    {
      title: "Brand Identity & Styleguide",
      category: "Design",
      desc: "Comprehensive Sanskrit-inspired identity, typography guidelines, and vector suites.",
      price: "₹4,800",
      slug: "brand-identity",
      icon: Compass,
    },
    {
      title: "Next.js Web Application",
      category: "Development",
      desc: "Bespoke high-performance digital flagship with automated studio review pipelines.",
      price: "₹19,999",
      slug: "web-development",
      icon: Layers,
    },
  ];

  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <PortalSidebar />

        <main id="main-content" className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto pb-24 md:pb-12">
          {/* =========================================================
              TOP HEADER BAR WITH MODE SWITCHER
              ========================================================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-[#EADFCB] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
                  STUDIO CLIENT WORKSPACE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EADFCB]/60 text-[#5C3A1E] font-medium">
                  Vault ID: {user?.driveFolderId || "drive_fld_sutra_001"}
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A] mt-1">
                Welcome, {user?.displayName || "Studio Client"}
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                {isZeroState
                  ? "Your private studio sanctum is ready. Follow the onboarding roadmap below to commission your first deliverable."
                  : "Here is your active studio production stream, real-time pipelines, and Google Drive vault status."}
              </p>
            </div>

            {/* Actions & Simulation Switcher */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Evaluator toggle pill */}
              <div className="inline-flex rounded-full bg-[#FFFDF9] border border-[#EADFCB] p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsZeroState(true)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
                    isZeroState
                      ? "bg-[#5C3A1E] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  New Client (Zero-State)
                </button>
                <button
                  type="button"
                  onClick={() => setIsZeroState(false)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
                    !isZeroState
                      ? "bg-[#5C3A1E] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  Active Orders (4)
                </button>
              </div>

              <Link href="/orders">
                <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  New Commission
                </Button>
              </Link>
            </div>
          </div>

          {/* =========================================================
              KPI TILES / SYSTEM STATUS
              ========================================================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 my-8">
            <KPITile
              label="Active Orders"
              value={isZeroState ? 0 : 2}
              sublabel={isZeroState ? "No active orders yet" : "In production pipelines"}
              variant="progress"
            />
            <KPITile
              label="Completed"
              value={isZeroState ? 0 : 1}
              sublabel={isZeroState ? "0 deliverables" : "Delivered to Drive vault"}
              variant="completed"
            />
            <KPITile
              label="Vault Storage"
              value={isZeroState ? "0 MB" : "4.8 GB"}
              sublabel="Encrypted Google Drive"
              variant="ink"
            />
            <KPITile
              label="Balance Due"
              value="₹0"
              sublabel="Account in good standing"
              variant="pending"
            />
          </div>

          {/* =========================================================
              CONDITIONAL VIEW: ZERO-STATE vs ACTIVE PRODUCTION
              ========================================================= */}
          <AnimatePresence mode="wait">
            {isZeroState ? (
              /* =========================================================
                 ZERO-STATE VIEW (NEW CLIENT ONBOARDING EXPERIENCE)
                 ========================================================= */
              <motion.div
                key="zero-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                {/* 1. Hero Onboarding Welcome Card */}
                <div className="relative rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-8 sm:p-10 shadow-warm overflow-hidden">
                  <div className="absolute -top-12 -right-12 opacity-5 pointer-events-none">
                    <LotusSymbol className="w-80 h-80" color="gold" />
                  </div>

                  <div className="max-w-2xl space-y-4 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-semibold tracking-wider text-[#5C3A1E] uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                      <span>WORKSPACE INITIALIZATION COMPLETE</span>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
                      Your Studio Sanctum is Live & Connected.
                    </h2>

                    <p className="text-sm text-[#64748B] leading-relaxed">
                      Sutra Studio operates as your autonomous creative technology wing.
                      Your private Google Drive vault has been created, your dedicated art director
                      has been assigned, and your generative review pipelines are ready to activate.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-4">
                      <Link href="/orders">
                        <Button variant="primary" size="md" withArrow>
                          Commission Your First Project
                        </Button>
                      </Link>
                      <Link href="/chat">
                        <Button
                          variant="secondary"
                          size="md"
                          leftIcon={<Bot className="w-4 h-4 text-[#D4A35A]" />}
                        >
                          Consult Studio AI Assistant
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 2. Onboarding 3-Step Guided Roadmap */}
                <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                        Client Onboarding Sequence
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        3 foundational steps to launching your first creative deliverable.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#A98B57] bg-[#FAF9F5] px-3 py-1 rounded-full border border-[#EADFCB]">
                      Step 1 of 3 Complete
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Step 1: Vault Activation */}
                    <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-3 relative">
                      <div className="w-8 h-8 rounded-full bg-[#2E7D4F]/10 border border-[#2E7D4F]/30 text-[#2E7D4F] flex items-center justify-center text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                        1. Google Drive Vault
                      </h4>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        Dedicated cloud directory synchronized. All RAW 3D files, renders, and contracts will auto-archive here.
                      </p>
                      <div className="pt-2">
                        <Badge variant="completed" size="sm">
                          Active & Synced
                        </Badge>
                      </div>
                    </div>

                    {/* Step 2: Commission First Service */}
                    <div className="p-5 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4A35A] space-y-3 relative shadow-xs">
                      <div className="w-8 h-8 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                        2. Launch Commission
                      </h4>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        Select a service, define your creative brief, and initiate an autonomous studio generative review pipeline.
                      </p>
                      <div className="pt-2">
                        <Link href="/orders" className="text-xs font-bold text-[#5C3A1E] hover:underline inline-flex items-center gap-1">
                          <span>Select Service</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Step 3: Art Director Collaboration */}
                    <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-3 relative">
                      <div className="w-8 h-8 rounded-full bg-[#F8F5EF] border border-[#EADFCB] text-[#94A3B8] flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                        3. Studio AI Review
                      </h4>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        Track progress, inspect draft moodboards, and request real-time refinements directly with your art lead.
                      </p>
                      <div className="pt-2">
                        <Link href="/chat" className="text-xs font-medium text-[#64748B] hover:text-[#0F172A] inline-flex items-center gap-1">
                          <span>Open Studio Chat</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Recommended Starter Solutions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                        Recommended Studio Starter Solutions
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        Commonly commissioned services for newly activated client workspaces.
                      </p>
                    </div>
                    <Link
                      href="/services"
                      className="text-xs font-semibold text-[#5C3A1E] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Explore all 12 Services</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickStartServices.map((srv) => {
                      const Icon = srv.icon;
                      return (
                        <div
                          key={srv.slug}
                          className="group p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] hover:border-[#D4A35A] transition-all hover:shadow-warm-hover flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center text-[#5C3A1E]">
                                <Icon className="w-5 h-5" />
                              </div>
                              <Badge variant="gold" size="sm" showDot={false}>
                                {srv.category}
                              </Badge>
                            </div>

                            <h4 className="font-serif text-lg font-semibold text-[#0F172A] group-hover:text-[#5C3A1E] transition-colors">
                              {srv.title}
                            </h4>
                            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                              {srv.desc}
                            </p>
                          </div>

                          <div className="mt-6 pt-4 border-t border-[#EADFCB]/60 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-[#94A3B8] uppercase font-semibold block">
                                Starting from
                              </span>
                              <span className="font-serif text-base font-bold text-[#5C3A1E]">
                                {srv.price}
                              </span>
                            </div>

                            <Link href={`/orders?service=${srv.slug}`}>
                              <Button variant="secondary" size="sm" withArrow>
                                Order
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Two-Column Support & Vault Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Art Director Concierge Card */}
                  <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs flex items-start gap-4">
                    <Avatar
                      name="Raghavan Sharma"
                      size="lg"
                      status="online"
                      className="shrink-0"
                    />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                            Raghavan Sharma
                          </h4>
                          <p className="text-xs text-[#A98B57] font-medium">
                            Principal Art Director & Lead Technologist
                          </p>
                        </div>
                        <Badge variant="completed" size="sm">
                          Online
                        </Badge>
                      </div>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        &ldquo;I review every 3D spatial pass and code milestone personally before delivery to your vault.&rdquo;
                      </p>
                      <div className="pt-2">
                        <Link href="/chat">
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Send className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                          >
                            Send Brief to Raghavan
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Google Drive Vault Status Card */}
                  <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center shrink-0 text-[#5C3A1E]">
                      <HardDrive className="w-6 h-6 text-[#5C3A1E]" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                            Google Drive Vault
                          </h4>
                          <p className="text-xs text-[#64748B]">
                            Encrypted Cloud Media Storage
                          </p>
                        </div>
                        <Badge variant="neutral" size="sm">
                          Ready
                        </Badge>
                      </div>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        Folder ID <code className="px-1.5 py-0.5 rounded bg-[#F8F5EF] text-[11px] font-mono text-[#5C3A1E]">drive_fld_sutra_001</code> allocated with 50 GB high-speed bandwidth.
                      </p>
                      <div className="pt-2">
                        <Link href="/media">
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<FolderOpen className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                          >
                            Open Media Vault
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* =========================================================
                 ACTIVE PRODUCTION ORDERS VIEW (POPULATED CLIENT DASHBOARD)
                 ========================================================= */
              <motion.div
                key="active-orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-[#0F172A]">
                      Active Production Streams
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Real-time generative pipeline tracking and deliverable approvals.
                    </p>
                  </div>
                  <Link
                    href="/orders"
                    className="text-xs font-semibold text-[#5C3A1E] hover:underline flex items-center gap-1"
                  >
                    <span>View All Orders</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] divide-y divide-[#EADFCB]/60 overflow-hidden shadow-xs">
                  {mockOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-[#F8F5EF]/40 transition-colors"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono font-bold text-[#5C3A1E] tracking-wider">
                            {ord.code}
                          </span>
                          <Badge
                            variant={
                              ord.status === "completed"
                                ? "completed"
                                : ord.status === "progress"
                                ? "progress"
                                : "review"
                            }
                            size="sm"
                          >
                            {ord.statusLabel}
                          </Badge>
                          <span className="text-xs text-[#94A3B8]">
                            {ord.service}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg font-semibold text-[#0F172A]">
                          {ord.title}
                        </h3>

                        <p className="text-xs text-[#64748B]">
                          {ord.deliverable}
                        </p>

                        {/* Progress Bar */}
                        <div className="pt-2 max-w-md">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-[#64748B]">Pipeline Completion</span>
                            <span className="font-semibold text-[#0F172A]">{ord.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#EADFCB]/50 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#D4A35A] to-[#5C3A1E]"
                              style={{ width: `${ord.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-[11px] text-[#94A3B8] block">Last Activity</span>
                          <span className="text-xs font-medium text-[#0F172A]">{ord.updatedAt}</span>
                        </div>
                        <Link href="/orders">
                          <button className="px-4 py-2 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A] hover:bg-[#FFFDF9] transition-all cursor-pointer flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Scope</span>
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <MobileBottomNav />
      </div>
    </RouteGuard>
  );
}
