/**
 * SUTRA STUDIO — Master Design Tokens & System Specifications
 * Codified brand identity tokens for SUTRA STUDIO adhering to the approved brand board.
 */

export const SUTRA_COLORS = {
  // Primary Palette
  gold: {
    hex: "#D4A35A",
    variable: "--saffron",
    rgb: "212, 163, 90",
    gradient: "linear-gradient(135deg, #E2B872 0%, #D4A35A 45%, #9B6834 100%)",
    name: "Saffron Gold",
    role: "Brand accent, active badges, gradient highlights, luxury trim",
  },
  deepBrown: {
    hex: "#5C3A1E",
    variable: "--brown",
    rgb: "92, 58, 30",
    name: "Deep Brown Ground",
    role: "Primary action buttons, active navigation pills, luxury grounding",
  },
  charcoal: {
    hex: "#0F172A",
    variable: "--foreground",
    rgb: "15, 23, 42",
    name: "Charcoal Slate",
    role: "Primary typography, high-contrast headings, solid dark surfaces",
  },
  warmIvory: {
    hex: "#FFFDF9",
    variable: "--surface",
    rgb: "255, 253, 249",
    name: "Warm Ivory Surface",
    role: "Card surfaces, elevated panels, client workspaces",
  },
  warmSand: {
    hex: "#F8F5EF",
    variable: "--background",
    rgb: "248, 245, 239",
    name: "Warm Sand Canvas",
    role: "Global body canvas, foundational parchment background",
  },
  sandstoneBorder: {
    hex: "#EADFCB",
    variable: "--border",
    rgb: "234, 223, 203",
    name: "Sandstone Border",
    role: "Subtle structural lines, card perimeter dividers, table borders",
  },
  mutedSlate: {
    hex: "#64748B",
    variable: "--muted",
    rgb: "100, 116, 139",
    name: "Muted Slate",
    role: "Secondary body text, timestamps, captions, metadata labels",
  },
} as const;

export const SUTRA_TYPOGRAPHY = {
  display: {
    fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
    weights: {
      semibold: 600,
      bold: 700,
    },
    letterSpacing: {
      tight: "-0.02em",
      normal: "0em",
      wide: "0.08em",
    },
    role: "Used for 'SUTRA' title, editorial headlines, page titles, section hero text",
  },
  sans: {
    fontFamily: "var(--font-inter), 'Inter', system-ui, -apple-system, sans-serif",
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    letterSpacing: {
      normal: "0em",
      caps: "0.15em",
      tagline: "0.2em",
    },
    role: "Used for 'STUDIO' sub-brand, body copy, tabular records, interface controls",
  },
} as const;

export const SUTRA_LOGOS = {
  primaryHorizontal: "/brand/LOGO/sutra-logo-primary.svg",
  primaryVertical: "/brand/LOGO/sutra-logo-vertical.svg",
  lotusSymbol: "/brand/LOGO/sutra-symbol.svg",
  monogramSymbol: "/brand/LOGO/sutra-monogram.svg",
  appIcon: "/brand/LOGO/sutra-app-icon.svg",
  favicon: "/brand/LOGO/sutra-favicon.svg",
  socialIcon: "/brand/LOGO/sutra-social-icon.svg",
  monochromeBlack: "/brand/LOGO/sutra-logo-black.svg",
  monochromeWhite: "/brand/LOGO/sutra-logo-white.svg",
  watermarkLight: "/brand/LOGO/sutra-watermark-light.svg",
  watermarkDark: "/brand/LOGO/sutra-watermark-dark.svg",
  // Root fallbacks
  rootHorizontal: "/brand/logo_horizontal_primary.svg",
  rootVertical: "/brand/logo_vertical_primary.svg",
  rootDarkBg: "/brand/logo_horizontal_dark_bg.svg",
  rootWhiteBg: "/brand/logo_horizontal_white_bg.svg",
} as const;

export const SUTRA_PRICING_INR = {
  currency: "INR",
  symbol: "₹",
  tiers: [
    {
      id: "starter",
      name: "Starter Graphics Pack",
      priceINR: "₹9,999",
      billing: "per commission package",
      deliverables: [
        "1 Hero Key Visual + 2 Derivative Formats",
        "Retouched 4K PNG Master Deliverable",
        "Color Variations & Cropping Suite",
        "Private Media Vault Archive",
      ],
    },
    {
      id: "growth",
      name: "Growth Creative Tier",
      priceINR: "₹24,999",
      billing: "per multi-format campaign",
      deliverables: [
        "Multi-Ratio Ad Sets (9:16, 1:1, 16:9)",
        "3D Spatial Product or Architectural Render",
        "Motion Graphic Video Reel with Audio",
        "Priority Executive Producer Support",
      ],
    },
    {
      id: "enterprise",
      name: "Atelier Enterprise",
      priceINR: "₹59,999",
      billing: "bespoke monthly retainer",
      deliverables: [
        "Full Omni-Channel Brand Campaign",
        "Bespoke 360 Virtual Interactive Tour",
        "Complete Web Application Platform",
        "Unlimited Deliverable Archives & Source Assets",
      ],
    },
  ],
  servicesStartingAt: {
    imageCreation: "₹9,999",
    videoCreation: "₹24,999",
    threeDModeling: "₹34,999",
    threeSixtyTour: "₹18,999",
    interiorArchitecture: "₹29,999",
    marketingCampaigns: "₹19,999",
    webDevelopment: "₹39,999",
    appPlatform: "₹49,999",
  },
} as const;

export const SUTRA_RBAC = {
  roles: {
    admin: {
      id: "admin",
      label: "Studio Administrator / Executive Producer",
      canApproveProjects: true,
      canAccessSiteControl: true,
      canViewInternalWorkflows: true,
      canTakeoverChat: true,
      canViewAllClients: true,
      portalPath: "/admin",
    },
    client: {
      id: "client",
      label: "Studio Client Partner",
      canApproveProjects: false, // Official approvals reserved for Admin
      canAccessSiteControl: false,
      canViewInternalWorkflows: false,
      canTakeoverChat: false,
      canViewAllClients: false, // Strict tenant isolation enforced
      portalPath: "/dashboard",
    },
  },
} as const;
