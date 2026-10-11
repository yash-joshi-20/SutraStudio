/**
 * SUTRA STUDIO — Canonical Services Configuration & Single Source of Truth
 *
 * Defines the 12 core studio disciplines:
 * 1. Image Creation (4K Visuals & Brand Renders) - Starting from ₹499
 * 2. Video Creation (Commercial Reels & Motion) - Starting from ₹1,499
 * 3. 3D Modeling (CAD & Interactive 3D Models) - Starting from ₹2,499
 * 4. 360 View (Virtual Tours & Walkthroughs) - Starting from ₹4,999
 * 5. Interior Design (Spaces, Renderings & Elevations) - Custom Quote
 * 6. Window Design (Frames, Facades & Elevations) - Custom Quote
 * 7. Digital Marketing (Growth Strategy & Campaigns) - Starting from ₹4,999
 * 8. Meta Ads Launcher (Paid Acquisition & Creative Packs) - Starting from ₹4,999
 * 9. Website Development (High-Performance Web Platforms) - Custom Quote
 * 10. Web App Development (SaaS Dashboards & Portals) - Custom Quote
 * 11. Mobile App Setup (iOS & Android Applications) - Custom Quote
 * 12. Workflow Automation (Operational Systems & Integrations) - Custom Quote
 */

export interface ServiceDefinition {
  id: string;
  name: string;
  slug: string;
  category: "Creative" | "Design" | "Development" | "Marketing" | "Automation";
  tagline: string;
  description: string;
  workflow: string;
  startingPrice: string;
  priceDisplay?: string;
  isCustomQuote?: boolean;
  ctaText: string;
  ctaHref: string;
  deliverables: string[];
  subBullets?: string[];
  icon: string;
  thumbnail: string;
  badge: string;
  mediaType: "image" | "video" | "3d" | "360" | "interactive" | "code";
  mediaFormat: string;
  turnaround: string;
  pipelineEngine: string;
}

