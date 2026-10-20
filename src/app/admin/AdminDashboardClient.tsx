"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
  Globe,
  Users,
  Settings,
  Save,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Palette,
  Paintbrush,
  Type,
  Zap,
  Share2,
  CheckCheck,
  Sliders,
  Compass,
  MessageSquare,
  HelpCircle,
  AlertCircle,
  Send,
  Bot,
  User,
} from "lucide-react";

export type CrmTab = "overview" | "orders" | "cms" | "clients" | "settings";
export type CmsSubPage = "home" | "about" | "services" | "pricing" | "contact" | "header" | "footer" | "theme";

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
  conversationHistory?: Array<{
    id: string;
    sender: "client" | "studio" | "assistant" | "system";
    channel: string;
    text: string;
    timestamp: string;
    authorName?: string;
  }>;
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
  let bg = "bg-[#F0ECE1] text-[#171717] border-[#E5E1D8]";

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

const CMS_SUB_PAGES: Array<{ id: CmsSubPage; label: string; shortLabel: string; icon: any; route: string }> = [
  { id: "home", label: "Home Page (/)", shortLabel: "Home Page", icon: Globe, route: "/" },
  { id: "about", label: "About Studio (/about)", shortLabel: "About Studio", icon: Sparkles, route: "/about" },
  { id: "services", label: "Services (/services)", shortLabel: "Services & Skills", icon: Zap, route: "/services" },
  { id: "pricing", label: "Pricing & Plans (/pricing)", shortLabel: "Pricing Plans", icon: DollarSign, route: "/pricing" },
  { id: "contact", label: "Contact & Concierge (/contact)", shortLabel: "Contact & SLA", icon: Phone, route: "/contact" },
  { id: "theme", label: "Global Theme & Body Style", shortLabel: "Theme & Body Style", icon: Palette, route: "/" },
  { id: "header", label: "Header & Announcement", shortLabel: "Header & Nav", icon: LayoutGrid, route: "/" },
  { id: "footer", label: "Footer & Social Links", shortLabel: "Footer & Links", icon: FileText, route: "/" },
];

