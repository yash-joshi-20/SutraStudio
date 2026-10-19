"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { SutraLogo } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/auth/authContext";
import { SyncManager } from "@/lib/sync/syncService";
import {
  LayoutDashboard,
  ShoppingBag,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Copy,
  Check,
  ExternalLink,
  LogOut,
  Filter,
  Sparkles,
  Play,
  ArrowRight,
  Phone,
  Mail,
  FileText,
  LayoutGrid,
  List as ListIcon,
  Video as VideoIcon,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export interface AdminOrderRecord {
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
  source?: string;
  isDraft?: boolean;
  notes?: string;
  attribution?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    referrer?: string;
  };
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

function renderChannelBadge(source?: string, isDraft?: boolean) {
  const norm = (source || "wizard").toLowerCase();
  let label = "Web Wizard";
  let bg = "bg-stone-100 text-stone-700 border-stone-200";

  if (norm === "whatsapp") {
    label = "WhatsApp";
    bg = "bg-emerald-50 text-emerald-800 border-emerald-200";
  } else if (norm === "instagram") {
    label = "Instagram";
    bg = "bg-pink-50 text-pink-800 border-pink-200";
  } else if (norm === "direct" || norm === "custom") {
    label = "Direct";
    bg = "bg-blue-50 text-blue-800 border-blue-200";
  } else if (norm === "chat") {
    label = "AI Chat";
    bg = "bg-purple-50 text-purple-800 border-purple-200";
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${bg}`}>
        {label}
      </span>
      {isDraft && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          Draft
        </span>
      )}
    </div>
  );
}

function getStatusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case "in_production":
      return "progress";
    case "completed":
      return "completed";
    case "pending_verification":
    case "payment_submitted":
      return "gold";
    case "cancelled":
    case "rejected":
      return "error";
    default:
      return "neutral";
  }
}

export function AdminDashboardClient() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders">("dashboard");
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [inspectingOrder, setInspectingOrder] = useState<AdminOrderRecord | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [copiedUtr, setCopiedUtr] = useState(false);
  const [zoomScreenshot, setZoomScreenshot] = useState(false);

  // Fetch real-time orders from API
  const fetchOrders = useCallback(async (quiet = false) => {
    if (!quiet) setIsRefreshing(true);
    try {
      const res = await fetch("/api/orders?limit=100", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          setOrders((prev) => {
            if (data.orders.length === 0 && quiet && prev.length > 0) {
              return prev;
            }
            return data.orders;
          });
        }
      }
    } catch (e) {
      console.warn("Failed to load live orders:", e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load and periodic 10-second polling
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Derived KPI metrics
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const pendingVerification = orders.filter(
      (o) =>
        o.status === "pending_verification" ||
        o.paymentStatus === "pending_verification" ||
        o.paymentStatus === "payment_submitted"
    ).length;
    const inProduction = orders.filter((o) => o.status === "in_production").length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const totalRevenue = orders.reduce((sum, o) => {
      if (o.status !== "cancelled" && o.status !== "rejected") {
        return sum + (o.totalAmount || o.amountPaid || 0);
      }
      return sum;
    }, 0);

    return {
      totalOrders,
      pendingVerification,
      inProduction,
      completed,
      totalRevenue,
    };
  }, [orders]);

  // Priority queue: orders that need immediate payment verification
  const pendingOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status === "pending_verification" ||
        o.paymentStatus === "pending_verification" ||
        o.paymentStatus === "payment_submitted"
    );
  }, [orders]);

  // Filtered orders for the Orders tab
  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((ord) => {
      const matchesSearch =
        !q ||
        ord.clientName?.toLowerCase().includes(q) ||
        ord.clientEmail?.toLowerCase().includes(q) ||
        ord.clientPhone?.toLowerCase().includes(q) ||
        ord.id?.toLowerCase().includes(q) ||
        ord.orderNumber?.toLowerCase().includes(q) ||
        ord.code?.toLowerCase().includes(q) ||
        ord.utrNumber?.toLowerCase().includes(q) ||
        ord.packageName?.toLowerCase().includes(q) ||
        ord.service?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" &&
          (ord.status === "pending_verification" ||
            ord.paymentStatus === "pending_verification" ||
            ord.paymentStatus === "payment_submitted")) ||
        (statusFilter === "in_production" && ord.status === "in_production") ||
        (statusFilter === "completed" && ord.status === "completed") ||
        (statusFilter === "cancelled" && (ord.status === "cancelled" || ord.status === "rejected"));

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Verify UPI Payment & Dispatch
  const handleVerifyAndDispatch = async (order: AdminOrderRecord) => {
    setIsDispatching(true);
    setActionMessage("Verifying UPI payment in ledger and dispatching to studio pipeline...");

    try {
      const res = await fetch("/api/admin/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          notes: "Verified by Studio Administrator via Admin Dashboard",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment verification failed.");
      }

      setActionMessage("✓ Payment verified! Order marked paid and dispatched.");
      SyncManager.broadcast("ORDER_STATUS_CHANGED", {
        orderId: order.id,
        status: "in_production",
        paymentStatus: "paid",
      });
      SyncManager.broadcast("NOTIFICATIONS_UPDATED", {});

      await fetchOrders(true);
      setTimeout(() => {
        setActionMessage(null);
        setIsDispatching(false);
        setInspectingOrder(null);
      }, 1500);
    } catch (e: any) {
      setActionMessage(`Verification error: ${e?.message || e}`);
      setIsDispatching(false);
    }
  };

  // Reject / Flag payment
  const handleRejectOrder = async (orderId: string) => {
    const reason = prompt("Enter reason for payment rejection (e.g. UTR mismatch, payment not received):");
    if (!reason || !reason.trim()) return;

    try {
      const res = await fetch("/api/admin/payments/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reject payment.");
      }

      SyncManager.broadcast("ORDER_STATUS_CHANGED", {
        orderId,
        status: "cancelled",
        paymentStatus: "rejected",
      });
      SyncManager.broadcast("NOTIFICATIONS_UPDATED", {});

      await fetchOrders(true);
      setInspectingOrder(null);
    } catch (e: any) {
      alert(`Failed to reject payment: ${e?.message || e}`);
    }
  };

  const copyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#FAF9F5] text-[#171717] font-sans antialiased">
        {/* Top Executive Navigation Bar */}
        <header className="sticky top-0 z-30 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#E5E1D8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
              {/* Brand Logo & Studio Terminal Identity */}
              <div className="flex items-center gap-3 sm:gap-4">
                <SutraLogo variant="horizontal" size="md" href="/admin" />
                <div className="hidden sm:block h-6 w-px bg-[#E5E1D8]" />
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4EFE6] border border-[#E5E1D8] text-[11px] font-semibold text-[#5C3A1E]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#A98B57]" />
                  <span>Executive Admin</span>
                </div>
              </div>

              {/* Navigation Tabs (Dashboard vs Orders) */}
              <nav className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F0ECE1] border border-[#E5E1D8]">
                <button
                  type="button"
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-[#171717] text-[#FAF9F5] shadow-xs"
                      : "text-[#64748B] hover:text-[#171717]"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "orders"
                      ? "bg-[#171717] text-[#FAF9F5] shadow-xs"
                      : "text-[#64748B] hover:text-[#171717]"
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Orders</span>
                  {metrics.pendingVerification > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#A98B57] text-white">
                      {metrics.pendingVerification}
                    </span>
                  )}
                </button>
              </nav>

              {/* Live Status & Admin Profile Actions */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchOrders()}
                  isLoading={isRefreshing}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                  className="hidden md:inline-flex text-xs text-[#5C3A1E]"
                  title="Refresh Live Orders from Firestore"
                >
                  Refresh
                </Button>

                <div className="flex items-center gap-2 border-l border-[#E5E1D8] pl-2 sm:pl-3">
                  <Avatar
                    name={user?.displayName || user?.email || "Studio Admin"}
                    size="sm"
                    status="online"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-[#171717] leading-none truncate max-w-[130px]">
                      {user?.email || "Admin"}
                    </p>
                    <span className="text-[10px] text-[#A98B57] font-medium leading-tight">Master Clearance</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="p-2 rounded-xl text-[#64748B] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Sign Out of Admin Terminal"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Workspace Body */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 sm:space-y-8">
              {/* Executive Greeting & Quick Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-warm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono text-[#A98B57] tracking-wider uppercase font-semibold">
                      Live Studio Engine Active
                    </span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171717]">
                    Sutra Studio Dashboard
                  </h1>
                  <p className="text-xs text-[#64748B]">
                    Real-time commission overview, instant UPI payment verification, and client order check.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab("orders")}
                    leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                  >
                    Check Orders ({orders.length})
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fetchOrders()}
                    isLoading={isRefreshing}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                  >
                    Sync Live Data
                  </Button>
                </div>
              </div>

              {/* 5-Column KPI Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {/* Total Orders */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span className="font-medium">Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-[#A98B57]" />
                  </div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#171717]">
                    {isLoading ? "—" : metrics.totalOrders}
                  </div>
                  <div className="text-[11px] text-[#64748B]">All incoming orders</div>
                </div>

                {/* Pending Verification */}
                <div
                  onClick={() => {
                    setStatusFilter("pending");
                    setActiveTab("orders");
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border shadow-2xs space-y-2 cursor-pointer transition-all ${
                    metrics.pendingVerification > 0
                      ? "bg-amber-50/70 border-amber-300 hover:border-amber-400"
                      : "bg-[#FFFDF9] border-[#E5E1D8]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-amber-900 font-medium">
                    <span>To Verify (UPI)</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-amber-950">
                    {isLoading ? "—" : metrics.pendingVerification}
                  </div>
                  <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                    <span>{metrics.pendingVerification > 0 ? "Action required" : "Clear queue"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                {/* In Production */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span className="font-medium">In Production</span>
                    <Activity className="w-4 h-4 text-[#5C3A1E]" />
                  </div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#171717]">
                    {isLoading ? "—" : metrics.inProduction}
                  </div>
                  <div className="text-[11px] text-[#64748B]">Studio pipeline active</div>
                </div>

                {/* Completed */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span className="font-medium">Completed</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#171717]">
                    {isLoading ? "—" : metrics.completed}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium">Vaulted & Delivered</div>
                </div>

                {/* Studio Revenue */}
                <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#64748B]">
                    <span className="font-medium">Studio Revenue</span>
                    <TrendingUp className="w-4 h-4 text-[#A98B57]" />
                  </div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#5C3A1E]">
                    ₹{isLoading ? "—" : metrics.totalRevenue.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[11px] text-[#64748B]">Gross commissions</div>
                </div>
              </div>

              {/* URGENT QUEUE: PAYMENTS TO VERIFY (When an order arrives, check details right here!) */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#A98B57]" />
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-[#171717]">
                      Pending Verification Queue
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#F4EFE6] border border-[#E5E1D8] text-[#5C3A1E]">
                      {pendingOrders.length}
                    </span>
                  </div>
                  {pendingOrders.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter("pending");
                        setActiveTab("orders");
                      }}
                      className="text-xs font-semibold text-[#5C3A1E] hover:text-[#A98B57] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View in full table</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <div className="p-8 text-center text-xs text-[#64748B] bg-[#FFFDF9] rounded-2xl border border-[#E5E1D8]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#A98B57] mb-2" />
                    Checking for incoming orders...
                  </div>
                ) : pendingOrders.length === 0 ? (
                  <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto opacity-70" />
                    <p className="font-semibold text-sm text-[#171717]">All Payments Verified</p>
                    <p className="text-xs text-[#64748B] max-w-md mx-auto">
                      There are no pending UPI verifications. When a client submits an order via UPI or checkout, it will instantly appear here for your approval.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 rounded-2xl bg-[#FFFDF9] border-2 border-amber-300 shadow-warm space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-xs text-[#5C3A1E]">
                              {ord.orderNumber || ord.code || ord.id.slice(0, 10)}
                            </span>
                            <Badge variant="gold" size="sm">
                              Verify Payment
                            </Badge>
                          </div>

                          <div>
                            <h3 className="font-serif font-bold text-base text-[#171717]">{ord.clientName}</h3>
                            <p className="text-xs text-[#64748B]">{ord.clientEmail}</p>
                          </div>

                          <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[#64748B] text-[10px] block">Service:</span>
                              <span className="font-semibold text-[#171717]">{ord.packageName || ord.service || "Creative Package"}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[#64748B] text-[10px] block">Amount:</span>
                              <span className="font-serif font-bold text-base text-[#5C3A1E]">
                                ₹{(ord.totalAmount || ord.amountPaid || 3499).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>

                          {ord.utrNumber ? (
                            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-emerald-800 block font-medium">12-Digit UPI UTR:</span>
                                <span className="font-mono font-bold text-emerald-950">{ord.utrNumber}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyUtr(ord.utrNumber!)}
                                className="p-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors"
                                title="Copy UTR Reference"
                              >
                                {copiedUtr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                              No UTR entered by client yet. Check screenshot proof in details.
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E5E1D8]">
                          <button
                            type="button"
                            onClick={() => setInspectingOrder(ord)}
                            className="py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#5C3A1E] flex items-center justify-center gap-1.5 hover:bg-[#F0ECE1] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Check Details</span>
                          </button>
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full justify-center text-xs"
                            onClick={() => handleVerifyAndDispatch(ord)}
                            leftIcon={<Play className="w-3 h-3" />}
                          >
                            Verify &amp; Start
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* RECENT ORDERS FEED */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#5C3A1E]" />
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-[#171717]">
                      Recent Studio Commissions
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-semibold text-[#5C3A1E] hover:text-[#A98B57] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View All Orders ({orders.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] overflow-hidden shadow-warm">
                  {orders.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#64748B]">No orders recorded yet.</div>
                  ) : (
                    <div className="divide-y divide-[#E5E1D8]">
                      {orders.slice(0, 8).map((ord) => (
                        <div
                          key={ord.id}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9F5] transition-colors"
                        >
                          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#F4EFE6] border border-[#E5E1D8] flex items-center justify-center shrink-0">
                              <ShoppingBag className="w-4 h-4 text-[#5C3A1E]" />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-xs text-[#5C3A1E]">
                                  {ord.orderNumber || ord.code || ord.id.slice(0, 8)}
                                </span>
                                {renderChannelBadge(ord.source, Boolean(ord.isDraft || ord.status === "draft"))}
                                <Badge variant={getStatusBadgeVariant(ord.status)} size="sm">
                                  {ord.status.replace("_", " ")}
                                </Badge>
                              </div>
                              <p className="text-xs font-semibold text-[#171717] truncate">{ord.clientName}</p>
                              <p className="text-[11px] text-[#64748B] truncate">
                                {ord.packageName || ord.service || "Creative Commission"} • {ord.clientEmail}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E1D8]/60">
                            <div className="text-right">
                              <span className="font-serif font-bold text-sm text-[#5C3A1E]">
                                ₹{(ord.totalAmount || ord.amountPaid || 3499).toLocaleString("en-IN")}
                              </span>
                              <span className="block text-[10px] text-[#64748B]">
                                {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("en-IN") : "Recent"}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setInspectingOrder(ord)}
                              className="px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#5C3A1E] hover:bg-[#F0ECE1] transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT & DETAIL CHECKER */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Header & Back to Dashboard */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E1D8]">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171717]">
                    Orders Ledger &amp; Detail Checker
                  </h1>
                  <p className="text-xs text-[#64748B]">
                    Inspect client submissions, check UPI payment proof, deliver 4K assets, and update order status.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveTab("dashboard")}
                    leftIcon={<LayoutDashboard className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                  >
                    Back to Dashboard
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => fetchOrders()}
                    isLoading={isRefreshing}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Refresh Orders
                  </Button>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by Client, Email, Order ID, or 12-digit UTR..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FFFDF9] border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Filter Buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                      { id: "all", label: "All Orders" },
                      { id: "pending", label: "Payments to Verify" },
                      { id: "in_production", label: "In Production" },
                      { id: "completed", label: "Completed" },
                      { id: "cancelled", label: "Cancelled" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setStatusFilter(f.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          statusFilter === f.id
                            ? "bg-[#171717] text-white shadow-2xs"
                            : "bg-[#FFFDF9] text-[#64748B] border border-[#E5E1D8] hover:border-[#A98B57]"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Grid / List Mode */}
                  <div className="flex items-center gap-1 bg-[#FFFDF9] p-1 rounded-xl border border-[#E5E1D8] shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        viewMode === "grid"
                          ? "bg-[#171717] text-white shadow-2xs"
                          : "text-[#64748B] hover:text-[#171717]"
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
                          ? "bg-[#171717] text-white shadow-2xs"
                          : "text-[#64748B] hover:text-[#171717]"
                      }`}
                      title="Row List View"
                    >
                      <ListIcon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">List</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Orders Display (Grid vs List) */}
              {isLoading ? (
                <div className="p-12 text-center text-xs text-[#64748B] bg-[#FFFDF9] rounded-2xl border border-[#E5E1D8]">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#A98B57] mb-2" />
                  Loading real-time orders...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#64748B] bg-[#FFFDF9] rounded-2xl border border-[#E5E1D8] space-y-2">
                  <FileText className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50" />
                  <p className="font-semibold text-sm text-[#171717]">No orders matched your search</p>
                  <p>Try resetting your filter or search query to view all commissions.</p>
                </div>
              ) : viewMode === "grid" ? (
                /* Responsive Card Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-warm space-y-3 flex flex-col justify-between hover:border-[#A98B57]/60 transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-xs text-[#5C3A1E]">
                            {ord.orderNumber || ord.code || ord.id.slice(0, 10)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {renderChannelBadge(ord.source, Boolean(ord.isDraft || ord.status === "draft"))}
                            <Badge variant={getStatusBadgeVariant(ord.status)} size="sm">
                              {ord.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-serif font-bold text-base text-[#171717]">{ord.clientName}</h3>
                          <p className="text-xs text-[#64748B]">{ord.clientEmail}</p>
                          {ord.clientPhone && (
                            <p className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-[#A98B57]" />
                              <span>{ord.clientPhone}</span>
                            </p>
                          )}
                        </div>

                        <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[#64748B] text-[10px] block">Service / Plan:</span>
                            <span className="font-semibold text-[#171717]">{ord.packageName || ord.service || "Creative Service"}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[#64748B] text-[10px] block">Total:</span>
                            <span className="font-serif font-bold text-base text-[#5C3A1E]">
                              ₹{(ord.totalAmount || ord.amountPaid || 3499).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        {ord.utrNumber ? (
                          <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-emerald-800 block font-medium">12-Digit UPI UTR:</span>
                              <span className="font-mono font-bold text-emerald-950">{ord.utrNumber}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyUtr(ord.utrNumber!)}
                              className="p-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors"
                              title="Copy UTR"
                            >
                              {copiedUtr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        ) : null}

                        {ord.deliverables && ord.deliverables.length > 0 && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8B6508] bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200/80">
                            <Sparkles className="w-3.5 h-3.5 text-[#B38E46] shrink-0" />
                            <span>{ord.deliverables.length} Deliverable(s) Vaulted</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E5E1D8]">
                        <button
                          type="button"
                          onClick={() => setInspectingOrder(ord)}
                          className="w-full py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#5C3A1E] flex items-center justify-center gap-1.5 hover:bg-[#F0ECE1] transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Check Details</span>
                        </button>

                        {ord.status !== "in_production" && ord.status !== "completed" && ord.status !== "cancelled" && ord.status !== "rejected" ? (
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full justify-center text-xs"
                            onClick={() => handleVerifyAndDispatch(ord)}
                            leftIcon={<Play className="w-3 h-3" />}
                          >
                            Verify &amp; Start
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
                /* Responsive Row List */
                <div className="space-y-3">
                  {filteredOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xs hover:border-[#A98B57]/60 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
                        <div className="space-y-1 sm:w-36 shrink-0">
                          <span className="font-mono font-bold text-xs text-[#5C3A1E] block">
                            {ord.orderNumber || ord.code || ord.id.slice(0, 10)}
                          </span>
                          {renderChannelBadge(ord.source, Boolean(ord.isDraft || ord.status === "draft"))}
                          <Badge variant={getStatusBadgeVariant(ord.status)} size="sm">
                            {ord.status.replace("_", " ")}
                          </Badge>
                        </div>

                        <div className="sm:w-52 min-w-0">
                          <h4 className="font-serif font-bold text-sm text-[#171717] truncate">{ord.clientName}</h4>
                          <p className="text-xs text-[#64748B] truncate">{ord.clientEmail}</p>
                          {ord.clientPhone && <p className="text-[11px] text-[#64748B]">{ord.clientPhone}</p>}
                        </div>

                        <div className="sm:w-44 min-w-0">
                          <span className="text-[10px] text-[#64748B] block">Service / Plan</span>
                          <span className="text-xs font-semibold text-[#171717] truncate block">
                            {ord.packageName || ord.service || "Creative Package"}
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
                            <span className="text-[10px] text-emerald-800 block font-medium">12-Digit UTR</span>
                            <span className="font-mono font-semibold text-xs text-emerald-950 truncate block">
                              {ord.utrNumber}
                            </span>
                          </div>
                        ) : (
                          <div className="sm:w-36 shrink-0 text-[#94A3B8] text-xs font-mono">—</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E5E1D8]/60">
                        <button
                          type="button"
                          onClick={() => setInspectingOrder(ord)}
                          className="px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#5C3A1E] flex items-center justify-center gap-1.5 hover:bg-[#F0ECE1] transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Check Details</span>
                        </button>

                        {ord.status !== "in_production" && ord.status !== "completed" && ord.status !== "cancelled" && ord.status !== "rejected" ? (
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-xs py-2 px-3.5"
                            onClick={() => handleVerifyAndDispatch(ord)}
                            leftIcon={<Play className="w-3 h-3" />}
                          >
                            Verify &amp; Start
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
            </div>
          )}

          {/* COMPREHENSIVE ORDER DETAIL CHECKER MODAL */}
          {inspectingOrder && (
            <Modal
              isOpen={Boolean(inspectingOrder)}
              onClose={() => {
                setInspectingOrder(null);
                setActionMessage(null);
              }}
              title="Order Details & Verification Check"
              description={`Order #${inspectingOrder.orderNumber || inspectingOrder.code || inspectingOrder.id}`}
              maxWidth="lg"
            >
              <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                {/* Status Bar */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#64748B] uppercase font-semibold">Current Status</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(inspectingOrder.status)} size="md">
                        {inspectingOrder.status.replace("_", " ")}
                      </Badge>
                      {inspectingOrder.paymentStatus && (
                        <span className="text-xs text-[#64748B]">
                          Payment: <strong className="text-[#171717]">{inspectingOrder.paymentStatus}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    {renderChannelBadge(inspectingOrder.source, Boolean(inspectingOrder.isDraft || inspectingOrder.status === "draft"))}
                  </div>
                </div>

                {/* Client Information */}
                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#A98B57]">Client Specifications</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#64748B] block text-[11px]">Full Name:</span>
                      <span className="font-semibold text-[#171717]">{inspectingOrder.clientName}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[11px]">Email Address:</span>
                      <a href={`mailto:${inspectingOrder.clientEmail}`} className="font-medium text-[#5C3A1E] hover:underline flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>{inspectingOrder.clientEmail}</span>
                      </a>
                    </div>
                    {inspectingOrder.clientPhone && (
                      <div>
                        <span className="text-[#64748B] block text-[11px]">Phone / WhatsApp:</span>
                        <a href={`tel:${inspectingOrder.clientPhone}`} className="font-medium text-[#5C3A1E] hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{inspectingOrder.clientPhone}</span>
                        </a>
                      </div>
                    )}
                    {inspectingOrder.brandName && (
                      <div>
                        <span className="text-[#64748B] block text-[11px]">Brand / Business Name:</span>
                        <span className="font-semibold text-[#171717]">{inspectingOrder.brandName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service & Financials */}
                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#A98B57]">Commission &amp; Pricing</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#64748B] block text-[11px]">Package / Service:</span>
                      <span className="font-bold text-[#171717]">{inspectingOrder.packageName || inspectingOrder.service || "Creative Package"}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[11px]">Total Valuation:</span>
                      <span className="font-serif font-bold text-base text-[#5C3A1E]">
                        ₹{(inspectingOrder.totalAmount || inspectingOrder.amountPaid || 3499).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* UPI UTR Verification Box */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                        UPI Payment Verification Proof
                      </h4>
                    </div>
                    {inspectingOrder.utrNumber && (
                      <button
                        type="button"
                        onClick={() => copyUtr(inspectingOrder.utrNumber!)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-white px-2 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
                      >
                        {copiedUtr ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy UTR</span>
                      </button>
                    )}
                  </div>

                  <div className="text-xs space-y-1">
                    <span className="text-amber-900 text-[11px] block">12-Digit Reference (UTR):</span>
                    <span className="font-mono font-bold text-sm sm:text-base text-amber-950 block">
                      {inspectingOrder.utrNumber || "— No UTR provided by client yet —"}
                    </span>
                  </div>

                  {inspectingOrder.screenshotUrl && (
                    <div className="space-y-1.5 pt-2 border-t border-amber-200">
                      <span className="text-xs font-semibold text-amber-950 block">Payment Screenshot Proof:</span>
                      <div
                        onClick={() => setZoomScreenshot(true)}
                        className="relative h-48 w-full rounded-xl overflow-hidden border border-amber-300 bg-white cursor-pointer group"
                      >
                        <Image
                          src={inspectingOrder.screenshotUrl}
                          alt="UPI Payment Proof"
                          fill
                          className="object-contain group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                          Click to Enlarge Proof
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Vaulted Deliverables Showcase */}
                {inspectingOrder.deliverables && inspectingOrder.deliverables.length > 0 ? (
                  <div className="space-y-3 p-4 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#A98B57]" />
                        <span className="text-xs font-bold text-[#171717]">
                          Vault Deliverables ({inspectingOrder.deliverables.length})
                        </span>
                      </div>
                      <Badge variant="completed" size="sm">
                        Ready
                      </Badge>
                    </div>

                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {inspectingOrder.deliverables.map((item, idx) => {
                        const isVid =
                          item.mimeType?.includes("video") ||
                          item.filename?.endsWith(".mp4") ||
                          item.filename?.endsWith(".mov");

                        return (
                          <div
                            key={item.driveFileId || idx}
                            className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 font-medium text-[#171717] truncate">
                                {isVid ? (
                                  <VideoIcon className="w-3.5 h-3.5 text-[#5C3A1E] shrink-0" />
                                ) : (
                                  <ImageIcon className="w-3.5 h-3.5 text-[#A98B57] shrink-0" />
                                )}
                                <span className="truncate">{item.filename}</span>
                              </div>
                              <span className="text-[11px] text-[#64748B] shrink-0">{item.fileSize || "4K Master"}</span>
                            </div>

                            {isVid && (item.previewUrl || item.downloadUrl) && (
                              <div className="rounded-lg overflow-hidden border border-[#E5E1D8] bg-black">
                                <video
                                  src={item.previewUrl || item.downloadUrl}
                                  controls
                                  playsInline
                                  preload="metadata"
                                  className="w-full max-h-36 object-contain"
                                />
                              </div>
                            )}

                            {(item.previewUrl || item.downloadUrl) && (
                              <div className="flex justify-end pt-1">
                                <a
                                  href={item.downloadUrl || item.previewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5C3A1E] hover:text-[#A98B57]"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Open Google Drive Master</span>
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Action Feedback Banner */}
                {actionMessage && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 font-medium">
                    {actionMessage}
                  </div>
                )}

                {/* Action Footer Buttons */}
                <div className="pt-3 border-t border-[#E5E1D8] flex flex-col sm:flex-row items-center justify-end gap-2.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRejectOrder(inspectingOrder.id)}
                    className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                  >
                    Reject Payment
                  </Button>

                  {inspectingOrder.status !== "in_production" && inspectingOrder.status !== "completed" && inspectingOrder.status !== "cancelled" ? (
                    <Button
                      variant="primary"
                      size="md"
                      disabled={isDispatching}
                      isLoading={isDispatching}
                      onClick={() => handleVerifyAndDispatch(inspectingOrder)}
                      className="w-full sm:w-auto"
                      leftIcon={<Play className="w-4 h-4" />}
                    >
                      Verify UPI &amp; Start Work
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => setInspectingOrder(null)}
                      className="w-full sm:w-auto"
                    >
                      Close Details
                    </Button>
                  )}
                </div>
              </div>
            </Modal>
          )}

          {/* Screenshot Enlarge Lightbox */}
          {zoomScreenshot && inspectingOrder?.screenshotUrl && (
            <div
              onClick={() => setZoomScreenshot(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
            >
              <div className="relative max-w-3xl max-h-[90vh] w-full h-[80vh] rounded-2xl overflow-hidden border border-white/20">
                <Image
                  src={inspectingOrder.screenshotUrl}
                  alt="UPI Proof Full"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </RouteGuard>
  );
}
