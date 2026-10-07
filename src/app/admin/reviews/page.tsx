"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Sparkles,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Play,
  Download,
  Share2,
  Eye,
  Video,
  FileCheck,
  HardDrive,
  ExternalLink,
} from "lucide-react";

interface DeliverableItem {
  deliverableId: string;
  orderId: string;
  clientName: string;
  clientEmail: string;
  brandName: string;
  headline: string;
  caption: string;
  imageUrl: string;
  videoUrl?: string;
  voiceoverScript?: string;
  status: "in_admin_review" | "approved" | "released" | "rejected";
  appBaseUrl?: string;
  generatedAt: string;
  notes?: string;
}

export default function AdminReviewsPage() {
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inspectingItem, setInspectingItem] = useState<DeliverableItem | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDeliverables = useCallback(async (quiet = false) => {
    if (!quiet) setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/deliverables");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.deliverables)) {
          setDeliverables(data.deliverables);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch deliverables:", e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliverables();
    const interval = setInterval(() => fetchDeliverables(true), 8000);
    return () => clearInterval(interval);
  }, [fetchDeliverables]);

  const handleApproveAndRelease = async (deliverableId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/deliverables", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliverableId,
          action: "approve",
          notes: "Approved by Studio Administrator and released to Sutra Cloud Vault.",
        }),
      });

      if (res.ok) {
        setActionSuccess("Deliverable approved & released to client Sutra Cloud Vault!");
        fetchDeliverables(true);
        setTimeout(() => {
          setActionSuccess(null);
          setInspectingItem(null);
          setIsProcessing(false);
        }, 1500);
      }
    } catch (e: any) {
      alert("Failed to release deliverable: " + e?.message);
      setIsProcessing(false);
    }
  };

  const handleReject = async (deliverableId: string) => {
    const reason = prompt("Enter revision instructions for local n8n rerun:");
    if (!reason) return;

    setIsProcessing(true);
    try {
      await fetch("/api/admin/deliverables", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliverableId,
          action: "reject",
          notes: reason,
        }),
      });
      fetchDeliverables(true);
      setInspectingItem(null);
      setIsProcessing(false);
    } catch {
      alert("Failed to reject deliverable");
      setIsProcessing(false);
    }
  };

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#F8F5EF] text-[#0F172A] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EADFCB]">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="p-2 rounded-xl bg-white border border-[#EADFCB] text-[#5C3A1E] hover:bg-[#FAF9F5] transition-colors"
                title="Back to Admin Master Hub"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A]">
                  Autonomous Deliverables Review
                </h1>
                <p className="text-xs text-[#64748B]">
                  Incoming FLUX 4K Renders & Kling Video Reels from Local n8n Engine
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link href="/admin/orders">
                <Button variant="secondary" size="sm" leftIcon={<FileCheck className="w-3.5 h-3.5" />}>
                  View Orders Queue
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => fetchDeliverables()}
                isLoading={isRefreshing}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Refresh Queue
              </Button>
            </div>
          </div>

          {/* Grid of Deliverables */}
          {isLoading ? (
            <div className="p-12 text-center text-xs text-[#64748B] bg-white rounded-2xl border border-[#EADFCB]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#A98B57] mb-2" />
              Loading generated deliverables...
            </div>
          ) : deliverables.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#64748B] bg-white rounded-2xl border border-[#EADFCB] space-y-2">
              <Sparkles className="w-8 h-8 text-[#A98B57] mx-auto opacity-50" />
              <p className="font-semibold text-sm text-[#0F172A]">No deliverables currently in review</p>
              <p>When the local n8n engine finishes rendering Step 7, deliverables will arrive here automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deliverables.map((item) => (
                <div
                  key={item.deliverableId}
                  className="rounded-2xl bg-white border border-[#EADFCB] overflow-hidden shadow-xs hover:border-[#D4A35A] transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* 4K Image Render Thumbnail */}
                    <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden">
                      <Image
                        src={item.imageUrl}
                        alt={item.headline}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <Badge
                          variant={
                            item.status === "released" || item.status === "approved"
                              ? "completed"
                              : item.status === "rejected"
                              ? "error"
                              : "gold"
                          }
                          size="sm"
                        >
                          {item.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        <span className="font-mono text-[10px] bg-black/70 text-white px-2 py-0.5 rounded-full">
                          {item.orderId}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="font-serif font-bold text-sm text-[#0F172A] line-clamp-1">
                        {item.headline}
                      </h4>
                      <p className="text-xs text-[#64748B] line-clamp-2">
                        {item.caption || item.voiceoverScript}
                      </p>
                      <div className="text-[11px] text-[#5C3A1E] font-medium pt-1">
                        Client: {item.clientName} ({item.brandName})
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-[#EADFCB]/60 mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectingItem(item)}
                      className="px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A] transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect 4K</span>
                    </button>

                    {item.status === "in_admin_review" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApproveAndRelease(item.deliverableId)}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F]" />}
                      >
                        Approve & Release
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inspection Modal */}
          {inspectingItem && (
            <Modal
              isOpen={!!inspectingItem}
              onClose={() => setInspectingItem(null)}
              title={inspectingItem.headline}
              description={`Deliverable ${inspectingItem.deliverableId} • Order #${inspectingItem.orderId}`}
              maxWidth="xl"
            >
              <div className="space-y-4">
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-stone-900 border border-[#EADFCB]">
                  <Image
                    src={inspectingItem.imageUrl}
                    alt={inspectingItem.headline}
                    fill
                    className="object-contain"
                  />
                </div>

                {inspectingItem.videoUrl && (
                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
                      <Video className="w-4 h-4 text-[#A98B57]" />
                      <span>Kling AI Vertical Video Reel Available</span>
                    </div>
                    <a
                      href={inspectingItem.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#5C3A1E] font-semibold hover:underline"
                    >
                      <span>Play Video</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs space-y-2">
                  <div>
                    <span className="text-[#64748B] block text-[10px] uppercase font-mono">Caption / Copy</span>
                    <p className="text-[#0F172A] mt-0.5">{inspectingItem.caption}</p>
                  </div>
                  {inspectingItem.voiceoverScript && (
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase font-mono">ElevenLabs Script</span>
                      <p className="text-[#5C3A1E] italic mt-0.5">&ldquo;{inspectingItem.voiceoverScript}&rdquo;</p>
                    </div>
                  )}
                </div>

                {actionSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{actionSuccess}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReject(inspectingItem.deliverableId)}
                    className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                  >
                    Reject with Revision Notes
                  </Button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href={inspectingItem.imageUrl}
                      download={`${inspectingItem.brandName}_4K_Render.png`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:bg-[#FAF9F5] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download RAW</span>
                    </a>

                    <Button
                      variant="primary"
                      size="md"
                      disabled={isProcessing}
                      isLoading={isProcessing}
                      onClick={() => handleApproveAndRelease(inspectingItem.deliverableId)}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Approve & Release to Client Vault
                    </Button>
                  </div>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}
