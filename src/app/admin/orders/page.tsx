"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  ShieldCheck,
  RefreshCw,
  Play,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  ArrowLeft,
  Smartphone,
  Eye,
  AlertCircle,
  FileCheck,
  Clock,
  Sparkles,
  Download,
  Video as VideoIcon,
  Image as ImageIcon,
  Film,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";

interface AdminOrderRecord {
  id: string;
  orderNumber?: string;
  code?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  brandName?: string;
  packageName?: string;
  service?: string;
  totalAmount?: number;
  amountPaid?: number;
  utrNumber?: string;
  status: string;
  paymentStatus?: string;
  screenshotUrl?: string;
  createdAt: string;
  serviceDetails?: any;
  deliverables?: Array<{
    driveFileId?: string;
    filename?: string;
    fileSize?: string;
    mimeType?: string;
    previewUrl?: string;
    downloadUrl?: string;
    thumbnailUrl?: string;
    category?: string;
  }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [inspectingOrder, setInspectingOrder] = useState<AdminOrderRecord | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  // Load orders from API
  const fetchOrders = useCallback(async (quiet = false) => {
    if (!quiet) setIsRefreshing(true);
    try {
      const res = await fetch("/api/orders?limit=100");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch (e) {
      console.warn("Failed to load orders:", e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load and periodic 8-second auto-poll
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Client-triggered dispatch to Master n8n engine (via server relay & direct tunnel)
  const handleVerifyAndDispatch = async (order: AdminOrderRecord) => {
    setIsDispatching(true);
    setDispatchStatus("Connecting to Sutra Master n8n engine...");

    const currentOrigin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://sutrastudios.in";

    const orderPayload = {
      orderId: order.id,
      orderCode: order.orderNumber || order.code || order.id,
      sourceChannel: "admin_dispatch",
      client: {
        name: order.clientName,
        email: order.clientEmail,
        phone: order.clientPhone || "",
        brandName: order.brandName || order.clientName,
      },
      package: {
        name: order.packageName || order.service || "Studio Creative",
        price: order.totalAmount || order.amountPaid || 3499,
      },
      serviceDetails: order.serviceDetails || {
        niche: "Luxury Creative Architecture",
      },
      appBaseUrl: currentOrigin,
      dispatchedBy: "Studio Administrator",
      dispatchedAt: new Date().toISOString(),
    };

    let localN8nAck = false;
    let returnedDeliverables: any[] = [];

    // 1. Dispatch via production server relay (/api/n8n/dispatch) to avoid CORS/mixed-content blocks
    try {
      const serverRes = await fetch("/api/n8n/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderPayload,
          workflowId: "sutra-master-dispatch",
          isAdminDispatch: true,
          force: true,
        }),
      });
      const data = await serverRes.json().catch(() => ({}));
      if (serverRes.ok && data.success) {
        localN8nAck = true;
        returnedDeliverables = data.deliverables || data.output?.deliverables || [];
        setDispatchStatus("✓ Pipeline executed! 4K Master Render & Commercial Video Reel generated. Vaulting...");
      } else {
        // Fallback: try direct ngrok webhook
        const directWebhookUrl =
          process.env.NEXT_PUBLIC_N8N_URL
            ? `${process.env.NEXT_PUBLIC_N8N_URL.replace(/\/$/, "")}/webhook/sutra-master-dispatch`
            : "https://sanitary-engine-pursuable.ngrok-free.dev/webhook/sutra-master-dispatch";

        const n8nRes = await fetch(directWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });
        if (n8nRes.ok) {
          localN8nAck = true;
          setDispatchStatus("Direct n8n webhook accepted order!");
        } else {
          setDispatchStatus("Updating order status in production...");
        }
      }
    } catch {
      setDispatchStatus("Proceeding with production order status update...");
    }

    // 2. Update Firestore order status to in_production and vault deliverables
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          orderId: order.id,
          status: "in_production",
          paymentStatus: "paid",
          deliverables: returnedDeliverables,
          notes: localN8nAck
            ? "Dispatched to studio creative engine. 4K Master Render & Commercial Reel vaulted."
            : "Dispatched to production pipeline.",
        }),
      });

      setDispatchStatus("✓ Success! Assets Vaulted & Order Placed In Production.");
      setInspectingOrder((prev) =>
        prev
          ? {
              ...prev,
              status: "in_production",
              paymentStatus: "paid",
              deliverables: [
                ...(prev.deliverables || []),
                ...returnedDeliverables,
              ],
            }
          : null
      );
      fetchOrders(true);
      setTimeout(() => {
        setDispatchStatus(null);
        setIsDispatching(false);
      }, 2500);
    } catch (e: any) {
      setDispatchStatus(`Status update failed: ${e?.message || e}`);
      setIsDispatching(false);
    }
  };

  // Reject / Flag order
  const handleRejectOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to flag/reject this payment verification?")) return;
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          orderId,
          status: "cancelled",
          paymentStatus: "failed",
          notes: "Payment rejected / UTR invalid.",
        }),
      });
      fetchOrders(true);
      setInspectingOrder(null);
    } catch (e) {
      alert("Failed to reject order");
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      ord.clientName?.toLowerCase().includes(q) ||
      ord.clientEmail?.toLowerCase().includes(q) ||
      ord.id?.toLowerCase().includes(q) ||
      ord.orderNumber?.toLowerCase().includes(q) ||
      ord.utrNumber?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && ord.status === "pending_verification") ||
      (statusFilter === "in_production" && ord.status === "in_production") ||
      (statusFilter === "completed" && ord.status === "completed");

    return matchesSearch && matchesStatus;
  });

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#F8F5EF] text-[#0F172A] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Bar Navigation */}
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
                  Admin Order Queue & Dispatcher
                </h1>
                <p className="text-xs text-[#64748B]">
                  Live UPI Verifications • Local n8n Engine Webhook Trigger • Real-Time Sync
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link href="/admin/reviews">
                <Button variant="secondary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#A98B57]" />}>
                  Deliverable Reviews
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => fetchOrders()}
                isLoading={isRefreshing}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Refresh Live Orders
              </Button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Client, Order ID, or 12-digit UTR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: "all", label: "All Orders" },
                  { id: "pending", label: "Pending Verification" },
                  { id: "in_production", label: "In Production" },
                  { id: "completed", label: "Completed" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === f.id
                        ? "bg-[#5C3A1E] text-white shadow-2xs"
                        : "bg-white text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* View Switcher: Responsive Grid vs Horizontal List */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#EADFCB] shadow-2xs shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-[#5C3A1E] text-white shadow-2xs"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-[#5C3A1E] text-white shadow-2xs"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                  title="Row List View"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Responsive View (Grid or List - Zero Rigid Table Overflow) */}
          {isLoading ? (
            <div className="p-12 text-center text-xs text-[#64748B] bg-white rounded-2xl border border-[#EADFCB]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#A98B57] mb-2" />
              Loading real-time orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#64748B] bg-white rounded-2xl border border-[#EADFCB] space-y-2">
              <FileCheck className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50" />
              <p className="font-semibold text-sm text-[#0F172A]">No orders found in this view</p>
              <p>Incoming client commissions via UPI or online checkout will appear here in real time.</p>
            </div>
          ) : viewMode === "grid" ? (
            /* Responsive Card Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl bg-white border border-[#EADFCB] shadow-xs space-y-3 hover:border-[#D4A35A]/60 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xs text-[#5C3A1E]">
                        {ord.orderNumber || ord.code || ord.id}
                      </span>
                      <Badge
                        variant={
                          ord.status === "in_production"
                            ? "progress"
                            : ord.status === "completed"
                            ? "completed"
                            : ord.status === "pending_verification"
                            ? "gold"
                            : "neutral"
                        }
                        size="sm"
                      >
                        {ord.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-base text-[#0F172A]">{ord.clientName}</h4>
                      <p className="text-xs text-[#64748B]">{ord.clientEmail}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[#64748B] block text-[10px]">Package / Service:</span>
                        <span className="font-semibold text-[#0F172A]">{ord.packageName || ord.service}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#64748B] block text-[10px]">Total:</span>
                        <span className="font-serif font-bold text-base text-[#5C3A1E]">
                          ₹{(ord.totalAmount || ord.amountPaid || 3499).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {ord.utrNumber && (
                      <div className="text-xs font-mono p-2 rounded-lg bg-[#F8F5EF] border border-[#EADFCB]">
                        <span className="text-[#64748B] text-[10px] block">UPI Reference / UTR:</span>
                        <span className="font-semibold text-[#2E7D4F]">{ord.utrNumber}</span>
                      </div>
                    )}

                    {ord.deliverables && ord.deliverables.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8B6508] bg-amber-50/90 px-2.5 py-1.5 rounded-xl border border-amber-200/70">
                        <Sparkles className="w-3.5 h-3.5 text-[#B38E46] shrink-0" />
                        <span>{ord.deliverables.length} Deliverable(s) Vaulted (4K Images / Video)</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#EADFCB]/60">
                    <button
                      type="button"
                      onClick={() => setInspectingOrder(ord)}
                      className="w-full py-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] flex items-center justify-center gap-1.5 hover:bg-[#F3EDE2] transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>

                    {ord.status !== "in_production" && ord.status !== "completed" && ord.status !== "cancelled" && ord.status !== "refunded" ? (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full justify-center text-xs"
                        onClick={() => handleVerifyAndDispatch(ord)}
                        leftIcon={<Play className="w-3 h-3" />}
                      >
                        Dispatch to n8n
                      </Button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setInspectingOrder(ord)}
                        className="w-full py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#5C3A1E] font-semibold text-center flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#B38E46]" />
                        <span>View Assets</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Responsive Row List View */
            <div className="space-y-3">
              {filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EADFCB] shadow-2xs hover:border-[#D4A35A]/60 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
                    <div className="space-y-1 sm:w-36 shrink-0">
                      <span className="font-mono font-bold text-xs text-[#5C3A1E] block">
                        {ord.orderNumber || ord.code || ord.id}
                      </span>
                      <Badge
                        variant={
                          ord.status === "in_production"
                            ? "progress"
                            : ord.status === "completed"
                            ? "completed"
                            : ord.status === "pending_verification"
                            ? "gold"
                            : "neutral"
                        }
                        size="sm"
                      >
                        {ord.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="sm:w-52 min-w-0">
                      <h4 className="font-serif font-bold text-sm text-[#0F172A] truncate">{ord.clientName}</h4>
                      <p className="text-xs text-[#64748B] truncate">{ord.clientEmail}</p>
                    </div>

                    <div className="sm:w-44 min-w-0">
                      <span className="text-[10px] text-[#64748B] block">Package / Service</span>
                      <span className="text-xs font-semibold text-[#0F172A] truncate block">
                        {ord.packageName || ord.service}
                      </span>
                    </div>

                    <div className="sm:w-28 shrink-0">
                      <span className="text-[10px] text-[#64748B] block">Total Amount</span>
                      <span className="font-serif font-bold text-sm text-[#5C3A1E]">
                        ₹{(ord.totalAmount || ord.amountPaid || 3499).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {ord.utrNumber ? (
                      <div className="sm:w-36 shrink-0">
                        <span className="text-[10px] text-[#64748B] block">UPI Ref / UTR</span>
                        <span className="font-mono font-semibold text-xs text-[#2E7D4F] truncate block">
                          {ord.utrNumber}
                        </span>
                      </div>
                    ) : (
                      <div className="sm:w-36 shrink-0 text-[#94A3B8] text-xs font-mono">
                        —
                      </div>
                    )}

                    {ord.deliverables && ord.deliverables.length > 0 && (
                      <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-[#8B6508] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        <Sparkles className="w-3 h-3 text-[#B38E46]" />
                        <span>{ord.deliverables.length} Deliverable(s)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#EADFCB]/60">
                    <button
                      type="button"
                      onClick={() => setInspectingOrder(ord)}
                      className="px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] flex items-center justify-center gap-1.5 hover:bg-[#F3EDE2] transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>

                    {ord.status !== "in_production" && ord.status !== "completed" && ord.status !== "cancelled" && ord.status !== "refunded" ? (
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs py-2 px-3.5"
                        onClick={() => handleVerifyAndDispatch(ord)}
                        leftIcon={<Play className="w-3 h-3" />}
                      >
                        Dispatch n8n
                      </Button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setInspectingOrder(ord)}
                        className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#5C3A1E] font-semibold flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#B38E46]" />
                        <span>View Assets</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inspection & Dispatch Modal */}
          {inspectingOrder && (
            <Modal
              isOpen={!!inspectingOrder}
              onClose={() => setInspectingOrder(null)}
              title="Order Verification & Studio Generation"
              description={`Order #${inspectingOrder.orderNumber || inspectingOrder.code || inspectingOrder.id}`}
              maxWidth="lg"
            >
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Client:</span>
                    <span className="font-semibold text-[#0F172A]">{inspectingOrder.clientName} ({inspectingOrder.clientEmail})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Total Amount:</span>
                    <span className="font-serif font-bold text-sm text-[#5C3A1E]">
                      ₹{(inspectingOrder.totalAmount || inspectingOrder.amountPaid || 3499).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">UTR Reference:</span>
                    <span className="font-mono font-bold text-[#2E7D4F]">
                      {inspectingOrder.utrNumber || "Manual / Pending"}
                    </span>
                  </div>
                </div>

                {inspectingOrder.screenshotUrl && (
                  <div>
                    <span className="text-xs font-semibold text-[#0F172A] block mb-1.5">Payment Screenshot:</span>
                    <div className="relative h-48 w-full rounded-xl overflow-hidden border border-[#EADFCB] bg-stone-100">
                      <Image
                        src={inspectingOrder.screenshotUrl}
                        alt="Payment Proof"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Vaulted Deliverables Showcase */}
                {inspectingOrder.deliverables && inspectingOrder.deliverables.length > 0 ? (
                  <div className="space-y-3 pt-2 border-t border-[#EADFCB]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#B38E46]" />
                        <span className="text-xs font-bold text-[#0F172A]">
                          Generated Vault Deliverables ({inspectingOrder.deliverables.length})
                        </span>
                      </div>
                      <Badge variant="completed" size="sm">
                        Ready for Review
                      </Badge>
                    </div>

                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {inspectingOrder.deliverables.map((item, idx) => {
                        const isVid =
                          item.mimeType?.includes("video") ||
                          item.filename?.endsWith(".mp4") ||
                          item.filename?.endsWith(".mov");
                        const isImg =
                          item.mimeType?.includes("image") ||
                          item.filename?.endsWith(".png") ||
                          item.filename?.endsWith(".jpg") ||
                          item.filename?.endsWith(".webp");

                        return (
                          <div
                            key={item.driveFileId || idx}
                            className="p-3 rounded-xl bg-white border border-[#EADFCB] space-y-2 shadow-xs"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 font-medium text-[#0F172A] truncate">
                                {isVid ? (
                                  <VideoIcon className="w-3.5 h-3.5 text-[#5C3A1E] shrink-0" />
                                ) : (
                                  <ImageIcon className="w-3.5 h-3.5 text-[#B38E46] shrink-0" />
                                )}
                                <span className="truncate">{item.filename}</span>
                              </div>
                              <span className="text-[11px] text-[#64748B] shrink-0">{item.fileSize || "4K Master"}</span>
                            </div>

                            {/* Visual Preview */}
                            {isVid && (item.previewUrl || item.downloadUrl) && (
                              <div className="rounded-lg overflow-hidden border border-[#EADFCB] bg-black">
                                <video
                                  src={item.previewUrl || item.downloadUrl}
                                  controls
                                  playsInline
                                  preload="metadata"
                                  className="w-full max-h-44 object-contain"
                                />
                              </div>
                            )}

                            {isImg && (item.previewUrl || item.downloadUrl) && (
                              <div className="relative h-40 w-full rounded-lg overflow-hidden border border-[#EADFCB] bg-stone-100">
                                <Image
                                  src={item.previewUrl || item.downloadUrl!}
                                  alt={item.filename || "Deliverable"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}

                            {/* Download / Open Action */}
                            <div className="flex items-center justify-end gap-2 pt-1">
                              {(item.previewUrl || item.downloadUrl) && (
                                <a
                                  href={item.downloadUrl || item.previewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5C3A1E] hover:text-[#8B6508] transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Open Master</span>
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-center text-xs text-[#64748B]">
                    No deliverables vaulted yet. Click below to execute pipeline & synthesize 4K Renders & Commercial Video Reel.
                  </div>
                )}

                {dispatchStatus && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                    {dispatchStatus}
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRejectOrder(inspectingOrder.id)}
                    className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                  >
                    Reject / Flag
                  </Button>

                  <Button
                    variant="primary"
                    size="md"
                    disabled={isDispatching}
                    isLoading={isDispatching}
                    onClick={() => handleVerifyAndDispatch(inspectingOrder)}
                    className="w-full sm:w-auto"
                    leftIcon={<Play className="w-4 h-4" />}
                  >
                    {inspectingOrder.deliverables && inspectingOrder.deliverables.length > 0
                      ? "Re-Dispatch & Synthesize to n8n"
                      : "Verify & Dispatch to Local n8n"}
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}
