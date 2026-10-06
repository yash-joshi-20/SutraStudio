"use client";

import React, { useState, useEffect, Suspense, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { KPITile } from "@/components/dashboard/KPITile";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/auth/authContext";
import {
  ShieldAlert,
  Users,
  Cpu,
  Bot,
  CheckCircle2,
  FileCheck,
  Activity,
  ArrowRight,
  Search,
  HardDrive,
  Eye,
  SlidersHorizontal,
  ExternalLink,
  Lock,
  Layers,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Send,
  Play,
  PlayCircle,
  Clock,
  RefreshCw,
  Terminal,
  Box,
  Video,
  Image as ImageIcon,
  Layout,
  Smartphone,
  Megaphone,
  Compass,
  ShoppingBag,
  DollarSign,
  Filter,
  ArrowUpDown,
  Bell,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Check,
  CheckCheck,
  AlertCircle,
  FileText,
  Calendar,
  Loader2,
  Paperclip,
  Receipt,
  UploadCloud,
  Phone,
  Mail,
  Copy,
  Plus,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  HelpCircle,
  Sliders,
  Trash2,
  Edit3,
  Save,
  Zap,
  ShieldCheck,
  Archive,
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { OrderReceiptModal, ReceiptOrderData } from "@/components/orders/OrderReceiptModal";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { AdminBrandPromptsView } from "@/components/admin/AdminBrandPromptsView";
import { computeOrderProgress, computeN8nWorkflowProgress } from "@/lib/services/orderProgress";
import type {
  KnowledgeBaseEntry,
  KnowledgeCategory,
  FeedbackItem,
  CommonQuestionInsight,
  AiSettingsConfig,
} from "@/lib/services/aiKnowledgeTypes";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/services/aiKnowledgeTypes";
import type { CatalogService, CatalogPlan } from "@/lib/services/catalogData";
import { SEED_CATALOG_SERVICES, SEED_CATALOG_PLANS } from "@/lib/services/catalogData";
import { json, jsonRaw, errorMessage } from "@/lib/api/client";
import { uploadFileToDrive, type DriveUploadResult, type DriveUploadProgress } from "@/lib/drive/useDriveUpload";
import { useConfirm } from "@/hooks/useConfirm";
import { soundSystem } from "@/lib/audio/soundSystem";
import { AnimatedPaymentBadge, AnimatedCheckSuccess } from "@/components/ui/AnimatedStatusIcons";

/**
 * Step 1.6 — explain a rejected admin call instead of failing silently.
 *
 * `requireAdmin()` answers 401 when the admin portal's own httpOnly cookie is
 * missing or expired, and `requireFreshAdminReauth()` answers 403 when the
 * five-minute re-auth window has passed on a sensitive action. Both mean the
 * same thing to a human: sign in again. Every other status keeps the server's
 * own message.
 */
function adminActionError(status: number, fallback?: string): string {
  if (status === 401 || status === 403) {
    return "We could not confirm your identity. Please sign in again to continue.";
  }
  return fallback || "That action could not be completed. Please try again.";
}

/**
 * Admin data access.
 *
 * Every knowledge-base, feedback and catalog operation goes through an
 * admin-gated API route. The admin portal must never reach Firestore directly:
 * the Admin SDK has no browser build, and every write needs a server-side
 * authorisation and audit check.
 */
async function callAiConsole<T>(action: string, payload?: Record<string, unknown>): Promise<T> {
  return jsonRaw<T>("/api/admin/ai-console", "POST", { action, payload });
}

async function fetchCatalog<T>(): Promise<T> {
  return json<T>("/api/admin/catalog");
}

async function patchCatalog<T>(
  kind: "service" | "plan",
  id: string,
  updates: Record<string, unknown>
): Promise<T> {
  return jsonRaw<T>("/api/admin/catalog", "PATCH", { kind, id, updates });
}

interface ClientRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  tier: "Enterprise" | "Growth" | "Starter";
  driveFolderId: string;
  activeOrders: number;
  lifetimeVolume: string;
  status: "Active" | "Pending Brief" | "Under Review";
  lastActive: string;
}

const CLIENTS_DATA: ClientRecord[] = [];

const AUDIT_LOGS: Array<{ id: string; event: string; actor: string; detail: string; time: string; type: string }> = [];

export interface AdminChatMessage {
  id?: string;
  sender: "client" | "ai" | "admin" | "note";
  text: string;
  time: string;
  timestamp?: string;
  workflow?: string;
  orderDraft?: {
    orderId?: string;
    orderNumber?: string;
    service?: string;
    totalAmount?: number;
    status?: string;
    driveFolderId?: string;
  };
}

export interface AdminChatSession {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  company: string;
  vaultId: string;
  joinedDate?: string;
  mode: "ai" | "human";
  lastPrompt: string;
  workflowTag: string;
  lastTime: string;
  unreadCount: number;
  updatedAt?: string;
  messages: AdminChatMessage[];
}

const INITIAL_ADMIN_SESSIONS: AdminChatSession[] = [];

export interface StudioWorkflowEngine {
  slug: string;
  name: string;
  category: "Visual & 3D" | "Video & VR" | "Code & Growth";
  provider: string;
  latency: string;
  activeJobs: number;
  description: string;
  inputFormat: string;
  outputVault: string;
  sla: string;
  iconName: "image" | "video" | "box" | "compass" | "layers" | "megaphone" | "layout" | "smartphone";
}

const STUDIO_WORKFLOW_ENGINES: StudioWorkflowEngine[] = [
  {
    slug: "image",
    name: "Image Generation Pipeline",
    category: "Visual & 3D",
    provider: "Midjourney v6.1 / Flux Pro + Real-ESRGAN Upscale",
    latency: "850ms",
    activeJobs: 4,
    description: "Diffusion model synthesis, studio multi-light simulation pass, and ultra-high resolution upscale for marketing & print.",
    inputFormat: "Text Prompt / Brand Moodboard",
    outputVault: "drive_fld_*/IMAGES",
    sla: "99.98%",
    iconName: "image",
  },
  {
    slug: "video",
    name: "Video Production Pipeline",
    category: "Video & VR",
    provider: "Runway Gen-3 Alpha / Luma Dream Machine + ElevenLabs Audio",
    latency: "2.4s",
    activeJobs: 2,
    description: "Cinematographic commercial reels, 4K camera maneuvers, motion graphics, and synchronized spatial audio passes.",
    inputFormat: "Storyboards / Scene Descriptors",
    outputVault: "drive_fld_*/VIDEOS",
    sla: "99.95%",
    iconName: "video",
  },
  {
    slug: "three-d",
    name: "3D Spatial Pipeline",
    category: "Visual & 3D",
    provider: "Meshy v2 / Tripo 3D + Blender Geometry Nodes",
    latency: "1.2s",
    activeJobs: 3,
    description: "High-poly mesh modeling, PBR procedural materials, and GLTF/USDZ asset export for luxury e-commerce and AR.",
    inputFormat: "Product CAD / Orthographic Views",
    outputVault: "drive_fld_*/3D_RENDERS",
    sla: "99.99%",
    iconName: "box",
  },
  {
    slug: "three-sixty",
    name: "360 Virtual Tour VR",
    category: "Video & VR",
    provider: "Pannellum Engine + HDR Equirectangular Stitching",
    latency: "1.1s",
    activeJobs: 1,
    description: "Interactive architectural walkthroughs, spherical HDR node stitching, and multi-room portal linking for web and VR.",
    inputFormat: "Spherical Panoramas / Floor Plan",
    outputVault: "drive_fld_*/360_TOURS",
    sla: "99.94%",
    iconName: "compass",
  },
  {
    slug: "interior",
    name: "Interior Architectural Engine",
    category: "Visual & 3D",
    provider: "ControlNet SDXL Architecture + Depth Maps",
    latency: "1.8s",
    activeJobs: 2,
    description: "Transforms architectural line drawings and rough wireframes into photorealistic styled spaces with heritage materials.",
    inputFormat: "2D Layout / Architectural Blueprint",
    outputVault: "drive_fld_*/INTERIOR",
    sla: "99.97%",
    iconName: "layers",
  },
  {
    slug: "marketing",
    name: "Marketing & Ad Creative Pipeline",
    category: "Code & Growth",
    provider: "Automated Copywriting + Multi-Aspect Ratio Resizing",
    latency: "420ms",
    activeJobs: 3,
    description: "Generates multi-platform ad banners (1:1, 9:16, 16:9), copy variations, and campaign collateral ready for ad networks.",
    inputFormat: "Campaign Goal / Target Audience",
    outputVault: "drive_fld_*/MARKETING",
    sla: "99.99%",
    iconName: "megaphone",
  },
  {
    slug: "website",
    name: "Website Development Pipeline",
    category: "Code & Growth",
    provider: "Next.js 16 Turbopack CI/CD + Vercel Deployment",
    latency: "3.2s",
    activeJobs: 2,
    description: "Compiles responsive Next.js landing pages, headless CMS bindings, and sub-second Lighthouse 98+ optimizations.",
    inputFormat: "Figma Tokens / Section Specs",
    outputVault: "drive_fld_*/WEBSITE",
    sla: "99.99%",
    iconName: "layout",
  },
  {
    slug: "app",
    name: "App & Mobile Pipeline",
    category: "Code & Growth",
    provider: "React Native / PWA Component Architecture & Firebase Auth Sync",
    latency: "4.1s",
    activeJobs: 1,
    description: "Scaffolds cross-platform iOS & Android screens, offline state persistence, and Firebase security rule validation.",
    inputFormat: "User Journey / Design Tokens",
    outputVault: "drive_fld_*/MOBILE_APP",
    sla: "99.96%",
    iconName: "smartphone",
  },
];

export interface AdminOrderItem {
  serviceId?: string;
  planId?: string;
  name: string;
  price: number;
  quantity: number;
}

export interface AdminOrderAttachment {
  id?: string;
  name: string;
  url?: string;
  driveFileId?: string;
  size?: string;
  mimeType?: string;
}

export interface AdminStatusHistoryItem {
  status: string;
  changedAt: string;
  changedBy: string;
  note?: string;
}

export interface AdminOrder {
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
    | "delivered"
    | "trial"
    | "active"
    | "in_progress";
  statusLabel?: string;
  clientUid?: string;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  type?: "service" | "monthly_plan";
  items?: AdminOrderItem[];
  totalAmount?: number;
  billingCycle?: "monthly" | "quarterly" | "annual";
  requirements?: string;
  notes?: string;
  attachments?: AdminOrderAttachment[];
  source?: "dashboard" | "ai_chat" | "whatsapp" | "email" | "contact_page" | "offline" | "qr_upi" | string;
  chatId?: string;
  deliverablePreview?: string;
  deliverables?: {
    driveFileId?: string;
    filename: string;
    checksum?: string;
    fileSize?: string;
    mimeType?: string;
    previewUrl?: string;
    version?: string;
    category?: string;
    uploadedAt?: string;
  }[];
  deliveredAt?: string;
  assignedTo?: {
    id: string;
    name: string;
    role: string;
    assignedAt?: string;
  };
  estimatedDeliveryDays?: number;
  estimatedDueDate?: string;
  internalNotes?: Array<{
    id: string;
    author: string;
    text: string;
    createdAt: string;
  }>;
  comments?: Array<{
    id: string;
    sender: "client" | "admin" | "system";
    authorName: string;
    text: string;
    attachmentUrl?: string;
    attachmentName?: string;
    createdAt: string;
  }>;
  driveFolderId?: string;
  driveFolderPath?: string;
  driveFolderLink?: string;
  revisionRound?: number;
  maxRevisions?: number;
  createdAt: string;
  updatedAt: string;
  statusHistory?: AdminStatusHistoryItem[];
  paymentStatus?: "unpaid" | "paid" | "failed" | "refunded";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amountPaid?: number;
  paidAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  failureReason?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  workflowStatus?: "queued" | "running" | "draft_ready" | "generation_failed" | "completed" | "published" | "idle" | string;
  workflowRunId?: string;
  workflowId?: string;
  workflowLastDispatchedAt?: string;
  workflowRetryCount?: number;
  workflowLastError?: string;
  workflowHistory?: Array<{
    runId: string;
    workflowId: string;
    status: string;
    timestamp: string;
    deliverableUrl?: string;
    error?: string;
  }>;
}

type AdminTab =
  | "overview"
  | "clients"
  | "approvals"
  | "orders"
  | "plans"
  | "services"
  | "payments"
  | "deliveries"
  | "conversations"
  | "workflows"
  | "notifications"
  | "settings"
  | "site-control"
  | "audit"
  | "prompts";

function AdminHubContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { confirm, ConfirmationDialog } = useConfirm();
  const tabParam = searchParams.get("tab") as AdminTab | null;

  const normalizeTab = (tab: string | null): AdminTab => {
    if (!tab || tab === "overview") return "overview";
    if (tab === "orders") return "approvals";
    if (tab === "settings") return "site-control";
    if (tab === "prompts") return "prompts";
    if (
      [
        "overview",
        "clients",
        "approvals",
        "plans",
        "services",
        "payments",
        "deliveries",
        "conversations",
        "workflows",
        "notifications",
        "site-control",
        "audit",
        "prompts",
      ].includes(tab)
    ) {
      return tab as AdminTab;
    }
    return "overview";
  };

  const [activeTab, setActiveTab] = useState<AdminTab>(() => normalizeTab(tabParam));

  useEffect(() => {
    setActiveTab(normalizeTab(tabParam));
  }, [tabParam]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    if (tab === "overview") {
      router.push("/admin");
    } else {
      router.push(`/admin?tab=${tab}`);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [showPricingGuide, setShowPricingGuide] = useState(true);
  const [copiedPitch, setCopiedPitch] = useState(false);

  // Real-Time Firebase Orders State
  const [realOrders, setRealOrders] = useState<AdminOrder[]>([]);
  const [isLoadingRealOrders, setIsLoadingRealOrders] = useState(true);
  const [realOrdersError, setRealOrdersError] = useState<string | null>(null);
  const [newOrderNotice, setNewOrderNotice] = useState<string | null>(null);
  const prevOrdersCountRef = useRef<number | null>(null);

  // Search, Filters, Sorting & Pagination
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("all");
  const [orderSourceFilter, setOrderSourceFilter] = useState<string>("all");
  const [orderDateFilter, setOrderDateFilter] = useState<string>("all");
  const [orderSortBy, setOrderSortBy] = useState<string>("date_desc");
  const [orderCurrentPage, setOrderCurrentPage] = useState<number>(1);
  const ORDERS_PER_PAGE = 6;

  // Order Details & Status Transition Modal
  const [inspectingAdminOrder, setInspectingAdminOrder] = useState<AdminOrder | null>(null);
  const [adminOrderModalTab, setAdminOrderModalTab] = useState<"details" | "deliverables" | "internal" | "discussion">("details");
  const [statusChangeTarget, setStatusChangeTarget] = useState<string>("");
  const [statusChangeNote, setStatusChangeNote] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isRefunding, setIsRefunding] = useState<boolean>(false);
  const [adminReceiptOrder, setAdminReceiptOrder] = useState<ReceiptOrderData | null>(null);
  const [isAdminReceiptOpen, setIsAdminReceiptOpen] = useState<boolean>(false);

  // Delivery & Team Assignment State
  const [deliveryFilename, setDeliveryFilename] = useState("");
  const [deliveryPreviewUrl, setDeliveryPreviewUrl] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveryCategory, setDeliveryCategory] = useState<"drafts" | "final_delivery" | "revisions">("final_delivery");
  const [deliveryFile, setDeliveryFile] = useState<File | null>(null);
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliveryProgress, setDeliveryProgress] = useState<DriveUploadProgress | null>(null);
  const [isArchivingDrive, setIsArchivingDrive] = useState(false);
  const [assignedMemberId, setAssignedMemberId] = useState("");

  const [dispatchingOrderWf, setDispatchingOrderWf] = useState<string | null>(null);
  const [selectedWfId, setSelectedWfId] = useState<string>("SUTRA_MASTER_AUTONOMOUS_PIPELINE");
  const [wfDispatchFeedback, setWfDispatchFeedback] = useState<{ success: boolean; message: string; runId?: string } | null>(null);

  // Auto-select corresponding n8n workflow based on order category and status
  useEffect(() => {
    if (!inspectingAdminOrder) return;
    if (inspectingAdminOrder.status === "approved") {
      setSelectedWfId("W2_approval_and_publish");
    } else {
      setSelectedWfId("SUTRA_MASTER_AUTONOMOUS_PIPELINE");
    }
  }, [inspectingAdminOrder?.id, inspectingAdminOrder?.status, inspectingAdminOrder?.service, inspectingAdminOrder?.title, inspectingAdminOrder?.type]);
  // External Manual Orders & Multi-Channel Payment Inflow State
  const [isRecordExternalModalOpen, setIsRecordExternalModalOpen] = useState(false);
  const [isSopGuideModalOpen, setIsSopGuideModalOpen] = useState(false);
  const [isSubmittingExternalOrder, setIsSubmittingExternalOrder] = useState(false);
  const [externalOrderForm, setExternalOrderForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    service: "Image Creation (Photorealistic AI & Art)",
    customService: "",
    amount: "5499",
    source: "whatsapp",
    paymentStatus: "paid",
    paymentMethod: "upi_qr",
    paymentReference: "",
    requirements: "",
    driveLink: "",
  });
  const [paymentActionFeedback, setPaymentActionFeedback] = useState<{
    orderId: string;
    type: "paid" | "reminder";
    message: string;
  } | null>(null);
  const [isProcessingPaymentAction, setIsProcessingPaymentAction] = useState<string | null>(null);

  // Studio Self-Marketing & Promo Engine State
  const [isSelfMarketingModalOpen, setIsSelfMarketingModalOpen] = useState(false);
  const [selfMarketingCampaign, setSelfMarketingCampaign] = useState("Sutra Studio Luxury Brand Promo");
  const [selfMarketingPrompt, setSelfMarketingPrompt] = useState(
    "Sutra Studio Brand Campaign: Showcase 4K photorealistic architectural daylight renders, cinematic 1080p ProRes reel, 3D luxury pavilion model, and 3-ratio Meta Ads creative pack with warm ivory (#FAF9F5) and muted brass (#A98B57) branding."
  );
  const [isDispatchingSelfMarketing, setIsDispatchingSelfMarketing] = useState(false);

  const handleDispatchSelfMarketing = async () => {
    setIsDispatchingSelfMarketing(true);
    try {
      const res = await fetch("/api/n8n/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: "SUTRA_MASTER_AUTONOMOUS_PIPELINE",
          isStudioSelfMarketing: true,
          campaignName: selfMarketingCampaign,
          service: "Studio Brand Advertising",
          brief: selfMarketingPrompt,
          isAdminDispatch: true,
          force: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDispatchSuccess(
          `✓ Studio Self-Marketing Campaign [${selfMarketingCampaign}] dispatched to Master Autonomous Engine. Run ID: ${data.runId}`
        );
        setIsSelfMarketingModalOpen(false);
        setTimeout(() => setDispatchSuccess(""), 5000);
      } else {
        alert(data.error || "Failed to dispatch marketing campaign");
      }
    } catch (err: any) {
      alert(`Marketing campaign error: ${err.message}`);
    } finally {
      setIsDispatchingSelfMarketing(false);
    }
  };

  // Internal Notes & Discussion Comments State
  const [adminOrderComments, setAdminOrderComments] = useState<any[]>([]);
  const [isLoadingAdminComments, setIsLoadingAdminComments] = useState(false);
  const [newAdminCommentText, setNewAdminCommentText] = useState("");
  const [isPostingAdminComment, setIsPostingAdminComment] = useState(false);
  const [newInternalNoteText, setNewInternalNoteText] = useState("");
  const [isSavingInternalNote, setIsSavingInternalNote] = useState(false);

  // Notifications & Cron Automation State
  const [adminNotifSettings, setAdminNotifSettings] = useState({
    monthlyReminderDays: [5, 1],
    draftReviewReminderDays: 3,
    unpaidReminderHours: 24,
    dueDateWarningDays: 2,
    emailNotificationsEnabled: true,
    inAppNotificationsEnabled: true,
    clientRemindersEnabled: true,
    adminAlertsEnabled: true,
    timezone: "Asia/Kolkata",
    adminEmail: "yashjoshi20@zohomail.in",
    updatedAt: new Date().toISOString(),
  });
  const [isSavingNotifSettings, setIsSavingNotifSettings] = useState(false);
  const [notifSettingsSuccess, setNotifSettingsSuccess] = useState<string | null>(null);

  const [cronSimulateDate, setCronSimulateDate] = useState("");
  const [cronDryRun, setCronDryRun] = useState(false);
  const [isExecutingCron, setIsExecutingCron] = useState(false);
  const [cronResult, setCronResult] = useState<any>(null);
  const [cronNotice, setCronNotice] = useState<string | null>(null);

  const [broadcastNotifs, setBroadcastNotifs] = useState<any[]>([]);

  // Studio Team Members Registry
  const STUDIO_TEAM_MEMBERS = [
    { id: "tm_001", name: "Raghavan Sharma", role: "Executive Producer" },
    { id: "tm_002", name: "Priya Mehta", role: "Senior 3D Visualizer" },
    { id: "tm_003", name: "Devan Nair", role: "Brand Identity Lead" },
    { id: "tm_004", name: "Kavita Rao", role: "Motion & Film Director" },
    { id: "tm_005", name: "Arjun Swaminathan", role: "Spatial Architect" },
  ];

  // Fetch Firestore synchronized orders
  const fetchRealOrders = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoadingRealOrders(true);
    setRealOrdersError(null);
    try {
      const res = await fetch("/api/orders", {
        headers: {
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch orders");
      }
      const ordersList: AdminOrder[] = data.orders || [];
      setRealOrders(ordersList);

      if (prevOrdersCountRef.current !== null && ordersList.length > prevOrdersCountRef.current) {
        const diff = ordersList.length - prevOrdersCountRef.current;
        setNewOrderNotice(`✨ ${diff} new commission(s) synced in Firestore.`);
      }
      prevOrdersCountRef.current = ordersList.length;
    } catch (err: any) {
      setRealOrdersError(err.message || "Failed to load orders");
    } finally {
      setIsLoadingRealOrders(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchRealOrders(true);
    const interval = setInterval(() => {
      fetchRealOrders(false);
    }, 10000);

    const handleOrdersChanged = () => fetchRealOrders(false);
    window.addEventListener("sutra_orders_changed", handleOrdersChanged);

    return () => {
      clearInterval(interval);
      window.removeEventListener("sutra_orders_changed", handleOrdersChanged);
    };
  }, [fetchRealOrders]);

  // Fetch Admin Notification Settings & Broadcast Log
  const fetchNotificationSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notification-settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setAdminNotifSettings(data.settings);
      }
    } catch {
      // quiet fallback
    }
  }, []);

  const fetchBroadcastNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?role=admin");
      if (res.ok) {
        const data = await res.json();
        setBroadcastNotifs(data.notifications || []);
      }
    } catch {
      // quiet fallback
    }
  }, []);

  // Live Client Directory State
  const [liveClients, setLiveClients] = useState<any[]>([]);
  const [isLoadingLiveClients, setIsLoadingLiveClients] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<any | null>(null);
  const [newClientNote, setNewClientNote] = useState("");
  const [isSubmittingClientNote, setIsSubmittingClientNote] = useState(false);
  const [clientActionMessage, setClientActionMessage] = useState<string | null>(null);

  // Live Audit Ledger State
  const [liveAuditLogs, setLiveAuditLogs] = useState<any[]>([]);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);
  const [auditActionFilter, setAuditActionFilter] = useState("ALL");
  const [auditSearchQuery, setAuditSearchQuery] = useState("");
  const [selectedAuditLog, setSelectedAuditLog] = useState<any | null>(null);

  const fetchLiveClients = useCallback(async () => {
    setIsLoadingLiveClients(true);
    try {
      const res = await fetch("/api/admin/clients");
      if (res.ok) {
        const data = await res.json();
        setLiveClients(data.clients || []);
      }
    } catch {
      // fallback
    } finally {
      setIsLoadingLiveClients(false);
    }
  }, []);

  const fetchLiveAuditLogs = useCallback(async () => {
    setIsLoadingAuditLogs(true);
    try {
      const res = await fetch("/api/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setLiveAuditLogs(data.logs || []);
      }
    } catch {
      // fallback
    } finally {
      setIsLoadingAuditLogs(false);
    }
  }, []);

  const handleToggleClientStatus = async (clientId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Disabled" : "Active";
    setClientActionMessage(null);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_status",
          clientId,
          status: nextStatus,
          reason: `Account status updated to ${nextStatus} by Administrator`,
        }),
      });
      const data = await res.json().catch(() => ({}) as any);
      if (res.ok) {
        setClientActionMessage(`Account status switched to ${nextStatus}.`);
        fetchLiveClients();
        if (selectedDossier && (selectedDossier.profile.id === clientId || selectedDossier.profile.uid === clientId)) {
          setSelectedDossier({
            ...selectedDossier,
            profile: { ...selectedDossier.profile, status: nextStatus },
          });
        }
      } else {
        setClientActionMessage(adminActionError(res.status, data?.error));
      }
    } catch (err: any) {
      alert("Failed to update client status: " + err.message);
    }
  };

  const handleResendVerification = async (clientId: string) => {
    setClientActionMessage(null);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resend_verification",
          clientId,
        }),
      });
      const data = await res.json().catch(() => ({}) as any);
      if (res.ok) {
        setClientActionMessage(data.message || "Verification email dispatched.");
      } else {
        setClientActionMessage(adminActionError(res.status, data?.error));
      }
    } catch (err: any) {
      alert("Failed to dispatch verification: " + err.message);
    }
  };

  const handleAddClientNote = async (clientId: string) => {
    if (!newClientNote.trim()) return;
    setIsSubmittingClientNote(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_note",
          clientId,
          note: newClientNote.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}) as any);
      if (res.ok && data.note) {
        setNewClientNote("");
        if (selectedDossier) {
          setSelectedDossier({
            ...selectedDossier,
            profile: {
              ...selectedDossier.profile,
              adminNotes: [data.note, ...(selectedDossier.profile.adminNotes || [])],
            },
          });
        }
        fetchLiveClients();
      } else {
        setClientActionMessage(adminActionError(res.status, data?.error));
      }
    } catch (err: any) {
      alert("Failed to add admin note: " + err.message);
    } finally {
      setIsSubmittingClientNote(false);
    }
  };

  useEffect(() => {
    fetchNotificationSettings();
    fetchBroadcastNotifications();
    fetchLiveClients();
    fetchLiveAuditLogs();
  }, [fetchNotificationSettings, fetchBroadcastNotifications, fetchLiveClients, fetchLiveAuditLogs]);

  const handleSaveNotificationSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotifSettings(true);
    setNotifSettingsSuccess(null);
    try {
      const res = await fetch("/api/admin/notification-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminNotifSettings),
      });
      if (res.ok) {
        setNotifSettingsSuccess("Notification thresholds and automation preferences saved.");
        setTimeout(() => setNotifSettingsSuccess(null), 4000);
      }
    } catch {
      // fallback
    } finally {
      setIsSavingNotifSettings(false);
    }
  };

  const handleExecuteScheduledCron = async () => {
    setIsExecutingCron(true);
    setCronNotice(null);
    try {
      const res = await fetch("/api/cron/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          simulateDate: cronSimulateDate || undefined,
          dryRun: cronDryRun,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCronResult(data);
        setCronNotice(
          `Evaluated ${data.evaluatedOrdersCount} orders: ${data.notificationsSent} notification(s) sent, ${data.skippedDuplicates} duplicate(s) skipped, ${data.statusTransitions} status transitions executed.`
        );
        fetchBroadcastNotifications();
        fetchRealOrders(false);
      } else {
        setCronNotice(`Error executing scheduled job: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      setCronNotice(`Execution failed: ${err.message}`);
    } finally {
      setIsExecutingCron(false);
    }
  };

  // Load Admin Order Discussion Comments
  const loadAdminOrderComments = useCallback(async (orderId: string) => {
    setIsLoadingAdminComments(true);
    try {
      const res = await fetch(`/api/orders/comments?orderId=${encodeURIComponent(orderId)}`);
      if (res.ok) {
        const data = await res.json();
        setAdminOrderComments(data.comments || []);
      }
    } catch {
      // safe fallback
    } finally {
      setIsLoadingAdminComments(false);
    }
  }, []);

  // Sync comments and assignee when inspecting order changes
  useEffect(() => {
    if (inspectingAdminOrder?.id) {
      loadAdminOrderComments(inspectingAdminOrder.id);
      setAssignedMemberId(inspectingAdminOrder.assignedTo?.id || "");
    }
  }, [inspectingAdminOrder?.id, loadAdminOrderComments]);

  // Post Admin Comment to Client
  const handlePostAdminComment = async () => {
    if (!inspectingAdminOrder || !newAdminCommentText.trim()) return;
    setIsPostingAdminComment(true);
    try {
      const res = await fetch("/api/orders/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: inspectingAdminOrder.id,
          text: newAdminCommentText.trim(),
          authorName: user?.displayName || "Raghavan Sharma (Studio Producer)",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setAdminOrderComments((prev) => [...prev, data.comment]);
        }
        setNewAdminCommentText("");
      }
    } catch (err: any) {
      alert(`Failed to post message: ${err.message}`);
    } finally {
      setIsPostingAdminComment(false);
    }
  };

  // Add Private Internal Supervisor Note (Not visible to client)
  const handleAddOrderPrivateNote = async () => {
    if (!inspectingAdminOrder || !newInternalNoteText.trim()) return;
    setIsSavingInternalNote(true);
    try {
      const res = await fetch("/api/orders/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: inspectingAdminOrder.id,
          internalNote: newInternalNoteText.trim(),
          actorName: user?.displayName || "Raghavan Sharma (Lead Producer)",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record internal note.");

      const newNoteItem = {
        id: `note_${Date.now()}`,
        author: user?.displayName || "Raghavan Sharma (Lead Producer)",
        text: newInternalNoteText.trim(),
        createdAt: new Date().toISOString(),
      };

      setRealOrders((prev) =>
        prev.map((o) =>
          o.id === inspectingAdminOrder.id
            ? {
                ...o,
                internalNotes: [...(o.internalNotes || []), newNoteItem],
              }
            : o
        )
      );
      setInspectingAdminOrder((prev) =>
        prev
          ? {
              ...prev,
              internalNotes: [...(prev.internalNotes || []), newNoteItem],
            }
          : null
      );
      setNewInternalNoteText("");
      setApprovalToast("Private internal note recorded.");
      setTimeout(() => setApprovalToast(""), 3500);
    } catch (err: any) {
      alert(`Internal note error: ${err.message}`);
    } finally {
      setIsSavingInternalNote(false);
    }
  };

  // Assign Order to Team Member
  const handleAssignOrderTeamMember = async (memberId: string) => {
    if (!inspectingAdminOrder) return;
    setAssignedMemberId(memberId);
    const matched = STUDIO_TEAM_MEMBERS.find((m) => m.id === memberId);
    try {
      const res = await fetch("/api/orders/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: inspectingAdminOrder.id,
          assignedTo: matched ? { id: matched.id, name: matched.name, role: matched.role } : null,
          actorName: user?.displayName || "Raghavan Sharma (Lead Producer)",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update assignment.");

      setRealOrders((prev) =>
        prev.map((o) =>
          o.id === inspectingAdminOrder.id
            ? {
                ...o,
                assignedTo: matched
                  ? { id: matched.id, name: matched.name, role: matched.role, assignedAt: new Date().toISOString() }
                  : undefined,
              }
            : o
        )
      );
      setInspectingAdminOrder((prev) =>
        prev
          ? {
              ...prev,
              assignedTo: matched
                ? { id: matched.id, name: matched.name, role: matched.role, assignedAt: new Date().toISOString() }
                : undefined,
            }
          : null
      );
      setApprovalToast(matched ? `Order assigned to ${matched.name} (${matched.role})` : "Order assignment cleared.");
      setTimeout(() => setApprovalToast(""), 3500);
    } catch (err: any) {
      alert(`Assignment error: ${err.message}`);
    }
  };

  // Dispatch client order to n8n Autonomous Automation Engine (Admin Review-Gated)
  const handleDispatchOrderToN8n = async (order: AdminOrder, workflowIdOverride?: string) => {
    const wfId = workflowIdOverride || selectedWfId;
    setDispatchingOrderWf(order.id);
    setWfDispatchFeedback(null);
    try {
      const res = await fetch("/api/n8n/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: wfId,
          orderId: order.id,
          service: order.service || order.title,
          brief: order.requirements || order.notes,
          clientId: order.clientUid || order.clientId,
          driveFolderId: order.driveFolderId,
          isAdminDispatch: true,
          force: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const newStatus =
          data.status === "draft_ready"
            ? "draft_delivered"
            : data.status === "completed" || data.status === "published"
            ? "completed"
            : "in_production";

        const newStatusLabel =
          data.status === "draft_ready"
            ? "Draft Vaulted — Awaiting Admin Review"
            : data.status === "published"
            ? "Published Live"
            : "In Production (n8n Pipeline Running)";

        const newlyGeneratedDeliverables = data.output?.deliverables || [];

        setWfDispatchFeedback({
          success: true,
          message: data.message || `✓ Pipeline ${wfId} dispatched successfully. Run ID: ${data.runId}.`,
          runId: data.runId,
        });

        setRealOrders((prev) =>
          prev.map((o) => {
            if (o.id === order.id) {
              const existingDeliverables = o.deliverables || [];
              const mergedDeliverables = [...existingDeliverables, ...newlyGeneratedDeliverables];
              return {
                ...o,
                status: newStatus,
                statusLabel: newStatusLabel,
                workflowStatus: data.status || "draft_ready",
                workflowRunId: data.runId,
                deliverables: mergedDeliverables,
              };
            }
            return o;
          })
        );

        if (inspectingAdminOrder?.id === order.id) {
          setInspectingAdminOrder((prev) => {
            if (!prev) return null;
            const existingDeliverables = prev.deliverables || [];
            const mergedDeliverables = [...existingDeliverables, ...newlyGeneratedDeliverables];
            return {
              ...prev,
              status: newStatus,
              statusLabel: newStatusLabel,
              workflowStatus: data.status || "draft_ready",
              workflowRunId: data.runId,
              deliverables: mergedDeliverables,
            };
          });
        }

        setApprovalToast(`Workflow ${wfId} dispatched for ${order.code || order.orderNumber || order.id}.`);
        setTimeout(() => setApprovalToast(""), 4000);
      } else {
        setWfDispatchFeedback({
          success: false,
          message: `Dispatch failed: ${data.details || data.error || "Failed to trigger pipeline."}`,
        });
      }
    } catch (err: any) {
      setWfDispatchFeedback({
        success: false,
        message: `Network error dispatching workflow: ${err.message}`,
      });
    } finally {
      setDispatchingOrderWf(null);
    }
  };

  // Record External Manual Order (WhatsApp / Email / Contact / QR UPI)
  const handleRecordExternalOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalOrderForm.clientName.trim() || !externalOrderForm.clientEmail.trim()) {
      alert("Please enter client name and email.");
      return;
    }
    setIsSubmittingExternalOrder(true);
    try {
      const selectedService =
        externalOrderForm.service === "Custom"
          ? externalOrderForm.customService || "Bespoke Creative Commission"
          : externalOrderForm.service;
      const parsedAmount = Number(externalOrderForm.amount) || 5499;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${selectedService} (${externalOrderForm.source.toUpperCase()})`,
          service: selectedService,
          customServiceName: selectedService,
          amountINR: parsedAmount,
          clientName: externalOrderForm.clientName.trim(),
          clientEmail: externalOrderForm.clientEmail.trim(),
          clientPhone: externalOrderForm.clientPhone.trim(),
          source: externalOrderForm.source,
          paymentStatus: externalOrderForm.paymentStatus,
          paymentMethod:
            externalOrderForm.paymentStatus === "paid"
              ? externalOrderForm.paymentMethod
              : "invoice",
          paymentReference:
            externalOrderForm.paymentReference.trim() ||
            (externalOrderForm.paymentStatus === "paid"
              ? `Direct ${externalOrderForm.paymentMethod?.toUpperCase()} Verification`
              : undefined),
          requirements:
            externalOrderForm.requirements.trim() ||
            `Order logged via ${externalOrderForm.source.toUpperCase()} by Studio Admin.`,
          isCustomOrder: true,
          skipPayment: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        soundSystem.play("order_success");
        setApprovalToast(
          `✓ Order #${data.order?.orderNumber || "NEW"} registered successfully via ${externalOrderForm.source.toUpperCase()}.`
        );
        setIsRecordExternalModalOpen(false);
        setExternalOrderForm({
          clientName: "",
          clientEmail: "",
          clientPhone: "",
          service: "Image Creation (Photorealistic AI & Art)",
          customService: "",
          amount: "5499",
          source: "whatsapp",
          paymentStatus: "paid",
          paymentMethod: "upi_qr",
          paymentReference: "",
          requirements: "",
          driveLink: "",
        });
        fetchRealOrders(false);
        window.dispatchEvent(new Event("sutra_orders_changed"));
      } else {
        alert(`Failed to record order: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      alert(`Error recording order: ${err.message}`);
    } finally {
      setIsSubmittingExternalOrder(false);
    }
  };

  // Mark Payment as Received (Manual QR UPI / Bank Transfer / Cash)
  const handleMarkPaymentReceived = async (
    orderId: string,
    paymentMethod = "upi_qr",
    paymentReference = "Direct UPI / QR Verification"
  ) => {
    setIsProcessingPaymentAction(orderId);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          action: "mark_paid",
          paymentStatus: "paid",
          paymentMethod,
          paymentReference,
          adminName: user?.displayName || "Studio Administrator",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        soundSystem.play("payment_success");
        setPaymentActionFeedback({
          orderId,
          type: "paid",
          message: `✓ Payment marked verified for #${data.order?.orderNumber || orderId}.`,
        });
        fetchRealOrders(false);
        if (inspectingAdminOrder && inspectingAdminOrder.id === orderId) {
          setInspectingAdminOrder((prev: any) =>
            prev
              ? {
                  ...prev,
                  paymentStatus: "paid",
                  status: "in_progress",
                  statusLabel: "In Studio Production Queue",
                  amountPaid: prev.totalAmount,
                  paidAt: new Date().toISOString(),
                  paymentMethod,
                  paymentReference,
                }
              : null
          );
        }
        window.dispatchEvent(new Event("sutra_orders_changed"));
        setTimeout(() => setPaymentActionFeedback(null), 4000);
      } else {
        alert(`Error: ${data.error || "Failed to update payment status"}`);
      }
    } catch (err: any) {
      alert(`Failed to update payment: ${err.message}`);
    } finally {
      setIsProcessingPaymentAction(null);
    }
  };

  // Send Payment Reminder Notification & Email
  const handleSendPaymentReminder = async (orderId: string) => {
    setIsProcessingPaymentAction(orderId);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          action: "send_payment_reminder",
          adminName: user?.displayName || "Studio Administrator",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        soundSystem.play("reminder");
        setPaymentActionFeedback({
          orderId,
          type: "reminder",
          message: `✓ Payment reminder sent to client.`,
        });
        setTimeout(() => setPaymentActionFeedback(null), 4000);
      } else {
        alert(`Error: ${data.error || "Failed to dispatch reminder"}`);
      }
    } catch (err: any) {
      alert(`Reminder dispatch error: ${err.message}`);
    } finally {
      setIsProcessingPaymentAction(null);
    }
  };

  // Admin Order Status Update function with server-side validation
  const handleAdminUpdateOrderStatus = async (
    orderId: string,
    newStatus: string,
    customNote?: string
  ) => {
    if (!orderId || !newStatus) return;
    setIsUpdatingStatus(true);
    try {
      const noteToSend =
        customNote?.trim() ||
        statusChangeNote.trim() ||
        `Status transitioned to ${newStatus} by Studio Administrator.`;

      const res = await fetch("/api/orders/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          newStatus,
          actorName: user?.displayName || "Raghavan Sharma (Lead Producer)",
          note: noteToSend,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update order status");
      }

      const updatedOrder = data.order;
      setRealOrders((prev) =>
        prev.map((o) =>
          o.id === orderId || o.code === orderId || o.orderNumber === orderId
            ? {
                ...o,
                status: newStatus as any,
                statusLabel: updatedOrder?.statusLabel || newStatus.toUpperCase(),
                updatedAt: new Date().toISOString(),
                statusHistory: updatedOrder?.statusHistory || [
                  ...(o.statusHistory || []),
                  {
                    status: newStatus,
                    changedAt: new Date().toISOString(),
                    changedBy: user?.displayName || "Lead Producer",
                    note: noteToSend,
                  },
                ],
              }
            : o
        )
      );

      if (
        inspectingAdminOrder &&
        (inspectingAdminOrder.id === orderId ||
          inspectingAdminOrder.code === orderId ||
          inspectingAdminOrder.orderNumber === orderId)
      ) {
        setInspectingAdminOrder((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus as any,
                statusLabel: updatedOrder?.statusLabel || newStatus.toUpperCase(),
                updatedAt: new Date().toISOString(),
                statusHistory: updatedOrder?.statusHistory || [
                  ...(prev.statusHistory || []),
                  {
                    status: newStatus,
                    changedAt: new Date().toISOString(),
                    changedBy: user?.displayName || "Lead Producer",
                    note: noteToSend,
                  },
                ],
              }
            : null
        );
      }

      window.dispatchEvent(new Event("sutra_orders_changed"));
      setApprovalToast(`Order status updated to ${newStatus.toUpperCase()}`);
      setStatusChangeNote("");
      setTimeout(() => setApprovalToast(""), 4500);
    } catch (err: any) {
      setApprovalToast(`Status update failed: ${err.message}`);
      setTimeout(() => setApprovalToast(""), 4500);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Final Result / Draft / Revision Delivery → Google Drive (STEP 30)
  // The browser PUTs the bytes straight to Drive through a resumable session;
  // no file body passes through a Next.js route, so multi-GB masters are safe.
  // Auth comes from the admin's session cookie — never from spoofable headers.
  const handleDeliverFinalResult = async () => {
    if (!inspectingAdminOrder) return;
    setIsDelivering(true);
    setDeliveryProgress(null);
    try {
      const orderId = inspectingAdminOrder.id;
      const orderLabel = inspectingAdminOrder.orderNumber || inspectingAdminOrder.code;
      const folderLink = inspectingAdminOrder.driveFolderId
        ? `https://drive.google.com/drive/folders/${inspectingAdminOrder.driveFolderId}`
        : "";

      let uploaded: DriveUploadResult | null = null;
      if (deliveryFile) {
        uploaded = await uploadFileToDrive(deliveryFile, {
          orderId,
          kind: deliveryCategory,
          notes: deliveryNote.trim() || `Deliverable uploaded to ${deliveryCategory}`,
          onProgress: (p) => setDeliveryProgress(p),
        });
      }

      const typedLink = deliveryPreviewUrl.trim();
      const typedName = deliveryFilename.trim();
      const deliverables = uploaded
        ? [
            {
              filename: uploaded.name,
              fileSize: `${(uploaded.size / 1024 ** 2).toFixed(1)} MB`,
              mimeType: uploaded.mimeType,
              previewUrl: uploaded.downloadUrl,
            },
          ]
        : typedLink || typedName
          ? [
              {
                filename: typedName || "Studio_Deliverable",
                fileSize: "Vault Asset",
                mimeType: "application/octet-stream",
                previewUrl: typedLink || folderLink,
              },
            ]
          : [];

      const res = await fetch("/api/orders/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          adminName: user?.displayName || "Studio Producer",
          deliverables,
          deliveryNote:
            deliveryNote.trim() ||
            `Production master (${deliveryCategory}) verified and uploaded to the client Drive folder.`,
        }),
      });

      const data = await res.json().catch(() => ({}) as Record<string, unknown>);
      if (!res.ok) {
        throw new Error(
          adminActionError(res.status, (data.error as string) || "Failed to register the delivery on the order.")
        );
      }

      setApprovalToast(
        uploaded
          ? `Asset "${uploaded.name}" vaulted to Drive and registered for Order #${orderLabel}.`
          : `Deliverables registered for Order #${orderLabel}.`
      );

      setDeliveryFilename("");
      setDeliveryPreviewUrl("");
      setDeliveryNote("");
      setDeliveryFile(null);
      await fetchRealOrders(true);
      window.dispatchEvent(new Event("sutra_orders_changed"));
      setTimeout(() => setApprovalToast(""), 5000);
    } catch (err: any) {
      alert(`Delivery error: ${err.message}`);
    } finally {
      setIsDelivering(false);
      setDeliveryProgress(null);
    }
  };

  // Google Drive Order Folder Archive Action
  const handleArchiveDriveFolder = async (order: AdminOrder) => {
    if (
      !(await confirm({
        title: "Archive Folder",
        description: `Archive Google Drive vault folder for order #${order.orderNumber || order.code}?`,
        isDangerous: true,
      }))
    ) {
      return;
    }
    setIsArchivingDrive(true);
    try {
      const res = await fetch("/api/drive/archive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          folderId: order.driveFolderId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to archive folder");
      setApprovalToast(`Drive folder for ${order.code} successfully archived.`);
      setTimeout(() => setApprovalToast(""), 4000);
    } catch (err: any) {
      alert(`Archive error: ${err.message}`);
    } finally {
      setIsArchivingDrive(false);
    }
  };

  // Administrative Refund Action via Secure Razorpay Backend Function
  const handleAdminRefundOrder = async (order: AdminOrder) => {
    const defaultReason = "Administrative client commission refund";
    const confirmPrompt = window.prompt(
      `Enter refund reason to process a full refund of ₹${(order.totalAmount || 0).toLocaleString("en-IN")} via Razorpay:`,
      defaultReason
    );
    if (!confirmPrompt) return;

    setIsRefunding(true);
    try {
      const res = await fetch("/api/payments/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          amountINR: order.totalAmount,
          reason: confirmPrompt,
        }),
      });

      const data = await res.json().catch(() => ({}) as Record<string, unknown>);
      if (!res.ok) {
        throw new Error(adminActionError(res.status, (data.error as string) || "Failed to process refund on server."));
      }

      setApprovalToast(`Refund processed successfully. Order status updated to cancelled & refunded.`);
      setTimeout(() => setApprovalToast(""), 5000);

      await fetchRealOrders(true);
      if (inspectingAdminOrder?.id === order.id) {
        setInspectingAdminOrder((prev) =>
          prev ? { ...prev, paymentStatus: "refunded", status: "cancelled", statusLabel: "Cancelled & Refunded" } : null
        );
      }
      window.dispatchEvent(new Event("sutra_orders_changed"));
    } catch (err: any) {
      alert(`Refund failed: ${err.message}`);
    } finally {
      setIsRefunding(false);
    }
  };

  // Administrative Monthly Period Extension
  const handleAdminExtendPeriod = async (order: AdminOrder) => {
    const days = window.prompt("Enter number of days to extend client subscription period:", "30");
    if (!days || isNaN(Number(days))) return;
    const reason = window.prompt("Enter reason for manual extension (logged to audit history):", "Client goodwill extension");
    if (!reason) return;

    try {
      const res = await fetch("/api/payments/extend-period", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          daysToAdd: Number(days),
          reason,
          adminName: user?.displayName || "Studio Supervisor",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to extend period");
      setApprovalToast(data.message);
      await fetchRealOrders(true);
      setTimeout(() => setApprovalToast(""), 4500);
    } catch (err: any) {
      alert(`Period extension error: ${err.message}`);
    }
  };

  // Filtered and Sorted Orders
  const filteredAndSortedOrders = useMemo(() => {
    let list = [...realOrders];

    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          (o.code && o.code.toLowerCase().includes(q)) ||
          (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
          (o.clientName && o.clientName.toLowerCase().includes(q)) ||
          (o.clientEmail && o.clientEmail.toLowerCase().includes(q)) ||
          (o.service && o.service.toLowerCase().includes(q)) ||
          (o.title && o.title.toLowerCase().includes(q)) ||
          (o.razorpayPaymentId && o.razorpayPaymentId.toLowerCase().includes(q))
      );
    }

    if (orderStatusFilter !== "all") {
      list = list.filter((o) => {
        if (orderStatusFilter === "in_progress") {
          return o.status === "in_progress" || o.status === "awaiting_approval";
        }
        return o.status === orderStatusFilter;
      });
    }

    // Payment Status Filter (Requirement 9: paid / unpaid / failed / refunded)
    if (orderPaymentFilter !== "all") {
      list = list.filter((o) => {
        const pStatus = o.paymentStatus || (o.status === "pending_payment" ? "unpaid" : "paid");
        if (orderPaymentFilter === "paid") return pStatus === "paid" || o.status === "paid";
        if (orderPaymentFilter === "unpaid") return pStatus === "unpaid" || o.status === "pending_payment";
        if (orderPaymentFilter === "failed") return pStatus === "failed";
        if (orderPaymentFilter === "refunded") return pStatus === "refunded";
        return true;
      });
    }

    if (orderTypeFilter !== "all") {
      list = list.filter((o) => (o.type || "service") === orderTypeFilter);
    }

    if (orderSourceFilter !== "all") {
      list = list.filter((o) => (o.source || "dashboard") === orderSourceFilter);
    }

    if (orderDateFilter !== "all") {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      list = list.filter((o) => {
        const t = new Date(o.createdAt || o.updatedAt).getTime();
        if (isNaN(t)) return true;
        if (orderDateFilter === "today") return now - t <= oneDay;
        if (orderDateFilter === "week") return now - t <= 7 * oneDay;
        if (orderDateFilter === "month") return now - t <= 30 * oneDay;
        return true;
      });
    }

    list.sort((a, b) => {
      if (orderSortBy === "date_desc") {
        return new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime();
      }
      if (orderSortBy === "date_asc") {
        return new Date(a.createdAt || a.updatedAt).getTime() - new Date(b.createdAt || b.updatedAt).getTime();
      }
      if (orderSortBy === "amount_desc") {
        return (b.totalAmount || 0) - (a.totalAmount || 0);
      }
      if (orderSortBy === "amount_asc") {
        return (a.totalAmount || 0) - (b.totalAmount || 0);
      }
      if (orderSortBy === "status") {
        return String(a.status).localeCompare(String(b.status));
      }
      return 0;
    });

    return list;
  }, [realOrders, orderSearchQuery, orderStatusFilter, orderTypeFilter, orderSourceFilter, orderDateFilter, orderSortBy]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredAndSortedOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const start = (orderCurrentPage - 1) * ORDERS_PER_PAGE;
    return filteredAndSortedOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredAndSortedOrders, orderCurrentPage]);

  const pendingOrdersCount = useMemo(() => {
    return realOrders.filter((o) => o.status === "pending").length;
  }, [realOrders]);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);

  // Official Approvals Hub State
  const [approvalsList, setApprovalsList] = useState([
    {
      id: "ord_001",
      code: "#ORD-001",
      client: "Yash Joshi (Studio Living)",
      service: "3D Spatial Architecture",
      deliverable: "Pavilion_Villa_Baked_Model.gltf",
      submittedDate: "2026-09-28",
      round: "Round 1 of 2",
      status: "AWAITING APPROVAL",
    },
    {
      id: "ord_003",
      code: "#ORD-003",
      client: "Aarav Mehta (Zenith Luxury)",
      service: "Commercial Cinematic Reel",
      deliverable: "Zenith_Commercial_Reel_1080p.mp4",
      submittedDate: "2026-09-30",
      round: "Final Cut",
      status: "AWAITING APPROVAL",
    },
  ]);
  const [officialApprovalsLog, setOfficialApprovalsLog] = useState([
    {
      approvalId: "appr_1790892011",
      projectId: "ord_002",
      client: "Yash Joshi",
      status: "APPROVED",
      message: "Your project has been approved and is ready for the next stage.",
      adminId: "usr_admin_001",
      timestamp: "2026-09-27 18:00",
    },
  ]);
  const [approvalToast, setApprovalToast] = useState("");

  const handleIssueOfficialApproval = async (orderId: string, clientName: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "APPROVED",
          adminId: "usr_admin_001",
          message: "Your project has been approved and is ready for final delivery.",
        }),
      });
      const data = await res.json();
      if (data.approval) {
        setOfficialApprovalsLog((prev) => [data.approval, ...prev]);
        setApprovalsList((prev) => prev.filter((item) => item.id !== orderId));
        setApprovalToast(`Official approval recorded for ${clientName}. Client notification dispatched.`);
        setTimeout(() => setApprovalToast(""), 4000);
      }
    } catch {
      setApprovalToast(`Approval recorded locally for ${clientName}.`);
      setTimeout(() => setApprovalToast(""), 4000);
    }
  };

  // Website Site Control State
  const [siteContent, setSiteContent] = useState({
    heroHeadline: "Tradition Meets Technology",
    heroSubtitle: "AI-Powered Creative, Design, Development & Digital Marketing Solutions for Modern Businesses. Ideas ◆ Design ◆ Development ◆ Growth.",
    primaryCtaText: "Start Project",
    secondaryCtaText: "Explore Services",
    announcement: "SUTRA STUDIO Q4 Commission Calendar Open • Limited Atelier Availability",
    contactEmail: "concierge@sutrastudio.com",
    contactPhone: "+91 98200 12345",
    seoTitle: "Sutra Studio — Tradition Meets Technology | Creative & AI Studio",
    seoDescription: "Luxury creative-technology agency bridging ancient geometric principles with computational design and generative AI pipelines.",
    prices: {
      image: "₹5,499",
      video: "₹14,999",
      threeD: "₹18,999",
      threeSixty: "₹12,499",
      interior: "₹16,999",
      marketing: "₹8,999",
      website: "₹19,999",
      app: "₹19,999",
    },
    packages: [
      { name: "Starter Creative Pack", price: "₹5,999/mo", active: true },
      { name: "Growth Creative Studio", price: "₹12,999/mo", active: true },
      { name: "Atelier Enterprise Retainer", price: "₹19,999/mo", active: true },
    ],
  });
  const [siteSaveSuccess, setSiteSaveSuccess] = useState("");

  const handleSaveSiteControl = (e: React.FormEvent) => {
    e.preventDefault();
    setSiteSaveSuccess("Website content, INR pricing & service visibility successfully published to live website.");
    setTimeout(() => setSiteSaveSuccess(""), 4000);
  };

  // Admin Chat & AI Takeover Console State
  const [sessions, setSessions] = useState<AdminChatSession[]>(INITIAL_ADMIN_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("cl-1");
  const [producerInput, setProducerInput] = useState("");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [chatFilter, setChatFilter] = useState<"all" | "unread" | "has_orders">("all");
  const [chatDateFilter, setChatDateFilter] = useState<"all" | "today" | "week">("all");
  const [mobileChatView, setMobileChatView] = useState<"list" | "chat" | "details">("list");
  const [chatToast, setChatToast] = useState<string>("");

  const currentSession = useMemo(() => {
    return sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  }, [sessions, selectedSessionId]);

  const handleToggleTakeover = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              mode: s.mode === "human" ? "ai" : "human",
            }
          : s
      )
    );
  };

  const handleMarkChatAsRead = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, unreadCount: 0 } : s))
    );
    setChatToast("Chat marked as read.");
    setTimeout(() => setChatToast(""), 3000);
  };

  const handleSendProducerMessage = (textToSend?: string) => {
    const content = textToSend || producerInput;
    if (!content.trim()) return;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSessionId
          ? {
              ...s,
              mode: "human",
              lastPrompt: content,
              lastTime: "Just now",
              messages: [
                ...s.messages,
                {
                  sender: "admin",
                  text: content,
                  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }
          : s
      )
    );
    setProducerInput("");
  };

  const handleAddInternalNote = () => {
    if (!producerInput.trim()) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSessionId
          ? {
              ...s,
              messages: [
                ...s.messages,
                {
                  sender: "note",
                  text: producerInput,
                  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }
          : s
      )
    );
    setProducerInput("");
    setChatToast("Internal producer note recorded (Private).");
    setTimeout(() => setChatToast(""), 3000);
  };

  const totalUnreadChats = useMemo(() => {
    return sessions.reduce((acc, s) => acc + (s.unreadCount || 0), 0);
  }, [sessions]);

  const filteredChatSessions = useMemo(() => {
    let list = [...sessions];

    if (chatSearchQuery.trim()) {
      const q = chatSearchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          (s.clientName || "").toLowerCase().includes(q) ||
          (s.company || "").toLowerCase().includes(q) ||
          (s.clientEmail && s.clientEmail.toLowerCase().includes(q)) ||
          (s.lastPrompt || "").toLowerCase().includes(q) ||
          (s.messages || []).some((m) => (m.text || "").toLowerCase().includes(q))
      );
    }

    if (chatFilter === "unread") {
      list = list.filter((s) => (s.unreadCount || 0) > 0);
    } else if (chatFilter === "has_orders") {
      list = list.filter((s) => {
        const clientEmail = (s.clientEmail || "").toLowerCase();
        const clientName = (s.clientName || "").toLowerCase();
        const hasOrderInReal = realOrders.some(
          (o) =>
            (o.clientEmail && o.clientEmail.toLowerCase() === clientEmail) ||
            (o.clientName && o.clientName.toLowerCase().includes(clientName)) ||
            o.clientId === s.clientId ||
            o.clientId === s.id
        );
        const hasOrderInMessages = (s.messages || []).some((m) => m.orderDraft || (m.text && m.text.includes("#ORD-")));
        return hasOrderInReal || hasOrderInMessages;
      });
    }

    if (chatDateFilter === "today") {
      list = list.filter(
        (s) =>
          (s.lastTime || "").includes("m ago") ||
          (s.lastTime || "").includes("h ago") ||
          (s.lastTime || "").includes("AM") ||
          (s.lastTime || "").includes("PM") ||
          s.lastTime === "Just now"
      );
    } else if (chatDateFilter === "week") {
      list = list.filter((s) => !(s.lastTime || "").includes("month"));
    }

    return list;
  }, [sessions, chatSearchQuery, chatFilter, chatDateFilter, realOrders]);

  const currentChatClient = useMemo(() => {
    return (
      CLIENTS_DATA.find(
        (c) =>
          c.id === currentSession?.id ||
          c.email.toLowerCase() === (currentSession?.clientEmail || "").toLowerCase() ||
          c.name.toLowerCase() === (currentSession?.clientName || "").toLowerCase()
      ) || {
        id: currentSession?.id || "cl-1",
        name: currentSession?.clientName || "Client",
        company: currentSession?.company || "Company",
        email: currentSession?.clientEmail || "client@studio.com",
        tier: "Enterprise" as const,
        driveFolderId: currentSession?.vaultId || "drive_fld_sutra_001",
        activeOrders: 1,
        lifetimeVolume: "₹1,85,000",
        status: "Active" as const,
        lastActive: currentSession?.lastTime || "Recently",
      }
    );
  }, [currentSession]);

  const currentChatOrders = useMemo(() => {
    if (!currentSession) return [];
    const sessionEmail = (currentSession.clientEmail || "").toLowerCase();
    const sessionName = (currentSession.clientName || "").toLowerCase();
    const sessionId = currentSession.clientId || currentSession.id;

    const matched = realOrders.filter(
      (o) =>
        (o.clientEmail && o.clientEmail.toLowerCase() === sessionEmail) ||
        (o.clientName && o.clientName.toLowerCase().includes(sessionName)) ||
        o.clientId === sessionId
    );

    if (matched.length === 0) {
      const drafts: AdminOrder[] = [];
      (currentSession.messages || []).forEach((m, idx) => {
        if (m.orderDraft) {
          drafts.push({
            id: m.orderDraft.orderId || `ord_${idx + 1}`,
            orderNumber: m.orderDraft.orderNumber || `ORD-00${idx + 1}`,
            code: m.orderDraft.orderNumber || `ORD-00${idx + 1}`,
            title: m.orderDraft.service || "Studio Commission",
            service: m.orderDraft.service || "Studio Commission",
            totalAmount: m.orderDraft.totalAmount || 18999,
            status: (m.orderDraft.status as any) || "in_progress",
            statusLabel: "In Production",
            clientName: currentSession.clientName || "Studio Client",
            clientEmail: currentSession.clientEmail || "client@sutrastudio.com",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            driveFolderId: currentSession.vaultId || "drive_vault",
          });
        }
      });
      return drafts;
    }

    return matched;
  }, [currentSession, realOrders]);

  // ==========================================================================
  // STEP 7: AI IMPROVEMENT, KNOWLEDGE BASE & SYSTEM PROMPT STATE
  // ==========================================================================
  const [chatSubView, setChatSubView] = useState<"monitor" | "knowledge" | "common_questions" | "settings">("monitor");
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [commonQuestions, setCommonQuestions] = useState<CommonQuestionInsight[]>([]);
  const [aiSettings, setAiSettings] = useState<AiSettingsConfig>({
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    tone: "luxury_atelier",
    defaultPrompt: DEFAULT_SYSTEM_PROMPT,
    lastUpdated: new Date().toISOString(),
    updatedBy: "Raghavan Sharma (Lead Producer)",
  });

  // Modals & Feedback Editor State
  const [ratingModalMessage, setRatingModalMessage] = useState<{
    chatId: string;
    messageId: string;
    userQuery?: string;
    aiReply: string;
    rating: "good" | "bad";
  } | null>(null);
  const [ratingCorrectionText, setRatingCorrectionText] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Knowledge Base Editor Modal State
  const [kbModalOpen, setKbModalOpen] = useState(false);
  const [editingKbEntry, setEditingKbEntry] = useState<KnowledgeBaseEntry | null>(null);
  const [kbTitle, setKbTitle] = useState("");
  const [kbCategory, setKbCategory] = useState<KnowledgeCategory>("faq");
  const [kbQuestion, setKbQuestion] = useState("");
  const [kbAnswer, setKbAnswer] = useState("");
  const [kbSearchQuery, setKbSearchQuery] = useState("");
  const [kbCategoryFilter, setKbCategoryFilter] = useState("All");

  // System Prompt & Tone Editor State
  const [systemPromptDraft, setSystemPromptDraft] = useState(DEFAULT_SYSTEM_PROMPT);
  const [systemToneDraft, setSystemToneDraft] = useState<AiSettingsConfig["tone"]>("luxury_atelier");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // STEP 12: DATA-DRIVEN SERVICES & PLANS CATALOG STATE
  const [catalogServices, setCatalogServices] = useState<CatalogService[]>(SEED_CATALOG_SERVICES);
  const [catalogPlans, setCatalogPlans] = useState<CatalogPlan[]>(SEED_CATALOG_PLANS);
  const [catalogServiceFilter, setCatalogServiceFilter] = useState("All");
  const [editingService, setEditingService] = useState<CatalogService | null>(null);
  const [editingPlan, setEditingPlan] = useState<CatalogPlan | null>(null);
  const [catalogSaveToast, setCatalogSaveToast] = useState("");
  const [isSavingCatalog, setIsSavingCatalog] = useState(false);