export const SUTRA_SERVICES_CONFIG: ServiceDefinition[] = [
  // 1. Image Creation
  {
    id: "img-creation",
    name: "Commercial Visual Imagery",
    slug: "image-creation",
    category: "Creative",
    tagline: "Commercial Visuals & Key Brand Imagery",
    description:
      "High-fidelity commercial product imagery, luxury brand mockups, and high-impact visual campaign assets crafted for premium commercial presence.",
    workflow: "image",
    startingPrice: "₹2,499",
    priceDisplay: "Starting from ₹2,499 (3-Pack)",
    isCustomQuote: false,
    ctaText: "Order Image Creation",
    ctaHref: "/orders?service=image-creation",
    deliverables: [
      "4K Photorealistic Master Renders",
      "Studio Lighting & Multi-Angle Passes",
      "Lifestyle Ambient Staging",
      "Full Commercial Copyright License",
      "24–48h SLA Delivery",
    ],
    subBullets: [
      "5x Master 4K Renders",
      "Multiple lighting and angle studies",
      "24–48h SLA delivery",
    ],
    icon: "Image",
    thumbnail: "/images/services/image-creation.webp",
    badge: "4K Visuals",
    mediaType: "image",
    mediaFormat: "4K UHD PNG / TIFF (3840×2160)",
    turnaround: "24–48 Hours",
    pipelineEngine: "Commercial Visual Production",
  },

  // 2. Video Creation
  {
    id: "vid-creation",
    name: "Cinematic Motion Reel",
    slug: "video-creation",
    category: "Creative",
    tagline: "Cinematic Ads, Commercial Reels & Shorts",
    description:
      "Engaging 10-to-15 second cinematic video ads, social reels, motion sequences, and studio-narrated commercial clips with high production polish.",
    workflow: "video",
    startingPrice: "₹4,999",
    priceDisplay: "Starting from ₹4,999 (10–15s Master Reel)",
    isCustomQuote: false,
    ctaText: "Order Video Creation",
    ctaHref: "/orders?service=video-creation",
    deliverables: [
      "15–30s Commercial Video Reels",
      "Studio Voiceover Narration & Sound Design",
      "Multi-Ratio Ad Formats (9:16 Vertical, 16:9 Landscape)",
      "Motion Typography & Color Grading",
      "24–48h SLA Delivery",
    ],
    subBullets: [
      "2x Complete commercial reels",
      "Studio voiceover & sound score",
      "24–48h SLA delivery",
    ],
    icon: "Video",
    thumbnail: "/images/services/video-creation.webp",
    badge: "Commercial Reel",
    mediaType: "video",
    mediaFormat: "ProRes 422 / 4K MP4 (24fps / 60fps)",
    turnaround: "24–48 Hours",
    pipelineEngine: "Cinematic Motion Production",
  },

  // 3. 3D Modeling
  {
    id: "3d-modeling",
    name: "Spatial 3D Asset Model",
    slug: "3d-modeling",
    category: "Design",
    tagline: "High-Precision CAD & Interactive 3D Models",
    description:
      "Precision 3D product CAD modeling, studio product lighting setups, exploded views, and interactive web-ready 3D assets.",
    workflow: "three-d",
    startingPrice: "₹5,999",
    priceDisplay: "Starting from ₹5,999 (.GLB Interactive Model)",
    isCustomQuote: false,
    ctaText: "Order 3D Model",
    ctaHref: "/orders?service=3d-modeling",
    deliverables: [
      "Interactive Web-Ready 3D Asset",
      "glTF / USDZ / OBJ Format Exports",
      "4K PBR Textured Materials",
      "Turntable Lighting Stills",
      "48h SLA Delivery",
    ],
    subBullets: [
      "Interactive 3D web model",
      "glTF, USDZ & OBJ formats",
      "48h SLA delivery",
    ],
    icon: "Box",
    thumbnail: "/images/services/3d-modeling.webp",
    badge: "3D Spatial",
    mediaType: "3d",
    mediaFormat: "GLTF / USDZ / OBJ (4K PBR Textures)",
    turnaround: "48 Hours",
    pipelineEngine: "Precision 3D Production",
  },

  // 4. 360 View
  {
    id: "360-view",
    name: "360° Spherical Panoramic Tour",
    slug: "360-view",
    category: "Design",
    tagline: "Immersive Panoramic Virtual Tours",
    description:
      "Immersive 360-degree interactive panoramic virtual tours for luxury villas, hospitality spaces, and commercial showrooms.",
    workflow: "three-sixty",
    startingPrice: "₹7,999",
    priceDisplay: "Starting from ₹7,999 (Panoramic VR Master)",
    isCustomQuote: false,
    ctaText: "Order 360° Tour",
    ctaHref: "/orders?service=360-view",
    deliverables: [
      "Single Panoramic Virtual Space",
      "Interactive Panorama Web Viewer",
      "Hotspot Annotations & Floor Plan Navigation",
      "Embeddable Web Code",
      "48–72h SLA Delivery",
    ],
    subBullets: [
      "High-resolution panoramic virtual space",
      "Interactive hotspot tour",
      "48–72h SLA delivery",
    ],
    icon: "Compass",
    thumbnail: "/images/services/360-view.webp",
    badge: "360° Virtual Tour",
    mediaType: "360",
    mediaFormat: "Equirectangular HDR / Web Panoramas",
    turnaround: "48–72 Hours",
    pipelineEngine: "Virtual Spaces Production",
  },

  // 5. Interior Design
  {
    id: "interior-design",
    name: "Interior Architectural Visualization",
    slug: "interior-design",
    category: "Design",
    tagline: "Spaces, Renderings & Material Studies",
    description:
      "Photorealistic architectural interior visualization, luxury room staging, natural lighting studies, and material palettes.",
    workflow: "interior",
    startingPrice: "₹6,499",
    priceDisplay: "Starting from ₹6,499 (Spatial Room Renders)",
    isCustomQuote: false,
    ctaText: "Request Custom Quote",
    ctaHref: "/orders?service=interior-design",
    deliverables: [
      "High-Resolution Architectural Renders",
      "Day & Night Lighting Studies",
      "Material Specification & Moodboard Sheets",
      "Furniture Layout & Dimension Spec Sheets",
      "48–72h SLA Delivery",
    ],
    subBullets: [
      "High-resolution 4K render passes",
      "Material and lighting elevation specs",
      "48–72h SLA delivery",
    ],
    icon: "Home",
    thumbnail: "/images/services/interior-design.webp",
    badge: "Spatial Interior",
    mediaType: "image",
    mediaFormat: "High-Res Render Suite (4K PNG)",
    turnaround: "48–72 Hours",
    pipelineEngine: "Architectural Staging",
  },

  // 6. Window Design
  {
    id: "window-design",
    name: "Facade & Window Design",
    slug: "window-design",
    category: "Design",
    tagline: "Frames, Facades & Architectural Elevations",
    description:
      "Architectural window framing, modern facade elevations, custom glass transmittance studies, and structural elevations.",
    workflow: "design",
    startingPrice: "₹4,499",
    priceDisplay: "Starting from ₹4,499 (Facade & Storefront)",
    isCustomQuote: false,
    ctaText: "Request Custom Quote",
    ctaHref: "/orders?service=window-design",
    deliverables: [
      "Facade Elevation Profiles (CAD / PDF)",
      "Glass Material & Tint Studies",
      "4K Exterior Perspective Renders",
      "Framing Specification Sheet",
      "24–48h SLA Delivery",
    ],
    subBullets: [
      "CAD elevation profiles",
      "Glass reflection & framing pass",
      "24–48h SLA delivery",
    ],
    icon: "Grid",
    thumbnail: "/images/services/window-design.webp",
    badge: "Facade Elevation",
    mediaType: "image",
    mediaFormat: "CAD Specification / 4K Render Passes",
    turnaround: "24–48 Hours",
    pipelineEngine: "Facade & Elevation Studio",
  },

  // 7. Digital Marketing
  {
    id: "digital-marketing",
    name: "Brand & Editorial Strategy",
    slug: "digital-marketing",
    category: "Marketing",
    tagline: "Growth Strategy, Content Blueprints & Campaigns",
    description:
      "Data-driven creative growth strategies, content blueprints, audience profiling, and brand storytelling campaigns.",
    workflow: "marketing",
    startingPrice: "₹8,999",
    priceDisplay: "Starting from ₹8,999 (Campaign Strategy)",
    isCustomQuote: false,
    ctaText: "Commission Strategy",
    ctaHref: "/orders?service=digital-marketing",
    deliverables: [
      "30-Day Strategic Content Calendar",
      "Editorial Copywriting & Headline Decks",
      "Competitor Trend & Audience Blueprint",
      "Multi-Channel Publishing Matrix",
      "48h SLA Delivery",
    ],
    subBullets: [
      "30-Day content calendar",
      "Direct response copy & hook decks",
      "48h SLA delivery",
    ],
    icon: "TrendingUp",
    thumbnail: "/images/services/digital-marketing.webp",
    badge: "Strategic Growth",
    mediaType: "interactive",
    mediaFormat: "Strategic Presentation Deck / PDF",
    turnaround: "48 Hours",
    pipelineEngine: "Digital Strategy Department",
  },

  // 8. Meta Ads Launcher
  {
    id: "meta-ads-launcher",
    name: "Campaign Creative Suite",
    slug: "meta-ads-launcher",
    category: "Marketing",
    tagline: "Campaign Architecture, Ad Creatives & Audience Targeting",
    description:
      "End-to-end Facebook & Instagram campaign setups, high-converting creative ad variations, copy testing, and audience optimization.",
    workflow: "social",
    startingPrice: "₹7,499",
    priceDisplay: "Starting from ₹7,499 (Multi-Ratio Creative Suite)",
    isCustomQuote: false,
    ctaText: "Launch Ad Campaign",
    ctaHref: "/orders?service=meta-ads-launcher",
    deliverables: [
      "5 Creative Ad Variations (1:1, 9:16)",
      "Direct-Response Copywriting Packs",
      "Audience Targeting & Funnel Blueprint",
      "Conversion Tracking Setup & Verification",
      "48h SLA Delivery",
    ],
    subBullets: [
      "5 high-converting ad variations",
      "Targeting blueprint & copy pack",
      "48h SLA delivery",
    ],
    icon: "Share2",
    thumbnail: "/images/services/meta-ads-launcher.webp",
    badge: "Paid Acquisition",
    mediaType: "interactive",
    mediaFormat: "Multi-Ratio Ad Pack (1:1, 9:16, 16:9)",
    turnaround: "48 Hours",
    pipelineEngine: "Campaign Management",
  },

  // 9. Website Development
  {
    id: "website-development",
    name: "Website Development",
    slug: "website-development",
    category: "Development",
    tagline: "High-Performance Brand Portals & Websites",
    description:
      "High-performance bespoke websites engineered with modern web standards, fluid micro-interactions, responsive precision, and fast loading.",
    workflow: "website",
    startingPrice: "Custom Quote",
    priceDisplay: "Custom Quote",
    isCustomQuote: true,
    ctaText: "Scope Web Project",
    ctaHref: "/orders?service=website-development",
    deliverables: [
      "Production-Grade Web Codebase",
      "Fluid Responsive Design (Mobile, Tablet, Desktop)",
      "Search Engine Optimization (SEO) Architecture",
      "Analytics & Domain Deployment",
      "5–7 Days Delivery",
    ],
    subBullets: [
      "Full responsive web engineering",
      "Modern clean architecture & SEO",
      "Sub-second page loading speeds",
    ],
    icon: "Globe",
    thumbnail: "/images/services/website-development.webp",
    badge: "Web Engineering",
    mediaType: "code",
    mediaFormat: "Production Web Application",
    turnaround: "5–7 Days",
    pipelineEngine: "Web Engineering Studio",
  },

  // 10. Web App Development
  {
    id: "web-app-development",
    name: "Web App Development",
    slug: "web-app-development",
    category: "Development",
    tagline: "SaaS Dashboards, Client Portals & Business Software",
    description:
      "Robust web applications, custom client portals, real-time collaboration dashboards, and secure backend integrations.",
    workflow: "app",
    startingPrice: "Custom Quote",
    priceDisplay: "Custom Quote",
    isCustomQuote: true,
    ctaText: "Scope Application Build",
    ctaHref: "/orders?service=web-app-development",
    deliverables: [
      "Full-Stack Application Architecture",
      "Role-Based Authentication & Permissions",
      "Real-Time Data Management",
      "Executive Dashboard & Reporting Views",
      "7–14 Days Delivery",
    ],
    subBullets: [
      "Complete custom dashboard & portal",
      "Role security & client workspace",
      "Scalable cloud architecture",
    ],
    icon: "Layout",
    thumbnail: "/images/services/web-app-development.webp",
    badge: "Custom Software",
    mediaType: "code",
    mediaFormat: "Cloud Application Architecture",
    turnaround: "7–14 Days",
    pipelineEngine: "Software Engineering Studio",
  },

  // 11. Mobile App Setup
  {
    id: "mobile-app-setup",
    name: "Mobile App Setup",
    slug: "mobile-app-setup",
    category: "Development",
    tagline: "iOS & Android Cross-Platform Mobile Applications",
    description:
      "Cross-platform bespoke iOS & Android mobile applications sharing unified cloud backends, real-time sync, and notification capabilities.",
    workflow: "mobile",
    startingPrice: "Custom Quote",
    priceDisplay: "Custom Quote",
    isCustomQuote: true,
    ctaText: "Scope Mobile App",
    ctaHref: "/orders?service=mobile-app-setup",
    deliverables: [
      "Cross-Platform Mobile Application Build",
      "Production-Ready App Store & Play Store Packages",
      "Push Notification & Account Binding",
      "Offline Caching & Biometric Support",
      "10–14 Days Delivery",
    ],
    subBullets: [
      "Native iOS & Android builds",
      "Push notifications & secure auth",
      "App store readiness",
    ],
    icon: "Smartphone",
    thumbnail: "/images/services/mobile-app-setup.webp",
    badge: "iOS & Android",
    mediaType: "code",
    mediaFormat: "Cross-Platform Mobile Application",
    turnaround: "10–14 Days",
    pipelineEngine: "Mobile Engineering Studio",
  },

  // 12. Workflow Automation
  {
    id: "workflow-automation",
    name: "Workflow Automation",
    slug: "workflow-automation",
    category: "Automation",
    tagline: "Integrated Digital Operations & Custom Integrations",
    description:
      "Custom business operational systems, secure cloud webhook integrations, data synchronization, and automated project routing.",
    workflow: "automation",
    startingPrice: "Custom Quote",
    priceDisplay: "Custom Quote",
    isCustomQuote: true,
    ctaText: "Scope Automation",
    ctaHref: "/orders?service=workflow-automation",
    deliverables: [
      "Automated Operational Blueprints",
      "Secure Webhook & Integration Configuration",
      "Automated Asset Routing & Notification Delivery",
      "Fail-Safe Monitoring & Execution Logging",
      "48–72h SLA Delivery",
    ],
    subBullets: [
      "Custom operations blueprints",
      "Webhook and cloud integrations",
      "48–72h SLA delivery",
    ],
    icon: "Cpu",
    thumbnail: "/images/services/workflow-automation.webp",
    badge: "Automation",
    mediaType: "code",
    mediaFormat: "Cloud Workflow & Integration Engine",
    turnaround: "48–72 Hours",
    pipelineEngine: "Solutions Engineering",
  },
];

