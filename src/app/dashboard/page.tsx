"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { KPITile } from "@/components/dashboard/KPITile";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/authContext";
import { SUTRA_SERVICES } from "@/data/servicesData";
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  Check,
  Eye,
  Sparkles,
  HardDrive,
  CheckCircle2,
  Clock,
  RotateCcw,
  DollarSign,
  Layers,
  Box,
  Compass,
  FolderOpen,
  Image as ImageIcon,
  Video,
  Monitor,
  Smartphone,
  Cpu,
  Share2,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  id: string;
  code: string;
  title: string;
  service: string;
  status: "awaiting_approval" | "in_progress" | "revision_requested" | "completed";
  statusLabel: string;
  deliverable: string;
  driveFolder: string;
  revisionRound: number;
  maxRevisions: number;
  updatedAt: string;
  progress: number;
  notes?: string;
}

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"orders" | "commission" | "zero_state">("orders");
  const isZeroState = viewMode === "zero_state";

  // Orders State with Approvals & Revisions
  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: "ord-1",
      code: "#ORD-001",
      title: "3D Spatial Architecture — Luxury Living Suite",
      service: "3D Visualization",
      status: "awaiting_approval",
      statusLabel: "Awaiting Client Approval",
      deliverable: "4K Render Pass 02 with warm teak wood materials and diffused sunlight in Google Drive.",
      driveFolder: "drive_fld_sutra_001/3D_RENDERS",
      revisionRound: 1,
      maxRevisions: 2,
      updatedAt: "2 hours ago",
      progress: 65,
      notes: "Please inspect material specular intensity on marble backsplash.",
    },
    {
      id: "ord-2",
      code: "#ORD-003",
      title: "Promotional Brand Film — 15s Showreel Reel",
      service: "Video Production",
      status: "in_progress",
      statusLabel: "In Production",
      deliverable: "Color grade rough-cut in progress by lead compositor.",
      driveFolder: "drive_fld_sutra_001/VIDEOS",
      revisionRound: 0,
      maxRevisions: 2,
      updatedAt: "3 hours ago",
      progress: 50,
    },
    {
      id: "ord-3",
      code: "#ORD-002",
      title: "Sutra Studio Brand Identity & Sanskrit Typography",
      service: "Brand Identity",
      status: "completed",
      statusLabel: "Approved & Vaulted",
      deliverable: "Final vector pack, guidelines PDF, and font licenses packaged in Google Drive.",
      driveFolder: "drive_fld_sutra_001/BRAND_ASSETS",
      revisionRound: 2,
      maxRevisions: 2,
      updatedAt: "Yesterday",
      progress: 100,
    },
    {
      id: "ord-4",
      code: "#ORD-004",
      title: "Meta Ads Launch Suite — 3 Creative Ad Variants & Copy Matrix",
      service: "Meta Ads Launcher",
      status: "awaiting_approval",
      statusLabel: "In Review (Awaiting Client Approval)",
      deliverable: "3 Multi-Ratio Ad Sets (9:16 Video, 1:1 Feed, 16:9 Banner) ready for client review.",
      driveFolder: "drive_fld_sutra_001/META_ADS_CAMPAIGN",
      revisionRound: 1,
      maxRevisions: 2,
      updatedAt: "Just now",
      progress: 75,
      notes: "Please inspect Ad Set 1 video hook and verify audience targeting before Meta ad dispatch.",
    },
  ]);
  const mockOrders = orders;

  // Inspection & Approval / Revision Modal
  const [inspectingOrder, setInspectingOrder] = useState<OrderItem | null>(null);
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  // Create Order Wizard State
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(SUTRA_SERVICES[0].id);
  const [orderDetails, setOrderDetails] = useState({
    title: "",
    timeline: "Standard (48-72h)",
    brief: "",
    references: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const currentService =
    SUTRA_SERVICES.find((s) => s.id === selectedService) || SUTRA_SERVICES[0];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService,
          serviceName: currentService.name,
          ...orderDetails,
        }),
      });
      const newOrder: OrderItem = {
        id: `ord-${Date.now()}`,
        code: `#ORD-00${orders.length + 1}`,
        title: orderDetails.title || `${currentService.name} Project`,
        service: currentService.name,
        status: "in_progress",
        statusLabel: "In Production",
        deliverable: "Creative brief received. Production pipeline initiated.",
        driveFolder: "drive_fld_sutra_001/NEW_COMMISSIONS",
        revisionRound: 0,
        maxRevisions: 2,
        updatedAt: "Just now",
        progress: 15,
      };
      setOrders([newOrder, ...orders]);
      setOrderSubmitted(true);
    } catch {
      setOrderSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveDeliverable = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "completed", statusLabel: "Approved & Vaulted", progress: 100 }
          : o
      )
    );
    setFeedbackSuccess("Deliverable approved! High-resolution masters finalized in your Google Drive vault.");
    setTimeout(() => {
      setInspectingOrder(null);
      setFeedbackSuccess("");
    }, 1500);
  };

  const handleRequestRevision = (orderId: string) => {
    if (!revisionNotes) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "revision_requested",
              statusLabel: "Revision in Progress",
              revisionRound: o.revisionRound + 1,
              notes: revisionNotes,
            }
          : o
      )
    );
    setFeedbackSuccess(`Revision round submitted to Art Director. Estimated turnaround: 24 hours.`);
    setTimeout(() => {
      setIsRevisionMode(false);
      setRevisionNotes("");
      setInspectingOrder(null);
      setFeedbackSuccess("");
    }, 1500);
  };

  const quickStartServices = [
    {
      title: "Spatial & 3D Architecture",
      category: "Creative",
      desc: "Photorealistic spatial renders, material moodboards, and interior lighting passes.",
      price: "₹9,499",
      slug: "3d-modeling",
      icon: Box,
    },
    {
      title: "Brand Identity & Styleguide",
      category: "Design",
      desc: "Comprehensive Sanskrit-inspired identity, typography guidelines, and vector suites.",
      price: "₹6,499",
      slug: "window-design",
      icon: Compass,
    },
    {
      title: "Next.js Web Application",
      category: "Development",
      desc: "Bespoke high-performance digital flagship with automated studio review pipelines.",
      price: "₹19,999",
      slug: "website-development",
      icon: Layers,
    },
  ];

  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <PortalSidebar />

        <main id="main-content" className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto pb-24 md:pb-12 space-y-8">
          {/* =========================================================
              TOP HEADER BAR WITH COMMISSIONING & PIPELINE SWITCHER
              ========================================================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EADFCB] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
                  STUDIO CLIENT PIPELINE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EADFCB]/60 text-[#5C3A1E] font-medium">
                  Vault ID: {user?.driveFolderId || "drive_fld_sutra_001"}
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A] mt-1">
                {viewMode === "commission"
                  ? "Orders, Approvals & Revisions"
                  : `Welcome, ${user?.displayName || "Studio Client"}`}
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                {viewMode === "commission"
                  ? "Track creative workflows, review draft deliverables, and request revision passes."
                  : viewMode === "zero_state"
                  ? "Your private studio sanctum is ready. Follow the onboarding roadmap below to commission your first deliverable."
                  : "Track creative workflows, review draft deliverables, and request revision passes."}
              </p>
            </div>

            {/* Navigation Tabs & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-full bg-[#FFFDF9] border border-[#EADFCB] p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("orders")}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                    viewMode === "orders"
                      ? "bg-[#5C3A1E] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  Active Orders ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode("commission");
                    setStep(1);
                    setOrderSubmitted(false);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "commission"
                      ? "bg-[#5C3A1E] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Commission</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("zero_state")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                    viewMode === "zero_state"
                      ? "bg-[#5C3A1E] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  Zero State
                </button>
              </div>

              <Link href="/services">
                <Button variant="secondary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />}>
                  Services
                </Button>
              </Link>

              <Link href="/pricing">
                <Button variant="secondary" size="sm" leftIcon={<DollarSign className="w-3.5 h-3.5 text-[#5C3A1E]" />}>
                  Pricing
                </Button>
              </Link>
            </div>
          </div>

          {/* =========================================================
              KPI TILES / SYSTEM STATUS
              ========================================================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <KPITile
              label="Active Orders"
              value={viewMode === "zero_state" ? 0 : orders.filter(o => o.status !== "completed").length}
              sublabel={viewMode === "zero_state" ? "No active orders yet" : "In production pipelines"}
              variant="progress"
            />
            <KPITile
              label="Completed"
              value={viewMode === "zero_state" ? 0 : orders.filter(o => o.status === "completed").length}
              sublabel={viewMode === "zero_state" ? "0 deliverables" : "Delivered to Drive vault"}
              variant="completed"
            />
            <KPITile
              label="Vault Storage"
              value={viewMode === "zero_state" ? "0 MB" : "4.8 GB"}
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
              VIEW MODES: COMMISSION WIZARD vs ACTIVE ORDERS vs ZERO-STATE
              ========================================================= */}
          <AnimatePresence mode="wait">
            {viewMode === "commission" ? (
              /* =========================================================
                 COMMISSIONING WIZARD VIEW (4-STEP 12-CAPABILITY CREATION)
                 ========================================================= */
              <motion.div
                key="commission-wizard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-warm p-6 sm:p-10 space-y-8"
              >
                {/* Stepper Progress Bar */}
                <div className="flex items-center justify-between pb-8 border-b border-[#EADFCB] max-w-xl mx-auto">
                  {[
                    { num: 1, label: "Service" },
                    { num: 2, label: "Brief" },
                    { num: 3, label: "Drive Assets" },
                    { num: 4, label: "Confirm" },
                  ].map((s) => (
                    <div key={s.num} className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          step === s.num
                            ? "bg-[#5C3A1E] text-white shadow-xs"
                            : step > s.num
                            ? "bg-[#D4A35A] text-[#0F172A]"
                            : "bg-[#F8F5EF] text-[#94A3B8] border border-[#EADFCB]"
                        }`}
                      >
                        {step > s.num ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                      </div>
                      <span
                        className={`text-xs font-medium hidden sm:inline ${
                          step >= s.num ? "text-[#0F172A]" : "text-[#94A3B8]"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Step 1: Select Capability (12 Studio Capabilities) */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center max-w-md mx-auto">
                      <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
                        Select Studio Capability
                      </h3>
                      <p className="text-xs text-[#64748B] mt-1">
                        Choose from our 12 specialized disciplines to route to the correct workflow.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {SUTRA_SERVICES.map((srv) => {
                        const isSelected = selectedService === srv.id;
                        return (
                          <div
                            key={srv.id}
                            onClick={() => setSelectedService(srv.id)}
                            className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                              isSelected
                                ? "bg-[#FDF9F0] border-2 border-[#D4A35A] shadow-xs"
                                : "bg-[#FFFFFF] border border-[#EADFCB] hover:border-[#D4A35A]/60"
                            }`}
                          >
                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-[#0F172A] mt-1">
                                {srv.name}
                              </h4>
                              <p className="text-[10px] text-[#64748B] mt-1 line-clamp-1">
                                {srv.tagline}
                              </p>
                            </div>
                            <span className="text-[11px] font-bold text-[#D4A35A] mt-3">
                              From {srv.startingPrice}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 2: Creative Brief Specifications */}
                {step === 2 && (
                  <div className="space-y-6 max-w-xl mx-auto">
                    <div className="text-center">
                      <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                        {currentService.name} Specifications
                      </h3>
                      <p className="text-xs text-[#64748B] mt-1">
                        Define your project goals, dimensions, and creative requirements.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
                        Project Title / Campaign Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Autumn Living Spatial Render Suite"
                        value={orderDetails.title}
                        onChange={(e) =>
                          setOrderDetails({ ...orderDetails, title: e.target.value })
                        }
                        className="w-full rounded-xl bg-[#FFFDF9] border border-[#EADFCB] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#D4A35A] focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
                        Creative Brief & Scope *
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Describe target audience, lighting mood, color palette preferences, or specific deliverables..."
                        value={orderDetails.brief}
                        onChange={(e) =>
                          setOrderDetails({ ...orderDetails, brief: e.target.value })
                        }
                        className="w-full rounded-xl bg-[#FFFDF9] border border-[#EADFCB] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#D4A35A] focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/20"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Google Drive Asset Uploads */}
                {step === 3 && (
                  <div className="space-y-6 max-w-xl mx-auto">
                    <div className="text-center">
                      <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                        References & Asset Uploads
                      </h3>
                      <p className="text-xs text-[#64748B] mt-1">
                        Assets will automatically sync to your private Google Drive vault folder.
                      </p>
                    </div>

                    <div className="border-2 border-dashed border-[#EADFCB] rounded-2xl p-8 text-center bg-[#FAF9F5] space-y-2">
                      <HardDrive className="w-8 h-8 text-[#5C3A1E] mx-auto opacity-70" />
                      <p className="text-sm font-semibold text-[#0F172A]">
                        Upload Moodboards, CAD or Logo Files
                      </p>
                      <p className="text-xs text-[#64748B]">
                        PNG, JPG, PDF, glTF, USDZ up to 500MB (Encrypted storage)
                      </p>
                      <button
                        type="button"
                        className="mt-2 px-4 py-2 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A]"
                      >
                        Select Files to Upload
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
                        Or paste Cloud / Google Drive Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://drive.google.com/drive/folders/..."
                        value={orderDetails.references}
                        onChange={(e) =>
                          setOrderDetails({ ...orderDetails, references: e.target.value })
                        }
                        className="w-full rounded-xl bg-[#FFFDF9] border border-[#EADFCB] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#D4A35A] focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/20"
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Confirm Order */}
                {step === 4 && (
                  <div className="space-y-6 max-w-xl mx-auto">
                    {orderSubmitted ? (
                      <div className="py-8 text-center space-y-4">
                        <div className="w-14 h-14 rounded-full bg-[#EDF7F0] text-[#2E7D4F] flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                          Order Dispatched to Workflow Router
                        </h3>
                        <p className="text-xs text-[#64748B] leading-relaxed">
                          Your order has been registered and routed to your dedicated Art Director.
                        </p>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setStep(1);
                            setOrderSubmitted(false);
                            setViewMode("orders");
                          }}
                        >
                          Return to Active Orders
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="text-center">
                          <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                            Review & Confirm Order
                          </h3>
                          <p className="text-xs text-[#64748B] mt-1">
                            Verify project parameters before triggering studio production.
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#F8F5EF] p-5 space-y-3 border border-[#EADFCB]">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#64748B]">Service:</span>
                            <span className="font-bold text-[#0F172A]">{currentService.name}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#64748B]">Project Title:</span>
                            <span className="font-bold text-[#0F172A]">
                              {orderDetails.title || `${currentService.name} Commission`}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#64748B]">Starting Investment:</span>
                            <span className="font-bold text-[#5C3A1E]">{currentService.startingPrice}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#64748B]">Vault Storage:</span>
                            <span className="font-bold text-[#2E7D4F]">Google Drive Encrypted</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stepper Controls */}
                {!orderSubmitted && (
                  <div className="flex items-center justify-between pt-6 border-t border-[#EADFCB]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                      disabled={step === 1}
                      leftIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                      Back
                    </Button>

                    {step < 4 ? (
                      <Button variant="primary" size="sm" onClick={handleNext} withArrow>
                        Next Step
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleFinalSubmit}
                        isLoading={isSubmitting}
                        withArrow
                      >
                        Authorize & Launch Commission
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : viewMode === "zero_state" ? (
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
                      <Button
                        variant="primary"
                        size="md"
                        withArrow
                        onClick={() => {
                          setViewMode("commission");
                          setStep(1);
                        }}
                      >
                        Commission Your First Project
                      </Button>
                      <Link href="/projects-client">
                        <Button
                          variant="secondary"
                          size="md"
                          leftIcon={<Layers className="w-4 h-4 text-[#D4A35A]" />}
                        >
                          View Studio Projects
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
                        <button
                          type="button"
                          onClick={() => {
                            setViewMode("commission");
                            setStep(1);
                          }}
                          className="text-xs font-bold text-[#5C3A1E] hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Select Service</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Step 3: Art Director Collaboration */}
                    <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-3 relative">
                      <div className="w-8 h-8 rounded-full bg-[#F8F5EF] border border-[#EADFCB] text-[#94A3B8] flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                        3. Studio Deliverables Review
                      </h4>
                      <p className="text-xs text-[#64748B] leading-relaxed">
                        Track progress, inspect draft moodboards, and review final milestones directly in your project suite.
                      </p>
                      <div className="pt-2">
                        <Link href="/projects-client" className="text-xs font-medium text-[#64748B] hover:text-[#0F172A] inline-flex items-center gap-1">
                          <span>Inspect Projects</span>
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

                            <button
                              type="button"
                              onClick={() => {
                                const matched = SUTRA_SERVICES.find(s => s.slug === srv.slug);
                                if (matched) setSelectedService(matched.id);
                                setViewMode("commission");
                                setStep(2);
                              }}
                              className="cursor-pointer"
                            >
                              <Button variant="secondary" size="sm" withArrow>
                                Order
                              </Button>
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
                {/* Approval Notice Banner if any orders need approval */}
                {orders.some((o) => o.status === "awaiting_approval") && (
                  <div className="p-4 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4A35A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F8F5EF] text-[#D4A35A] flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-[#D4A35A]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-serif font-semibold text-[#0F172A]">
                          Action Required: Deliverable Awaiting Your Review
                        </h4>
                        <p className="text-xs text-[#64748B]">
                          Inspect the 4K render pass below to approve for final Google Drive release or request revisions.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        const pending = orders.find((o) => o.status === "awaiting_approval");
                        if (pending) setInspectingOrder(pending);
                      }}
                    >
                      Review Deliverable
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-[#0F172A]">
                      Active Production Streams
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Real-time generative pipeline tracking, deliverable approvals, and revision passes.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setViewMode("commission");
                      setStep(1);
                      setOrderSubmitted(false);
                    }}
                  >
                    New Commission
                  </Button>
                </div>

                <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] divide-y divide-[#EADFCB]/60 overflow-hidden shadow-xs">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-[#F8F5EF]/40 transition-colors"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs font-mono font-bold text-[#5C3A1E] tracking-wider">
                            {ord.code}
                          </span>
                          <Badge
                            variant={
                              ord.status === "completed"
                                ? "completed"
                                : ord.status === "awaiting_approval"
                                ? "gold"
                                : ord.status === "revision_requested"
                                ? "progress"
                                : "neutral"
                            }
                            size="sm"
                          >
                            {ord.statusLabel}
                          </Badge>
                          <span className="text-xs text-[#94A3B8]">
                            • {ord.service}
                          </span>
                          <span className="text-[11px] font-medium text-[#64748B] bg-[#F8F5EF] px-2 py-0.5 rounded-full border border-[#EADFCB]">
                            Round {ord.revisionRound} of {ord.maxRevisions} Revisions
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

                      <div className="flex items-center gap-3 sm:shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setInspectingOrder(ord);
                            setIsRevisionMode(false);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A] hover:bg-[#FFFDF9] transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Scope</span>
                        </button>

                        {ord.status === "awaiting_approval" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApproveDeliverable(ord.id)}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <MobileBottomNav />

        {/* ========================================================
            ORDER INSPECTION, APPROVAL & REVISION MODAL
            ======================================================== */}
        <Modal
          isOpen={!!inspectingOrder}
          onClose={() => {
            setInspectingOrder(null);
            setIsRevisionMode(false);
          }}
          title={inspectingOrder?.title || "Deliverable Scope"}
          description={`Order ${inspectingOrder?.code} • ${inspectingOrder?.service}`}
          maxWidth="lg"
        >
          {inspectingOrder && (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="p-4 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#64748B] block">Current Stage</span>
                  <p className="font-bold text-[#0F172A]">{inspectingOrder.statusLabel}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#64748B] block">Revision Rounds</span>
                  <p className="text-xs font-semibold text-[#5C3A1E]">
                    {inspectingOrder.revisionRound} of {inspectingOrder.maxRevisions} Used
                  </p>
                </div>
              </div>

              {/* Deliverable Review Note */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A98B57]">
                  Deliverable Summary & Scope Notes
                </h4>
                <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-xs text-[#0F172A] leading-relaxed">
                  {inspectingOrder.deliverable}
                  {inspectingOrder.notes && (
                    <p className="mt-2 text-[#5C3A1E] font-medium pt-2 border-t border-[#EADFCB]/60">
                      Revision Note: {inspectingOrder.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Feedback Success State */}
              {feedbackSuccess && (
                <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] text-xs text-[#166534] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>{feedbackSuccess}</span>
                </div>
              )}

              {/* Revision Form Mode */}
              {isRevisionMode ? (
                <div className="space-y-4 pt-2 border-t border-[#EADFCB]">
                  <h4 className="font-serif text-sm font-semibold text-[#0F172A]">
                    Submit Revision Notes to Art Director
                  </h4>
                  <textarea
                    rows={3}
                    placeholder="Specify the exact adjustments desired (e.g. increase lighting softness, refine Sanskrit typography kerning, adjust texture reflectiveness)..."
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A] focus:ring-2 focus:ring-[#D4A35A]/20"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsRevisionMode(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRequestRevision(inspectingOrder.id)}
                    >
                      Send Revision Request
                    </Button>
                  </div>
                </div>
              ) : (
                /* Primary Actions: Approve vs Request Revision */
                <div className="pt-4 border-t border-[#EADFCB] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInspectingOrder(null)}
                    >
                      Close
                    </Button>
                    {inspectingOrder.revisionRound < inspectingOrder.maxRevisions && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsRevisionMode(true)}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                      >
                        Request Revision
                      </Button>
                    )}
                  </div>

                  {inspectingOrder.status === "awaiting_approval" && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleApproveDeliverable(inspectingOrder.id)}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Approve & Release to Drive
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </RouteGuard>
  );
}
