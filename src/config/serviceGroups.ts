/**
 * SUTRA STUDIO — Customer-Facing Service Catalog Groups
 *
 * Presentation-only grouping of the CANONICAL catalog defined in
 * `@/config/services`. This file deliberately stores NO prices:
 *
 * - Every group entry resolves to a canonical `CanonicalServiceItem`, so the
 *   price shown on service cards, service detail pages, order forms, checkout
 *   and Admin always comes from the single authoritative pricing source.
 * - Quantity options (1 / 3 / 5 image packs, reel packs, …) are expressed as
 *   real canonical SKUs — never as locally computed or duplicated prices.
 *
 * Groups follow the customer's buying intent (what do I want to buy?) rather
 * than internal production disciplines.
 */

import {
  findServiceBySlug,
  formatCurrencyINR,
  computeItemTotal,
  type CanonicalServiceItem,
} from "@/config/services";

export type ServiceGroupId =
  | "image-design"
  | "video-advertising"
  | "logo-branding"
  | "spatial-3d"
  | "interior-design"
  | "digital-marketing"
  | "web-development"
  | "app-development";

export interface ServiceCatalogOption {
  /** Customer-facing quantity label, e.g. "1 image", "3 images", "5 reels". */
  label: string;
  /** Resolved canonical SKU for this quantity option. */
  item: CanonicalServiceItem;
}

export interface ServiceCatalogEntry {
  /** Canonical slug of the base purchasable service. */
  slug: string;
  /** Base canonical service (single source of truth for price & scope). */
  item: CanonicalServiceItem;
  /**
   * Quantity / pack options built from real canonical SKUs.
   * Empty when the service is a single fixed-scope deliverable.
   */
  options: ServiceCatalogOption[];
}

export interface ServiceCatalogGroup {
  id: ServiceGroupId;
  /** Editorial index letter shown in the section header (A, B, C…). */
  index: string;
  title: string;
  /** One-line, customer-friendly explanation of what this group covers. */
  blurb: string;
  entries: ServiceCatalogEntry[];
}

/**
 * Quantity families: which canonical SKUs represent 1 / 3 / 5 / 10 units of
 * the same deliverable. Labels are derived from the canonical `quantity`
 * field of each resolved SKU — nothing is hard-coded twice.
 */
const QUANTITY_FAMILIES: Record<
  string,
  { unit: "image" | "reel" | "video"; variants: string[] }
> = {
  "basic-template-image": {
    unit: "image",
    variants: ["basic-template-image", "basic-image-pack-3"],
  },
  "branded-social-image": {
    unit: "image",
    variants: [
      "branded-social-image",
      "branded-image-pack-3",
      "branded-image-pack-5",
      "branded-image-pack-10",
    ],
  },
  "basic-template-video-10s": {
    unit: "video",
    variants: ["basic-template-video-10s", "basic-video-pack-3"],
  },
  "promotional-reel-30s": {
    unit: "reel",
    variants: [
      "promotional-reel-30s",
      "promotional-reels-pack-3",
      "promotional-reels-pack-5",
      "promotional-reels-pack-10",
    ],
  },
};

/**
 * Group definitions — 8 explicit categories conforming to the approved service catalog.
 */
const GROUP_DEFINITIONS: Array<{
  id: ServiceGroupId;
  index: string;
  title: string;
  blurb: string;
  slugs: string[];
}> = [
  {
    id: "image-design",
    index: "A",
    title: "Image & Creative Design",
    blurb:
      "Social media ad visuals, promotional campaign creatives, website banners, carousel decks, and product image retouching.",
    slugs: [
      "branded-social-image",
      "basic-template-image",
      "ai-product-creative",
      "banner-cover-design",
      "social-carousel-5-slides",
      "product-image-cleanup",
    ],
  },
  {
    id: "video-advertising",
    index: "B",
    title: "Video & Advertising",
    blurb:
      "Dynamic commercial promo reels, short advertising video cuts, AI product reels, and template motion graphics.",
    slugs: [
      "promotional-reel-30s",
      "ai-product-reel-30s",
      "basic-template-video-10s",
    ],
  },
  {
    id: "logo-branding",
    index: "C",
    title: "Logo & Branding",
    blurb:
      "Bespoke vector logo design, monogram lockups, brand color systems, and comprehensive style guide kits.",
    slugs: ["logo-design", "brand-identity-starter"],
  },
  {
    id: "spatial-3d",
    index: "D",
    title: "3D & Visualization",
    blurb:
      "3D product modeling, photorealistic 4K CAD renders, 10s motion animations, and 360° virtual tours.",
    slugs: [
      "simple-3d-model",
      "3d-render-from-model",
      "simple-3d-animation-10s",
      "digital-360-tour-supplied",
      "local-360-capture-tour",
    ],
  },
  {
    id: "interior-design",
    index: "E",
    title: "Interior Design & Architecture",
    blurb:
      "Interior spatial CGI, residential/commercial room concepts, isometric 3D floor plans, and exterior facade renders.",
    slugs: [
      "basic-interior-viz-view",
      "single-room-starter",
      "3d-floor-plan",
      "facade-elevation-render",
    ],
  },
  {
    id: "digital-marketing",
    index: "F",
    title: "Digital Marketing & Strategy",
    blurb:
      "Meta Ads campaign management, 30-day editorial content planning, trending topic intelligence, and organic SEO.",
    slugs: [
      "social-media-management",
      "meta-ads-management",
      "30-day-content-calendar",
      "trending-topic-research",
      "seo-starter",
      "caption-hashtags",
    ],
  },
  {
    id: "web-development",
    index: "G",
    title: "Web Development",
    blurb:
      "High-conversion Next.js 16 landing pages, 5-page studio web architecture, boutique e-commerce, and SaaS prototypes.",
    slugs: [
      "landing-page-starter",
      "business-website-5-pages",
      "starter-ecommerce",
      "web-app-prototype",
    ],
  },
  {
    id: "app-development",
    index: "H",
    title: "App Development",
    blurb:
      "Cross-platform mobile app prototypes, user journey mapping, and interactive iOS & Android UI/UX architectures.",
    slugs: ["mobile-app-prototype"],
  },
];

