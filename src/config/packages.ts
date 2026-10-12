/**
 * SUTRA STUDIO — Canonical Packages & Deliverables Configuration
 *
 * Single Source of Truth for:
 * 1. Approved Monthly Retainer Packages:
 *    - Starter Trend: ₹9,999 / 30 days (15 images + 15 short videos)
 *    - Growth Trend: ₹14,999 / 30 days (20 images + 20 short videos)
 *    - Daily Trend Creator: ₹19,999 / 30 days (30 images + 30 short videos, 1 each per day)
 * 2. Approved Standalone Deliverable Packs:
 *    - Image packs (3 for ₹249; 3 for ₹499; 5 for ₹799; 10 for ₹1,499)
 *    - Video packs (3 for ₹499; 3 for ₹1,299; 5 for ₹1,999; 10 for ₹3,499)
 *    - Social Carousel (5 slides for ₹499)
 *
 * All prices strictly <= ₹20,000.
 */

import { formatCurrencyINR } from "@/config/services";

export interface RetainerPackage {
  id: string;
  slug: string;
  name: string;
  billingCycle: "monthly" | "quarterly" | "annual";
  durationMonths: number;
  duration: string;
  price: number;
  numericPrice: number;
  priceMonthly: number;
  quarterlyPrice: number;
  annualPrice: number;
  formattedPrice: string;
  formattedMonthlyPrice: string;
  monthlyEquivalent: string;
  tagline: string;
  description: string;
  turnaround: string;
  estimatedTurnaround: string;
  features: string[];
  deliverables: string[];
  quantity: number;
  revisionPolicy: string;
  exclusions: string[];
  popular?: boolean;
  ctaText: string;
  ctaHref: string;
  ctaTarget: string;
  dailyDeliverables: string;
  monthlyQuotaDescription: string;
  includedServices: {
    images: number;
    videos: number;
  };
  active: boolean;
}

export interface StandaloneDeliverablePackage {
  id: string;
  slug: string;
  name: string;
  serviceId: string;
  serviceSlug: string;
  price: number;
  numericPrice: number;
  pricingType: "pack" | "per_unit";
  formattedPrice: string;
  priceDisplay: string;
  turnaround: string;
  estimatedTurnaround: string;
  description: string;
  subBullets: string[];
  deliverables: string[];
  quantity: number;
  duration: string;
  revisionPolicy: string;
  exclusions: string[];
  ctaText: string;
  ctaHref: string;
  ctaTarget: string;
  popular?: boolean;
  active: boolean;
}

export interface CommissionPackage {
  id: string;
  slug: string;
  name: string;
  price: number | "custom";
  numericPrice: number;
  pricingType: "fixed" | "per_unit" | "pack" | "starting_at";
  formattedPrice: string;
  tagline: string;
  description: string;
  turnaround: string;
  estimatedTurnaround: string;
  features: string[];
  deliverables: string[];
  quantity: number;
  duration: string;
  revisionPolicy: string;
  exclusions: string[];
  popular?: boolean;
  ctaText: string;
  ctaHref: string;
  ctaTarget: string;
  revisionRounds: number;
  active: boolean;
}

/**
 * ----------------------------------------------------------------------------
 * 1. APPROVED MONTHLY RETAINER PACKAGES (30-DAY PIPELINE)
 * ----------------------------------------------------------------------------
 */