function SectionVisualControls({
  sectionKey,
  sectionTitle,
  cmsData,
  updateCmsField,
}: {
  sectionKey: string;
  sectionTitle: string;
  cmsData: any;
  updateCmsField: (section: string, field: string, value: any) => void;
}) {
  const current = cmsData?.[sectionKey] || {};
  return (
    <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E1D8]">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#A98B57]" />
          <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
            {sectionTitle} Visuals, Background &amp; Media
          </h4>
        </div>
        <span className="text-[10px] font-semibold text-[#8C827A] bg-[#FFFDF9] px-2 py-0.5 rounded-md border border-[#E5E1D8]">
          Live Customization
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* Background Color */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#171717]">Section Background Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={current.bgColor || "#FAF9F5"}
              onChange={(e) => updateCmsField(sectionKey, "bgColor", e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border border-[#E5E1D8] p-0.5 bg-white shrink-0"
            />
            <input
              type="text"
              value={current.bgColor || "#FAF9F5"}
              onChange={(e) => updateCmsField(sectionKey, "bgColor", e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E1D8] text-xs font-mono text-[#171717]"
              placeholder="#FAF9F5"
            />
          </div>
        </div>

        {/* Background Image URL */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#171717]">Background Image URL (Optional)</label>
          <input
            type="text"
            value={current.bgImage || ""}
            onChange={(e) => updateCmsField(sectionKey, "bgImage", e.target.value)}
            placeholder="https://... or /patterns/..."
            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E1D8] text-xs text-[#171717]"
          />
        </div>

        {/* Overlay Opacity */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-[#171717]">Overlay Opacity</label>
            <span className="text-[10px] font-mono text-[#8C827A]">
              {Math.round((current.overlayOpacity !== undefined ? current.overlayOpacity : 0.1) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={current.overlayOpacity !== undefined ? current.overlayOpacity : 0.1}
            onChange={(e) => updateCmsField(sectionKey, "overlayOpacity", parseFloat(e.target.value))}
            className="w-full accent-[#A98B57] cursor-pointer"
          />
        </div>
      </div>

      {/* Media Image URL + Live Preview */}
      <div className="pt-2 border-t border-[#E5E1D8]/60 space-y-1.5">
        <label className="text-[11px] font-bold text-[#171717]">Section Featured Media Image URL:</label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={current.mediaImage || ""}
            onChange={(e) => updateCmsField(sectionKey, "mediaImage", e.target.value)}
            placeholder="/brand/sutra-hero-banner.jpg or https://..."
            className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#E5E1D8] text-xs text-[#171717]"
          />
          {current.mediaImage && (
            <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-[#E5E1D8] shrink-0 bg-neutral-100 shadow-2xs">
              <img
                src={current.mediaImage}
                alt="Section media preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();

  // Tab State synced with URL query (?tab=...)
  const initialTab = (searchParams.get("tab") as CrmTab) || "overview";
  const [activeTab, setActiveTab] = useState<CrmTab>(initialTab);

  // Sidebar Layout State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [cmsSidebarExpanded, setCmsSidebarExpanded] = useState<boolean>(true);

  // Orders State
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

  // CMS State
  const [activeCmsPage, setActiveCmsPage] = useState<CmsSubPage>("home");
  const [cmsData, setCmsData] = useState<any>({
    theme: {
      accentColor: "#A98B57",
      bodyBgColor: "#FAF9F5",
      bodyBgImage: "",
      bodyFont: "Outfit",
      headingFont: "Playfair Display",
      texturePattern: "subtle-dots",
      navbarBgColor: "#FFFDF9",
      footerBgColor: "#171717",
    },
    hero: {
      tagline: "ENTERPRISE CREATIVE TECHNOLOGY & SPATIAL 3D STUDIO",
      title: "Tradition Meets Computational Technology",
      description:
        "Sutra Studio delivers bespoke 3D architectural renders, cinematic commercial video reels, and autonomous creative pipelines engineered with timeless aesthetic rigor.",
      primaryCtaText: "Commission Creative Pipeline",
      secondaryCtaText: "Explore Studio Portfolio",
      statsTurnaround: "48-72 Hours",
      statsRating: "99.8% Precision",
      statsProjects: "300+ Delivered",
      bgColor: "#F8F5EF",
      bgImage: "",
      mediaImage: "/brand/sutra-hero-banner.jpg",
      overlayOpacity: 0.15,
    },
    about: {
      title: "Rooted in Tradition, Engineered with Code",
      subtitle: "We unite heritage Vedic aesthetics with high-performance computational rendering pipelines.",
      story:
        "Founded as an elite digital atelier, Sutra Studio crafts spatial 3D environments, commercial cinematic motion, and autonomous creative infrastructure. Every frame is guided by classical proportion (Pramana), emotional resonance (Rasa), and algorithmic precision (Yantra).",
      valuesStatement: "Zero compromise on craft. Seamless 24/7 digital delivery vault. Direct founder-led engineering.",
      location: "Ahmedabad, Gujarat, India • Serving Discerning Global Brands",
    },
    services: {
      title: "Master Disciplines & Studio Capabilities",
      subtitle: "Architectural visualization, cinematic CGI reels, and automated generative pipelines.",
      service1Title: "3D Architectural & Spatial Visualization",
      service1Desc: "Ultra-realistic 4K renders, interior lighting studies, and walkthrough simulations engineered with photorealistic realism.",
      service2Title: "Cinematic Motion & Commercial Reels",
      service2Desc: "Scroll-stopping commercial CGI reels engineered for social engagement, luxury campaigns, and brand storytelling.",
      service3Title: "Autonomous Creative Retainers",
      service3Desc: "End-to-end continuous creative pipeline delivering on-demand assets via secure Google Drive vaults.",
      turnaroundSla: "Standard turnaround within 48–72 hours. Rush 24-hour delivery available on request.",
    },
    pricing: {
      title: "Transparent Studio Investment",
      subtitle: "Clear, zero-fee direct UPI or card retainers with full master asset delivery.",
      starterName: "Standard Commission",
      starterPrice: "3,499",
      starterDelivery: "48-72 Hours Turnaround",
      starterFeatures: "1 Dedicated 4K Architectural Render • 2 Minor Revisions • High-Res Master Asset • Direct UPI Checkout",
      proName: "Commercial Pro Reel",
      proPrice: "7,499",
      proDelivery: "24-48 Hours Priority Turnaround",
      proFeatures: "3 Dedicated 4K Renders • 1 Cinematic 4K Reel (15-30s) • Color Grading • Google Drive Vault Access",
      retainerName: "Monthly Studio Retainer",
      retainerPrice: "19,999",
      retainerDelivery: "Continuous Dedicated Pipeline",
      retainerFeatures: "Continuous Weekly Renders & Reels • Dedicated Senior Producer • Unlimited Revisions • Direct WhatsApp VIP Concierge",
    },
    contact: {
      title: "Initiate a Studio Commission",
      subtitle: "Direct access to our senior producer via WhatsApp, phone, or verified inquiry form.",
      email: "yashjoshi20@zohomail.in",
      phone: "+91 82001 92781",
      whatsapp: "+91 82001 92781",
      address: "Ahmedabad, Gujarat, India",
      operatingHours: "Monday – Saturday: 9:00 AM – 8:00 PM IST",
      responseSla: "All inquiries receive a response within 2 hours during studio business hours.",
    },
    header: {
      announcementBarText: "Now Booking Q4 Autonomous Retainers • Instant Zero-Fee UPI Direct Checkout",
      announcementActive: true,
      navigationItems: [
        { label: "Services", href: "/services" },
        { label: "Pricing", href: "/pricing" },
        { label: "Portfolio", href: "/#portfolio" },
        { label: "Studio", href: "/studio" },
      ],
    },
    footer: {
      brandTagline: "High-precision computational design and luxury 3D visual engineering atelier.",
      copyrightText: "© 2026 Sutra Studio. All rights reserved. Registered Creative Atelier.",
      contactEmail: "yashjoshi20@zohomail.in",
      contactPhone: "Studio WhatsApp Concierge",
      socialLinks: {
        instagram: "https://www.instagram.com/yashsutrastudio/",
        facebookPage: "https://www.facebook.com/yashsutrastudio/",
        facebookProfile: "https://www.facebook.com/yashjoshisutrastudio/",
        whatsapp: "https://wa.me/918200192781?text=Hello%20Sutra%20Studio%2C%20I%20would%20like%20to%20discuss%20a%20project.",
      },
    },
    branding: {
      logoUrl: "/brand/sutra-logo-primary.png",
      studioTitle: "Sutra Studio",
      faviconUrl: "/favicon.ico",
    },
    payment: {
      upiVpa: "yashjoshi7355@okaxis",
      merchantName: "Sutra Studio / Yash Joshi",
      accountHolder: "Yash Joshi",
    },
  });
  const [isCmsLoading, setIsCmsLoading] = useState(false);
  const [isCmsSaving, setIsCmsSaving] = useState(false);
  const [cmsFeedback, setCmsFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Clients Directory & AI Conversations State
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [clientConversations, setClientConversations] = useState<any[]>([]);
  const [selectedClientDropdownKey, setSelectedClientDropdownKey] = useState<string>("");
  const [isChatsLoading, setIsChatsLoading] = useState(false);
  const [clientDetailTab, setClientDetailTab] = useState<"all" | "orders" | "chats">("all");

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab") as CrmTab;
    if (tabParam && ["overview", "orders", "cms", "clients", "settings"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    const clientParam = searchParams.get("client");
    if (clientParam) {
      setSelectedClientDropdownKey(clientParam);
    }
  }, [searchParams]);

  const switchTab = (tab: CrmTab) => {
    setActiveTab(tab);
    setMobileDrawerOpen(false);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    router.replace(`/admin?${params.toString()}`, { scroll: false });
  };

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

  // Fetch live client conversations & AI chat history
  const fetchClientChats = useCallback(async () => {
    setIsChatsLoading(true);
    try {
      const res = await fetch("/api/admin/client-chats", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.conversations)) {
          setClientConversations(data.conversations);
        }
      }
    } catch (e) {
      console.warn("Failed to load client chats:", e);
    } finally {
      setIsChatsLoading(false);
    }
  }, []);

  // Fetch live CMS content from API
  const fetchCmsContent = useCallback(async () => {
    setIsCmsLoading(true);
    try {
      const res = await fetch("/api/cms", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          setCmsData((prev: any) => ({
            ...prev,
            ...data.content,
          }));
        }
      }
    } catch (e) {
      console.warn("Failed to load CMS content:", e);
    } finally {
      setIsCmsLoading(false);
    }
  }, []);

  // Initial load and periodic 10-second polling for orders and client chats
  useEffect(() => {
    fetchOrders();
    fetchClientChats();
    fetchCmsContent();
    const interval = setInterval(() => {
      fetchOrders(true);
      fetchClientChats();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders, fetchClientChats, fetchCmsContent]);

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

  // Derived unique clients roster for CRM Clients Directory
  const clientsList = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        email: string;
        name: string;
        phone?: string;
        totalOrders: number;
        totalLtv: number;
        latestOrderDate: string;
        latestStatus: string;
        latestPackage: string;
        orders: AdminOrderRecord[];
        chatMessages: any[];
      }
    >();

    // 1. Ingest authentic client orders
    orders.forEach((o) => {
      const email = (o.clientEmail || "").trim();
      const key = (email || o.clientName || "Unknown Client").toLowerCase();
      let existing = map.get(key);
      const amount = o.totalAmount || o.amountPaid || 0;

      if (!existing) {
        existing = {
          key,
          email: email || "—",
          name: o.clientName || "Private Client",
          phone: o.clientPhone,
          totalOrders: 0,
          totalLtv: 0,
          latestOrderDate: o.createdAt || "",
          latestStatus: o.status,
          latestPackage: o.packageName || o.service || "Creative Commission",
          orders: [],
          chatMessages: [],
        };
        map.set(key, existing);
      }

      existing.orders.push(o);
      existing.totalOrders += 1;
      existing.totalLtv += amount;
      if (o.clientPhone && !existing.phone) existing.phone = o.clientPhone;
      if (!existing.latestOrderDate || (o.createdAt && new Date(o.createdAt) > new Date(existing.latestOrderDate))) {
        existing.latestOrderDate = o.createdAt;
        existing.latestStatus = o.status;
        existing.latestPackage = o.packageName || o.service || existing.latestPackage;
      }
    });

    // 2. Ingest client AI chat conversations
    clientConversations.forEach((conv: any) => {
      const email = (conv.clientEmail || "").trim();
      const key = (email || conv.clientKey || conv.clientName || "").toLowerCase();
      let existing = map.get(key);

      if (!existing) {
        existing = {
          key,
          email: email || conv.clientKey || "—",
          name: conv.clientName || "Studio Client",
          phone: conv.clientPhone,
          totalOrders: 0,
          totalLtv: 0,
          latestOrderDate: conv.lastMessageAt || "",
          latestStatus: "active",
          latestPackage: "AI Chat Inquiry",
          orders: [],
          chatMessages: conv.messages || [],
        };
        map.set(key, existing);
      } else {
        existing.chatMessages = conv.messages || [];
        if (conv.clientPhone && !existing.phone) existing.phone = conv.clientPhone;
      }
    });

    const list = Array.from(map.values());
    const q = clientSearchQuery.toLowerCase().trim();
    if (!q) return list;

    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q))
    );
  }, [orders, clientConversations, clientSearchQuery]);

  // Selected client for the focused dropdown inspection view
  const selectedClient = useMemo(() => {
    if (!selectedClientDropdownKey) return null;
    return (
      clientsList.find(
        (c) =>
          c.key.toLowerCase() === selectedClientDropdownKey.toLowerCase() ||
          c.email.toLowerCase() === selectedClientDropdownKey.toLowerCase()
      ) || null
    );
  }, [clientsList, selectedClientDropdownKey]);

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
          notes: "Verified by Studio Administrator via Sutra CRM",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment verification failed.");
      }

      setActionMessage("✓ Payment verified! Order marked paid and dispatched to production pipeline.");
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

  // Save Website Pages CMS content to Firestore
  const handleSaveCms = async () => {
    setIsCmsSaving(true);
    setCmsFeedback(null);
    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cmsData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save CMS changes.");
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cms-content-updated", { detail: cmsData }));
      }

      setCmsFeedback({
        type: "success",
        message: "✓ Website pages & theme successfully updated and applied live!",
      });
      setTimeout(() => setCmsFeedback(null), 5000);
    } catch (e: any) {
      setCmsFeedback({
        type: "error",
        message: `Failed to save changes: ${e?.message || e}`,
      });
    } finally {
      setIsCmsSaving(false);
    }
  };

  // Helper for updating CMS nested data
  const updateCmsField = (section: string, field: string, value: any) => {
    setCmsData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value,
      },
    }));
  };

  // CRM Navigation Item Definitions
  const CRM_NAV = [
    {
      id: "overview" as CrmTab,
      label: "Dashboard",
      icon: Activity,
      badge: null,
    },
    {
      id: "orders" as CrmTab,
      label: "Orders & Leads",
      icon: ShoppingBag,
      badge: metrics.pendingVerification > 0 ? metrics.pendingVerification : null,
    },
    {
      id: "cms" as CrmTab,
      label: "Website Pages CMS",
      icon: Globe,
      badge: "Live",
    },
    {
      id: "clients" as CrmTab,
      label: "Clients Directory",
      icon: Users,
      badge: clientsList.length > 0 ? clientsList.length : null,
    },
    {
      id: "settings" as CrmTab,
      label: "Studio Settings",
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#FAF9F5] text-[#171717] font-sans antialiased flex flex-col md:flex-row">
        {/* ============================================================ */}
        {/* MOBILE TOP BAR (With Hamburger Drawer Toggle) */}
        {/* ============================================================ */}
        <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#FFFDF9] border-b border-[#E5E1D8] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2 rounded-xl text-[#171717] hover:bg-[#F0ECE1] transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A98B57] cursor-pointer"
              aria-label="Open Sutra CRM Menu"
            >
              <Menu className="w-5 h-5 text-[#171717]" />
            </button>
            <SutraLogo variant="horizontal" size="sm" href="/admin" />
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#171717] text-[#FAF9F5] uppercase tracking-wider">
              Sutra CRM
            </span>
            <Avatar name={user?.displayName || "Admin"} size="sm" status="online" />
          </div>
        </div>

        {/* ============================================================ */}
        {/* MOBILE SLIDE-OVER DRAWER */}
        {/* ============================================================ */}
        {mobileDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#FAF9F5] border-r border-[#E5E1D8] p-6 z-10 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D8]">
                <SutraLogo variant="horizontal" size="md" href="/admin" />
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-[#F0ECE1] cursor-pointer"
                  aria-label="Close CRM Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sutra CRM Brand Scope Indicator */}
              <div className="mt-4 p-3 rounded-2xl bg-[#171717] text-white flex items-center justify-between text-xs shadow-xs">
                <div>
                  <span className="text-[10px] text-[#A98B57] block uppercase font-mono font-bold tracking-widest">
                    Sutra Studio CRM
                  </span>
                  <span className="font-bold text-white uppercase tracking-wider text-xs">
                    Executive Terminal
                  </span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* CRM Navigation */}
              <nav className="mt-4 flex-1 space-y-1.5 overflow-y-auto">
                {CRM_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isCms = item.id === "cms";

                  if (isCms) {
                    return (
                      <div key={item.id} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (activeTab === "cms") {
                              setCmsSidebarExpanded(!cmsSidebarExpanded);
                            } else {
                              switchTab("cms");
                              setCmsSidebarExpanded(true);
                            }
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                            isActive
                              ? "bg-[#171717] text-[#FAF9F5] font-semibold shadow-xs"
                              : "text-[#525252] hover:bg-[#F0ECE1] hover:text-[#171717]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${isActive ? "text-[#A98B57]" : "text-[#737373]"}`} />
                            <span>{item.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {item.badge !== null && (
                              <span
                                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isActive ? "bg-[#A98B57] text-white" : "bg-[#F0ECE1] text-[#5C3A1E]"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                cmsSidebarExpanded ? "rotate-180 text-[#A98B57]" : "text-[#737373]"
                              }`}
                            />
                          </div>
                        </button>

                        {/* Mobile Dropdown Sub-Items */}
                        {cmsSidebarExpanded && (
                          <div className="pl-3 py-1 space-y-0.5 border-l-2 border-[#E5E1D8] ml-4 my-1">
                            {CMS_SUB_PAGES.map((sub) => {
                              const isSubActive = activeTab === "cms" && activeCmsPage === sub.id;
                              const SubIcon = sub.icon;
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => {
                                    switchTab("cms");
                                    setActiveCmsPage(sub.id);
                                    setMobileDrawerOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                    isSubActive
                                      ? "bg-[#A98B57]/15 text-[#5C3A1E] font-bold border border-[#A98B57]/30"
                                      : "text-[#64748B] hover:text-[#171717] hover:bg-[#F0ECE1]"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? "text-[#A98B57]" : "text-[#8C827A]"}`} />
                                    <span className="truncate">{sub.shortLabel}</span>
                                  </div>
                                  {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-[#A98B57]" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => switchTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#171717] text-[#FAF9F5] font-semibold shadow-xs"
                          : "text-[#525252] hover:bg-[#F0ECE1] hover:text-[#171717]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-[#A98B57]" : "text-[#737373]"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== null && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive ? "bg-[#A98B57] text-white" : "bg-[#F0ECE1] text-[#5C3A1E]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-[#E5E1D8] space-y-3">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5E1D8] text-xs font-semibold text-[#171717] hover:border-[#A98B57]"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#A98B57]" />
                    <span>Live Public Website</span>
                  </span>
                  <span className="text-[10px] text-[#737373]">↗</span>
                </Link>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={user?.displayName || "Studio Admin"} size="sm" status="online" />
                    <div className="text-xs">
                      <p className="font-semibold text-[#171717] truncate max-w-[120px]">
                        {user?.email || "Admin"}
                      </p>
                      <p className="text-[#A98B57] text-[10px]">Lead Producer</p>
                    </div>
                  </div>
                  <button
                    onClick={() => logout()}
                    title="Sign Out"
                    className="text-[#737373] hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* DESKTOP PERSISTENT COLLAPSIBLE CRM SIDEBAR */}
        {/* ============================================================ */}
        <aside
          className={`${
            sidebarCollapsed ? "w-20 px-2.5 py-4" : "w-64 p-4"
          } shrink-0 border-r border-[#E5E1D8] bg-[#FFFDF9] min-h-screen flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out sticky top-0 h-screen z-30 select-none`}
        >
          <div>
            {/* Brand Header & Toggle */}
            {!sidebarCollapsed ? (
              <div className="pb-4 border-b border-[#E5E1D8] flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <SutraLogo variant="horizontal" size="md" href="/admin" />
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(true)}
                    title="Collapse Sidebar"
                    className="p-1.5 rounded-xl text-[#737373] hover:text-[#171717] hover:bg-[#F0ECE1] transition-colors cursor-pointer"
                    aria-label="Collapse Sidebar"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-[#A98B57] uppercase font-bold tracking-wider">
                      Sutra CRM Active
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#171717] text-white">
                    PRODUCER
                  </span>
                </div>
              </div>
            ) : (
              <div className="pb-4 border-b border-[#E5E1D8] flex flex-col items-center gap-2.5">
                <Link
                  href="/admin"
                  className="p-1 rounded-xl hover:bg-[#F0ECE1] transition-colors flex items-center justify-center"
                  title="Sutra CRM"
                >
                  <SutraLogo variant="symbol" size="sm" />
                </Link>
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(false)}
                  title="Expand Sidebar"
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-[#5C3A1E] hover:border-[#A98B57] hover:bg-[#F0ECE1] transition-all cursor-pointer shadow-2xs"
                  aria-label="Expand Sidebar"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* CRM Navigation Links */}
            <nav className="mt-4 space-y-1.5">
              {CRM_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isCms = item.id === "cms";

                if (isCms) {
                  return (
                    <div key={item.id} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (sidebarCollapsed) setSidebarCollapsed(false);
                          if (activeTab === "cms") {
                            setCmsSidebarExpanded(!cmsSidebarExpanded);
                          } else {
                            switchTab("cms");
                            setCmsSidebarExpanded(true);
                          }
                        }}
                        title={sidebarCollapsed ? item.label : undefined}
                        className={`w-full flex items-center ${
                          sidebarCollapsed
                            ? "justify-center h-11 w-11 mx-auto rounded-xl"
                            : "justify-between px-3 py-2.5 rounded-xl"
                        } text-xs font-medium transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#171717] text-[#FAF9F5] font-semibold shadow-xs"
                            : "text-[#525252] hover:bg-[#F0ECE1] hover:text-[#171717]"
                        }`}
                      >
                        <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} min-w-0`}>
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? "text-[#A98B57]" : "text-[#737373]"
                            }`}
                          />
                          {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                        </div>

                        {!sidebarCollapsed && (
                          <div className="flex items-center gap-1.5">
                            {item.badge !== null && (
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                  isActive ? "bg-[#A98B57] text-white" : "bg-[#F0ECE1] text-[#5C3A1E]"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                cmsSidebarExpanded ? "rotate-180 text-[#A98B57]" : "text-[#737373]"
                              }`}
                            />
                          </div>
                        )}
                      </button>

                      {/* Desktop Dropdown Sub-Items */}
                      {!sidebarCollapsed && cmsSidebarExpanded && (
                        <div className="pl-3 py-1 space-y-0.5 border-l-2 border-[#E5E1D8] ml-4 my-1">
                          {CMS_SUB_PAGES.map((sub) => {
                            const isSubActive = activeTab === "cms" && activeCmsPage === sub.id;
                            const SubIcon = sub.icon;
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => {
                                  switchTab("cms");
                                  setActiveCmsPage(sub.id);
                                }}
                                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                                  isSubActive
                                    ? "bg-[#A98B57]/15 text-[#5C3A1E] font-bold border border-[#A98B57]/30"
                                    : "text-[#64748B] hover:text-[#171717] hover:bg-[#F0ECE1]"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? "text-[#A98B57]" : "text-[#8C827A]"}`} />
                                  <span className="truncate">{sub.shortLabel}</span>
                                </div>
                                {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-[#A98B57]" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => switchTab(item.id)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      sidebarCollapsed
                        ? "justify-center h-11 w-11 mx-auto rounded-xl"
                        : "justify-between px-3 py-2.5 rounded-xl"
                    } text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#171717] text-[#FAF9F5] font-semibold shadow-xs"
                        : "text-[#525252] hover:bg-[#F0ECE1] hover:text-[#171717]"
                    }`}
                  >
                    <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} min-w-0`}>
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-[#A98B57]" : "text-[#737373]"
                        }`}
                      />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!sidebarCollapsed && item.badge !== null && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          isActive ? "bg-[#A98B57] text-white" : "bg-[#F0ECE1] text-[#5C3A1E]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-4 border-t border-[#E5E1D8]">
            {!sidebarCollapsed ? (
              <div className="space-y-3">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#171717] hover:border-[#A98B57] transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#A98B57]" />
                    <span>Public Website</span>
                  </span>
                  <span className="text-[10px] text-[#737373]">↗</span>
                </Link>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={user?.displayName || "Studio Admin"} size="sm" status="online" />
                    <div className="text-xs min-w-0">
                      <p className="font-semibold text-[#171717] truncate max-w-[110px]">
                        {user?.email || "Admin"}
                      </p>
                      <p className="text-[#A98B57] text-[10px] truncate">Executive CRM</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => logout()}
                    title="Sign Out"
                    className="text-[#737373] hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Link
                  href="/"
                  target="_blank"
                  title="Public Website"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-[#5C3A1E] hover:border-[#A98B57] hover:bg-[#F0ECE1] transition-all cursor-pointer shadow-2xs"
                >
                  <Globe className="w-4 h-4 text-[#A98B57]" />
                </Link>
                <div title={user?.email || "Admin"}>
                  <Avatar name={user?.displayName || "Admin"} size="sm" status="online" />
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  title="Sign Out"
                  className="w-10 h-10 flex items-center justify-center text-[#737373] hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ============================================================ */}
        {/* MAIN CRM WORKSPACE CONTENT AREA */}
        {/* ============================================================ */}
        <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
          {/* Top Desktop Breadcrumb & Action Bar */}
          <header className="hidden md:flex sticky top-0 z-20 items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#E5E1D8] gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="text-xs font-mono uppercase font-bold text-[#A98B57] tracking-wider shrink-0">
                Sutra CRM
              </span>
              <span className="text-[#E5E1D8] shrink-0">/</span>
              <span className="text-xs sm:text-sm font-serif font-bold text-[#171717] capitalize truncate max-w-xs sm:max-w-md">
                {activeTab === "overview"
                  ? "Studio Dashboard"
                  : activeTab === "orders"
                  ? "Orders & Commissions Ledger"
                  : activeTab === "cms"
                  ? "Website Pages CMS & Editor"
                  : activeTab === "clients"
                  ? "Clients Directory"
                  : "Studio & Payment Settings"}
              </span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchOrders()}
                isLoading={isRefreshing}
                leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                className="text-xs text-[#5C3A1E]"
                title="Refresh Live Orders from Firestore"
              >
                Sync Data
              </Button>

              <div className="h-4 w-px bg-[#E5E1D8]" />

              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-[#64748B] hidden sm:inline">Real-Time Sync</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full min-w-0">
            {/* ============================================================ */}
            {/* TAB 1: EXECUTIVE CRM DASHBOARD */}
            {/* ============================================================ */}
            {activeTab === "overview" && (
              <div className="space-y-6 sm:space-y-8">
                {/* Greeting & Quick Action Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-warm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-mono text-[#A98B57] tracking-wider uppercase font-semibold">
                        Sutra CRM Engine Online
                      </span>
                    </div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171717]">
                      Executive Studio Dashboard
                    </h1>
                    <p className="text-xs text-[#64748B]">
                      Real-time commission overview, instant UPI payment verification, and client pipeline tracking.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => switchTab("orders")}
                      leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                    >
                      Orders Ledger ({orders.length})
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => switchTab("cms")}
                      leftIcon={<Globe className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                    >
                      Edit Website CMS
                    </Button>
                  </div>
                </div>

                {/* 5-Column KPI Metric Cards (Fluid responsive wrapping) */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                  {/* Total Orders */}
                  <div className="p-3.5 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xs space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between text-xs text-[#64748B] gap-1">
                      <span className="font-medium truncate">Total Orders</span>
                      <ShoppingBag className="w-4 h-4 text-[#A98B57] shrink-0" />
                    </div>
                    <div className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#171717] truncate">
                      {isLoading ? "—" : metrics.totalOrders}
                    </div>
                    <div className="text-[11px] text-[#64748B] truncate">All incoming orders</div>
                  </div>

                  {/* Pending Verification */}
                  <div
                    onClick={() => {
                      setStatusFilter("pending");
                      switchTab("orders");
                    }}
                    className={`p-3.5 sm:p-5 rounded-2xl border shadow-2xs space-y-1.5 cursor-pointer transition-all min-w-0 ${
                      metrics.pendingVerification > 0
                        ? "bg-amber-50/70 border-amber-300 hover:border-amber-400"
                        : "bg-[#FFFDF9] border-[#E5E1D8]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-amber-900 font-medium gap-1">
                      <span className="truncate">To Verify (UPI)</span>
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    </div>
                    <div className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-amber-950 truncate">
                      {isLoading ? "—" : metrics.pendingVerification}
                    </div>
                    <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1 truncate">
                      <span className="truncate">{metrics.pendingVerification > 0 ? "Action required" : "Clear queue"}</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </div>
                  </div>

                  {/* In Production */}
                  <div className="p-3.5 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xs space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between text-xs text-[#64748B] gap-1">
                      <span className="font-medium truncate">In Production</span>
                      <Activity className="w-4 h-4 text-[#5C3A1E] shrink-0" />
                    </div>
                    <div className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#171717] truncate">
                      {isLoading ? "—" : metrics.inProduction}
                    </div>
                    <div className="text-[11px] text-[#64748B] truncate">Pipeline active</div>
                  </div>

                  {/* Completed */}
                  <div className="p-3.5 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xs space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between text-xs text-[#64748B] gap-1">
                      <span className="font-medium truncate">Completed</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                    <div className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#171717] truncate">
                      {isLoading ? "—" : metrics.completed}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium truncate">Vaulted &amp; Delivered</div>
                  </div>

                  {/* Studio Revenue */}
                  <div className="col-span-2 sm:col-span-2 md:col-span-1 xl:col-span-1 p-3.5 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xs space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between text-xs text-[#64748B] gap-1">
                      <span className="font-medium truncate">Gross Revenue</span>
                      <TrendingUp className="w-4 h-4 text-[#A98B57] shrink-0" />
                    </div>
                    <div
                      className="font-serif text-lg sm:text-xl md:text-xl lg:text-2xl xl:text-3xl font-bold text-[#5C3A1E] truncate"
                      title={`₹${metrics.totalRevenue.toLocaleString("en-IN")}`}
                    >
                      ₹{isLoading ? "—" : metrics.totalRevenue.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[11px] text-[#64748B] truncate">Direct UPI &amp; Cards</div>
                  </div>
                </div>

                {/* URGENT PRIORITY QUEUE: PAYMENTS TO VERIFY */}
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
                          switchTab("orders");
                        }}
                        className="text-xs font-semibold text-[#5C3A1E] hover:text-[#A98B57] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>View all in ledger</span>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
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
                                <span className="font-semibold text-[#171717]">
                                  {ord.packageName || ord.service || "Creative Package"}
                                </span>
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
                                  className="p-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
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

                {/* RECENT COMMISSIONS FEED */}
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
                      onClick={() => switchTab("orders")}
                      className="text-xs font-semibold text-[#5C3A1E] hover:text-[#A98B57] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View All ({orders.length})</span>
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

            {/* ============================================================ */}
            {/* TAB 2: ORDERS MANAGEMENT & DETAIL CHECKER */}
            {/* ============================================================ */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                {/* Header & Quick Sync */}
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
                <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3.5">
                  <div className="relative flex-1 max-w-md w-full">
                    <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by Client, Email, Order ID, or 12-digit UTR..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FFFDF9] border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between xl:justify-end">
                    {/* Status Filter Buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
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
                          </div>

                          <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[#64748B] text-[10px] block">Service / Package:</span>
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
                                <span className="text-[10px] text-emerald-800 block font-medium">12-Digit UTR:</span>
                                <span className="font-mono font-bold text-emerald-950">{ord.utrNumber}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyUtr(ord.utrNumber!)}
                                className="p-1 rounded-md bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                                title="Copy UTR"
                              >
                                {copiedUtr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg bg-stone-100 border border-stone-200 text-[11px] text-[#64748B]">
                              No UTR provided yet
                            </div>
                          )}

                          {ord.deliverables && ord.deliverables.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8B6508] bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
                              <Sparkles className="w-3.5 h-3.5 text-[#B38E46] shrink-0" />
                              <span>{ord.deliverables.length} Deliverable(s) Vaulted</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 pt-3 border-t border-[#E5E1D8]">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setInspectingOrder(ord)}
                              className="w-full py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#5C3A1E] flex items-center justify-center gap-1.5 hover:bg-[#F0ECE1] transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Check Details</span>
                            </button>

                            {ord.status !== "in_production" && ord.status !== "completed" && ord.status !== "cancelled" ? (
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
                                className="w-full py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#5C3A1E] font-semibold flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-[#B38E46]" />
                                <span>View Assets</span>
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClientDropdownKey((ord.clientEmail || ord.clientName || "").toLowerCase().trim());
                              switchTab("clients");
                            }}
                            className="w-full py-1.5 px-3 rounded-lg bg-[#FAF9F5] border border-[#E5E1D8] text-[11px] font-semibold text-[#5C3A1E] flex items-center justify-center gap-1.5 hover:bg-[#F0ECE1] transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3 text-[#A98B57]" />
                            <span>Client Profile &amp; AI Chats</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Row List Mode */
                  <div className="space-y-3">
                    {filteredOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xs hover:border-[#A98B57]/60 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
                          <div className="space-y-1 sm:w-36 shrink-0">
                            <span className="font-mono font-bold text-xs text-[#5C3A1E] block">
                              {ord.orderNumber || ord.code || ord.id.slice(0, 8)}
                            </span>
                            {renderChannelBadge(ord.source, Boolean(ord.isDraft || ord.status === "draft"))}
                            <Badge variant={getStatusBadgeVariant(ord.status)} size="sm">
                              {ord.status.replace("_", " ")}
                            </Badge>
                          </div>

                          <div className="sm:w-48 min-w-0">
                            <h4 className="font-serif font-bold text-sm text-[#171717] truncate">{ord.clientName}</h4>
                            <p className="text-xs text-[#64748B] truncate">{ord.clientEmail}</p>
                          </div>

                          <div className="sm:w-44 min-w-0">
                            <span className="text-[10px] text-[#64748B] block">Package / Service</span>
                            <span className="text-xs font-semibold text-[#171717] truncate block">
                              {ord.packageName || ord.service || "Creative Package"}
                            </span>
                          </div>

                          <div className="sm:w-28 shrink-0">
                            <span className="text-[10px] text-[#64748B] block">Amount</span>
                            <span className="font-serif font-bold text-sm text-[#5C3A1E]">
                              ₹{(ord.totalAmount || ord.amountPaid || 3499).toLocaleString("en-IN")}
                            </span>
                          </div>

                          <div className="sm:w-36 shrink-0">
                            <span className="text-[10px] text-[#64748B] block">12-Digit UTR</span>
                            <span className="font-mono font-semibold text-xs text-emerald-800 truncate block">
                              {ord.utrNumber || "— Pending —"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E5E1D8]/60">
                          <button
                            type="button"
                            onClick={() => setInspectingOrder(ord)}
                            className="px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#5C3A1E] flex items-center justify-center gap-1.5 hover:bg-[#F0ECE1] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>

                          {ord.status !== "in_production" && ord.status !== "completed" && ord.status !== "cancelled" ? (
                            <Button
                              variant="primary"
                              size="sm"
                              className="text-xs py-2 px-3.5"
                              onClick={() => handleVerifyAndDispatch(ord)}
                              leftIcon={<Play className="w-3 h-3" />}
                            >
                              Verify UPI
                            </Button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setInspectingOrder(ord)}
                              className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#5C3A1E] font-semibold flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#B38E46]" />
                              <span>Assets</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 3: WEBSITE PAGES CMS & LIVE CONTENT EDITOR */}
            {/* ============================================================ */}
            {activeTab === "cms" && (
              <div className="space-y-6">
                {/* CMS Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E1D8]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#A98B57]" />
                      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171717]">
                        Website Pages CMS &amp; Live Editor
                      </h1>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      Directly manage copy, headlines, pricing, and contact information for every page of SutraStudio.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fetchCmsContent()}
                      isLoading={isCmsLoading}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                    >
                      Reload Cloud Copy
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveCms}
                      isLoading={isCmsSaving}
                      leftIcon={<Save className="w-3.5 h-3.5" />}
                    >
                      Save &amp; Publish
                    </Button>
                  </div>
                </div>

                {/* Feedback Toast */}
                {cmsFeedback && (
                  <div
                    className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                      cmsFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-900 border border-emerald-300"
                        : "bg-red-50 text-red-900 border border-red-300"
                    }`}
                  >
                    {cmsFeedback.type === "success" ? (
                      <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{cmsFeedback.message}</span>
                  </div>
                )}

                {/* Page Tabs Sub-Navigation */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5E1D8]">
                  {CMS_SUB_PAGES.map((p) => {
                    const SubIcon = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setActiveCmsPage(p.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          activeCmsPage === p.id
                            ? "bg-[#171717] text-[#FAF9F5] shadow-xs"
                            : "bg-[#FFFDF9] text-[#64748B] border border-[#E5E1D8] hover:border-[#A98B57]"
                        }`}
                      >
                        <SubIcon className={`w-3.5 h-3.5 ${activeCmsPage === p.id ? "text-[#A98B57]" : "text-[#8C827A]"}`} />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* CMS PAGE 1: HOME PAGE */}
                {activeCmsPage === "home" && (
                  <div className="space-y-6 bg-[#FFFDF9] p-6 rounded-3xl border border-[#E5E1D8] shadow-warm">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D8]">
                      <div>
                        <h2 className="font-serif text-lg font-bold text-[#171717]">Home Hero &amp; Headline Copy</h2>
                        <p className="text-xs text-[#64748B]">Displayed on the main landing page (`/`).</p>
                      </div>
                      <Link
                        href="/"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#5C3A1E] hover:border-[#A98B57]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Preview Live Home ↗</span>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-[#171717]">Hero Tagline (Kicker):</label>
                        <input
                          type="text"
                          value={cmsData?.hero?.tagline || ""}
                          onChange={(e) => updateCmsField("hero", "tagline", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-[#171717]">Main Hero Title:</label>
                        <input
                          type="text"
                          value={cmsData?.hero?.title || ""}
                          onChange={(e) => updateCmsField("hero", "title", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs font-bold text-[#171717] focus:outline-none focus:border-[#A98B57]"
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-[#171717]">Hero Description Copy:</label>
                        <textarea
                          rows={3}
                          value={cmsData?.hero?.description || ""}
                          onChange={(e) => updateCmsField("hero", "description", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171717]">Primary CTA Button Text:</label>
                        <input
                          type="text"
                          value={cmsData?.hero?.primaryCtaText || ""}
                          onChange={(e) => updateCmsField("hero", "primaryCtaText", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171717]">Secondary CTA Button Text:</label>
                        <input
                          type="text"
                          value={cmsData?.hero?.secondaryCtaText || ""}
                          onChange={(e) => updateCmsField("hero", "secondaryCtaText", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171717]">Key Metric 1 (Turnaround):</label>
                        <input
                          type="text"
                          value={cmsData?.hero?.statsTurnaround || ""}
                          onChange={(e) => updateCmsField("hero", "statsTurnaround", e.target.value)}
                          placeholder="48-72 Hours"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171717]">Key Metric 2 (Precision):</label>
                        <input
                          type="text"
                          value={cmsData?.hero?.statsRating || ""}
                          onChange={(e) => updateCmsField("hero", "statsRating", e.target.value)}
                          placeholder="99.8% Precision"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                        />
                      </div>
                    </div>

                    <SectionVisualControls
                      sectionKey="hero"
                      sectionTitle="Home Hero Section"
                      cmsData={cmsData}
                      updateCmsField={updateCmsField}
                    />
                  </div>
                )}

                {/* CMS PAGE 2: ABOUT STUDIO */}
                {activeCmsPage === "about" && (
                  <div className="space-y-6 bg-[#FFFDF9] p-6 rounded-3xl border border-[#E5E1D8] shadow-warm">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D8]">
                      <div>
                        <h2 className="font-serif text-lg font-bold text-[#171717]">About Studio &amp; Heritage Narrative</h2>
                        <p className="text-xs text-[#64748B]">Displayed on the About Studio page (`/about`).</p>
                      </div>
                      <Link
                        href="/about"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#5C3A1E] hover:border-[#A98B57]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Preview Live About ↗</span>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-[#171717]">About Page Heading:</label>
                        <input
                          type="text"
                          value={cmsData?.about?.title || ""}
                          onChange={(e) => updateCmsField("about", "title", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-[#171717]">About Subtitle &amp; Thesis:</label>
                        <input
                          type="text"
                          value={cmsData?.about?.subtitle || ""}
                          onChange={(e) => updateCmsField("about", "subtitle", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-[#171717]">Studio Heritage Story &amp; Philosophy:</label>
                        <textarea
                          rows={4}
                          value={cmsData?.about?.story || ""}
                          onChange={(e) => updateCmsField("about", "story", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171717]">Values Statement:</label>
                        <input
                          type="text"
                          value={cmsData?.about?.valuesStatement || ""}
                          onChange={(e) => updateCmsField("about", "valuesStatement", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171717]">Atelier Base / Location Statement:</label>
                        <input
                          type="text"
                          value={cmsData?.about?.location || ""}
                          onChange={(e) => updateCmsField("about", "location", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                        />
                      </div>
                    </div>

                    <SectionVisualControls
                      sectionKey="about"
                      sectionTitle="About Studio Section"
                      cmsData={cmsData}
                      updateCmsField={updateCmsField}
                    />
                  </div>
                )}

                {/* CMS PAGE 3: SERVICES */}
                {activeCmsPage === "services" && (
                  <div className="space-y-6 bg-[#FFFDF9] p-6 rounded-3xl border border-[#E5E1D8] shadow-warm">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D8]">
                      <div>
                        <h2 className="font-serif text-lg font-bold text-[#171717]">Services &amp; Studio Capabilities</h2>
                        <p className="text-xs text-[#64748B]">Displayed on the Services page (`/services`).</p>
                      </div>
                      <Link
                        href="/services"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#5C3A1E] hover:border-[#A98B57]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Preview Live Services ↗</span>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-[#171717]">Services Page Title:</label>
                        <input
                          type="text"
                          value={cmsData?.services?.title || ""}
                          onChange={(e) => updateCmsField("services", "title", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-[#171717]">Services Subtitle:</label>
                        <input
                          type="text"
                          value={cmsData?.services?.subtitle || ""}
                          onChange={(e) => updateCmsField("services", "subtitle", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                        />
                      </div>

                      {/* Discipline 1 */}
                      <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-2 md:col-span-2">
                        <span className="text-xs font-mono font-bold text-[#A98B57] uppercase">Discipline 01</span>
                        <input
                          type="text"
                          value={cmsData?.services?.service1Title || ""}
                          onChange={(e) => updateCmsField("services", "service1Title", e.target.value)}
                          placeholder="Service Title"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs font-bold text-[#171717]"
                        />
                        <textarea
                          rows={2}
                          value={cmsData?.services?.service1Desc || ""}
                          onChange={(e) => updateCmsField("services", "service1Desc", e.target.value)}
                          placeholder="Service Description"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                        />
                      </div>

                      {/* Discipline 2 */}
                      <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-2 md:col-span-2">
                        <span className="text-xs font-mono font-bold text-[#A98B57] uppercase">Discipline 02</span>
                        <input
                          type="text"
                          value={cmsData?.services?.service2Title || ""}
                          onChange={(e) => updateCmsField("services", "service2Title", e.target.value)}
                          placeholder="Service Title"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs font-bold text-[#171717]"
                        />
                        <textarea
                          rows={2}
                          value={cmsData?.services?.service2Desc || ""}
                          onChange={(e) => updateCmsField("services", "service2Desc", e.target.value)}
                          placeholder="Service Description"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                        />
                      </div>

                      {/* Discipline 3 */}
                      <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-2 md:col-span-2">
                        <span className="text-xs font-mono font-bold text-[#A98B57] uppercase">Discipline 03</span>
                        <input
                          type="text"
                          value={cmsData?.services?.service3Title || ""}
                          onChange={(e) => updateCmsField("services", "service3Title", e.target.value)}
                          placeholder="Service Title"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs font-bold text-[#171717]"
                        />
                        <textarea
                          rows={2}
                          value={cmsData?.services?.service3Desc || ""}
                          onChange={(e) => updateCmsField("services", "service3Desc", e.target.value)}
                          placeholder="Service Description"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-[#171717]">Turnaround SLA Policy Note:</label>
                        <input
                          type="text"
                          value={cmsData?.services?.turnaroundSla || ""}
                          onChange={(e) => updateCmsField("services", "turnaroundSla", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                        />
                      </div>
                    </div>

                    <SectionVisualControls
                      sectionKey="services"
                      sectionTitle="Services & Capabilities Section"
                      cmsData={cmsData}
                      updateCmsField={updateCmsField}
                    />
                  </div>
                )}

                {/* CMS PAGE 4: PRICING & PACKAGES */}
                {activeCmsPage === "pricing" && (
                  <div className="space-y-6 bg-[#FFFDF9] p-6 rounded-3xl border border-[#E5E1D8] shadow-warm">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D8]">
                      <div>
                        <h2 className="font-serif text-lg font-bold text-[#171717]">Pricing Tiers &amp; Retainer Packages</h2>
                        <p className="text-xs text-[#64748B]">Displayed on the Pricing page (`/pricing`).</p>
                      </div>
                      <Link
                        href="/pricing"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#5C3A1E] hover:border-[#A98B57]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Preview Live Pricing ↗</span>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Tier 1 */}
                      <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-3">
                        <span className="text-xs font-mono font-bold text-[#A98B57] uppercase">Starter Tier</span>
                        <input
                          type="text"
                          value={cmsData?.pricing?.starterName || ""}
                          onChange={(e) => updateCmsField("pricing", "starterName", e.target.value)}
                          placeholder="Package Name"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs font-bold text-[#171717]"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-[#64748B]">₹</span>
                          <input
                            type="text"
                            value={cmsData?.pricing?.starterPrice || ""}
                            onChange={(e) => updateCmsField("pricing", "starterPrice", e.target.value)}
                            placeholder="Price (e.g. 3,499)"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs font-serif font-bold text-[#5C3A1E]"
                          />
                        </div>
                        <input
                          type="text"
                          value={cmsData?.pricing?.starterDelivery || ""}
                          onChange={(e) => updateCmsField("pricing", "starterDelivery", e.target.value)}
                          placeholder="Turnaround SLA"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#64748B]"
                        />
                        <textarea
                          rows={3}
                          value={cmsData?.pricing?.starterFeatures || ""}
                          onChange={(e) => updateCmsField("pricing", "starterFeatures", e.target.value)}
                          placeholder="Features summary"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                        />
                      </div>

                      {/* Tier 2 */}
                      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-300 space-y-3">
                        <span className="text-xs font-mono font-bold text-[#5C3A1E] uppercase">Pro Tier (Popular)</span>
                        <input
                          type="text"
                          value={cmsData?.pricing?.proName || ""}
                          onChange={(e) => updateCmsField("pricing", "proName", e.target.value)}
                          placeholder="Package Name"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold text-[#171717]"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-[#64748B]">₹</span>
                          <input
                            type="text"
                            value={cmsData?.pricing?.proPrice || ""}
                            onChange={(e) => updateCmsField("pricing", "proPrice", e.target.value)}
                            placeholder="Price (e.g. 7,499)"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-serif font-bold text-[#5C3A1E]"
                          />
                        </div>
                        <input
                          type="text"
                          value={cmsData?.pricing?.proDelivery || ""}
                          onChange={(e) => updateCmsField("pricing", "proDelivery", e.target.value)}
                          placeholder="Turnaround SLA"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs text-[#64748B]"
                        />
                        <textarea
                          rows={3}
                          value={cmsData?.pricing?.proFeatures || ""}
                          onChange={(e) => updateCmsField("pricing", "proFeatures", e.target.value)}
                          placeholder="Features summary"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs text-[#171717]"
                        />
                      </div>

                      {/* Tier 3 */}
                      <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-3">
                        <span className="text-xs font-mono font-bold text-[#A98B57] uppercase">Retainer Tier</span>
                        <input
                          type="text"
                          value={cmsData?.pricing?.retainerName || ""}
                          onChange={(e) => updateCmsField("pricing", "retainerName", e.target.value)}
                          placeholder="Package Name"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs font-bold text-[#171717]"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-[#64748B]">₹</span>
                          <input
                            type="text"
                            value={cmsData?.pricing?.retainerPrice || ""}
                            onChange={(e) => updateCmsField("pricing", "retainerPrice", e.target.value)}
                            placeholder="Price (e.g. 19,999)"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs font-serif font-bold text-[#5C3A1E]"
                          />
                        </div>
                        <input
                          type="text"
                          value={cmsData?.pricing?.retainerDelivery || ""}
                          onChange={(e) => updateCmsField("pricing", "retainerDelivery", e.target.value)}
                          placeholder="Turnaround SLA"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#64748B]"
                        />
                        <textarea
                          rows={3}
                          value={cmsData?.pricing?.retainerFeatures || ""}
                          onChange={(e) => updateCmsField("pricing", "retainerFeatures", e.target.value)}
                          placeholder="Features summary"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                        />
                      </div>
                    </div>

                    <SectionVisualControls
                      sectionKey="pricing"
                      sectionTitle="Pricing & Investment Section"
                      cmsData={cmsData}
                      updateCmsField={updateCmsField}
                    />
                  </div>
                )}

                {/* CMS PAGE 5: CONTACT & CONCIERGE */}
                {activeCmsPage === "contact" && (
                  <div className="space-y-6 bg-[#FFFDF9] p-6 rounded-3xl border border-[#E5E1D8] shadow-warm">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D8]">
                      <div>
                        <h2 className="font-serif text-lg font-bold text-[#171717]">Contact, Concierge &amp; Address Details</h2>
                        <p className="text-xs text-[#64748B]">Displayed on the Contact page (`/contact`) and inquiry modals.</p>
                      </div>
                      <Link
                        href="/contact"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#5C3A1E] hover:border-[#A98B57]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Preview Live Contact ↗</span>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171717]">Official Email:</label>
                        <input
                          type="email"
                          value={cmsData?.contact?.email || ""}
                          onChange={(e) => updateCmsField("contact", "email", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171717]">WhatsApp Phone Number:</label>
                        <input
                          type="text"
                          value={cmsData?.contact?.whatsapp || ""}
                          onChange={(e) => updateCmsField("contact", "whatsapp", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171717]">Studio Operating Hours:</label>
                        <input
                          type="text"
                          value={cmsData?.contact?.operatingHours || ""}
                          onChange={(e) => updateCmsField("contact", "operatingHours", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171717]">Response Time Guarantee SLA:</label>
                        <input
                          type="text"
                          value={cmsData?.contact?.responseSla || ""}
                          onChange={(e) => updateCmsField("contact", "responseSla", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-[#171717]">Physical Studio Base Address:</label>
                        <input
                          type="text"
                          value={cmsData?.contact?.address || ""}
                          onChange={(e) => updateCmsField("contact", "address", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                        />
                      </div>
                    </div>

                    <SectionVisualControls
                      sectionKey="contact"
                      sectionTitle="Contact & Inquiry Section"
                      cmsData={cmsData}
                      updateCmsField={updateCmsField}
                    />
                  </div>
                )}

                {/* CMS PAGE 6: HEADER & ANNOUNCEMENT */}
                {activeCmsPage === "header" && (
                  <div className="space-y-6 bg-[#FFFDF9] p-6 rounded-3xl border border-[#E5E1D8] shadow-warm">
                    <div className="pb-3 border-b border-[#E5E1D8]">
                      <h2 className="font-serif text-lg font-bold text-[#171717]">Top Header &amp; Announcement Bar</h2>
                      <p className="text-xs text-[#64748B]">Manage the global announcement banner visible across every public page.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8]">
                        <div>
                          <p className="font-semibold text-xs text-[#171717]">Announcement Banner Active</p>
                          <p className="text-[11px] text-[#64748B]">Enable or disable the gold ticker at the top of the site.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(cmsData?.header?.announcementActive)}
                          onChange={(e) => updateCmsField("header", "announcementActive", e.target.checked)}
                          className="w-4 h-4 accent-[#A98B57] cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171717]">Announcement Banner Text:</label>
                        <input
                          type="text"
                          value={cmsData?.header?.announcementBarText || ""}
                          onChange={(e) => updateCmsField("header", "announcementBarText", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                        />
                      </div>
                    </div>

                    <SectionVisualControls
                      sectionKey="header"
                      sectionTitle="Header Navigation & Bar"
                      cmsData={cmsData}
                      updateCmsField={updateCmsField}
                    />
                  </div>
                )}

                {/* CMS PAGE 7: FOOTER & SOCIALS */}
                {activeCmsPage === "footer" && (
                  <div className="space-y-6 bg-[#FFFDF9] p-6 rounded-3xl border border-[#E5E1D8] shadow-warm">
                    <div className="pb-3 border-b border-[#E5E1D8]">
                      <h2 className="font-serif text-lg font-bold text-[#171717]">Global Footer &amp; Social Links</h2>
                      <p className="text-xs text-[#64748B]">Control official Instagram, Facebook, and WhatsApp connections.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-[#171717]">Footer Brand Tagline:</label>
                        <input
                          type="text"
                          value={cmsData?.footer?.brandTagline || ""}
                          onChange={(e) => updateCmsField("footer", "brandTagline", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171717]">Official Instagram URL:</label>
                        <input
                          type="text"
                          value={cmsData?.footer?.socialLinks?.instagram || ""}
                          onChange={(e) =>
                            setCmsData((prev: any) => ({
                              ...prev,
                              footer: {
                                ...prev.footer,
                                socialLinks: {
                                  ...(prev.footer?.socialLinks || {}),
                                  instagram: e.target.value,
                                },
                              },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#171717]">Official Facebook Page URL:</label>
                        <input
                          type="text"
                          value={cmsData?.footer?.socialLinks?.facebookPage || ""}
                          onChange={(e) =>
                            setCmsData((prev: any) => ({
                              ...prev,
                              footer: {
                                ...prev.footer,
                                socialLinks: {
                                  ...(prev.footer?.socialLinks || {}),
                                  facebookPage: e.target.value,
                                },
                              },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                        />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-[#171717]">Direct WhatsApp Concierge Link:</label>
                        <input
                          type="text"
                          value={cmsData?.footer?.socialLinks?.whatsapp || ""}
                          onChange={(e) =>
                            setCmsData((prev: any) => ({
                              ...prev,
                              footer: {
                                ...prev.footer,
                                socialLinks: {
                                  ...(prev.footer?.socialLinks || {}),
                                  whatsapp: e.target.value,
                                },
                              },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                        />
                      </div>
                    </div>

                    <SectionVisualControls
                      sectionKey="footer"
                      sectionTitle="Footer & Copyright Section"
                      cmsData={cmsData}
                      updateCmsField={updateCmsField}
                    />
                  </div>
                )}

                {/* CMS PAGE: GLOBAL THEME & BODY STYLE */}
                {activeCmsPage === "theme" && (
                  <div className="space-y-6 bg-[#FFFDF9] p-6 rounded-3xl border border-[#E5E1D8] shadow-warm">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D8]">
                      <div>
                        <h2 className="font-serif text-lg font-bold text-[#171717]">Global Theme, Body &amp; Typography Studio</h2>
                        <p className="text-xs text-[#64748B]">
                          Directly control global background color, primary brand accent, typography fonts, and body texture patterns live across the entire website.
                        </p>
                      </div>
                      <Link
                        href="/"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#5C3A1E] hover:border-[#A98B57]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Live Site ↗</span>
                      </Link>
                    </div>

                    {/* Live Preview Card */}
                    <div
                      className="p-5 rounded-2xl border transition-all"
                      style={{
                        backgroundColor: cmsData?.theme?.bodyBgColor || "#FAF9F5",
                        borderColor: cmsData?.theme?.accentColor || "#A98B57",
                      }}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/80 border border-[#E5E1D8] text-[#171717]">
                        Live Theme Preview
                      </span>
                      <h3
                        className="mt-3 text-2xl font-bold"
                        style={{
                          color: "#171717",
                          fontFamily: cmsData?.theme?.headingFont ? `"${cmsData.theme.headingFont}", serif` : undefined,
                        }}
                      >
                        Tradition Meets Computational Technology
                      </h3>
                      <p
                        className="mt-1 text-xs text-[#525252] max-w-xl"
                        style={{
                          fontFamily: cmsData?.theme?.bodyFont ? `"${cmsData.theme.bodyFont}", sans-serif` : undefined,
                        }}
                      >
                        This preview card reflects your selected primary brand accent, body background tint, and heading/body typography live.
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          style={{ backgroundColor: cmsData?.theme?.accentColor || "#A98B57" }}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs cursor-pointer"
                        >
                          Primary Accent Button
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E5E1D8] text-[#171717] cursor-pointer"
                        >
                          Secondary Action
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Brand Primary Accent Color */}
                      <div className="space-y-3 p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8]">
                        <label className="text-xs font-bold text-[#171717] flex items-center gap-2">
                          <Palette className="w-3.5 h-3.5 text-[#A98B57]" />
                          <span>Primary Brand Accent Color:</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={cmsData?.theme?.accentColor || "#A98B57"}
                            onChange={(e) => updateCmsField("theme", "accentColor", e.target.value)}
                            className="w-10 h-10 rounded-xl cursor-pointer border border-[#E5E1D8] p-0.5 bg-white shrink-0"
                          />
                          <input
                            type="text"
                            value={cmsData?.theme?.accentColor || "#A98B57"}
                            onChange={(e) => updateCmsField("theme", "accentColor", e.target.value)}
                            className="w-32 px-3 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs font-mono font-bold text-[#171717]"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] text-[#8C827A] mr-1">Presets:</span>
                          {[
                            { label: "Muted Brass", hex: "#A98B57" },
                            { label: "Royal Gold", hex: "#D4A35A" },
                            { label: "Vedic Amber", hex: "#C2761A" },
                            { label: "Heritage Emerald", hex: "#2E7D4F" },
                            { label: "Charcoal Noir", hex: "#171717" },
                          ].map((c) => (
                            <button
                              key={c.hex}
                              type="button"
                              onClick={() => updateCmsField("theme", "accentColor", c.hex)}
                              className="px-2 py-1 rounded-md text-[10px] font-semibold border border-[#E5E1D8] bg-white hover:border-[#A98B57] flex items-center gap-1.5 cursor-pointer"
                            >
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.hex }} />
                              <span>{c.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Main Body Background Color */}
                      <div className="space-y-3 p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8]">
                        <label className="text-xs font-bold text-[#171717] flex items-center gap-2">
                          <Paintbrush className="w-3.5 h-3.5 text-[#A98B57]" />
                          <span>Main Body Background Color:</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={cmsData?.theme?.bodyBgColor || "#FAF9F5"}
                            onChange={(e) => updateCmsField("theme", "bodyBgColor", e.target.value)}
                            className="w-10 h-10 rounded-xl cursor-pointer border border-[#E5E1D8] p-0.5 bg-white shrink-0"
                          />
                          <input
                            type="text"
                            value={cmsData?.theme?.bodyBgColor || "#FAF9F5"}
                            onChange={(e) => updateCmsField("theme", "bodyBgColor", e.target.value)}
                            className="w-32 px-3 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs font-mono font-bold text-[#171717]"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] text-[#8C827A] mr-1">Presets:</span>
                          {[
                            { label: "Warm Ivory", hex: "#FAF9F5" },
                            { label: "Pure White", hex: "#FFFFFF" },
                            { label: "Atelier Cream", hex: "#F8F5EF" },
                            { label: "Sand Linen", hex: "#F5F2EB" },
                            { label: "Alabaster Light", hex: "#FFFDF9" },
                          ].map((c) => (
                            <button
                              key={c.hex}
                              type="button"
                              onClick={() => updateCmsField("theme", "bodyBgColor", c.hex)}
                              className="px-2 py-1 rounded-md text-[10px] font-semibold border border-[#E5E1D8] bg-white hover:border-[#A98B57] flex items-center gap-1.5 cursor-pointer"
                            >
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-neutral-300" style={{ backgroundColor: c.hex }} />
                              <span>{c.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Body Typography Font Family */}
                      <div className="space-y-2 p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8]">
                        <label className="text-xs font-bold text-[#171717] flex items-center gap-2">
                          <Type className="w-3.5 h-3.5 text-[#A98B57]" />
                          <span>Body Font Family:</span>
                        </label>
                        <select
                          value={cmsData?.theme?.bodyFont || "Outfit"}
                          onChange={(e) => updateCmsField("theme", "bodyFont", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs font-semibold text-[#171717] focus:outline-none focus:border-[#A98B57]"
                        >
                          <option value="Outfit">Outfit (Modern Clean Geometric - Studio Default)</option>
                          <option value="Inter">Inter (Precise Clean UI Standard)</option>
                          <option value="Plus Jakarta Sans">Plus Jakarta Sans (Contemporary Atelier)</option>
                          <option value="Roboto">Roboto (Crisp Editorial)</option>
                          <option value="Lato">Lato (Balanced &amp; Warm)</option>
                          <option value="Poppins">Poppins (Friendly &amp; Geometric)</option>
                        </select>
                        <p className="text-[11px] text-[#8C827A]">Controls paragraphs, button labels, descriptions, and UI text.</p>
                      </div>

                      {/* Heading Typography Font Family */}
                      <div className="space-y-2 p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8]">
                        <label className="text-xs font-bold text-[#171717] flex items-center gap-2">
                          <Type className="w-3.5 h-3.5 text-[#A98B57]" />
                          <span>Headings Font Family (Serif / Display):</span>
                        </label>
                        <select
                          value={cmsData?.theme?.headingFont || "Playfair Display"}
                          onChange={(e) => updateCmsField("theme", "headingFont", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs font-semibold text-[#171717] focus:outline-none focus:border-[#A98B57]"
                        >
                          <option value="Playfair Display">Playfair Display (Luxury Editorial Serif - Studio Default)</option>
                          <option value="Cinzel">Cinzel (Classical Roman Architectural)</option>
                          <option value="Cormorant Garamond">Cormorant Garamond (High-Fashion Heritage)</option>
                          <option value="Bodoni Moda">Bodoni Moda (Couture Italian Display)</option>
                          <option value="Outfit">Outfit (Contemporary Sans Display)</option>
                        </select>
                        <p className="text-[11px] text-[#8C827A]">Controls H1, H2, H3 and display titles throughout the site.</p>
                      </div>

                      {/* Background Texture Pattern */}
                      <div className="space-y-2 p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] md:col-span-2">
                        <label className="text-xs font-bold text-[#171717]">Body Background Texture Pattern:</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {[
                            { id: "subtle-dots", label: "Luxury Dots", desc: "Gold dot matrix" },
                            { id: "grid", label: "Studio Grid", desc: "Architectural blueprint" },
                            { id: "warm-grain", label: "Paper Grain", desc: "Handmade texture" },
                            { id: "none", label: "Smooth Solid", desc: "Zero texture overlay" },
                          ].map((pt) => {
                            const isSelected = (cmsData?.theme?.texturePattern || "subtle-dots") === pt.id;
                            return (
                              <button
                                key={pt.id}
                                type="button"
                                onClick={() => updateCmsField("theme", "texturePattern", pt.id)}
                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-[#171717] text-white border-[#171717] shadow-xs"
                                    : "bg-white text-[#171717] border-[#E5E1D8] hover:border-[#A98B57]"
                                }`}
                              >
                                <div className="text-xs font-bold">{pt.label}</div>
                                <div className={`text-[10px] mt-0.5 ${isSelected ? "text-neutral-300" : "text-[#8C827A]"}`}>
                                  {pt.desc}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Body Background Image URL */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-[#171717]">Custom Body Background Image / Pattern URL (Optional):</label>
                        <input
                          type="text"
                          value={cmsData?.theme?.bodyBgImage || ""}
                          onChange={(e) => updateCmsField("theme", "bodyBgImage", e.target.value)}
                          placeholder="https://... or /patterns/luxury-grain.png"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Floating Save Bar */}
                <div className="p-4 rounded-2xl bg-[#171717] text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4 text-[#A98B57]" />
                    <span className="text-xs font-medium">
                      Unpublished edits in memory. Click Save to write immediately to Cloud Firestore.
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveCms}
                    isLoading={isCmsSaving}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                    className="w-full sm:w-auto"
                  >
                    Save &amp; Publish Website Changes
                  </Button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 4: CLIENTS DIRECTORY & AI CONVERSATIONS */}
            {/* ============================================================ */}
            {activeTab === "clients" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E1D8]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#A98B57]" />
                      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171717]">
                        CRM Clients Directory &amp; AI Chats
                      </h1>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      Authentic client profiles, real verified orders, and full AI chatbot conversation histories.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF9F5] border border-[#E5E1D8] text-[#5C3A1E]">
                      {clientsList.length} Unique Clients
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        fetchOrders();
                        fetchClientChats();
                      }}
                      disabled={isChatsLoading || isRefreshing}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-[#171717] text-white flex items-center gap-1.5 hover:bg-[#262626] transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isChatsLoading || isRefreshing ? "animate-spin" : ""}`} />
                      <span>Sync Data</span>
                    </button>
                  </div>
                </div>

                {/* ============================================================ */}
                {/* CLIENT SELECTOR DROPDOWN (Direct Client + Orders + AI Chat) */}
                {/* ============================================================ */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-warm space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] flex items-center justify-center text-[#A98B57]">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <label htmlFor="client-selector" className="text-xs font-bold text-[#171717] block">
                          Client Selector (Orders &amp; AI Chat Logs):
                        </label>
                        <p className="text-[11px] text-[#64748B]">
                          Choose a client from the dropdown to inspect their profile, original orders, and live AI chatbot messages.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        id="client-selector"
                        value={selectedClientDropdownKey}
                        onChange={(e) => setSelectedClientDropdownKey(e.target.value)}
                        className="w-full md:w-auto min-w-[280px] sm:min-w-[340px] px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#171717] focus:outline-none focus:border-[#A98B57] cursor-pointer shadow-2xs"
                      >
                        <option value="">— Show All Clients Grid ({clientsList.length} Total) —</option>
                        {clientsList.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.name} ({c.email}) • {c.orders.length} order{c.orders.length !== 1 ? "s" : ""} • {c.chatMessages.length} AI chat{c.chatMessages.length !== 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>

                      {selectedClientDropdownKey && (
                        <button
                          type="button"
                          onClick={() => setSelectedClientDropdownKey("")}
                          className="px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#64748B] hover:text-[#171717] hover:bg-[#F0ECE1] transition-colors cursor-pointer shrink-0"
                        >
                          Clear / Grid View
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ============================================================ */}
                {/* CONDITIONAL: FOCUSED CLIENT INSPECTOR (Orders + AI Chats)   */}
                {/* ============================================================ */}
                {selectedClient ? (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Client Header Card */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-warm space-y-5">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5E1D8]">
                        <div className="flex items-center gap-4 min-w-0">
                          <Avatar name={selectedClient.name} size="lg" status="online" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#171717] truncate">
                                {selectedClient.name}
                              </h2>
                              <Badge variant={getStatusBadgeVariant(selectedClient.latestStatus)} size="sm">
                                {selectedClient.latestStatus.replace("_", " ")}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[#64748B] mt-1 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-[#A98B57]" />
                                <a href={`mailto:${selectedClient.email}`} className="hover:underline">
                                  {selectedClient.email}
                                </a>
                              </span>
                              {selectedClient.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5 text-[#A98B57]" />
                                  <a href={`tel:${selectedClient.phone}`} className="hover:underline">
                                    {selectedClient.phone}
                                  </a>
                                </span>
                              )}
                              {selectedClient.latestOrderDate && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-[#A98B57]" />
                                  <span>Active: {new Date(selectedClient.latestOrderDate).toLocaleDateString()}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Top Action Pills */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={`mailto:${selectedClient.email}`}
                            className="px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#5C3A1E] flex items-center gap-1.5 hover:bg-[#F0ECE1] transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Send Email</span>
                          </a>
                          {selectedClient.phone && (
                            <a
                              href={`https://wa.me/${selectedClient.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                            >
                              <span>WhatsApp</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedClientDropdownKey("")}
                            className="px-3.5 py-2 rounded-xl bg-[#171717] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#262626] transition-colors cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5 text-[#A98B57]" />
                            <span>Return to All Clients</span>
                          </button>
                        </div>
                      </div>

                      {/* Stat Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-1">
                          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Lifetime Value</span>
                          <p className="font-serif text-lg font-bold text-[#5C3A1E]">
                            ₹{selectedClient.totalLtv.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-1">
                          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Total Orders</span>
                          <p className="font-serif text-lg font-bold text-[#171717]">
                            {selectedClient.orders.length}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-1">
                          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">AI Chat Messages</span>
                          <p className="font-serif text-lg font-bold text-[#A98B57]">
                            {selectedClient.chatMessages.length}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-1">
                          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Recent Package</span>
                          <p className="font-medium text-xs text-[#171717] truncate" title={selectedClient.latestPackage}>
                            {selectedClient.latestPackage}
                          </p>
                        </div>
                      </div>

                      {/* Sub-tab view mode toggles */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[#E5E1D8]">
                        <button
                          type="button"
                          onClick={() => setClientDetailTab("all")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            clientDetailTab === "all"
                              ? "bg-[#171717] text-white"
                              : "bg-[#FAF9F5] border border-[#E5E1D8] text-[#64748B] hover:text-[#171717]"
                          }`}
                        >
                          All Details (Orders &amp; AI Chats)
                        </button>
                        <button
                          type="button"
                          onClick={() => setClientDetailTab("orders")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            clientDetailTab === "orders"
                              ? "bg-[#171717] text-white"
                              : "bg-[#FAF9F5] border border-[#E5E1D8] text-[#64748B] hover:text-[#171717]"
                          }`}
                        >
                          Orders ({selectedClient.orders.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setClientDetailTab("chats")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            clientDetailTab === "chats"
                              ? "bg-[#171717] text-white"
                              : "bg-[#FAF9F5] border border-[#E5E1D8] text-[#64748B] hover:text-[#171717]"
                          }`}
                        >
                          AI Chatbox Logs ({selectedClient.chatMessages.length})
                        </button>
                      </div>
                    </div>

                    {/* 2-COLUMN OR STACKED DETAIL VIEWS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* SECTION 1: CLIENT'S REAL ORDERS */}
                      {(clientDetailTab === "all" || clientDetailTab === "orders") && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4 text-[#A98B57]" />
                              <h3 className="font-serif font-bold text-base text-[#171717]">
                                Verified Client Orders ({selectedClient.orders.length})
                              </h3>
                            </div>
                            <span className="text-[11px] text-[#64748B]">Real customer orders only</span>
                          </div>

                          {selectedClient.orders.length === 0 ? (
                            <div className="p-8 text-center text-xs text-[#64748B] bg-[#FFFDF9] rounded-2xl border border-[#E5E1D8] space-y-2">
                              <ShoppingBag className="w-6 h-6 text-[#94A3B8] mx-auto opacity-40" />
                              <p className="font-semibold text-[#171717]">No active orders placed yet</p>
                              <p>This client has engaged through the AI chatbot or concierge and has not completed checkout yet.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {selectedClient.orders.map((ord) => (
                                <div
                                  key={ord.id}
                                  className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xs space-y-3 hover:border-[#A98B57]/60 transition-all"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="font-mono font-bold text-xs text-[#5C3A1E]">
                                        {ord.orderNumber || ord.code || ord.id.slice(0, 10)}
                                      </span>
                                      {renderChannelBadge(ord.source, ord.isDraft)}
                                    </div>
                                    <Badge variant={getStatusBadgeVariant(ord.status)} size="sm">
                                      {ord.status.replace("_", " ")}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-[#171717] truncate">
                                      {ord.packageName || ord.service || "Creative Commission"}
                                    </span>
                                    <span className="font-serif font-bold text-sm text-[#5C3A1E] shrink-0">
                                      ₹{(ord.totalAmount || ord.amountPaid || 0).toLocaleString("en-IN")}
                                    </span>
                                  </div>

                                  {ord.utrNumber ? (
                                    <div className="p-2 rounded-lg bg-[#FAF9F5] border border-[#E5E1D8] flex items-center justify-between text-[11px]">
                                      <span className="text-[#64748B]">UTR Ref:</span>
                                      <span className="font-mono font-bold text-[#2E7D4F]">{ord.utrNumber}</span>
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-[#94A3B8] italic">No UTR submitted yet</p>
                                  )}

                                  <div className="flex items-center justify-between pt-2 border-t border-[#E5E1D8] text-xs">
                                    <span className="text-[#64748B] text-[11px]">
                                      {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : "—"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setInspectingOrder(ord)}
                                      className="py-1.5 px-3 rounded-lg bg-[#171717] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#262626] transition-colors cursor-pointer"
                                    >
                                      <Eye className="w-3 h-3 text-[#A98B57]" />
                                      <span>Inspect Order</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* SECTION 2: CLIENT'S AI CHATBOX CONVERSATIONS */}
                      {(clientDetailTab === "all" || clientDetailTab === "chats") && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-[#A98B57]" />
                              <h3 className="font-serif font-bold text-base text-[#171717]">
                                AI Chatbox Message History ({selectedClient.chatMessages.length})
                              </h3>
                            </div>
                            <button
                              type="button"
                              onClick={fetchClientChats}
                              disabled={isChatsLoading}
                              className="text-[11px] font-semibold text-[#5C3A1E] hover:text-[#A98B57] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <RefreshCw className={`w-3 h-3 ${isChatsLoading ? "animate-spin" : ""}`} />
                              <span>Refresh</span>
                            </button>
                          </div>

                          {selectedClient.chatMessages.length === 0 ? (
                            <div className="p-8 text-center text-xs text-[#64748B] bg-[#FFFDF9] rounded-2xl border border-[#E5E1D8] space-y-2">
                              <MessageSquare className="w-6 h-6 text-[#94A3B8] mx-auto opacity-40" />
                              <p className="font-semibold text-[#171717]">No chat conversations recorded</p>
                              <p>When this client messages the studio AI concierge on the website, their message stream will display here in real time.</p>
                            </div>
                          ) : (
                            <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xs space-y-3.5 max-h-[560px] overflow-y-auto">
                              {selectedClient.chatMessages.map((msg: any, idx: number) => {
                                const isClient = msg.sender === "client";
                                return (
                                  <div
                                    key={msg.id || idx}
                                    className={`flex flex-col ${isClient ? "items-end" : "items-start"} space-y-1`}
                                  >
                                    <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] px-1">
                                      {isClient ? (
                                        <>
                                          <User className="w-3 h-3 text-[#A98B57]" />
                                          <span className="font-bold text-[#171717]">
                                            {selectedClient.name || "Client"}
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <Bot className="w-3 h-3 text-[#A98B57]" />
                                          <span className="font-bold text-[#5C3A1E]">Studio AI Assistant</span>
                                        </>
                                      )}
                                      <span>•</span>
                                      <span>
                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent"}
                                      </span>
                                    </div>

                                    <div
                                      className={`p-3.5 rounded-2xl max-w-[90%] sm:max-w-[85%] text-xs leading-relaxed whitespace-pre-wrap ${
                                        isClient
                                          ? "bg-[#171717] text-[#FAF9F5] rounded-tr-xs"
                                          : "bg-[#FAF9F5] text-[#171717] border border-[#E5E1D8] rounded-tl-xs shadow-2xs"
                                      }`}
                                    >
                                      {msg.text}

                                      {/* Order Draft Attachment Preview */}
                                      {msg.orderDraft && (
                                        <div className="mt-2.5 p-2.5 rounded-xl bg-white border border-[#E5E1D8] text-[11px] text-[#171717] space-y-1 shadow-2xs">
                                          <div className="flex items-center justify-between font-bold text-[#5C3A1E]">
                                            <span>Draft Order Generated</span>
                                            <span>₹{msg.orderDraft.totalAmount?.toLocaleString("en-IN")}</span>
                                          </div>
                                          <p className="text-[10px] text-[#64748B]">{msg.orderDraft.service || msg.orderDraft.title}</p>
                                        </div>
                                      )}

                                      {/* File Attachments */}
                                      {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-white/20 text-[10px] space-y-1">
                                          <span className="font-bold opacity-80">Reference Files:</span>
                                          {msg.attachments.map((att: any, i: number) => (
                                            <p key={i} className="truncate opacity-90">
                                              📎 {att.name || `File ${i + 1}`}
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ============================================================ */
                  /* DEFAULT: ALL CLIENTS GRID VIEW                               */
                  /* ============================================================ */
                  <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative max-w-md">
                      <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search clients by name, email, or phone..."
                        value={clientSearchQuery}
                        onChange={(e) => setClientSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FFFDF9] border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
                      />
                    </div>

                    {clientsList.length === 0 ? (
                      <div className="p-12 text-center text-xs text-[#64748B] bg-[#FFFDF9] rounded-2xl border border-[#E5E1D8] space-y-2">
                        <Users className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50" />
                        <p className="font-semibold text-sm text-[#171717]">No authentic clients found</p>
                        <p>Genuine customer orders and AI chatbot inquiries will appear here automatically.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                        {clientsList.map((client) => (
                          <div
                            key={client.key}
                            className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-warm space-y-4 hover:border-[#A98B57]/60 transition-all flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <Avatar name={client.name} size="md" status="online" />
                                  <div className="min-w-0">
                                    <h3 className="font-serif font-bold text-sm text-[#171717] truncate">{client.name}</h3>
                                    <p className="text-xs text-[#64748B] truncate">{client.email}</p>
                                    {client.phone && <p className="text-[11px] text-[#A98B57]">{client.phone}</p>}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF9F5] border border-[#E5E1D8] text-[#5C3A1E]">
                                    {client.orders.length} order{client.orders.length !== 1 ? "s" : ""}
                                  </span>
                                  {client.chatMessages.length > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                      {client.chatMessages.length} AI chats
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-1.5 text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="text-[#64748B] text-[10px]">Lifetime Value (LTV):</span>
                                  <span className="font-serif font-bold text-sm text-[#5C3A1E]">
                                    ₹{client.totalLtv.toLocaleString("en-IN")}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="text-[#64748B]">Recent Service:</span>
                                  <span className="font-medium text-[#171717] truncate max-w-[130px]">
                                    {client.latestPackage}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-[#64748B]">
                                  <span>Status:</span>
                                  <Badge variant={getStatusBadgeVariant(client.latestStatus)} size="sm">
                                    {client.latestStatus.replace("_", " ")}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 pt-3 border-t border-[#E5E1D8]">
                              <button
                                type="button"
                                onClick={() => setSelectedClientDropdownKey(client.key)}
                                className="w-full py-2 px-3 rounded-xl bg-[#171717] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#262626] transition-colors cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-[#A98B57]" />
                                <span>Inspect Orders &amp; AI Chats</span>
                              </button>

                              <div className="grid grid-cols-2 gap-2">
                                <a
                                  href={`mailto:${client.email}`}
                                  className="py-1.5 px-3 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#5C3A1E] flex items-center justify-center gap-1.5 hover:bg-[#F0ECE1] transition-colors"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>Email</span>
                                </a>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSearchQuery(client.email);
                                    switchTab("orders");
                                  }}
                                  className="py-1.5 px-3 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#5C3A1E] flex items-center justify-center gap-1.5 hover:bg-[#F0ECE1] transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3 h-3 text-[#A98B57]" />
                                  <span>Orders Ledger</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 5: STUDIO & PAYMENT SETTINGS */}
            {/* ============================================================ */}
            {activeTab === "settings" && (
              <div className="space-y-6 bg-[#FFFDF9] p-6 rounded-3xl border border-[#E5E1D8] shadow-warm">
                <div className="pb-3 border-b border-[#E5E1D8]">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#A98B57]" />
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171717]">
                      Studio &amp; Payment Settings
                    </h1>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1">
                    Manage direct UPI payment credentials, administrator email notifications, and automated pipeline webhooks.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-[#171717]">Direct Merchant UPI VPA ID (For Instant Client Checkout):</label>
                    <input
                      type="text"
                      value={cmsData?.payment?.upiVpa || "yashjoshi7355@okaxis"}
                      onChange={(e) => updateCmsField("payment", "upiVpa", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs font-mono font-bold text-[#2E7D4F]"
                    />
                    <p className="text-[11px] text-[#64748B]">
                      This UPI VPA is embedded into the QR codes generated for every client order.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#171717]">Merchant / Payee Name:</label>
                    <input
                      type="text"
                      value={cmsData?.payment?.merchantName || "Sutra Studio / Yash Joshi"}
                      onChange={(e) => updateCmsField("payment", "merchantName", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#171717]">Account Holder Name:</label>
                    <input
                      type="text"
                      value={cmsData?.payment?.accountHolder || "Yash Joshi"}
                      onChange={(e) => updateCmsField("payment", "accountHolder", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717]"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] md:col-span-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-[#171717]">Local n8n Workflow Dispatch Engine</span>
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      When you verify a payment and click &quot;Dispatch to n8n&quot;, the system dispatches an automated webhook to the local engine to trigger 4K rendering and Google Drive vault upload.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E1D8] flex items-center justify-between">
                  <span className="text-xs text-[#64748B]">Save configuration to live Firestore database</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveCms}
                    isLoading={isCmsSaving}
                    leftIcon={<Save className="w-3.5 h-3.5" />}
                  >
                    Save Studio Settings
                  </Button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* INSPECTION & DISPATCH MODAL */}
            {/* ============================================================ */}
            {inspectingOrder && (
              <Modal
                isOpen={!!inspectingOrder}
                onClose={() => setInspectingOrder(null)}
                title="Order Verification &amp; Studio Generation"
                description={`Order #${inspectingOrder.orderNumber || inspectingOrder.code || inspectingOrder.id.slice(0, 10)}`}
                maxWidth="lg"
              >
                <div className="space-y-4">
                  {/* Client & Financial Details Card */}
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">Channel Source:</span>
                      <div>
                        {renderChannelBadge(
                          inspectingOrder.source,
                          Boolean(inspectingOrder.isDraft || inspectingOrder.status === "draft")
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">Client Name:</span>
                      <span className="font-semibold text-[#171717]">{inspectingOrder.clientName}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">Email Address:</span>
                      <span className="font-mono text-[#171717]">{inspectingOrder.clientEmail}</span>
                    </div>

                    {inspectingOrder.clientPhone && (
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B]">Phone / WhatsApp:</span>
                        <span className="font-mono text-[#171717]">{inspectingOrder.clientPhone}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-[#E5E1D8]/60">
                      <span className="text-[#64748B]">Service / Package:</span>
                      <span className="font-semibold text-[#171717]">
                        {inspectingOrder.packageName || inspectingOrder.service || "Creative Package"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">Total Amount:</span>
                      <span className="font-serif font-bold text-base text-[#5C3A1E]">
                        ₹{(inspectingOrder.totalAmount || inspectingOrder.amountPaid || 3499).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* UPI Verification Box */}
                  <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs">
                        <DollarSign className="w-4 h-4 text-amber-700" />
                        <span>UPI Payment Proof Verification</span>
                      </div>
                      {inspectingOrder.utrNumber && (
                        <button
                          type="button"
                          onClick={() => copyUtr(inspectingOrder.utrNumber!)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 text-[11px] font-semibold flex items-center gap-1 hover:bg-amber-100 transition-colors cursor-pointer"
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
                                <span className="text-[11px] text-[#64748B] shrink-0">
                                  {item.fileSize || "4K Master"}
                                </span>
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

                    {inspectingOrder.status !== "in_production" &&
                    inspectingOrder.status !== "completed" &&
                    inspectingOrder.status !== "cancelled" ? (
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
      </div>
    </RouteGuard>
  );
}
