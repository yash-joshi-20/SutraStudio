/**
 * SUTRA STUDIO — Canonical Packages & Deliverables Configuration
 *
 * Single Source of Truth for:
 * 1. Standalone Creative Packs (from ₹499)
 * 2. Multi-Format Commission Packages (Starter ₹1,999, Studio Growth ₹4,999, Enterprise Custom Quote)
 * 3. Daily Content Retainer Plans (1 image + 1 video per day):
 *    - 30-Day Growth Plan: ₹9,999 / month
 *    - 6-Month Growth Plan: ₹53,999 (10% savings)
 */

export interface StandaloneDeliverablePackage {
  id: string;
  name: string;
  serviceId: string;
  serviceSlug: string;
  price: number;
  formattedPrice: string;
  priceDisplay: string;
  turnaround: string;
  description: string;
  subBullets: string[];
  ctaText: string;
  ctaHref: string;
  popular?: boolean;
}

export interface CommissionPackage {
  id: string;
  name: string;
  price: number | "custom";
  formattedPrice: string;
  tagline: string;
  description: string;
  turnaround: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  ctaHref: string;
  revisionRounds: number;
}

export interface RetainerPackage {
  id: string;
  name: string;
  billingCycle: "monthly" | "biannual";
  durationMonths: number;
  price: number;
  priceMonthly?: number;
  formattedPrice: string;
  formattedMonthlyPrice?: string;
  monthlyEquivalent: string;
  tagline: string;
  description: string;
  turnaround: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  ctaHref: string;
  dailyDeliverables: string;
  monthlyQuotaDescription?: string;
}

/**
 * 1. Standalone Creative Deliverables (Single Order Packs)
 */
export const STANDALONE_PACKAGES: StandaloneDeliverablePackage[] = [
  {
    id: "standalone-image-5x",
    name: "5x 4K Master Pack",
    serviceId: "img-creation",
    serviceSlug: "image-creation",
    price: 499,
    formattedPrice: "₹499",
    priceDisplay: "Starting from ₹499 (5x 4K Master Pack)",
    turnaround: "24h SLA",
    description:
      "5x Ultra-HD 4K Photorealistic Master Renders. Studio product angles, lifestyle ambient context, and advertising visual passes.",
    subBullets: [
      "2x Studio product angles",
      "2x Lifestyle ambient context",
      "1x Campaign visual pass",
      "24h SLA delivery",
    ],
    ctaText: "Order 5-Image Pack - ₹499",
    ctaHref: "/orders?package=standalone-image-5x",
    popular: true,
  },
  {
    id: "standalone-video-2x",
    name: "2x Commercial Reels Pack",
    serviceId: "vid-creation",
    serviceSlug: "video-creation",
    price: 1499,
    formattedPrice: "₹1,499",
    priceDisplay: "Starting from ₹1,499 (2x Commercial Reels Pack)",
    turnaround: "24–48h SLA",
    description:
      "2x Complete Commercial Video Reels / Shorts (15–30s each) with voiceover narration, motion graphics, and background score.",
    subBullets: [
      "15–30s each (Vertical 9:16 & Horizontal 16:9)",
      "1x Product showcase reel + 1x Feature highlight reel",
      "Studio voiceover narration & sound score",
      "24–48h SLA delivery",
    ],
    ctaText: "Order 2-Reels Pack - ₹1,499",
    ctaHref: "/orders?package=standalone-video-2x",
    popular: true,
  },
  {
    id: "standalone-3d-model",
    name: "Interactive 3D Model",
    serviceId: "3d-modeling",
    serviceSlug: "3d-modeling",
    price: 2499,
    formattedPrice: "₹2,499",
    priceDisplay: "Starting from ₹2,499 (Interactive 3D Asset)",
    turnaround: "48h SLA",
    description:
      "Interactive web-ready 3D asset with PBR textures, turntable lighting, and glTF / USDZ multi-format files.",
    subBullets: [
      "Interactive 3D web asset",
      "glTF & USDZ file formats",
      "4K PBR material maps",
      "48h SLA delivery",
    ],
    ctaText: "Order 3D Model - ₹2,499",
    ctaHref: "/orders?package=standalone-3d-model",
    popular: false,
  },
  {
    id: "standalone-360-view",
    name: "Single Panoramic Virtual Space",
    serviceId: "360-view",
    serviceSlug: "360-view",
    price: 4999,
    formattedPrice: "₹4,999",
    priceDisplay: "Starting from ₹4,999 (Panoramic Virtual Space)",
    turnaround: "48–72h SLA",
    description:
      "Single high-resolution panoramic virtual space, interactive hotspot annotations, and web embed code.",
    subBullets: [
      "Single Panoramic Virtual Space",
      "Interactive Panorama Viewer",
      "Hotspot Annotations & Floor Plan Link",
      "48–72h SLA delivery",
    ],
    ctaText: "Order 360° Tour - ₹4,999",
    ctaHref: "/orders?package=standalone-360-view",
    popular: false,
  },
  {
    id: "standalone-brand-identity",
    name: "Brand Identity Suite",
    serviceId: "digital-marketing",
    serviceSlug: "digital-marketing",
    price: 4999,
    formattedPrice: "₹4,999",
    priceDisplay: "Starting from ₹4,999 (Brand Identity Suite)",
    turnaround: "72h SLA",
    description:
      "Complete visual identity, vector logo master suite, brand stylebook PDF, typography tokens, and social identity kit.",
    subBullets: [
      "Vector Logo Suite (SVG/EPS/PNG)",
      "Typography & Color Guidelines",
      "Brand Stylebook Presentation",
      "Social Media Identity Assets",
    ],
    ctaText: "Order Brand Identity - ₹4,999",
    ctaHref: "/orders?package=standalone-brand-identity",
    popular: false,
  },
  {
    id: "standalone-digital-marketing",
    name: "Meta Ads Launch Pack",
    serviceId: "meta-ads-launcher",
    serviceSlug: "meta-ads-launcher",
    price: 4999,
    formattedPrice: "₹4,999",
    priceDisplay: "Starting from ₹4,999 (Campaign Setup & 5 Ad Variations)",
    turnaround: "48h SLA",
    description:
      "Complete advertising launch with conversion tracking setup, targeting blueprint, and 5 creative ad variations.",
    subBullets: [
      "5 Creative Ad Variations (1:1, 9:16)",
      "Campaign & Funnel Blueprint",
      "Tracking & Pixel Setup Verification",
      "Direct-Response Headlines & Copy",
    ],
    ctaText: "Order Meta Ads Pack - ₹4,999",
    ctaHref: "/orders?package=standalone-digital-marketing",
    popular: false,
  },
];