export const APPROVED_MONTHLY_PACKAGES: RetainerPackage[] = [
  // 1. Starter Trend (₹9,999 / 30 days)
  {
    id: "starter-trend",
    slug: "starter-trend",
    name: "Starter Trend",
    billingCycle: "monthly",
    durationMonths: 1,
    duration: "30 days",
    price: 9999,
    numericPrice: 9999,
    priceMonthly: 9999,
    quarterlyPrice: 26997, // 10% savings
    annualPrice: 95990, // 20% savings
    formattedPrice: "₹9,999",
    formattedMonthlyPrice: "₹9,999 / mo",
    monthlyEquivalent: "₹9,999 / month",
    tagline: "Essential Bi-Daily Creative Pipeline",
    description:
      "Bi-daily active creative pipeline designed for emerging brands. Delivers 15 high-impact visual graphics and 15 commercial short videos across 30 days.",
    turnaround: "48h SLA per Drop",
    estimatedTurnaround: "48 Hours per Drop",
    features: [
      "15 Branded Social & Product Images across 30 days",
      "15 Commercial Short Videos / Reels (up to 15s)",
      "Trend topic research & brand relevance review",
      "Custom tailored generation prompts",
      "Post captions & hashtag recommendations",
      "Organized private Google Drive Vault delivery",
      "1 consolidated revision round per deliverable",
      "48h turnaround SLA per delivery drop",
    ],
    deliverables: [
      "15 Branded Social & Product Images",
      "15 Commercial Short Videos / Reels (up to 15s)",
      "Trend topic research & brand relevance review",
      "Custom tailored generation prompts",
      "Post captions & hashtag recommendations",
      "Organized private Google Drive Vault delivery",
      "1 consolidated revision round per deliverable",
    ],
    quantity: 30, // 15 images + 15 videos
    revisionPolicy: "1 consolidated revision round per deliverable",
    exclusions: ["Paid ad media spend excluded", "Raw 3D project files excluded"],
    popular: false,
    ctaText: "Start Starter Trend - ₹9,999",
    ctaHref: "/orders?package=starter-trend",
    ctaTarget: "/orders?package=starter-trend",
    dailyDeliverables: "Alternating image and video drops across 30 days",
    monthlyQuotaDescription: "15 Images + 15 Videos (30 Assets Total)",
    includedServices: {
      images: 15,
      videos: 15,
    },
    active: true,
  },

  // 2. Growth Trend (₹14,999 / 30 days)
  {
    id: "growth-trend",
    slug: "growth-trend",
    name: "Growth Trend",
    billingCycle: "monthly",
    durationMonths: 1,
    duration: "30 days",
    price: 14999,
    numericPrice: 14999,
    priceMonthly: 14999,
    quarterlyPrice: 40497,
    annualPrice: 143990,
    formattedPrice: "₹14,999",
    formattedMonthlyPrice: "₹14,999 / mo",
    monthlyEquivalent: "₹14,999 / month",
    tagline: "High-Velocity Brand Acceleration",
    description:
      "Accelerated creative output for scaling digital brands. Delivers 20 visual assets and 20 commercial short videos with dedicated content calendar.",
    turnaround: "24–48h SLA per Drop",
    estimatedTurnaround: "24–48 Hours per Drop",
    features: [
      "20 Branded Social & Product Images across 30 days",
      "20 Commercial Short Videos / Reels (15–30s)",
      "Daily trending-topic research & brand alignment",
      "Tailored creative prompts & art direction",
      "30-Day strategic editorial content calendar",
      "High-converting captions, hooks & hashtag sets",
      "Organized private Google Drive Vault staging",
      "1 consolidated revision round per deliverable",
      "24–48h turnaround SLA per deliverable batch",
    ],
    deliverables: [
      "20 Branded Social & Product Images",
      "20 Commercial Short Videos / Reels (15–30s)",
      "Daily trending-topic research & brand alignment",
      "Tailored creative prompts & art direction",
      "30-Day strategic editorial content calendar",
      "High-converting captions, hooks & hashtag sets",
      "Organized private Google Drive Vault staging",
      "1 consolidated revision round per deliverable",
    ],
    quantity: 40, // 20 images + 20 videos
    revisionPolicy: "1 consolidated revision round per deliverable",
    exclusions: ["Paid ad media spend excluded", "Raw video project files excluded"],
    popular: false,
    ctaText: "Start Growth Trend - ₹14,999",
    ctaHref: "/orders?package=growth-trend",
    ctaTarget: "/orders?package=growth-trend",
    dailyDeliverables: "5 assets per week delivered continuously across 30 days",
    monthlyQuotaDescription: "20 Images + 20 Videos (40 Assets Total)",
    includedServices: {
      images: 20,
      videos: 20,
    },
    active: true,
  },

  // 3. Daily Trend Creator (Flagship Main Package: ₹19,999 / 30 days)
  {
    id: "daily-trend-creator",
    slug: "daily-trend-creator",
    name: "Daily Trend Creator",
    billingCycle: "monthly",
    durationMonths: 1,
    duration: "30 days",
    price: 19999,
    numericPrice: 19999,
    priceMonthly: 19999,
    quarterlyPrice: 53997,
    annualPrice: 191990,
    formattedPrice: "₹19,999",
    formattedMonthlyPrice: "₹19,999 / mo",
    monthlyEquivalent: "₹19,999 / month",
    tagline: "FLAGSHIP: 1 Image + 1 Video Every Single Day",
    description:
      "Our flagship daily active creative queue. Delivers 1 custom image and 1 short video every day for 30 days, backed by daily trend research, customized prompts, and full production.",
    turnaround: "Daily Active Queue (Every 24h)",
    estimatedTurnaround: "Daily Active Queue",
    features: [
      "30 Images (1 Custom Image Delivered Daily)",
      "30 Short Videos / Reels (1 Short Video Delivered Daily)",
      "Daily trending-topic research tailored to your brand",
      "Brand relevance review & custom prompt engineering",
      "Complete captions, hooks & targeted hashtag bundles",
      "30-Day coordinated content calendar",
      "Rigorous studio quality checks & QA on every asset",
      "Organized private Google Drive Vault delivery",
      "1 consolidated revision round per deliverable",
    ],
    deliverables: [
      "30 Custom 4K Visual Graphics (1 Delivered Daily)",
      "30 Commercial Video Reels / Shorts (1 Delivered Daily)",
      "Daily trending-topic research & brand relevance review",
      "Custom tailored prompts and generation pipelines",
      "Production, sound design sync & color grading",
      "High-converting captions & hashtag bundles",
      "Content calendar scheduling & coordination",
      "Rigorous studio quality assurance review",
      "Organized private Google Drive Vault delivery",
      "1 consolidated revision round per deliverable",
    ],
    quantity: 60, // 30 images + 30 short videos, 1 of each per day
    revisionPolicy: "1 consolidated revision round per deliverable",
    exclusions: [
      "Paid advertising media spend excluded",
      "Third-party celebrity voiceover licensing fees excluded",
    ],
    popular: true,
    ctaText: "Start Daily Trend Creator - ₹19,999",
    ctaHref: "/orders?package=daily-trend-creator",
    ctaTarget: "/orders?package=daily-trend-creator",
    dailyDeliverables: "1 custom image + 1 commercial video reel delivered every 24 hours",
    monthlyQuotaDescription: "30 Images + 30 Videos (60 Assets Total, 1 each daily)",
    includedServices: {
      images: 30,
      videos: 30,
    },
    active: true,
  },
];

