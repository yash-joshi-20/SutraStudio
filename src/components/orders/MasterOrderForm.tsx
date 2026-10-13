"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { PaymentModal } from "@/components/checkout/PaymentModal";
import { DynamicUPIQRCode } from "@/components/checkout/DynamicUPIQRCode";
import {
  PER_PROJECT_TIERS,
  MONTHLY_RETAINER_TIERS,
  STUDIO_PAYMENT_CONFIG,
  formatCurrencyINR,
} from "@/config/pricing";
import { findServiceBySlug, type CanonicalServiceItem } from "@/config/services";
import { findPackageById } from "@/config/packages";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  FileText,
  Upload,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  CreditCard,
  QrCode,
  ShieldCheck,
  Check,
  HelpCircle,
  Link as LinkIcon,
  Video,
  Box,
  Compass,
  Monitor,
  ShoppingBag,
  Palette,
  Camera,
  Share2,
  MessageCircle,
  Zap,
  Minus,
  Plus,
} from "lucide-react";

export interface MasterOrderFormProps {
  initialServiceId?: string;
  initialTierId?: string;
  /** Quantity deep-linked from /orders?...&qty=N (server-validated 1–100). */
  initialQty?: number;
  onOrderSuccess?: (order: any) => void;
  className?: string;
}

export interface IntakeServiceOption {
  id: string;
  title: string;
  category: "3D & Spatial" | "Video & Motion" | "Social & Ads" | "Creative & Brand" | "Digital" | "Automation";
  basePrice: number;
  turnaround: string;
  description: string;
  iconName: string;
}

export interface IntakePackageOption {
  id: string;
  title: string;
  billingCycle: "monthly" | "one_time";
  price: number;
  turnaround: string;
  description: string;
  features: string[];
  popular?: boolean;
  iconName: string;
}

/**
 * Package/retainer catalog options. The visible price of every option is
 * resolved from the canonical catalog (`@/config/packages`) at module load —
 * this file never states a price of its own.
 */
const INTAKE_PACKAGES_SOURCE: Omit<IntakePackageOption, "price">[] = [
  {
    id: "daily-trend-creator",
    title: "Daily Trend Creator (Flagship)",
    billingCycle: "monthly",
    turnaround: "Daily Active Pipeline",
    popular: true,
    description: "Flagship 30-day production pipeline: 30 custom visual graphics + 30 commercial short videos (1 delivered daily) with daily trend research, QA, and Google Drive vault delivery.",
    iconName: "zap",
    features: [
      "30 Custom Visual Graphics (1 Delivered Daily)",
      "30 Commercial Video Reels / Shorts (1 Delivered Daily)",
      "Daily Trend Research & Brand Alignment",
      "Brand-Specific Prompt Architecture",
      "Editorial Captions & Strategic Hashtags",
      "Organized Google Drive Vault Staging",
      "1 Consolidated Revision Round per Deliverable",
    ],
  },
  {
    id: "growth-trend",
    title: "Growth Trend",
    billingCycle: "monthly",
    turnaround: "Priority Milestones",
    description: "High-velocity 30-day atelier delivering 20 branded images + 20 commercial short videos with 30-day content calendar.",
    iconName: "layers",
    features: [
      "20 Branded Social & Product Images across 30 days",
      "20 Commercial Short Videos / Reels (15–30s)",
      "Daily Trending-Topic Research & Alignment",
      "30-Day Strategic Editorial Content Calendar",
      "High-Converting Captions, Hooks & Hashtags",
      "Organized Google Drive Vault Archive",
      "1 Consolidated Revision Round per Deliverable",
    ],
  },
  {
    id: "starter-trend",
    title: "Starter Trend",
    billingCycle: "monthly",
    turnaround: "Scheduled Milestones",
    description: "Essential monthly creative engine: 15 branded images + 15 short videos across 30 days for boutique brands.",
    iconName: "sparkles",
    features: [
      "15 Branded Social & Product Images across 30 days",
      "15 Commercial Short Videos / Reels (up to 15s)",
      "Trend Topic Research & Brand Relevance Review",
      "Tailored Generation Prompts",
      "Post Captions & Hashtag Sets",
      "Google Drive Vault Delivery",
      "1 Consolidated Revision Round per Deliverable",
    ],
  },
  {
    id: "branded-image-pack-5",
    title: "Branded Image Pack (5 Images)",
    billingCycle: "one_time",
    turnaround: "Project Milestone",
    description: "Curated 5-image campaign bundle with brand color grading and commercial licensing.",
    iconName: "sparkles",
    features: [
      "5x High-Resolution Branded Images",
      "Custom Brand Typography & Color Palette",
      "1 Consolidated Revision Round Across Pack",
      "Full Commercial Copyright License",
    ],
  },
  {
    id: "promotional-reels-pack-3",
    title: "Promotional Reels Pack (3 Reels)",
    billingCycle: "one_time",
    turnaround: "Project Milestone",
    description: "3 commercial promo reels with kinetic motion graphics, sound design, and vertical 9:16 master exports.",
    iconName: "video",
    features: [
      "3x 15–30s Commercial Promo Reels",
      "Kinetic Text & Sound Effects",
      "Multi-Ratio Ad Formats (9:16 Vertical)",
      "1 Consolidated Revision Round Across Pack",
    ],
  },
  {
    id: "social-carousel-5-slides",
    title: "Social Carousel Pack (5 Slides)",
    billingCycle: "one_time",
    turnaround: "Project Milestone",
    description: "Seamless 5-slide educational or product storytelling carousel for Instagram & LinkedIn.",
    iconName: "layers",
    features: [
      "5 Seamless Storytelling Slide Cards",
      "Educational Framework & Headline Hooks",
      "1 Consolidated Revision Round",
      "1080×1350 High-Res Master Exports",
    ],
  },
  {
    id: "pkg-branding-logo-bundle",
    title: "Branding & Logo Identity Bundle",
    billingCycle: "one_time",
    turnaround: "5-7 Days",
    description: "Complete visual identity system: Custom logo mark, typography hierarchy, brand color palette, and business stationery kit.",
    iconName: "palette",
    features: [
      "3 Bespoke Logo Concepts + Final Master Vector Export",
      "Comprehensive Brand Guidelines & Color Harmonies",
      "Typography Scale & Font Pairing Spec",
      "Business Stationery Kit (Business Card & Letterhead)",
      "Full Commercial Copyright License & Transfer",
    ],
  },
  {
    id: "pkg-digital-marketing-bundle",
    title: "Digital Marketing & Growth Bundle",
    billingCycle: "one_time",
    turnaround: "48-72h",
    description: "End-to-end performance marketing launch pack: high-converting Meta ad creatives, targeted copywriting hooks, and audience segmentation architecture.",
    iconName: "share",
    features: [
      "5x High-Converting Meta/Instagram Ad Creatives",
      "Persuasive Ad Copywriting & Hook Variations",
      "Audience Targeting & Campaign Structure Guide",
      "A/B Creative Test Matrix",
      "1 Consolidated Revision Round",
    ],
  },
  {
    id: "pkg-real-estate-viz-bundle",
    title: "Real Estate & Spatial Viz Bundle",
    billingCycle: "one_time",
    turnaround: "5-7 Days",
    description: "Luxury spatial showcase: 3 photorealistic interior renders, 1 interactive 360° virtual tour panorama, and lighting staging.",
    iconName: "building",
    features: [
      "3x Photorealistic 4K Interior Renders",
      "1x Interactive 360° Panorama Virtual Tour",
      "Day & Night Architectural Lighting Staging",
      "High-Resolution Print & Web Master Exports",
      "1 Consolidated Revision Round",
    ],
  },
  {
    id: "pkg-business-web-launch-bundle",
    title: "Business Web & Launch Bundle",
    billingCycle: "one_time",
    turnaround: "7-10 Days",
    description: "Complete digital flagship: High-performance Next.js responsive website, SEO optimization, lead intake forms, and cloud deployment.",
    iconName: "monitor",
    features: [
      "Modern 5-Page Responsive Web Application (Next.js)",
      "High-Conversion Lead Capture & Contact Ingestion",
      "Full Mobile & Desktop Responsive Optimization",
      "Core Web Vitals & Technical SEO Architecture",
      "Vercel Cloud Deployment & Domain DNS Link",
    ],
  },
];

