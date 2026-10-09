"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import { Input, Badge } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { SUTRA_SERVICES } from "@/data/servicesData";
import { useAuth } from "@/lib/auth/authContext";
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
  Sparkles,
  Globe,
  Layers,
  Zap,
  Calendar,
  ShieldCheck,
  Upload,
  Minus,
  Loader2,
  CalendarDays,
  Phone,
  Mail,
  User,
  ExternalLink,
  ChevronRight,
  FileText,
  CreditCard,
  Receipt,
  Lock,
  MessageSquare,
  Send,
  Video,
  Box,
  QrCode,
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { openRazorpayCheckout } from "@/lib/services/razorpayClient";
import { OrderReceiptModal, ReceiptOrderData } from "@/components/orders/OrderReceiptModal";
import { PaymentModal } from "@/components/checkout/PaymentModal";
import { MasterOrderForm } from "@/components/orders/MasterOrderForm";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { computeOrderProgress, type OrderProgressInfo } from "@/lib/services/orderProgress";
import { uploadFileToDrive } from "@/lib/drive/useDriveUpload";
import { soundSystem } from "@/lib/audio/soundSystem";
import { AnimatedCheckSuccess, AnimatedReminderClock } from "@/components/ui/AnimatedStatusIcons";

// Unified Order Item representing both legacy and modern Firestore orders
interface OrderItem {
  id: string;
  code: string;
  orderNumber?: string;
  title: string;
  service: string;
  status:
    | "pending_payment"
    | "paid"
    | "brief_review"
    | "in_production"
    | "draft_delivered"
    | "awaiting_approval"
    | "revision_requested"
    | "approved"
    | "completed"
    | "cancelled"
    | "refunded"
    | "on_hold"
    | "closed"
    | "expired"
    | "pending"
    | "confirmed"
    | "in_progress"
    | "trial"
    | "active"
    | "delivered";
  statusLabel: string;
  deliverablePreview: string;
  deliverables?: {
    driveFileId?: string;
    filename: string;
    checksum?: string;
    fileSize?: string;
    mimeType?: string;
    previewUrl?: string;
    version?: string;
    category?: string;
  }[];
  deliveredAt?: string;
  driveFolder: string;
  driveFolderPath?: string;
  revisionRound: number;
  maxRevisions: number;
  updatedAt: string;
  createdAt?: string;
  notes?: string;
  requirements?: string;
  type?: "service" | "monthly_plan";
  items?: {
    serviceId?: string;
    planId?: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount?: number;
  billingCycle?: "monthly" | "quarterly" | "annual";
  attachments?: {
    name: string;
    size?: string;
    url?: string;
  }[];
  source?: "dashboard" | "ai_chat";
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  paymentStatus?: "unpaid" | "paid" | "failed" | "refunded";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amountPaid?: number;
  paidAt?: string;
  paymentMethod?: string;
  failureReason?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
  nextBillingDate?: string;
  trialEndsAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  estimatedDeliveryDays?: number;
  estimatedDueDate?: string;
  comments?: Array<{
    id: string;
    sender: "client" | "admin" | "system";
    authorName: string;
    text: string;
    attachmentUrl?: string;
    attachmentName?: string;
    createdAt: string;
  }>;
  statusHistory?: {
    status: string;
    changedAt: string;
    changedBy: string;
    note?: string;
  }[];
}

import {
  SEED_CATALOG_SERVICES,
  SEED_CATALOG_PLANS,
  CatalogService,
  CatalogPlan,
  BriefFormField,
} from "@/lib/services/catalogData";
import { useConfirm } from "@/hooks/useConfirm";

const FALLBACK_SERVICES: CatalogService[] = SEED_CATALOG_SERVICES;
const FALLBACK_PLANS: CatalogPlan[] = SEED_CATALOG_PLANS;

export default function OrdersPage() {
  const { user, profile } = useAuth();
  const { confirm, ConfirmationDialog } = useConfirm();

  // Orders State with real-time updates
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Inspection & Approval / Revision Modal
  const [inspectingOrder, setInspectingOrder] = useState<OrderItem | null>(null);
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  // New Order Modal Flow State
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isMasterOrderModalOpen, setIsMasterOrderModalOpen] = useState(false);
  const [initialMasterService, setInitialMasterService] = useState<string | undefined>(undefined);
  const [initialMasterTier, setInitialMasterTier] = useState<string | undefined>(undefined);
  const [flowStep, setFlowStep] = useState<
    | "choose_type"
    | "services_select"
    | "plan_select"
    | "service_details"
    | "plan_details"
    | "drive_assets"
    | "review_confirm"
    | "success"
    | "dismissed"
  >("choose_type");

  const [orderType, setOrderType] = useState<"service" | "monthly_plan">("service");

  // Catalogs loaded from backend
  const [servicesCatalog, setServicesCatalog] = useState<CatalogService[]>(FALLBACK_SERVICES);
  const [plansCatalog, setPlansCatalog] = useState<CatalogPlan[]>(FALLBACK_PLANS);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(false);

  // Individual Services Flow State: serviceId -> quantity (>= 1)
  const [selectedServices, setSelectedServices] = useState<Record<string, number>>({
    "img-creation": 1,
  });

  // Monthly Plan Flow State
  const [selectedPlanId, setSelectedPlanId] = useState<string>("studio-growth");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "annual">("monthly");