/**
 * ----------------------------------------------------------------------------
 * 2. APPROVED STANDALONE DELIVERABLE PACKS (SINGLE ORDERS)
 * ----------------------------------------------------------------------------
 */
export const APPROVED_STANDALONE_PACKAGES: StandaloneDeliverablePackage[] = [
  // Basic Image Pack (3 Images)
  {
    id: "basic-image-pack-3",
    slug: "basic-image-pack-3",
    name: "Basic Image Pack (3 Images)",
    serviceId: "img-creation",
    serviceSlug: "image-creation",
    price: 249,
    numericPrice: 249,
    pricingType: "pack",
    formattedPrice: "₹249",
    priceDisplay: "3 for ₹249",
    turnaround: "24–48h SLA",
    estimatedTurnaround: "24–48 Hours",
    description: "Bundle of 3 template-based graphics for standard social posting.",
    subBullets: ["3x Template graphics", "Web-ready PNG", "24–48h SLA"],
    deliverables: ["3x Template-Based Social Graphics", "Web-optimized PNG & WebP formats"],
    quantity: 3,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round across bundle",
    exclusions: ["Bespoke concept prompt generation excluded"],
    ctaText: "Order 3-Image Pack - ₹249",
    ctaHref: "/orders?package=basic-image-pack-3",
    ctaTarget: "/orders?package=basic-image-pack-3",
    popular: false,
    active: true,
  },

  // Branded Image Pack (3 Images)
  {
    id: "branded-image-pack-3",
    slug: "branded-image-pack-3",
    name: "Branded Image Pack (3 Images)",
    serviceId: "img-creation",
    serviceSlug: "image-creation",
    price: 499,
    numericPrice: 499,
    pricingType: "pack",
    formattedPrice: "₹499",
    priceDisplay: "3 for ₹499",
    turnaround: "24–48h SLA",
    estimatedTurnaround: "24–48 Hours",
    description: "Trio of custom branded social visuals tailored to brand guidelines.",
    subBullets: ["3x Custom branded graphics", "Cohesive brand styling", "Full commercial rights"],
    deliverables: ["3x Custom Branded Visual Creatives", "Cohesive brand styling & color grading"],
    quantity: 3,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    exclusions: ["Motion animations excluded"],
    ctaText: "Order 3 Branded Images - ₹499",
    ctaHref: "/orders?package=branded-image-pack-3",
    ctaTarget: "/orders?package=branded-image-pack-3",
    popular: true,
    active: true,
  },

  // Branded Image Pack (5 Images)
  {
    id: "branded-image-pack-5",
    slug: "branded-image-pack-5",
    name: "Branded Image Pack (5 Images)",
    serviceId: "img-creation",
    serviceSlug: "image-creation",
    price: 799,
    numericPrice: 799,
    pricingType: "pack",
    formattedPrice: "₹799",
    priceDisplay: "5 for ₹799",
    turnaround: "48h SLA",
    estimatedTurnaround: "48 Hours",
    description: "Curated suite of 5 branded creatives for weekly campaign schedules.",
    subBullets: ["5x Branded graphics", "Weekly campaign coverage", "Commercial usage"],
    deliverables: ["5x Custom Branded Visual Creatives", "Campaign-aligned angles and layout variations"],
    quantity: 5,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    exclusions: ["Video deliverables excluded"],
    ctaText: "Order 5 Branded Images - ₹799",
    ctaHref: "/orders?package=branded-image-pack-5",
    ctaTarget: "/orders?package=branded-image-pack-5",
    popular: false,
    active: true,
  },

  // Branded Image Pack (10 Images)
  {
    id: "branded-image-pack-10",
    slug: "branded-image-pack-10",
    name: "Branded Image Pack (10 Images)",
    serviceId: "img-creation",
    serviceSlug: "image-creation",
    price: 1499,
    numericPrice: 1499,
    pricingType: "pack",
    formattedPrice: "₹1,499",
    priceDisplay: "10 for ₹1,499",
    turnaround: "48–72h SLA",
    estimatedTurnaround: "48–72 Hours",
    description: "Comprehensive 10-asset branded image library for multi-week content coverage.",
    subBullets: ["10x Branded graphics", "Multi-week content library", "Google Drive Vault delivery"],
    deliverables: ["10x Custom Branded Visual Creatives", "Diverse hero, detail, and promo staging passes"],
    quantity: 10,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round across library",
    exclusions: ["Video deliverables excluded"],
    ctaText: "Order 10 Branded Images - ₹1,499",
    ctaHref: "/orders?package=branded-image-pack-10",
    ctaTarget: "/orders?package=branded-image-pack-10",
    popular: false,
    active: true,
  },

  // Social Carousel (5 Slides)
  {
    id: "social-carousel-5-slides",
    slug: "social-carousel-5-slides",
    name: "Social Carousel (5 Slides)",
    serviceId: "img-creation",
    serviceSlug: "image-creation",
    price: 499,
    numericPrice: 499,
    pricingType: "pack",
    formattedPrice: "₹499",
    priceDisplay: "5 Slides for ₹499",
    turnaround: "24–48h SLA",
    estimatedTurnaround: "24–48 Hours",
    description: "Engaging 5-slide educational or promotional swipe carousel with seamless flow.",
    subBullets: ["5x Carousel slides", "Hook & CTA slides", "PDF + PNG exports"],
    deliverables: ["5x Seamless Storytelling Carousel Slides", "PDF presentation + individual PNGs"],
    quantity: 5,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    exclusions: ["Video animation excluded"],
    ctaText: "Order 5-Slide Carousel - ₹499",
    ctaHref: "/orders?package=social-carousel-5-slides",
    ctaTarget: "/orders?package=social-carousel-5-slides",
    popular: false,
    active: true,
  },

  // Basic Video Pack (3 Edits)
  {
    id: "basic-video-pack-3",
    slug: "basic-video-pack-3",
    name: "Basic Video Pack (3 Edits)",
    serviceId: "vid-creation",
    serviceSlug: "video-creation",
    price: 499,
    numericPrice: 499,
    pricingType: "pack",
    formattedPrice: "₹499",
    priceDisplay: "3 for ₹499",
    turnaround: "48h SLA",
    estimatedTurnaround: "48 Hours",
    description: "Pack of 3 short video edits (up to 10s each) for fast social media posting.",
    subBullets: ["3x 10-Second videos", "9:16 Vertical format", "Basic sound track"],
    deliverables: ["3x 10-Second Template Short Videos", "Vertical 9:16 format for Reels/Shorts"],
    quantity: 3,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round across pack",
    exclusions: ["Custom voiceover excluded"],
    ctaText: "Order 3 Video Edits - ₹499",
    ctaHref: "/orders?package=basic-video-pack-3",
    ctaTarget: "/orders?package=basic-video-pack-3",
    popular: false,
    active: true,
  },

  // Promotional Reels Pack (3 Reels)
  {
    id: "promotional-reels-pack-3",
    slug: "promotional-reels-pack-3",
    name: "Promotional Reels Pack (3 Reels)",
    serviceId: "vid-creation",
    serviceSlug: "video-creation",
    price: 1299,
    numericPrice: 1299,
    pricingType: "pack",
    formattedPrice: "₹1,299",
    priceDisplay: "3 for ₹1,299",
    turnaround: "48–72h SLA",
    estimatedTurnaround: "48–72 Hours",
    description: "Bundle of 3 high-converting 15–30s promotional reels with motion typography.",
    subBullets: ["3x 15–30s Promo reels", "Kinetic text & sound FX", "Commercial rights"],
    deliverables: ["3x 15–30s High-Energy Commercial Promo Reels", "Custom brand color grading & kinetic titles"],
    quantity: 3,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round across pack",
    exclusions: ["Celebrity voiceover licensing fees excluded"],
    ctaText: "Order 3 Promo Reels - ₹1,299",
    ctaHref: "/orders?package=promotional-reels-pack-3",
    ctaTarget: "/orders?package=promotional-reels-pack-3",
    popular: true,
    active: true,
  },

  // Promotional Reels Pack (5 Reels)
  {
    id: "promotional-reels-pack-5",
    slug: "promotional-reels-pack-5",
    name: "Promotional Reels Pack (5 Reels)",
    serviceId: "vid-creation",
    serviceSlug: "video-creation",
    price: 1999,
    numericPrice: 1999,
    pricingType: "pack",
    formattedPrice: "₹1,999",
    priceDisplay: "5 for ₹1,999",
    turnaround: "3–4 Days",
    estimatedTurnaround: "3–4 Days",
    description: "Suite of 5 promotional reels designed for multi-angle social ad testing.",
    subBullets: ["5x 15–30s Promo reels", "Multi-hook creative variations", "Ad campaign ready"],
    deliverables: ["5x 15–30s Commercial Promo Reels", "Multi-hook creative variations for ad testing"],
    quantity: 5,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round across pack",
    exclusions: ["On-camera actor filming excluded"],
    ctaText: "Order 5 Promo Reels - ₹1,999",
    ctaHref: "/orders?package=promotional-reels-pack-5",
    ctaTarget: "/orders?package=promotional-reels-pack-5",
    popular: false,
    active: true,
  },

  // Promotional Reels Pack (10 Reels)
  {
    id: "promotional-reels-pack-10",
    slug: "promotional-reels-pack-10",
    name: "Promotional Reels Pack (10 Reels)",
    serviceId: "vid-creation",
    serviceSlug: "video-creation",
    price: 3499,
    numericPrice: 3499,
    pricingType: "pack",
    formattedPrice: "₹3,499",
    priceDisplay: "10 for ₹3,499",
    turnaround: "5–7 Days",
    estimatedTurnaround: "5–7 Days",
    description: "Comprehensive 10-reel video suite providing a full month of short-form video content.",
    subBullets: ["10x 15–30s Commercial reels", "Full monthly video coverage", "UHD exports in Vault"],
    deliverables: ["10x 15–30s Commercial Video Reels", "Kinetic motion graphics, sound design & transitions"],
    quantity: 10,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round across pack",
    exclusions: ["Custom live videography shoots excluded"],
    ctaText: "Order 10 Promo Reels - ₹3,499",
    ctaHref: "/orders?package=promotional-reels-pack-10",
    ctaTarget: "/orders?package=promotional-reels-pack-10",
    popular: false,
    active: true,
  },
];

