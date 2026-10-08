/**
 * SUTRA STUDIO — Canonical Packages & Deliverables Configuration
 *
 * Single Source of Truth for:
 * 1. Standalone Creative Deliverables:
 *    - Image Creation: ₹499 for 5x 4K Photorealistic Master Renders (~₹100/image)
 *    - Video Creation: ₹1,499 for 2x Complete Commercial Reels / Shorts
 * 2. Multi-Format Commission Packages (Starter ₹3,499, Studio Growth ₹7,999, Enterprise Custom Quote)
 * 3. Autonomous Retainers (₹14,999/mo Growth Retainer)
 */

export interface StandaloneDeliverablePackage {
  id: string;
  name: string;
  serviceId: string;
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
  priceMonthly: number;
  formattedMonthlyPrice: string;
  tagline: string;
  description: string;
  turnaround: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  ctaHref: string;
  monthlyQuotaDescription: string;
}

/**
 * 1. Standalone Creative Deliverables (High-Velocity Single Orders)
 */
export const STANDALONE_PACKAGES: StandaloneDeliverablePackage[] = [
  {
    id: "standalone-image-5x",
    name: "5x 4K Photorealistic Master Renders",
    serviceId: "img-creation",
    price: 499,
    formattedPrice: "₹499",
    priceDisplay: "₹499 for 5x 4K Photorealistic Master Renders (~₹100/image)",
    turnaround: "24h SLA",
    description: "Rapid single-commission pack delivering five master-grade commercial visuals.",
    subBullets: [
      "2x Studio product shots",
      "2x Lifestyle ambient context",
      "1x Ad campaign visual",
      "24h SLA turnaround",
    ],
    ctaText: "Commission 5x Renders (₹499)",
    ctaHref: "/orders?package=standalone-image-5x",
    popular: true,
  },
  {
    id: "standalone-video-2x",
    name: "2x Complete Commercial Reels / Shorts",
    serviceId: "vid-creation",
    price: 1499,
    formattedPrice: "₹1,499",
    priceDisplay: "₹1,499 for 2x Complete Commercial Reels / Shorts",
    turnaround: "24–48h SLA",
    description: "Multi-angle commercial video reels with studio audio, motion typography, and vertical aspect ratios.",
    subBullets: [
      "15–30s each",
      "1x Product showcase reel + 1x Feature highlight reel",
      "High-fidelity Studio Voiceover (EN/HI), background score, and motion typography included",
      "24–48h SLA turnaround",
    ],
    ctaText: "Commission 2x Reels (₹1,499)",
    ctaHref: "/orders?package=standalone-video-2x",
    popular: true,
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
      "Ideal for boutique brands, luxury founders, and product launches needing immediate high-impact visuals.",
    turnaround: "48 Hours",
    revisionRounds: 2,
    popular: false,
    ctaText: "Commission Starter (₹1,999)",
    ctaHref: "/orders?package=starter-creative",
    features: [
      "Up to 5x Photorealistic 4K Renders",
      "1x 10-Second Commercial Video Ad",
      "Full Commercial Copyright License",
      "48-Hour Rapid Turnaround Pipeline",
      "Sutra Cloud Vault Delivery & Master Archive",
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
      "Comprehensive creative suite spanning 3D spatial renders, promotional video, and multi-channel Meta ad campaigns.",
    turnaround: "24–72 Hours",
    revisionRounds: 3,
    popular: true,
    ctaText: "Commission Growth (₹4,999)",
    ctaHref: "/orders?package=studio-growth",
    features: [
      "15x High-Resolution 3D & Product Renders",
      "3x 15-Second Video Ads with High-Fidelity Voiceover",
      "Interactive 360° Space Tour or Virtual Showroom",
      "3x Meta Ads Creative Variations (Feed & Story Ratios)",
      "Dedicated Creative Lead & Priority Queue",
      "Priority 24–72 Hour Delivery Pipeline",
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
      "Full digital atelier ecosystem: high-performance web architecture, autonomous 3D pipelines, and executive creative direction.",
    turnaround: "Custom Milestone",
    revisionRounds: 99,
    popular: false,
    ctaText: "Inquire for Enterprise",
    ctaHref: "/contact?package=bespoke-enterprise",
    features: [
      "Unlimited Custom Deliverables & Assets",
      "Bespoke High-Performance Web & Mobile Architecture",
      "Custom Spatial 3D & 360° Interactive Showrooms",
      "Direct WhatsApp & Dedicated Art Director Channel",
      "Custom SLA & Milestone-Based Delivery",
      "Executive Creative Direction & Strategy",
    ],
  },
];

/**
 * 3. Monthly Autonomous Retainer Packages
 */
export const RETAINER_PACKAGES: RetainerPackage[] = [
  {
    id: "autonomous-growth",
    name: "Autonomous Growth Retainer",
    priceMonthly: 9999,
    formattedMonthlyPrice: "₹9,999 / mo",
    tagline: "Always-on creative production engine with daily active queue fulfillment",
    description:
      "A complete external digital design & rendering team for your brand at the cost of less than a single intern.",
    turnaround: "Daily Active Queue",
    popular: true,
    ctaText: "Initiate Retainer (₹9,999/mo)",
    ctaHref: "/orders?package=autonomous-growth",
    monthlyQuotaDescription: "1 Active Request at a time • Daily deliverables delivered to your private Vault",
    features: [
      "Daily Active Queue (1 task fulfilled at a time)",
      "Daily 4K Product Renders, Social Visuals & Video Reels",
      "Meta Ads Variations & High-CTR Copy Packs",
      "Interactive 3D Assets & Spatial Showcase Updates",
      "Dedicated Creative Lead & Daily Progress Dashboard",
      "Pause or Cancel Anytime with Zero Long-Term Lock-in",
    ],
  },
];
