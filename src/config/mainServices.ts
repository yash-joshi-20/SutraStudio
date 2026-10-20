import { findServiceBySlug } from "./services";

/**
 * ============================================================================
 * SUTRA STUDIO — UNIFIED MAIN SERVICES CONFIGURATION (STEP 2)
 * ----------------------------------------------------------------------------
 * Single source of truth for the EIGHT main studio services displayed on the
 * Home Page, the Services listing page, the Footer, and the Chat concierge.
 *
 * - No prices, monthly rates, or package amounts live in this module. Pricing
 *   remains owned by `@/config/services`, `@/config/packages` and
 *   `@/config/pricing` (surfaced on /pricing and /packages only).
 * - Presentation copy (title, short/long description, examples) is defined
 *   here once and reused everywhere, avoiding duplicated service definitions.
 * - Each entry maps to an existing canonical catalog slug so the detail route
 *   `/services/[slug]`, ordering flows, and server-side price validation all
 *   continue to work unchanged.
 * ============================================================================
 */

export type MainServiceIconKey =
  | "image"
  | "video"
  | "box"
  | "compass"
  | "layout"
  | "trendingUp"
  | "globe"
  | "smartphone";

export interface MainServiceDefinition {
  /** Stable identifier (unique across the eight main services). */
  id: string;
  /** Canonical catalog slug — resolves the existing `/services/[slug]` detail route. */
  slug: string;
  /** Public display name of the main service. */
  title: string;
  /** One-line description used on cards and in chat suggestions. */
  shortDescription: string;
  /** Fuller description used on the Services page and detail overviews. */
  description: string;
  /** Concrete work examples shown to customers. */
  examples: string[];
  /** Lucide icon key (rendered by `MAIN_SERVICE_ICONS` in the card component). */
  icon: MainServiceIconKey;
  /** Home hero spotlight label. */
  heroLabel: string;
  /** Home hero spotlight output line. */
  heroOutput: string;
}

export const MAIN_SERVICES: readonly MainServiceDefinition[] = [
  {
    id: "main-image-creation",
    slug: "image-creation",
    title: "Image Creation",
    shortDescription:
      "Social media posts, advertising banners, product images, thumbnails and logo concepts.",
    description:
      "High-impact commercial imagery for brands — scroll-stopping social posts, campaign banners, polished product shots, channel thumbnails, and fresh logo concepts, all art-directed to your brand identity.",
    examples: [
      "Social media posts",
      "Advertising banners",
      "Product images",
      "Thumbnails",
      "Logo concepts",
    ],
    icon: "image",
    heroLabel: "Product & Brand Imagery",
    heroOutput: "4K UHD Photorealistic Visuals",
  },
  {
    id: "main-video-creation",
    slug: "video-creation",
    title: "Video Creation",
    shortDescription:
      "Brand films, commercial reels, promotional advertisements, and short-form video editing.",
    description:
      "Cinematic short-form video engineered for high audience retention — commercial product reels, brand advertisements, Instagram Reels, and studio-edited shorts with motion typography, cinematic color grading, and bespoke sound design.",
    examples: [
      "Commercial product reels",
      "Promotional advertisements",
      "Instagram Reels & Shorts",
      "Short-form video editing",
      "Brand films & teasers",
    ],
    icon: "video",
    heroLabel: "Promotional Reels & Shorts",
    heroOutput: "Commercial Video Cuts & Voiceover",
  },
  {
    id: "main-3d-modeling",
    slug: "3d-modeling",
    title: "3D Modeling",
    shortDescription:
      "Product models, architectural visualization and 3D renders.",
    description:
      "Precision 3D modelling and visualization — product models for e-commerce, architectural visualization for builders and studios, and photorealistic 3D renders ready for web, print and campaigns.",
    examples: [
      "Product models",
      "Architectural visualization",
      "3D renders",
    ],
    icon: "box",
    heroLabel: "3D Product Modeling",
    heroOutput: "Interactive CAD & WebGL Assets",
  },
  {
    id: "main-360-view",
    slug: "360-view",
    title: "360° View",
    shortDescription:
      "Virtual tours for real estate, interiors, offices and showrooms.",
    description:
      "Immersive 360° virtual tours that let clients walk through your space from anywhere — ideal for real estate listings, interior showcases, office walkthroughs and showroom experiences.",
    examples: [
      "Real estate virtual tours",
      "Interior walkthroughs",
      "Office tours",
      "Showroom tours",
    ],
    icon: "compass",
    heroLabel: "360° Virtual Tours",
    heroOutput: "Digital & On-Site Virtual Spaces",
  },
  {
    id: "main-web-designing",
    slug: "website-development",
    title: "Web Designing",
    shortDescription:
      "UI/UX design, website layouts, landing pages and prototypes.",
    description:
      "Thoughtful interface and experience design — UI/UX systems, full website layouts, conversion-focused landing pages, and interactive prototypes that define the look, feel and flow before a single line of code.",
    examples: [
      "UI/UX design",
      "Website layouts",
      "Landing pages",
      "Prototypes",
    ],
    icon: "layout",
    heroLabel: "Website UI/UX & Layout Design",
    heroOutput: "Landing Pages & Interactive Prototypes",
  },
  {
    id: "main-digital-marketing",
    slug: "digital-marketing",
    title: "Digital Marketing",
    shortDescription:
      "Content planning, social media creatives, campaign support and reporting.",
    description:
      "End-to-end digital marketing support — monthly content planning, social media creatives, campaign setup and management, and clear performance reporting that keeps your brand consistently visible.",
    examples: [
      "Content planning",
      "Social media creatives",
      "Campaign support",
      "Reporting",
    ],
    icon: "trendingUp",
    heroLabel: "Digital Marketing & Strategy",
    heroOutput: "Editorial Content Calendars & Trends",
  },
  {
    id: "main-web-development",
    slug: "web-app-development",
    title: "Web Development",
    shortDescription:
      "Business websites, landing pages and scoped web functionality.",
    description:
      "Production-grade web builds on a modern Next.js foundation — business websites, campaign landing pages, and scoped web functionality such as portals, dashboards, authentication and payments.",
    examples: [
      "Business websites",
      "Landing pages",
      "Scoped web functionality",
    ],
    icon: "globe",
    heroLabel: "Website Design & Development",
    heroOutput: "High-Performance Next.js Web Platforms",
  },
  {
    id: "main-app-development",
    slug: "mobile-app-setup",
    title: "App Development",
    shortDescription:
      "Mobile app UI, prototypes and scoped application development.",
    description:
      "Cross-platform mobile applications — polished mobile app UI, interactive prototypes for investor and user testing, and scoped application development for iOS and Android.",
    examples: [
      "Mobile app UI",
      "Prototypes",
      "Scoped application development",
    ],
    icon: "smartphone",
    heroLabel: "Mobile Apps & Prototypes",
    heroOutput: "React Native Expo iOS & Android Apps",
  },
];