/**
 * ----------------------------------------------------------------------------
 * 3. APPROVED MULTI-FORMAT COMMISSION PACKAGES (ONE-TIME PROJECTS)
 * ----------------------------------------------------------------------------
 */
export const APPROVED_COMMISSION_PACKAGES: CommissionPackage[] = [
  {
    id: "commission-starter-image-video",
    slug: "starter-creative-pack",
    name: "Starter Creative Pack",
    price: 1999,
    numericPrice: 1999,
    pricingType: "fixed",
    formattedPrice: "₹1,999",
    tagline: "Essential 4K Creative Launch Pack",
    description:
      "Essential launch suite containing 5 branded visuals and 1 cinematic promotional reel for fast social campaigns.",
    turnaround: "48h Rapid SLA",
    estimatedTurnaround: "48 Hours",
    features: [
      "5x Branded Visual Graphics",
      "1x 15–30s Commercial Promo Reel",
      "Full commercial usage rights",
      "48-Hour rapid turnaround",
      "Private Google Drive Vault archive",
      "2 Revision rounds included",
    ],
    deliverables: [
      "5x Branded Visual Graphics",
      "1x 15–30s Commercial Promo Reel",
      "Private Google Drive Vault delivery",
    ],
    quantity: 6,
    duration: "One-time delivery",
    revisionPolicy: "2 revision rounds",
    exclusions: ["3D CAD modeling excluded"],
    popular: false,
    ctaText: "Order Starter Pack - ₹1,999",
    ctaHref: "/orders?package=commission-starter-image-video",
    ctaTarget: "/orders?package=commission-starter-image-video",
    revisionRounds: 2,
    active: true,
  },
  {
    id: "commission-studio-growth",
    slug: "studio-growth-pack",
    name: "Studio Growth Pack",
    price: 4999,
    numericPrice: 4999,
    pricingType: "fixed",
    formattedPrice: "₹4,999",
    tagline: "Multi-Format Brand Atelier",
    description:
      "Multi-format creative production spanning 10 branded visuals, 3 commercial video reels, and 1 3D product view.",
    turnaround: "48–72h SLA",
    estimatedTurnaround: "48–72 Hours",
    features: [
      "10x Branded Visual Creatives",
      "3x 15–30s Promotional Video Reels",
      "1x 4K 3D Render from Model",
      "Sound design & kinetic typography",
      "Priority production queue",
      "2 Revision rounds included",
    ],
    deliverables: [
      "10x Branded Visual Creatives",
      "3x 15–30s Promotional Video Reels",
      "1x 4K 3D Render from Model",
      "Private Google Drive Vault staging",
    ],
    quantity: 14,
    duration: "One-time delivery",
    revisionPolicy: "2 revision rounds",
    exclusions: ["Custom web development excluded"],
    popular: true,
    ctaText: "Order Growth Pack - ₹4,999",
    ctaHref: "/orders?package=commission-studio-growth",
    ctaTarget: "/orders?package=commission-studio-growth",
    revisionRounds: 2,
    active: true,
  },
  {
    id: "commission-bespoke-project",
    slug: "bespoke-project-quote",
    name: "Bespoke Project Scope",
    price: "custom",
    numericPrice: 0,
    pricingType: "starting_at",
    formattedPrice: "Custom Quote",
    tagline: "Large-Scale Architecture & Custom Engineering",
    description:
      "Tailored production for full-scale architectural developments, complex web applications, and enterprise campaigns.",
    turnaround: "Scoped on Brief",
    estimatedTurnaround: "Based on Scope",
    features: [
      "Full Next.js Platform / Web App Architecture",
      "Large-Scale Architectural 3D Rendering & VR",
      "Multi-Channel Campaign Production",
      "Dedicated Senior Creative Director",
      "Executive Producer Direct Access",
      "Custom SLA & Milestone-based delivery",
    ],
    deliverables: [
      "Custom Project Specifications as agreed in Scope Document",
      "Milestone-based deliverable sign-offs",
    ],
    quantity: 1,
    duration: "Milestone based",
    revisionPolicy: "Agreed in Project Charter",
    exclusions: ["Scope bounded by approved project statement of work"],
    popular: false,
    ctaText: "Request a Quote",
    ctaHref: "/contact?scope=bespoke",
    ctaTarget: "/contact?scope=bespoke",
    revisionRounds: 3,
    active: true,
  },
];

