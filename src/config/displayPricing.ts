import { findPackageById } from "./packages";
import type { RetainerPackage } from "./packages";

/**
 * ============================================================================
 * SUTRA STUDIO — DISPLAY PRICING CONFIGURATION (STEP 4)
 * ----------------------------------------------------------------------------
 * Single source of truth for the frontend-only pricing catalogue rendered on
 * `/pricing`:
 *
 *   SECTION A — one-time single-service prices (fixed items + scope ranges)
 *   SECTION B — monthly creative packages
 *
 * IMPORTANT:
 * These are PROPOSED display prices for review. This module is frontend-only
 * presentation data — it is NOT read by server-side price validation, the
 * order API, payment processing, or Firestore. Checkout always re-validates
 * the authoritative catalogue in `@/config/services` and `@/config/packages`,
 * so no customer is ever charged based solely on this page.
 *
 * Monthly package prices here are guarded against the canonical retainer
 * packages by `scripts/test-display-pricing.mjs` (drift check) and the
 * package CTAs flow into the existing `/packages` and `/new-order` routes.
 * ============================================================================
 */

export type DisplayPriceCategory =
  | "Creative"
  | "Design"
  | "Marketing"
  | "Development";

export const DISPLAY_PRICE_CATEGORIES: readonly DisplayPriceCategory[] = [
  "Creative",
  "Design",
  "Marketing",
  "Development",
];

/* --------------------------------------------------------------------------
 * SECTION A (1/2) — Fixed-price single-service items (one-time, INR)
 * -------------------------------------------------------------------------- */

export interface FixedDisplayPriceItem {
  /** Stable identifier (unique across all fixed items). */
  id: string;
  /** Canonical catalog slug — resolves the existing `/services/[slug]` route. */
  serviceSlug: string;
  /** Public service name (matches the eight main services). */
  serviceName: string;
  /** Service category used by the /pricing filter pills. */
  category: DisplayPriceCategory;
  /** Customer-facing item label. */
  item: string;
  /** One-time display price in INR (whole rupees). */
  price: number;
  /** Billing unit, e.g. "per design", "per video". */
  unit: string;
}

export const DISPLAY_FIXED_PRICE_ITEMS: readonly FixedDisplayPriceItem[] = [
  // IMAGE CREATION
  {
    id: "image-social-media-post",
    serviceSlug: "image-creation",
    serviceName: "Image Creation",
    category: "Creative",
    item: "Social media post",
    price: 299,
    unit: "per design",
  },
  {
    id: "image-premium-promotional-design",
    serviceSlug: "image-creation",
    serviceName: "Image Creation",
    category: "Creative",
    item: "Premium promotional design",
    price: 499,
    unit: "per design",
  },
  {
    id: "image-ad-banner",
    serviceSlug: "image-creation",
    serviceName: "Image Creation",
    category: "Creative",
    item: "Ad banner",
    price: 499,
    unit: "per design",
  },
  {
    id: "image-thumbnail-reel-cover",
    serviceSlug: "image-creation",
    serviceName: "Image Creation",
    category: "Creative",
    item: "Thumbnail / Reel cover",
    price: 299,
    unit: "per design",
  },
  {
    id: "image-ai-product-visual",
    serviceSlug: "image-creation",
    serviceName: "Image Creation",
    category: "Creative",
    item: "AI product visual",
    price: 499,
    unit: "per image",
  },
  {
    id: "image-logo-concept",
    serviceSlug: "image-creation",
    serviceName: "Image Creation",
    category: "Creative",
    item: "Logo concept",
    price: 999,
    unit: "per concept",
  },
  {
    id: "image-three-logo-concepts",
    serviceSlug: "image-creation",
    serviceName: "Image Creation",
    category: "Creative",
    item: "Three logo concepts",
    price: 1999,
    unit: "per pack",
  },
  {
    id: "image-five-social-posts",
    serviceSlug: "image-creation",
    serviceName: "Image Creation",
    category: "Creative",
    item: "Five social posts",
    price: 1499,
    unit: "per pack",
  },
  {
    id: "image-ten-social-posts",
    serviceSlug: "image-creation",
    serviceName: "Image Creation",
    category: "Creative",
    item: "Ten social posts",
    price: 2499,
    unit: "per pack",
  },

  // VIDEO CREATION
  {
    id: "video-10-15s-ai-reel",
    serviceSlug: "video-creation",
    serviceName: "Video Creation",
    category: "Creative",
    item: "10–15 second AI Reel",
    price: 999,
    unit: "per video",
  },
  {
    id: "video-30s-promotional-reel",
    serviceSlug: "video-creation",
    serviceName: "Video Creation",
    category: "Creative",
    item: "30-second promotional Reel",
    price: 1499,
    unit: "per video",
  },
  {
    id: "video-30-40s-ai-advertisement",
    serviceSlug: "video-creation",
    serviceName: "Video Creation",
    category: "Creative",
    item: "30–40 second AI advertisement",
    price: 1999,
    unit: "per video",
  },
  {
    id: "video-60s-promotional-video",
    serviceSlug: "video-creation",
    serviceName: "Video Creation",
    category: "Creative",
    item: "60-second promotional video",
    price: 2999,
    unit: "per video",
  },
  {
    id: "video-premium-60s-advertisement",
    serviceSlug: "video-creation",
    serviceName: "Video Creation",
    category: "Creative",
    item: "Premium 60-second advertisement",
    price: 4999,
    unit: "per video",
  },
  {
    id: "video-five-15s-reels",
    serviceSlug: "video-creation",
    serviceName: "Video Creation",
    category: "Creative",
    item: "Five 15-second Reels",
    price: 3999,
    unit: "per pack",
  },
  {
    id: "video-ten-15s-reels",
    serviceSlug: "video-creation",
    serviceName: "Video Creation",
    category: "Creative",
    item: "Ten 15-second Reels",
    price: 7499,
    unit: "per pack",
  },
];