function resolveEntry(slug: string): ServiceCatalogEntry | null {
  const item = findServiceBySlug(slug);
  if (!item || item.active === false) return null;

  const family = QUANTITY_FAMILIES[slug];
  const options: ServiceCatalogOption[] = [];

  if (family) {
    for (const variantSlug of family.variants) {
      const variant = findServiceBySlug(variantSlug);
      if (!variant || variant.active === false) continue;
      const qty = Math.max(1, variant.quantity || 1);
      options.push({
        label: `${qty} ${family.unit}${qty > 1 ? "s" : ""}`,
        item: variant,
      });
    }
  }

  return { slug: item.slug, item, options };
}

/**
 * The complete public service catalog, grouped by what the customer wants to
 * buy. Prices are resolved from the canonical catalog at module load.
 */
export const SERVICE_CATALOG_GROUPS: ServiceCatalogGroup[] = GROUP_DEFINITIONS.map(
  (def) => ({
    id: def.id,
    index: def.index,
    title: def.title,
    blurb: def.blurb,
    entries: def.slugs
      .map(resolveEntry)
      .filter((entry): entry is ServiceCatalogEntry => entry !== null),
  })
).filter((group) => group.entries.length > 0);

/** Flat list of every purchasable entry on the public catalog. */
export const SERVICE_CATALOG_ENTRIES: ServiceCatalogEntry[] =
  SERVICE_CATALOG_GROUPS.flatMap((group) => group.entries);

/** Find the group that contains a given canonical slug (if any). */
export function findServiceGroupBySlug(
  slug: string
): ServiceCatalogGroup | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  return SERVICE_CATALOG_GROUPS.find((group) =>
    group.entries.some(
      (entry) =>
        entry.slug === clean ||
        entry.item.id.toLowerCase() === clean ||
        entry.options.some(
          (option) =>
            option.item.slug === clean || option.item.id.toLowerCase() === clean
        )
    )
  );
}

/** Find a single catalog entry by canonical slug or id. */
export function findServiceCatalogEntry(
  slugOrId: string
): ServiceCatalogEntry | undefined {
  if (!slugOrId) return undefined;
  const clean = slugOrId.toLowerCase().trim();
  return (
    SERVICE_CATALOG_ENTRIES.find(
      (entry) =>
        entry.slug === clean ||
        entry.item.id.toLowerCase() === clean ||
        entry.options.some(
          (option) =>
            option.item.slug === clean || option.item.id.toLowerCase() === clean
        )
    ) || undefined
  );
}

export type ServicePriceKind =
  | "starting_at"
  | "fixed"
  | "per_unit"
  | "pack"
  | "recurring"
  | "custom";

const PRICE_BADGES: Record<string, string> = {
  starting_at: "Starting at",
  fixed: "Fixed price",
  per_unit: "Price per unit",
  pack: "Bundle price",
  recurring: "Monthly",
};

/**
 * Short badge that makes it obvious whether the number a customer sees is a
 * starting price, a fixed final price, a per-unit rate or a bundle.
 */
export function getPriceBadge(item: CanonicalServiceItem): string {
  if (item.isCustomQuote) return "Custom quote";
  return PRICE_BADGES[item.pricingType] || "Price";
}

export function isStartingPrice(item: CanonicalServiceItem): boolean {
  return !item.isCustomQuote && item.pricingType === "starting_at";
}

/** Order deep-link for a canonical item, honouring its canonical ctaHref. */
export function getServiceOrderHref(item: CanonicalServiceItem): string {
  return item.ctaHref || `/orders?service=${item.slug}`;
}

/** Append a quantity to an order deep-link (server-side validated on submit). */
export function appendQuantityToHref(href: string, quantity: number): string {
  const safeQty = Math.max(1, Math.floor(quantity));
  if (safeQty <= 1) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}qty=${safeQty}`;
}

export { formatCurrencyINR, computeItemTotal };