/**
 * 2. Multi-Format Commission Packages
 */
export const COMMISSION_PACKAGES: CommissionPackage[] = [
  {
    id: "starter-creative",
    name: "Starter Creative",
    price: 1999,
    formattedPrice: "₹1,999",
    tagline: "Essential 4K creative launch pack",
    description:
      "Ideal for boutique brands, product launches, and founders needing immediate high-impact visuals.",
    turnaround: "48 Hours",
    revisionRounds: 2,
    popular: false,
    ctaText: "Commission Starter (₹1,999)",
    ctaHref: "/orders?package=starter-creative",
    features: [
      "Up to 5x Photorealistic 4K Renders",
      "1x 10-Second Commercial Video Ad",
      "Full Commercial Copyright License",
      "48-Hour Rapid Delivery SLA",
      "Client Workspace Delivery & Archive",
      "2 Revision Rounds Included",
    ],
  },
  {
    id: "studio-growth",
    name: "Studio Growth",
    price: 4999,
    formattedPrice: "₹4,999",
    tagline: "High-velocity multi-format digital atelier",
    description:
      "Comprehensive creative suite spanning 3D spatial renders, promotional video, and multi-channel ad campaigns.",
    turnaround: "24–72 Hours",
    revisionRounds: 3,
    popular: true,
    ctaText: "Commission Growth (₹4,999)",
    ctaHref: "/orders?package=studio-growth",
    features: [
      "15x High-Resolution 3D & Product Renders",
      "3x 15-Second Video Ads with Studio Voiceover",
      "Interactive 360° Space Tour or Virtual Showroom",
      "3x Meta Ads Creative Variations (Feed & Story Ratios)",
      "Dedicated Creative Lead & Priority Queue",
      "Priority 24–72 Hour Delivery SLA",
      "Unlimited Minor Revisions (7 Days)",
    ],
  },
  {
    id: "bespoke-enterprise",
    name: "Bespoke Enterprise",
    price: "custom",
    formattedPrice: "Custom Quote",
    tagline: "Tailored creative engineering & dedicated atelier capacity",
    description:
      "Full digital atelier ecosystem: custom web architecture, interactive spatial 3D environments, and executive creative direction.",
    turnaround: "Milestone-Based",
    revisionRounds: 99,
    popular: false,
    ctaText: "Inquire for Enterprise",
    ctaHref: "/contact?package=bespoke-enterprise",
    features: [
      "Tailored Deliverables & Custom Asset Output",
      "Bespoke Enterprise Web Platform & Client Portal Architecture",
      "Native iOS & Android Mobile Systems Setup",
      "Custom Spatial 3D & 360° Interactive Showrooms",
      "Dedicated Creative Lead & Custom Milestone SLAs",
      "Direct Executive Review & Communication Channel",
      "Full Source Ownership & Enterprise IP Agreements",
    ],
  },
];