/* --------------------------------------------------------------------------
 * SECTION A (2/2) — Scoped-price services (range only, quote-based)
 * -------------------------------------------------------------------------- */

export interface ScopedDisplayPriceItem {
  /** Stable identifier (unique across all scoped services). */
  id: string;
  /** Canonical catalog slug — resolves the existing `/services/[slug]` route. */
  serviceSlug: string;
  /** Public service name (matches the eight main services). */
  serviceName: string;
  /** Service category used by the /pricing filter pills. */
  category: DisplayPriceCategory;
  /** Lower bound of the proposed display range (INR). */
  minPrice: number;
  /** Upper bound of the proposed display range (INR). */
  maxPrice: number;
  /** Human-readable qualifier, e.g. "depending on scope". */
  scopeNote: string;
}

export const DISPLAY_SCOPED_PRICE_ITEMS: readonly ScopedDisplayPriceItem[] = [
  {
    id: "scoped-3d-modeling",
    serviceSlug: "3d-modeling",
    serviceName: "3D Modeling",
    category: "Design",
    minPrice: 1999,
    maxPrice: 9999,
    scopeNote: "depending on scope",
  },
  {
    id: "scoped-360-view",
    serviceSlug: "360-view",
    serviceName: "360° View",
    category: "Design",
    minPrice: 2999,
    maxPrice: 9999,
    scopeNote: "depending on scope",
  },
  {
    id: "scoped-web-designing",
    serviceSlug: "website-development",
    serviceName: "Web Designing",
    category: "Development",
    minPrice: 2999,
    maxPrice: 9999,
    scopeNote: "depending on scope",
  },
  {
    id: "scoped-digital-marketing",
    serviceSlug: "digital-marketing",
    serviceName: "Digital Marketing",
    category: "Marketing",
    minPrice: 4999,
    maxPrice: 9999,
    scopeNote: "per defined monthly scope",
  },
  {
    id: "scoped-web-development",
    serviceSlug: "web-app-development",
    serviceName: "Web Development",
    category: "Development",
    minPrice: 9999,
    maxPrice: 19999,
    scopeNote: "for limited-scope projects",
  },
  {
    id: "scoped-app-development",
    serviceSlug: "mobile-app-setup",
    serviceName: "App Development",
    category: "Development",
    minPrice: 4999,
    maxPrice: 19999,
    scopeNote: "for prototypes or limited frontend work",
  },
];

/* --------------------------------------------------------------------------
 * SECTION B — Monthly creative packages (recurring, INR per 30 days)
 * -------------------------------------------------------------------------- */