/**
 * Universal slug resolution map supporting canonical slugs, IDs, and legacy aliases
 */
export const SERVICE_SLUG_ALIASES: Record<string, string> = {
  // Legacy aliases
  "visuals-and-motion": "image-creation",
  "visuals-motion": "image-creation",
  "img-creation": "image-creation",
  "vid-creation": "video-creation",
  "interior-architecture": "interior-design",
  "brand-identity": "digital-marketing",
  "digital-marketing-ads": "meta-ads-launcher",
  "web-mobile-development": "website-development",
  "web-mobile-dev": "website-development",
  "web-dev": "website-development",
  "webapp-dev": "web-app-development",
  "mobile-setup": "mobile-app-setup",
  "ai-automation": "workflow-automation",
};

/**
 * Resolve any service slug or ID to its canonical definition
 */
export function findServiceBySlug(slugOrId: string): ServiceDefinition | undefined {
  if (!slugOrId) return undefined;
  const normalized = slugOrId.toLowerCase().trim();
  const canonicalSlug = SERVICE_SLUG_ALIASES[normalized] || normalized;

  return (
    SUTRA_SERVICES_CONFIG.find(
      (s) =>
        s.slug.toLowerCase() === canonicalSlug ||
        s.id.toLowerCase() === canonicalSlug ||
        s.slug.toLowerCase() === normalized ||
        s.id.toLowerCase() === normalized
    ) || undefined
  );
}