export interface MainService extends MainServiceDefinition {
  /** Absolute href of the existing service detail page. */
  detailHref: string;
  /** Canonical catalog category (used for Services page filters). */
  category: string;
  /** Studio sample thumbnail from the canonical catalog (if available). */
  thumbnail: string | null;
  /** Turnaround badge text from the canonical catalog (if available). */
  turnaround: string | null;
  /** First few canonical deliverables — reused, never redefined here. */
  deliverables: string[];
}

/**
 * Returns the eight main services enriched with canonical catalog data
 * (thumbnail, category, turnaround, deliverables) resolved via the existing
 * `findServiceBySlug()` helper. Missing catalog entries degrade gracefully —
 * copy and detail links still render.
 */
export function getMainServices(): MainService[] {
  return MAIN_SERVICES.map((mainService) => {
    const catalogItem = findServiceBySlug(mainService.slug);

    return {
      ...mainService,
      detailHref: `/services/${mainService.slug}`,
      category: catalogItem?.category ?? "Creative",
      thumbnail: catalogItem?.thumbnail ?? null,
      turnaround: catalogItem?.turnaround ?? null,
      deliverables: catalogItem ? catalogItem.deliverables.slice(0, 3) : [],
    };
  });
}

/** Distinct canonical categories of the main services (filter pills). */
export function getMainServiceCategories(): string[] {
  const categories: string[] = [];
  for (const service of getMainServices()) {
    if (!categories.includes(service.category)) {
      categories.push(service.category);
    }
  }
  return categories;
}

/**
 * Resolves a canonical slug (or main-service id) to its enriched main-service
 * definition. Returns `undefined` for catalog SKUs and disciplines that are
 * not part of the eight main services — callers use this to render the
 * price-free main-service experience only where it applies.
 */
export function findMainServiceBySlug(
  slugOrId: string | null | undefined
): MainService | undefined {
  if (!slugOrId) return undefined;
  const normalized = slugOrId.toLowerCase().trim();
  return getMainServices().find(
    (service) =>
      service.slug.toLowerCase() === normalized ||
      service.id.toLowerCase() === normalized
  );
}