export interface DisplayMonthlyPackage {
  /** Stable identifier. */
  id: string;
  /**
   * Slug of the approved canonical retainer package this proposal maps to
   * (`@/config/packages`). Package CTAs use this slug so orders flow through
   * the existing, price-validated checkout — never through display data.
   */
  canonicalSlug: string;
  /** Proposed public package name. */
  name: string;
  /** One-line positioning statement. */
  tagline: string;
  /** Proposed monthly display price in INR (guarded against canonical). */
  monthlyPrice: number;
  /** Monthly image quota. */
  imageCount: number;
  /** Monthly AI video/reel quota. */
  videoCount: number;
  /** Maximum duration of each included video/reel. */
  videoDurationLimit: string;
  /** Customer-facing inclusion lines (quantities, planning, delivery). */
  inclusions: string[];
}

export const DISPLAY_MONTHLY_PACKAGES: readonly DisplayMonthlyPackage[] = [
  {
    id: "starter-creative",
    canonicalSlug: "starter-trend",
    name: "Starter Creative",
    tagline: "Steady creative output for emerging brands",
    monthlyPrice: 9999,
    imageCount: 12,
    videoCount: 4,
    videoDurationLimit: "up to 15 seconds each",
    inclusions: [
      "12 images",
      "4 AI Reels, up to 15 seconds each",
      "Captions and basic content planning",
    ],
  },
  {
    id: "growth-creative",
    canonicalSlug: "growth-trend",
    name: "Growth Creative",
    tagline: "Accelerated output with monthly planning",
    monthlyPrice: 14999,
    imageCount: 20,
    videoCount: 8,
    videoDurationLimit: "up to 15–30 seconds each",
    inclusions: [
      "20 images",
      "8 AI Reels, up to 15–30 seconds each",
      "Captions, hashtags and monthly content calendar",
    ],
  },
  {
    id: "daily-creative-pro",
    canonicalSlug: "daily-trend-creator",
    name: "Daily Creative Pro",
    tagline: "High-frequency daily creative pipeline",
    monthlyPrice: 19999,
    imageCount: 30,
    videoCount: 30,
    videoDurationLimit: "up to 10–15 seconds each",
    inclusions: [
      "30 images",
      "30 AI videos, up to 10–15 seconds each",
      "Captions and brand-consistent creative templates",
      "Scheduled daily delivery",
    ],
  },
];

/* --------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */

/** Distinct category filter pills for Section A ("All" is added by the UI). */
export function getDisplayPriceCategories(): DisplayPriceCategory[] {
  const categories: DisplayPriceCategory[] = [];
  const collect = (category: DisplayPriceCategory) => {
    if (!categories.includes(category)) categories.push(category);
  };
  for (const item of DISPLAY_FIXED_PRICE_ITEMS) collect(item.category);
  for (const item of DISPLAY_SCOPED_PRICE_ITEMS) collect(item.category);
  return categories;
}

/** Fixed-price items grouped by canonical service slug (stable order). */
export function getFixedPriceServiceGroups(): {
  serviceSlug: string;
  serviceName: string;
  category: DisplayPriceCategory;
  items: FixedDisplayPriceItem[];
}[] {
  const groups: {
    serviceSlug: string;
    serviceName: string;
    category: DisplayPriceCategory;
    items: FixedDisplayPriceItem[];
  }[] = [];
  for (const item of DISPLAY_FIXED_PRICE_ITEMS) {
    let group = groups.find((g) => g.serviceSlug === item.serviceSlug);
    if (!group) {
      group = {
        serviceSlug: item.serviceSlug,
        serviceName: item.serviceName,
        category: item.category,
        items: [],
      };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}

/** Lowest fixed display price for a service ("From ₹X ..." compare label). */
export function getLowestFixedPrice(serviceSlug: string): number | null {
  const items = DISPLAY_FIXED_PRICE_ITEMS.filter(
    (item) => item.serviceSlug === serviceSlug
  );
  if (items.length === 0) return null;
  return Math.min(...items.map((item) => item.price));
}

/**
 * Resolves the approved canonical retainer package backing a monthly display
 * package — used to show the real billing cycle, revision policy and
 * exclusions at checkout-consistent terms. Returns `undefined` if the
 * canonical slug is unknown or is not a retainer package (guarded by the
 * display pricing test suite).
 */
export function getCanonicalMonthlyPackage(
  canonicalSlug: string
): RetainerPackage | undefined {
  const pkg = findPackageById(canonicalSlug);
  if (!pkg || !("billingCycle" in pkg)) return undefined;
  return pkg as RetainerPackage;
}