/** Canonical prices — single source of truth (this file holds no local price copy). */
export const INTAKE_PACKAGES: IntakePackageOption[] = INTAKE_PACKAGES_SOURCE.flatMap((pkg) => {
  const canonical = findPackageById(pkg.id);
  if (!canonical || canonical.active === false) return [];
  return [{ ...pkg, price: canonical.numericPrice }];
});

/**
 * Service options offered by the intake picker. Titles, descriptions,
 * turnaround and price are all resolved from the canonical catalog.
 */
const INTAKE_SERVICE_SOURCES: Array<{
  canonicalId: string;
  category: IntakeServiceOption["category"];
  iconName: string;
}> = [
  { canonicalId: "img-creation", category: "Creative & Brand", iconName: "camera" },
  { canonicalId: "vid-creation", category: "Video & Motion", iconName: "video" },
  { canonicalId: "des-logo-design", category: "Creative & Brand", iconName: "palette" },
  { canonicalId: "des-brand-identity-starter", category: "Creative & Brand", iconName: "palette" },
  { canonicalId: "3d-modeling", category: "3D & Spatial", iconName: "box" },
  { canonicalId: "360-view", category: "3D & Spatial", iconName: "compass" },
  { canonicalId: "interior-design", category: "3D & Spatial", iconName: "building" },
  { canonicalId: "meta-ads", category: "Social & Ads", iconName: "share" },
  { canonicalId: "website-development", category: "Digital", iconName: "monitor" },
];

export const INTAKE_SERVICES: IntakeServiceOption[] = INTAKE_SERVICE_SOURCES.flatMap((src) => {
  const canonical = findServiceBySlug(src.canonicalId);
  if (!canonical || canonical.active === false) return [];
  return [
    {
      id: canonical.id,
      title: canonical.name,
      category: src.category,
      basePrice: canonical.numericPrice,
      turnaround: canonical.turnaround || "Project-Based Delivery",
      description: canonical.description,
      iconName: src.iconName,
    },
  ];
});

/** Historical intake / deep-link IDs → canonical catalog IDs. */
const LEGACY_INTAKE_TO_CANONICAL: Record<string, string> = {
  "logo-design": "des-logo-design",
  "des-logo-design": "des-logo-design",
  "branding-logo-bundle": "pkg-branding-logo-bundle",
  "digital-marketing-bundle": "pkg-digital-marketing-bundle",
  "real-estate-viz-bundle": "pkg-real-estate-viz-bundle",
  "business-web-launch-bundle": "pkg-business-web-launch-bundle",
  "des-brand-identity": "des-brand-identity-starter",
  "3d-spatial": "3d-modeling",
  "tour-360": "360-view",
  "arch-viz": "interior-design",
  "mkt-growth": "meta-ads",
  "web-development": "website-development",
  "meta-ad-bundles": "meta-ads",
  "social-micro-reels": "vid-creation",
  "arch-3d": "interior-design",
  "interior-staging": "interior-design",
  "virtual-tour-360": "360-view",
  "product-3d-cgi": "3d-modeling",
  "custom-web-digital": "website-development",
  "mobile-app-dev": "website-development",
};

/** Historical deep-link prefixes → nearest canonical discipline. */
const LEGACY_PREFIX_TO_CANONICAL: Array<[RegExp, string]> = [
  [/^(img|image|visuals)/, "img-creation"],
  [/^(vid|video)/, "vid-creation"],
  [/^(des|brand)/, "des-brand-identity-starter"],
  [/^3d/, "3d-modeling"],
  [/^(tour|360)/, "360-view"],
  [/^(arch|interior|window)/, "interior-design"],
  [/^(mkt|meta|market|digital)/, "meta-ads"],
  [/^(dev|web|mobile|ecom|shop)/, "website-development"],
];

/** Canonical service category → intake picker category label. */
const CATEGORY_BY_CANONICAL: Partial<
  Record<CanonicalServiceItem["category"], IntakeServiceOption["category"]>
> = {
  Image: "Creative & Brand",
  Design: "Creative & Brand",
  Creative: "Creative & Brand",
  Video: "Video & Motion",
  "3D & Spatial": "3D & Spatial",
  Marketing: "Social & Ads",
  Development: "Digital",
  Automation: "Automation",
};

