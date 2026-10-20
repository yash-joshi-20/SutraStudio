/**
 * SUTRA STUDIO — Multi-Client Brand Profiles & Defaults (Step 08 & 09)
 * 
 * Provides isolated client brand profiles, starting with the authentic flagship
 * Sutra Studio brand profile, and supports creating multi-client profiles with
 * strict tenant boundaries.
 */

import { BrandProfile } from "./types";

export const DEFAULT_SUTRA_STUDIO_BRAND: BrandProfile = {
  id: "brand-sutra-flagship",
  clientUid: "admin-sutra-master",
  brandName: "Sutra Studio",
  tagline: "Tradition Meets Autonomous Technology",
  industry: "Creative Technology & Digital Studio",
  region: "India / Global",
  website: "https://sutrastudio.com",
  targetAudience:
    "Design directors, agency founders, high-growth startups, luxury D2C brands, and modern developers seeking bespoke digital experiences and autonomous creative workflows.",
  productsAndServices: [
    "AI Automation Pipeline & Creative Automation Studio",
    "Digital Platform Engineering (Next.js 16, React 19, TypeScript)",
    "Interactive 3D Spatial Walkthroughs & Three.js 360° Viewers",
    "Luxury Brand Identity Systems & Motion Design",
    "Meta Ads & Programmatic Video Marketing",
    "Fixed-Price Creative Retainers (₹249 to ₹19,999 ceiling)",
  ],
  contentPreferences: {
    voiceTone: "luxury_atelier",
    primaryColor: "#5C3A1E", // Deep Teak
    secondaryColor: "#171717", // Charcoal Slate
    accentColor: "#A98B57", // Muted Brass / Warm Gold
    backgroundColor: "#FAF9F5", // Warm Ivory Base
    fontFamily: "Inter, Playfair Display, Outfit",
    negativeStyleRules: [
      "No dark-mode-first or cyberpunk neon aesthetics",
      "No generic stock business photography of people shaking hands",
      "No fabricated testimonials or fictitious client statistics",
      "No claims of services outside verified studio capabilities",
      "No prices outside the canonical ₹249 to ₹19,999 pricing framework",
    ],
  },
  referenceAssets: [
    {
      id: "ref-sutra-hero-video",
      title: "Hero Ambient Loop",
      fileUrl: "/videos/hero/hero-desktop.mp4",
      mediaType: "video",
      notes: "Flagship aesthetic benchmark: warm travertine, soft golden hour sunlight, sacred geometry.",
    },
    {
      id: "ref-sutra-live-showreel",
      title: "Studio Craftsmanship Showreel",
      fileUrl: "/assets/showcase/live-site-showreel.mp4",
      mediaType: "video",
      notes: "Reference for editing pacing, architectural overlays, and typography placement.",
    },
    {
      id: "ref-sutra-official-emblem",
      title: "Official Sutra Studio Emblem",
      fileUrl: "/brand/logo.svg",
      mediaType: "image",
      notes: "Sacred geometric lotus emblem; strictly keep unaltered.",
    },
  ],
  approvedPromptIds: [
    "prompt-edu-ai-tools-explained",
    "prompt-screen-dashboard-walkthrough",
    "prompt-mktg-brand-introduction",
    "prompt-cinematic-drone-architectural",
    "prompt-interior-3d-transformation",
  ],
  contentCalendar: [
    {
      id: "cal-sutra-01",
      scheduledDate: "2026-10-15T10:00:00Z",
      topic: "How Autonomous Workflows Cut Agency Turnaround by 80%",
      format: "educational_reels",
      status: "planned",
    },
    {
      id: "cal-sutra-02",
      scheduledDate: "2026-10-18T14:00:00Z",
      topic: "Live Walkthrough: Ordering Studio Services Starting at ₹249",
      format: "screen_ui_demo",
      status: "planned",
    },
    {
      id: "cal-sutra-03",
      scheduledDate: "2026-10-22T09:00:00Z",
      topic: "Photorealistic 360° Virtual Tours for Luxury Architecture",
      format: "interior_3d_360",
      status: "planned",
    },
  ],
  createdAt: "2026-10-13T00:00:00Z",
  updatedAt: "2026-10-13T00:00:00Z",
};

/**
 * Example Multi-Client Tenant: Luxe Living Interiors (Client Profile)
 */
export const SAMPLE_CLIENT_BRAND_PROFILE: BrandProfile = {
  id: "brand-client-luxe-living",
  clientUid: "client-demo-tenant-01",
  brandName: "Luxe Living Interiors",
  tagline: "Timeless Spatial Architecture",
  industry: "Interior Architecture & Spatial Design",
  region: "Bengaluru / Mumbai",
  website: "https://luxeliving.example.com",
  targetAudience: "Luxury residential apartment owners and commercial boutique developers.",
  productsAndServices: [
    "Residential Spatial Planning",
    "Custom Teak Wood Cabinetry",
    "Photorealistic 3D Visualizations & Walkthroughs",
  ],
  contentPreferences: {
    voiceTone: "minimal_modern",
    primaryColor: "#2F3E46",
    secondaryColor: "#354F52",
    accentColor: "#CAD2C5",
    backgroundColor: "#F8F9FA",
    fontFamily: "Outfit, Inter",
    negativeStyleRules: [
      "No cluttered frames",
      "No fluorescent commercial lighting",
      "No low-resolution CAD exports",
    ],
  },
  referenceAssets: [],
  approvedPromptIds: [
    "prompt-cinematic-drone-architectural",
    "prompt-interior-3d-transformation",
  ],
  contentCalendar: [
    {
      id: "cal-luxe-01",
      scheduledDate: "2026-10-20T11:00:00Z",
      topic: "Scandinavian Japandi Master Bedroom 3D Walkthrough",
      format: "interior_3d_360",
      status: "planned",
    },
  ],
  createdAt: "2026-10-13T00:00:00Z",
  updatedAt: "2026-10-13T00:00:00Z",
};

export const INITIAL_BRAND_PROFILES: BrandProfile[] = [
  DEFAULT_SUTRA_STUDIO_BRAND,
  SAMPLE_CLIENT_BRAND_PROFILE,
];
