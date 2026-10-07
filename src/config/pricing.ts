/**
 * SUTRA STUDIO — Central Pricing Configuration & Single Source of Truth
 *
 * All public, client, and admin interfaces MUST import pricing from this configuration.
 * Hardcoded pricing, legacy mismatched tags (₹5,499, ₹5,999, ₹12,999, ₹19,999), and
 * obsolete dummy plans are strictly prohibited.
 */

export interface ProjectTier {
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
  ctaHref?: string;
  revisionRounds: number;
}

export interface MonthlyRetainerTier {
  id: string;
  name: string;
  priceMonthly: number;
  formattedMonthlyPrice: string;
  tagline: string;
  description: string;
  turnaround: string; // "Daily Active Queue"
  features: string[];
  popular?: boolean;
  ctaText: string;
  ctaHref?: string;
  monthlyQuotaDescription: string;
}

/**
 * 1. Per-Project Commissions (One-time project deliveries)
 */
export const PER_PROJECT_TIERS: ProjectTier[] = [
  {
    id: "starter-creative",
    name: "Starter Creative",
    price: 3499,
    formattedPrice: "₹3,499",
    tagline: "Essential 4K creative launch pack",
    description:
      "Ideal for boutique brands, luxury founders, and product launches needing immediate high-impact visuals.",
    turnaround: "48 Hours",
    revisionRounds: 2,
    popular: false,
    ctaText: "Commission Starter (₹3,499)",
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
    price: 7999,
    formattedPrice: "₹7,999",
    tagline: "High-velocity multi-format digital atelier",
    description:
      "Comprehensive creative suite spanning 3D spatial renders, promotional video, and multi-channel Meta ad campaigns.",
    turnaround: "24–72 Hours",
    revisionRounds: 3,
    popular: true,
    ctaText: "Commission Growth (₹7,999)",
    ctaHref: "/orders?package=studio-growth",
    features: [
      "15x High-Resolution 3D & Product Renders",
      "3x 15-Second Video Ads with AI Voiceover",
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
      "Full digital atelier ecosystem: custom Next.js web application, autonomous 3D pipelines, AI automation, and executive direction.",
    turnaround: "Custom Milestone",
    revisionRounds: 99,
    popular: false,
    ctaText: "Inquire for Enterprise",
    ctaHref: "/contact?package=bespoke-enterprise",
    features: [
      "Bespoke Next.js 16 Web Application / Portal Build",
      "Autonomous Production Automation Pipelines",
      "Dedicated 3D Asset Modeling & Spatial Renders",
      "Cross-Platform Mobile App Setup (Expo / PWA)",
      "Custom AI Classifier & Real-Time Sync",
      "Dedicated Senior Art Director & Custom SLA",
      "Private Dedicated Cloud Infrastructure",
    ],
  },
];

/**
 * 2. Monthly Studio Retainer (30-Day Autonomous Campaign Engine)
 */
export const MONTHLY_RETAINER_TIERS: MonthlyRetainerTier[] = [
  {
    id: "autonomous-growth-retainer",
    name: "Autonomous Growth Retainer",
    priceMonthly: 14999,
    formattedMonthlyPrice: "₹14,999/month",
    tagline: "30-Day Continuous Creative Technology & Content Engine",
    description:
      "Your outsourced luxury creative department. Continuous daily active queue delivering brand graphics, commercial motion shorts, and spatial visualization.",
    turnaround: "Daily Active Queue",
    popular: true,
    ctaText: "Activate Retainer (₹14,999/mo)",
    ctaHref: "/orders?package=autonomous-growth-retainer&cycle=monthly",
    monthlyQuotaDescription: "60+ Master Deliverables / Month across 6 Creative Disciplines",
    features: [
      "Daily 1x 4K Brand Image / Graphic (30 Assets/month) powered by trend research",
      "Daily 1x Commercial Video Reel / Short (30 Assets/month) with voiceover and motion typography",
      "Dedicated 3D Asset Modeling & Spatial Renders",
      "Interactive 360° Virtual Panoramic Tour",
      "Interior / Spatial Visualizations",
      "Meta Ads Creative Variation Pack (Multi-Ratio)",
      "Private Sutra Cloud Vault with Auto-Sync & Instant Downloads",
      "Executive Producer Direct Access & Priority Queue",
    ],
  },
];

/**
 * Default fallback UPI details for zero-fee direct merchant payment
 */
export const STUDIO_PAYMENT_CONFIG = {
  vpa: process.env.NEXT_PUBLIC_MERCHANT_UPI_VPA || "yashjoshi7355-1@okicici",
  payeeName: "Yash Joshi",
  verifiedAccountLabel: "Yash Joshi (Verified Studio Account)",
  merchantName: "Yash Joshi",
  currency: "INR",
  qrImageSrc: "/brand/gpay-qr.png",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919428199999",
};

/**
 * Helper to retrieve tier by unique ID
 */
export function getPricingTier(tierId: string): ProjectTier | MonthlyRetainerTier | undefined {
  const projectTier = PER_PROJECT_TIERS.find((t) => t.id === tierId);
  if (projectTier) return projectTier;
  return MONTHLY_RETAINER_TIERS.find((t) => t.id === tierId);
}

/**
 * Format raw INR number to standard Indian Rupee notation (e.g. ₹14,999)
 */
export function formatCurrencyINR(amount: number | "custom"): string {
  if (amount === "custom") return "Custom Quote";
  return `₹${amount.toLocaleString("en-IN")}`;
}