/**
 * 3. Daily Content Retainer Plans (1 Image + 1 Video per day)
 */
export const RETAINER_PACKAGES: RetainerPackage[] = [
  {
    id: "growth-plan-30d",
    name: "30-Day Growth Plan",
    billingCycle: "monthly",
    durationMonths: 1,
    price: 9999,
    priceMonthly: 9999,
    formattedPrice: "₹9,999 / month",
    formattedMonthlyPrice: "₹9,999",
    monthlyEquivalent: "₹9,999 / mo",
    tagline: "1 Graphic + 1 Video Per Day (60 Master Assets / Month)",
    description:
      "Your dedicated creative department. Continuous daily active queue delivering brand graphics and commercial video reels every single day.",
    turnaround: "Daily Active Queue",
    dailyDeliverables: "1 Brand Graphic + 1 Commercial Video Reel / Day",
    monthlyQuotaDescription: "Daily Content Queue: 1 Image + 1 Video per day",
    popular: true,
    ctaText: "Activate 30-Day Plan (₹9,999/mo)",
    ctaHref: "/orders?package=growth-plan-30d",
    features: [
      "Daily 1x 4K Brand Graphic / Social Visual (30 Assets/month)",
      "Daily 1x Commercial Video Reel / Short (30 Assets/month) with voiceover and motion typography",
      "Interactive 3D Asset & Spatial Staging Updates",
      "Multi-Ratio Ad Variations (1:1, 9:16)",
      "Client Dashboard Delivery & High-Res Downloads",
      "Dedicated Account Manager & Priority Queue",
      "Pause or Cancel Anytime with Zero Lock-in",
    ],
  },
  {
    id: "growth-plan-6m",
    name: "6-Month Growth Retainer",
    billingCycle: "biannual",
    durationMonths: 6,
    price: 53999,
    priceMonthly: 8999,
    formattedPrice: "₹53,999 / 6 months",
    formattedMonthlyPrice: "₹8,999/mo (₹53,999 total)",
    monthlyEquivalent: "₹8,999 / mo (10% Savings)",
    tagline: "6 Months of Continuous Daily Production (360 Master Assets Total)",
    description:
      "Long-term creative partnership for established brands and growing companies. Guaranteed daily production with highest studio priority.",
    turnaround: "Highest Priority Daily Queue",
    dailyDeliverables: "1 Brand Graphic + 1 Commercial Video Reel / Day (180 + 180 Assets)",
    monthlyQuotaDescription: "Highest Priority Daily Queue: 180 Images + 180 Videos",
    popular: false,
    ctaText: "Lock In 6-Month Plan (₹53,999)",
    ctaHref: "/orders?package=growth-plan-6m",
    features: [
      "Daily 1x 4K Brand Graphic (180 Total Assets across 6 months)",
      "Daily 1x Commercial Video Reel (180 Total Assets across 6 months)",
      "Interactive 3D Modeling & Virtual Spaces Included",
      "Quarterly Brand & Visual Strategy Audit",
      "Dedicated Studio Creative Director & Priority SLA",
      "10% Long-Term Partnership Savings",
      "Full Commercial IP Ownership on all deliverables",
    ],
  },
];

/**
 * Universal package resolution helper supporting canonical IDs and legacy aliases
 */
export const PACKAGE_ALIASES: Record<string, string> = {
  "autonomous-growth-retainer": "growth-plan-30d",
  "autonomous-growth": "growth-plan-30d",
  "30-day-plan": "growth-plan-30d",
  "6-month-plan": "growth-plan-6m",
  "starter": "starter-creative",
  "growth": "studio-growth",
  "enterprise": "bespoke-enterprise",
};

export function findPackageById(
  id: string
):
  | { type: "standalone"; data: StandaloneDeliverablePackage }
  | { type: "commission"; data: CommissionPackage }
  | { type: "retainer"; data: RetainerPackage }
  | undefined {
  if (!id) return undefined;
  const normalized = id.toLowerCase().trim();
  const canonicalId = PACKAGE_ALIASES[normalized] || normalized;

  const standalone = STANDALONE_PACKAGES.find(
    (p) => p.id.toLowerCase() === canonicalId || p.id.toLowerCase() === normalized
  );
  if (standalone) return { type: "standalone", data: standalone };

  const commission = COMMISSION_PACKAGES.find(
    (p) => p.id.toLowerCase() === canonicalId || p.id.toLowerCase() === normalized
  );
  if (commission) return { type: "commission", data: commission };

  const retainer = RETAINER_PACKAGES.find(
    (p) => p.id.toLowerCase() === canonicalId || p.id.toLowerCase() === normalized
  );
  if (retainer) return { type: "retainer", data: retainer };

  return undefined;
}
