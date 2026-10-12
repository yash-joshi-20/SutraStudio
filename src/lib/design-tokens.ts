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
  primaryHorizontal: "/brand/sutra-logo-primary.png",
  primaryVertical: "/brand/sutra-logo-vertical.png",
  lotusSymbol: "/brand/sutra-symbol.png",
  monogramSymbol: "/brand/sutra-monogram.png",
  appIcon: "/brand/sutra-app-icon.png",
  favicon: "/brand/sutra-favicon.png",
  socialIcon: "/brand/sutra-social-icon.png",
  monochromeBlack: "/brand/sutra-logo-black.png",
  monochromeWhite: "/brand/sutra-logo-white.png",
  horizontalDark: "/brand/sutra-logo-black.png",
  horizontalBlack: "/brand/sutra-logo-black.png",
  watermarkLight: "/brand/sutra-watermark-light.png",
  watermarkDark: "/brand/sutra-watermark-dark.png",
  brandBoardReference: "/brand/sutra-brand-board-reference.png",
  // Subfolder mappings
  logoPrimary: "/brand/LOGO/sutra-logo-primary.png",
  logoSymbol: "/brand/LOGO/sutra-symbol.png",
  logoVertical: "/brand/LOGO/sutra-logo-vertical.png",
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
    imageCreation: "₹99",
    videoCreation: "₹199",
    threeDModeling: "₹999",
    threeSixtyTour: "₹2,999",
    interiorArchitecture: "₹1,499",
    windowDesign: "₹1,999",
    digitalMarketing: "₹999",
    metaAdsLauncher: "₹4,999",
    websiteDevelopment: "₹4,999",
    webAppDevelopment: "₹19,999",
    mobileAppSetup: "₹9,999",
    aiAutomation: "₹17,999",
  },
} as const;

export const SUTRA_SERVICES_12 = [
  { id: "image", name: "Commercial & Product Image Creation", category: "Creative", price: "₹99", description: "Bespoke 4K brand imagery, campaign visuals, and master key visuals." },
  { id: "video", name: "Promotional Video & Reel Production", category: "Creative", price: "₹199", description: "Cinematic commercial motion reels, product promos, and social ads with audio." },
  { id: "three-d", name: "3D Product Modeling & Visualization", category: "Design", price: "₹999", description: "Photorealistic 3D spatial renders and interactive web-ready GLTF models." },
  { id: "three-sixty", name: "360° Virtual Tours", category: "Design", price: "₹2,999", description: "Immersive 360 virtual architectural and luxury showroom spatial tours." },
  { id: "interior", name: "Interior 3D Visualization", category: "Design", price: "₹1,499", description: "Lighting, materiality, and bespoke spatial layout CGI for architecture." },
  { id: "window", name: "Exterior 3D Visualization", category: "Design", price: "₹1,999", description: "High-end retail storefront visual merchandising and facade styling." },
  { id: "marketing", name: "AI-Powered Digital Marketing", category: "Marketing", price: "₹999", description: "Omni-channel growth creative assets, ad variations, and performance copy." },
  { id: "meta-ads", name: "Meta Ads Campaign Management", category: "Marketing", price: "₹4,999", description: "Direct Facebook/Instagram ad deployment with spend caps and audience sync." },
  { id: "website", name: "Website Design & Development", category: "Development", price: "₹4,999", description: "Editorial luxury web platforms engineered on Next.js with sub-second speed." },
  { id: "web-app", name: "Web Application & Client Portal MVP", category: "Development", price: "₹19,999", description: "Full-stack client portals, customized SaaS engines, and cloud databases." },
  { id: "mobile-app", name: "Mobile App UI Prototype", category: "Development", price: "₹9,999", description: "Cross-platform iOS and Android mobile applications built on Expo/React Native." },
  { id: "automation", name: "Workflow Automation & AI Integration", category: "Automation", price: "Custom Quote", description: "Custom intelligent agent pipelines, CRM sync, and operational automations." },
] as const;

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