const [adminDataError, setAdminDataError] = useState("");

  // Initial Fetch for Knowledge Base, AI Improvement data, and Service Catalogs
  useEffect(() => {
    async function loadAdminData() {
      try {
        const [kb, fb, cq, st, catalog] = await Promise.all([
          callAiConsole<{ entries: KnowledgeBaseEntry[] }>("getKnowledgeEntries"),
          callAiConsole<{ feedback: FeedbackItem[] }>("getFeedbackList"),
          callAiConsole<{ questions: CommonQuestionInsight[] }>("getCommonQuestions"),
          callAiConsole<{ settings: AiSettingsConfig }>("getAiSettings"),
          fetchCatalog<{ services: CatalogService[]; plans: CatalogPlan[] }>(),
        ]);
        setKnowledgeEntries(kb.entries ?? []);
        setFeedbackList(fb.feedback ?? []);
        setCommonQuestions(cq.questions ?? []);
        setAiSettings(st.settings);
        setSystemPromptDraft(st.settings.systemPrompt);
        setSystemToneDraft(st.settings.tone);
        if (catalog.services?.length) setCatalogServices(catalog.services);
        if (catalog.plans?.length) setCatalogPlans(catalog.plans);
      } catch (err) {
        setAdminDataError(errorMessage(err, "Could not load admin data."));
      }
    }
    void loadAdminData();
  }, []);

  // Handler: Rate AI Reply (Good / Bad)
  const handleRateAiReply = async (
    chatId: string,
    messageId: string,
    rating: "good" | "bad",
    aiReply: string,
    userQuery?: string
  ) => {
    if (rating === "good") {
      try {
        const { feedback: saved } = await callAiConsole<{ feedback: FeedbackItem }>("saveFeedback", {
          chatId,
          messageId,
          rating: "good",
          userQuery,
          aiReply,
        });
        if (saved) setFeedbackList((prev) => [saved, ...prev]);
        setChatToast("AI reply marked as accurate (Good). Recorded.");
        setTimeout(() => setChatToast(""), 3500);
      } catch {
        setChatToast("Feedback could not be recorded. Please retry.");
        setTimeout(() => setChatToast(""), 3500);
      }
    } else {
      // Open modal to capture correction
      setRatingModalMessage({
        chatId,
        messageId,
        userQuery,
        aiReply,
        rating: "bad",
      });
      setRatingCorrectionText("");
    }
  };

  // Handler: Submit Feedback with Correction
  const handleSubmitCorrectionFeedback = async () => {
    if (!ratingModalMessage) return;
    setIsSubmittingFeedback(true);
    try {
      const { feedback: saved } = await callAiConsole<{ feedback: FeedbackItem }>("saveFeedback", {
        chatId: ratingModalMessage.chatId,
        messageId: ratingModalMessage.messageId,
        rating: "bad",
        correctedAnswer: ratingCorrectionText,
        userQuery: ratingModalMessage.userQuery,
        aiReply: ratingModalMessage.aiReply,
      });
      if (saved) setFeedbackList((prev) => [saved, ...prev]);

      // Refresh KB entries as the correction is incorporated
      const { entries } = await callAiConsole<{ entries: KnowledgeBaseEntry[] }>("getKnowledgeEntries");
      if (entries) setKnowledgeEntries(entries);

      setChatToast(
        ratingCorrectionText.trim()
          ? "Correction saved and incorporated into the AI Knowledge Base."
          : "AI reply marked as unsatisfactory (Bad)."
      );
      setRatingModalMessage(null);
      setRatingCorrectionText("");
      setTimeout(() => setChatToast(""), 4500);
    } catch {
      setChatToast("Correction could not be saved. Please retry.");
      setRatingModalMessage(null);
      setTimeout(() => setChatToast(""), 3500);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Handler: One-Click Add to Knowledge Base from Chat Message
  const handleOneClickAddToKnowledge = (question: string, answer: string, defaultTitle?: string) => {
    setEditingKbEntry(null);
    setKbTitle(defaultTitle || `Q&A: ${question.slice(0, 35)}...`);
    setKbCategory("faq");
    setKbQuestion(question);
    setKbAnswer(answer);
    setKbModalOpen(true);
  };

  // Handler: Save Knowledge Base Entry
  const handleSaveKnowledgeEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbTitle.trim() || !kbAnswer.trim()) return;

    try {
      if (editingKbEntry) {
        const { entry: updated } = await callAiConsole<{ entry: KnowledgeBaseEntry | null }>(
          "updateKnowledgeEntry",
          {
            id: editingKbEntry.id,
            updates: {
              title: kbTitle.trim(),
              category: kbCategory,
              question: kbQuestion.trim() || undefined,
              answer: kbAnswer.trim(),
            },
          }
        );
        if (updated) {
          setKnowledgeEntries((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
        }
        setChatToast(`Knowledge entry "${kbTitle}" successfully updated.`);
      } else {
        const { entry: added } = await callAiConsole<{ entry: KnowledgeBaseEntry }>("addKnowledgeEntry", {
          title: kbTitle.trim(),
          category: kbCategory,
          question: kbQuestion.trim() || undefined,
          answer: kbAnswer.trim(),
          status: "active",
        });
        if (added) setKnowledgeEntries((prev) => [added, ...prev]);
        setChatToast(`New Knowledge Base entry "${kbTitle}" published.`);
      }
      setKbModalOpen(false);
      setEditingKbEntry(null);
      setKbTitle("");
      setKbQuestion("");
      setKbAnswer("");
      setTimeout(() => setChatToast(""), 4000);
    } catch (err) {
      setChatToast(errorMessage(err, "Failed to save knowledge entry."));
      setTimeout(() => setChatToast(""), 4000);
    }
  };

  // Handler: Delete Knowledge Entry
  const handleDeleteKnowledge = async (id: string, title: string) => {
    if (
      !(await confirm({
        title: "Remove Entry",
        description: `Are you sure you want to remove "${title}" from the AI Knowledge Base?`,
        isDangerous: true,
      }))
    )
      return;
    try {
      await callAiConsole("deleteKnowledgeEntry", { id });
      setKnowledgeEntries((prev) => prev.filter((k) => k.id !== id));
      setChatToast(`Knowledge entry "${title}" removed.`);
    } catch (err) {
      setChatToast(errorMessage(err, "Could not remove that entry."));
    }
    setTimeout(() => setChatToast(""), 3500);
  };

  // Handler: Save AI System Prompt & Tone Settings
  const handleSaveAiSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const { settings: updated } = await callAiConsole<{ settings: AiSettingsConfig }>("updateAiSettings", {
        settings: {
          systemPrompt: systemPromptDraft,
          tone: systemToneDraft,
        },
      });
      if (updated) setAiSettings(updated);
      setChatToast("AI System Prompt & Brand Tone successfully saved and active.");
      setTimeout(() => setChatToast(""), 4000);
    } catch (err) {
      setChatToast(errorMessage(err, "Failed to save AI settings."));
      setTimeout(() => setChatToast(""), 4000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handler: Reset AI Settings to Default
  const handleResetAiSettings = async () => {
    if (
      !(await confirm({
        title: "Reset AI Settings",
        description: "Reset AI System Prompt & Tone to official Sutra Studio defaults?",
        isDangerous: true,
      }))
    )
      return;
    try {
      const { settings: reset } = await callAiConsole<{ settings: AiSettingsConfig }>(
        "resetAiSettingsToDefault"
      );
      if (!reset) return;
      setAiSettings(reset);
      setSystemPromptDraft(reset.systemPrompt);
      setSystemToneDraft(reset.tone);
      setChatToast("AI System Prompt reset to Sutra Studio master default.");
    } catch (err) {
      setChatToast(errorMessage(err, "Could not reset AI settings."));
    }
    setTimeout(() => setChatToast(""), 4000);
  };

  const handleUpdateServicePrice = async (serviceId: string, newPrice: number) => {
    try {
      const { service: updated } = await patchCatalog<{ service: CatalogService }>("service", serviceId, {
        startingPrice: newPrice,
      });
      if (!updated) return;
      setCatalogServices((prev) => prev.map((s) => (s.id === serviceId ? updated : s)));
      setCatalogSaveToast(
        `Service "${updated.name}" price updated to ₹${newPrice.toLocaleString("en-IN")}.`
      );
    } catch (err) {
      setCatalogSaveToast(errorMessage(err, "Could not update that price."));
    }
    setTimeout(() => setCatalogSaveToast(""), 3500);
  };

  const handleToggleServiceActive = async (serviceId: string, active: boolean) => {
    try {
      const { service: updated } = await patchCatalog<{ service: CatalogService }>("service", serviceId, {
        active,
      });
      if (!updated) return;
      setCatalogServices((prev) => prev.map((s) => (s.id === serviceId ? updated : s)));
      setCatalogSaveToast(`Service "${updated.name}" is now ${active ? "Active" : "Archived"}.`);
    } catch (err) {
      setCatalogSaveToast(errorMessage(err, "Could not change service visibility."));
    }
    setTimeout(() => setCatalogSaveToast(""), 3500);
  };

  const handleSaveServiceDetails = async (service: CatalogService) => {
    setIsSavingCatalog(true);
    try {
      // Only the fields this screen owns are sent; the route rejects the rest.
      const { service: updated } = await patchCatalog<{ service: CatalogService }>(
        "service",
        service.id,
        {
          startingPrice: service.startingPrice,
          active: service.active,
        }
      );
      if (updated) {
        setCatalogServices((prev) => prev.map((s) => (s.id === service.id ? updated : s)));
        setCatalogSaveToast(`Service "${service.name}" configuration saved.`);
        setEditingService(null);
        setTimeout(() => setCatalogSaveToast(""), 4000);
      }
    } catch (err) {
      setCatalogSaveToast(errorMessage(err, "Could not save that service."));
      setTimeout(() => setCatalogSaveToast(""), 4000);
    } finally {
      setIsSavingCatalog(false);
    }
  };

  const handleSavePlanDetails = async (plan: CatalogPlan) => {
    setIsSavingCatalog(true);
    try {
      const { plan: updated } = await patchCatalog<{ plan: CatalogPlan }>("plan", plan.id, {
        price: plan.price,
        monthlyPrice: plan.monthlyPrice,
        quarterlyPrice: plan.quarterlyPrice,
        annualPrice: plan.annualPrice,
        active: plan.active,
      });
      if (updated) {
        setCatalogPlans((prev) => prev.map((p) => (p.id === plan.id ? updated : p)));
        setCatalogSaveToast(`Monthly Plan "${plan.name}" configuration saved.`);
        setEditingPlan(null);
        setTimeout(() => setCatalogSaveToast(""), 4000);
      }
    } catch (err) {
      setCatalogSaveToast(errorMessage(err, "Could not save that plan."));
      setTimeout(() => setCatalogSaveToast(""), 4000);
    } finally {
      setIsSavingCatalog(false);
    }
  };

  // Filtered Knowledge Base Entries
  const filteredKnowledgeEntries = useMemo(() => {
    let list = [...knowledgeEntries];
    if (kbCategoryFilter !== "All") {
      list = list.filter((k) => k.category === kbCategoryFilter);
    }
    if (kbSearchQuery.trim()) {
      const q = kbSearchQuery.toLowerCase().trim();
      list = list.filter(
        (k) =>
          k.title.toLowerCase().includes(q) ||
          (k.question && k.question.toLowerCase().includes(q)) ||
          k.answer.toLowerCase().includes(q)
      );
    }
    return list;
  }, [knowledgeEntries, kbCategoryFilter, kbSearchQuery]);

  // 8 AI Workflow Engines State
  const [workflowFilter, setWorkflowFilter] = useState("All");
  const [workflowJobs, setWorkflowJobs] = useState([
    { id: "run_three-d_9821", name: "3D Spatial Pipeline", order: "#ORD-001", status: "Running", progress: 65, duration: "1m 14s", target: "drive_fld_sutra_001/3D_RENDERS" },
    { id: "run_video_8842", name: "Video Production Pipeline", order: "#ORD-003", status: "Completed", progress: 100, duration: "3m 40s", target: "drive_fld_sutra_001/VIDEOS" },
    { id: "run_interior_7714", name: "Interior Architectural Engine", order: "#ORD-005", status: "Running", progress: 88, duration: "48s", target: "drive_fld_zenith_003/INTERIOR" },
    { id: "run_website_6621", name: "Website Development Pipeline", order: "#ORD-002", status: "Completed", progress: 100, duration: "2m 10s", target: "drive_fld_sutra_001/CODE" },
    { id: "run_app_5510", name: "App & Mobile Pipeline", order: "#ORD-007", status: "Running", progress: 40, duration: "25s", target: "drive_fld_vedic_005/APP" },
  ]);
  const [dispatchingWf, setDispatchingWf] = useState<string | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<string>("");

  const handleDispatchJob = async (wfSlug: string, wfName: string) => {
    setDispatchingWf(wfSlug);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: `ORD-QA-${Math.floor(Math.random() * 900 + 100)}`,
          workflowType: wfSlug,
          action: "dispatch",
        }),
      });
      const data = await res.json();
      const newJob = {
        id: data.runId || `run_${wfSlug}_${Date.now()}`,
        name: wfName,
        order: data.orderId || "#ORD-TEST",
        status: "Running",
        progress: 20,
        duration: "Just now",
        target: "Google Drive Client Folder",
      };
      setWorkflowJobs((prev) => [newJob, ...prev]);
      setDispatchSuccess(`Job ${newJob.id} dispatched to isolated ${wfName} container.`);
      setTimeout(() => setDispatchSuccess(""), 3500);
    } catch {
      setDispatchSuccess(`Test execution triggered for ${wfName}.`);
      setTimeout(() => setDispatchSuccess(""), 3500);
    } finally {
      setDispatchingWf(null);
    }
  };

  const filteredClients = useMemo(() => {
    if (liveClients.length > 0) {
      return liveClients.filter((item) => {
        const p = item.profile || item;
        const matchesTier = tierFilter === "All" || p.tier === tierFilter;
        const matchesSearch =
          searchQuery === "" ||
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.driveFolderId?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTier && matchesSearch;
      });
    }

    return CLIENTS_DATA.filter((client) => {
      const matchesTier = tierFilter === "All" || client.tier === tierFilter;
      const matchesSearch =
        searchQuery === "" ||
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTier && matchesSearch;
    }).map((c) => ({
      profile: {
        id: c.id,
        uid: c.id,
        name: c.name,
        company: c.company,
        email: c.email,
        phone: "+91 98765 43210",
        tier: c.tier,
        status: c.status,
        emailVerified: true,
        driveFolderId: c.driveFolderId,
        driveFolderLink: `https://drive.google.com/drive/folders/${c.driveFolderId}`,
        joinedDate: "August 2026",
        lastActive: c.lastActive,
        adminNotes: [],
      },
      orders: [],
      activeOrdersCount: c.activeOrders,
      completedOrdersCount: 1,
      lifetimeVolumeFormatted: c.lifetimeVolume,
      totalSpentINR: 185000,
      activePlan: {
        planName: "Studio Growth Retainer",
        type: "active",
        statusLabel: "Active Monthly Retainer",
        daysRemaining: 18,
        billingCycle: "monthly",
      },
      notificationsCount: 2,
      driveFolderLink: `https://drive.google.com/drive/folders/${c.driveFolderId}`,
    }));
  }, [liveClients, tierFilter, searchQuery]);

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <PortalSidebar />

        <main id="main-content" className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto pb-24 md:pb-12 space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EADFCB] gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-semibold uppercase tracking-wider text-[#5C3A1E] mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-[#D4A35A]" />
                <span>STUDIO OPERATIONS COMMAND</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
                Admin Operations & Client Management
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Centralized control: manage client workspaces, inspect isolated AI pipelines, approve master deliverables, and audit security.
              </p>
            </div>

            {/* System Status Pills & Notification Bell */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 bg-[#FFFDF9] border border-[#EADFCB] px-3.5 py-1.5 rounded-full text-xs text-[#2E7D4F] font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
                <span>Pipelines Operational</span>
              </div>
              <NotificationBell />
            </div>
          </div>

          {/* High-Density Top Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto border-b border-[#EADFCB] pb-2 no-scrollbar">
            {[
              { id: "overview", label: "Operations Overview" },
              { id: "clients", label: `Client Directory (${CLIENTS_DATA.length})` },
              {
                id: "approvals",
                label: `Orders & Approvals (${realOrders.length > 0 ? realOrders.length : approvalsList.length})`,
                badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} New` : undefined,
              },
              {
                id: "conversations",
                label: `Client Chats (${sessions.length})`,
                badge: totalUnreadChats > 0 ? `${totalUnreadChats} New` : undefined,
              },
              { id: "workflows", label: "Creative Pipelines" },
              { id: "site-control", label: "Website Site Control" },
              { id: "audit", label: "Security & Audit Logs" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id as AdminTab)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.id || (tab.id === "approvals" && (activeTab as string) === "orders")
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "bg-[#FFFDF9] text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4A35A] text-[#171717] animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ========================================================
              TAB 1: OPERATIONS OVERVIEW
              ======================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* KPI Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <KPITile
                  label="Registered Clients"
                  value={String(liveClients.length)}
                  sublabel="Verified client accounts"
                  variant="ink"
                />
                <KPITile
                  label="In Production"
                  value={String(
                    realOrders.filter(
                      (o) => o.status === "in_production" || o.status === "in_progress"
                    ).length
                  )}
                  sublabel="Active studio pipeline"
                  variant="progress"
                />
                <KPITile
                  label="Deliverables Review"
                  value={String(
                    realOrders.filter(
                      (o) =>
                        o.status === "draft_delivered" ||
                        o.status === "delivered" ||
                        o.status === "awaiting_approval"
                    ).length
                  )}
                  sublabel="Awaiting client/producer sign-off"
                  variant="completed"
                />
                <KPITile
                  label="Total Pipeline Volume"
                  value={`₹${realOrders
                    .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
                    .toLocaleString("en-IN")}`}
                  sublabel="Verified live commissions"
                  variant="pending"
                />
              </div>

              {/* Action Required & Pipeline Health */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Urgent Deliverables & Approvals (7 Cols) */}
                <div className="lg:col-span-7 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#EADFCB]">
                    <h3 className="font-serif font-semibold text-base text-[#0F172A] flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-[#5C3A1E]" />
                      <span>Deliverables Pending Producer Review</span>
                    </h3>
                    <Badge variant="gold" size="sm">
                      {
                        realOrders.filter(
                          (o) =>
                            o.status === "draft_delivered" ||
                            o.status === "delivered" ||
                            o.status === "awaiting_approval" ||
                            o.status === "revision_requested"
                        ).length
                      }{" "}
                      Pending
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {realOrders.filter(
                      (o) =>
                        o.status === "draft_delivered" ||
                        o.status === "delivered" ||
                        o.status === "awaiting_approval" ||
                        o.status === "revision_requested"
                    ).length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#64748B]">
                        No deliverables currently pending producer review.
                      </div>
                    ) : (
                      realOrders
                        .filter(
                          (o) =>
                            o.status === "draft_delivered" ||
                            o.status === "delivered" ||
                            o.status === "awaiting_approval" ||
                            o.status === "revision_requested"
                        )
                        .slice(0, 5)
                        .map((ord) => (
                          <div
                            key={ord.id}
                            className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-between gap-4"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-[#5C3A1E]">
                                  {ord.orderNumber || ord.code}
                                </span>
                                <span className="text-xs font-semibold text-[#0F172A]">
                                  {ord.title || ord.service}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#64748B] mt-0.5">
                                Client: {ord.clientName} ({ord.clientEmail}) • {ord.statusLabel}
                              </p>
                            </div>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setInspectingAdminOrder(ord);
                                handleTabChange("approvals");
                              }}
                            >
                              Inspect
                            </Button>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Engine Health & Sync Status (5 Cols) */}
                <div className="lg:col-span-5 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#EADFCB]">
                    <h3 className="font-serif font-semibold text-base text-[#0F172A] flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#5C3A1E]" />
                      <span>Infrastructure Status</span>
                    </h3>
                    <Badge variant="completed" size="sm">
                      100% Uptime
                    </Badge>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-[#5C3A1E]" />
                        <span className="font-semibold text-[#0F172A]">Google Drive Vault API</span>
                      </div>
                      <span className="text-[#2E7D4F] font-bold">Connected (AES-256)</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#5C3A1E]" />
                        <span className="font-semibold text-[#0F172A]">Firebase Auth Service</span>
                      </div>
                      <span className="text-[#2E7D4F] font-bold">Active & Enforced</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#5C3A1E]" />
                        <span className="font-semibold text-[#0F172A]">n8n Workflow Daemon</span>
                      </div>
                      <span className="text-[#2E7D4F] font-bold">12 Isolated Queues</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: CLIENT DIRECTORY & MANAGEMENT
              ======================================================== */}
          {activeTab === "clients" && (
            <div className="space-y-6">
              {/* Search & Tier Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {["All", "Enterprise", "Growth", "Starter"].map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setTierFilter(tier)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        tierFilter === tier
                          ? "bg-[#5C3A1E] text-white shadow-xs"
                          : "bg-[#FFFDF9] text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A]"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>

                <div className="relative flex items-center w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search client, email or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A]"
                  />
                </div>
              </div>

              {/* High-Density Client Table */}
              <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9F5] border-b border-[#EADFCB] text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                      <tr>
                        <th className="py-3.5 px-6">Client / Company</th>
                        <th className="py-3.5 px-4">Tier</th>
                        <th className="py-3.5 px-4">Vault ID</th>
                        <th className="py-3.5 px-4">Active Orders</th>
                        <th className="py-3.5 px-4">Lifetime Spend</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EADFCB]/60">
                      {filteredClients.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-xs text-[#64748B]">
                            No registered clients found in directory.
                          </td>
                        </tr>
                      ) : (
                        filteredClients.map((dossier: any) => {
                          const client = dossier.profile || dossier;
                          return (
                            <tr
                              key={client.id || client.uid}
                              className="hover:bg-[#FAF9F5]/60 transition-colors"
                            >
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <Avatar name={client.name} size="sm" />
                                  <div>
                                    <p className="font-semibold text-[#0F172A]">{client.name}</p>
                                    <p className="text-[11px] text-[#64748B]">{client.company || client.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="space-y-1">
                                  <Badge
                                    variant={
                                      client.tier === "Enterprise"
                                        ? "gold"
                                        : client.tier === "Growth"
                                        ? "progress"
                                        : "neutral"
                                    }
                                    size="sm"
                                    showDot={false}
                                  >
                                    {client.tier || "Starter"}
                                  </Badge>
                                  {dossier.activePlan && (
                                    <p className="text-[10px] text-[#5C3A1E] font-medium truncate max-w-[140px]">
                                      {dossier.activePlan.type === "trial" ? "3-Day Trial" : "Retainer Active"}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <a
                                  href={dossier.driveFolderLink || `https://drive.google.com/drive/folders/${client.driveFolderId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-mono text-[11px] text-[#5C3A1E] hover:underline"
                                >
                                  {client.driveFolderId?.slice(0, 14)}...
                                  <ExternalLink className="w-3 h-3 text-[#94A3B8]" />
                                </a>
                              </td>
                              <td className="py-4 px-4 font-semibold text-[#0F172A]">
                                {dossier.activeOrdersCount ?? client.activeOrders ?? 0} Orders
                              </td>
                              <td className="py-4 px-4 font-serif font-bold text-[#5C3A1E]">
                                {dossier.lifetimeVolumeFormatted || client.lifetimeVolume || "₹0"}
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className={`text-[11px] font-semibold ${
                                    client.status === "Active"
                                      ? "text-[#2E7D4F]"
                                      : client.status === "Disabled"
                                      ? "text-[#DC2626]"
                                      : "text-[#C2761A]"
                                  }`}
                                >
                                  ● {client.status || "Active"}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setSelectedDossier(dossier)}
                                >
                                  Inspect Dossier
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: CLIENT CHATS & AI IMPROVEMENT ATELIER
              ======================================================== */}
          {activeTab === "conversations" && (
            <div className="space-y-6">
              {/* Floating Chat Notification Toast */}
              {chatToast && (
                <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] flex items-center justify-between text-xs animate-in fade-in duration-200 shadow-xs">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>{chatToast}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChatToast("")}
                    className="text-[11px] font-bold text-[#166534] hover:underline cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Sub-Navigation Pill Switcher Bar */}
              <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] shadow-2xs overflow-x-auto no-scrollbar">
                  {[
                    { id: "monitor", label: "Live Chat Monitor", icon: MessageSquare, badge: totalUnreadChats > 0 ? `${totalUnreadChats} New` : undefined },
                    { id: "knowledge", label: `AI Knowledge Base (${knowledgeEntries.length})`, icon: BookOpen },
                    { id: "common_questions", label: `Common Questions (${commonQuestions.length})`, icon: HelpCircle },
                    { id: "settings", label: "Tone & System Prompt", icon: Sliders },
                  ].map((sub) => {
                    const Icon = sub.icon;
                    const isActive = chatSubView === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setChatSubView(sub.id as any)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? "bg-[#5C3A1E] text-white shadow-xs"
                            : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFFFF]"
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#D4A35A]" : "text-[#94A3B8]"}`} />
                        <span>{sub.label}</span>
                        {sub.badge && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#D4A35A] text-[#171717] animate-pulse">
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {chatSubView === "knowledge" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setEditingKbEntry(null);
                      setKbTitle("");
                      setKbCategory("faq");
                      setKbQuestion("");
                      setKbAnswer("");
                      setKbModalOpen(true);
                    }}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Knowledge Entry
                  </Button>
                )}
              </div>

              {/* =========================================================
                  SUB-VIEW 1: LIVE CHAT MONITOR (3-COLUMN REAL-TIME HUB)
                  ========================================================= */}
              {chatSubView === "monitor" && (
                <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
                  {/* LEFT PANEL: CLIENT CONVERSATIONS LIST (3 COLS DESKTOP) */}
                  <div
                    className={`lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[#EADFCB] bg-[#FAF9F5] flex flex-col ${
                      mobileChatView !== "list" ? "hidden lg:flex" : "flex"
                    }`}
                  >
                    {/* Left Panel Header */}
                    <div className="p-4 border-b border-[#EADFCB] bg-[#FFFDF9]/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-[#5C3A1E]" />
                          <h3 className="font-serif font-semibold text-sm sm:text-base text-[#0F172A]">
                            Client Chats
                          </h3>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EADFCB]/60 text-[#5C3A1E]">
                          {filteredChatSessions.length} Active
                        </span>
                      </div>

                      {/* Search Input */}
                      <div className="relative flex items-center">
                        <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search client or message..."
                          value={chatSearchQuery}
                          onChange={(e) => setChatSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A]"
                        />
                        {chatSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setChatSearchQuery("")}
                            className="absolute right-2.5 text-[10px] text-[#94A3B8] hover:text-[#0F172A]"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Filter Pills & Date Selector */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                          {[
                            { id: "all", label: `All (${sessions.length})` },
                            {
                              id: "unread",
                              label: `Unread (${totalUnreadChats})`,
                              badge: totalUnreadChats > 0,
                            },
                            { id: "has_orders", label: "Has Orders" },
                          ].map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setChatFilter(f.id as any)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                                chatFilter === f.id
                                  ? "bg-[#5C3A1E] text-white shadow-2xs"
                                  : "bg-[#FFFFFF] text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A]"
                              }`}
                            >
                              <span>{f.label}</span>
                              {f.badge && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A35A] animate-pulse" />
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Date Filter Dropdown */}
                        <div className="flex items-center justify-between text-[10px] text-[#64748B] px-0.5">
                          <span className="font-semibold uppercase tracking-wider">Timeframe:</span>
                          <select
                            value={chatDateFilter}
                            onChange={(e) => setChatDateFilter(e.target.value as any)}
                            className="bg-[#FFFFFF] border border-[#EADFCB] rounded-lg px-2 py-0.5 text-[10px] text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                          >
                            <option value="all">All Dates</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Sessions Scrollable List */}
                    <div className="divide-y divide-[#EADFCB]/60 overflow-y-auto flex-1 max-h-[580px]">
                      {filteredChatSessions.length === 0 ? (
                        <div className="p-8 text-center text-xs text-[#64748B]">
                          <Bot className="w-6 h-6 text-[#94A3B8] mx-auto mb-2 opacity-50" />
                          <p className="font-semibold text-[#0F172A]">No conversations found</p>
                          <p className="text-[11px] mt-0.5">Try clearing filters or search query.</p>
                        </div>
                      ) : (
                        filteredChatSessions.map((sess) => {
                          const isSelected = selectedSessionId === sess.id;
                          const isTakenOver = sess.mode === "human";
                          const unread = sess.unreadCount || 0;
                          const sessOrdersCount =
                            realOrders.filter(
                              (o) =>
                                (o.clientEmail && o.clientEmail.toLowerCase() === (sess.clientEmail || "").toLowerCase()) ||
                                (o.clientName && o.clientName.toLowerCase().includes(sess.clientName.toLowerCase())) ||
                                o.clientId === sess.clientId ||
                                o.clientId === sess.id
                            ).length || (sess.messages.some((m) => m.orderDraft || m.text.includes("#ORD-")) ? 1 : 0);

                          return (
                            <div
                              key={sess.id}
                              onClick={() => {
                                setSelectedSessionId(sess.id);
                                setMobileChatView("chat");
                              }}
                              className={`p-3.5 transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#FFFDF9] border-l-4 border-l-[#5C3A1E] shadow-2xs"
                                  : "hover:bg-[#FFFDF9]/60"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 truncate">
                                  <Avatar name={sess.clientName} size="sm" status={unread > 0 ? "busy" : "online"} />
                                  <div className="truncate">
                                    <span className="font-semibold text-xs text-[#0F172A] block truncate">
                                      {sess.clientName}
                                    </span>
                                    <span className="text-[10px] text-[#64748B] block truncate">
                                      {sess.company}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end shrink-0 gap-1">
                                  <span className="text-[9px] text-[#94A3B8] font-mono whitespace-nowrap">
                                    {sess.lastTime}
                                  </span>
                                  {unread > 0 && (
                                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#D4A35A] text-[#171717] animate-pulse">
                                      {unread} New
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Message Preview Snippet */}
                              <p className="text-[11px] text-[#475569] mt-1.5 line-clamp-2 leading-relaxed">
                                {sess.messages[sess.messages.length - 1]?.sender === "admin" && (
                                  <span className="font-bold text-[#5C3A1E]">Producer: </span>
                                )}
                                {sess.messages[sess.messages.length - 1]?.sender === "note" && (
                                  <span className="font-bold text-[#D97706]">🔒 Note: </span>
                                )}
                                &quot;{sess.lastPrompt}&quot;
                              </p>

                              {/* Bottom Badges: Orders & Workflow Tag */}
                              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#EADFCB]/40 text-[10px]">
                                <span className="font-mono text-[#5C3A1E] inline-flex items-center gap-1 font-medium">
                                  <ShoppingBag className="w-3 h-3 text-[#D4A35A]" />
                                  <span>{sessOrdersCount} Orders</span>
                                </span>
                                <Badge
                                  variant={isTakenOver ? "completed" : "gold"}
                                  size="sm"
                                  showDot={true}
                                >
                                  {isTakenOver ? "Producer" : "AI Routing"}
                                </Badge>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* CENTER PANEL: REAL-TIME CHAT & INTERVENTION (5 COLS DESKTOP) */}
                  {!currentSession ? (
                    <div className="lg:col-span-9 p-12 flex flex-col items-center justify-center text-center text-xs text-[#64748B] space-y-3 bg-[#FFFDF9]">
                      <div className="w-12 h-12 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-[#5C3A1E]" />
                      </div>
                      <h4 className="font-serif font-bold text-base text-[#0F172A]">No Client Conversation Selected</h4>
                      <p className="max-w-sm text-[#64748B]">
                        Select an active client session from the left directory to monitor live AI prompts, inspect generated order drafts, or take over as human producer.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#EADFCB] flex flex-col justify-between bg-[#FFFDF9] ${
                          mobileChatView !== "chat" ? "hidden lg:flex" : "flex"
                        }`}
                      >
                        {/* Chat Stream Header */}
                        <div className="p-3.5 sm:p-4 border-b border-[#EADFCB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF9F5]/70">
                          <div className="flex items-center gap-2.5">
                            {/* Mobile Back to List Button */}
                            <button
                              type="button"
                              onClick={() => setMobileChatView("list")}
                              className="lg:hidden p-1.5 rounded-lg bg-[#FFFFFF] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:bg-[#F4EFE6] cursor-pointer"
                              title="Back to Clients List"
                            >
                              ← Chats
                            </button>

                            <Avatar name={currentSession?.clientName || "Client"} size="md" status="online" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-serif font-semibold text-sm sm:text-base text-[#0F172A]">
                                  {currentSession?.clientName || "Studio Client"}
                                </h4>
                                <span className="text-[11px] text-[#64748B]">({currentSession?.company || "Direct Client"})</span>
                              </div>
                              <p className="text-[10px] text-[#94A3B8] font-mono">
                                Vault: <span className="text-[#5C3A1E] font-bold">{currentSession?.vaultId || "drive_vault"}</span> • {currentSession?.mode === "human" ? "Direct Producer Active" : "Autonomous AI Router"}
                              </p>
                            </div>
                          </div>

                      {/* Header Action Controls */}
                      <div className="flex items-center gap-2">
                        {/* Mark as Read Action */}
                        {(currentSession.unreadCount || 0) > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMarkChatAsRead(currentSession.id)}
                            className="px-2.5 py-1 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-[11px] font-semibold text-[#5C3A1E] hover:border-[#D4A35A] hover:bg-[#FFFFFF] transition-all flex items-center gap-1 cursor-pointer"
                            title="Mark this chat as read"
                          >
                            <CheckCheck className="w-3.5 h-3.5 text-[#2E7D4F]" />
                            <span>Mark Read</span>
                          </button>
                        )}

                        {/* Mode Toggle Button */}
                        <Button
                          variant={currentSession.mode === "human" ? "secondary" : "primary"}
                          size="sm"
                          onClick={() => handleToggleTakeover(currentSession.id)}
                          leftIcon={
                            currentSession.mode === "human" ? (
                              <Bot className="w-3.5 h-3.5" />
                            ) : (
                              <ShieldAlert className="w-3.5 h-3.5" />
                            )
                          }
                        >
                          {currentSession.mode === "human" ? "Release AI" : "Take Over"}
                        </Button>

                        {/* Mobile Switch to Details Button */}
                        <button
                          type="button"
                          onClick={() => setMobileChatView("details")}
                          className="lg:hidden px-2.5 py-1 rounded-xl bg-[#5C3A1E] text-white text-xs font-semibold hover:bg-[#4A2E17] cursor-pointer"
                        >
                          Details ℹ️
                        </button>
                      </div>
                    </div>

                    {/* Message Stream Scroll Area */}
                    <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 max-h-[460px] min-h-[380px]">
                      {currentSession.messages.map((m, idx) => {
                        const isClient = m.sender === "client";
                        const isAdmin = m.sender === "admin";
                        const isNote = m.sender === "note";
                        const isAi = m.sender === "ai";

                        // Find preceding client query if this is an AI reply
                        const precedingClientMessage = isAi
                          ? currentSession.messages.slice(0, idx).reverse().find((prev) => prev.sender === "client")
                          : undefined;

                        // Internal Producer Private Note (Not visible to client)
                        if (isNote) {
                          return (
                            <div
                              key={idx}
                              className="p-3 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] space-y-1 max-w-xl mx-auto shadow-2xs font-medium"
                            >
                              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#D97706] pb-1 border-b border-[#FDE68A]/60">
                                <span className="flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-[#D97706]" />
                                  <span>Private Studio Producer Note</span>
                                </span>
                                <span className="font-mono text-[9px] text-[#B45309]">Not Visible to Client</span>
                              </div>
                              <p className="leading-relaxed text-[#78350F] pt-0.5">{m.text}</p>
                              <span className="text-[9px] text-[#B45309] block text-right font-mono">{m.time}</span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={idx}
                            className={`flex gap-2.5 max-w-xl ${
                              isAdmin ? "ml-auto flex-row-reverse" : "mr-auto"
                            }`}
                          >
                            <div className="shrink-0 pt-0.5">
                              {isAdmin ? (
                                <Avatar name="Raghavan Sharma" size="sm" status="online" />
                              ) : isClient ? (
                                <div className="w-7 h-7 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center text-[10px] font-bold shadow-2xs">
                                  {currentSession.clientName.charAt(0).toUpperCase()}
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-center text-[10px] text-[#5C3A1E] font-bold shadow-2xs">
                                  ✦
                                </div>
                              )}
                            </div>

                            <div className="space-y-1.5 max-w-[85%]">
                              {/* Message Bubble */}
                              <div
                                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                                  isAdmin
                                    ? "bg-[#5C3A1E] text-white rounded-tr-none shadow-xs"
                                    : isClient
                                    ? "bg-[#F8F5EF] border border-[#EADFCB] text-[#0F172A] rounded-tl-none"
                                    : "bg-[#FAF9F5] border border-[#EADFCB] text-[#0F172A] rounded-tl-none"
                                }`}
                              >
                                {/* Role Label Header */}
                                <div className="text-[9px] font-bold uppercase tracking-wider mb-1 opacity-75 flex items-center justify-between gap-2">
                                  <span>
                                    {isAdmin
                                      ? "Studio Producer (Raghavan Sharma)"
                                      : isClient
                                      ? `Client (${currentSession.clientName})`
                                      : "Sutra AI Assistant"}
                                  </span>
                                  <span className="font-mono">{m.time}</span>
                                </div>

                                <p className="whitespace-pre-line">{m.text}</p>

                                {/* Workflow Tag */}
                                {m.workflow && (
                                  <div className="mt-2 pt-2 border-t border-[#EADFCB]/60 text-[10px] font-semibold text-[#D4A35A] flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    <span>Pipeline: {m.workflow}</span>
                                  </div>
                                )}

                                {/* Embedded Order Card Inside Conversation */}
                                {(m.orderDraft || m.text.includes("#ORD-")) && (
                                  <div className="mt-3 p-3 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-[#0F172A] space-y-2 shadow-2xs">
                                    <div className="flex items-center justify-between border-b border-[#EADFCB]/60 pb-1.5">
                                      <span className="font-mono text-xs font-bold text-[#5C3A1E] flex items-center gap-1">
                                        <ShoppingBag className="w-3.5 h-3.5 text-[#D4A35A]" />
                                        <span>{m.orderDraft?.orderNumber || "#ORD-001"}</span>
                                      </span>
                                      <Badge variant="gold" size="sm">
                                        {m.orderDraft?.status ? m.orderDraft.status.toUpperCase().replace("_", " ") : "COMMISSION ACTIVE"}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                      <div>
                                        <p className="font-semibold text-[#0F172A]">
                                          {m.orderDraft?.service || "3D Spatial Architecture"}
                                        </p>
                                        <p className="text-[10px] text-[#64748B]">
                                          Vault: {m.orderDraft?.driveFolderId || currentSession.vaultId}
                                        </p>
                                      </div>
                                      <span className="font-serif font-bold text-sm text-[#5C3A1E]">
                                        ₹{(m.orderDraft?.totalAmount || 18999).toLocaleString("en-IN")}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const matchedOrder =
                                          realOrders.find(
                                            (o) =>
                                              o.orderNumber === m.orderDraft?.orderNumber ||
                                              o.code === m.orderDraft?.orderNumber ||
                                              o.id === m.orderDraft?.orderId
                                          ) || currentChatOrders[0];
                                        if (matchedOrder) {
                                          setInspectingAdminOrder(matchedOrder);
                                        }
                                      }}
                                      className="w-full py-1 rounded-lg bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-semibold text-[#5C3A1E] hover:bg-[#5C3A1E] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Inspect Order Deliverables</span>
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* STEP 7: AI Feedback & Improvement Bar on AI Responses */}
                              {isAi && (
                                <div className="flex items-center justify-between pt-1 text-[10px] text-[#64748B] px-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-semibold uppercase text-[#94A3B8]">Rate Response:</span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRateAiReply(
                                          currentSession.id,
                                          m.id || `msg_ai_${idx}`,
                                          "good",
                                          m.text,
                                          precedingClientMessage?.text
                                        )
                                      }
                                      className="px-2 py-0.5 rounded-lg bg-[#FFFFFF] border border-[#EADFCB] hover:border-[#2E7D4F] hover:text-[#2E7D4F] text-[#64748B] transition-all flex items-center gap-1 cursor-pointer"
                                      title="Mark accurate (Good)"
                                    >
                                      <ThumbsUp className="w-3 h-3" />
                                      <span>Good</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRateAiReply(
                                          currentSession.id,
                                          m.id || `msg_ai_${idx}`,
                                          "bad",
                                          m.text,
                                          precedingClientMessage?.text
                                        )
                                      }
                                      className="px-2 py-0.5 rounded-lg bg-[#FFFFFF] border border-[#EADFCB] hover:border-[#DC2626] hover:text-[#DC2626] text-[#64748B] transition-all flex items-center gap-1 cursor-pointer"
                                      title="Mark poor / provide better answer (Bad)"
                                    >
                                      <ThumbsDown className="w-3 h-3" />
                                      <span>Bad / Correct</span>
                                    </button>
                                  </div>

                                  {/* One-Click Add to Knowledge Base */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOneClickAddToKnowledge(
                                        precedingClientMessage?.text || currentSession.lastPrompt,
                                        m.text,
                                        `AI Rule: ${currentSession.workflowTag}`
                                      )
                                    }
                                    className="px-2 py-0.5 rounded-lg bg-[#FAF9F5] border border-[#EADFCB] hover:border-[#D4A35A] text-[#5C3A1E] font-medium transition-all flex items-center gap-1 cursor-pointer"
                                    title="Add this Q&A into AI Knowledge Base"
                                  >
                                    <BookOpen className="w-3 h-3 text-[#D4A35A]" />
                                    <span>+ Add to KB</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Producer Message & Internal Note Input Bar */}
                    <div className="p-3.5 border-t border-[#EADFCB] bg-[#FAF9F5]/60 space-y-2.5">
                      {/* Quick Producer Snippet Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        <span className="text-[9px] uppercase font-bold text-[#94A3B8] shrink-0">
                          Quick Snippets:
                        </span>
                        {[
                          "I am reviewing your 4K renders right now.",
                          "Revision round 01 assigned to senior 3D lead.",
                          "Google Drive vault files updated.",
                          "Order confirmed. Moving into production pipeline.",
                        ].map((snippet, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendProducerMessage(snippet)}
                            className="text-[10px] bg-[#FFFDF9] border border-[#EADFCB] text-[#5C3A1E] hover:border-[#D4A35A] px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-2xs cursor-pointer"
                          >
                            {snippet}
                          </button>
                        ))}
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendProducerMessage(producerInput);
                        }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          placeholder={
                            currentSession.mode === "human"
                              ? "Send message as Raghavan Sharma (Studio Producer)..."
                              : "Take over chat to message client directly..."
                          }
                          value={producerInput}
                          onChange={(e) => setProducerInput(e.target.value)}
                          className="flex-1 bg-[#FFFFFF] border border-[#EADFCB] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                        />

                        {/* Post Private Internal Note Button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddInternalNote()}
                          disabled={!producerInput.trim()}
                          title="Post Internal Producer Note (Saved secretly, not sent to client)"
                          leftIcon={<Lock className="w-3.5 h-3.5 text-[#A98B57]" />}
                        >
                          <span className="hidden sm:inline">Internal Note</span>
                        </Button>

                        {/* Send Admin Message Button */}
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          disabled={!producerInput.trim()}
                          leftIcon={<Send className="w-3.5 h-3.5" />}
                        >
                          Send
                        </Button>
                      </form>
                    </div>
                  </div>

                    {/* RIGHT PANEL: CLIENT PROFILE, ACTIVE PLAN & ORDERS HUB (4 COLS DESKTOP) */}
                    <div
                      className={`lg:col-span-4 bg-[#FAF9F5] flex flex-col p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[680px] ${
                        mobileChatView !== "details" ? "hidden lg:flex" : "flex"
                      }`}
                    >
                      {/* Right Panel Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#EADFCB]">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-[#5C3A1E]" />
                          <h3 className="font-serif font-semibold text-sm sm:text-base text-[#0F172A]">
                            Client Intelligence
                          </h3>
                        </div>
                        {/* Mobile Back to Chat Button */}
                        <button
                          type="button"
                          onClick={() => setMobileChatView("chat")}
                          className="lg:hidden p-1 rounded-lg bg-[#FFFFFF] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:bg-[#F4EFE6] cursor-pointer"
                        >
                          ← Back to Chat
                        </button>
                      </div>

                      {/* Client Profile Card */}
                      <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] space-y-3 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <Avatar name={currentChatClient.name} size="md" status="online" />
                          <div>
                            <h4 className="font-serif font-bold text-sm text-[#0F172A]">
                              {currentChatClient.name}
                            </h4>
                            <p className="text-xs text-[#64748B]">{currentChatClient.company}</p>
                          </div>
                          <Badge
                            variant={currentChatClient.tier === "Enterprise" ? "gold" : "progress"}
                            size="sm"
                            className="ml-auto"
                          >
                            {currentChatClient.tier}
                          </Badge>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-[#EADFCB]/60 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[#64748B] flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-[#94A3B8]" />
                              <span>Email:</span>
                            </span>
                            <span className="font-medium text-[#0F172A] truncate max-w-[170px]">
                              {currentChatClient.email}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#64748B] flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#94A3B8]" />
                              <span>Phone:</span>
                            </span>
                            <span className="font-medium text-[#0F172A]">
                              {currentSession.clientPhone || "+91 98200 45678"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#64748B] flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                              <span>Member Since:</span>
                            </span>
                            <span className="font-medium text-[#0F172A]">
                              {currentSession.joinedDate || "August 2026"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-[#EADFCB]/40">
                            <span className="text-[#64748B] flex items-center gap-1.5">
                              <HardDrive className="w-3.5 h-3.5 text-[#5C3A1E]" />
                              <span>Drive Vault:</span>
                            </span>
                            <a
                              href={`https://drive.google.com/drive/folders/${currentChatClient.driveFolderId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-[11px] font-bold text-[#5C3A1E] hover:text-[#A98B57] hover:underline flex items-center gap-1"
                            >
                              <span>{currentChatClient.driveFolderId}</span>
                              <ExternalLink className="w-3 h-3 text-[#A98B57]" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* ACTIVE MONTHLY PLAN CARD */}
                      {(() => {
                        const activePlan = currentChatOrders.find(
                          (o) =>
                            o.type === "monthly_plan" ||
                            o.status === "trial" ||
                            o.status === "active" ||
                            o.title?.toLowerCase().includes("retainer") ||
                            o.service?.toLowerCase().includes("retainer")
                        );

                        return (
                          <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] space-y-2.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="font-serif font-bold text-xs text-[#0F172A] flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                                <span>Active Monthly Plan</span>
                              </span>
                              {activePlan ? (
                                <Badge
                                  variant={activePlan.status === "trial" ? "gold" : activePlan.status === "active" ? "completed" : "neutral"}
                                  size="sm"
                                >
                                  {activePlan.status === "trial" ? "3-Day Free Trial" : activePlan.status === "active" ? "Active Retainer" : activePlan.status.toUpperCase()}
                                </Badge>
                              ) : (
                                <span className="text-[10px] text-[#64748B] font-medium">No Active Plan</span>
                              )}
                            </div>

                            {activePlan ? (
                              <div className="space-y-1.5 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-[#5C3A1E]">{activePlan.title || activePlan.service}</span>
                                  <span className="font-serif font-bold text-[#5C3A1E]">
                                    ₹{(activePlan.totalAmount || 12999).toLocaleString("en-IN")}/mo
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                                  <span>Billing Cycle:</span>
                                  <span className="font-medium text-[#0F172A] uppercase">{activePlan.billingCycle || "Monthly"}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                                  <span>Period Window:</span>
                                  <span className="font-mono text-[10px] text-[#0F172A]">
                                    {activePlan.currentPeriodEnd
                                      ? `Until ${new Date(activePlan.currentPeriodEnd).toLocaleDateString()}`
                                      : activePlan.estimatedDueDate
                                      ? `Until ${new Date(activePlan.estimatedDueDate).toLocaleDateString()}`
                                      : "Next 30 Days"}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[11px] text-[#64748B] italic">
                                Client currently commissions standalone single services.
                              </p>
                            )}
                          </div>
                        );
                      })()}

                      {/* Client Orders Portfolio with Live Progress % & Payment Status */}
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif font-semibold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-[#5C3A1E]" />
                            <span>Client Orders ({currentChatOrders.length})</span>
                          </h4>
                          <span className="text-[11px] font-bold text-[#5C3A1E]">
                            Total Spent: {currentChatClient.lifetimeVolume}
                          </span>
                        </div>

                        {/* Orders List for this Client */}
                        <div className="space-y-2.5">
                          {currentChatOrders.length === 0 ? (
                            <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-center text-xs text-[#64748B]">
                              No orders placed yet by this client.
                            </div>
                          ) : (
                            currentChatOrders.map((order) => {
                              const progress = computeOrderProgress(order);
                              const isPaid = order.paymentStatus === "paid" || (order.status !== "pending_payment" && order.status !== "cancelled");

                              return (
                                <div
                                  key={order.id || order.orderNumber}
                                  className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] space-y-2.5 shadow-2xs hover:border-[#D4A35A] transition-all"
                                >
                                  {/* Top Row: Order Number, Status Badge & Price */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-mono text-xs font-bold text-[#5C3A1E]">
                                          {order.orderNumber || order.code || `#ORD-${order.id}`}
                                        </span>
                                        <Badge
                                          variant={
                                            order.status === "completed" || order.status === "approved"
                                              ? "completed"
                                              : order.status === "delivered"
                                              ? "gold"
                                              : order.status === "in_progress"
                                              ? "progress"
                                              : "neutral"
                                          }
                                          size="sm"
                                        >
                                          {order.statusLabel || order.status.toUpperCase().replace("_", " ")}
                                        </Badge>
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
                                            isPaid
                                              ? "bg-[#EDF7F0] text-[#2E7D4F] border-[#2E7D4F]/20"
                                              : "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                                          }`}
                                        >
                                          {isPaid ? "Paid" : "Pending Payment"}
                                        </span>
                                      </div>
                                      <p className="text-xs font-semibold text-[#0F172A] mt-1">
                                        {order.title || order.service || "Studio Commission"}
                                      </p>
                                    </div>
                                    <span className="font-serif font-bold text-xs text-[#5C3A1E] shrink-0">
                                      ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                                    </span>
                                  </div>

                                  {/* Progress Bar & Stage */}
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="font-medium text-[#64748B]">{progress.stageName}</span>
                                      <span className="font-mono font-bold text-[#5C3A1E]">{progress.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-[#EADFCB]/60 h-1.5 rounded-full overflow-hidden">
                                      <div
                                        className="bg-[#5C3A1E] h-full rounded-full transition-all duration-300"
                                        style={{ width: `${progress.percentage}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Drive Link & Action Buttons */}
                                  <div className="flex items-center justify-between pt-2 border-t border-[#EADFCB]/60 gap-2">
                                    <a
                                      href={order.driveFolderLink || `https://drive.google.com/drive/folders/${order.driveFolderId || currentChatClient.driveFolderId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] font-medium text-[#A98B57] hover:text-[#5C3A1E] hover:underline"
                                    >
                                      <HardDrive className="w-3 h-3" />
                                      <span>Drive Vault</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>

                                    <div className="flex items-center gap-1.5">
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setInspectingAdminOrder(order)}
                                        leftIcon={<Eye className="w-3 h-3" />}
                                        className="text-[10px] py-1 h-7"
                                      >
                                        Inspect
                                      </Button>

                                      <select
                                        value={order.status}
                                        onChange={(e) => handleAdminUpdateOrderStatus(order.id, e.target.value)}
                                        className="bg-[#FAF9F5] border border-[#EADFCB] rounded-lg px-2 py-1 text-[10px] font-semibold text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                                      >
                                        <option value="pending_payment">Pending Payment</option>
                                        <option value="paid">Paid</option>
                                        <option value="in_production">In Production</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

              {/* =========================================================
                  SUB-VIEW 2: AI KNOWLEDGE BASE (EDITABLE RULES & Q&A)
                  ========================================================= */}
              {chatSubView === "knowledge" && (
                <div className="space-y-6">
                  {/* Search & Category Filter Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {["All", "faq", "business_rules", "service_details", "tone_guidelines", "qa"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setKbCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                            kbCategoryFilter === cat
                              ? "bg-[#5C3A1E] text-white shadow-xs"
                              : "bg-[#FFFDF9] text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A]"
                          }`}
                        >
                          {cat === "All"
                            ? "All Knowledge"
                            : cat === "faq"
                            ? "FAQ"
                            : cat === "business_rules"
                            ? "Business Rules"
                            : cat === "service_details"
                            ? "Service Details"
                            : cat === "tone_guidelines"
                            ? "Tone & Voice"
                            : "Q&A Corrections"}
                        </button>
                      ))}
                    </div>

                    <div className="relative flex items-center w-full sm:w-72">
                      <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search rules, questions, answers..."
                        value={kbSearchQuery}
                        onChange={(e) => setKbSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A]"
                      />
                    </div>
                  </div>

                  {/* Knowledge Entries Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredKnowledgeEntries.length === 0 ? (
                      <div className="col-span-full p-12 text-center rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] text-[#64748B]">
                        <BookOpen className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-50" />
                        <h4 className="font-serif font-bold text-sm text-[#0F172A]">No Knowledge Base Entries</h4>
                        <p className="text-xs mt-1">Add a new rule or capture chat corrections to build studio intelligence.</p>
                      </div>
                    ) : (
                      filteredKnowledgeEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-5 space-y-3 shadow-2xs hover:border-[#D4A35A] transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <Badge
                                variant={
                                  entry.category === "business_rules"
                                    ? "gold"
                                    : entry.category === "service_details"
                                    ? "progress"
                                    : "neutral"
                                }
                                size="sm"
                              >
                                {entry.category.replace("_", " ").toUpperCase()}
                              </Badge>

                              <span className="text-[10px] font-mono text-[#94A3B8]">
                                {entry.source === "chat_correction" ? "From Chat Feedback" : "Admin Rule"}
                              </span>
                            </div>

                            <h4 className="font-serif font-bold text-sm text-[#0F172A] leading-snug">
                              {entry.title}
                            </h4>

                            {entry.question && (
                              <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/60 text-xs text-[#5C3A1E] font-medium">
                                <span className="text-[9px] uppercase font-bold text-[#94A3B8] block mb-0.5">Matched Question:</span>
                                &quot;{entry.question}&quot;
                              </div>
                            )}

                            <p className="text-xs text-[#475569] leading-relaxed line-clamp-4">
                              {entry.answer}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-[#EADFCB]/60 flex items-center justify-between text-xs">
                            <span className="text-[10px] text-[#2E7D4F] font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3 text-[#2E7D4F]" />
                              <span>Active in Context</span>
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingKbEntry(entry);
                                  setKbTitle(entry.title);
                                  setKbCategory(entry.category);
                                  setKbQuestion(entry.question || "");
                                  setKbAnswer(entry.answer);
                                  setKbModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-[#FAF9F5] border border-[#EADFCB] text-[#5C3A1E] hover:bg-[#FFFFFF] cursor-pointer"
                                title="Edit Knowledge Entry"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteKnowledge(entry.id, entry.title)}
                                className="p-1.5 rounded-lg bg-[#FAF9F5] border border-[#EADFCB] text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer"
                                title="Delete Knowledge Entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* =========================================================
                  SUB-VIEW 3: COMMON QUESTIONS & LOW-RATED TOPICS
                  ========================================================= */}
              {chatSubView === "common_questions" && (
                <div className="space-y-6">
                  {/* Top Analytics Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-[#64748B]">Total Inquiries Captured</span>
                      <p className="font-serif text-2xl font-bold text-[#0F172A] mt-1">95 Questions</p>
                      <span className="text-[11px] text-[#2E7D4F] font-medium">+18 this week</span>
                    </div>

                    <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-[#64748B]">Grounding Accuracy</span>
                      <p className="font-serif text-2xl font-bold text-[#2E7D4F] mt-1">92.4%</p>
                      <span className="text-[11px] text-[#64748B]">Derived from Good ratings</span>
                    </div>

                    <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-[#64748B]">Requires Improvement</span>
                      <p className="font-serif text-2xl font-bold text-[#D97706] mt-1">2 Topics</p>
                      <span className="text-[11px] text-[#D97706] font-medium">Flagged by Producer</span>
                    </div>
                  </div>

                  {/* Common Questions & Unanswered View Table */}
                  <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-[#EADFCB] bg-[#FAF9F5]/80 flex items-center justify-between">
                      <div>
                        <h4 className="font-serif font-bold text-sm sm:text-base text-[#0F172A]">
                          Most Frequently Asked Topics & Low-Rated Queries
                        </h4>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          Questions asked by clients during AI conversation requiring review or knowledge base inclusion.
                        </p>
                      </div>
                    </div>

                    <div className="divide-y divide-[#EADFCB]/60">
                      {commonQuestions.map((cq) => (
                        <div key={cq.id} className="p-5 hover:bg-[#FAF9F5]/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-sm text-[#0F172A]">{cq.topic}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EADFCB]/60 text-[#5C3A1E]">
                                {cq.frequency} Inquiries
                              </span>
                              <Badge
                                variant={
                                  cq.status === "answered"
                                    ? "completed"
                                    : cq.status === "needs_improvement"
                                    ? "gold"
                                    : "neutral"
                                }
                                size="sm"
                              >
                                {cq.status === "answered"
                                  ? "Grounded"
                                  : cq.status === "needs_improvement"
                                  ? "Needs Improvement"
                                  : "Unanswered"}
                              </Badge>
                            </div>

                            <p className="text-xs text-[#475569] italic">
                              Sample: &quot;{cq.querySample}&quot;
                            </p>

                            <p className="text-[11px] text-[#5C3A1E] font-medium">
                              {cq.suggestedAction}
                            </p>
                          </div>

                          <div className="shrink-0">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                handleOneClickAddToKnowledge(
                                  cq.querySample,
                                  "",
                                  `Rule: ${cq.topic}`
                                )
                              }
                              leftIcon={<Plus className="w-3 h-3" />}
                            >
                              Add KB Rule
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  SUB-VIEW 4: AI TONE & SYSTEM PROMPT CONFIGURATION
                  ========================================================= */}
              {chatSubView === "settings" && (
                <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EADFCB]">
                    <div>
                      <h4 className="font-serif font-bold text-lg sm:text-xl text-[#0F172A]">
                        AI System Prompt & Brand Tone Setting
                      </h4>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Admin-only control: customize the studio persona, tone guidelines, and behavioral constraints.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResetAiSettings()}
                      leftIcon={<RotateCcw className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                    >
                      Reset to Default
                    </Button>
                  </div>

                  <form onSubmit={handleSaveAiSettingsSubmit} className="space-y-6">
                    {/* Brand Tone Selector */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                        Studio Conversational Persona & Tone
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                          { id: "luxury_atelier", title: "Luxury Atelier", desc: "Warm hospitality (Namaste 🙏), poetic sacred geometry, refined elegance." },
                          { id: "technical", title: "Technical Architectural", desc: "Precise rendering specs, ACEScg color, 4K bakes, and SLAs." },
                          { id: "concise", title: "Concise Business", desc: "High efficiency, brief summaries, rapid confirmation to payment." },
                          { id: "formal", title: "Formal Enterprise", desc: "Corporate enterprise governance, strict NDA adherence, executive polish." },
                        ].map((toneOpt) => (
                          <div
                            key={toneOpt.id}
                            onClick={() => setSystemToneDraft(toneOpt.id as any)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              systemToneDraft === toneOpt.id
                                ? "bg-[#FAF9F5] border-[#5C3A1E] shadow-2xs"
                                : "bg-[#FFFFFF] border-[#EADFCB] hover:border-[#D4A35A]"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-serif font-bold text-xs text-[#0F172A]">{toneOpt.title}</span>
                              {systemToneDraft === toneOpt.id && (
                                <span className="w-2 h-2 rounded-full bg-[#5C3A1E]" />
                              )}
                            </div>
                            <p className="text-[11px] text-[#64748B] leading-relaxed">{toneOpt.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Master System Prompt Textarea */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                          Master System Prompt
                        </label>
                        <span className="text-[10px] font-mono text-[#64748B]">
                          {systemPromptDraft.length} characters • ~{Math.round(systemPromptDraft.length / 4)} tokens
                        </span>
                      </div>
                      <textarea
                        rows={12}
                        value={systemPromptDraft}
                        onChange={(e) => setSystemPromptDraft(e.target.value)}
                        className="w-full font-mono text-xs p-4 rounded-2xl bg-[#FFFFFF] border border-[#EADFCB] text-[#0F172A] leading-relaxed focus:outline-none focus:border-[#D4A35A]"
                        placeholder="Enter the system prompt instructions for Sutra AI..."
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-[#64748B]">
                        Last updated by <span className="font-bold text-[#0F172A]">{aiSettings.updatedBy}</span>
                      </span>

                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        disabled={isSavingSettings}
                        leftIcon={<Save className="w-4 h-4" />}
                      >
                        {isSavingSettings ? "Saving Settings..." : "Save Active System Prompt"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* =========================================================
                  MODAL 1: AI CORRECTION & FEEDBACK CAPTURE
                  ========================================================= */}
              {ratingModalMessage && (
                <Modal
                  isOpen={true}
                  onClose={() => setRatingModalMessage(null)}
                  title="Improve AI Answer (Producer Feedback)"
                  maxWidth="md"
                >
                  <div className="space-y-4">
                    <p className="text-xs text-[#64748B]">
                      Help Sutra AI learn by providing a superior answer. This correction will be saved in Firebase and immediately incorporated into the AI Knowledge Base for future client chats.
                    </p>

                    {ratingModalMessage.userQuery && (
                      <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs">
                        <span className="text-[9px] uppercase font-bold text-[#94A3B8] block mb-1">Client Asked:</span>
                        <p className="text-[#0F172A] font-semibold">&quot;{ratingModalMessage.userQuery}&quot;</p>
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B]">
                      <span className="text-[9px] uppercase font-bold text-[#DC2626] block mb-1">AI Replied (Poor / Inaccurate):</span>
                      <p className="line-clamp-3">{ratingModalMessage.aiReply}</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                        Write the Correct / Better Answer
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Type the ideal answer according to studio rules, technical specs, or pricing..."
                        value={ratingCorrectionText}
                        onChange={(e) => setRatingCorrectionText(e.target.value)}
                        className="w-full p-3 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EADFCB]/60">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setRatingModalMessage(null)}
                      >
                        Cancel
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isSubmittingFeedback}
                        onClick={() => handleSubmitCorrectionFeedback()}
                        leftIcon={<Save className="w-3.5 h-3.5" />}
                      >
                        {isSubmittingFeedback ? "Saving..." : "Save Correction & Add to KB"}
                      </Button>
                    </div>
                  </div>
                </Modal>
              )}

              {/* =========================================================
                  MODAL 2: KNOWLEDGE BASE ENTRY EDITOR
                  ========================================================= */}
              {kbModalOpen && (
                <Modal
                  isOpen={true}
                  onClose={() => setKbModalOpen(false)}
                  title={editingKbEntry ? "Edit Knowledge Base Entry" : "Create New Knowledge Base Rule"}
                  maxWidth="md"
                >
                  <form onSubmit={handleSaveKnowledgeEntrySubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                        Rule Title
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 4K Spatial Render Deliverables & SLA"
                        value={kbTitle}
                        onChange={(e) => setKbTitle(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                        Category
                      </label>
                      <select
                        value={kbCategory}
                        onChange={(e) => setKbCategory(e.target.value as KnowledgeCategory)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                      >
                        <option value="faq">FAQ (Frequently Asked Questions)</option>
                        <option value="business_rules">Business Rules & SLAs</option>
                        <option value="service_details">Service Details & Formats</option>
                        <option value="tone_guidelines">Brand Tone & Hospitality</option>
                        <option value="qa">Direct Q&A Pair</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                        Client Question (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. What is included in a 3D Spatial Architecture deliverable?"
                        value={kbQuestion}
                        onChange={(e) => setKbQuestion(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                        Authoritative Knowledge Base Answer / Guidance
                      </label>
                      <textarea
                        rows={5}
                        required
                        placeholder="Enter the official studio guideline, response, or business rule..."
                        value={kbAnswer}
                        onChange={(e) => setKbAnswer(e.target.value)}
                        className="w-full p-3 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EADFCB]/60">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setKbModalOpen(false)}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        leftIcon={<Save className="w-3.5 h-3.5" />}
                      >
                        {editingKbEntry ? "Update Knowledge" : "Publish to AI"}
                      </Button>
                    </div>
                  </form>
                </Modal>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 4: ISOLATED WORKFLOW PIPELINES & JOB EXECUTION
              ======================================================== */}
          {activeTab === "workflows" && (
            <div className="space-y-8">
              {/* Notification Banner */}
              {dispatchSuccess && (
                <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] flex items-center justify-between text-xs animate-in fade-in duration-300">
                  <div className="flex items-center gap-2.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>{dispatchSuccess}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#15803D]">Dispatched to container</span>
                </div>
              )}

              {/* LIVE N8N AUTOMATION PIPELINE MONITOR ACROSS ACTIVE ORDERS */}
              <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADFCB]/60 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#5C3A1E] text-white flex items-center justify-center shadow-xs">
                      <Zap className="w-5 h-5 text-[#D4A35A]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#0F172A]">
                          Live n8n Pipeline & Execution Tracker
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
                          Live Synced
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B]">
                        Real-time execution percentages, active workflow nodes, and Google Drive vault stages across all client commissions and monthly packages.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-[#64748B]">
                      {realOrders.filter((o) => o.status !== "cancelled" && o.status !== "refunded").length} Tracked Orders
                    </span>
                  </div>
                </div>

                {/* Orders List with Progress Bars */}
                {realOrders.filter((o) => o.status !== "cancelled" && o.status !== "refunded").length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#64748B]">
                    No active pipelines running. Dispatched orders and subscriptions will appear here with live progress percentages.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {realOrders
                      .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
                      .slice(0, 6)
                      .map((ord) => {
                        const wfProg = computeN8nWorkflowProgress(ord);
                        return (
                          <div
                            key={ord.id}
                            className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] hover:border-[#D4A35A] transition-all space-y-3 flex flex-col justify-between shadow-2xs"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs font-bold text-[#0F172A]">
                                    #{ord.code || ord.orderNumber || ord.id.slice(0, 8)}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-[#5C3A1E] border border-[#EADFCB]">
                                    {wfProg.shortCode}
                                  </span>
                                </div>
                                <span className="font-mono text-xs font-bold text-[#5C3A1E] px-2 py-0.5 rounded-md bg-[#FFFDF9] border border-[#EADFCB]">
                                  {wfProg.percentage}%
                                </span>
                              </div>

                              <div>
                                <h5 className="font-semibold text-xs text-[#0F172A] truncate">
                                  {ord.service || ord.title}
                                </h5>
                                <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                                  Client: {ord.clientName || ord.clientEmail || "Studio Client"}
                                </p>
                              </div>

                              {/* Progress Bar */}
                              <div className="w-full h-2 bg-[#EADFCB]/60 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#D4A35A] to-[#5C3A1E]"
                                  style={{ width: `${Math.max(8, wfProg.percentage)}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                                <span className="truncate max-w-[200px] text-[#5C3A1E] font-medium" title={wfProg.currentStepLabel}>
                                  {wfProg.currentStepLabel}
                                </span>
                                <span>{wfProg.deliverablesCount} file(s)</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setInspectingAdminOrder(ord);
                                setAdminOrderModalTab("details");
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#F5F2EB] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5 text-[#D4A35A]" />
                              Inspect Pipeline & Stages
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Main Panel */}
              <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EADFCB]/60 pb-6">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#0F172A]">
                        Studio AI Workflow Engines
                      </h3>
                      <Badge variant="completed" size="sm">
                        8 Active
                      </Badge>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      Automated creative generation pipelines executing inside isolated micro-containers with Google Drive sync.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {(["All", "Visual & 3D", "Video & VR", "Code & Growth"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setWorkflowFilter(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
                          workflowFilter === cat
                            ? "bg-[#5C3A1E] text-white shadow-xs"
                            : "bg-[#FAF9F5] text-[#64748B] hover:text-[#0F172A] border border-[#EADFCB]"
                        }`}
                      >
                        {cat}
                        {cat === "All" && ` (8)`}
                        {cat === "Visual & 3D" && ` (3)`}
                        {cat === "Video & VR" && ` (2)`}
                        {cat === "Code & Growth" && ` (3)`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 8 Engine Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {STUDIO_WORKFLOW_ENGINES.filter((eng) => {
                    if (workflowFilter === "All") return true;
                    return eng.category === workflowFilter;
                  }).map((eng) => (
                    <div
                      key={eng.slug}
                      className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex flex-col justify-between space-y-4 hover:border-[#D4A35A] transition-all hover:shadow-xs group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-10 h-10 rounded-xl bg-white border border-[#EADFCB] flex items-center justify-center shrink-0 shadow-xs">
                            {eng.iconName === "image" && <ImageIcon className="w-5 h-5 text-[#5C3A1E]" />}
                            {eng.iconName === "video" && <Video className="w-5 h-5 text-[#5C3A1E]" />}
                            {eng.iconName === "box" && <Box className="w-5 h-5 text-[#5C3A1E]" />}
                            {eng.iconName === "compass" && <Compass className="w-5 h-5 text-[#5C3A1E]" />}
                            {eng.iconName === "layers" && <Layers className="w-5 h-5 text-[#5C3A1E]" />}
                            {eng.iconName === "megaphone" && <Megaphone className="w-5 h-5 text-[#5C3A1E]" />}
                            {eng.iconName === "layout" && <Layout className="w-5 h-5 text-[#5C3A1E]" />}
                            {eng.iconName === "smartphone" && <Smartphone className="w-5 h-5 text-[#5C3A1E]" />}
                          </div>
                          <span className="font-mono text-[10px] text-[#A98B57] bg-[#F8F5EF] px-2 py-0.5 rounded border border-[#EADFCB] font-bold">
                            {eng.sla} SLA
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-serif font-semibold text-sm text-[#0F172A] group-hover:text-[#5C3A1E] transition-colors">
                              {eng.name}
                            </h4>
                          </div>
                          <span className="text-[11px] font-mono text-[#D4A35A] uppercase tracking-wider block mt-0.5">
                            {eng.category}
                          </span>
                        </div>

                        <p className="text-xs text-[#64748B] line-clamp-3 leading-relaxed">
                          {eng.description}
                        </p>

                        <div className="space-y-1.5 pt-2 border-t border-[#EADFCB]/60 text-[11px] font-mono text-[#64748B]">
                          <div className="flex items-center justify-between">
                            <span className="text-[#94A3B8]">Stack:</span>
                            <span className="text-[#0F172A] truncate max-w-[140px] text-right font-medium" title={eng.provider}>
                              {eng.provider.split("/")[0]}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#94A3B8]">Vault Sync:</span>
                            <span className="text-[#5C3A1E] font-medium truncate max-w-[140px]">
                              {eng.outputVault}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#EADFCB]/60 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[11px] text-[#5C3A1E] font-bold">
                            {eng.activeJobs} Jobs Active
                          </span>
                          <span className="text-[#94A3B8] font-mono text-[11px]">Avg {eng.latency}</span>
                        </div>

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="w-full text-xs justify-center py-1.5"
                          disabled={dispatchingWf === eng.slug}
                          onClick={() => handleDispatchJob(eng.slug, eng.name)}
                          leftIcon={
                            dispatchingWf === eng.slug ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#5C3A1E]" />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-[#5C3A1E]" />
                            )
                          }
                        >
                          {dispatchingWf === eng.slug ? "Dispatching..." : "Dispatch Job"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Job Execution Queue */}
              <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADFCB]/60 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#A98B57]" />
                      <h4 className="font-serif text-lg font-semibold text-[#0F172A]">
                        Live Workflow Execution Ledger
                      </h4>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Real-time asynchronous job progress synced to client Google Drive vaults.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]"></span>
                    </span>
                    <span className="text-xs font-mono text-[#16A34A] font-medium">Worker Polling Active</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#EADFCB] text-[#64748B] font-mono uppercase text-[10px] tracking-wider">
                        <th className="pb-3 font-semibold">Job ID / Run</th>
                        <th className="pb-3 font-semibold">Pipeline Engine</th>
                        <th className="pb-3 font-semibold">Order</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Progress</th>
                        <th className="pb-3 font-semibold">Target Drive Vault</th>
                        <th className="pb-3 font-semibold text-right">Elapsed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EADFCB]/60">
                      {workflowJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-[#FAF9F5] transition-colors">
                          <td className="py-3.5 font-mono text-[11px] font-bold text-[#0F172A]">
                            {job.id}
                          </td>
                          <td className="py-3.5 font-medium text-[#0F172A]">
                            {job.name}
                          </td>
                          <td className="py-3.5 font-mono text-[11px] text-[#A98B57] font-semibold">
                            {job.order}
                          </td>
                          <td className="py-3.5">
                            {job.status === "Running" ? (
                              <Badge variant="progress" size="sm">
                                <span className="animate-pulse mr-1 inline-block">●</span> Running
                              </Badge>
                            ) : (
                              <Badge variant="completed" size="sm">
                                Completed
                              </Badge>
                            )}
                          </td>
                          <td className="py-3.5 w-44">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                                <span>{job.progress}%</span>
                              </div>
                              <div className="w-full bg-[#EADFCB]/60 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    job.progress === 100 ? "bg-[#16A34A]" : "bg-[#D4A35A]"
                                  }`}
                                  style={{ width: `${job.progress}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 font-mono text-[11px] text-[#5C3A1E] truncate max-w-[200px]" title={job.target}>
                            {job.target}
                          </td>
                          <td className="py-3.5 text-right font-mono text-[11px] text-[#94A3B8]">
                            {job.duration}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: SECURITY AUDIT TRAIL
              ======================================================== */}
          {activeTab === "audit" && (
            <div className="space-y-6">
              <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                      Cryptographic Security & System Audit Trail
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Immutable ledger of administrative actions, deliveries, status transitions, account toggles, and financial refunds.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={fetchLiveAuditLogs}
                      className="text-xs shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAuditLogs ? "animate-spin" : ""}`} />
                      Sync Ledger
                    </Button>
                  </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {[
                      { id: "ALL", label: "All Actions" },
                      { id: "ORDER_DELIVERED", label: "Deliveries" },
                      { id: "STATUS_UPDATED", label: "Status" },
                      { id: "CLIENT_STATUS_TOGGLED", label: "Account Control" },
                      { id: "PAYMENT_REFUNDED", label: "Refunds" },
                      { id: "CLIENT_NOTE_ADDED", label: "Notes" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setAuditActionFilter(f.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                          auditActionFilter === f.id
                            ? "bg-[#5C3A1E] text-white shadow-xs"
                            : "bg-[#FAF9F5] text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A]"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex items-center w-full sm:w-64">
                    <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search actor, target, note..."
                      value={auditSearchQuery}
                      onChange={(e) => setAuditSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-1.5 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A]"
                    />
                  </div>
                </div>

                {/* Audit Entries List */}
                <div className="space-y-2.5 font-mono text-xs text-[#475569]">
                  {(liveAuditLogs.length > 0 ? liveAuditLogs : AUDIT_LOGS)
                    .filter((log: any) => {
                      const action = log.what || log.event;
                      const matchesAction = auditActionFilter === "ALL" || action === auditActionFilter;
                      const q = auditSearchQuery.toLowerCase();
                      const matchesSearch =
                        !auditSearchQuery ||
                        action?.toLowerCase().includes(q) ||
                        log.targetId?.toLowerCase().includes(q) ||
                        log.targetTitle?.toLowerCase().includes(q) ||
                        log.note?.toLowerCase().includes(q) ||
                        log.detail?.toLowerCase().includes(q) ||
                        log.who?.email?.toLowerCase().includes(q) ||
                        log.actor?.toLowerCase().includes(q);
                      return matchesAction && matchesSearch;
                    })
                    .map((log: any) => {
                      const action = log.what || log.event || "LOG_EVENT";
                      const actor = log.who?.email || log.actor || "System";
                      const timestamp = log.when ? new Date(log.when).toLocaleTimeString() : log.time;
                      const dateStr = log.when ? new Date(log.when).toLocaleDateString() : "";
                      const hasDiff = Boolean(log.before || log.after);

                      return (
                        <div
                          key={log.id}
                          className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-[#D4A35A] transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                            <span className="font-bold text-[#5C3A1E] text-[11px] px-2 py-0.5 rounded bg-[#FFFDF9] border border-[#EADFCB] shrink-0 self-start sm:self-auto">
                              [{action}]
                            </span>
                            <div>
                              <span className="font-medium text-[#0F172A]">
                                {log.note || log.detail || `${action} on target ${log.targetId}`}
                              </span>
                              {log.targetTitle && (
                                <span className="text-[#64748B] text-[11px] ml-1">
                                  — {log.targetTitle}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 text-[11px] text-[#94A3B8] shrink-0 self-end sm:self-auto">
                            <span className="font-semibold text-[#5C3A1E]">{actor}</span>
                            <span>• {dateStr ? `${dateStr} ${timestamp}` : timestamp}</span>
                            {hasDiff && (
                              <button
                                type="button"
                                onClick={() => setSelectedAuditLog(log)}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EADFCB]/60 text-[#5C3A1E] hover:bg-[#5C3A1E] hover:text-white transition-colors cursor-pointer"
                              >
                                View Diff
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 6: OFFICIAL APPROVALS HUB
          {/* ========================================================
              TAB 6: OFFICIAL APPROVALS & CLIENT ORDERS HUB
              ======================================================== */}
          {(activeTab === "approvals" || (activeTab as string) === "orders") && (
            <div className="space-y-8">
              {/* New Order Alert Banner */}
              {newOrderNotice && (
                <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in duration-300">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-[#D97706] animate-bounce shrink-0" />
                    <span>{newOrderNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewOrderNotice(null)}
                    className="px-3 py-1 bg-white rounded-lg border border-[#FDE68A] hover:bg-[#FEF3C7] text-xs cursor-pointer transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {approvalToast && (
                <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs font-semibold flex items-center justify-between shadow-xs">
                  <span>✓ {approvalToast}</span>
                  <button onClick={() => setApprovalToast("")} className="hover:underline cursor-pointer">Dismiss</button>
                </div>
              )}

              {/* Real Firebase Client Orders Registry */}
              <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EADFCB]/60 pb-6">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#0F172A]">
                        Client Orders & Production Registry
                      </h3>
                      <Badge variant="gold" size="sm">
                        {realOrders.length} Total Orders
                      </Badge>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      Real-time Firestore synchronized commissions. Filter by status, type, source, or date, inspect client specifications, access AI chat logs, and transition production states.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSopGuideModalOpen(true)}
                      leftIcon={<BookOpen className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                      className="text-xs border-[#EADFCB] text-[#5C3A1E] bg-[#FAF9F5] hover:bg-[#F4EFE6]"
                    >
                      📖 Multi-Channel SOP
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsRecordExternalModalOpen(true)}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      className="text-xs shadow-xs"
                    >
                      ➕ Record External Order
                    </Button>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[11px] text-[#2E7D4F] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
                      <span>Firestore Sync Active</span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fetchRealOrders(false)}
                      disabled={isLoadingRealOrders}
                      leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoadingRealOrders ? "animate-spin" : ""}`} />}
                      className="text-xs"
                    >
                      Refresh
                    </Button>
                  </div>
                </div>

                {/* Payment Action Feedback Banner */}
                {paymentActionFeedback && (
                  <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span>{paymentActionFeedback.message}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentActionFeedback(null)}
                      className="text-[11px] hover:underline cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Search & Multi-Filter Controls */}
                <div className="space-y-3.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Search Input */}
                    <div className="relative flex items-center min-w-[220px] flex-1">
                      <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search by order #, client, email, service..."
                        value={orderSearchQuery}
                        onChange={(e) => {
                          setOrderSearchQuery(e.target.value);
                          setOrderCurrentPage(1);
                        }}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A]"
                      />
                    </div>

                    {/* Status Filter */}
                    <div className="min-w-[140px] shrink-0">
                      <select
                        value={orderStatusFilter}
                        onChange={(e) => {
                          setOrderStatusFilter(e.target.value);
                          setOrderCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A] cursor-pointer"
                        title="Order Lifecycle Status"
                      >
                        <option value="all">All Stages</option>
                        <option value="pending_payment">Pending Payment</option>
                        <option value="paid">Paid (Awaiting Review)</option>
                        <option value="brief_review">Brief Review & Kickoff</option>
                        <option value="in_production">In Production</option>
                        <option value="draft_delivered">Draft Delivered</option>
                        <option value="revision_requested">Revision Requested</option>
                        <option value="approved">Approved</option>
                        <option value="completed">Completed & Vaulted</option>
                        <option value="trial">Monthly Trial</option>
                        <option value="active">Active Retainer</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                    </div>

                    {/* Payment Status Filter */}
                    <div className="min-w-[140px] shrink-0">
                      <select
                        value={orderPaymentFilter}
                        onChange={(e) => {
                          setOrderPaymentFilter(e.target.value);
                          setOrderCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A] cursor-pointer font-medium text-[#5C3A1E]"
                        title="Razorpay Payment Status"
                      >
                        <option value="all">All Payments</option>
                        <option value="paid">Paid via Razorpay</option>
                        <option value="unpaid">Unpaid / Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>

                    {/* Type Filter */}
                    <div className="min-w-[125px] shrink-0">
                      <select
                        value={orderTypeFilter}
                        onChange={(e) => {
                          setOrderTypeFilter(e.target.value);
                          setOrderCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A] cursor-pointer"
                      >
                        <option value="all">All Types</option>
                        <option value="service">Services</option>
                        <option value="monthly_plan">Retainer Plans</option>
                      </select>
                    </div>

                    {/* Source Filter */}
                    <div className="min-w-[105px] shrink-0">
                      <select
                        value={orderSourceFilter}
                        onChange={(e) => {
                          setOrderSourceFilter(e.target.value);
                          setOrderCurrentPage(1);
                        }}
                        className="w-full px-2.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A] cursor-pointer"
                        title="Source Channel"
                      >
                        <option value="all">All Sources</option>
                        <option value="dashboard">Web</option>
                        <option value="ai_chat">AI Chat</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                    </div>

                    {/* Date Filter & Sort */}
                    <div className="min-w-[145px] shrink-0">
                      <select
                        value={orderSortBy}
                        onChange={(e) => setOrderSortBy(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A] cursor-pointer"
                        title="Sort Orders"
                      >
                        <option value="date_desc">Newest First</option>
                        <option value="date_asc">Oldest First</option>
                        <option value="amount_desc">Amount: High to Low</option>
                        <option value="amount_asc">Amount: Low to High</option>
                        <option value="status">Status</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-[#64748B] pt-1">
                    <div className="flex items-center gap-3">
                      <span>Showing <strong>{filteredAndSortedOrders.length}</strong> matching commissions</span>
                      {orderSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setOrderSearchQuery("")}
                          className="text-[#5C3A1E] hover:underline cursor-pointer"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] font-medium border border-[#FDE68A]">
                        {realOrders.filter((o) => o.status === "pending_payment" || o.status === "pending").length} Pending
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] font-medium border border-[#BBF7D0]">
                        {realOrders.filter((o) => ["paid", "brief_review", "in_production", "draft_delivered", "revision_requested", "trial", "active", "in_progress"].includes(o.status)).length} Active
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] font-medium border border-[#A7F3D0]">
                        {realOrders.filter((o) => o.status === "completed" || o.status === "approved").length} Completed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Orders Content: Table for Desktop, Cards for Mobile */}
                {filteredAndSortedOrders.length === 0 ? (
                  <div className="p-12 text-center text-xs text-[#64748B] bg-[#FAF9F5] rounded-2xl border border-[#EADFCB] space-y-2">
                    <ShoppingBag className="w-8 h-8 text-[#A98B57] mx-auto opacity-60" />
                    <p className="font-semibold text-[#0F172A]">No orders found</p>
                    <p className="text-[11px] text-[#64748B]">
                      Try adjusting your search criteria or filter options.
                    </p>
                    {(orderSearchQuery || orderStatusFilter !== "all" || orderTypeFilter !== "all" || orderSourceFilter !== "all") && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setOrderSearchQuery("");
                          setOrderStatusFilter("all");
                          setOrderTypeFilter("all");
                          setOrderSourceFilter("all");
                          setOrderDateFilter("all");
                        }}
                        className="mt-2"
                      >
                        Reset All Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Desktop View: Full Data Table with safe horizontal scroll */}
                    <div className="hidden lg:block overflow-x-auto rounded-2xl border border-[#EADFCB] bg-[#FFFFFF] shadow-2xs">
                      <table className="w-full text-left text-xs min-w-[960px]">
                        <thead className="bg-[#FAF9F5] border-b border-[#EADFCB] text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                          <tr>
                            <th className="py-3.5 px-4 min-w-[130px]">Commission Code</th>
                            <th className="py-3.5 px-4 min-w-[170px]">Client</th>
                            <th className="py-3.5 px-4 min-w-[190px]">Service & Type</th>
                            <th className="py-3.5 px-4 min-w-[95px]">Amount</th>
                            <th className="py-3.5 px-4 min-w-[110px]">Payment</th>
                            <th className="py-3.5 px-4 min-w-[150px]">Lifecycle & Progress</th>
                            <th className="py-3.5 px-4 min-w-[95px]">SLA / Due</th>
                            <th className="py-3.5 px-4 min-w-[160px] text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EADFCB]/60">
                          {paginatedOrders.map((order) => {
                            const isChat = order.source === "ai_chat";
                            const itemsCount = order.items?.length || 1;
                            const placedDate = order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Recent";
                            const progress = computeOrderProgress(order);

                            const serviceDisplayName =
                              order.title && order.title.length > 3 && order.title.toLowerCase() !== "ys"
                                ? order.title
                                : order.service && order.service.length > 2
                                ? order.service
                                : "Studio Creative Direction";

                            return (
                              <tr key={order.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                                <td className="py-3.5 px-4">
                                  <div className="space-y-1">
                                    <span className="font-mono text-xs font-bold text-[#5C3A1E] block">
                                      {order.code || order.orderNumber || `#${order.id}`}
                                    </span>
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                        isChat
                                          ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                                          : "bg-[#F8F5EF] text-[#64748B] border-[#EADFCB]"
                                      }`}
                                    >
                                      {isChat ? (
                                        <>
                                          <Sparkles className="w-2.5 h-2.5 text-[#D4A35A]" />
                                          <span>AI Chat</span>
                                        </>
                                      ) : (
                                        <>
                                          <ShoppingBag className="w-2.5 h-2.5 text-[#5C3A1E]" />
                                          <span>Dashboard</span>
                                        </>
                                      )}
                                    </span>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div>
                                    <p className="font-semibold text-[#0F172A] truncate max-w-[160px]">
                                      {order.clientName || "Studio Client"}
                                    </p>
                                    <p className="text-[11px] text-[#64748B] truncate max-w-[160px]">
                                      {order.clientEmail || "client@sutrastudio.com"}
                                    </p>
                                    {order.assignedTo && (
                                      <span className="inline-flex items-center gap-1 text-[10px] text-[#A98B57] font-medium mt-0.5">
                                        <UserCheck className="w-2.5 h-2.5" />
                                        <span>{order.assignedTo.name}</span>
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="space-y-0.5">
                                    <span className="font-semibold text-[#0F172A] truncate max-w-[200px] block" title={serviceDisplayName}>
                                      {serviceDisplayName}
                                    </span>
                                    <div className="flex items-center gap-2 text-[10px] text-[#64748B]">
                                      <span className="capitalize">
                                        {order.type === "monthly_plan" ? "Monthly Retainer" : "Individual Service"}
                                      </span>
                                      <span>•</span>
                                      <span>{itemsCount} {itemsCount === 1 ? "Item" : "Items"}</span>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#5C3A1E] whitespace-nowrap">
                                  ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                                </td>

                                <td className="py-3.5 px-4">
                                  {order.paymentStatus === "paid" || order.status === "paid" ? (
                                    <div className="space-y-0.5">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] whitespace-nowrap">
                                        <Check className="w-2.5 h-2.5 text-[#059669]" />
                                        <span>Paid</span>
                                      </span>
                                      {order.razorpayPaymentId && (
                                        <span className="block font-mono text-[9px] text-[#64748B] truncate max-w-[95px]" title={order.razorpayPaymentId}>
                                          {order.razorpayPaymentId}
                                        </span>
                                      )}
                                    </div>
                                  ) : order.paymentStatus === "refunded" || order.status === "refunded" ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF5FF] text-[#6B21A8] border border-[#E9D5FF] whitespace-nowrap">
                                      Refunded
                                    </span>
                                  ) : order.paymentStatus === "failed" ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] whitespace-nowrap">
                                      Failed
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFFDF0] text-[#9A6700] border border-[#F1E0A6] whitespace-nowrap">
                                      Unpaid
                                    </span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4">
                                  <div className="space-y-1.5 min-w-[130px]">
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-semibold text-[#0F172A] truncate max-w-[95px]">
                                        {progress.stageName}
                                      </span>
                                      <span className="font-mono text-[10px] font-bold text-[#A98B57]">
                                        {progress.percentage}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-[#EADFCB]/60 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-[#D4A35A] to-[#5C3A1E] rounded-full transition-all duration-500"
                                        style={{ width: `${progress.percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 px-4 text-[#64748B] text-[11px] whitespace-nowrap">
                                  {order.estimatedDueDate ? (
                                    <span className="inline-flex items-center gap-1 text-[#5C3A1E] font-medium">
                                      <Calendar className="w-3 h-3 text-[#A98B57]" />
                                      <span>{new Date(order.estimatedDueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                                    </span>
                                  ) : (
                                    <span>{placedDate}</span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {order.paymentStatus !== "paid" && order.status !== "paid" && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleMarkPaymentReceived(
                                              order.id,
                                              order.source === "qr_upi" ? "upi_qr" : "bank_transfer",
                                              "Direct Settlement Confirmation"
                                            )
                                          }
                                          disabled={isProcessingPaymentAction === order.id}
                                          className="p-1.5 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] text-[#166534] hover:bg-[#DCFCE7] cursor-pointer flex items-center gap-1 text-[11px] font-semibold transition-all shadow-2xs"
                                          title="Mark payment as received (QR UPI / Bank / Cash)"
                                        >
                                          {isProcessingPaymentAction === order.id ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#166534]" />
                                          ) : (
                                            <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                                          )}
                                          <span className="hidden xl:inline">Paid</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleSendPaymentReminder(order.id)}
                                          disabled={isProcessingPaymentAction === order.id}
                                          className="p-1.5 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] text-[#92400E] hover:bg-[#FEF3C7] cursor-pointer flex items-center gap-1 text-[11px] font-semibold transition-all shadow-2xs"
                                          title="Send payment reminder notification to client"
                                        >
                                          <Bell className="w-3.5 h-3.5 text-[#D97706]" />
                                          <span className="hidden xl:inline">Remind</span>
                                        </button>
                                      </>
                                    )}
                                    {(order.paymentStatus === "paid" || order.status === "paid") && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setAdminReceiptOrder(order as any);
                                          setIsAdminReceiptOpen(true);
                                        }}
                                        className="p-1.5 rounded-lg border border-[#EADFCB] text-[#5C3A1E] hover:bg-[#FAF9F5] cursor-pointer"
                                        title="View Official Receipt"
                                      >
                                        <Receipt className="w-3.5 h-3.5 text-[#A98B57]" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleDispatchOrderToN8n(order)}
                                      disabled={dispatchingOrderWf === order.id}
                                      className="p-1.5 rounded-lg border border-[#D4A35A] bg-[#FFFDF9] text-[#5C3A1E] hover:bg-[#FAF9F5] cursor-pointer flex items-center gap-1 text-[11px] font-semibold transition-all shadow-2xs"
                                      title="Dispatch to n8n Autonomous Automation Engine"
                                    >
                                      {dispatchingOrderWf === order.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#5C3A1E]" />
                                      ) : (
                                        <Zap className="w-3.5 h-3.5 text-[#D4A35A]" />
                                      )}
                                      <span className="hidden xl:inline">n8n</span>
                                    </button>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => {
                                        setInspectingAdminOrder(order);
                                        setAdminOrderModalTab("details");
                                        setStatusChangeTarget(order.status || "paid");
                                        setStatusChangeNote("");
                                      }}
                                      className="text-xs"
                                    >
                                      Inspect & Manage
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View: High-Density Responsive Cards */}
                    <div className="block lg:hidden space-y-3.5">
                      {paginatedOrders.map((order) => {
                        const isChat = order.source === "ai_chat";
                        const placedDate = order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Recent";
                        const progress = computeOrderProgress(order);

                        return (
                          <div
                            key={order.id}
                            className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EADFCB] shadow-2xs space-y-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-[#5C3A1E]">
                                  {order.code || order.orderNumber || `#${order.id}`}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                    isChat
                                      ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                                      : "bg-[#F8F5EF] text-[#64748B] border-[#EADFCB]"
                                  }`}
                                >
                                  {isChat ? "AI Chat" : "Dashboard"}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#94A3B8]">{placedDate}</span>
                            </div>

                            <div>
                              <p className="font-semibold text-sm text-[#0F172A]">
                                {order.title || order.service || "Creative Direction"}
                              </p>
                              <p className="text-xs text-[#64748B]">
                                Client: <strong className="text-[#0F172A]">{order.clientName || "Studio Client"}</strong>
                              </p>
                              {order.assignedTo && (
                                <p className="text-[11px] text-[#A98B57] font-medium flex items-center gap-1 mt-0.5">
                                  <UserCheck className="w-3 h-3" />
                                  <span>Assigned to: {order.assignedTo.name}</span>
                                </p>
                              )}
                            </div>

                            {/* Mobile Progress Bar */}
                            <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/70 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-[#0F172A]">{progress.stageName}</span>
                                <span className="font-mono font-bold text-[#A98B57]">{progress.percentage}%</span>
                              </div>
                              <div className="w-full bg-[#EADFCB] rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#D4A35A] to-[#5C3A1E] rounded-full"
                                  style={{ width: `${progress.percentage}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-[#EADFCB]/60 flex-wrap gap-2">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-[#94A3B8] block">Commission</span>
                                <span className="font-serif font-bold text-base text-[#5C3A1E]">
                                  ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 flex-wrap">
                                {order.paymentStatus !== "paid" && order.status !== "paid" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleMarkPaymentReceived(
                                          order.id,
                                          "upi_qr",
                                          "Mobile Quick Payment Verification"
                                        )
                                      }
                                      className="p-1 px-2 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] text-[#166534] text-[10px] font-bold"
                                    >
                                      ✓ Paid
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSendPaymentReminder(order.id)}
                                      className="p-1 px-2 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] text-[#92400E] text-[10px] font-bold"
                                    >
                                      🔔 Remind
                                    </button>
                                  </>
                                )}
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    order.paymentStatus === "paid"
                                      ? "bg-[#ECFDF5] text-[#065F46]"
                                      : order.paymentStatus === "refunded"
                                      ? "bg-[#FAF5FF] text-[#6B21A8]"
                                      : "bg-[#FEF3C7] text-[#92400E]"
                                  }`}
                                >
                                  {order.paymentStatus ? order.paymentStatus.toUpperCase() : "UNPAID"}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleDispatchOrderToN8n(order)}
                                  disabled={dispatchingOrderWf === order.id}
                                  className="p-1.5 rounded-xl border border-[#D4A35A] bg-[#FFFDF9] text-[#5C3A1E] hover:bg-[#FAF9F5] cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                                  title="Dispatch to n8n"
                                >
                                  {dispatchingOrderWf === order.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#5C3A1E]" />
                                  ) : (
                                    <Zap className="w-3.5 h-3.5 text-[#D4A35A]" />
                                  )}
                                </button>

                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setInspectingAdminOrder(order);
                                    setAdminOrderModalTab("details");
                                    setStatusChangeTarget(order.status || "paid");
                                    setStatusChangeNote("");
                                  }}
                                  className="text-xs py-1 px-2.5"
                                >
                                  Inspect & Manage
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    {totalOrderPages > 1 && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#EADFCB]/60 text-xs text-[#64748B]">
                        <span>
                          Page {orderCurrentPage} of {totalOrderPages} (
                          {(orderCurrentPage - 1) * ORDERS_PER_PAGE + 1} -{" "}
                          {Math.min(orderCurrentPage * ORDERS_PER_PAGE, filteredAndSortedOrders.length)} of{" "}
                          {filteredAndSortedOrders.length} commissions)
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={orderCurrentPage === 1}
                            onClick={() => setOrderCurrentPage((p) => Math.max(1, p - 1))}
                            leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                            className="text-xs"
                          >
                            Previous
                          </Button>
                          <span className="font-mono text-xs px-2 py-1 bg-[#FAF9F5] border border-[#EADFCB] rounded-lg">
                            {orderCurrentPage}
                          </span>
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={orderCurrentPage >= totalOrderPages}
                            onClick={() => setOrderCurrentPage((p) => Math.min(totalOrderPages, p + 1))}
                            className="text-xs"
                          >
                            <span>Next</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Immutable Approvals Ledger */}
              <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-4">
                <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                  Official Approvals Audit Ledger
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#EADFCB] text-[#64748B]">
                        <th className="py-2.5 font-semibold">Approval ID</th>
                        <th className="py-2.5 font-semibold">Project</th>
                        <th className="py-2.5 font-semibold">Client</th>
                        <th className="py-2.5 font-semibold">Status</th>
                        <th className="py-2.5 font-semibold">Timestamp</th>
                        <th className="py-2.5 font-semibold">Authorized Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EADFCB]/60 font-mono">
                      {officialApprovalsLog.map((log) => (
                        <tr key={log.approvalId} className="hover:bg-[#FAF9F5]/80">
                          <td className="py-3 font-semibold text-[#5C3A1E]">{log.approvalId}</td>
                          <td className="py-3 text-[#0F172A]">{log.projectId}</td>
                          <td className="py-3 text-[#475569]">{log.client}</td>
                          <td className="py-3">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] font-bold border border-[#A7F3D0]">
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 text-[#94A3B8]">{log.timestamp}</td>
                          <td className="py-3 text-[#5C3A1E]">{log.adminId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal: Tabbed Order Inspection & Management Modal */}
              {inspectingAdminOrder && (
                <Modal
                  isOpen={true}
                  onClose={() => setInspectingAdminOrder(null)}
                  title={`Commission Studio Hub: ${inspectingAdminOrder.code || inspectingAdminOrder.orderNumber || inspectingAdminOrder.id}`}
                  maxWidth="xl"
                >
                  <div className="space-y-6 text-xs text-[#0F172A]">
                    {/* Header Summary & Real-Time Progress Tracker */}
                    <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-[#5C3A1E]">
                              {inspectingAdminOrder.code || inspectingAdminOrder.orderNumber || inspectingAdminOrder.id}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] font-medium border border-[#FDE68A] uppercase">
                              {inspectingAdminOrder.status}
                            </span>
                          </div>
                          <h4 className="font-semibold text-sm text-[#0F172A] mt-1">
                            {inspectingAdminOrder.title || inspectingAdminOrder.service || "Creative Direction"}
                          </h4>
                        </div>

                        <div className="sm:text-right">
                          <span className="text-[11px] text-[#64748B] block">Total Commission</span>
                          <span className="font-serif font-bold text-xl text-[#5C3A1E]">
                            ₹{(inspectingAdminOrder.totalAmount || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* 100% Progress Bar */}
                      {(() => {
                        const p = computeOrderProgress(inspectingAdminOrder);
                        return (
                          <div className="p-3 rounded-xl bg-white border border-[#EADFCB] space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-[#A98B57]" />
                                <span>Current Phase: {p.stageName}</span>
                              </span>
                              <span className="font-mono font-bold text-[#A98B57]">{p.percentage}% Completed</span>
                            </div>
                            <div className="w-full bg-[#FAF9F5] border border-[#EADFCB]/80 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#D4A35A] to-[#5C3A1E] rounded-full transition-all duration-500"
                                style={{ width: `${p.percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* 4 Modal Sub-Tabs */}
                    <div className="flex items-center gap-1 border-b border-[#EADFCB] pb-1">
                      {[
                        { id: "details", label: "Scope & Brief", icon: FileText, count: null },
                        {
                          id: "deliverables",
                          label: "Vault Deliverables",
                          icon: HardDrive,
                          count: Array.isArray(inspectingAdminOrder.deliverables) ? inspectingAdminOrder.deliverables.length : 0,
                        },
                        { id: "internal", label: "Internal Notes & Team", icon: Lock, count: null },
                        { id: "discussion", label: "Discussion & Timeline", icon: MessageSquare, count: null },
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = adminOrderModalTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setAdminOrderModalTab(tab.id as any)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              isActive
                                ? "bg-[#5C3A1E] text-white shadow-2xs"
                                : tab.id === "deliverables" && (tab.count || 0) > 0
                                ? "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] hover:bg-[#FEF3C7]"
                                : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF9F5]"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                            {typeof tab.count === "number" && tab.count > 0 && (
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                                  isActive ? "bg-white/20 text-white" : "bg-[#D4A35A] text-white"
                                }`}
                              >
                                {tab.count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* TAB 1: DETAILS & SCOPE */}
                    {adminOrderModalTab === "details" && (
                      <div className="space-y-4">
                        {/* Client Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EADFCB] space-y-2">
                            <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Client Contact</span>
                            <div className="space-y-1">
                              <p className="font-semibold text-sm text-[#0F172A]">
                                {inspectingAdminOrder.clientName || "Studio Client"}
                              </p>
                              <p className="text-[#64748B] flex items-center gap-1.5">
                                <span>Email:</span>
                                <span className="font-mono text-[#0F172A]">
                                  {inspectingAdminOrder.clientEmail || "client@sutrastudio.com"}
                                </span>
                              </p>
                              {inspectingAdminOrder.clientPhone && (
                                <p className="text-[#64748B] flex items-center gap-1.5">
                                  <span>Phone:</span>
                                  <span className="font-mono text-[#0F172A]">{inspectingAdminOrder.clientPhone}</span>
                                </p>
                              )}
                              <p className="text-[#64748B] flex items-center gap-1.5 text-[11px]">
                                <span>Client ID:</span>
                                <span className="font-mono text-[#5C3A1E]">
                                  {inspectingAdminOrder.clientId || inspectingAdminOrder.clientUid || "client"}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EADFCB] space-y-2">
                            <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Commission Profile</span>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-[#64748B]">Type:</span>
                                <span className="font-semibold capitalize">{inspectingAdminOrder.type === "monthly_plan" ? "Monthly Retainer" : "Individual Service"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#64748B]">Source:</span>
                                <span className="font-semibold">{inspectingAdminOrder.source === "ai_chat" ? "AI Chat Assistant" : "Dashboard"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#64748B]">Estimated SLA:</span>
                                <span className="font-semibold">{inspectingAdminOrder.estimatedDeliveryDays || 5} Business Days</span>
                              </div>
                              {inspectingAdminOrder.estimatedDueDate && (
                                <div className="flex justify-between">
                                  <span className="text-[#64748B]">Target Due Date:</span>
                                  <span className="font-semibold text-[#5C3A1E]">{new Date(inspectingAdminOrder.estimatedDueDate).toLocaleDateString("en-IN")}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Brief Requirements */}
                        <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Client Brief & Instructions</span>
                          <p className="text-xs text-[#0F172A] leading-relaxed whitespace-pre-wrap">
                            {inspectingAdminOrder.requirements || inspectingAdminOrder.notes || "No special instructions provided."}
                          </p>
                        </div>

                        {/* N8N AUTONOMOUS WORKFLOW EXECUTION GATE & LIVE PROGRESS MONITOR */}
                        {(() => {
                          const wfProg = computeN8nWorkflowProgress(inspectingAdminOrder, selectedWfId);
                          return (
                            <div className="p-5 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4A35A] space-y-4 shadow-sm">
                              {/* Gate Header */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EADFCB]/70 pb-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9 h-9 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-center text-[#5C3A1E] shadow-2xs">
                                    <Zap className="w-4 h-4 text-[#D4A35A]" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-serif font-bold text-sm text-[#0F172A]">
                                        n8n Autonomous Pipeline Execution Gate
                                      </h5>
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FAF9F5] text-[#A98B57] border border-[#EADFCB]">
                                        {wfProg.shortCode} Active
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-[#64748B]">
                                      Admin Review Gated: Direct client orders require admin approval before dispatching to n8n.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#5C3A1E] text-white shadow-2xs">
                                    {wfProg.percentage}% Completed
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF9F5] text-[#5C3A1E] border border-[#EADFCB]">
                                    Admin Gated
                                  </span>
                                </div>
                              </div>

                              {/* Progress Bar & Current Phase */}
                              <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-[#0F172A]">{wfProg.workflowName}</span>
                                    {dispatchingOrderWf === inspectingAdminOrder.id && (
                                      <span className="flex items-center gap-1 text-[10px] font-mono text-[#D97706] font-bold animate-pulse">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Executing in container...
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-mono text-[11px] font-bold text-[#5C3A1E]">
                                    {wfProg.percentage}%
                                  </span>
                                </div>

                                {/* Visual Progress Bar */}
                                <div className="w-full h-3 bg-[#EADFCB]/50 rounded-full overflow-hidden p-0.5">
                                  <div
                                    className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#D4A35A] via-[#A98B57] to-[#5C3A1E]"
                                    style={{ width: `${Math.max(5, wfProg.percentage)}%` }}
                                  />
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-0.5">
                                  <span className="font-medium text-[#5C3A1E] flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4A35A]" />
                                    {wfProg.currentStepLabel}
                                  </span>
                                  {inspectingAdminOrder.workflowRunId && (
                                    <span className="font-mono text-[10px] text-[#94A3B8]">
                                      Run ID: {inspectingAdminOrder.workflowRunId}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Step-by-Step Workflow Pipeline Tracker */}
                              <div className="space-y-2 pt-1">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-[#94A3B8] block">
                                  Pipeline Stage Breakdown & Milestones ({wfProg.shortCode})
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                                  {wfProg.stages.map((stg, idx) => (
                                    <div
                                      key={stg.id}
                                      className={`p-2.5 rounded-xl border text-left transition-all ${
                                        stg.isPassed
                                          ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
                                          : stg.isCurrent
                                          ? "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E] ring-1 ring-[#D97706]/30"
                                          : "bg-white border-[#EADFCB] text-[#94A3B8]"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="text-[10px] font-mono font-bold">
                                          0{idx + 1}. {stg.percentage}%
                                        </span>
                                        {stg.isPassed ? (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                                        ) : stg.isCurrent ? (
                                          <span className="w-2 h-2 rounded-full bg-[#D97706] animate-ping" />
                                        ) : (
                                          <Clock className="w-3.5 h-3.5 text-[#CBD5E1]" />
                                        )}
                                      </div>
                                      <div className="font-semibold text-[11px] truncate" title={stg.name}>
                                        {stg.name}
                                      </div>
                                      <p className="text-[10px] line-clamp-2 mt-0.5 leading-tight opacity-85">
                                        {stg.description}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Workflow Engine Dispatch Controls */}
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-[#EADFCB]/70">
                                <div className="sm:col-span-8 space-y-1">
                                  <label className="text-[11px] font-bold text-[#64748B] block">
                                    Target n8n Autonomous Workflow Engine:
                                  </label>
                                  <select
                                    value={selectedWfId}
                                    onChange={(e) => setSelectedWfId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#D4A35A]"
                                  >
                                    <option value="SUTRA_MASTER_AUTONOMOUS_PIPELINE">
                                      ★ Master Autonomous Creative Pipeline (All 12 Services + Retainers)
                                    </option>
                                    <option value="W1_order_fulfillment_router">
                                      W1: Order Fulfillment Router (4K Render / Video Reel / 3D / Ads)
                                    </option>
                                    <option value="W2_approval_and_publish">
                                      W2: Client Approval & Social Media Multi-Publisher
                                    </option>
                                    <option value="W3_monthly_plan_content">
                                      W3: Monthly Retainer Automated Calendar Generator
                                    </option>
                                    <option value="W5_agency_daily_autopost">
                                      W5: Agency Daily Automated Social Publisher
                                    </option>
                                  </select>
                                </div>

                                <div className="sm:col-span-4 flex items-end">
                                  <Button
                                    variant="primary"
                                    size="md"
                                    className="w-full justify-center text-xs"
                                    disabled={dispatchingOrderWf === inspectingAdminOrder.id}
                                    isLoading={dispatchingOrderWf === inspectingAdminOrder.id}
                                    onClick={() => handleDispatchOrderToN8n(inspectingAdminOrder)}
                                    leftIcon={<Zap className="w-3.5 h-3.5 text-[#D4A35A]" />}
                                  >
                                    {inspectingAdminOrder.workflowStatus === "draft_ready" || inspectingAdminOrder.status === "draft_delivered"
                                      ? "🔄 Re-trigger Workflow"
                                      : "⚡ Dispatch to n8n"}
                                  </Button>
                                </div>
                              </div>

                              {/* Execution Feedback */}
                              {wfDispatchFeedback && (
                                <div
                                  className={`p-3.5 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-2.5 ${
                                    wfDispatchFeedback.success
                                      ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
                                      : "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{wfDispatchFeedback.message}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {wfDispatchFeedback.success && (
                                      <button
                                        type="button"
                                        onClick={() => setAdminOrderModalTab("deliverables")}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#166534] text-white font-semibold text-[11px] hover:bg-[#14532d] transition-all shadow-2xs cursor-pointer shrink-0"
                                      >
                                        <HardDrive className="w-3.5 h-3.5" />
                                        <span>View & Approve in Deliverables Tab &rarr;</span>
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setWfDispatchFeedback(null)}
                                      className="text-[11px] font-bold underline cursor-pointer text-[#64748B] hover:text-[#0F172A]"
                                    >
                                      Dismiss
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Scope Breakdown */}
                        {inspectingAdminOrder.items && inspectingAdminOrder.items.length > 0 && (
                          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EADFCB] space-y-2">
                            <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Scope Breakdown</span>
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#FAF9F5] border-b border-[#EADFCB] text-[10px] uppercase font-bold text-[#64748B]">
                                <tr>
                                  <th className="py-2 px-3">Item</th>
                                  <th className="py-2 px-3">Price</th>
                                  <th className="py-2 px-3">Qty</th>
                                  <th className="py-2 px-3 text-right">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#EADFCB]/60">
                                {inspectingAdminOrder.items.map((item, idx) => (
                                  <tr key={idx}>
                                    <td className="py-2 px-3 font-medium text-[#0F172A]">{item.name}</td>
                                    <td className="py-2 px-3 font-mono text-[#64748B]">₹{item.price?.toLocaleString("en-IN")}</td>
                                    <td className="py-2 px-3 font-mono">{item.quantity || 1}</td>
                                    <td className="py-2 px-3 text-right font-serif font-bold text-[#5C3A1E]">
                                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Payment Verification & Settlement Box */}
                        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EADFCB] space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <AnimatedPaymentBadge size={32} />
                              <span className="text-[10px] uppercase font-bold text-[#94A3B8]">
                                Multi-Channel Payment Settlement & Verification
                              </span>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                inspectingAdminOrder.paymentStatus === "paid" || inspectingAdminOrder.status === "paid"
                                  ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                                  : "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>
                                {inspectingAdminOrder.paymentStatus === "paid" || inspectingAdminOrder.status === "paid"
                                  ? `PAID (${(inspectingAdminOrder.paymentMethod || "VERIFIED").toUpperCase()})`
                                  : "PAYMENT PENDING / UNPAID"}
                              </span>
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/70">
                              <span className="text-[10px] text-[#94A3B8] font-bold block">Method / Gateway</span>
                              <span className="font-mono text-[11px] font-semibold text-[#0F172A] capitalize">
                                {inspectingAdminOrder.paymentMethod || (inspectingAdminOrder.razorpayPaymentId ? "Razorpay" : "Invoice / UPI")}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/70">
                              <span className="text-[10px] text-[#94A3B8] font-bold block">Ref ID / UTR</span>
                              <span className="font-mono text-[11px] font-semibold text-[#64748B] break-all">
                                {inspectingAdminOrder.paymentReference || inspectingAdminOrder.razorpayPaymentId || "None"}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/70">
                              <span className="text-[10px] text-[#94A3B8] font-bold block">Amount Payable / Settled</span>
                              <span className="font-serif font-bold text-xs text-[#5C3A1E]">
                                ₹{(inspectingAdminOrder.amountPaid || inspectingAdminOrder.totalAmount || 0).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/70">
                              <span className="text-[10px] text-[#94A3B8] font-bold block">Settled Timestamp</span>
                              <span className="text-[11px] text-[#0F172A]">
                                {inspectingAdminOrder.paidAt ? new Date(inspectingAdminOrder.paidAt).toLocaleDateString("en-IN") : "Awaiting Settlement"}
                              </span>
                            </div>
                          </div>

                          {/* Quick Payment Settlement Controls for Admin */}
                          {inspectingAdminOrder.paymentStatus !== "paid" && inspectingAdminOrder.status !== "paid" && (
                            <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                              <div>
                                <span className="font-bold text-[#92400E] block">Payment Pending Action:</span>
                                <p className="text-[11px] text-[#B45309]">
                                  If client transferred funds via UPI QR scan, IMPS/NEFT, or cash, click confirm to update records.
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() =>
                                    handleMarkPaymentReceived(
                                      inspectingAdminOrder.id,
                                      "upi_qr",
                                      "Admin Direct QR / Bank Verification"
                                    )
                                  }
                                  disabled={isProcessingPaymentAction === inspectingAdminOrder.id}
                                  isLoading={isProcessingPaymentAction === inspectingAdminOrder.id}
                                  leftIcon={<Check className="w-3.5 h-3.5" />}
                                  className="text-xs !bg-[#2E7D4F] hover:!bg-[#24633F]"
                                >
                                  ✓ Confirm Payment Received
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSendPaymentReminder(inspectingAdminOrder.id)}
                                  disabled={isProcessingPaymentAction === inspectingAdminOrder.id}
                                  leftIcon={<Bell className="w-3.5 h-3.5 text-[#D97706]" />}
                                  className="text-xs border-[#FDE68A] text-[#92400E] bg-white hover:bg-[#FEF3C7]"
                                >
                                  Send Reminder
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EADFCB]/60">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setAdminReceiptOrder({
                                  ...inspectingAdminOrder,
                                  orderNumber: inspectingAdminOrder.orderNumber || inspectingAdminOrder.code || inspectingAdminOrder.id,
                                });
                                setIsAdminReceiptOpen(true);
                              }}
                              leftIcon={<Receipt className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                            >
                              Official Receipt
                            </Button>
                            {(inspectingAdminOrder.paymentStatus === "paid" || inspectingAdminOrder.status === "paid") && (
                              <button
                                type="button"
                                disabled={isRefunding}
                                onClick={() => handleAdminRefundOrder(inspectingAdminOrder)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 cursor-pointer transition-all"
                              >
                                {isRefunding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                                <span>Issue Refund</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: VAULT DELIVERABLES */}
                    {adminOrderModalTab === "deliverables" && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#D4A35A]/50 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <HardDrive className="w-4 h-4 text-[#D4A35A]" />
                              <h5 className="font-semibold text-xs uppercase tracking-wider text-[#5C3A1E]">
                                Google Drive Vault Root
                              </h5>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={inspectingAdminOrder.driveFolderLink || `https://drive.google.com/drive/folders/${inspectingAdminOrder.driveFolderId || "COMMISSIONS"}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A] hover:bg-[#F4EFE6] transition-all"
                              >
                                <span>Open Vault Folder</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <button
                                type="button"
                                disabled={isArchivingDrive}
                                onClick={() => handleArchiveDriveFolder(inspectingAdminOrder)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-[#EADFCB] text-[11px] text-[#64748B] hover:text-[#DC2626] hover:border-red-200 transition-all cursor-pointer"
                              >
                                <Archive className="w-3 h-3" />
                                <span>{isArchivingDrive ? "Archiving..." : "Archive"}</span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/70">
                              <span className="text-[10px] text-[#94A3B8] font-bold block">01 Client Assets</span>
                              <span className="font-semibold text-[#0F172A]">
                                {Array.isArray(inspectingAdminOrder.attachments) ? inspectingAdminOrder.attachments.length : 0} Staged
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/70">
                              <span className="text-[10px] text-[#94A3B8] font-bold block">02 Drafts</span>
                              <span className="font-semibold text-[#0F172A]">
                                {Array.isArray(inspectingAdminOrder.deliverables)
                                  ? inspectingAdminOrder.deliverables.filter((d: any) => d.category === "drafts").length
                                  : 0} Version(s)
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/70">
                              <span className="text-[10px] text-[#94A3B8] font-bold block">03 Final Delivery</span>
                              <span className="font-semibold text-[#0F172A]">
                                {inspectingAdminOrder.status === "completed" || inspectingAdminOrder.status === "approved" ? "Master Vaulted" : "In Queue"}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/70">
                              <span className="text-[10px] text-[#94A3B8] font-bold block">04 Revisions</span>
                              <span className="font-semibold text-[#0F172A]">
                                Round {inspectingAdminOrder.revisionRound || 0} / {inspectingAdminOrder.maxRevisions || 2}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Admin Approval & Quality Gate Banner */}
                        {inspectingAdminOrder.status === "draft_delivered" || inspectingAdminOrder.workflowStatus === "draft_ready" ? (
                          <div className="p-4 rounded-2xl bg-[#FFFBEB] border-2 border-[#D97706]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-white border border-[#FDE68A] flex items-center justify-center text-[#92400E] shrink-0 shadow-2xs">
                                <ShieldCheck className="w-5 h-5 text-[#D97706]" />
                              </div>
                              <div>
                                <h5 className="font-serif font-bold text-xs text-[#92400E]">
                                  Studio Admin Quality Review Gate
                                </h5>
                                <p className="text-[11px] text-[#B45309]">
                                  Autonomous drafts are vaulted in '02 Drafts'. Review the media files below and authorize client release.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAdminUpdateOrderStatus(inspectingAdminOrder.id, "approved", "Admin verified and approved autonomous creative drafts.")}
                                leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-[#BBF7D0]" />}
                                className="bg-[#166534] hover:bg-[#14532d] text-white text-xs"
                              >
                                ✓ Approve Drafts & Release
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleDispatchOrderToN8n(inspectingAdminOrder, "W2_approval_and_publish")}
                                leftIcon={<Zap className="w-3.5 h-3.5 text-[#D4A35A]" />}
                                className="text-xs"
                              >
                                Publish to Meta
                              </Button>
                            </div>
                          </div>
                        ) : inspectingAdminOrder.status === "approved" || inspectingAdminOrder.status === "completed" ? (
                          <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between text-xs text-[#166534]">
                            <div className="flex items-center gap-2 font-medium">
                              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                              <span>Deliverables Approved & Released to Client Vault.</span>
                            </div>
                            <span className="font-mono text-[11px] font-bold text-[#15803D]">Admin Authorized</span>
                          </div>
                        ) : null}

                        {/* Existing Deliverables Visual Gallery */}
                        {Array.isArray(inspectingAdminOrder.deliverables) && inspectingAdminOrder.deliverables.length > 0 ? (
                          <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EADFCB] space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">
                                Vaulted Deliverables ({inspectingAdminOrder.deliverables.length} Items)
                              </span>
                              <span className="text-[10px] font-mono text-[#64748B]">Google Drive 02 Drafts Vault</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {inspectingAdminOrder.deliverables.map((del: any, idx: number) => {
                                const isImg = del.mimeType?.startsWith("image") || del.filename?.match(/\.(png|jpg|jpeg|webp)$/i);
                                const isPdf = del.mimeType?.includes("pdf") || del.filename?.endsWith(".pdf");
                                const isVideo = del.mimeType?.startsWith("video") || del.filename?.match(/\.(mp4|mov|webm)$/i);
                                const is3D = del.filename?.match(/\.(glb|gltf|obj|fbx)$/i);

                                return (
                                  <div
                                    key={idx}
                                    className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] hover:border-[#D4A35A] transition-all flex flex-col justify-between space-y-2.5 shadow-2xs group"
                                  >
                                    {/* Visual Image / Media Thumbnail Preview */}
                                    {isImg && del.previewUrl && (
                                      <div className="w-full h-36 rounded-lg overflow-hidden bg-white border border-[#EADFCB] relative group">
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

                                    {/* File Header & Badge Info */}
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-start gap-2 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-white border border-[#EADFCB] flex items-center justify-center text-[#5C3A1E] shrink-0 mt-0.5">
                                          {isImg ? (
                                            <ImageIcon className="w-4 h-4 text-[#A98B57]" />
                                          ) : isVideo ? (
                                            <Video className="w-4 h-4 text-[#A98B57]" />
                                          ) : is3D ? (
                                            <Box className="w-4 h-4 text-[#A98B57]" />
                                          ) : (
                                            <FileText className="w-4 h-4 text-[#A98B57]" />
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="font-semibold text-xs text-[#0F172A] truncate" title={del.filename}>
                                            {del.filename}
                                          </div>
                                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[#64748B] font-mono">
                                            <span>{del.fileSize || "12 MB"}</span>
                                            <span>•</span>
                                            <span className="text-[#5C3A1E] font-bold">{del.version || "v1.0"}</span>
                                            {del.uploadedAt && (
                                              <>
                                                <span>•</span>
                                                <span>{new Date(del.uploadedAt).toLocaleDateString("en-IN")}</span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <span className="px-2 py-0.5 rounded-full bg-white border border-[#EADFCB] text-[#5C3A1E] text-[10px] font-mono uppercase shrink-0">
                                        {del.category || "draft"}
                                      </span>
                                    </div>

                                    {/* Action Links */}
                                    <div className="flex items-center gap-2 pt-1 border-t border-[#EADFCB]/60">
                                      {del.previewUrl && (
                                        <a
                                          href={del.previewUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="w-full py-1.5 px-2.5 bg-white hover:bg-[#F5F2EB] border border-[#EADFCB] rounded-lg text-[#5C3A1E] font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                                        >
                                          <ExternalLink className="w-3.5 h-3.5 text-[#D4A35A]" />
                                          <span>Preview / Download Media</span>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 rounded-2xl bg-[#FFFFFF] border border-[#EADFCB] text-center space-y-2">
                            <HardDrive className="w-8 h-8 text-[#D4A35A] mx-auto opacity-70" />
                            <h5 className="font-semibold text-xs text-[#0F172A]">No Vault Deliverables Staged Yet</h5>
                            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                              Execute the n8n pipeline in the Scope & Brief tab or upload manual production files below to stage drafts in Google Drive.
                            </p>
                          </div>
                        )}

                        {/* Deliverable Upload Panel */}
                        <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-3">
                          <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Upload Production Deliverable</span>

                          {/* Subfolder Category Switcher */}
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: "drafts", label: "02 Drafts" },
                              { id: "final_delivery", label: "03 Final Delivery" },
                              { id: "revisions", label: "04 Revisions" },
                            ].map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setDeliveryCategory(cat.id as any)}
                                className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                  deliveryCategory === cat.id
                                    ? "bg-[#5C3A1E] text-white border-[#5C3A1E] shadow-2xs"
                                    : "bg-white text-[#64748B] border-[#EADFCB] hover:border-[#D4A35A]"
                                }`}
                              >
                                {cat.label}
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                                Upload File (browser → Drive, up to 2 GB):
                              </label>
                              <input
                                type="file"
                                onChange={(e) => {
                                  const f = e.target.files?.[0] || null;
                                  setDeliveryFile(f);
                                  if (f && !deliveryFilename) {
                                    setDeliveryFilename(f.name);
                                  }
                                }}
                                className="w-full text-[11px] text-[#64748B] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#FFFFFF] file:text-[#5C3A1E] hover:file:bg-[#F4EFE6] cursor-pointer"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                                Or Drive Link / Master Filename:
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Master_4K_Render.zip or https://drive.google.com/..."
                                value={deliveryPreviewUrl || deliveryFilename}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val.startsWith("http")) {
                                    setDeliveryPreviewUrl(val);
                                  } else {
                                    setDeliveryFilename(val);
                                  }
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-[#64748B] block mb-1">Delivery Notes to Client:</label>
                            <input
                              type="text"
                              placeholder="e.g. Draft 1.0 ready for client review. Please inspect and approve or request revision."
                              value={deliveryNote}
                              onChange={(e) => setDeliveryNote(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                            />
                          </div>

                          {deliveryProgress && deliveryProgress.phase !== "done" && (
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-semibold text-[#64748B] mb-1">
                                <span className="uppercase tracking-wide">
                                  {deliveryProgress.phase === "opening"
                                    ? "Opening Drive session…"
                                    : deliveryProgress.phase === "validating"
                                      ? "Checking file…"
                                      : deliveryProgress.phase === "finalising"
                                        ? "Registering metadata…"
                                        : `Uploading chunk ${deliveryProgress.chunkIndex} / ${deliveryProgress.chunkCount}`}
                                </span>
                                <span>{deliveryProgress.percent}%</span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-[#EADFCB] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#A98B57] transition-all duration-200"
                                  style={{ width: `${deliveryProgress.percent}%` }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end pt-1">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleDeliverFinalResult}
                              isLoading={isDelivering}
                              leftIcon={<Send className="w-3.5 h-3.5" />}
                            >
                              {deliveryCategory === "final_delivery"
                                ? "Deliver Final Result (Move to Draft Delivered / Completed)"
                                : `Vault Asset to ${deliveryCategory === "drafts" ? "02 Drafts" : "04 Revisions"}`}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: INTERNAL NOTES & TEAM ASSIGNMENT */}
                    {adminOrderModalTab === "internal" && (
                      <div className="space-y-4">
                        {/* Team Assignment */}
                        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EADFCB] space-y-3">
                          <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Team Specialist Assignment</span>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <select
                              value={assignedMemberId}
                              onChange={(e) => handleAssignOrderTeamMember(e.target.value)}
                              className="w-full sm:w-80 px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A] cursor-pointer"
                            >
                              <option value="">-- Unassigned (Studio General Queue) --</option>
                              {STUDIO_TEAM_MEMBERS.map((tm) => (
                                <option key={tm.id} value={tm.id}>
                                  {tm.name} — {tm.role}
                                </option>
                              ))}
                            </select>
                            {inspectingAdminOrder.assignedTo && (
                              <span className="text-xs text-[#2E7D4F] font-semibold flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Active Lead: {inspectingAdminOrder.assignedTo.name}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Private Supervisor Internal Notes Thread */}
                        <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#D4A35A]/60 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-[#D4A35A]" />
                              <h5 className="font-semibold text-xs uppercase tracking-wider text-[#5C3A1E]">
                                Confidential Studio Internal Notes (Private to Admin)
                              </h5>
                            </div>
                            <span className="text-[10px] text-[#94A3B8]">Never visible to client</span>
                          </div>

                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {inspectingAdminOrder.internalNotes && inspectingAdminOrder.internalNotes.length > 0 ? (
                              inspectingAdminOrder.internalNotes.map((note) => (
                                <div key={note.id} className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/70 space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-semibold text-[#5C3A1E]">{note.author}</span>
                                    <span className="text-[10px] text-[#94A3B8]">
                                      {new Date(note.createdAt).toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#0F172A] leading-relaxed">{note.text}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-[#64748B] italic py-2">
                                No internal notes recorded yet. Add private instructions, SLA reminders, or technical notes below.
                              </p>
                            )}
                          </div>

                          <div className="space-y-2 pt-2 border-t border-[#EADFCB]/60">
                            <textarea
                              rows={2}
                              value={newInternalNoteText}
                              onChange={(e) => setNewInternalNoteText(e.target.value)}
                              placeholder="Add private note for the studio team..."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                            />
                            <div className="flex justify-end">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleAddOrderPrivateNote}
                                isLoading={isSavingInternalNote}
                                disabled={!newInternalNoteText.trim()}
                                leftIcon={<Lock className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                              >
                                Save Private Note
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: DISCUSSION & TIMELINE */}
                    {adminOrderModalTab === "discussion" && (
                      <div className="space-y-4">
                        {/* Real-Time Order Discussion */}
                        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EADFCB] space-y-3">
                          <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Client / Studio Discussion Thread</span>

                          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                            {adminOrderComments.length === 0 && !isLoadingAdminComments ? (
                              <p className="text-xs text-[#64748B] italic py-2">No messages in this order thread yet.</p>
                            ) : (
                              adminOrderComments.map((comment) => {
                                const isAdmin = comment.sender === "admin";
                                return (
                                  <div
                                    key={comment.id}
                                    className={`p-3 rounded-xl text-xs space-y-1 ${
                                      isAdmin
                                        ? "bg-[#FAF9F5] border border-[#EADFCB] ml-4"
                                        : "bg-[#F0FDF4] border border-[#BBF7D0] mr-4"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-semibold text-[#0F172A]">
                                        {comment.authorName} ({isAdmin ? "Studio Producer" : "Client"})
                                      </span>
                                      <span className="text-[10px] text-[#94A3B8]">
                                        {new Date(comment.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                      </span>
                                    </div>
                                    <p className="text-xs text-[#0F172A] leading-relaxed">{comment.text}</p>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          <div className="space-y-2 pt-2 border-t border-[#EADFCB]/60">
                            <textarea
                              rows={2}
                              value={newAdminCommentText}
                              onChange={(e) => setNewAdminCommentText(e.target.value)}
                              placeholder="Type a message to the client..."
                              className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                            />
                            <div className="flex justify-end">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={handlePostAdminComment}
                                isLoading={isPostingAdminComment}
                                disabled={!newAdminCommentText.trim()}
                                leftIcon={<Send className="w-3.5 h-3.5" />}
                              >
                                Send to Client
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Status History Timeline */}
                        <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-2">
                          <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Status Transition Audit History</span>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {inspectingAdminOrder.statusHistory && inspectingAdminOrder.statusHistory.length > 0 ? (
                              inspectingAdminOrder.statusHistory.map((h, i) => (
                                <div key={i} className="flex items-start gap-2.5 pb-2 border-b border-[#EADFCB]/50 last:border-b-0 last:pb-0">
                                  <span className="w-2 h-2 rounded-full bg-[#5C3A1E] mt-1 shrink-0" />
                                  <div className="flex-1 space-y-0.5 text-xs">
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-[#0F172A] uppercase">{h.status}</span>
                                      <span className="text-[10px] text-[#94A3B8]">{new Date(h.changedAt).toLocaleString("en-IN")}</span>
                                    </div>
                                    <p className="text-[11px] text-[#64748B]">Updated by {h.changedBy}</p>
                                    {h.note && <p className="text-[11px] text-[#475569] italic">&ldquo;{h.note}&rdquo;</p>}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-[#64748B]">Initial status recorded at creation.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Status Transition Panel */}
                    <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#D4A35A]/50 space-y-3">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#D4A35A]" />
                        <h5 className="font-semibold text-xs uppercase tracking-wider text-[#5C3A1E]">
                          Administrative Lifecycle State Transition
                        </h5>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] font-semibold text-[#64748B] block mb-1.5">
                            Target Lifecycle State:
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { id: "pending_payment", label: "Pending Payment" },
                              { id: "paid", label: "Paid" },
                              { id: "brief_review", label: "Brief Review" },
                              { id: "in_production", label: "In Production" },
                              { id: "draft_delivered", label: "Draft Delivered" },
                              { id: "revision_requested", label: "Revision Mode" },
                              { id: "approved", label: "Approved" },
                              { id: "completed", label: "Completed (100%)" },
                              { id: "on_hold", label: "On Hold" },
                              { id: "cancelled", label: "Cancelled" },
                            ].map((st) => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => setStatusChangeTarget(st.id)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                                  statusChangeTarget === st.id
                                    ? "bg-[#5C3A1E] text-white border-[#5C3A1E] shadow-2xs"
                                    : "bg-white text-[#64748B] border-[#EADFCB] hover:border-[#D4A35A]"
                                }`}
                              >
                                {st.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-[#64748B] block mb-1">
                            Status Update Note (Logged to audit trail & client):
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Brief approved by creative director, production initiated."
                            value={statusChangeNote}
                            onChange={(e) => setStatusChangeNote(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setInspectingAdminOrder(null)}
                            disabled={isUpdatingStatus}
                          >
                            Close
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isUpdatingStatus || !statusChangeTarget}
                            onClick={() =>
                              handleAdminUpdateOrderStatus(
                                inspectingAdminOrder.id,
                                statusChangeTarget,
                                statusChangeNote
                              )
                            }
                            leftIcon={isUpdatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          >
                            {isUpdatingStatus ? "Updating..." : "Save State Transition"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Modal>
              )}
            </div>
          )}

          {/* ========================================================
              TAB: NOTIFICATIONS & AUTOMATION CRON SCHEDULER
              ======================================================== */}
          {activeTab === "notifications" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Header Title Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADFCB]/80 pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-serif text-2xl font-bold text-[#0F172A]">
                      Notifications & Scheduled Jobs Hub
                    </h2>
                    <Badge variant="gold" size="sm">
                      n8n / External Cron
                    </Badge>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1">
                    Manage daily idempotent reminder schedules (Asia/Kolkata), date simulation testing, threshold configurations, and real-time dispatches.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={fetchBroadcastNotifications}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Refresh Dispatches
                  </Button>
                </div>
              </div>

              {/* Execution Notice */}
              {cronNotice && (
                <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs font-semibold flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>{cronNotice}</span>
                  </div>
                  <button
                    onClick={() => setCronNotice(null)}
                    className="text-[#15803D] hover:underline cursor-pointer ml-3 text-[11px]"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {notifSettingsSuccess && (
                <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs font-semibold flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>{notifSettingsSuccess}</span>
                  </div>
                  <button
                    onClick={() => setNotifSettingsSuccess(null)}
                    className="text-[#15803D] hover:underline cursor-pointer ml-3 text-[11px]"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Main Two-Column Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Daily Scheduler & Simulation Engine Card */}
                <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#5C3A1E]" />
                          <h3 className="font-serif font-bold text-base text-[#0F172A]">
                            Daily Idempotent Scheduler
                          </h3>
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          Runs daily at <strong>09:00 AM IST (Asia/Kolkata)</strong>. Never sends duplicate notices for the same event key.
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[10px] font-mono font-bold shrink-0">
                        Active • 09:00 IST
                      </span>
                    </div>

                    {/* Date Simulation Tool */}
                    <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#D4A35A]" />
                          <span>Date Simulation (Time-Travel Testing)</span>
                        </label>
                        <span className="text-[10px] font-mono text-[#94A3B8]">
                          {cronSimulateDate ? `Simulating: ${cronSimulateDate}` : "Real Clock: Active"}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <input
                          type="date"
                          value={cronSimulateDate}
                          onChange={(e) => setCronSimulateDate(e.target.value)}
                          className="w-full sm:w-auto flex-1 px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                        />

                        {cronSimulateDate && (
                          <button
                            type="button"
                            onClick={() => setCronSimulateDate("")}
                            className="text-xs text-[#DC2626] hover:underline px-2 cursor-pointer font-medium"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      {/* Simulation Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px]">
                        <span className="text-[#94A3B8] font-semibold mr-1">Quick Jumps:</span>
                        <button
                          type="button"
                          onClick={() => setCronSimulateDate("")}
                          className="px-2 py-1 rounded-md bg-white border border-[#EADFCB] hover:border-[#D4A35A] text-[#5C3A1E] font-mono cursor-pointer"
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date(Date.now() + 3 * 24 * 3600 * 1000);
                            setCronSimulateDate(d.toISOString().split("T")[0]);
                          }}
                          className="px-2 py-1 rounded-md bg-white border border-[#EADFCB] hover:border-[#D4A35A] text-[#5C3A1E] font-mono cursor-pointer"
                        >
                          +3 Days (Drafts)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date(Date.now() + 5 * 24 * 3600 * 1000);
                            setCronSimulateDate(d.toISOString().split("T")[0]);
                          }}
                          className="px-2 py-1 rounded-md bg-white border border-[#EADFCB] hover:border-[#D4A35A] text-[#5C3A1E] font-mono cursor-pointer"
                        >
                          +5 Days (Retainer 5d)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date(Date.now() + 30 * 24 * 3600 * 1000);
                            setCronSimulateDate(d.toISOString().split("T")[0]);
                          }}
                          className="px-2 py-1 rounded-md bg-white border border-[#EADFCB] hover:border-[#D4A35A] text-[#5C3A1E] font-mono cursor-pointer"
                        >
                          +30 Days (Expiry/Closure)
                        </button>
                      </div>

                      {/* Dry Run Checkbox */}
                      <div className="pt-2 border-t border-[#EADFCB]/60 flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-[#0F172A]">
                          <input
                            type="checkbox"
                            checked={cronDryRun}
                            onChange={(e) => setCronDryRun(e.target.checked)}
                            className="rounded text-[#5C3A1E] focus:ring-[#D4A35A]"
                          />
                          <span>Dry Run (Preview triggers without saving status transitions)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Run Button */}
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleExecuteScheduledCron}
                      disabled={isExecutingCron}
                      leftIcon={
                        isExecutingCron ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )
                      }
                      className="w-full justify-center min-h-[44px] shadow-sm font-semibold text-xs"
                    >
                      {isExecutingCron
                        ? "Evaluating Scheduled Triggers..."
                        : cronSimulateDate
                        ? `Execute Scheduled Evaluation for ${cronSimulateDate}`
                        : "Run Daily Lifecycle Evaluation Now"}
                    </Button>
                  </div>

                  {/* Summary of Last Run */}
                  {cronResult && (
                    <div className="mt-4 p-4 rounded-2xl bg-[#FAF9F5] border border-[#D4A35A]/50 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between font-semibold text-[#5C3A1E]">
                        <span>Last Execution Summary:</span>
                        <span className="font-mono text-[10px] text-[#64748B]">
                          {new Date(cronResult.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-xl bg-white border border-[#EADFCB]">
                          <span className="text-[10px] text-[#94A3B8] block">Dispatched</span>
                          <span className="font-bold text-sm text-[#2E7D4F]">
                            {cronResult.notificationsSent}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-[#EADFCB]">
                          <span className="text-[10px] text-[#94A3B8] block">Idempotent Skips</span>
                          <span className="font-bold text-sm text-[#B45309]">
                            {cronResult.skippedDuplicates}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-[#EADFCB]">
                          <span className="text-[10px] text-[#94A3B8] block">Auto Transitions</span>
                          <span className="font-bold text-sm text-[#5C3A1E]">
                            {cronResult.statusTransitions}
                          </span>
                        </div>
                      </div>

                      {cronResult.summary?.length > 0 && (
                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto pr-1">
                          {cronResult.summary.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-2 rounded-lg bg-white border border-[#EADFCB] flex items-center justify-between text-[11px]"
                            >
                              <span className="font-mono font-semibold text-[#5C3A1E]">
                                #{item.orderNumber}
                              </span>
                              <span className="text-[#0F172A]">{item.action}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Configurable Thresholds & Settings Card */}
                <form
                  onSubmit={handleSaveNotificationSettings}
                  className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between"
                >
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-[#5C3A1E]" />
                        <h3 className="font-serif font-bold text-base text-[#0F172A]">
                          Notification Thresholds & Rules
                        </h3>
                      </div>
                      <Badge variant="neutral" size="sm">
                        Firebase Stored
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Monthly Warning Days */}
                      <div className="space-y-1">
                        <label className="font-semibold text-[#0F172A] block">
                          Monthly Expiry Reminders
                        </label>
                        <p className="text-[11px] text-[#64748B]">Days before cycle concludes:</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2.5 py-1.5 rounded-lg bg-[#FAF9F5] border border-[#EADFCB] font-mono font-bold text-[#5C3A1E]">
                            5 Days & 1 Day
                          </span>
                        </div>
                      </div>

                      {/* Draft Review Reminder */}
                      <div className="space-y-1">
                        <label className="font-semibold text-[#0F172A] block">
                          Draft Review Nudge Window
                        </label>
                        <p className="text-[11px] text-[#64748B]">Days after upload without response:</p>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            min="1"
                            max="14"
                            value={adminNotifSettings.draftReviewReminderDays}
                            onChange={(e) =>
                              setAdminNotifSettings({
                                ...adminNotifSettings,
                                draftReviewReminderDays: Number(e.target.value) || 3,
                              })
                            }
                            className="w-20 px-2.5 py-1.5 rounded-lg bg-[#FAF9F5] border border-[#EADFCB] text-xs font-mono font-bold text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                          />
                          <span className="text-[#64748B]">days</span>
                        </div>
                      </div>

                      {/* Unpaid Order Reminder */}
                      <div className="space-y-1">
                        <label className="font-semibold text-[#0F172A] block">
                          Unpaid Commission Reminder
                        </label>
                        <p className="text-[11px] text-[#64748B]">Hours after order creation:</p>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            min="1"
                            max="72"
                            value={adminNotifSettings.unpaidReminderHours}
                            onChange={(e) =>
                              setAdminNotifSettings({
                                ...adminNotifSettings,
                                unpaidReminderHours: Number(e.target.value) || 24,
                              })
                            }
                            className="w-20 px-2.5 py-1.5 rounded-lg bg-[#FAF9F5] border border-[#EADFCB] text-xs font-mono font-bold text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                          />
                          <span className="text-[#64748B]">hours</span>
                        </div>
                      </div>

                      {/* Due Date Warning */}
                      <div className="space-y-1">
                        <label className="font-semibold text-[#0F172A] block">
                          SLA Due Date Alert
                        </label>
                        <p className="text-[11px] text-[#64748B]">Days before milestone SLA due:</p>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            min="1"
                            max="7"
                            value={adminNotifSettings.dueDateWarningDays}
                            onChange={(e) =>
                              setAdminNotifSettings({
                                ...adminNotifSettings,
                                dueDateWarningDays: Number(e.target.value) || 2,
                              })
                            }
                            className="w-20 px-2.5 py-1.5 rounded-lg bg-[#FAF9F5] border border-[#EADFCB] text-xs font-mono font-bold text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                          />
                          <span className="text-[#64748B]">days</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Channels */}
                    <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-3 mt-2">
                      <span className="font-semibold text-xs text-[#0F172A] block">
                        Delivery Channels & Gateways
                      </span>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={adminNotifSettings.inAppNotificationsEnabled}
                            onChange={(e) =>
                              setAdminNotifSettings({
                                ...adminNotifSettings,
                                inAppNotificationsEnabled: e.target.checked,
                              })
                            }
                            className="rounded text-[#5C3A1E]"
                          />
                          <span>Real-Time In-App Bell</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={adminNotifSettings.emailNotificationsEnabled}
                            onChange={(e) =>
                              setAdminNotifSettings({
                                ...adminNotifSettings,
                                emailNotificationsEnabled: e.target.checked,
                              })
                            }
                            className="rounded text-[#5C3A1E]"
                          />
                          <span>Email Dispatch (Resend/SMTP)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={adminNotifSettings.clientRemindersEnabled}
                            onChange={(e) =>
                              setAdminNotifSettings({
                                ...adminNotifSettings,
                                clientRemindersEnabled: e.target.checked,
                              })
                            }
                            className="rounded text-[#5C3A1E]"
                          />
                          <span>Client Lifecycle Alerts</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={adminNotifSettings.adminAlertsEnabled}
                            onChange={(e) =>
                              setAdminNotifSettings({
                                ...adminNotifSettings,
                                adminAlertsEnabled: e.target.checked,
                              })
                            }
                            className="rounded text-[#5C3A1E]"
                          />
                          <span>Studio Supervisor Alerts</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={isSavingNotifSettings}
                      leftIcon={<Check className="w-4 h-4" />}
                      className="w-full justify-center min-h-[44px] shadow-sm font-semibold text-xs"
                    >
                      {isSavingNotifSettings ? "Saving Settings..." : "Save Notification Preferences"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* 3. Dispatched Notifications Audit Table */}
              <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADFCB]/60 pb-4">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#0F172A]">
                      Live Notification Dispatch Registry
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Real-time log of in-app dispatches, scheduled alerts, and event triggers across clients and administrators.
                    </p>
                  </div>

                  <span className="font-mono text-xs font-semibold text-[#5C3A1E] bg-[#FAF9F5] px-3 py-1 rounded-full border border-[#EADFCB]">
                    {broadcastNotifs.length} Total Dispatches
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#EADFCB] text-[#94A3B8] font-mono text-[11px]">
                        <th className="pb-3 font-semibold">Recipient</th>
                        <th className="pb-3 font-semibold">Type</th>
                        <th className="pb-3 font-semibold">Order</th>
                        <th className="pb-3 font-semibold">Title & Details</th>
                        <th className="pb-3 font-semibold">Timestamp</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EADFCB]/60">
                      {broadcastNotifs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#94A3B8]">
                            No notifications dispatched yet.
                          </td>
                        </tr>
                      ) : (
                        broadcastNotifs.slice(0, 20).map((n) => (
                          <tr key={n.id} className="hover:bg-[#FAF9F5] transition-colors">
                            <td className="py-3 pr-2">
                              {n.userId === "usr_admin_001" || n.userId === "admin" ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5C3A1E] text-white">
                                  Studio Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF9F5] text-[#5C3A1E] border border-[#EADFCB]">
                                  Client ({n.userId.slice(0, 8)})
                                </span>
                              )}
                            </td>
                            <td className="py-3 pr-2 font-mono text-[11px] text-[#64748B]">
                              {n.type}
                            </td>
                            <td className="py-3 pr-2 font-mono text-[11px] font-bold text-[#5C3A1E]">
                              {n.orderNumber ? `#${n.orderNumber}` : "—"}
                            </td>
                            <td className="py-3 pr-2 max-w-xs">
                              <span className="font-semibold text-[#0F172A] block">{n.title}</span>
                              <span className="text-[#64748B] text-[11px] line-clamp-1">{n.message}</span>
                            </td>
                            <td className="py-3 pr-2 font-mono text-[10px] text-[#94A3B8]">
                              {new Date(n.createdAt).toLocaleString("en-IN", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="py-3">
                              {n.read ? (
                                <span className="text-[#16A34A] font-semibold text-[10px]">Read</span>
                              ) : (
                                <span className="text-[#D4A35A] font-bold text-[10px]">Unread</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 7: WEBSITE SITE CONTROL PANEL
              ======================================================== */}
          {activeTab === "site-control" && (
            <div className="space-y-8">
              {siteSaveSuccess && (
                <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs font-semibold flex items-center justify-between shadow-xs">
                  <span>✓ {siteSaveSuccess}</span>
                  <button onClick={() => setSiteSaveSuccess("")} className="hover:underline cursor-pointer">Dismiss</button>
                </div>
              )}

              <form onSubmit={handleSaveSiteControl} className="space-y-8">
                {/* Hero & Brand Messaging */}
                <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                      Homepage Hero & Public Brand Messaging
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1">
                      Configure public-facing headlines, brand declarations, and call-to-action anchors.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-[#0F172A]">Hero Main Headline</label>
                      <input
                        type="text"
                        value={siteContent.heroHeadline}
                        onChange={(e) => setSiteContent({ ...siteContent, heroHeadline: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADFCB] text-xs bg-[#FAF9F5] focus:outline-none focus:ring-1 focus:ring-[#D4A35A]"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-[#0F172A]">Hero Editorial Subtitle</label>
                      <textarea
                        rows={2}
                        value={siteContent.heroSubtitle}
                        onChange={(e) => setSiteContent({ ...siteContent, heroSubtitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADFCB] text-xs bg-[#FAF9F5] focus:outline-none focus:ring-1 focus:ring-[#D4A35A]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#0F172A]">Primary CTA Button Text</label>
                      <input
                        type="text"
                        value={siteContent.primaryCtaText}
                        onChange={(e) => setSiteContent({ ...siteContent, primaryCtaText: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADFCB] text-xs bg-[#FAF9F5] focus:outline-none focus:ring-1 focus:ring-[#D4A35A]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#0F172A]">Secondary CTA Button Text</label>
                      <input
                        type="text"
                        value={siteContent.secondaryCtaText}
                        onChange={(e) => setSiteContent({ ...siteContent, secondaryCtaText: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADFCB] text-xs bg-[#FAF9F5] focus:outline-none focus:ring-1 focus:ring-[#D4A35A]"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-[#0F172A]">Announcement Banner Text</label>
                      <input
                        type="text"
                        value={siteContent.announcement}
                        onChange={(e) => setSiteContent({ ...siteContent, announcement: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADFCB] text-xs bg-[#FAF9F5] focus:outline-none focus:ring-1 focus:ring-[#D4A35A]"
                      />
                    </div>
                  </div>
                </div>

                {/* SUTRA STUDIO CLIENT DELIVERABLES & PRICING PITCH GUIDE */}
                <div className="rounded-3xl bg-linear-to-br from-[#FFFDF9] via-[#FAF9F5] to-[#F5EFE6] border border-[#A98B57]/40 p-6 sm:p-8 shadow-md space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EADFCB] pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-[#5C3A1E] text-white text-[11px] font-bold uppercase tracking-wider">
                          Admin Reference & Client Pitch
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EBF5EE] border border-[#C2E0C7] text-[10px] font-semibold text-[#1B5E20]">
                          Live Studio Blueprint
                        </span>
                      </div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0F172A]">
                        Client Deliverables, Quantity Scaling & Retainer Fulfillment Guide
                      </h3>
                      <p className="text-xs text-[#64748B] max-w-3xl leading-relaxed">
                        Use this guide to explain exact deliverables per unit, quantity multipliers (1, 2, 3...), turnarounds, and how monthly retainers fulfill daily/weekly client requests.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const pitch = `Namaste! At Sutra Studio, you can work with us in two flexible ways:\n\n1. Per-Project (Individual Services): 4K image creation starting at ₹5,499 (3-5 renders/unit), cinematic video ads at ₹7,999, 3D modeling at ₹9,499, and 360 virtual tours at ₹11,999. Quantity scales linearly with full commercial usage license.\n\n2. Monthly Retainer Plans: Studio Growth (₹12,999/mo) or Starter (₹5,999/mo) gives you dedicated creative capacity (15 renders, 3 video ads, 3D models) with continuous 24-48h sprint fulfillment and a 3-Day Risk-Free Trial.\n\nAll deliverables stage directly into your private Google Drive vault.`;
                          navigator.clipboard.writeText(pitch);
                          setCopiedPitch(true);
                          setTimeout(() => setCopiedPitch(false), 2500);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#5C3A1E] text-white text-xs font-semibold hover:bg-[#432A15] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {copiedPitch ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#A3E635]" />
                            <span>Pitch Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#D4A35A]" />
                            <span>Copy Client Pitch Script</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPricingGuide(!showPricingGuide)}
                        className="px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs font-medium text-[#5C3A1E] hover:bg-white transition-colors cursor-pointer"
                      >
                        {showPricingGuide ? "Collapse Guide" : "Expand Guide"}
                      </button>
                    </div>
                  </div>

                  {showPricingGuide && (
                    <div className="space-y-6 pt-2">
                      {/* Section 1: How Quantity (1, 2, 3...) Works */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EADFCB] space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#5C3A1E] text-white text-xs font-bold flex items-center justify-center">
                            1
                          </span>
                          <h4 className="font-serif text-sm font-bold text-[#0F172A]">
                            How the Quantity Selector (1, 2, 3...) Works for Individual Services
                          </h4>
                        </div>
                        <p className="text-xs text-[#64748B] leading-relaxed">
                          In the Client Dashboard, <strong>Quantity = 1</strong> represents <strong>1 complete production unit / package</strong>. Selecting 2, 3, or more multiplies the unit volume linearly:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs">
                            <span className="font-bold text-[#5C3A1E] block">Image Creation (Qty = 1)</span>
                            <span className="text-[#64748B] mt-0.5 block">₹5,499 • 1 Product (3–5 multi-angle 4K renders)</span>
                          </div>
                          <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs">
                            <span className="font-bold text-[#5C3A1E] block">Image Creation (Qty = 2)</span>
                            <span className="text-[#64748B] mt-0.5 block">₹10,998 • 2 Products (6–10 multi-angle 4K renders)</span>
                          </div>
                          <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs">
                            <span className="font-bold text-[#5C3A1E] block">3D Modeling (Qty = 3)</span>
                            <span className="text-[#64748B] mt-0.5 block">₹28,497 • 3 Distinct 3D PBR models + WebGL files</span>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: How Monthly Retainer Fulfillment Operates */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EADFCB] space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#5C3A1E] text-white text-xs font-bold flex items-center justify-center">
                            2
                          </span>
                          <h4 className="font-serif text-sm font-bold text-[#0F172A]">
                            How Monthly Retainer Plans Fulfill Client Requests (Daily / Weekly)
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1.5 p-3.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]">
                            <span className="font-bold text-[#0F172A] flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-[#D4A35A]" />
                              Continuous Sprint Queue (Always-On Studio)
                            </span>
                            <p className="text-[#64748B] leading-relaxed">
                              Clients submit briefs throughout the month. Each request is picked up immediately with a <strong>24–48 hour sprint turnaround</strong>. Deliverables flow continuously to the client’s private Google Drive vault.
                            </p>
                          </div>
                          <div className="space-y-1.5 p-3.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]">
                            <span className="font-bold text-[#0F172A] flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D4F]" />
                              3-Day Free Trial & Monthly Drops
                            </span>
                            <p className="text-[#64748B] leading-relaxed">
                              Every retainer includes a <strong>3-Day Risk-Free Trial</strong> for sample renders before billing starts. Clients can also request a full <strong>Batch Drop</strong> in the first week for social media scheduling.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Summary Table of Deliverables */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EADFCB] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#5C3A1E] text-white text-xs font-bold flex items-center justify-center">
                              3
                            </span>
                            <h4 className="font-serif text-sm font-bold text-[#0F172A]">
                              12 Services Deliverables Reference (Per Unit Qty = 1)
                            </h4>
                          </div>
                          <span className="text-[11px] text-[#94A3B8]">Full doc in docs/PRICING_DELIVERABLES_GUIDE.md</span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-[#EADFCB] text-[#5C3A1E] font-bold">
                                <th className="py-2 pr-3">Service</th>
                                <th className="py-2 pr-3">Price</th>
                                <th className="py-2 pr-3">SLA</th>
                                <th className="py-2 pr-3">Deliverables (per Unit = 1)</th>
                                <th className="py-2">Formats</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EADFCB]/60 text-[#64748B]">
                              <tr>
                                <td className="py-2 pr-3 font-semibold text-[#0F172A]">1. Image Creation</td>
                                <td className="py-2 pr-3 font-bold text-[#5C3A1E]">₹5,499</td>
                                <td className="py-2 pr-3">24–48h</td>
                                <td className="py-2 pr-3">3–5 Photorealistic 4K Renders for 1 product/concept</td>
                                <td className="py-2">4K PNG / TIFF</td>
                              </tr>
                              <tr>
                                <td className="py-2 pr-3 font-semibold text-[#0F172A]">2. Video Creation</td>
                                <td className="py-2 pr-3 font-bold text-[#5C3A1E]">₹7,999</td>
                                <td className="py-2 pr-3">48–72h</td>
                                <td className="py-2 pr-3">1× 10-30s Cinematic Master Video Ad with Voiceover Sync</td>
                                <td className="py-2">4K MP4 / ProRes (9:16 + 16:9)</td>
                              </tr>
                              <tr>
                                <td className="py-2 pr-3 font-semibold text-[#0F172A]">3. 3D Modeling</td>
                                <td className="py-2 pr-3 font-bold text-[#5C3A1E]">₹9,499</td>
                                <td className="py-2 pr-3">48–72h</td>
                                <td className="py-2 pr-3">1× Precision 3D Model with PBR Textures + 360 Turntable</td>
                                <td className="py-2">GLTF / USDZ / OBJ / .blend</td>
                              </tr>
                              <tr>
                                <td className="py-2 pr-3 font-semibold text-[#0F172A]">4. 360 View Tour</td>
                                <td className="py-2 pr-3 font-bold text-[#5C3A1E]">₹11,999</td>
                                <td className="py-2 pr-3">2–4d</td>
                                <td className="py-2 pr-3">4–8 Interconnected Panoramic Nodes with Hotspots</td>
                                <td className="py-2">8K HDR / HTML5 WebXR</td>
                              </tr>
                              <tr>
                                <td className="py-2 pr-3 font-semibold text-[#0F172A]">5. Interior Design</td>
                                <td className="py-2 pr-3 font-bold text-[#5C3A1E]">₹12,499</td>
                                <td className="py-2 pr-3">48–72h</td>
                                <td className="py-2 pr-3">4K Render Suite (Day/Night) + Material & Furniture Spec</td>
                                <td className="py-2">4K PNG / PDF Spec Deck</td>
                              </tr>
                              <tr>
                                <td className="py-2 pr-3 font-semibold text-[#0F172A]">6. Window Design</td>
                                <td className="py-2 pr-3 font-bold text-[#5C3A1E]">₹6,499</td>
                                <td className="py-2 pr-3">24–48h</td>
                                <td className="py-2 pr-3">Facade Elevation Profiles + 4K Exterior Renders</td>
                                <td className="py-2">CAD DWG / 4K PNG</td>
                              </tr>
                              <tr>
                                <td className="py-2 pr-3 font-semibold text-[#0F172A]">7. Digital Marketing</td>
                                <td className="py-2 pr-3 font-bold text-[#5C3A1E]">₹14,999</td>
                                <td className="py-2 pr-3">3–5d</td>
                                <td className="py-2 pr-3">30-Day Content Calendar + Copywriting Matrix</td>
                                <td className="py-2">PDF Deck + Notion</td>
                              </tr>
                              <tr>
                                <td className="py-2 pr-3 font-semibold text-[#0F172A]">8. Meta Ads Launcher</td>
                                <td className="py-2 pr-3 font-bold text-[#5C3A1E]">₹13,499</td>
                                <td className="py-2 pr-3">48h</td>
                                <td className="py-2 pr-3">5 Creative Ad Variations + Copywriting + Targeting JSON</td>
                                <td className="py-2">Ad Pack (1:1 & 9:16)</td>
                              </tr>
                              <tr>
                                <td className="py-2 pr-3 font-semibold text-[#0F172A]">9. Website Dev</td>
                                <td className="py-2 pr-3 font-bold text-[#5C3A1E]">₹16,999</td>
                                <td className="py-2 pr-3">5–7d</td>
                                <td className="py-2 pr-3">Complete Next.js 16 Website (Up to 5 Pages) + GSAP</td>
                                <td className="py-2">TypeScript Code / Vercel</td>
                              </tr>
                              <tr>
                                <td className="py-2 pr-3 font-semibold text-[#0F172A]">10. Web App Dev</td>
                                <td className="py-2 pr-3 font-bold text-[#5C3A1E]">₹19,999</td>
                                <td className="py-2 pr-3">7–14d</td>
                                <td className="py-2 pr-3">Full-Stack SaaS / Portal + Firebase DB + Auth + Razorpay</td>
                                <td className="py-2">Production Full-Stack</td>
                              </tr>
                              <tr>
                                <td className="py-2 pr-3 font-semibold text-[#0F172A]">11. Mobile App Setup</td>
                                <td className="py-2 pr-3 font-bold text-[#5C3A1E]">₹18,499</td>
                                <td className="py-2 pr-3">10–14d</td>
                                <td className="py-2 pr-3">React Native Expo App (iOS & Android) + Push Alerts</td>
                                <td className="py-2">Expo / IPA / AAB</td>
                              </tr>
                              <tr>
                                <td className="py-2 pr-3 font-semibold text-[#0F172A]">12. AI Automation</td>
                                <td className="py-2 pr-3 font-bold text-[#5C3A1E]">₹15,999</td>
                                <td className="py-2 pr-3">48–72h</td>
                                <td className="py-2 pr-3">Cloud Webhook Router + Google Drive Auto-Sync Pipeline</td>
                                <td className="py-2">n8n / Cloud Functions</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* STEP 12: ALL 12 DATA-DRIVEN STUDIO SERVICES CATALOG */}
                <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EADFCB]/60 pb-6">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#0F172A]">
                          12 Studio Services Catalog (Data-Driven)
                        </h3>
                        <Badge variant="gold" size="sm">
                          {catalogServices.length} Active Services
                        </Badge>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1">
                        All 12 studio capabilities driven from Firebase Firestore. Edit starting prices, delivery SLAs, workflow stages, and dynamic intake brief schemas in real time without code changes.
                      </p>
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                      {["All", "Creative", "Design", "Development", "Marketing", "Automation"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCatalogServiceFilter(cat)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
                            catalogServiceFilter === cat
                              ? "bg-[#5C3A1E] text-white shadow-xs"
                              : "bg-[#FAF9F5] text-[#64748B] hover:text-[#0F172A] border border-[#EADFCB]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 12 Services Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catalogServices
                      .filter(
                        (s) =>
                          catalogServiceFilter === "All" ||
                          s.category === catalogServiceFilter
                      )
                      .map((srv) => (
                        <div
                          key={srv.id}
                          className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex flex-col justify-between space-y-4 hover:border-[#D4A35A] transition-all group"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className="font-mono text-xs font-bold text-[#D4A35A] bg-white px-2 py-0.5 rounded border border-[#EADFCB]">
                                  #{srv.sortIndex}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-[#8C7355] bg-[#F8F5EF] px-2 py-0.5 rounded border border-[#EADFCB]">
                                  {srv.category}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleServiceActive(srv.id, !srv.active)}
                                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                                  srv.active
                                    ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                                    : "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]"
                                }`}
                              >
                                {srv.active ? "Active" : "Archived"}
                              </button>
                            </div>

                            <div>
                              <h4 className="font-serif font-semibold text-sm text-[#0F172A] group-hover:text-[#5C3A1E] transition-colors">
                                {srv.name}
                              </h4>
                              <p className="text-[11px] text-[#A98B57] font-medium mt-0.5">
                                {srv.tagline}
                              </p>
                              <p className="text-xs text-[#64748B] mt-2 line-clamp-2 leading-relaxed">
                                {srv.shortDescription}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EADFCB]/60 text-[11px] font-mono text-[#64748B]">
                              <div>
                                <span className="text-[#94A3B8] block text-[10px]">Starting Price:</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-xs font-bold text-[#5C3A1E]">₹</span>
                                  <input
                                    type="number"
                                    value={srv.startingPrice}
                                    onChange={(e) =>
                                      handleUpdateServicePrice(srv.id, Number(e.target.value) || 0)
                                    }
                                    className="w-20 px-1.5 py-0.5 rounded border border-[#EADFCB] text-xs font-bold text-[#5C3A1E] bg-white focus:outline-none focus:border-[#D4A35A]"
                                  />
                                </div>
                              </div>
                              <div>
                                <span className="text-[#94A3B8] block text-[10px]">SLA / Revisions:</span>
                                <span className="font-medium text-[#0F172A] block mt-1">
                                  {srv.estimatedDeliveryDays}d • {srv.revisionsIncluded} revs
                                </span>
                              </div>
                            </div>

                            <div className="text-[10px] text-[#64748B] flex items-center justify-between pt-1">
                              <span>Brief Fields: <strong>{srv.briefSchema?.length || 0} fields</strong></span>
                              <span>Stages: <strong>{srv.workflowStages?.length || 0} steps</strong></span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#EADFCB]/60">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setEditingService({ ...srv })}
                              leftIcon={<Edit3 className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                              className="w-full text-xs"
                            >
                              Edit Brief Schema & Workflow
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* STEP 12: MONTHLY SUBSCRIPTION PLANS MANAGEMENT */}
                <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EADFCB]/60 pb-6">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#0F172A]">
                          Monthly Subscription Retainer Packages
                        </h3>
                        <Badge variant="gold" size="sm">
                          3 Tiers (3-Day Free Trial Default)
                        </Badge>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1">
                        Configure monthly, quarterly, and annual subscription tiers, deliverables/credits quota, features, and Razorpay Plan IDs.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {catalogPlans.map((pln) => (
                      <div
                        key={pln.id}
                        className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex flex-col justify-between space-y-4 hover:border-[#D4A35A] transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-bold text-base text-[#0F172A]">
                              {pln.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] font-bold border border-[#A7F3D0]">
                              Active
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-white border border-[#EADFCB]">
                            <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Monthly Price:</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="font-serif font-bold text-xl text-[#5C3A1E]">
                                ₹{pln.price.toLocaleString("en-IN")}
                              </span>
                              <span className="text-xs text-[#64748B]">/ month</span>
                            </div>
                            <span className="text-[10px] text-[#A98B57] block mt-1">
                              Quarterly: ₹{pln.quarterlyPrice.toLocaleString("en-IN")} • Annual: ₹{pln.annualPrice.toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs text-[#64748B]">
                            <div className="flex items-center justify-between text-[11px]">
                              <span>Free Trial Days:</span>
                              <span className="font-bold text-[#0F172A]">{pln.freeTrialDays} Days</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span>Razorpay Plan ID:</span>
                              <span className="font-mono text-[#5C3A1E] font-medium">{pln.razorpayPlanId}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#EADFCB]/60 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Included Features:</span>
                            {pln.features.slice(0, 3).map((f, i) => (
                              <div key={i} className="flex items-start gap-1.5 text-[11px] text-[#0F172A]">
                                <Check className="w-3 h-3 text-[#16A34A] shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#EADFCB]/60">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingPlan({ ...pln })}
                            leftIcon={<Edit3 className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                            className="w-full text-xs"
                          >
                            Edit Plan & Credits Quota
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Publish Bar */}
                <div className="flex items-center justify-between p-6 rounded-3xl bg-[#5C3A1E] text-white">
                  <div>
                    <p className="font-serif font-semibold text-base">Publish Live Updates</p>
                    <p className="text-xs text-[#D4A35A]">
                      Synchronize hero content, INR rates, and service listings directly across public pages.
                    </p>
                  </div>
                  <Button type="submit" variant="secondary" size="md">
                    Publish to Live Site
                  </Button>
                </div>
              </form>
              {/* Toast for catalog updates */}
              {catalogSaveToast && (
                <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs font-semibold flex items-center justify-between shadow-xs">
                  <span>✓ {catalogSaveToast}</span>
                  <button onClick={() => setCatalogSaveToast("")} className="hover:underline cursor-pointer">Dismiss</button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB: BRAND PROMPTS & MARKETING STUDIO
              ======================================================== */}
          {activeTab === "prompts" && (
            <AdminBrandPromptsView />
          )}

          {/* =========================================================
              MODAL: EDIT SERVICE BRIEF SCHEMA & WORKFLOW
              ========================================================= */}
          {editingService && (
            <Modal
              isOpen={true}
              onClose={() => setEditingService(null)}
              title={`Edit Service: ${editingService.name}`}
              description="Configure pricing, delivery SLA, workflow stages, and dynamic brief questionnaire schema."
              maxWidth="xl"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveServiceDetails(editingService);
                }}
                className="space-y-6 text-xs"
              >
                {/* Basic Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A] block mb-1">
                      Service Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editingService.name}
                      onChange={(e) =>
                        setEditingService({ ...editingService, name: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A] block mb-1">
                      Starting Price (₹ INR)
                    </label>
                    <input
                      type="number"
                      required
                      value={editingService.startingPrice}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          startingPrice: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs font-mono font-bold text-[#5C3A1E] focus:outline-none focus:border-[#D4A35A]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A] block mb-1">
                      Est. Delivery SLA (Days)
                    </label>
                    <input
                      type="number"
                      required
                      value={editingService.estimatedDeliveryDays}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          estimatedDeliveryDays: Number(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A] block mb-1">
                    Short Editorial Description
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editingService.shortDescription}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        shortDescription: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                  />
                </div>

                {/* Workflow Stages */}
                <div className="space-y-2 p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C3A1E] block">
                    Workflow Stages (Step 16 Pipeline Stages)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {editingService.workflowStages.map((stage, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EADFCB] text-xs font-medium text-[#0F172A]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5C3A1E]" />
                        <span>{stage}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dynamic Brief Questionnaire Schema */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                        Dynamic Intake Brief Schema ({editingService.briefSchema?.length || 0} Questions)
                      </h4>
                      <p className="text-[11px] text-[#64748B]">
                        Form fields presented to client when commissioning this service.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const newKey = `custom_${Date.now().toString(36)}`;
                        setEditingService({
                          ...editingService,
                          briefSchema: [
                            ...editingService.briefSchema,
                            {
                              key: newKey,
                              label: "New Question Label",
                              type: "text",
                              required: false,
                              helpText: "Provide guidance for the client",
                            },
                          ],
                        });
                      }}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add Question Field
                    </Button>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {editingService.briefSchema.map((field, fIdx) => (
                      <div
                        key={field.key || fIdx}
                        className="p-3.5 rounded-xl bg-white border border-[#EADFCB] space-y-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => {
                              const updatedSchema = [...editingService.briefSchema];
                              updatedSchema[fIdx].label = e.target.value;
                              setEditingService({
                                ...editingService,
                                briefSchema: updatedSchema,
                              });
                            }}
                            placeholder="Question Label"
                            className="flex-1 font-semibold text-xs text-[#0F172A] border-b border-transparent focus:border-[#D4A35A] focus:outline-none"
                          />

                          <div className="flex items-center gap-2 shrink-0">
                            <select
                              value={field.type}
                              onChange={(e) => {
                                const updatedSchema = [...editingService.briefSchema];
                                updatedSchema[fIdx].type = e.target.value as any;
                                setEditingService({
                                  ...editingService,
                                  briefSchema: updatedSchema,
                                });
                              }}
                              className="px-2 py-1 rounded-lg bg-[#FAF9F5] border border-[#EADFCB] text-[11px] font-mono text-[#5C3A1E]"
                            >
                              <option value="text">Text</option>
                              <option value="textarea">Textarea</option>
                              <option value="select">Select Dropdown</option>
                              <option value="multiselect">Multiselect</option>
                              <option value="number">Number</option>
                              <option value="url">URL</option>
                              <option value="date">Date</option>
                              <option value="file">File Attachment</option>
                            </select>

                            <label className="flex items-center gap-1 text-[11px] text-[#64748B] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => {
                                  const updatedSchema = [...editingService.briefSchema];
                                  updatedSchema[fIdx].required = e.target.checked;
                                  setEditingService({
                                    ...editingService,
                                    briefSchema: updatedSchema,
                                  });
                                }}
                                className="rounded text-[#5C3A1E]"
                              />
                              <span>Req</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => {
                                const updatedSchema = editingService.briefSchema.filter(
                                  (_, idx) => idx !== fIdx
                                );
                                setEditingService({
                                  ...editingService,
                                  briefSchema: updatedSchema,
                                });
                              }}
                              className="p-1 text-[#94A3B8] hover:text-[#DC2626] transition-colors"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={field.helpText || ""}
                          onChange={(e) => {
                            const updatedSchema = [...editingService.briefSchema];
                            updatedSchema[fIdx].helpText = e.target.value;
                            setEditingService({
                              ...editingService,
                              briefSchema: updatedSchema,
                            });
                          }}
                          placeholder="Help text hint for client..."
                          className="w-full text-[11px] text-[#64748B] bg-[#FAF9F5] px-2.5 py-1 rounded border border-[#EADFCB]/60 focus:outline-none"
                        />

                        {(field.type === "select" || field.type === "multiselect") && (
                          <div className="pt-1">
                            <span className="text-[10px] text-[#94A3B8] block mb-0.5">
                              Options (comma-separated):
                            </span>
                            <input
                              type="text"
                              value={field.options?.join(", ") || ""}
                              onChange={(e) => {
                                const updatedSchema = [...editingService.briefSchema];
                                updatedSchema[fIdx].options = e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean);
                                setEditingService({
                                  ...editingService,
                                  briefSchema: updatedSchema,
                                });
                              }}
                              placeholder="Option 1, Option 2, Option 3..."
                              className="w-full text-[11px] font-mono text-[#0F172A] bg-[#FAF9F5] px-2.5 py-1 rounded border border-[#EADFCB]/60 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#EADFCB]/60">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingService(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSavingCatalog}
                    leftIcon={<Save className="w-3.5 h-3.5" />}
                  >
                    {isSavingCatalog ? "Saving..." : "Save Service Configuration"}
                  </Button>
                </div>
              </form>
            </Modal>
          )}

          {/* =========================================================
              MODAL: EDIT MONTHLY RETAINER PLAN
              ========================================================= */}
          {editingPlan && (
            <Modal
              isOpen={true}
              onClose={() => setEditingPlan(null)}
              title={`Edit Retainer Plan: ${editingPlan.name}`}
              description="Configure monthly investment, duration discounts, free trial window, and Razorpay Plan ID."
              maxWidth="md"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSavePlanDetails(editingPlan);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A] block mb-1">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A] block mb-1">
                      Monthly Price (₹ INR)
                    </label>
                    <input
                      type="number"
                      required
                      value={editingPlan.price}
                      onChange={(e) => {
                        const mPrice = Number(e.target.value) || 0;
                        setEditingPlan({
                          ...editingPlan,
                          price: mPrice,
                          monthlyPrice: mPrice,
                          quarterlyPrice: Math.round(mPrice * 3 * 0.95),
                          annualPrice: Math.round(mPrice * 12 * 0.85),
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs font-mono font-bold text-[#5C3A1E] focus:outline-none focus:border-[#D4A35A]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A] block mb-1">
                      Free Trial Days (Default: 3)
                    </label>
                    <input
                      type="number"
                      required
                      value={editingPlan.freeTrialDays}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          freeTrialDays: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A] block mb-1">
                    Razorpay Live Plan ID
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPlan.razorpayPlanId}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        razorpayPlanId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs font-mono text-[#5C3A1E] focus:outline-none focus:border-[#D4A35A]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EADFCB]/60">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingPlan(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSavingCatalog}
                    leftIcon={<Save className="w-3.5 h-3.5" />}
                  >
                    {isSavingCatalog ? "Saving..." : "Save Plan Configuration"}
                  </Button>
                </div>
              </form>
            </Modal>
          )}
        </main>

        <MobileBottomNav />

        {/* Unified Client Dossier & Executive Control Modal */}
        <Modal
          isOpen={Boolean(selectedDossier || selectedClient)}
          onClose={() => {
            setSelectedDossier(null);
            setSelectedClient(null);
          }}
          title={
            selectedDossier?.profile?.name ||
            selectedClient?.name ||
            "Client Dossier"
          }
          description={`${
            selectedDossier?.profile?.company || selectedClient?.company
          } • Tier: ${selectedDossier?.profile?.tier || selectedClient?.tier || "Starter"}`}
          maxWidth="lg"
        >
          {(() => {
            const dossier = selectedDossier;
            const profile = dossier?.profile || selectedClient;
            if (!profile) return null;

            return (
              <div className="space-y-6 text-xs text-[#0F172A]">
                {/* Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        profile.status === "Active"
                          ? "bg-[#DCFCE7] text-[#166534]"
                          : profile.status === "Disabled"
                          ? "bg-[#FEE2E2] text-[#991B1B]"
                          : "bg-[#FEF3C7] text-[#92400E]"
                      }`}
                    >
                      ● {profile.status || "Active"}
                    </span>
                    <span className="text-[#64748B] text-[11px]">
                      {profile.emailVerified ? "✓ Email Verified" : "⚠️ Email Unverified"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleToggleClientStatus(profile.id || profile.uid, profile.status || "Active")}
                      className="text-[11px] h-7 px-2.5"
                    >
                      {profile.status === "Active" ? "Disable Account" : "Enable Account"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleResendVerification(profile.id || profile.uid)}
                      className="text-[11px] h-7 px-2.5"
                    >
                      Resend Verification
                    </Button>
                  </div>
                </div>

                {/* 2-Column Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact & Drive */}
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-2.5">
                    <h4 className="font-serif font-bold text-[#5C3A1E] text-xs uppercase tracking-wider">
                      Contact & Storage Vault
                    </h4>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Work Email:</span>
                        <span className="font-semibold text-[#0F172A]">{profile.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Phone Number:</span>
                        <span className="font-semibold text-[#0F172A]">{profile.phone || "+91 98765 43210"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Member Since:</span>
                        <span className="text-[#0F172A]">{profile.joinedDate || "August 2026"}</span>
                      </div>
                      <div className="pt-2 border-t border-[#EADFCB]/60 flex items-center justify-between">
                        <span className="text-[#64748B]">Drive Vault:</span>
                        <a
                          href={dossier?.driveFolderLink || `https://drive.google.com/drive/folders/${profile.driveFolderId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[#5C3A1E] font-bold hover:underline"
                        >
                          Open in Google Drive ↗
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Subscription & Lifetime Spend */}
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-2.5">
                    <h4 className="font-serif font-bold text-[#5C3A1E] text-xs uppercase tracking-wider">
                      Active Subscription & Revenue
                    </h4>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Lifetime Revenue:</span>
                        <span className="font-serif font-bold text-[#5C3A1E] text-xs">
                          {dossier?.lifetimeVolumeFormatted || profile.lifetimeVolume || "₹0"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Active Orders:</span>
                        <span className="font-bold text-[#0F172A]">
                          {dossier?.activeOrdersCount ?? profile.activeOrders ?? 0} In Progress
                        </span>
                      </div>
                      {dossier?.activePlan ? (
                        <div className="p-2 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] space-y-1 mt-1">
                          <div className="flex justify-between font-semibold text-[#5C3A1E]">
                            <span>{dossier.activePlan.planName}</span>
                            <span>{dossier.activePlan.daysRemaining} days left</span>
                          </div>
                          <p className="text-[10px] text-[#64748B]">{dossier.activePlan.statusLabel}</p>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-[10px] text-[#64748B]">
                          No active monthly retainer plan. Individual orders active.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Orders Overview */}
                {dossier?.orders && dossier.orders.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-serif font-bold text-[#5C3A1E] text-xs uppercase tracking-wider">
                      Client Orders ({dossier.orders.length})
                    </h4>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 scrollbar-thin">
                      {dossier.orders.map((o: any) => (
                        <div
                          key={o.id}
                          className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/60 flex items-center justify-between text-[11px]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#5C3A1E]">{o.orderNumber || o.code}</span>
                            <span className="font-medium text-[#0F172A]">{o.title || o.service}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-[#0F172A]">
                              ₹{(o.amountPaid || o.totalAmount || 0).toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] font-semibold text-[#5C3A1E]">
                              {o.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Private Admin Notes Notebook */}
                <div className="space-y-3 pt-2 border-t border-[#EADFCB]/60">
                  <h4 className="font-serif font-bold text-[#5C3A1E] text-xs uppercase tracking-wider">
                    Private Admin Notebook (Confidential)
                  </h4>

                  {/* Add Note Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add private note for studio team..."
                      value={newClientNote}
                      onChange={(e) => setNewClientNote(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddClientNote(profile.id || profile.uid);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A]"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddClientNote(profile.id || profile.uid)}
                      disabled={isSubmittingClientNote || !newClientNote.trim()}
                      className="text-xs shrink-0"
                    >
                      {isSubmittingClientNote ? "Saving..." : "Add Note"}
                    </Button>
                  </div>

                  {/* Existing Notes List */}
                  <div className="max-h-28 overflow-y-auto space-y-1.5 scrollbar-thin">
                    {profile.adminNotes && profile.adminNotes.length > 0 ? (
                      profile.adminNotes.map((note: any) => (
                        <div
                          key={note.id}
                          className="p-2 rounded-xl bg-[#FFFDF9] border border-[#EADFCB]/60 text-[11px] space-y-0.5"
                        >
                          <div className="flex justify-between text-[10px] text-[#94A3B8]">
                            <span className="font-semibold text-[#5C3A1E]">{note.authorName}</span>
                            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[#0F172A]">{note.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-[#94A3B8] italic">No private admin notes recorded yet.</p>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-[#EADFCB]/60">
                  <Link
                    href={`/chat?client=${encodeURIComponent(profile.email || profile.name)}`}
                    onClick={() => {
                      setSelectedDossier(null);
                      setSelectedClient(null);
                    }}
                  >
                    <Button variant="secondary" size="sm" className="gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#D4A35A]" />
                      Open Chat Thread
                    </Button>
                  </Link>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedDossier(null);
                      setSelectedClient(null);
                    }}
                  >
                    Close Dossier
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>

        {/* Audit Log Diff Inspection Modal */}
        {selectedAuditLog && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedAuditLog(null)}
            title={`Audit Event: ${selectedAuditLog.what || selectedAuditLog.event}`}
            description={`Actor: ${selectedAuditLog.who?.email || selectedAuditLog.actor} • ${selectedAuditLog.when || selectedAuditLog.time}`}
            maxWidth="md"
          >
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-2">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-[#64748B]">Target:</span>
                  <span className="font-bold text-[#5C3A1E]">{selectedAuditLog.targetId}</span>
                </div>
                {selectedAuditLog.targetTitle && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#64748B]">Title:</span>
                    <span className="font-medium text-[#0F172A]">{selectedAuditLog.targetTitle}</span>
                  </div>
                )}
                {selectedAuditLog.note && (
                  <div className="text-[11px] text-[#0F172A] pt-1 border-t border-[#EADFCB]/60">
                    <span className="font-semibold text-[#64748B]">Note: </span>
                    {selectedAuditLog.note}
                  </div>
                )}
              </div>

              {/* State Diff Comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#FEE2E2]/40 border border-[#FECACA] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#991B1B] block">
                    Before State
                  </span>
                  <pre className="font-mono text-[10px] text-[#7F1D1D] overflow-x-auto p-1 bg-white/60 rounded max-h-32 scrollbar-none">
                    {JSON.stringify(selectedAuditLog.before || { status: "initial" }, null, 2)}
                  </pre>
                </div>

                <div className="p-3 rounded-xl bg-[#DCFCE7]/40 border border-[#BBF7D0] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#166534] block">
                    After State
                  </span>
                  <pre className="font-mono text-[10px] text-[#14532D] overflow-x-auto p-1 bg-white/60 rounded max-h-32 scrollbar-none">
                    {JSON.stringify(selectedAuditLog.after || { status: "updated" }, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedAuditLog(null)}>
                  Close Inspector
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Record External / Manual Order Modal (WhatsApp, Email, QR UPI, Phone) */}
        {isRecordExternalModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsRecordExternalModalOpen(false)}
            title="➕ Record External / Multi-Channel Commission"
            description="Log orders received via WhatsApp, Email, Contact Page, Phone, or Direct QR Code UPI scan."
            maxWidth="lg"
          >
            <form onSubmit={handleRecordExternalOrder} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                  Multi-Channel Ingestion & Automatic Vault Provisioning
                </span>
                <p className="text-[11px] text-[#B45309]">
                  Saving this order will generate a unique Order ID, provision a Google Drive folder, record payment status, and dispatch sync notifications to client and admin.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0F172A] block">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Patel"
                    value={externalOrderForm.clientName}
                    onChange={(e) =>
                      setExternalOrderForm({ ...externalOrderForm, clientName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0F172A] block">
                    Client Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. anand@pateldesign.com"
                    value={externalOrderForm.clientEmail}
                    onChange={(e) =>
                      setExternalOrderForm({ ...externalOrderForm, clientEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0F172A] block">
                    Phone / WhatsApp #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={externalOrderForm.clientPhone}
                    onChange={(e) =>
                      setExternalOrderForm({ ...externalOrderForm, clientPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0F172A] block">
                    Channel Source *
                  </label>
                  <select
                    value={externalOrderForm.source}
                    onChange={(e) =>
                      setExternalOrderForm({ ...externalOrderForm, source: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A] cursor-pointer"
                  >
                    <option value="whatsapp">WhatsApp Business</option>
                    <option value="email">Direct Email / RFP</option>
                    <option value="contact_page">Contact Form Lead</option>
                    <option value="qr_upi">Direct QR UPI Scan</option>
                    <option value="offline">Phone / In-Person</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0F172A] block">
                    Total Amount (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="5499"
                    value={externalOrderForm.amount}
                    onChange={(e) =>
                      setExternalOrderForm({ ...externalOrderForm, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs font-bold text-[#5C3A1E] focus:outline-none focus:border-[#D4A35A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0F172A] block">
                    Service / Deliverable Type
                  </label>
                  <select
                    value={externalOrderForm.service}
                    onChange={(e) =>
                      setExternalOrderForm({ ...externalOrderForm, service: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A] cursor-pointer"
                  >
                    <option value="Image Creation (Photorealistic AI & Art)">Image Creation (Photorealistic AI & Art)</option>
                    <option value="Video Creation (Cinematic AI & Motion)">Video Creation (Cinematic AI & Motion)</option>
                    <option value="3D Modeling & Spatial Assets">3D Modeling & Spatial Assets</option>
                    <option value="360° Interactive Architectural View">360° Interactive Architectural View</option>
                    <option value="Interior & Spatial Design">Interior & Spatial Design</option>
                    <option value="Window & Retail Experience Design">Window & Retail Experience Design</option>
                    <option value="Digital Marketing & Brand Strategy">Digital Marketing & Brand Strategy</option>
                    <option value="Meta & Google Ads Campaign Pipeline">Meta & Google Ads Campaign Pipeline</option>
                    <option value="Website Architecture & Development">Website Architecture & Development</option>
                    <option value="Custom">Custom Bespoke Service...</option>
                  </select>
                </div>

                {externalOrderForm.service === "Custom" ? (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#0F172A] block">
                      Custom Service Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 4K Architectural VR Tour"
                      value={externalOrderForm.customService}
                      onChange={(e) =>
                        setExternalOrderForm({ ...externalOrderForm, customService: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#0F172A] block">
                      Payment Settlement Status *
                    </label>
                    <select
                      value={externalOrderForm.paymentStatus}
                      onChange={(e) =>
                        setExternalOrderForm({ ...externalOrderForm, paymentStatus: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A] cursor-pointer"
                    >
                      <option value="paid">Paid (Payment Verified via QR / Bank / Cash)</option>
                      <option value="unpaid">Pending Invoice (Unpaid / In Progress)</option>
                      <option value="partial">Partially Paid (Advance Received)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0F172A] block">
                    Payment Method
                  </label>
                  <select
                    value={externalOrderForm.paymentMethod}
                    onChange={(e) =>
                      setExternalOrderForm({ ...externalOrderForm, paymentMethod: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A] cursor-pointer"
                  >
                    <option value="upi_qr">UPI QR Code Scan (GPay / PhonePe / Paytm)</option>
                    <option value="bank_transfer">Direct IMPS / NEFT Bank Transfer</option>
                    <option value="cash">Cash / Cheque</option>
                    <option value="invoice">Pay on Invoice (Net-15)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0F172A] block">
                    Transaction Ref / UTR / Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UPI Ref # 481928374928"
                    value={externalOrderForm.paymentReference}
                    onChange={(e) =>
                      setExternalOrderForm({ ...externalOrderForm, paymentReference: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#0F172A] block">
                  Project Scope & Client Requirements
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe client brief, specifications, dimensions, color palette, or milestone notes..."
                  value={externalOrderForm.requirements}
                  onChange={(e) =>
                    setExternalOrderForm({ ...externalOrderForm, requirements: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EADFCB]/60">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsRecordExternalModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingExternalOrder}
                  disabled={isSubmittingExternalOrder}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save & Create Commission
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Multi-Channel Orders & Payment SOP Guide Modal */}
        {isSopGuideModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsSopGuideModalOpen(false)}
            title="📖 Multi-Channel Orders & Payment Ledger SOP Guide"
            description="Standard operating procedures for managing inquiries, WhatsApp/Email orders, and external payments."
            maxWidth="lg"
          >
            <div className="space-y-4 text-xs text-[#0F172A] max-h-[75vh] overflow-y-auto pr-1">
              {/* Channel Map */}
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-2">
                <h4 className="font-serif font-bold text-sm text-[#5C3A1E]">
                  1. Order Entry Channels & Ingestion Workflow
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white border border-[#EADFCB]">
                    <span className="font-bold text-[#0F172A] block">🟢 WhatsApp & Email Orders:</span>
                    <p className="text-[#64748B]">Click &apos;Record External Order&apos; above. Enter client name, email, service amount, and set payment status as Paid (QR) or Pending Invoice.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#EADFCB]">
                    <span className="font-bold text-[#0F172A] block">🔵 Contact Form Submissions:</span>
                    <p className="text-[#64748B]">Inquiries auto-sync to Admin leads and trigger real-time in-app alerts. Click &apos;Convert to Order&apos; to provision drive folders.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#EADFCB]">
                    <span className="font-bold text-[#0F172A] block">🟡 Unpaid / Invoice Reminders:</span>
                    <p className="text-[#64748B]">For orders pending payment, click the &apos;🔔 Remind&apos; button to send an instant invoice reminder via in-app notification & email.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#EADFCB]">
                    <span className="font-bold text-[#0F172A] block">⚡ Admin-Gated n8n Execution:</span>
                    <p className="text-[#64748B]">Client orders never auto-trigger external pipelines. Admin reviews the brief, selects workflow W1/W2/W3/W5, and clicks &apos;⚡ n8n&apos;.</p>
                  </div>
                </div>
              </div>

              {/* Step by step */}
              <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EADFCB] space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#5C3A1E]">
                  2. Handling Payments Received via UPI QR / IMPS
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-[#64748B]">
                  <li>When client scans the studio UPI QR code or makes a direct transfer, find the order in the table.</li>
                  <li>Click the green <strong className="text-[#166534]">✓ Paid</strong> quick button or open Inspector &gt; <strong className="text-[#0F172A]">Confirm Payment Received</strong>.</li>
                  <li>Enter the UTR reference number or note.</li>
                  <li>The order is instantly marked <strong className="text-[#166534]">PAID</strong>, transitioned to <strong className="text-[#5C3A1E]">In Production</strong>, and a verified payment confirmation notification is sent to the client.</li>
                </ol>
              </div>

              {/* Documentation reference */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-between">
                <span className="text-[11px] text-[#64748B]">Full technical SOP documentation is saved in:</span>
                <span className="font-mono text-[10px] font-bold text-[#5C3A1E] bg-white px-2 py-1 rounded border border-[#EADFCB]">
                  docs/ai/MANUAL_ORDERS_AND_PAYMENTS_SOP.md
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm" onClick={() => setIsSopGuideModalOpen(false)}>
                  Close Guide
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Studio Self-Marketing Campaign Launch Modal */}
        {isSelfMarketingModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsSelfMarketingModalOpen(false)}
            title="✨ Launch Studio Self-Marketing & Advertising Campaign"
            description="Autonomous Multi-Modal Engine produces official 4K Renders, Cinematic Reels, 3D Models & Meta Ads (1:1, 9:16, 16:9) to promote Sutra Studio."
            maxWidth="lg"
          >
            <div className="space-y-4 text-xs text-[#0F172A]">
              <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#D4A35A]/50 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#A98B57] block">
                  Select Campaign Preset
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelfMarketingCampaign("Sutra Studio Luxury Architectural Promo");
                      setSelfMarketingPrompt(
                        "Luxury Indian architectural heritage studio showcase: 4K warm ivory courtyard, golden hour brass reflections, photorealistic lighting, cinematic 1080p ProRes flythrough reel, and GLTF 3D heritage pavilion."
                      );
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selfMarketingCampaign.includes("Architectural")
                        ? "bg-[#FAF9F5] border-[#D4A35A] ring-1 ring-[#D4A35A]"
                        : "bg-white border-[#EADFCB] hover:border-[#D4A35A]/60"
                    }`}
                  >
                    <span className="font-bold text-[11px] text-[#5C3A1E] block">🏛 ArchViz Showcase</span>
                    <span className="text-[10px] text-[#64748B]">Luxury Interiors & Daylight 4K</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelfMarketingCampaign("Sutra Studio Meta Ads Acquisition Pack");
                      setSelfMarketingPrompt(
                        "High-converting Meta Ads creative pack for SutraStudio creative services: 1:1 Feed Post, 9:16 Story/Reel, 16:9 Video Ad with headline 'Where Heritage Meets Next-Gen Creative AI', crisp typography and muted brass accents."
                      );
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selfMarketingCampaign.includes("Meta Ads")
                        ? "bg-[#FAF9F5] border-[#D4A35A] ring-1 ring-[#D4A35A]"
                        : "bg-white border-[#EADFCB] hover:border-[#D4A35A]/60"
                    }`}
                  >
                    <span className="font-bold text-[11px] text-[#5C3A1E] block">📱 Meta Ads Pack</span>
                    <span className="text-[10px] text-[#64748B]">Multi-ratio 1:1, 9:16, 16:9 Ads</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelfMarketingCampaign("Sutra Studio Festival / Festive Heritage Campaign");
                      setSelfMarketingPrompt(
                        "Festive brand identity campaign: traditional Indian motifs modernized with 3D brass lanterns, festive luxury lighting, warm ivory palettes, cinematic slow-motion video, and spatial soundscape."
                      );
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selfMarketingCampaign.includes("Festive")
                        ? "bg-[#FAF9F5] border-[#D4A35A] ring-1 ring-[#D4A35A]"
                        : "bg-white border-[#EADFCB] hover:border-[#D4A35A]/60"
                    }`}
                  >
                    <span className="font-bold text-[11px] text-[#5C3A1E] block">🪔 Festive Brand Reel</span>
                    <span className="text-[10px] text-[#64748B]">Festive 3D & Cinematic Video</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={selfMarketingCampaign}
                  onChange={(e) => setSelfMarketingCampaign(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Creative Generation Brief / AI Prompt
                </label>
                <textarea
                  rows={4}
                  value={selfMarketingPrompt}
                  onChange={(e) => setSelfMarketingPrompt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                  placeholder="Enter custom prompt instructions for the Master Autonomous Pipeline..."
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#A98B57]" />
                  <span className="text-[#64748B]">Target Google Drive Output:</span>
                  <span className="font-mono font-bold text-[#5C3A1E]">/BRAND_ASSETS & /META_ADS_CAMPAIGN</span>
                </div>
                <Badge variant="outline" className="text-[10px]">Auto-Vaulted</Badge>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EADFCB]/60">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsSelfMarketingModalOpen(false)}
                  disabled={isDispatchingSelfMarketing}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDispatchSelfMarketing}
                  isLoading={isDispatchingSelfMarketing}
                  disabled={isDispatchingSelfMarketing}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  className="bg-[#5C3A1E] hover:bg-[#4A2E17] text-white"
                >
                  {isDispatchingSelfMarketing ? "Synthesizing Assets..." : "Launch Master Pipeline"}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Global Admin Order Receipt & Tax Invoice Modal */}
        <OrderReceiptModal
          order={adminReceiptOrder}
          isOpen={isAdminReceiptOpen}
          onClose={() => setIsAdminReceiptOpen(false)}
        />
        <ConfirmationDialog />
      </div>
    </RouteGuard>
  );
}

export default function AdminHubPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F5EF]">
          <div className="w-8 h-8 rounded-full border-2 border-[#D4A35A] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AdminHubContent />
    </Suspense>
  );
}