export function MasterOrderForm({
  initialServiceId,
  initialTierId,
  initialQty,
  onOrderSuccess,
  className = "",
}: MasterOrderFormProps) {
  // Navigation Steps: 1: Service & Tier, 2: Client & Brand Info, 3: Service Parameters, 4: Review & Payment
  const [currentStep, setCurrentStep] = useState(1);

  // If user navigated for packages/retainer or package query, default to packages
  const isPackagesPreferred =
    initialServiceId === "monthly-retainer" ||
    initialServiceId === "daily-trend-creator" ||
    initialServiceId === "growth-trend" ||
    initialServiceId === "starter-trend" ||
    Boolean(initialTierId);

  // Step 1: Mode Switcher & Selection
  const [orderMode, setOrderMode] = useState<"services" | "packages">(
    isPackagesPreferred ? "packages" : "services"
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => {
    if (!initialServiceId) return "img-creation";
    const clean = initialServiceId.toLowerCase().trim();

    // 1. Canonical catalog slug/ID or alias — resolves to the canonical item so
    //    the price shown in the form equals the server-validated price.
    const canonical = findServiceBySlug(clean);
    if (canonical && canonical.active !== false) return canonical.id;

    // 2. Historical intake IDs → canonical equivalents.
    const mapped = LEGACY_INTAKE_TO_CANONICAL[clean];
    if (mapped) return mapped;

    // 3. Historical deep-link prefixes → nearest canonical discipline.
    for (const [pattern, target] of LEGACY_PREFIX_TO_CANONICAL) {
      if (pattern.test(clean)) return target;
    }

    // 4. Unparseable input falls back to the base discipline so the form and
    //    the server still agree on what is being ordered.
    return "img-creation";
  });
  const [selectedPackageId, setSelectedPackageId] = useState<string>(() => {
    if (!initialTierId && !initialServiceId) return "daily-trend-creator";
    const clean = (initialTierId || initialServiceId || "").toLowerCase().trim();
    if (clean === "daily-trend-creator" || clean === "scale" || clean === "autonomous-growth-retainer") return "daily-trend-creator";
    if (clean === "growth-trend" || clean === "growth" || clean === "studio-growth") return "growth-trend";
    if (clean === "starter-trend" || clean === "starter" || clean === "studio-starter") return "starter-trend";
    const found = INTAKE_PACKAGES.find((p) => p.id === clean);
    return found ? found.id : "daily-trend-creator";
  });
  const [selectedTierId, setSelectedTierId] = useState<string>(() => {
    return initialTierId || "daily-trend-creator";
  });

  // Quantity for per-unit / pack service orders (validated server-side 1–100)
  const [quantity, setQuantity] = useState<number>(() => {
    const parsed = Number(initialQty);
    return Number.isFinite(parsed) && parsed >= 1 ? Math.min(100, Math.floor(parsed)) : 1;
  });

  // Direct UPI UTR Input
  const [utrNumber, setUtrNumber] = useState("");

  // Step 2: Universal Base Inputs
  const [fullName, setFullName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("+91 ");
  const [industry, setIndustry] = useState("Real Estate");
  const [brandUrl, setBrandUrl] = useState("");
  const [brandAssetUrl, setBrandAssetUrl] = useState("");
  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
  const [brandLogoPreview, setBrandLogoPreview] = useState<string>("");
  const [targetDeadline, setTargetDeadline] = useState("");
  const [creativeBrief, setCreativeBrief] = useState("");

  // Step 3: Conditional Sub-Form Inputs
  // 3a. Meta Ads Launcher & Digital Marketing
  const [metaTargetGeo, setMetaTargetGeo] = useState("All India");
  const [metaAudienceDemographics, setMetaAudienceDemographics] = useState("25-45, HNI & Urban Professionals");
  const [metaDestinationUrl, setMetaDestinationUrl] = useState("");
  const [metaOfferCopy, setMetaOfferCopy] = useState("Flat 20% Off Launch Privilege");
  const [metaDailyBudget, setMetaDailyBudget] = useState("1500");
  const [metaPartnerId, setMetaPartnerId] = useState("");
  const [metaAspectRatios, setMetaAspectRatios] = useState<string[]>([
    "9:16 (Stories/Reels)",
    "1:1 (Feed)",
  ]);
  const [metaCta, setMetaCta] = useState("Shop Now");
  const [metaTargetRoas, setMetaTargetRoas] = useState("");

  // 3b. 3D Modeling, 360 View & Interior/Window Design
  const [spatialReferenceUrls, setSpatialReferenceUrls] = useState("");
  const [spatialDimensions, setSpatialDimensions] = useState("");
  const [cadFileUrl, setCadFileUrl] = useState("");
  const [squareFootage, setSquareFootage] = useState("");
  const [lightingPref, setLightingPref] = useState("Warm Daylight Golden Hour");
  const [outputResolution, setOutputResolution] = useState("4K UHD (3840x2160)");

  // 3c. Web & App Dev
  const [webDomainStatus, setWebDomainStatus] = useState("Own Domain (Configured)");
  const [webBenchmarkUrls, setWebBenchmarkUrls] = useState("");
  const [techStack, setTechStack] = useState("Next.js + Tailwind CSS");
  const [pageCount, setPageCount] = useState("1-3 Landing Pages");
  const [figmaUrl, setFigmaUrl] = useState("");

  // 3d. Monthly Retainer (30-Day Engine)
  const [retainerGoals, setRetainerGoals] = useState("Direct Sales & Brand Awareness");
  const [retainerPriorityProducts, setRetainerPriorityProducts] = useState("");
  const [retainerFocus, setRetainerFocus] = useState(
    "Omnichannel Growth (Social Reels + 3D Renders)"
  );
  const [retainerStartDate, setRetainerStartDate] = useState("");
  const [dedicatedSlackChannel, setDedicatedSlackChannel] = useState(true);

  // Step 4: Submission & Payment States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [formError, setFormError] = useState("");

  // Active Package & Service Details
  const activePackage =
    INTAKE_PACKAGES.find((p) => p.id === selectedPackageId) || INTAKE_PACKAGES[0];

  /** Canonical catalog item behind the current service selection (if any). */
  const activeCanonical = findServiceBySlug(selectedServiceId);

  const activeService = React.useMemo<IntakeServiceOption>(() => {
    const intakeMatch = INTAKE_SERVICES.find((s) => s.id === selectedServiceId);
    if (intakeMatch) return intakeMatch;
    // Deep-linked canonical service (e.g. /orders?service=branded-image-pack-5):
    // render and price it straight from the canonical catalog.
    const canonical = findServiceBySlug(selectedServiceId);
    if (canonical && canonical.active !== false) {
      return {
        id: canonical.id,
        title: canonical.name,
        category: CATEGORY_BY_CANONICAL[canonical.category] ?? "Creative & Brand",
        basePrice: canonical.numericPrice,
        turnaround: canonical.turnaround || "Project-Based Delivery",
        description: canonical.description,
        iconName: "sparkles",
      };
    }
    return INTAKE_SERVICES[0];
  }, [selectedServiceId]);

  const isMonthlyRetainer =
    orderMode === "packages"
      ? activePackage.billingCycle === "monthly"
      : selectedTierId === "retainer";
  const isMetaAds =
    activeService.id === "meta-ads" ||
    activeService.id === "meta-ads-management" ||
    activeService.id === "digital-marketing" ||
    activeService.id === "mkt-growth" ||
    activeService.id === "meta-ad-bundles" ||
    activeService.id === "social-micro-reels";
  const isSpatialOr3D =
    activeCanonical?.category === "3D & Spatial" ||
    activeService.id === "3d-spatial" ||
    activeService.id === "tour-360" ||
    activeService.id === "arch-viz" ||
    activeService.id === "arch-3d" ||
    activeService.id === "interior-staging" ||
    activeService.id === "virtual-tour-360" ||
    activeService.id === "product-3d-cgi";
  const isWebDev =
    activeCanonical?.category === "Development" ||
    activeService.id === "web-development" ||
    activeService.id === "custom-web-digital" ||
    activeService.id === "mobile-app-dev";

  // Standard checkout is active across all services and packages
  const isBespokeService = false;

  // Calculate Order Amount — always canonical price × quantity (server re-validates)
  const orderAmount = React.useMemo(() => {
    if (orderMode === "packages") {
      // Monthly retainers are single subscriptions; one-time packs multiply by quantity.
      return activePackage.billingCycle === "monthly"
        ? activePackage.price
        : activePackage.price * Math.max(1, quantity);
    }
    return activeService.basePrice * Math.max(1, quantity);
  }, [orderMode, activePackage, activeService, quantity]);

  // Validation before proceeding
  const handleNextStep = () => {
    setFormError("");
    if (currentStep === 2) {
      if (!fullName.trim()) {
        setFormError("Full Name is required");
        return;
      }
      if (!brandName.trim()) {
        setFormError("Business / Brand Name is required");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setFormError("Valid Email Address is required");
        return;
      }
      if (!whatsapp.trim() || whatsapp.length < 8) {
        setFormError("WhatsApp contact number is required");
        return;
      }
      if (!creativeBrief.trim()) {
        setFormError("Please enter creative notes or brief requirements");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  // Submit Order & Launch Checkout
  const handleFinalSubmit = async (paymentChoice: "upi_qr" | "online") => {
    setIsSubmitting(true);
    setFormError("");

    const hasUtr = Boolean(utrNumber.trim());
    const paymentStatus = hasUtr ? "pending_verification" : "pending";
    const resolvedTitle = orderMode === "packages" ? activePackage.title : activeService.title;
    // The server resolves `package.tierId` first — it must point at exactly the
    // item being purchased (canonical service ID or canonical package ID).
    const resolvedTierId = orderMode === "packages" ? activePackage.id : activeService.id;
    const canonicalServiceId = orderMode === "packages" ? activePackage.id : activeService.id;

    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const orderPayload = {
      orderId: `ord_${Date.now()}`,
      idempotencyKey,
      sourceChannel: "direct_order" as const,
      client: {
        name: fullName.trim(),
        email: email.trim(),
        phone: whatsapp.trim(),
        brandName: brandName.trim(),
      },
      package: {
        tierId: resolvedTierId,
        name: resolvedTitle,
        price: orderAmount,
        billingCycle: isMonthlyRetainer ? ("monthly" as const) : ("project" as const),
      },
      quantity: orderMode === "packages"
        ? (activePackage.billingCycle === "monthly" ? 1 : Math.max(1, quantity))
        : Math.max(1, quantity),
      serviceDetails: {
        orderMode,
        ...(orderMode === "packages" && {
          packageFeatures: activePackage.features,
        }),
        ...(isMetaAds && {
          metaAds: {
            targetGeo: metaTargetGeo || "All India",
            destinationUrl: metaDestinationUrl || brandUrl || "https://sutrastudios.in",
            offer: metaOfferCopy || "Flat 20% Off Launch Offer",
            dailyBudget: Number(metaDailyBudget) || 1500,
            audience: metaAudienceDemographics,
            partnerId: metaPartnerId,
          },
        }),
        ...(isSpatialOr3D && {
          spatial3D: {
            referenceAssetUrls: [
              spatialReferenceUrls,
              cadFileUrl,
              brandAssetUrl,
            ].filter(Boolean),
            dimensions: spatialDimensions || squareFootage || "Studio scale as specified",
          },
        }),
        ...(isWebDev && {
          webApp: {
            domainStatus: webDomainStatus,
            benchmarkUrls: webBenchmarkUrls
              .split("\n")
              .map((u) => u.trim())
              .filter(Boolean),
          },
        }),
        ...(isMonthlyRetainer && {
          monthlyEngine: {
            goals: retainerGoals || retainerFocus,
            priorityProducts: retainerPriorityProducts || "Core Studio Offerings",
          },
        }),
      },
      payment: {
        method: paymentChoice === "upi_qr" ? ("UPI_GPAY" as const) : ("INVOICE" as const),
        payee: "Yash Joshi" as const,
        upiId: "yashjoshi7355-1@okicici" as const,
        utr: utrNumber.trim() || undefined,
        status: paymentStatus,
      },
      createdAt: new Date().toISOString(),

      // Backward compatible flat fields:
      source: "direct_order",
      clientName: fullName.trim(),
      clientEmail: email.trim(),
      clientPhone: whatsapp.trim(),
      brandName: brandName.trim(),
      industry,
      brandUrl: brandUrl.trim(),
      serviceId: orderMode === "packages" ? activePackage.id : activeService.id,
      serviceTitle: resolvedTitle,
      tierId: resolvedTierId,
      amount: orderAmount,
      totalAmount: orderAmount,
      billingType: isMonthlyRetainer ? "monthly_retainer" : "per_project",
      targetDeadline,
      creativeBrief: creativeBrief.trim(),
      brandAssetUrl: brandLogoPreview || brandAssetUrl.trim(),
      paymentMethod: paymentChoice === "upi_qr" ? "UPI_GPAY" : "invoice",
      paymentStatus,
      utrNumber: utrNumber.trim() || undefined,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to submit order. Please check inputs.");
        return;
      }

      const generatedOrder = data.order || {
        id: data.orderId || `ord_${Date.now()}`,
        code: data.orderCode || `STR-${Math.floor(1000 + Math.random() * 9000)}`,
        title: resolvedTitle,
        totalAmount: data.totalAmount || orderAmount,
      };

      setCreatedOrder(generatedOrder);

      if (onOrderSuccess) {
        onOrderSuccess(generatedOrder);
      }
    } catch (err: any) {
      setFormError("Could not submit order: " + (err.message || "Network issue"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-sm overflow-hidden ${className}`}>
      {/* Top Stepper Header */}
      <div className="p-6 sm:p-8 bg-[#FAF9F5] border-b border-[#EADFCB]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-[10px] font-bold text-[#5C3A1E] uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
              <span>Studio Commission Intake</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A]">
              Commission a Creative Project
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Select your service, configure creative parameters, and initiate production.
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  currentStep === stepNum
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : currentStep > stepNum
                    ? "bg-[#2E7D4F] text-white"
                    : "bg-[#F4EFE6] text-[#94A3B8]"
                }`}
              >
                {currentStep > stepNum ? <Check className="w-4 h-4 stroke-[2.5]" /> : stepNum}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {formError && (
          <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* =========================================================
            STEP 1: SELECT SERVICE & TIER
            ========================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Mode Switcher: Services vs Packages */}
            <div className="flex p-1.5 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] max-w-md mx-auto shadow-2xs">
              <button
                type="button"
                onClick={() => setOrderMode("services")}
                className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  orderMode === "services"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                <span>7 Studio Services</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderMode("packages")}
                className={`flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  orderMode === "packages"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#D4A35A]" />
                <span>Creative Packages & Retainers</span>
              </button>
            </div>

            {orderMode === "services" ? (
              <>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#0F172A] mb-1">
                    1. Select Studio Service (8 Disciplines)
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Choose from 8 specialized creative technology & design disciplines with guaranteed SLAs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {INTAKE_SERVICES.map((srv) => {
                    const isSelected = selectedServiceId === srv.id;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => {
                          setSelectedServiceId(srv.id);
                          setQuantity(1);
                        }}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                          isSelected
                            ? "bg-[#5C3A1E] text-white border-[#5C3A1E] shadow-sm"
                            : "bg-[#FFFFFF] text-[#0F172A] border-[#EADFCB] hover:border-[#D4A35A] hover:bg-[#FAF9F5]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-[#F8F5EF] text-[#64748B]"
                              }`}
                            >
                              {srv.category}
                            </span>
                            <span
                              className={`text-[11px] font-mono font-bold ${
                                isSelected ? "text-[#D4A35A]" : "text-[#5C3A1E]"
                              }`}
                            >
                              ₹{srv.basePrice.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-sm leading-snug">
                            {srv.title}
                          </h4>
                          <p
                            className={`text-xs mt-1 line-clamp-2 ${
                              isSelected ? "text-white/80" : "text-[#64748B]"
                            }`}
                          >
                            {srv.description}
                          </p>
                        </div>

                        <div
                          className={`text-[10px] font-mono pt-2 border-t ${
                            isSelected ? "border-white/20 text-white/70" : "border-[#EADFCB]/60 text-[#94A3B8]"
                          }`}
                        >
                          {srv.turnaround}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Service Selection Summary, Quantity & Live Total */}
                <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-serif font-bold text-sm text-[#0F172A] block">
                      {activeService.title}
                    </span>
                    <span className="text-xs text-[#64748B]">
                      {activeService.turnaround} • {formatCurrencyINR(activeService.basePrice)} per unit • Standard studio production workflow
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center gap-1 rounded-xl border border-[#EADFCB] bg-white p-1">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#4A3B22] hover:bg-[#F4EFE6] disabled:opacity-40"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold text-[#171717]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQuantity((q) => Math.min(100, q + 1))}
                        disabled={quantity >= 100}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#4A3B22] hover:bg-[#F4EFE6] disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                        {quantity > 1 ? `Total (×${quantity})` : "Total"}
                      </span>
                      <span className="font-serif font-bold text-lg text-[#5C3A1E]">
                        {formatCurrencyINR(orderAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#0F172A] mb-1">
                    1. Select Creative Package or Monthly Retainer
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Choose a multi-discipline creative pack or activate a 30-day continuous studio partnership.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {INTAKE_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => {
                          setSelectedPackageId(pkg.id);
                          setQuantity(1);
                        }}
                        className={`p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-4 relative ${
                          isSelected
                            ? "bg-[#FAF9F5] border-[#5C3A1E] ring-2 ring-[#5C3A1E] shadow-sm"
                            : "bg-[#FFFFFF] border-[#EADFCB] hover:border-[#D4A35A] hover:bg-[#FAF9F5]"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#F8F5EF] text-[#64748B]">
                              {pkg.billingCycle === "monthly" ? "Monthly Retainer" : "One-Time Pack"}
                            </span>
                            {pkg.popular && (
                              <span className="bg-[#D4A35A] text-[#0F172A] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                Most Popular
                              </span>
                            )}
                          </div>

                          <div className="flex justify-between items-baseline">
                            <h4 className="font-serif font-bold text-base text-[#0F172A]">
                              {pkg.title}
                            </h4>
                            <div className="text-right">
                              <span className="font-serif font-bold text-lg text-[#5C3A1E]">
                                ₹{pkg.price.toLocaleString("en-IN")}
                              </span>
                              {pkg.billingCycle === "monthly" && (
                                <span className="text-[10px] text-[#64748B] block">/ month</span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-[#64748B] leading-relaxed">
                            {pkg.description}
                          </p>

                          <ul className="space-y-1.5 pt-2 border-t border-[#EADFCB]/60 text-xs text-[#0F172A]">
                            {pkg.features.map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0 mt-0.5" />
                                <span className="text-[11px] text-[#334155]">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2 border-t border-[#EADFCB]/60 flex items-center justify-between text-[11px] font-mono text-[#78716C]">
                          <span>Turnaround SLA:</span>
                          <span className="font-semibold text-[#5C3A1E]">{pkg.turnaround}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* One-time pack quantity & live total (monthly retainers are single subscriptions) */}
                {activePackage.billingCycle !== "monthly" && (
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="font-serif font-bold text-sm text-[#0F172A] block">
                        {activePackage.title}
                      </span>
                      <span className="text-xs text-[#64748B]">
                        {formatCurrencyINR(activePackage.price)} per pack • {activePackage.turnaround}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="inline-flex items-center gap-1 rounded-xl border border-[#EADFCB] bg-white p-1">
                        <button
                          type="button"
                          aria-label="Decrease pack quantity"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          disabled={quantity <= 1}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#4A3B22] hover:bg-[#F4EFE6] disabled:opacity-40"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold text-[#171717]">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase pack quantity"
                          onClick={() => setQuantity((q) => Math.min(100, q + 1))}
                          disabled={quantity >= 100}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#4A3B22] hover:bg-[#F4EFE6] disabled:opacity-40"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                          {quantity > 1 ? `Total (×${quantity})` : "Total"}
                        </span>
                        <span className="font-serif font-bold text-lg text-[#5C3A1E]">
                          {formatCurrencyINR(orderAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleNextStep}
                withArrow
              >
                Continue to Brand Info
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 2: UNIVERSAL BASE FIELDS
            ========================================================= */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#0F172A] mb-1">
                2. Brand & Contact Information
              </h3>
              <p className="text-xs text-[#64748B]">
                Tell us about your brand so our creative directors can tailor the visual language.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Full Name / Point of Contact <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yash Joshi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Business / Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aura Noir Living"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. director@auranoir.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  WhatsApp Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 94280 00000"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Industry / Vertical
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                >
                  <option value="Real Estate">Real Estate & Architecture</option>
                  <option value="Luxury Retail">Luxury Retail & Jewelry</option>
                  <option value="Hospitality">Hospitality & Resorts</option>
                  <option value="Fashion">Fashion & Apparel</option>
                  <option value="Tech/SaaS">Tech & Modern SaaS</option>
                  <option value="E-Commerce">D2C & E-Commerce</option>
                  <option value="Other">Other Creative Discipline</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Website / Instagram Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. @auranoirliving or auranoir.com"
                  value={brandUrl}
                  onChange={(e) => setBrandUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 flex items-center justify-between">
                  <span>Brand Logo Upload (Vector SVG or Transparent PNG)</span>
                  <span className="text-[10px] text-[#A98B57] font-medium">SVG / Transparent PNG / Vector</span>
                </label>
                <div className="border border-dashed border-[#EADFCB] hover:border-[#D4A35A] bg-[#FFFDF9] rounded-2xl p-4 transition-all">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] hover:bg-[#F3EFE6] text-xs font-semibold text-[#0F172A] transition-all shrink-0">
                      <Upload className="w-4 h-4 text-[#A98B57]" />
                      <span>{brandLogoFile ? brandLogoFile.name : "Upload Logo Asset"}</span>
                      <input
                        type="file"
                        accept=".svg,.png,.ai,.eps,.pdf,image/svg+xml,image/png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setBrandLogoFile(file);
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setBrandLogoPreview(ev.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <span className="text-xs text-[#94A3B8]">or link:</span>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/... or Figma asset link"
                      value={brandAssetUrl}
                      onChange={(e) => setBrandAssetUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                    />
                  </div>
                  {brandLogoPreview && (
                    <div className="mt-3 flex items-center gap-3 p-2 bg-[#FAF9F5] rounded-xl border border-[#EADFCB]/60">
                      <div className="w-9 h-9 rounded-lg bg-white p-1 border border-[#EADFCB] flex items-center justify-center overflow-hidden">
                        <img src={brandLogoPreview} alt="Brand Logo Preview" className="max-w-full max-h-full object-contain" />
                      </div>
                      <span className="text-xs font-medium text-[#2E7D4F] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Logo verified for studio asset vault
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Target Launch / Delivery Date
                </label>
                <input
                  type="date"
                  value={targetDeadline}
                  onChange={(e) => setTargetDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Creative Brief & Requirements <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe project vision, desired mood, lighting, color palettes, key references, or special deliverables needed..."
                value={creativeBrief}
                onChange={(e) => setCreativeBrief(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleNextStep}
                withArrow
              >
                Service Parameters
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 3: CONDITIONAL SERVICE PARAMETERS
            ========================================================= */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#0F172A] mb-1">
                3. Technical & Creative Specifications
              </h3>
              <p className="text-xs text-[#64748B]">
                Configure parameters tailored specifically to <strong>{activeService.title}</strong>.
              </p>
            </div>

            {/* 1. Meta Ads Launcher & Digital Marketing Accordion */}
            {isMetaAds && (
              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5C3A1E] uppercase font-mono tracking-wider block">
                    Meta Ads Launcher & Digital Marketing
                  </span>
                  <span className="text-[10px] font-mono bg-[#EADFCB]/60 text-[#5C3A1E] px-2 py-0.5 rounded-full">
                    Campaign Setup
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Target Geo / Cities (or All India)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. All India, or Mumbai, Delhi NCR, Bangalore"
                      value={metaTargetGeo}
                      onChange={(e) => setMetaTargetGeo(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Target Audience Demographics & Age Bracket
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 25-45, HNI, Architecture & Luxury Buyers"
                      value={metaAudienceDemographics}
                      onChange={(e) => setMetaAudienceDemographics(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Destination URL (Landing Page or WhatsApp)
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://yourbrand.com/landing or https://wa.me/91..."
                      value={metaDestinationUrl}
                      onChange={(e) => setMetaDestinationUrl(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Core Promotional Offer / Angle
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 20% Off / Free Architecture Consultation"
                      value={metaOfferCopy}
                      onChange={(e) => setMetaOfferCopy(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Daily Ad Budget Allocation (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="1500"
                      value={metaDailyBudget}
                      onChange={(e) => setMetaDailyBudget(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                    <p className="text-[10px] text-[#94A3B8] mt-1">
                      * Disclaimed: Ad spend is paid directly to Meta via your connected ad account.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 flex items-center justify-between">
                      <span>Meta Business Manager / Partner ID</span>
                      <span className="text-[10px] text-[#94A3B8] font-normal" title="15-16 digit Meta BM ID">Optional</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 123456789012345 (15-16 digits)"
                      value={metaPartnerId}
                      onChange={(e) => setMetaPartnerId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                    <p className="text-[10px] text-[#64748B] mt-1">
                      Allows Sutra Studio partner access to deploy campaigns directly into your Ads Manager.
                    </p>
                  </div>

                  <div className="sm:col-span-2 pt-1 border-t border-[#EADFCB]/60">
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Target Ratios (Multi-select)
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {["9:16 (Stories/Reels)", "1:1 (Feed/Square)", "16:9 (Landscape)"].map((ratio) => {
                        const checked = metaAspectRatios.includes(ratio);
                        return (
                          <label
                            key={ratio}
                            className="flex items-center gap-2 text-xs text-[#0F172A] cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) {
                                  setMetaAspectRatios(metaAspectRatios.filter((r) => r !== ratio));
                                } else {
                                  setMetaAspectRatios([...metaAspectRatios, ratio]);
                                }
                              }}
                              className="rounded border-[#EADFCB] text-[#5C3A1E] focus:ring-[#D4A35A]"
                            />
                            <span>{ratio}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. 3D Modeling, 360 View & Interior/Window Design Accordion */}
            {isSpatialOr3D && (
              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-4">
                <span className="text-xs font-bold text-[#5C3A1E] uppercase font-mono tracking-wider block">
                  3D Modeling, 360 View & Interior/Spatial Design
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Multi-Angle Reference Photos OR Room Walkthrough Video Link
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. Google Drive / Dropbox link with Front, Side, Top photos or phone walkthrough video"
                      value={spatialReferenceUrls}
                      onChange={(e) => setSpatialReferenceUrls(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                    <p className="text-[10px] text-[#64748B] mt-1">
                      Include 3-angle product photos (Front, Side, Top) or an iPhone/Android walk-through of the space.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Dimensions / Space Scale Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2,400 sq.ft., ceiling 10.5ft, or product dimensions (H x W x D in cm)"
                      value={spatialDimensions}
                      onChange={(e) => setSpatialDimensions(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Floor Plan / CAD File Cloud Link (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. Drive link to .dwg / .dxf / .pdf"
                      value={cadFileUrl}
                      onChange={(e) => setCadFileUrl(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Lighting Atmosphere Preference
                    </label>
                    <select
                      value={lightingPref}
                      onChange={(e) => setLightingPref(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    >
                      <option value="Warm Daylight Golden Hour">Warm Daylight Golden Hour</option>
                      <option value="Moody Dusk / Twilight">Moody Dusk / Twilight</option>
                      <option value="Bright Architectural Clean">Bright Architectural Clean</option>
                      <option value="Dramatic Night Glow">Dramatic Night Luxury Glow</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Master Render Resolution
                    </label>
                    <select
                      value={outputResolution}
                      onChange={(e) => setOutputResolution(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    >
                      <option value="4K UHD (3840x2160)">4K UHD (3840 x 2160)</option>
                      <option value="8K Master (7680x4320)">8K Master Ultra-High Res</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Web & App Development Accordion */}
            {isWebDev && (
              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-4">
                <span className="text-xs font-bold text-[#5C3A1E] uppercase font-mono tracking-wider block">
                  Web & App Development Architecture
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Domain Status
                    </label>
                    <select
                      value={webDomainStatus}
                      onChange={(e) => setWebDomainStatus(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    >
                      <option value="Own Domain (Configured)">Own Domain (Already Configured & Active)</option>
                      <option value="Need Setup Assistance">Need Setup Assistance (Domain & DNS)</option>
                      <option value="Staging Deployment Only">Staging Subdomain Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Tech Stack Direction
                    </label>
                    <select
                      value={techStack}
                      onChange={(e) => setTechStack(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    >
                      <option value="Next.js + Tailwind CSS">Next.js App Router + Tailwind CSS</option>
                      <option value="React + Vite">React + Vite High-Speed SPA</option>
                      <option value="Webflow / Framer">Webflow / Framer Luxury CMS</option>
                      <option value="Bespoke Custom">Bespoke Custom WebGL Experience</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      2-3 Benchmark / Reference Website URLs
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g.&#10;https://apple.com&#10;https://stripe.com&#10;https://lincoln.com"
                      value={webBenchmarkUrls}
                      onChange={(e) => setWebBenchmarkUrls(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                    <p className="text-[10px] text-[#64748B] mt-1">
                      Paste 2 to 3 website links that represent the visual tone, interaction fidelity, or layout you admire.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Target Page Scope
                    </label>
                    <select
                      value={pageCount}
                      onChange={(e) => setPageCount(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    >
                      <option value="1-3 Landing Pages">1-3 High-Impact Landing Pages</option>
                      <option value="4-7 Pages Full Site">4-7 Pages Complete Studio Website</option>
                      <option value="8+ Pages Web App">8+ Pages Full Custom Application</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Figma UI / Design File Link (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://www.figma.com/design/..."
                      value={figmaUrl}
                      onChange={(e) => setFigmaUrl(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Monthly Retainer (30-Day Engine) Accordion */}
            {isMonthlyRetainer && (
              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-4">
                <span className="text-xs font-bold text-[#5C3A1E] uppercase font-mono tracking-wider block">
                  Monthly Retainer (30-Day Autonomous Engine)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Primary 30-Day Goals
                    </label>
                    <select
                      value={retainerGoals}
                      onChange={(e) => setRetainerGoals(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    >
                      <option value="Direct Sales & High ROAS Scaling">Direct Sales & High ROAS Scaling</option>
                      <option value="Brand Awareness & Luxury Authority">Brand Awareness & Luxury Authority</option>
                      <option value="Lead Generation & High-Ticket Inquiries">Lead Generation & High-Ticket Inquiries</option>
                      <option value="Omnichannel Content Blitz (Reels + 3D)">Omnichannel Content Blitz (Reels + 3D)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Preferred Retainer Start Date
                    </label>
                    <input
                      type="date"
                      value={retainerStartDate}
                      onChange={(e) => setRetainerStartDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Priority Products / Features to Highlight Throughout Month
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Specify your flagship products, hero collections, key service benefits, or seasonal offers to highlight..."
                      value={retainerPriorityProducts}
                      onChange={(e) => setRetainerPriorityProducts(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2.5 text-xs text-[#0F172A] pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dedicatedSlackChannel}
                    onChange={(e) => setDedicatedSlackChannel(e.target.checked)}
                    className="rounded border-[#EADFCB] text-[#5C3A1E] focus:ring-[#D4A35A]"
                  />
                  <span>Provision Dedicated VIP Slack / WhatsApp Concierge Channel</span>
                </label>
              </div>
            )}

            {!isMetaAds && !isSpatialOr3D && !isWebDev && !isMonthlyRetainer && (
              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#64748B]">
                Standard parameters configured for <strong>{activeService.title}</strong>. Output deliverables will be calibrated to 4K resolution and studio master grading.
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setCurrentStep(2)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleNextStep}
                withArrow
              >
                Review & Checkout
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 4: REVIEW & CHECKOUT
            ========================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {createdOrder ? (
              <div className="py-6 px-3 sm:px-6 text-center space-y-6 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-mono font-bold text-[#5C3A1E] uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                    <span>Commission Registered</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A]">
                    Order Placed Successfully!
                  </h3>
                  <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                    Your creative commission has been recorded. Our studio leads will review your specifications, assign resources, and initiate production.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] text-left max-w-md mx-auto space-y-2.5 text-xs shadow-2xs">
                  <div className="flex justify-between items-center text-[#64748B]">
                    <span>Order Code:</span>
                    <span className="font-mono font-bold text-sm text-[#0F172A]">
                      {createdOrder.code || createdOrder.orderNumber || createdOrder.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#64748B]">
                    <span>Service / Package:</span>
                    <span className="font-semibold text-[#0F172A]">
                      {createdOrder.title || (orderMode === "packages" ? activePackage.title : activeService.title)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#64748B]">
                    <span>Client & Brand:</span>
                    <span className="font-semibold text-[#0F172A]">
                      {fullName} ({brandName})
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#64748B]">
                    <span>Total Investment:</span>
                    <span className="font-serif font-bold text-[#5C3A1E]">
                      ₹{orderAmount.toLocaleString("en-IN")}
                      {isMonthlyRetainer && <span className="text-[10px] text-[#78716C] font-normal"> / month</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#64748B] pt-1 border-t border-[#EADFCB]">
                    <span>Status:</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                      {utrNumber.trim() ? "Payment Verification Pending" : "Queued for Studio Review"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      if (onOrderSuccess) onOrderSuccess(createdOrder);
                    }}
                    withArrow
                  >
                    View in My Orders
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#0F172A] mb-1">
                    4. Scope Review & Zero-Fee UPI Checkout
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Verify your commission summary, scan the dynamic UPI QR code, or place your order directly.
                  </p>
                </div>

                {/* Scope Summary Box */}
                <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[#EADFCB]">
                    <span className="text-[#64748B]">
                      {orderMode === "packages" ? "Selected Package:" : "Commission Service:"}
                    </span>
                    <span className="font-serif font-bold text-sm text-[#0F172A]">
                      {orderMode === "packages" ? activePackage.title : activeService.title}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Delivery SLA:</span>
                    <span className="font-semibold text-[#5C3A1E]">
                      {orderMode === "packages" ? activePackage.turnaround : activeService.turnaround}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Client & Brand:</span>
                    <span className="font-semibold text-[#0F172A]">
                      {fullName} ({brandName})
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">WhatsApp / Contact:</span>
                    <span className="font-mono text-[#0F172A]">{whatsapp}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[#EADFCB]">
                    <span className="font-semibold text-[#0F172A]">Total Investment:</span>
                    <span className="font-serif font-bold text-xl text-[#5C3A1E]">
                      ₹{orderAmount.toLocaleString("en-IN")}
                      {isMonthlyRetainer && <span className="text-xs font-normal text-[#64748B]"> / month</span>}
                    </span>
                  </div>
                </div>

                {/* Direct UPI Payment & Order Placement Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4A35A] space-y-5 text-center">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-mono font-bold text-[#5C3A1E] uppercase">
                      <QrCode className="w-3.5 h-3.5 text-[#D4A35A]" />
                      <span>Zero-Fee Dynamic UPI QR</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#0F172A]">
                      Instant QR Checkout or Direct Placement
                    </h4>
                    <p className="text-xs text-[#64748B] max-w-md mx-auto">
                      Scan with Google Pay, PhonePe, Paytm, or BHIM. You can also place the order directly without scanning and pay upon studio invoice.
                    </p>
                  </div>

                  {/* Embedded Dynamic UPI QR Code */}
                  <DynamicUPIQRCode
                    amount={orderAmount}
                    orderId={`STR-${Date.now().toString().slice(-4)}`}
                    className="max-w-sm mx-auto shadow-xs border-amber-200/60"
                  />

                  {/* Optional UTR Input */}
                  <div className="max-w-sm mx-auto space-y-1.5 text-left">
                    <label className="text-[11px] font-semibold text-[#0F172A] flex items-center justify-between">
                      <span>12-Digit UPI Transaction ID / UTR</span>
                      <span className="text-[10px] text-[#78716C] font-normal">(Optional if paying now)</span>
                    </label>
                    <input
                      type="text"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. 428910284910"
                      maxLength={16}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EADFCB] text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#D4A35A] placeholder:text-[#A8A29E]"
                    />
                    <p className="text-[10px] text-[#78716C]">
                      Order will be submitted immediately whether you enter UTR now or choose to pay later.
                    </p>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full sm:flex-1 justify-center shadow-xs"
                      isLoading={isSubmitting}
                      disabled={isSubmitting}
                      onClick={() => handleFinalSubmit("upi_qr")}
                    >
                      <span>Confirm & Place Order (₹{orderAmount.toLocaleString("en-IN")})</span>
                    </Button>

                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full sm:w-auto justify-center text-xs"
                      isLoading={isSubmitting}
                      disabled={isSubmitting}
                      onClick={() => handleFinalSubmit("online")}
                    >
                      <span>Place Order (Pay on Invoice)</span>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setCurrentStep(3)}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Zero-Fee UPI & GPay Payment Modal */}
      {paymentModalOpen && createdOrder && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          orderId={createdOrder.id}
          orderCode={createdOrder.code}
          clientName={fullName}
          clientEmail={email}
          clientPhone={whatsapp}
          serviceTitle={activeService.title}
          amount={orderAmount}
          isCustomQuote={isBespokeService}
          onPaymentSuccess={() => {
            setPaymentModalOpen(false);
            if (onOrderSuccess) {
              onOrderSuccess(createdOrder);
            }
          }}
        />
      )}
    </div>
  );
}