/**
 * Backward compatibility exports
 */
export const RETAINER_PACKAGES: RetainerPackage[] = APPROVED_MONTHLY_PACKAGES;
export const STANDALONE_PACKAGES: StandaloneDeliverablePackage[] = APPROVED_STANDALONE_PACKAGES;
export const COMMISSION_PACKAGES: CommissionPackage[] = APPROVED_COMMISSION_PACKAGES;

/**
 * Legacy ID Aliases to prevent breaking older references
 */
export const PACKAGE_ID_ALIASES: Record<string, string> = {
  // Retainer aliases
  "starter": "starter-trend",
  "growth": "growth-trend",
  "scale": "daily-trend-creator",
  "autonomous-growth-retainer": "daily-trend-creator",
  "monthly-growth-retainer": "growth-trend",
  "studio-starter": "starter-trend",
  "studio-growth": "growth-trend",
  "enterprise-atelier": "daily-trend-creator",
  "atelier-enterprise-retainer": "daily-trend-creator",

  // Standalone aliases
  "standalone-image-5x": "branded-image-pack-5",
  "standalone-image-3x": "branded-image-pack-3",
  "standalone-video-2x": "promotional-reels-pack-3",
  "starter-creative": "commission-starter-image-video",
};

/**
 * Universal Package Resolver by ID or Slug
 */
export function findPackageById(
  idOrSlug: string
): RetainerPackage | StandaloneDeliverablePackage | CommissionPackage | undefined {
  if (!idOrSlug) return undefined;
  const clean = idOrSlug.toLowerCase().trim();
  const canonicalId = PACKAGE_ID_ALIASES[clean] || clean;

  return (
    APPROVED_MONTHLY_PACKAGES.find(
      (p) => p.id.toLowerCase() === canonicalId || p.slug.toLowerCase() === canonicalId
    ) ||
    APPROVED_STANDALONE_PACKAGES.find(
      (p) => p.id.toLowerCase() === canonicalId || p.slug.toLowerCase() === canonicalId
    ) ||
    APPROVED_COMMISSION_PACKAGES.find(
      (p) => p.id.toLowerCase() === canonicalId || p.slug.toLowerCase() === canonicalId
    )
  );
}

export const resolvePackageById = findPackageById;

/**
 * Check if a package uses bundle/pack pricing
 */
export function isPackPricing(item: { pricingType?: string }): boolean {
  return item.pricingType === "pack";
}

