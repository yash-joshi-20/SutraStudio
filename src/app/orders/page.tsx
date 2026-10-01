"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import { Input, Badge } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { SUTRA_SERVICES } from "@/data/servicesData";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  RotateCcw,
  Download,
  HardDrive,
  FileCheck,
  Plus,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  id: string;
  code: string;
  title: string;
  service: string;
  status: "awaiting_approval" | "in_progress" | "revision_requested" | "completed";
  statusLabel: string;
  deliverablePreview: string;
  driveFolder: string;
  revisionRound: number;
  maxRevisions: number;
  updatedAt: string;
  notes?: string;
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "create">("orders");

  // Orders State with Approvals & Revisions
  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: "ord-1",
      code: "#ORD-001",
      title: "3D Spatial Architecture — Luxury Living Suite",
      service: "3D Visualization",
      status: "awaiting_approval",
      statusLabel: "Awaiting Client Approval",
      deliverablePreview: "4K Render Pass 02 with warm teak wood materials and diffused sunlight.",
      driveFolder: "drive_fld_sutra_001/3D_RENDERS",
      revisionRound: 1,
      maxRevisions: 2,
      updatedAt: "2 hours ago",
      notes: "Please inspect material specular intensity on marble backsplash.",
    },
    {
      id: "ord-2",
      code: "#ORD-002",
      title: "Sutra Studio Brand Identity & Sanskrit Typography",
      service: "Brand Identity",
      status: "completed",
      statusLabel: "Approved & Vaulted",
      deliverablePreview: "Full vector pack, guidelines PDF, and font licenses packaged in Google Drive.",
      driveFolder: "drive_fld_sutra_001/BRAND_ASSETS",
      revisionRound: 2,
      maxRevisions: 2,
      updatedAt: "Yesterday",
    },
    {
      id: "ord-3",
      code: "#ORD-003",
      title: "Promotional Brand Film — 15s Showreel Reel",
      service: "Video Production",
      status: "in_progress",
      statusLabel: "In Production",
      deliverablePreview: "Color grade rough-cut in progress by lead compositor.",
      driveFolder: "drive_fld_sutra_001/VIDEOS",
      revisionRound: 0,
      maxRevisions: 2,
      updatedAt: "3 hours ago",
    },
    {
      id: "ord-4",
      code: "#ORD-004",
      title: "Meta Ads Launch Suite — 3 Creative Ad Variants & Copy Matrix",
      service: "Meta Ads Launcher",
      status: "awaiting_approval",
      statusLabel: "In Review / Awaiting Client Approval",
      deliverablePreview: "3 Multi-Ratio Ad Sets (9:16 Video Reel, 1:1 Square Feed, 16:9 Banner) ready for client review in Google Drive.",
      driveFolder: "drive_fld_sutra_001/META_ADS_CAMPAIGN",
      revisionRound: 1,
      maxRevisions: 2,
      updatedAt: "Just now",
      notes: "Please inspect Ad Set 1 video hook and verify audience targeting before Meta ad dispatch.",
    },
  ]);

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
      // Append newly created order to active list
      const newOrder: OrderItem = {
        id: `ord-${Date.now()}`,
        code: `#ORD-00${orders.length + 1}`,
        title: orderDetails.title || `${currentService.name} Order`,
        service: currentService.name,
        status: "in_progress",
        statusLabel: "In Production",
        deliverablePreview: "Brief received. n8n workflow pipeline triggered.",
        driveFolder: "drive_fld_sutra_001/NEW_ORDERS",
        revisionRound: 0,
        maxRevisions: 2,
        updatedAt: "Just now",
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
          ? { ...o, status: "completed", statusLabel: "Approved & Vaulted" }
          : o
      )
    );
    setFeedbackSuccess("Deliverable approved! High-resolution masters have been finalized in your Google Drive vault.");
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

  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <PortalSidebar />

        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-6xl pb-24 md:pb-12 space-y-8">
          {/* Header & Tab Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EADFCB] gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-semibold uppercase tracking-wider text-[#5C3A1E] mb-2">
                <span>STUDIO CLIENT PIPELINE</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
                Orders, Approvals & Revisions
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Track creative workflows, review draft deliverables, and request revision passes.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="inline-flex rounded-full bg-[#FFFDF9] border border-[#EADFCB] p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  activeTab === "orders"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Active Orders ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("create")}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "create"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Commission</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              TAB 1: ORDERS & APPROVALS VIEW
              ======================================================== */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Approval Notice Banner if any orders need approval */}
              {orders.some((o) => o.status === "awaiting_approval") && (
                <div className="p-4 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4A35A] shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F8F5EF] text-[#D4A35A] flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-[#D4A35A]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-semibold text-[#0F172A]">
                        Action Required: 1 Deliverable Awaiting Your Review
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

              {/* Orders List Table */}
              <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] divide-y divide-[#EADFCB]/60 shadow-xs overflow-hidden">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-[#FAF9F5]/50 transition-colors"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-[#5C3A1E]">
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
                        <span className="text-xs text-[#94A3B8]">• {ord.service}</span>
                        <span className="text-[11px] font-medium text-[#64748B] bg-[#F8F5EF] px-2 py-0.5 rounded-full border border-[#EADFCB]">
                          Round {ord.revisionRound} of {ord.maxRevisions} Revisions
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-semibold text-[#0F172A]">
                        {ord.title}
                      </h3>

                      <p className="text-xs text-[#64748B] leading-relaxed max-w-3xl">
                        {ord.deliverablePreview}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-[#94A3B8] pt-1">
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3.5 h-3.5 text-[#5C3A1E]" />
                          <span>Vault: {ord.driveFolder}</span>
                        </span>
                        <span>• Updated {ord.updatedAt}</span>
                      </div>
                    </div>

                    {/* Order Action Triggers */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setInspectingOrder(ord);
                          setIsRevisionMode(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A] hover:bg-[#FFFDF9] transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & Review</span>
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

                      {ord.status === "completed" && (
                        <Link href="/media">
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Download className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                          >
                            Vault Master
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: CREATE NEW COMMISSION (4-STEP WIZARD)
              ======================================================== */}
          {activeTab === "create" && (
            <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-warm p-6 sm:p-10 space-y-8">
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

              {/* Step 1: Select Capability */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center max-w-md mx-auto">
                    <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
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
                              ? "bg-[#FDF9F0] border-[#D4A35A] shadow-xs"
                              : "bg-[#FFFFFF] border-[#EADFCB] hover:border-[#D4A35A]/50"
                          }`}
                        >
                          <span className="text-xs font-semibold text-[#0F172A] mt-2">
                            {srv.name}
                          </span>
                          <span className="text-[10px] text-[#64748B] mt-1">
                            {srv.tagline}
                          </span>
                          <span className="text-[10px] font-bold text-[#D4A35A] mt-3">
                            From {srv.startingPrice}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Brief Details */}
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

                  <Input
                    label="Project Title / Campaign Name *"
                    placeholder="e.g. Autumn Living Spatial Render Suite"
                    value={orderDetails.title}
                    onChange={(e) =>
                      setOrderDetails({ ...orderDetails, title: e.target.value })
                    }
                  />

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

              {/* Step 3: Reference Assets */}
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

                  <Input
                    label="Or paste Cloud / Google Drive Link"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={orderDetails.references}
                    onChange={(e) =>
                      setOrderDetails({ ...orderDetails, references: e.target.value })
                    }
                  />
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
                        Your order has been registered in Firestore and routed to your dedicated Art Director.
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setStep(1);
                          setOrderSubmitted(false);
                          setActiveTab("orders");
                        }}
                      >
                        Return to Orders List
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
                            {orderDetails.title || "Untitled Studio Order"}
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
                      Authorize & Launch
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
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
                  Deliverable Summary & Feedback Notes
                </h4>
                <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-xs text-[#0F172A] leading-relaxed">
                  {inspectingOrder.deliverablePreview}
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