  // Details State
  const [commissionTitle, setCommissionTitle] = useState("");
  const [requirements, setRequirements] = useState("");
  const [briefAnswers, setBriefAnswers] = useState<Record<string, any>>({});
  const [preferredTimeline, setPreferredTimeline] = useState("Standard Studio SLA (48-72h)");
  const [targetKickoffDate, setTargetKickoffDate] = useState("");
  const [clientContact, setClientContact] = useState({
    name: user?.displayName || "Studio Client",
    email: user?.email || "client@sutrastudio.com",
    phone: "",
  });
  const [driveLink, setDriveLink] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string }[]>([]);
  // Real File objects behind the staged list. Kept OUT of `uploadedFiles` so
  // cloud-draft JSON never tries to serialise a Blob (STEP 30: briefs land in
  // the order's "01 Client Assets" folder via a browser → Drive session).
  const [stagedFileBlobs, setStagedFileBlobs] = useState<File[]>([]);
  const [stagedUploadStatus, setStagedUploadStatus] = useState<
    Record<string, { phase: string; percent: number; error?: string; driveFileId?: string }>
  >({});
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Draft Management State
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [savedDraftData, setSavedDraftData] = useState<any | null>(null);
  const [draftStatus, setDraftStatus] = useState("");

  // Submission & Confirmation state
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdOrderResult, setCreatedOrderResult] = useState<OrderItem | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<ReceiptOrderData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [paymentModalOrder, setPaymentModalOrder] = useState<OrderItem | null>(null);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);

  // Support custom amount, WhatsApp concierge, and pricing links (e.g. /orders?amount=12000&ref=custom)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const amountParam = params.get("amount");
    const refParam = params.get("ref");
    const packageParam = params.get("package");
    const serviceParam = params.get("service");

    if (amountParam && !isNaN(Number(amountParam))) {
      const parsedAmount = Number(amountParam);
      const customCode = refParam
        ? `CUST-${refParam.toUpperCase()}`
        : `SUTRA-${Date.now().toString().slice(-4)}`;
      setPaymentModalOrder({
        id: `ord_custom_${Date.now()}`,
        code: customCode,
        orderNumber: customCode,
        title: "Bespoke Creative Commission",
        service: "Custom Creative Project",
        totalAmount: parsedAmount,
        amountPaid: parsedAmount,
        status: "pending_payment",
        statusLabel: "Pending Payment Verification",
        deliverablePreview: "Custom commissioned pipeline assets",
        driveFolder: "Vault",
        revisionRound: 0,
        maxRevisions: 2,
        updatedAt: new Date().toISOString(),
      });
    } else if (serviceParam) {
      setIsMasterOrderModalOpen(true);
      setInitialMasterService(serviceParam);
    } else if (packageParam) {
      setIsMasterOrderModalOpen(true);
      setInitialMasterTier(packageParam);
    }
  }, []);

  // Tab Filtering: Active Orders vs Order History
  const [activeFilterTab, setActiveFilterTab] = useState<"active" | "history" | "all">("active");

  // Order Details Modal Tabs & Comments State
  const [activeModalTab, setActiveModalTab] = useState<"scope" | "deliverables" | "timeline" | "discussion">("scope");
  const [orderComments, setOrderComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [newCommentAttachmentUrl, setNewCommentAttachmentUrl] = useState("");
  const [annotationUrl, setAnnotationUrl] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Load Order Discussion Comments
  const loadOrderComments = useCallback(async (orderId: string) => {
    setIsLoadingComments(true);
    try {
      const res = await fetch(`/api/orders/comments?orderId=${encodeURIComponent(orderId)}`);
      if (res.ok) {
        const data = await res.json();
        setOrderComments(data.comments || []);
      }
    } catch {
      // safe fallback
    } finally {
      setIsLoadingComments(false);
    }
  }, []);

  // Post Order Discussion Comment
  const handlePostComment = async () => {
    if (!inspectingOrder || !newCommentText.trim()) return;
    setIsPostingComment(true);
    try {
      const res = await fetch("/api/orders/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: inspectingOrder.id,
          text: newCommentText.trim(),
          authorName: user?.displayName || "Studio Client",
          attachmentUrl: newCommentAttachmentUrl.trim() || undefined,
          attachmentName: newCommentAttachmentUrl.trim() ? "Reference Asset" : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setOrderComments((prev) => [...prev, data.comment]);
        }
        setNewCommentText("");
        setNewCommentAttachmentUrl("");
      }
    } catch (err: any) {
      alert(`Failed to post message: ${err.message}`);
    } finally {
      setIsPostingComment(false);
    }
  };

  // Sync comments when inspecting order changes
  useEffect(() => {
    if (inspectingOrder?.id) {
      loadOrderComments(inspectingOrder.id);
    }
  }, [inspectingOrder?.id, loadOrderComments]);

  // Synchronize client contact with user auth on change
  useEffect(() => {
    if (user) {
      setClientContact((prev) => ({
        ...prev,
        name: prev.name || user.displayName || "Studio Client",
        email: prev.email || user.email || "client@sutrastudio.com",
      }));
    }
  }, [user]);

  // Deep-link detection for package / service preselection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pkg = params.get("package") || params.get("tier");
      const srv = params.get("service");
      const isNew = params.get("new") === "true" || params.get("action") === "commission";

      if (pkg || srv || isNew) {
        if (srv) setInitialMasterService(srv);
        if (pkg) setInitialMasterTier(pkg);
        setIsMasterOrderModalOpen(true);
      }
    }
  }, []);

  // Load Catalogs from Firebase API
  const loadCatalogs = useCallback(async () => {
    setIsLoadingCatalogs(true);
    try {
      const res = await fetch("/api/orders?catalog=all");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.services) && data.services.length > 0) {
          setServicesCatalog(data.services);
        }
        if (Array.isArray(data.plans) && data.plans.length > 0) {
          setPlansCatalog(data.plans);
        }
      }
    } catch {
      // Fallback catalogs already set
    } finally {
      setIsLoadingCatalogs(false);
    }
  }, []);

  // Real-Time Firestore Listener / Poller for My Orders
  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingOrders(true);
    setOrdersError(null);
    try {
      const clientUid = user?.uid || (user?.email ? user.email : "");
      const res = await fetch(clientUid ? `/api/orders?clientUid=${encodeURIComponent(clientUid)}` : "/api/orders");
      if (!res.ok) {
        throw new Error("Failed to load orders");
      }
      const data = await res.json();
      if (Array.isArray(data.orders)) {
        // Map raw Firestore records to consistent OrderItem interface
        const mapped: OrderItem[] = data.orders.map((o: any) => ({
          id: o.id,
          code: o.code || `#ORD-${String(o.id).slice(-3)}`,
          orderNumber: o.orderNumber || o.code,
          title: o.title || o.service || "Studio Commission",
          service: o.service || "Creative Direction",
          status: o.status || "in_progress",
          statusLabel:
            o.statusLabel ||
            (o.status === "completed"
              ? "Approved & Vaulted"
              : o.status === "approved"
              ? "Approved — Finalizing Commission"
              : o.status === "delivered"
              ? "Result Delivered — Waiting for Your Approval"
              : o.status === "awaiting_approval"
              ? "Awaiting Client Approval"
              : o.status === "revision_requested"
              ? "Revision in Progress"
              : o.status === "pending_payment"
              ? "Pending Payment via Razorpay"
              : o.status === "paid"
              ? "Payment Verified — In Studio Queue"
              : o.status === "pending"
              ? "Pending Studio Confirmation"
              : "In Production"),
          deliverablePreview:
            o.deliverablePreview ||
            (o.requirements ? `Scope: ${o.requirements.slice(0, 100)}...` : "Studio production pipeline registered."),
          deliverables: o.deliverables || [],
          deliveredAt: o.deliveredAt,
          driveFolder: o.driveFolder || o.driveFolderId || "drive_fld_sutra_001/COMMISSIONS",
          driveFolderPath: o.driveFolderPath || "drive_fld_sutra_001/COMMISSIONS",
          revisionRound: o.revisionRound ?? 0,
          maxRevisions: o.maxRevisions ?? 2,
          updatedAt: o.updatedAt ? new Date(o.updatedAt).toLocaleDateString() : "Recently",
          createdAt: o.createdAt,
          notes: o.notes || o.requirements,
          requirements: o.requirements,
          type: o.type || "service",
          items: o.items || [],
          totalAmount: o.totalAmount,
          billingCycle: o.billingCycle,
          attachments: o.attachments || [],
          source: o.source || "dashboard",
          clientName: o.clientName,
          clientEmail: o.clientEmail,
          clientPhone: o.clientPhone,
          paymentStatus: o.paymentStatus || (o.status === "pending_payment" ? "unpaid" : "paid"),
          razorpayOrderId: o.razorpayOrderId,
          razorpayPaymentId: o.razorpayPaymentId,
          amountPaid: o.amountPaid,
          paidAt: o.paidAt,
          paymentMethod: o.paymentMethod,
          failureReason: o.failureReason,
          subscriptionId: o.subscriptionId,
          subscriptionStatus: o.subscriptionStatus,
          nextBillingDate: o.nextBillingDate,
          statusHistory: o.statusHistory || [
            {
              status: o.status || "in_progress",
              changedAt: o.createdAt || new Date().toISOString(),
              changedBy: o.source || "system",
              note: "Order created",
            },
          ],
        }));
        setOrders(mapped);
      }
    } catch {
      setOrdersError("Unable to connect to order pipeline. Check network or reload.");
    } finally {
      if (!silent) setIsLoadingOrders(false);
    }
  }, [user]);

  // Initial fetch and Real-Time Event Subscription
  useEffect(() => {
    loadOrders();
    loadCatalogs();

    // Set up Real-Time polling interval (every 5 seconds) to catch changes
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadOrders(true);
      }
    }, 5000);

    // Custom event listener for instant local sync across tabs/modals
    const handleOrderEvent = () => {
      loadOrders(true);
    };
    window.addEventListener("sutra_orders_changed", handleOrderEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener("sutra_orders_changed", handleOrderEvent);
    };
  }, [loadOrders, loadCatalogs]);

  // Load saved draft on mount
  const loadDraft = useCallback(async () => {
    try {
      const clientUid = user?.uid || "";
      if (!clientUid) return;
      const res = await fetch(`/api/orders/drafts?clientUid=${encodeURIComponent(clientUid)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.draft) {
          setSavedDraftData(data.draft);
          setHasSavedDraft(true);
        }
      }
    } catch {
      // Ignore draft loading error
    }
  }, [user]);

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  // Primary selected service calculation
  const primarySelectedServiceId = useMemo(() => {
    const found = Object.keys(selectedServices).find((k) => (selectedServices[k] || 0) > 0);
    return found || servicesCatalog[0]?.id || "img-creation";
  }, [selectedServices, servicesCatalog]);

  const activeServiceDetails = useMemo(() => {
    return (
      servicesCatalog.find((s) => s.id === primarySelectedServiceId) ||
      servicesCatalog[0] ||
      SEED_CATALOG_SERVICES[0]
    );
  }, [servicesCatalog, primarySelectedServiceId]);

  // Live price calculation for Individual Services
  const liveServicesTotal = useMemo(() => {
    let total = 0;
    for (const [srvId, qty] of Object.entries(selectedServices)) {
      if (qty > 0) {
        const item = servicesCatalog.find((s) => s.id === srvId);
        if (item) {
          const unitPrice = item.startingPrice ?? (item as any).price ?? 3499;
          total += unitPrice * qty;
        }
      }
    }
    return total;
  }, [selectedServices, servicesCatalog]);

  const selectedServicesCount = useMemo(() => {
    return Object.values(selectedServices).reduce((sum, q) => sum + (q > 0 ? q : 0), 0);
  }, [selectedServices]);

  // Live price calculation for Monthly Plan
  const selectedPlan = useMemo(() => {
    return plansCatalog.find((p) => p.id === selectedPlanId) || plansCatalog[0];
  }, [plansCatalog, selectedPlanId]);

  const livePlanTotal = useMemo(() => {
    if (!selectedPlan) return 0;
    const base = selectedPlan.monthlyPrice ?? selectedPlan.price ?? 14999;
    if (billingCycle === "quarterly") {
      return Math.round(base * 3 * 0.9); // 10% savings
    }
    if (billingCycle === "annual") {
      return Math.round(base * 12 * 0.8); // 20% savings
    }
    return base;
  }, [selectedPlan, billingCycle]);

  // Tab Filtering Computations (Active vs History)
  const activeOrders = useMemo(() => {
    return orders.filter((o) =>
      [
        "pending_payment",
        "paid",
        "brief_review",
        "in_production",
        "in_progress",
        "draft_delivered",
        "awaiting_approval",
        "delivered",
        "revision_requested",
        "pending",
        "confirmed",
        "on_hold",
        "trial",
        "active",
      ].includes(o.status)
    );
  }, [orders]);

  const historyOrders = useMemo(() => {
    return orders.filter((o) =>
      ["completed", "approved", "cancelled", "refunded", "closed", "expired"].includes(o.status)
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (activeFilterTab === "active") return activeOrders;
    if (activeFilterTab === "history") return historyOrders;
    return orders;
  }, [activeFilterTab, activeOrders, historyOrders, orders]);

  // Manual Save Draft to Firebase (Triggered on-demand when client clicks 'Save Draft' or advances flow)
  const isSavingDraftRef = useRef(false);
  const saveDraftToCloud = useCallback(
    async (silent = false) => {
      try {
        const clientUid = user?.uid || "";
        if (!clientUid || isSavingDraftRef.current) return;
        isSavingDraftRef.current = true;
        if (!silent) setDraftStatus("Saving draft...");

        await fetch("/api/orders/drafts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientUid,
            orderType,
            selectedServices,
            selectedPlanId,
            billingCycle,
            commissionTitle,
            requirements,
            briefAnswers,
            preferredTimeline,
            targetKickoffDate,
            clientContact,
            driveLink,
            uploadedFiles,
          }),
        });
        setHasSavedDraft(true);
        if (!silent) {
          setDraftStatus("Draft saved");
          setTimeout(() => setDraftStatus(""), 2000);
        }
      } catch {
        if (!silent) {
          setDraftStatus("Save failed");
          setTimeout(() => setDraftStatus(""), 2000);
        }
      } finally {
        isSavingDraftRef.current = false;
      }
    },
    [
      user?.uid,
      orderType,
      selectedServices,
      selectedPlanId,
      billingCycle,
      commissionTitle,
      requirements,
      briefAnswers,
      preferredTimeline,
      targetKickoffDate,
      clientContact,
      driveLink,
      uploadedFiles,
    ]
  );

  // Handle toggling / selecting an individual service
  const handleToggleService = (srvId: string) => {
    setSelectedServices((prev) => {
      const copy = { ...prev };
      if (copy[srvId]) {
        delete copy[srvId];
      } else {
        copy[srvId] = 1;
      }
      return copy;
    });
  };

  const handleUpdateQuantity = (srvId: string, delta: number) => {
    setSelectedServices((prev) => {
      const current = prev[srvId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[srvId];
        return copy;
      }
      return { ...prev, [srvId]: Math.min(next, 50) };
    });
  };

  // Open New Order Flow from Scratch (Launches Master Order Form)
  const handleOpenNewOrder = () => {
    setIsMasterOrderModalOpen(true);
  };

  const handleOpenLegacyWizard = () => {
    setFlowStep("choose_type");
    setSelectedServices({ "img-creation": 1 });
    setSelectedPlanId("studio-growth");
    setBillingCycle("monthly");
    setCommissionTitle("");
    setRequirements("");
    setBriefAnswers({});
    setTargetKickoffDate("");
    setSubmitError(null);
    setCreatedOrderResult(null);
    setIsNewOrderOpen(true);
  };

  // Resume Existing Draft from Firebase
  const handleResumeDraft = () => {
    if (!savedDraftData) return;
    setOrderType(savedDraftData.orderType || "service");
    setSelectedServices(
      savedDraftData.selectedServices && Object.keys(savedDraftData.selectedServices).length > 0
        ? savedDraftData.selectedServices
        : { "img-creation": 1 }
    );
    setSelectedPlanId(savedDraftData.selectedPlanId || "studio-growth");
    setBillingCycle(savedDraftData.billingCycle || "monthly");
    setCommissionTitle(savedDraftData.commissionTitle || "");
    setRequirements(savedDraftData.requirements || "");
    setBriefAnswers(savedDraftData.briefAnswers || {});
    setPreferredTimeline(savedDraftData.preferredTimeline || "Standard Studio SLA (48-72h)");
    setTargetKickoffDate(savedDraftData.targetKickoffDate || "");
    if (savedDraftData.clientContact) {
      setClientContact(savedDraftData.clientContact);
    }
    setDriveLink(savedDraftData.driveLink || "");
    setUploadedFiles(savedDraftData.uploadedFiles || []);

    if (savedDraftData.orderType === "service") {
      setFlowStep("service_details");
    } else {
      setFlowStep("plan_details");
    }
    setIsNewOrderOpen(true);
  };

  // Stage brief attachments for upload once the order exists on the server
  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const list = Array.from(files);
      const newItems = list.map((f) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      }));
      setUploadedFiles((prev) => [...prev, ...newItems]);
      setStagedFileBlobs((prev) => [...prev, ...list]);
    }
    // Allow the same file to be picked again after a failed upload.
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    const target = uploadedFiles[index];
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setStagedFileBlobs((prev) => {
      if (!target || prev.length === 0) return prev;
      const matchAt = prev.findIndex(
        (f) => f.name === target.name && `${(f.size / (1024 * 1024)).toFixed(1)} MB` === target.size
      );
      return matchAt === -1 ? prev : prev.filter((_, i) => i !== matchAt);
    });
  };

  /**
   * Push staged brief attachments into the order's "01 Client Assets" folder.
   * Runs right after the order exists and BEFORE Razorpay opens, so a rejected
   * file is reported instead of silently dropped. Briefs are capped at 50 MB
   * each / 200 MB total by DEFAULT_CONTENT_POLICY, so this is seconds of work.
   * Returns an error message, or null when everything landed.
   */
  const uploadStagedAttachments = async (orderId: string): Promise<string | null> => {
    if (stagedFileBlobs.length === 0) return null;
    setIsUploadingAttachments(true);
    try {
      for (const meta of uploadedFiles) {
        const key = `${meta.name}::${meta.size}`;
        if (stagedUploadStatus[key]?.driveFileId) continue;

        const blob = stagedFileBlobs.find(
          (f) => f.name === meta.name && `${(f.size / (1024 * 1024)).toFixed(1)} MB` === meta.size
        );
        if (!blob) continue;

        setStagedUploadStatus((s) => ({ ...s, [key]: { phase: "opening", percent: 0 } }));
        try {
          const file = await uploadFileToDrive(blob, {
            orderId,
            kind: "client_assets",
            notes: `Client brief attachment for ${commissionTitle.trim() || "new commission"}`,
            onProgress: (p) =>
              setStagedUploadStatus((s) => ({ ...s, [key]: { phase: p.phase, percent: p.percent } })),
          });
          setStagedUploadStatus((s) => ({
            ...s,
            [key]: { phase: "done", percent: 100, driveFileId: file.driveFileId },
          }));
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Upload failed.";
          setStagedUploadStatus((s) => ({ ...s, [key]: { phase: "error", percent: 0, error: message } }));
          return message;
        }
      }
      return null;
    } finally {
      setIsUploadingAttachments(false);
    }
  };

  // Submit New Order with DOUBLE-SUBMIT PROTECTION & OPTIONAL DIRECT INVOICE / RAZORPAY FLOW
  const handleSubmitNewOrder = async (directSubmit: boolean = true) => {
    if (isSubmittingOrder) return; // Prevent double-submit

    setIsSubmittingOrder(true);
    setSubmitError(null);

    try {
      const effectiveClientUid = user?.uid || (user?.email ? user.email : (clientContact.email ? clientContact.email : "usr_client_001"));
      const payload: any = {
        type: orderType,
        clientUid: effectiveClientUid,
        clientId: effectiveClientUid,
        clientName: clientContact.name || user?.displayName || "Studio Client",
        clientEmail: clientContact.email || user?.email || "client@sutrastudio.com",
        clientPhone: clientContact.phone || "",
        requirements,
        attachments: [
          ...uploadedFiles.map((f) => ({ name: f.name, size: f.size })),
          ...(driveLink ? [{ name: "External Vault Drive Folder", url: driveLink }] : []),
        ],
        source: "dashboard",
        driveFolderId: profile?.driveFolderId || "",
        skipPayment: directSubmit,
        paymentMethod: directSubmit ? "invoice" : "razorpay_checkout",
      };

      if (orderType === "service") {
        const items = Object.entries(selectedServices)
          .filter(([, qty]) => qty > 0)
          .map(([serviceId, quantity]) => ({
            serviceId,
            quantity,
          }));

        if (items.length === 0) {
          setSubmitError("Please select at least one creative service.");
          setIsSubmittingOrder(false);
          return;
        }

        payload.title = commissionTitle.trim() || undefined;
        payload.items = items;
        payload.preferredTimeline = preferredTimeline;
      } else {
        payload.planId = selectedPlanId;
        payload.billingCycle = billingCycle;
        payload.title = commissionTitle.trim() || `${selectedPlan?.name || "Studio Retainer"} Package`;
        payload.targetKickoffDate = targetKickoffDate || undefined;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create order on server.");
      }

      // Clear draft upon successful creation
      try {
        const clientUid = user?.uid || "";
        if (clientUid) {
          fetch(`/api/orders/drafts?clientUid=${encodeURIComponent(clientUid)}`, {
            method: "DELETE",
          });
        }
        setHasSavedDraft(false);
        setSavedDraftData(null);
      } catch {
        // Ignore
      }

      // Order registered on server
      const newOrderCreated: OrderItem = {
        id: data.order.id,
        code: data.order.code || `#ORD-${String(data.order.id).slice(-3)}`,
        orderNumber: data.order.orderNumber || data.order.code,
        title: data.order.title,
        service: data.order.service,
        status: data.order.status || (directSubmit ? "confirmed" : "pending_payment"),
        statusLabel: data.order.statusLabel || (directSubmit ? "Confirmed — In Studio Production Queue" : "Pending Payment"),
        deliverablePreview: data.order.deliverablePreview || "Brief registered in studio queue. Pending admin workflow review.",
        driveFolder: data.order.driveFolderId || "drive_fld_sutra_001/COMMISSIONS",
        driveFolderPath: data.order.driveFolderPath || "drive_fld_sutra_001/COMMISSIONS",
        revisionRound: 0,
        maxRevisions: 2,
        updatedAt: "Just now",
        createdAt: data.order.createdAt,
        requirements: data.order.requirements,
        notes: data.order.requirements,
        type: data.order.type,
        items: data.order.items,
        totalAmount: data.order.totalAmount,
        billingCycle: data.order.billingCycle,
        attachments: data.order.attachments,
        source: "dashboard",
        clientName: data.order.clientName,
        clientEmail: data.order.clientEmail,
        clientPhone: data.order.clientPhone,
        paymentStatus: data.order.paymentStatus || (directSubmit ? "unpaid" : "unpaid"),
        razorpayOrderId: data.razorpay?.orderId,
        subscriptionId: data.order.subscriptionId,
        statusHistory: data.order.statusHistory || [
          {
            status: data.order.status || "confirmed",
            changedAt: new Date().toISOString(),
            changedBy: "client",
            note: directSubmit
              ? "Commission brief registered (Pay on Invoice / Direct Placement)."
              : "Order placed. Ready for Razorpay payment.",
          },
        ],
      };

      setOrders((prev) => [newOrderCreated, ...prev.filter((o) => o.id !== newOrderCreated.id)]);

      // Land staged briefs in the order's Drive folder
      if (stagedFileBlobs.length > 0) {
        const attachmentError = await uploadStagedAttachments(data.order.id);
        if (attachmentError) {
          setSubmitError(
            `Order registered, but an attachment could not be uploaded: ${attachmentError} You can re-send it from the order page.`
          );
        }
      }

      // If online Razorpay checkout requested and orderId returned
      if (!directSubmit && data.razorpay && data.razorpay.orderId) {
        await openRazorpayCheckout({
          key: data.razorpay.keyId,
          amount: data.razorpay.amountInPaise,
          currency: data.razorpay.currency || "INR",
          name: "Sutra Studio",
          description: `${newOrderCreated.title} (${newOrderCreated.orderNumber})`,
          order_id: data.razorpay.orderId,
          prefill: {
            name: clientContact.name,
            email: clientContact.email,
            contact: clientContact.phone,
          },
          theme: {
            color: "#5C3A1E",
          },
          onSuccess: async (rzpRes) => {
            try {
              const verifyRes = await fetch("/api/payments/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  orderId: data.order.id,
                  razorpay_order_id: rzpRes.razorpay_order_id,
                  razorpay_payment_id: rzpRes.razorpay_payment_id,
                  razorpay_signature: rzpRes.razorpay_signature,
                  paymentMethod: "razorpay_checkout",
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                const verifiedOrder: OrderItem = {
                  ...newOrderCreated,
                  status: "paid",
                  statusLabel: "Payment Verified — In Studio Queue",
                  paymentStatus: "paid",
                  razorpayOrderId: rzpRes.razorpay_order_id,
                  razorpayPaymentId: rzpRes.razorpay_payment_id,
                  amountPaid: data.order.totalAmount,
                  paidAt: new Date().toISOString(),
                };
                setCreatedOrderResult(verifiedOrder);
                setOrders((prev) => [verifiedOrder, ...prev.filter((o) => o.id !== verifiedOrder.id)]);
                setFlowStep("success");
                window.dispatchEvent(new CustomEvent("sutra_orders_changed"));
              } else {
                setCreatedOrderResult(newOrderCreated);
                setFlowStep("success");
              }
            } catch {
              setCreatedOrderResult(newOrderCreated);
              setFlowStep("success");
            }
          },
          onDismiss: () => {
            // Unblock on dismiss: Show confirmed success screen with invoice details
            setCreatedOrderResult(newOrderCreated);
            setFlowStep("success");
            window.dispatchEvent(new CustomEvent("sutra_orders_changed"));
          },
          onFailure: (rzpErr) => {
            setCreatedOrderResult(newOrderCreated);
            setFlowStep("success");
            window.dispatchEvent(new CustomEvent("sutra_orders_changed"));
          },
        });
      } else {
        setCreatedOrderResult(newOrderCreated);
        setFlowStep("success");
      }

      soundSystem.play("order_success");
      window.dispatchEvent(new CustomEvent("sutra_orders_changed"));
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred while placing your order.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Retry Razorpay Payment for any Unpaid / Pending Commission
  const handleRetryPayment = async (order: OrderItem) => {
    setRetryingOrderId(order.id);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          amountINR: order.totalAmount,
          customerEmail: order.clientEmail || user?.email,
          description: order.title,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.razorpayOrderId) {
        throw new Error(data.error || "Failed to initialize Razorpay checkout intent.");
      }

      await openRazorpayCheckout({
        key: data.keyId,
        amount: data.amountInPaise,
        currency: data.currency || "INR",
        name: "Sutra Studio",
        description: `${order.title} (${order.orderNumber || order.code})`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: order.clientName || user?.displayName || "Studio Client",
          email: order.clientEmail || user?.email || "client@sutrastudio.com",
          contact: order.clientPhone || "",
        },
        theme: {
          color: "#5C3A1E",
        },
        onSuccess: async (rzpRes) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: order.id,
                razorpay_order_id: rzpRes.razorpay_order_id,
                razorpay_payment_id: rzpRes.razorpay_payment_id,
                razorpay_signature: rzpRes.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setOrders((prev) =>
                prev.map((o) =>
                  o.id === order.id
                    ? {
                        ...o,
                        status: "paid",
                        statusLabel: "Payment Verified — In Studio Queue",
                        paymentStatus: "paid",
                        razorpayOrderId: rzpRes.razorpay_order_id,
                        razorpayPaymentId: rzpRes.razorpay_payment_id,
                        amountPaid: order.totalAmount,
                        paidAt: new Date().toISOString(),
                      }
                    : o
                )
              );
              window.dispatchEvent(new CustomEvent("sutra_orders_changed"));
            }
          } catch (vErr) {
            console.error("Retry verification error:", vErr);
          }
        },
        onFailure: (err) => {
          alert(`Payment attempt unsuccessful: ${err.description || err.reason}`);
        },
      });
    } catch (err: any) {
      alert(`Unable to open Razorpay checkout: ${err.message}`);
    } finally {
      setRetryingOrderId(null);
    }
  };

  // Client Cancellation of Monthly Subscription or Free Trial
  const handleCancelPlan = async (orderId: string, isTrial?: boolean) => {
    const confirmMsg = isTrial
      ? "Are you sure you wish to cancel your 3-Day Free Trial? No charge will be incurred."
      : "Are you sure you wish to cancel this recurring monthly studio retainer? Access remains active until the end of your billing cycle.";

    if (!(await confirm({ title: "Cancel Plan", description: confirmMsg, isDangerous: true }))) return;

    try {
      const res = await fetch("/api/payments/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          isTrialCancel: Boolean(isTrial),
        }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: isTrial ? "cancelled" : o.status,
                  statusLabel: isTrial ? "Free Trial Cancelled" : o.statusLabel,
                  subscriptionStatus: "cancelled",
                  autoRenew: false,
                }
              : o
          )
        );
        window.dispatchEvent(new CustomEvent("sutra_orders_changed"));
      }
    } catch {
      alert("Failed to cancel subscription. Please contact your Art Director.");
    }
  };

  // Client Renewal of Monthly Subscription
  const handleRenewSubscription = async (order: OrderItem) => {
    setRetryingOrderId(order.id);
    try {
      const res = await fetch("/api/payments/renew", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: order.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize renewal.");

      await openRazorpayCheckout({
        order_id: data.razorpay.orderId,
        amount: data.razorpay.amountInPaise,
        currency: data.razorpay.currency,
        key: data.razorpay.keyId,
        name: "SUTRA STUDIO",
        description: `Monthly Renewal: ${order.title}`,
        prefill: {
          name: clientContact.name || user?.displayName || "Studio Client",
          email: clientContact.email || user?.email || "client@sutrastudio.com",
          contact: clientContact.phone || "",
        },
        onSuccess: async (rzpRes) => {
          try {
            await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: order.id,
                razorpay_order_id: rzpRes.razorpay_order_id,
                razorpay_payment_id: rzpRes.razorpay_payment_id,
                razorpay_signature: rzpRes.razorpay_signature,
              }),
            });
            window.dispatchEvent(new CustomEvent("sutra_orders_changed"));
          } catch (vErr) {
            console.error("Renewal verification error:", vErr);
          }
        },
        onFailure: (err) => {
          alert(`Renewal payment unsuccessful: ${err.description || err.reason}`);
        },
      });
    } catch (err: any) {
      alert(`Unable to open Razorpay checkout for renewal: ${err.message}`);
    } finally {
      setRetryingOrderId(null);
    }
  };

  // Deliverable 1-Click Approval Workflow connected to backend
  const handleApproveDeliverable = async (orderId: string) => {
    setIsSubmittingOrder(true);
    try {
      const res = await fetch("/api/orders/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          action: "approve",
          clientName: user?.displayName || "Studio Client",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Approval failed.");
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: "completed",
                statusLabel: "Approved & Vaulted",
                statusHistory: data.order?.statusHistory || [
                  ...(o.statusHistory || []),
                  {
                    status: "completed",
                    changedAt: new Date().toISOString(),
                    changedBy: user?.displayName || "client",
                    note: "Deliverables approved by client. Final master vaulted to Sutra Cloud Vault.",
                  },
                ],
              }
            : o
        )
      );
      setFeedbackSuccess(
        "Deliverable approved! High-resolution masters have been finalized in your Sutra Cloud Vault."
      );
      window.dispatchEvent(new Event("sutra_orders_changed"));
      setTimeout(() => {
        setInspectingOrder(null);
        setFeedbackSuccess("");
      }, 1500);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Structured Revision Request with 24-hr turnaround SLA connected to backend
  const handleRequestRevision = async (orderId: string) => {
    if (!revisionNotes?.trim()) {
      alert("Please enter revision details or specific changes required.");
      return;
    }
    setIsSubmittingOrder(true);
    try {
      const res = await fetch("/api/orders/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          action: "revision",
          comment: revisionNotes,
          clientName: user?.displayName || "Studio Client",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Revision request failed.");
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: "revision_requested",
                statusLabel: "Revision in Progress",
                revisionRound: (o.revisionRound || 0) + 1,
                notes: revisionNotes,
                statusHistory: data.order?.statusHistory || [
                  ...(o.statusHistory || []),
                  {
                    status: "revision_requested",
                    changedAt: new Date().toISOString(),
                    changedBy: user?.displayName || "client",
                    note: `Client Revision Pass: ${revisionNotes}`,
                  },
                ],
              }
            : o
        )
      );
      setFeedbackSuccess(
        `Revision request submitted to Art Director. Estimated turnaround: 24 hours.`
      );
      window.dispatchEvent(new Event("sutra_orders_changed"));
      setTimeout(() => {
        setIsRevisionMode(false);
        setRevisionNotes("");
        setInspectingOrder(null);
        setFeedbackSuccess("");
      }, 1500);
    } catch (err: any) {
      alert(`Revision request error: ${err.message}`);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Helper to render status badge with semantic styling
  const renderStatusBadge = (status: OrderItem["status"], label: string) => {
    let badgeVariant: "gold" | "completed" | "progress" | "neutral" = "neutral";
    let customClasses = "bg-[#FAF9F5] text-[#5C3A1E] border-[#EADFCB]";

    if (status === "completed" || status === "paid" || status === "approved") {
      badgeVariant = "completed";
      customClasses = "bg-[#EDF7F0] text-[#1B663E] border-[#C8E7D2]";
    } else if (status === "delivered" || status === "awaiting_approval") {
      badgeVariant = "gold";
      customClasses = "bg-[#FFF9EE] text-[#8C6D23] border-[#E7D6A7]";
    } else if (status === "in_progress") {
      badgeVariant = "progress";
      customClasses = "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]";
    } else if (status === "revision_requested") {
      badgeVariant = "progress";
      customClasses = "bg-[#FAF5FF] text-[#6B21A8] border-[#E9D5FF]";
    } else if (status === "pending" || status === "pending_payment") {
      badgeVariant = "gold";
      customClasses = "bg-[#FFFDF0] text-[#9A6700] border-[#F1E0A6]";
    } else if (status === "cancelled") {
      customClasses = "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]";
    }

    return (
      <Badge variant={badgeVariant} size="sm" className={customClasses}>
        {label}
      </Badge>
    );
  };

  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <PortalSidebar />

        <main id="main-content" className="flex-1 p-4 sm:p-8 lg:p-10 max-w-6xl pb-24 md:pb-12 space-y-8">
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
                Track creative workflows, review draft deliverables, and place verified commissions.
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A] hover:bg-[#F4EFE6] transition-all shadow-xs touch-target min-h-[36px]"
                title="Go to Public Website"
              >
                <Globe className="w-3.5 h-3.5 text-[#D4A35A]" />
                <span>View Website</span>
              </Link>

              <NotificationBell />

              {/* Primary New Order CTA */}
              <button
                type="button"
                onClick={handleOpenNewOrder}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5C3A1E] hover:bg-[#432A15] text-white text-xs font-semibold shadow-xs hover:shadow-warm transition-all cursor-pointer touch-target min-h-[36px]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Order</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              ORDERS & APPROVALS LIST VIEW
              ======================================================== */}
          <div className="space-y-6">
            {/* Resume Draft Banner if client has an unfinished draft */}
            {hasSavedDraft && savedDraftData && (
              <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#D4A35A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-[#5C3A1E] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[#A98B57]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C3A1E]">
                      Unfinished Commission Draft Available
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      You have an active draft for{" "}
                      <strong>
                        {savedDraftData.orderType === "service"
                          ? "Individual Services"
                          : "Monthly Retainer"}
                      </strong>{" "}
                      saved to cloud.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleResumeDraft}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Resume Draft
                  </Button>
                  <button
                    type="button"
                    onClick={async () => {
                      setHasSavedDraft(false);
                      setSavedDraftData(null);
                      const clientUid = user?.uid || "";
                      if (clientUid) {
                        await fetch(
                          `/api/orders/drafts?clientUid=${encodeURIComponent(clientUid)}`,
                          { method: "DELETE" }
                        );
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Approval Notice Banner if any orders need approval */}
            {orders.some((o) => o.status === "delivered" || o.status === "awaiting_approval") && (
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
                      Inspect render passes below to approve for final Sutra Cloud Vault release or request revisions.
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const pending = orders.find((o) => o.status === "delivered" || o.status === "awaiting_approval");
                    if (pending) setInspectingOrder(pending);
                  }}
                >
                  Review Deliverable
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoadingOrders && (
              <div className="p-12 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] text-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-[#5C3A1E] mx-auto" />
                <p className="text-xs font-medium text-[#64748B]">
                  Connecting to real-time studio database...
                </p>
              </div>
            )}

            {/* Error State */}
            {!isLoadingOrders && ordersError && (
              <div className="p-6 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#991B1B] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>{ordersError}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => loadOrders()}>
                  Retry
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingOrders && !ordersError && orders.length === 0 && (
              <div className="p-12 sm:p-16 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] text-center space-y-4 max-w-xl mx-auto shadow-xs">
                <div className="w-14 h-14 rounded-full bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-center mx-auto text-[#5C3A1E]">
                  <FileCheck className="w-7 h-7 text-[#A98B57]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                    No Active Commissions
                  </h3>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
                    You have not placed any orders yet. Tap below to commission individual creative services or activate a monthly retainer package.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleOpenNewOrder}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Commission New Order
                </Button>
              </div>
            )}

            {/* Tab Pill Switcher (Active Orders vs Order History vs All) */}
            {!isLoadingOrders && orders.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-2xs overflow-x-auto no-scrollbar">
                  {[
                    { id: "active", label: `Active Orders (${activeOrders.length})` },
                    { id: "history", label: `Order History & Vault (${historyOrders.length})` },
                    { id: "all", label: `All Commissions (${orders.length})` },
                  ].map((tab) => {
                    const isActive = activeFilterTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveFilterTab(tab.id as any)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                          isActive
                            ? "bg-[#5C3A1E] text-white shadow-xs"
                            : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF9F5]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <span className="text-[11px] text-[#64748B] font-mono">
                  Showing {filteredOrders.length} of {orders.length} orders
                </span>
              </div>
            )}

            {/* Empty State for Filtered Tab */}
            {!isLoadingOrders && !ordersError && filteredOrders.length === 0 && orders.length > 0 && (
              <div className="p-12 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] text-center space-y-3">
                <FileCheck className="w-8 h-8 text-[#A98B57] mx-auto opacity-70" />
                <h4 className="font-serif font-bold text-base text-[#0F172A]">
                  No {activeFilterTab === "active" ? "Active" : "Archived"} Orders
                </h4>
                <p className="text-xs text-[#64748B]">
                  {activeFilterTab === "active"
                    ? "All your orders have been approved and completed."
                    : "No completed or archived commissions in your vault yet."}
                </p>
                <Button variant="secondary" size="sm" onClick={() => setActiveFilterTab("all")}>
                  View All Orders
                </Button>
              </div>
            )}

            {/* Orders List Cards with Real-time Progress Bar */}
            {!isLoadingOrders && filteredOrders.length > 0 && (
              <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] divide-y divide-[#EADFCB]/60 shadow-xs overflow-hidden">
                {filteredOrders.map((ord) => {
                  const prog = computeOrderProgress(ord);
                  const isDeliveredOrReview =
                    ord.status === "delivered" ||
                    ord.status === "draft_delivered" ||
                    ord.status === "awaiting_approval";

                  return (
                    <div
                      key={ord.id}
                      onClick={() => {
                        setInspectingOrder(ord);
                        setIsRevisionMode(false);
                      }}
                      className="p-5 sm:p-6 flex flex-col gap-4 hover:bg-[#FAF9F5]/80 transition-colors cursor-pointer"
                    >
                      {/* Top Row: Meta, Code, Badges & Price */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#5C3A1E]">
                              {ord.orderNumber || ord.code}
                            </span>
                            {renderStatusBadge(ord.status, ord.statusLabel)}
                            {ord.paymentStatus === "paid" && (
                              <Badge variant="completed" size="sm" className="bg-[#EDF7F0] text-[#1B663E] border-[#C8E7D2]">
                                Paid
                              </Badge>
                            )}
                            {(ord.paymentStatus === "unpaid" || ord.status === "pending_payment") && (
                              <Badge variant="gold" size="sm" className="bg-[#FFFDF0] text-[#9A6700] border-[#F1E0A6]">
                                Payment Pending
                              </Badge>
                            )}
                            {ord.paymentStatus === "refunded" && (
                              <Badge variant="progress" size="sm" className="bg-[#FAF5FF] text-[#6B21A8] border-[#E9D5FF]">
                                Refunded
                              </Badge>
                            )}
                            <span className="text-xs text-[#94A3B8]">
                              • {ord.type === "monthly_plan" ? "Monthly Retainer" : ord.service}
                            </span>
                            {ord.type === "service" && (
                              <span className="text-[11px] font-medium text-[#64748B] bg-[#F8F5EF] px-2 py-0.5 rounded-full border border-[#EADFCB]">
                                Round {ord.revisionRound} of {ord.maxRevisions} Revisions
                              </span>
                            )}
                          </div>

                          <h3 className="font-serif text-lg font-semibold text-[#0F172A]">
                            {ord.title}
                          </h3>

                          <p className="text-xs text-[#64748B] leading-relaxed max-w-3xl line-clamp-2">
                            {ord.deliverablePreview}
                          </p>
                        </div>

                        {/* Price & Timestamp */}
                        <div className="text-left lg:text-right shrink-0">
                          {ord.totalAmount !== undefined && (
                            <div className="font-serif font-bold text-lg text-[#5C3A1E]">
                              ₹{ord.totalAmount.toLocaleString("en-IN")}
                            </div>
                          )}
                          <span className="text-[11px] text-[#94A3B8]">
                            Updated {ord.updatedAt}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Progress Tracker Bar (Reaches exactly 100% on Completed/Approved) */}
                      <div className="space-y-1.5 p-3 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB]/80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#5C3A1E] flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                prog.isComplete
                                  ? "bg-[#16A34A]"
                                  : prog.statusCategory === "paused"
                                  ? "bg-[#D97706]"
                                  : "bg-[#D4A35A] animate-pulse"
                              }`}
                            />
                            <span>Stage: <strong>{prog.stageLabel}</strong></span>
                          </span>
                          <span className="font-mono font-bold text-xs text-[#0F172A]">
                            {prog.percentage}% Complete
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full bg-[#EADFCB]/60 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              prog.percentage === 100
                                ? "bg-[#16A34A]"
                                : prog.statusCategory === "paused"
                                ? "bg-[#D97706]"
                                : prog.statusCategory === "cancelled"
                                ? "bg-[#DC2626]"
                                : "bg-[#D4A35A]"
                            }`}
                            style={{ width: `${Math.max(prog.percentage, 5)}%` }}
                          />
                        </div>

                        {/* Monthly Retainer Cycle Progress & Days Remaining */}
                        {ord.type === "monthly_plan" && prog.daysRemaining !== undefined && (
                          <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-0.5">
                            <span>
                              Billing Cycle: {ord.currentPeriodStart ? new Date(ord.currentPeriodStart).toLocaleDateString() : "Active"} &rarr;{" "}
                              {ord.currentPeriodEnd ? new Date(ord.currentPeriodEnd).toLocaleDateString() : "Renewal"}
                            </span>
                            <span className="font-bold text-[#5C3A1E] bg-[#FFFDF9] px-2 py-0.5 rounded-md border border-[#EADFCB]">
                              {prog.daysRemaining} days remaining in cycle
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Row: Vault Sync, Razorpay ID & Action Buttons */}
                      <div
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748B]">
                          <span className="flex items-center gap-1 text-[#5C3A1E] font-medium">
                            <HardDrive className="w-3.5 h-3.5 text-[#A98B57]" />
                            <span>Vault: {ord.driveFolder}</span>
                          </span>
                          {ord.razorpayPaymentId && (
                            <span className="font-mono text-[10px] text-[#94A3B8]">
                              ID: {ord.razorpayPaymentId}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Pay Now for Unpaid */}
                          {(ord.status === "pending_payment" || ord.paymentStatus === "unpaid") && (
                            <>
                              <button
                                type="button"
                                onClick={() => setPaymentModalOrder(ord)}
                                className="px-3 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#2E7D4F] text-xs font-semibold text-[#2E7D4F] hover:bg-[#F0FDF4] transition-all cursor-pointer flex items-center gap-1.5 min-h-[36px]"
                                title="Scan & Pay via Google Pay / PhonePe (0% Fee)"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>Zero-Fee UPI</span>
                              </button>

                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleRetryPayment(ord)}
                                isLoading={retryingOrderId === ord.id}
                                disabled={retryingOrderId !== null}
                                leftIcon={<Lock className="w-3.5 h-3.5 text-[#EADFCB]" />}
                              >
                                Pay Online
                              </Button>
                            </>
                          )}

                          {/* Official Receipt */}
                          {ord.paymentStatus === "paid" && (
                            <button
                              type="button"
                              onClick={() => {
                                setReceiptOrder({
                                  ...ord,
                                  orderNumber: ord.orderNumber || ord.code || ord.id,
                                });
                                setIsReceiptOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A] hover:bg-[#F8F5EF] transition-all cursor-pointer flex items-center gap-1.5 min-h-[36px]"
                              title="View & Print Official Receipt"
                            >
                              <Receipt className="w-3.5 h-3.5 text-[#A98B57]" />
                              <span>Receipt</span>
                            </button>
                          )}

                          {/* Review Draft / Result */}
                          {isDeliveredOrReview && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setInspectingOrder(ord);
                                setActiveModalTab("deliverables");
                                setIsRevisionMode(false);
                              }}
                              leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#EADFCB]" />}
                            >
                              Review Draft
                            </Button>
                          )}

                          {/* Cancel Trial / Auto-Renew */}
                          {ord.type === "monthly_plan" && ord.subscriptionStatus === "trial" && (
                            <button
                              type="button"
                              onClick={() => handleCancelPlan(ord.id, true)}
                              className="px-2.5 py-1.5 rounded-xl text-xs text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer font-semibold"
                              title="Cancel 3-day free trial with zero charge"
                            >
                              Cancel Trial
                            </button>
                          )}

                          {ord.type === "monthly_plan" && ord.subscriptionStatus === "active" && (
                            <button
                              type="button"
                              onClick={() => handleCancelPlan(ord.id, false)}
                              className="px-2.5 py-1.5 rounded-xl text-xs text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                              title="Cancel recurring auto-renewal"
                            >
                              Cancel Auto-Renew
                            </button>
                          )}

                          {ord.type === "monthly_plan" &&
                            (ord.status === "cancelled" ||
                              ord.subscriptionStatus === "cancelled" ||
                              ord.subscriptionStatus === "expired" ||
                              ord.status === "closed") && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleRenewSubscription(ord)}
                                isLoading={retryingOrderId === ord.id}
                                leftIcon={<RotateCcw className="w-3.5 h-3.5 text-[#EADFCB]" />}
                              >
                                Renew Retainer
                              </Button>
                            )}

                          {/* Inspect & Details */}
                          <button
                            type="button"
                            onClick={() => {
                              setInspectingOrder(ord);
                              setActiveModalTab("scope");
                              setIsRevisionMode(false);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A] hover:bg-[#FFFDF9] transition-all cursor-pointer flex items-center gap-1.5 min-h-[36px]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          {/* Completed Vault Master */}
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        <MobileBottomNav />

        {/* ========================================================
            NEW ORDER COMMISSION FLOW (MODAL / MOBILE BOTTOM-SHEET)
            ======================================================== */}
        <Modal
          isOpen={isNewOrderOpen}
          onClose={() => setIsNewOrderOpen(false)}
          title={
            flowStep === "choose_type"
              ? "New Studio Commission"
              : flowStep === "services_select"
              ? "Select Individual Services"
              : flowStep === "plan_select"
              ? "Select Monthly Retainer Plan"
              : flowStep === "service_details" || flowStep === "plan_details"
              ? "Commission Brief & Details"
              : flowStep === "review_confirm"
              ? "Review & Confirm Order"
              : "Order Confirmation"
          }
          description="Crafted with pure traditional craftsmanship and computational precision."
          maxWidth="xl"
          variant="auto"
        >
          <div className="space-y-6 pt-1">
            {/* STEP 1: CHOOSE PATH (INDIVIDUAL SERVICES vs MONTHLY PLAN) */}
            {flowStep === "choose_type" && (
              <div className="space-y-4">
                <div className="text-center max-w-md mx-auto space-y-1">
                  <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                    Select Your Commission Structure
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Choose between booking standalone creative services or subscribing to an ongoing monthly creative capacity.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Option A: Individual Services */}
                  <div
                    onClick={() => {
                      setOrderType("service");
                      setFlowStep("services_select");
                    }}
                    className="group p-5 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] hover:border-[#D4A35A] hover:shadow-warm transition-all cursor-pointer flex flex-col justify-between space-y-4 text-left"
                  >
                    <div className="space-y-3">
                      <div className="w-11 h-11 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-[#5C3A1E] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Layers className="w-5 h-5 text-[#A98B57]" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-semibold text-[#A98B57] uppercase tracking-wider mb-1.5">
                          <span>Bespoke Multi-Select</span>
                        </div>
                        <h4 className="font-serif text-base font-semibold text-[#0F172A] group-hover:text-[#5C3A1E] transition-colors">
                          Individual Services
                        </h4>
                        <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                          Order one or more specialized studio disciplines (3D, Video, Branding, etc.) with custom quantities and a live calculated total.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#EADFCB]/60 flex items-center justify-between text-xs font-semibold text-[#5C3A1E]">
                      <span>Select Services</span>
                      <ChevronRight className="w-4 h-4 text-[#A98B57] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Option B: Monthly Plan */}
                  <div
                    onClick={() => {
                      setOrderType("monthly_plan");
                      setFlowStep("plan_select");
                    }}
                    className="group p-5 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] hover:border-[#D4A35A] hover:shadow-warm transition-all cursor-pointer flex flex-col justify-between space-y-4 text-left"
                  >
                    <div className="space-y-3">
                      <div className="w-11 h-11 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-[#5C3A1E] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Clock className="w-5 h-5 text-[#5C3A1E]" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-semibold text-[#5C3A1E] uppercase tracking-wider mb-1.5">
                          <span>Retainer Packages</span>
                        </div>
                        <h4 className="font-serif text-base font-semibold text-[#0F172A] group-hover:text-[#5C3A1E] transition-colors">
                          Monthly Plan
                        </h4>
                        <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                          Retainer-based ongoing creative production with bundled 4K renders, video commercials, priority SLAs, and billing savings.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#EADFCB]/60 flex items-center justify-between text-xs font-semibold text-[#5C3A1E]">
                      <span>Choose Monthly Plan</span>
                      <ChevronRight className="w-4 h-4 text-[#A98B57] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2A: SELECT SERVICES & QUANTITIES */}
            {flowStep === "services_select" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#0F172A]">
                      Select Studio Services
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Pick one or multiple disciplines. Adjust quantities to update live investment.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFlowStep("choose_type")}
                    leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                  >
                    Change Structure
                  </Button>
                </div>

                {isLoadingCatalogs ? (
                  <div className="py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#5C3A1E] mx-auto" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {servicesCatalog.map((srv) => {
                      const qty = selectedServices[srv.id] || 0;
                      const isSelected = qty > 0;
                      const srvPrice = srv.startingPrice ?? (srv as any).price ?? 5499;
                      return (
                        <div
                          key={srv.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 text-left ${
                            isSelected
                              ? "bg-[#FFFDF9] border-[#D4A35A] ring-1 ring-[#D4A35A]/40 shadow-sm"
                              : "bg-[#FFFFFF] border-[#EADFCB] hover:border-[#D4A35A]/60"
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-[10px] uppercase font-bold text-[#A98B57] tracking-wider">
                                    {srv.tagline || srv.category}
                                  </span>
                                  {srv.estimatedDeliveryDays && (
                                    <span className="px-1.5 py-0.5 rounded bg-[#FAF9F5] border border-[#EADFCB] text-[9px] font-medium text-[#64748B]">
                                      {srv.estimatedDeliveryDays}d SLA
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-sm font-semibold text-[#0F172A]">
                                  {srv.name}
                                </h4>
                              </div>
                              <span className="text-xs font-bold text-[#5C3A1E] shrink-0">
                                From ₹{srvPrice.toLocaleString("en-IN")}
                              </span>
                            </div>

                            <p className="text-xs text-[#64748B] leading-relaxed">
                              {srv.shortDescription || ""}
                            </p>
                          </div>

                          {/* Selection toggle & Quantity Counter */}
                          <div className="pt-2 border-t border-[#EADFCB]/60 flex items-center justify-between">
                            {isSelected ? (
                              <div className="flex items-center gap-2 bg-[#F8F5EF] p-1 rounded-xl border border-[#EADFCB]">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuantity(srv.id, -1)}
                                  className="w-6 h-6 rounded-lg bg-white border border-[#EADFCB] flex items-center justify-center hover:bg-[#F4EFE6] text-[#5C3A1E] transition-colors"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold text-[#0F172A] w-5 text-center">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuantity(srv.id, 1)}
                                  className="w-6 h-6 rounded-lg bg-white border border-[#EADFCB] flex items-center justify-center hover:bg-[#F4EFE6] text-[#5C3A1E] transition-colors"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleService(srv.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A] hover:bg-[#FFFDF9] transition-all cursor-pointer"
                              >
                                Select Service
                              </button>
                            )}

                            {isSelected && (
                              <span className="text-xs font-semibold text-[#0F172A]">
                                Subtotal: ₹{(srvPrice * qty).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Sticky Live Total Bar */}
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-[#64748B] block">
                      {selectedServicesCount} Service{selectedServicesCount === 1 ? "" : "s"} Selected
                    </span>
                    <p className="text-base font-bold text-[#5C3A1E]">
                      Live Total: ₹{liveServicesTotal.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    disabled={selectedServicesCount === 0}
                    onClick={() => setFlowStep("service_details")}
                    withArrow
                  >
                    Continue to Brief (Step 2)
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 1B: SELECT MONTHLY PLAN & BILLING CYCLE */}
            {flowStep === "plan_select" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#0F172A]">
                      Select Monthly Retainer Plan
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Dedicated ongoing studio capacity with 3-day free trial on initial activation.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFlowStep("choose_type")}
                    leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                  >
                    Change Structure
                  </Button>
                </div>

                {/* Billing Cycle Selector */}
                <div className="flex justify-center">
                  <div className="inline-flex rounded-full bg-[#FFFDF9] border border-[#EADFCB] p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setBillingCycle("monthly")}
                      className={`px-3 sm:px-4 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                        billingCycle === "monthly"
                          ? "bg-[#5C3A1E] text-white shadow-xs"
                          : "text-[#64748B] hover:text-[#0F172A]"
                      }`}
                    >
                      Monthly (Standard)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle("quarterly")}
                      className={`px-3 sm:px-4 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                        billingCycle === "quarterly"
                          ? "bg-[#5C3A1E] text-white shadow-xs"
                          : "text-[#64748B] hover:text-[#0F172A]"
                      }`}
                    >
                      Quarterly (Save 10%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle("annual")}
                      className={`px-3 sm:px-4 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                        billingCycle === "annual"
                          ? "bg-[#5C3A1E] text-white shadow-xs"
                          : "text-[#64748B] hover:text-[#0F172A]"
                      }`}
                    >
                      Annual (Save 20%)
                    </button>
                  </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plansCatalog.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    const basePrice = plan.monthlyPrice ?? plan.price ?? 5999;
                    const calculatedRate =
                      billingCycle === "quarterly"
                        ? Math.round(basePrice * 3 * 0.9)
                        : billingCycle === "annual"
                        ? Math.round(basePrice * 12 * 0.8)
                        : basePrice;

                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 text-left ${
                          isSelected
                            ? "bg-[#FFFDF9] border-[#D4A35A] ring-2 ring-[#D4A35A]/30 shadow-warm"
                            : "bg-[#FFFFFF] border-[#EADFCB] hover:border-[#D4A35A]/60"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A98B57]">
                              {plan.tier || plan.name}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#EBF5EE] border border-[#C2E0C7] text-[10px] font-semibold text-[#1B5E20]">
                              3-Day Free Trial
                            </span>
                          </div>
                          <div>
                            <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                              {plan.name}
                            </h4>
                            <div className="pt-1.5">
                              <span className="text-xl font-bold text-[#5C3A1E]">
                                ₹{calculatedRate.toLocaleString("en-IN")}
                              </span>
                              <span className="text-xs text-[#64748B] ml-1">
                                /{billingCycle === "monthly" ? "mo" : billingCycle === "quarterly" ? "quarter" : "yr"}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-[#64748B] leading-relaxed">
                            {plan.features?.[0] || "Full creative studio access with dedicated art director."}
                          </p>

                          <div className="space-y-2 pt-3 border-t border-[#EADFCB]/60 text-xs text-[#0F172A]">
                            {(plan.features || []).slice(0, 4).map((f, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0 mt-0.5" />
                                <span className="leading-snug text-xs">{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`w-full py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#5C3A1E] text-white shadow-xs"
                              : "bg-[#F8F5EF] text-[#5C3A1E] border border-[#EADFCB] hover:bg-[#F2ECE1]"
                          }`}
                        >
                          {isSelected ? "Selected" : "Select Plan"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Controls */}
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#64748B] block">Selected Retainer</span>
                    <p className="text-sm font-bold text-[#5C3A1E]">
                      {selectedPlan?.name} (₹{livePlanTotal.toLocaleString("en-IN")})
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setFlowStep("plan_details")}
                    withArrow
                  >
                    Continue to Details (Step 2)
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: DYNAMIC BRIEF QUESTIONNAIRE & SPECIFICATIONS */}
            {(flowStep === "service_details" || flowStep === "plan_details") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#0F172A]">
                      Step 2: {orderType === "service" ? `${activeServiceDetails.name} Brief` : "Retainer Onboarding Goals"}
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      {orderType === "service"
                        ? "Dynamic parameters configured for this studio discipline."
                        : "Company and brand details for ongoing monthly retainer capacity."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => saveDraftToCloud(false)}
                      className="text-[11px] font-medium text-[#5C3A1E] px-2.5 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] hover:bg-[#F4EFE6] hover:border-[#D4A35A] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Save current progress as draft"
                    >
                      <HardDrive className="w-3.5 h-3.5 text-[#A98B57]" />
                      <span>{draftStatus || "Save Draft"}</span>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setFlowStep(orderType === "service" ? "services_select" : "plan_select")
                      }
                      leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                    >
                      Back
                    </Button>
                  </div>
                </div>

                {/* Title */}
                <Input
                  label="Commission Title / Campaign Name"
                  placeholder={
                    orderType === "service"
                      ? `e.g. ${activeServiceDetails.name} — Luxury Brand Launch`
                      : "e.g. Q4 Studio Retainer Brand Refresh"
                  }
                  value={commissionTitle}
                  onChange={(e) => setCommissionTitle(e.target.value)}
                />

                {/* DYNAMIC BRIEF SCHEMA FIELDS */}
                {orderType === "service" &&
                  activeServiceDetails.briefSchema &&
                  activeServiceDetails.briefSchema.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] space-y-3.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#A98B57] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                        <span>{activeServiceDetails.name} Dynamic Questionnaire</span>
                      </h4>

                      <div className="space-y-3">
                        {activeServiceDetails.briefSchema.map((field) => (
                          <div key={field.key} className="space-y-1.5 text-left">
                            <label className="block text-xs font-semibold text-[#0F172A]">
                              {field.label}{" "}
                              {field.required && <span className="text-[#DC2626]">*</span>}
                            </label>

                            {field.type === "select" && (
                              <select
                                value={briefAnswers[field.key] ?? field.defaultValue ?? ""}
                                onChange={(e) =>
                                  setBriefAnswers({
                                    ...briefAnswers,
                                    [field.key]: e.target.value,
                                  })
                                }
                                className="w-full rounded-xl bg-[#FAF9F5] border border-[#EADFCB] px-3.5 py-2 text-xs text-[#0F172A] focus:border-[#D4A35A] focus:outline-none"
                              >
                                <option value="" disabled>
                                  Select an option...
                                </option>
                                {field.options?.map((opt, i) => (
                                  <option key={i} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            )}

                            {field.type === "textarea" && (
                              <div className="space-y-1">
                                <textarea
                                  rows={3}
                                  maxLength={1000}
                                  placeholder={field.helpText || "Enter details..."}
                                  value={briefAnswers[field.key] ?? ""}
                                  onChange={(e) =>
                                    setBriefAnswers({
                                      ...briefAnswers,
                                      [field.key]: e.target.value,
                                    })
                                  }
                                  className="w-full rounded-xl bg-[#FAF9F5] border border-[#EADFCB] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#D4A35A] focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/20"
                                />
                                <div className="flex justify-between text-[10px] text-[#94A3B8]">
                                  <span>{field.helpText}</span>
                                  <span>{(briefAnswers[field.key] || "").length} / 1000</span>
                                </div>
                              </div>
                            )}

                            {field.type === "number" && (
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={briefAnswers[field.key] ?? field.defaultValue ?? 1}
                                onChange={(e) =>
                                  setBriefAnswers({
                                    ...briefAnswers,
                                    [field.key]: Number(e.target.value),
                                  })
                                }
                                className="w-full rounded-xl bg-[#FAF9F5] border border-[#EADFCB] px-3.5 py-2 text-xs text-[#0F172A] focus:border-[#D4A35A] focus:outline-none"
                              />
                            )}

                            {field.type === "multiselect" && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {field.options?.map((opt, i) => {
                                  const currentArr: string[] = Array.isArray(briefAnswers[field.key])
                                    ? briefAnswers[field.key]
                                    : [];
                                  const isChecked = currentArr.includes(opt);
                                  return (
                                    <button
                                      type="button"
                                      key={i}
                                      onClick={() => {
                                        if (isChecked) {
                                          setBriefAnswers({
                                            ...briefAnswers,
                                            [field.key]: currentArr.filter((x) => x !== opt),
                                          });
                                        } else {
                                          setBriefAnswers({
                                            ...briefAnswers,
                                            [field.key]: [...currentArr, opt],
                                          });
                                        }
                                      }}
                                      className={`px-3 py-1 rounded-xl text-xs border transition-all cursor-pointer ${
                                        isChecked
                                          ? "bg-[#5C3A1E] text-white border-[#5C3A1E]"
                                          : "bg-[#FAF9F5] text-[#0F172A] border-[#EADFCB] hover:border-[#D4A35A]"
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {(field.type === "text" ||
                              field.type === "url" ||
                              field.type === "date") && (
                              <input
                                type={field.type}
                                placeholder={field.helpText || ""}
                                value={briefAnswers[field.key] ?? ""}
                                onChange={(e) =>
                                  setBriefAnswers({
                                    ...briefAnswers,
                                    [field.key]: e.target.value,
                                  })
                                }
                                className="w-full rounded-xl bg-[#FAF9F5] border border-[#EADFCB] px-3.5 py-2 text-xs text-[#0F172A] focus:border-[#D4A35A] focus:outline-none"
                              />
                            )}

                            {field.helpText && field.type !== "textarea" && (
                              <span className="text-[10px] text-[#94A3B8] block">
                                {field.helpText}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Scope & General Requirements */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
                    Overall Scope & Additional Instructions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Specify any additional guidelines, lighting atmosphere, specific deliverables, or target deadlines..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full rounded-xl bg-[#FFFDF9] border border-[#EADFCB] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#D4A35A] focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/20"
                  />
                </div>

                {/* Timeline / Target Date */}
                {orderType === "service" ? (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
                      Production SLA
                    </label>
                    <select
                      value={preferredTimeline}
                      onChange={(e) => setPreferredTimeline(e.target.value)}
                      className="w-full rounded-xl bg-[#FFFDF9] border border-[#EADFCB] px-3.5 py-2 text-xs text-[#0F172A] focus:border-[#D4A35A] focus:outline-none"
                    >
                      <option value="Standard Studio SLA (48-72h)">Standard Studio SLA (48–72h)</option>
                      <option value="Priority Rush Turnaround (24-48h)">Priority Rush Turnaround (24–48h)</option>
                      <option value="Same-Day Expedited Pass (Dedicated Director)">Same-Day Expedited Pass</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
                      Target Kickoff Date
                    </label>
                    <input
                      type="date"
                      value={targetKickoffDate}
                      onChange={(e) => setTargetKickoffDate(e.target.value)}
                      className="w-full rounded-xl bg-[#FFFDF9] border border-[#EADFCB] px-3.5 py-2 text-xs text-[#0F172A] focus:border-[#D4A35A] focus:outline-none"
                    />
                  </div>
                )}

                {/* Contact Confirmation */}
                <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#A98B57] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Client Contact Information</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Contact Name"
                      value={clientContact.name}
                      onChange={(e) =>
                        setClientContact({ ...clientContact, name: e.target.value })
                      }
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={clientContact.email}
                      onChange={(e) =>
                        setClientContact({ ...clientContact, email: e.target.value })
                      }
                    />
                    <Input
                      label="Phone / WhatsApp"
                      placeholder="+91 98765 43210"
                      value={clientContact.phone}
                      onChange={(e) =>
                        setClientContact({ ...clientContact, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Advance to Step 3 Drive Assets */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setFlowStep("drive_assets")}
                    withArrow
                  >
                    Continue to Vault Assets (Step 3)
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: VAULT ASSETS & REFERENCE UPLOADS */}
            {flowStep === "drive_assets" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#0F172A]">
                      Step 3: Reference Files & Sutra Cloud Vault
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Upload reference moodboards, CAD models, product photos, or paste a cloud vault folder URL.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => saveDraftToCloud(false)}
                      className="text-[11px] font-medium text-[#5C3A1E] px-2.5 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] hover:bg-[#F4EFE6] hover:border-[#D4A35A] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Save current progress as draft"
                    >
                      <HardDrive className="w-3.5 h-3.5 text-[#A98B57]" />
                      <span>{draftStatus || "Save Draft"}</span>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setFlowStep(orderType === "service" ? "service_details" : "plan_details")
                      }
                      leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                    >
                      Back to Brief
                    </Button>
                  </div>
                </div>

                {/* Required Assets Hints for this Service */}
                {orderType === "service" &&
                  activeServiceDetails.requiredAssets &&
                  activeServiceDetails.requiredAssets.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#A98B57] block">
                        Recommended Assets for {activeServiceDetails.name}:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#0F172A]">
                        {activeServiceDetails.requiredAssets.map((asset, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0" />
                            <span>{asset}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* File Upload Drop Area */}
                <div className="p-5 rounded-2xl bg-[#FAF9F5] border-2 border-dashed border-[#EADFCB] hover:border-[#D4A35A] transition-all text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-[#5C3A1E] flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5 text-[#A98B57]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#0F172A]">
                      Upload Reference Assets (Images, Videos, CAD, PDFs, ZIPs)
                    </p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Max 500 MB per file. Staged directly into your private Sutra Cloud Vault.
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5C3A1E] text-white text-xs font-semibold hover:bg-[#432A15] transition-all cursor-pointer shadow-xs">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Select Files to Attach</span>
                    <input
                      type="file"
                      multiple
                      onChange={handleAddFile}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Staged Uploads List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                      Staged Attachments ({uploadedFiles.length})
                    </span>
                    <div className="space-y-1.5">
                      {uploadedFiles.map((file, i) => {
                        const status = stagedUploadStatus[`${file.name}::${file.size}`];
                        return (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] flex items-center justify-between text-xs gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-[#A98B57] shrink-0" />
                              <span className="font-semibold text-[#0F172A] truncate">{file.name}</span>
                              <span className="text-[10px] text-[#94A3B8] shrink-0">({file.size})</span>
                              {status && (
                                <span
                                  className={`text-[10px] font-bold shrink-0 ${
                                    status.phase === "done"
                                      ? "text-[#15803D]"
                                      : status.phase === "error"
                                        ? "text-[#DC2626]"
                                        : "text-[#A98B57]"
                                  }`}
                                >
                                  {status.phase === "done"
                                    ? "In Drive"
                                    : status.phase === "error"
                                      ? "Failed"
                                      : `${status.percent}%`}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(i)}
                              className="text-xs text-[#DC2626] hover:underline cursor-pointer shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {Object.values(stagedUploadStatus).some((s) => s.error) && (
                      <p className="text-[11px] text-[#DC2626]">
                        {Object.values(stagedUploadStatus)
                          .map((s) => s.error)
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                    )}
                  </div>
                )}

                {/* Sutra Cloud Vault / Storage Link Input */}
                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
                      Or Paste Existing Sutra Cloud Vault / Cloud Folder Link
                    </label>
                    {driveLink && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          driveLink.includes("drive.google.com")
                            ? "bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]"
                            : driveLink.startsWith("https://")
                            ? "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]"
                            : "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]"
                        }`}
                      >
                        {driveLink.includes("drive.google.com")
                          ? "✓ Verified Cloud Vault Link"
                          : driveLink.startsWith("https://")
                          ? "Cloud Storage Link"
                          : "Invalid URL"}
                      </span>
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/drive/folders/... or cloud vault link"
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    className="w-full rounded-xl bg-[#FAF9F5] border border-[#EADFCB] px-3.5 py-2 text-xs text-[#0F172A] focus:border-[#D4A35A] focus:outline-none"
                  />
                  <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/70 text-[11px] text-[#64748B] space-y-1">
                    <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-[#A98B57]" />
                      <span>Cloud Vault Sharing Guide:</span>
                    </div>
                    <p className="leading-relaxed">
                      1. Open your folder in your cloud vault &rarr; Click <strong>Share</strong> &rarr; Under General Access choose <strong>&quot;Anyone with the link can view&quot;</strong> &rarr; Copy and paste link above.
                    </p>
                  </div>
                </div>

                {/* Advance to Step 4 Review & Confirm */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setFlowStep("review_confirm")}
                    withArrow
                  >
                    Continue to Review & Authorize (Step 4)
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & AUTHORIZE (WITH SERVER RECOMPUTATION & RAZORPAY) */}
            {flowStep === "review_confirm" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#0F172A]">
                      Step 4: Review & Authorize Order
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Verify commission parameters before triggering studio production.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFlowStep("drive_assets")}
                    leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                  >
                    Back to Assets
                  </Button>
                </div>

                {/* Server-Verified Pricing Notice */}
                <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#D4A35A]/60 text-xs text-[#5C3A1E] flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#D4A35A] shrink-0" />
                  <span>
                    <strong>Server-Verified Pricing:</strong> The backend recomputes all official rates directly from the studio catalog.
                  </span>
                </div>

                {/* Financial Summary */}
                <div className="rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#A98B57]">
                    Order Summary ({orderType === "service" ? "Individual Services" : "Monthly Retainer"})
                  </h4>

                  {orderType === "service" ? (
                    <div className="divide-y divide-[#EADFCB]/60 text-xs space-y-2">
                      {Object.entries(selectedServices)
                        .filter(([, qty]) => qty > 0)
                        .map(([srvId, qty]) => {
                          const srv = servicesCatalog.find((s) => s.id === srvId);
                          if (!srv) return null;
                          const srvPrice = srv.startingPrice ?? (srv as any).price ?? 3499;
                          return (
                            <div key={srvId} className="pt-2 flex justify-between items-center">
                              <div>
                                <span className="font-semibold text-[#0F172A]">{srv.name}</span>
                                <span className="text-[#64748B] block text-[11px]">
                                  {qty} × ₹{srvPrice.toLocaleString("en-IN")} • {srv.estimatedDeliveryDays || 2}d SLA • {srv.revisionsIncluded || 2} revisions
                                </span>
                              </div>
                              <span className="font-bold text-[#5C3A1E]">
                                ₹{(srvPrice * qty).toLocaleString("en-IN")}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-xs space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[#0F172A]">{selectedPlan?.name}</span>
                        <span className="font-bold text-[#5C3A1E]">
                          ₹{livePlanTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#64748B] block">
                        Billing Interval: {billingCycle.toUpperCase()} • 3-Day Free Trial Included
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#EADFCB] flex justify-between items-center text-sm">
                    <span className="font-serif font-bold text-[#0F172A]">Total Investment:</span>
                    <span className="font-serif text-lg font-bold text-[#5C3A1E]">
                      ₹
                      {(orderType === "service"
                        ? liveServicesTotal
                        : livePlanTotal
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Brief & Assets Overview */}
                <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-4 text-xs space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#64748B] block text-[11px]">Project Title</span>
                      <p className="font-semibold text-[#0F172A]">
                        {commissionTitle ||
                          (orderType === "service"
                            ? `${activeServiceDetails.name} Commission`
                            : `${selectedPlan?.name} Retainer`)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[11px]">Contact Person</span>
                      <p className="font-semibold text-[#0F172A]">
                        {clientContact.name} ({clientContact.email})
                      </p>
                    </div>
                  </div>

                  {requirements && (
                    <div className="pt-2 border-t border-[#EADFCB]/60">
                      <span className="text-[#64748B] block text-[11px]">Overall Scope</span>
                      <p className="text-[#0F172A] leading-relaxed line-clamp-2">{requirements}</p>
                    </div>
                  )}

                  {Object.keys(briefAnswers).length > 0 && (
                    <div className="pt-2 border-t border-[#EADFCB]/60 space-y-1">
                      <span className="text-[#64748B] block text-[11px]">Questionnaire Parameters</span>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(briefAnswers).map(([k, v]) => (
                          <span
                            key={k}
                            className="px-2 py-0.5 rounded bg-[#FAF9F5] border border-[#EADFCB] text-[10px] text-[#5C3A1E]"
                          >
                            <strong>{k}:</strong> {Array.isArray(v) ? v.join(", ") : String(v)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#EADFCB]/60 flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>Vault Sync: Sutra Cloud Vault (Encrypted)</span>
                    <span>
                      {uploadedFiles.length > 0
                        ? isUploadingAttachments
                          ? `Uploading ${uploadedFiles.length} file(s) → Sutra Cloud Vault…`
                          : `${uploadedFiles.length} file(s) staged`
                        : driveLink
                        ? "External Cloud link attached"
                        : "No reference files"}
                    </span>
                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <label className="flex items-center gap-2 text-xs text-[#64748B] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="rounded text-[#5C3A1E] focus:ring-[#D4A35A]"
                  />
                  <span>
                    I agree to the Studio Production Terms, SLA, and Sutra Cloud Vault storage policy.
                  </span>
                </label>

                {/* Error Banner */}
                {submitError && (
                  <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#991B1B] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Double-Submit Protected CTA (Direct Invoice / Test vs Razorpay Online) */}
                <div className="pt-3 border-t border-[#EADFCB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFlowStep("drive_assets")}
                    disabled={isSubmittingOrder}
                  >
                    Back
                  </Button>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => handleSubmitNewOrder(false)}
                      isLoading={isSubmittingOrder}
                      disabled={isSubmittingOrder || !agreedToTerms}
                      leftIcon={<CreditCard className="w-4 h-4 text-[#A98B57]" />}
                      className="w-full sm:w-auto"
                    >
                      Pay via Razorpay / UPI
                    </Button>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleSubmitNewOrder(true)}
                      isLoading={isSubmittingOrder}
                      disabled={isSubmittingOrder || !agreedToTerms}
                      leftIcon={<CheckCircle2 className="w-4 h-4 text-[#D4A35A]" />}
                      className="w-full sm:w-auto"
                    >
                      {isSubmittingOrder
                        ? "Registering Commission..."
                        : orderType === "service"
                        ? `Submit Order (Pay on Invoice — ₹${liveServicesTotal.toLocaleString("en-IN")})`
                        : `Submit Retainer Brief (₹${livePlanTotal.toLocaleString("en-IN")}/mo)`}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: SUCCESS CONFIRMATION SCREEN */}
            {flowStep === "success" && createdOrderResult && (
              <div className="py-6 text-center space-y-5">
                <AnimatedCheckSuccess size={68} className="mx-auto" />

                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[11px] font-mono font-bold text-[#5C3A1E] uppercase">
                    ORDER #{createdOrderResult.orderNumber || createdOrderResult.code}
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                    {createdOrderResult.paymentStatus === "paid"
                      ? "Payment Verified & Dispatched"
                      : "Commission Registered & Placed in Queue"}
                  </h3>
                  <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                    {createdOrderResult.paymentStatus === "paid"
                      ? "Your Razorpay payment has been cryptographically verified. Your commission is active in the studio production queue."
                      : "Your commission brief has been successfully submitted and placed in the studio queue. You will receive official invoice and production updates."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] max-w-sm mx-auto text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Status:</span>
                    <span className="font-bold text-[#2E7D4F] uppercase">
                      {createdOrderResult.paymentStatus === "paid" ? "Verified & Paid" : "Confirmed in Queue"}
                    </span>
                  </div>
                  {createdOrderResult.razorpayPaymentId && (
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Payment ID:</span>
                      <span className="font-mono text-[#5C3A1E] text-[11px]">
                        {createdOrderResult.razorpayPaymentId}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Total Amount:</span>
                    <span className="font-bold text-[#5C3A1E]">
                      ₹{(createdOrderResult.totalAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Vault Folder:</span>
                    <span className="font-mono text-[#2E7D4F] text-[10px]">
                      {createdOrderResult.driveFolder}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setReceiptOrder({
                        ...createdOrderResult,
                        orderNumber: createdOrderResult.orderNumber || createdOrderResult.code || createdOrderResult.id,
                      });
                      setIsReceiptOpen(true);
                    }}
                    leftIcon={<Receipt className="w-4 h-4" />}
                  >
                    View & Print Receipt
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      setIsNewOrderOpen(false);
                      setInspectingOrder(createdOrderResult);
                    }}
                    leftIcon={<Eye className="w-4 h-4" />}
                  >
                    View Order Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setIsNewOrderOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}

            {/* DISMISSED / PENDING PAYMENT NOTICE */}
            {flowStep === "dismissed" && createdOrderResult && (
              <div className="py-6 text-center space-y-5">
                <AnimatedReminderClock size={64} className="mx-auto" />

                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[11px] font-mono font-bold text-[#5C3A1E] uppercase">
                    ORDER #{createdOrderResult.orderNumber || createdOrderResult.code}
                  </span>
                  <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                    Order Saved — Pending Payment
                  </h3>
                  <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                    Your commission has been registered in the database with status <strong>&quot;pending_payment&quot;</strong>. You can complete checkout anytime from My Orders.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleRetryPayment(createdOrderResult)}
                    leftIcon={<Lock className="w-4 h-4 text-[#A98B57]" />}
                  >
                    Complete Payment Now
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setIsNewOrderOpen(false)}
                  >
                    Return to My Orders
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* ========================================================
            ORDER INSPECTION, DETAILS & STATUS HISTORY MODAL
            ======================================================== */}
        <Modal
          isOpen={!!inspectingOrder}
          onClose={() => {
            setInspectingOrder(null);
            setIsRevisionMode(false);
          }}
          title={inspectingOrder?.title || "Deliverable Scope"}
          description={`Order ${inspectingOrder?.orderNumber || inspectingOrder?.code} • ${inspectingOrder?.service}`}
          maxWidth="lg"
          variant="auto"
        >
          {inspectingOrder && (
            <div className="space-y-6">
              {/* Top Progress Header */}
              {(() => {
                const prog = computeOrderProgress(inspectingOrder);
                return (
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-3 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(inspectingOrder.status, inspectingOrder.statusLabel)}
                        {inspectingOrder.paymentStatus === "paid" && (
                          <Badge variant="completed" size="sm" className="bg-[#EDF7F0] text-[#1B663E] border-[#C8E7D2]">
                            Paid
                          </Badge>
                        )}
                        <span className="text-xs font-mono font-bold text-[#5C3A1E]">
                          {inspectingOrder.orderNumber || inspectingOrder.code}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-right">
                        {inspectingOrder.totalAmount !== undefined && (
                          <span className="font-serif font-bold text-sm text-[#5C3A1E]">
                            ₹{inspectingOrder.totalAmount.toLocaleString("en-IN")}
                          </span>
                        )}
                        <span className="font-mono text-xs font-bold text-[#0F172A] bg-white px-2 py-0.5 rounded-lg border border-[#EADFCB]">
                          {prog.percentage}% Complete
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                        <span>Stage: <strong className="text-[#5C3A1E]">{prog.stageLabel}</strong></span>
                        <span>{prog.isComplete ? "100% Finalized" : `${100 - prog.percentage}% remaining`}</span>
                      </div>
                      <div className="w-full bg-[#EADFCB]/60 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            prog.percentage === 100
                              ? "bg-[#16A34A]"
                              : prog.statusCategory === "paused"
                              ? "bg-[#D97706]"
                              : prog.statusCategory === "cancelled"
                              ? "bg-[#DC2626]"
                              : "bg-[#D4A35A]"
                          }`}
                          style={{ width: `${Math.max(prog.percentage, 5)}%` }}
                        />
                      </div>
                    </div>

                    {/* Monthly Details if Retainer */}
                    {inspectingOrder.type === "monthly_plan" && prog.daysRemaining !== undefined && (
                      <div className="text-[11px] text-[#64748B] flex items-center justify-between pt-1 border-t border-[#EADFCB]/60">
                        <span>Period: {inspectingOrder.currentPeriodStart ? new Date(inspectingOrder.currentPeriodStart).toLocaleDateString() : "Active"} &rarr; {inspectingOrder.currentPeriodEnd ? new Date(inspectingOrder.currentPeriodEnd).toLocaleDateString() : "Renewal"}</span>
                        <span className="font-semibold text-[#5C3A1E]">{prog.daysRemaining} days remaining in cycle</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Modal Sub-Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] overflow-x-auto no-scrollbar">
                {[
                  { id: "scope", label: "Scope & Brief", icon: FileText },
                  {
                    id: "deliverables",
                    label: `Vaulted Files (${inspectingOrder.deliverables?.length || 0})`,
                    icon: HardDrive,
                  },
                  {
                    id: "timeline",
                    label: `Timeline (${inspectingOrder.statusHistory?.length || 0})`,
                    icon: Clock,
                  },
                  {
                    id: "discussion",
                    label: `Discussion (${orderComments.length})`,
                    icon: MessageSquare,
                  },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeModalTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveModalTab(t.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? "bg-[#5C3A1E] text-white shadow-xs"
                          : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFFFF]"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#D4A35A]" : "text-[#94A3B8]"}`} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* =======================================================
                  SUB-TAB 1: SCOPE & BRIEF
                  ======================================================= */}
              {activeModalTab === "scope" && (
                <div className="space-y-4 text-xs">
                  {/* Scope Summary */}
                  <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#A98B57] block">
                      Deliverable Scope & Brief
                    </span>
                    <p className="text-xs text-[#0F172A] leading-relaxed">
                      {inspectingOrder.deliverablePreview}
                    </p>
                    {inspectingOrder.requirements && (
                      <div className="pt-2 border-t border-[#EADFCB]/60 text-[#64748B]">
                        <strong className="text-[#0F172A]">Client Intake Brief:</strong>{" "}
                        {inspectingOrder.requirements}
                      </div>
                    )}
                    {inspectingOrder.notes && inspectingOrder.notes !== inspectingOrder.requirements && (
                      <p className="pt-2 border-t border-[#EADFCB]/60 text-[#5C3A1E] font-medium">
                        Revision Instruction: {inspectingOrder.notes}
                      </p>
                    )}
                  </div>

                  {/* Line Items Allocation Table */}
                  {Array.isArray(inspectingOrder.items) && inspectingOrder.items.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A98B57]">
                        Commission Items & Rates
                      </h4>
                      <div className="rounded-xl border border-[#EADFCB] bg-[#FFFDF9] divide-y divide-[#EADFCB]/60 overflow-hidden text-xs">
                        {inspectingOrder.items.map((item, idx) => (
                          <div key={idx} className="p-3 flex justify-between items-center">
                            <div>
                              <span className="font-semibold text-[#0F172A]">{item.name}</span>
                              <span className="text-[#64748B] block text-[11px]">
                                Quantity: {item.quantity}
                              </span>
                            </div>
                            <span className="font-bold text-[#5C3A1E]">
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Client Info & Revisions Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Commissioned By</span>
                      <p className="font-semibold text-[#0F172A]">{inspectingOrder.clientName || user?.displayName || "Studio Client"}</p>
                      <p className="text-[11px] text-[#64748B]">{inspectingOrder.clientEmail || user?.email}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Revision Rounds</span>
                      <p className="font-semibold text-[#5C3A1E]">
                        Round {inspectingOrder.revisionRound || 0} of {inspectingOrder.maxRevisions || 2} Used
                      </p>
                      <p className="text-[11px] text-[#64748B]">
                        {(inspectingOrder.revisionRound || 0) >= (inspectingOrder.maxRevisions || 2)
                          ? "Standard revision capacity reached."
                          : `${(inspectingOrder.maxRevisions || 2) - (inspectingOrder.revisionRound || 0)} included rounds remaining.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* =======================================================
                  SUB-TAB 2: DELIVERABLES & DRIVE VAULT
                  ======================================================= */}
              {/* =======================================================
                  SUB-TAB 2: DELIVERABLES & MEDIA VAULT
                  ======================================================= */}
              {activeModalTab === "deliverables" && (
                <div className="space-y-4 text-xs">
                  {/* Luxury Studio Deliverables Header */}
                  <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#D4A35A]/40 space-y-3 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 text-[#5C3A1E]">
                        <div className="w-8 h-8 rounded-xl bg-white border border-[#EADFCB] flex items-center justify-center text-[#5C3A1E] shadow-2xs">
                          <Sparkles className="w-4 h-4 text-[#A98B57]" />
                        </div>
                        <div>
                          <span className="font-bold text-xs block text-[#0F172A]">
                            High-Resolution Deliverables & Masters
                          </span>
                          <span className="font-mono text-[11px] text-[#64748B]">
                            {Array.isArray(inspectingOrder.deliverables) ? inspectingOrder.deliverables.length : 0} Production Asset(s) Ready for Download
                          </span>
                        </div>
                      </div>
                      <Link
                        href="/media"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F4EFE6] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] transition-colors shrink-0 shadow-2xs"
                      >
                        <span>Open Media Vault</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Deliverable Status Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/70">
                        <span className="text-[10px] text-[#94A3B8] font-bold block">Deliverable Version</span>
                        <span className="font-semibold text-[#0F172A]">
                          v{inspectingOrder.revisionRound ? inspectingOrder.revisionRound + 1 : 1}.0 Master
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/70">
                        <span className="text-[10px] text-[#94A3B8] font-bold block">Production State</span>
                        <span className="font-semibold text-[#0F172A]">
                          {inspectingOrder.status === "completed" || inspectingOrder.status === "approved" ? "Master Finalized" : "Draft under Review"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/70 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-[#94A3B8] font-bold block">Revision Rounds</span>
                        <span className="font-semibold text-[#5C3A1E]">
                          Round {inspectingOrder.revisionRound || 0} of {inspectingOrder.maxRevisions || 2}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Client Approval Action Banner */}
                  {inspectingOrder.status === "draft_delivered" || inspectingOrder.status === "awaiting_approval" ? (
                    <div className="p-4 rounded-2xl bg-[#FFFBEB] border-2 border-[#D97706]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white border border-[#FDE68A] flex items-center justify-center text-[#92400E] shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-xs text-[#92400E]">
                            Draft Deliverables Ready for Your Review
                          </h5>
                          <p className="text-[11px] text-[#B45309]">
                            Review the concept media files below. Approve to receive high-res master files or request a revision.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApproveDeliverable(inspectingOrder.id)}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-[#BBF7D0]" />}
                          className="bg-[#166534] hover:bg-[#14532d] text-white text-xs"
                        >
                          ✓ Approve Deliverables
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setIsRevisionMode(true)}
                          className="text-xs"
                        >
                          Request Revision
                        </Button>
                      </div>
                    </div>
                  ) : inspectingOrder.status === "approved" || inspectingOrder.status === "completed" ? (
                    <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between text-xs text-[#166534]">
                      <div className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                        <span>Deliverables Approved & Vaulted in Sutra Cloud Vault Final Delivery.</span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-[#15803D]">Approved</span>
                    </div>
                  ) : null}

                  {/* Delivered Assets Visual Gallery */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A98B57] flex items-center justify-between">
                      <span>Vaulted Deliverables & Master Files ({inspectingOrder.deliverables?.length || 0})</span>
                      {inspectingOrder.deliveredAt && (
                        <span className="text-[10px] text-[#64748B] font-normal">
                          Last Delivery: {new Date(inspectingOrder.deliveredAt).toLocaleDateString("en-IN")}
                        </span>
                      )}
                    </h4>

                    {Array.isArray(inspectingOrder.deliverables) && inspectingOrder.deliverables.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {inspectingOrder.deliverables.map((del: any, idx: number) => {
                          const isImg = del.mimeType?.startsWith("image") || del.filename?.match(/\.(png|jpg|jpeg|webp)$/i);
                          const isPdf = del.mimeType?.includes("pdf") || del.filename?.endsWith(".pdf");
                          const isVideo = del.mimeType?.startsWith("video") || del.filename?.match(/\.(mp4|mov|webm)$/i);
                          const is3D = del.filename?.match(/\.(glb|gltf|obj|fbx)$/i);

                          return (
                            <div
                              key={idx}
                              className="p-3 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] hover:border-[#D4A35A] transition-all flex flex-col justify-between space-y-2.5 shadow-2xs group"
                            >
                              {/* Visual Image / Thumbnail Preview */}
                              {isImg && del.previewUrl && (
                                <div className="w-full h-36 rounded-xl overflow-hidden bg-white border border-[#EADFCB] relative group">
                                  <img
                                    src={del.previewUrl}
                                    alt={del.filename}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono">
                                    Image Preview
                                  </span>
                                </div>
                              )}

                              {/* File Details & Badges */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-center shrink-0 text-[#5C3A1E] mt-0.5">
                                    {isImg ? (
                                      <FileCheck className="w-4 h-4 text-[#A98B57]" />
                                    ) : isVideo ? (
                                      <Video className="w-4 h-4 text-[#A98B57]" />
                                    ) : is3D ? (
                                      <Box className="w-4 h-4 text-[#A98B57]" />
                                    ) : (
                                      <FileText className="w-4 h-4 text-[#A98B57]" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-xs text-[#0F172A] truncate block" title={del.filename}>
                                      {del.filename}
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[#64748B] font-mono">
                                      <span>{del.fileSize || "12 MB"}</span>
                                      {del.version && (
                                        <>
                                          <span>•</span>
                                          <span className="text-[#5C3A1E] font-bold">{del.version}</span>
                                        </>
                                      )}
                                      {del.category && (
                                        <>
                                          <span>•</span>
                                          <span className="uppercase text-[#A98B57]">{del.category}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Download & Preview Actions */}
                              {del.previewUrl && (
                                <div className="pt-1 border-t border-[#EADFCB]/60">
                                  <a
                                    href={del.previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-1.5 px-2.5 bg-[#FAF9F5] hover:bg-[#F4EFE6] border border-[#EADFCB] rounded-xl text-xs font-semibold text-[#5C3A1E] transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download Deliverable</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-center text-xs text-[#64748B] space-y-1">
                        <Sparkles className="w-6 h-6 text-[#A98B57] mx-auto opacity-60" />
                        <p className="font-semibold text-[#0F172A]">Deliverables in Production</p>
                        <p className="text-[11px]">
                          Your assets are currently being crafted in the studio pipeline. Draft renders will appear here upon completion.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =======================================================
                  SUB-TAB 3: STATUS HISTORY TIMELINE
                  ======================================================= */}
              {activeModalTab === "timeline" && (
                <div className="space-y-3 text-xs">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A98B57] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Lifecycle Event Log</span>
                  </h4>

                  {Array.isArray(inspectingOrder.statusHistory) && inspectingOrder.statusHistory.length > 0 ? (
                    <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] space-y-3.5 max-h-80 overflow-y-auto">
                      {inspectingOrder.statusHistory.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-xs pb-3 border-b border-[#EADFCB]/50 last:border-b-0 last:pb-0">
                          <div className="w-3 h-3 rounded-full bg-[#D4A35A] mt-1 shrink-0 ring-4 ring-[#D4A35A]/10" />
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0F172A] uppercase text-[10px] tracking-wider">
                                {step.status.replace("_", " ")}
                              </span>
                              <span className="text-[10px] text-[#94A3B8]">
                                {step.changedAt ? new Date(step.changedAt).toLocaleString("en-IN") : "Recorded"}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#64748B]">
                              Updated by <strong className="text-[#0F172A]">{step.changedBy}</strong>
                            </p>
                            {step.note && (
                              <p className="text-[11px] text-[#475569] italic pt-0.5">
                                &ldquo;{step.note}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-center text-xs text-[#64748B]">
                      Initial order placement event recorded.
                    </div>
                  )}
                </div>
              )}

              {/* =======================================================
                  SUB-TAB 4: ORDER DISCUSSION & COMMENTS THREAD
                  ======================================================= */}
              {activeModalTab === "discussion" && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A98B57] flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Studio Comments Thread</span>
                    </h4>
                    <span className="text-[10px] text-[#64748B]">
                      Direct communication on Order #{inspectingOrder.orderNumber || inspectingOrder.code}
                    </span>
                  </div>

                  {/* Messages Feed */}
                  <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] space-y-3 max-h-72 overflow-y-auto">
                    {isLoadingComments ? (
                      <div className="p-6 text-center text-xs text-[#64748B]">
                        <Loader2 className="w-4 h-4 animate-spin text-[#5C3A1E] mx-auto mb-1" />
                        <span>Loading order discussion...</span>
                      </div>
                    ) : orderComments.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#64748B] space-y-1">
                        <MessageSquare className="w-6 h-6 text-[#94A3B8] mx-auto opacity-50" />
                        <p className="font-semibold text-[#0F172A]">No comments yet</p>
                        <p className="text-[11px]">Send a note, question, or reference link directly to the studio art director below.</p>
                      </div>
                    ) : (
                      orderComments.map((comm) => {
                        const isClient = comm.sender === "client";
                        return (
                          <div
                            key={comm.id}
                            className={`flex flex-col space-y-1 max-w-[85%] ${
                              isClient ? "ml-auto items-end" : "mr-auto items-start"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8] px-1">
                              <span className="font-semibold text-[#5C3A1E]">{comm.authorName}</span>
                              <span>• {new Date(comm.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                isClient
                                  ? "bg-[#5C3A1E] text-white rounded-tr-none shadow-2xs"
                                  : "bg-[#FAF9F5] border border-[#EADFCB] text-[#0F172A] rounded-tl-none"
                              }`}
                            >
                              <p className="whitespace-pre-line">{comm.text}</p>
                              {comm.attachmentUrl && (
                                <a
                                  href={comm.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`mt-2 inline-flex items-center gap-1 text-[11px] underline font-semibold ${
                                    isClient ? "text-[#D4A35A]" : "text-[#5C3A1E]"
                                  }`}
                                >
                                  <span>📎 {comm.attachmentName || "Attached Reference"}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Post Comment Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handlePostComment();
                    }}
                    className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] space-y-2"
                  >
                    <textarea
                      rows={2}
                      placeholder="Write a message to the studio art director..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <input
                        type="url"
                        placeholder="Optional reference / annotation link (Figma, Drive, Loom)..."
                        value={newCommentAttachmentUrl}
                        onChange={(e) => setNewCommentAttachmentUrl(e.target.value)}
                        className="w-full sm:w-80 px-2.5 py-1.5 rounded-lg bg-white border border-[#EADFCB] text-[11px] text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={!newCommentText.trim() || isPostingComment}
                        isLoading={isPostingComment}
                        leftIcon={<Send className="w-3.5 h-3.5" />}
                      >
                        Send Note
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Feedback Success State */}
              {feedbackSuccess && (
                <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] text-xs text-[#166534] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>{feedbackSuccess}</span>
                </div>
              )}

              {/* Revision Form Mode */}
              {isRevisionMode ? (
                <div className="space-y-4 pt-3 border-t border-[#EADFCB]">
                  <div className="space-y-1">
                    <h4 className="font-serif text-sm font-semibold text-[#0F172A]">
                      Submit Revision Request to Art Director
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      Pass {(inspectingOrder.revisionRound || 0) + 1} of {inspectingOrder.maxRevisions || 2} included revisions. Turnaround: 24-48 hours.
                    </p>
                  </div>

                  {(inspectingOrder.revisionRound || 0) >= (inspectingOrder.maxRevisions || 2) && (
                    <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                      <span>
                        Note: All standard included revisions ({inspectingOrder.maxRevisions || 2}) have been utilized. This extra pass request will be scheduled and coordinated directly with the Art Director.
                      </span>
                    </div>
                  )}

                  <textarea
                    rows={3}
                    placeholder="Specify the exact adjustments desired (e.g. increase ambient lighting softness, refine Sanskrit typography kerning, adjust texture reflectiveness)..."
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
                      disabled={!revisionNotes.trim() || isSubmittingOrder}
                      isLoading={isSubmittingOrder}
                      onClick={() => handleRequestRevision(inspectingOrder.id)}
                    >
                      Send Revision Request
                    </Button>
                  </div>
                </div>
              ) : (
                /* Primary Actions: Approve vs Request Revision vs Receipt vs Pay */
                <div className="pt-4 border-t border-[#EADFCB] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInspectingOrder(null)}
                    >
                      Close
                    </Button>

                    {inspectingOrder.paymentStatus === "paid" && (
                      <button
                        type="button"
                        onClick={() => {
                          setReceiptOrder({
                            ...inspectingOrder,
                            orderNumber: inspectingOrder.orderNumber || inspectingOrder.code || inspectingOrder.id,
                          });
                          setIsReceiptOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A] hover:bg-[#F8F5EF] transition-all cursor-pointer flex items-center gap-1.5 min-h-[36px]"
                      >
                        <Receipt className="w-3.5 h-3.5 text-[#A98B57]" />
                        <span>View Receipt</span>
                      </button>
                    )}

                    {(inspectingOrder.status === "pending_payment" || inspectingOrder.paymentStatus === "unpaid") && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentModalOrder(inspectingOrder);
                            setInspectingOrder(null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#2E7D4F] text-xs font-semibold text-[#2E7D4F] hover:bg-[#F0FDF4] transition-all cursor-pointer flex items-center gap-1.5 min-h-[36px]"
                          title="Scan & Pay via Google Pay / PhonePe (0% Fee)"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Zero-Fee UPI</span>
                        </button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            handleRetryPayment(inspectingOrder);
                            setInspectingOrder(null);
                          }}
                          leftIcon={<Lock className="w-3.5 h-3.5 text-[#EADFCB]" />}
                        >
                          Pay Online
                        </Button>
                      </>
                    )}

                    {(inspectingOrder.status === "delivered" ||
                      inspectingOrder.status === "draft_delivered" ||
                      inspectingOrder.status === "awaiting_approval") && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsRevisionMode(true)}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                      >
                        Request Changes (Round {(inspectingOrder.revisionRound || 0) + 1})
                      </Button>
                    )}
                  </div>

                  {(inspectingOrder.status === "delivered" ||
                    inspectingOrder.status === "draft_delivered" ||
                    inspectingOrder.status === "awaiting_approval") && (
                    <Button
                      variant="primary"
                      size="md"
                      disabled={isSubmittingOrder}
                      isLoading={isSubmittingOrder}
                      onClick={() => handleApproveDeliverable(inspectingOrder.id)}
                      leftIcon={<CheckCircle2 className="w-4 h-4 text-[#EADFCB]" />}
                    >
                      Approve & Complete (100%)
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Official Receipt & Tax Invoice Modal */}
        <OrderReceiptModal
          order={receiptOrder}
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
        />

        {/* Zero-Fee UPI & GPay Payment Modal */}
        {paymentModalOrder && (
          <PaymentModal
            isOpen={!!paymentModalOrder}
            onClose={() => setPaymentModalOrder(null)}
            orderId={paymentModalOrder.id}
            orderCode={paymentModalOrder.code || paymentModalOrder.orderNumber}
            clientName={paymentModalOrder.clientName || clientContact.name}
            clientEmail={paymentModalOrder.clientEmail || clientContact.email}
            clientPhone={paymentModalOrder.clientPhone || clientContact.phone}
            serviceTitle={paymentModalOrder.service || paymentModalOrder.title}
            amount={paymentModalOrder.totalAmount || 1999}
            isCustomQuote={false}
            onPaymentSuccess={() => {
              window.dispatchEvent(new CustomEvent("sutra_orders_changed"));
            }}
          />
        )}

        {/* Master Intake Order Form Modal (All 12 Services + Conditional Accordions + Zero-Fee Checkout) */}
        {isMasterOrderModalOpen && (
          <Modal
            isOpen={isMasterOrderModalOpen}
            onClose={() => setIsMasterOrderModalOpen(false)}
            title="Commission Creative Project"
            description="Select from 12 Studio Disciplines • Autonomous n8n Workflow Dispatch • Zero-Fee UPI & Razorpay"
            maxWidth="2xl"
            variant="auto"
          >
            <div className="pt-2">
              <MasterOrderForm
                initialServiceId={initialMasterService}
                initialTierId={initialMasterTier}
                onOrderSuccess={() => {
                  setIsMasterOrderModalOpen(false);
                  loadOrders();
                  window.dispatchEvent(new CustomEvent("sutra_orders_changed"));
                }}
              />
            </div>
          </Modal>
        )}
      </div>
      <ConfirmationDialog />
    </RouteGuard>
  );
}
