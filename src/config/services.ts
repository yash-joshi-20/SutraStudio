/**
 * SUTRA STUDIO — Canonical Services Configuration & Pricing Architecture
 *
 * Defines the 7 core creative and engineering studio disciplines:
 * 1. Commercial Visuals & Motion (Images & Video Reels) - ₹1,499
 * 2. Product 3D Modeling & CGI - ₹2,499
 * 3. 360° Virtual Tours & VR - ₹4,999
 * 4. Interior Architecture & Spatial Staging - Custom Quote
 * 5. Brand Identity & Design Systems - ₹4,999
 * 6. Digital Marketing & Meta Ads Infrastructure - ₹4,999
 * 7. Website & Mobile App Development - Custom Quote
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
  // 1. Commercial Visuals & Motion
  {
    id: "visuals-motion",
    name: "Commercial Visuals & Motion",
    slug: "visuals-and-motion",
    category: "Creative",
    tagline: "4K Key Visuals & Video Reels",
    description:
      "High-fidelity commercial product imagery, luxury brand mockups, and cinematic video reels engineered with studio sound, motion typography, and 4K polish.",
    workflow: "video",
    startingPrice: "₹1,499",
    priceDisplay: "Starting from ₹1,499 (Visuals & Motion Pack)",
    isCustomQuote: false,
    ctaText: "Order Visuals & Motion - ₹1,499",
    ctaHref: "/orders?service=visuals-and-motion",
    deliverables: [
      "4K Photorealistic Master Renders",
      "Commercial Motion Reels (15–30s)",
      "High-Fidelity Studio Voice Narration",
      "Multi-Ratio Ad Formats (1:1, 9:16)",
      "24–48h SLA Turnaround",
    ],
    subBullets: [
      "4K Master Renders + Motion Reel",
      "High-fidelity voiceover & music score",
      "24–48h SLA turnaround",
    ],
    icon: "Video",
    thumbnail:
      "https://image.pollinations.ai/prompt/cinematic%20architectural%20film%20still%2C%20modern%20sandstone%20courtyard%20villa%20at%20sunset%2C%20ambient%20water%20reflection%2C%20anamorphic%20lens%20flare%2C%208k?width=1200&height=800&nologo=true",
    badge: "Image & Reel",
    mediaType: "video",
    mediaFormat: "ProRes / 4K MP4 / PNG",
    turnaround: "24–48 Hours",
    pipelineEngine: "Studio Fidelity 4K Video & Diffusion Suite",
  },

  // 2. Product 3D Modeling & CGI
  {
    id: "3d-modeling",
    name: "Product 3D Modeling & CGI",
    slug: "3d-modeling",
    category: "Design",
    tagline: "High-Precision CAD & Interactive 3D",
    description:
      "Precision 3D product CAD modeling, studio product lighting setups, exploded CGI views, and interactive web-ready WebGL assets.",
    workflow: "three-d",
    startingPrice: "₹2,499",
    priceDisplay: "Starting from ₹2,499 (Interactive WebGL Asset)",
    isCustomQuote: false,
    ctaText: "Order 3D Model - ₹2,499",
    ctaHref: "/orders?service=3d-modeling",
    deliverables: [
      "Interactive WebGL Asset",
      "glTF / USDZ / OBJ Files",
      "PBR Textured Models",
      "Turntable 4K Renders",
      "48h SLA Turnaround",
    ],
    subBullets: [
      "Interactive WebGL 3D Model",
      "glTF, USDZ & OBJ formats",
      "48h SLA turnaround",
    ],
    icon: "Box",
    thumbnail:
      "https://image.pollinations.ai/prompt/luxury%20modern%20armchair%203d%20render%2C%20emerald%20velvet%20and%20brushed%20brass%2C%20studio%20lighting%2C%20isolated%20on%20warm%20ivory%20plinth%2C%20octane%20render%2C%208k?width=1200&height=800&nologo=true",
    badge: "3D Asset",
    mediaType: "3d",
    mediaFormat: "GLTF / USDZ / OBJ (PBR Textures)",
    turnaround: "48 Hours",
    pipelineEngine: "Three.js WebGL + Commercial Studio Fidelity",
  },

  // 3. 360° Virtual Tours & VR
  {
    id: "360-view",
    name: "360° Virtual Tours & VR",
    slug: "360-view",
    category: "Design",
    tagline: "Immersive Panoramic Walkthroughs",
    description:
      "Immersive 360-degree interactive panoramic virtual tours for luxury villas, hospitality spaces, and real-estate showrooms.",
    workflow: "three-sixty",
    startingPrice: "₹4,999",
    priceDisplay: "Starting from ₹4,999 (Panoramic VR Space)",
    isCustomQuote: false,
    ctaText: "Order 360° Tour - ₹4,999",
    ctaHref: "/orders?service=360-view",
    deliverables: [
      "Single Panoramic Virtual Space",
      "Interactive Panorama Viewer",
      "Hotspot Annotations & Map",
      "Embeddable Web Code",
      "48–72h SLA Turnaround",
    ],
    subBullets: [
      "High-res HDR spherical panorama",
      "Interactive hotspot tour",
      "48–72h SLA turnaround",
    ],
    icon: "Compass",
    thumbnail:
      "https://image.pollinations.ai/prompt/equirectangular%20360%20degree%20panoramic%20luxury%20modern%20villa%20interior%2C%20floor%20to%20ceiling%20glass%2C%20calacatta%20marble%2C%20warm%20golden%20lighting%2C%208k%20seamless%20hdr%20spherical?width=2048&height=1024&nologo=true",
    badge: "360° VR",
    mediaType: "360",
    mediaFormat: "Equirectangular HDR / WebXR Panoramas",
    turnaround: "48–72 Hours",
    pipelineEngine: "Three.js Equirectangular Spatial Engine",
  },

  // 4. Interior Architecture & Spatial Staging
  {
    id: "interior-design",
    name: "Interior Architecture & Spatial Staging",
    slug: "interior-architecture",
    category: "Design",
    tagline: "Spaces, Renderings & Material Studies",
    description:
      "Photorealistic architectural exterior and interior visualization, luxury room staging, lighting studies, and CAD elevations.",
    workflow: "interior",
    startingPrice: "Custom Quote",
    isCustomQuote: true,
    priceDisplay: "Custom Quote",
    ctaText: "Request Custom Quote",
    ctaHref: "/orders?service=interior-architecture",
    deliverables: [
      "High-Res Architectural Renders",
      "Material & Lighting Pass",
      "Furniture Layout Specs & CAD Elevations",
      "Moodboard & Color Schemes",
    ],
    subBullets: [
      "High-resolution 4K render passes",
      "Full elevation profiles & lighting",
      "48–72h SLA turnaround",
    ],
    icon: "Home",
    thumbnail:
      "https://image.pollinations.ai/prompt/architectural%20interior%20rendering%2C%20minimalist%20luxury%20living%20space%2C%20intricate%20golden%20jali%20screens%2C%20calacatta%20gold%20marble%20floors%2C%20recessed%203000k%20warm%20led%2C%20hasselblad%20photography%2C%208k?width=1200&height=800&nologo=true",
    badge: "Custom Quote",
    mediaType: "image",
    mediaFormat: "High-Res Render Suite (4K PNG / DWG)",
    turnaround: "48–72 Hours",
    pipelineEngine: "Commercial Studio Fidelity + Depth Maps",
  },

  // 5. Brand Identity & Design Systems
  {
    id: "brand-identity",
    name: "Brand Identity & Design Systems",
    slug: "brand-identity",
    category: "Creative",
    tagline: "Visual Identity, Typography & Guidelines",
    description:
      "Complete visual identities, luxury typography hierarchy, vector design tokens, brand book, and asset packages.",
    workflow: "brand",
    startingPrice: "₹4,999",
    isCustomQuote: false,
    priceDisplay: "Starting from ₹4,999 (Complete Brand Book)",
    ctaText: "Commission Brand System - ₹4,999",
    ctaHref: "/orders?service=brand-identity",
    deliverables: [
      "Vector Logo Master Suite (SVG/EPS/PNG)",
      "Typography & Color Token Guidelines",
      "Comprehensive Brand Stylebook PDF",
      "Social Media Identity Kit",
      "72h SLA Turnaround",
    ],
    subBullets: [
      "Full vector logo assets & typography",
      "Comprehensive digital brand guide",
      "72h SLA turnaround",
    ],
    icon: "Palette",
    thumbnail:
      "https://image.pollinations.ai/prompt/luxury%20minimalist%20brand%20identity%20guidelines%20book%20mockup%2C%20gold%20foil%20embossed%20lotus%20emblem%2C%20warm%20ivory%20stationery%2C%20business%20cards%2C%20studio%20lighting%2C%208k?width=1200&height=800&nologo=true",
    badge: "Brand Identity",
    mediaType: "image",
    mediaFormat: "Vector SVG / PDF / AI / High-Res PNG",
    turnaround: "72 Hours",
    pipelineEngine: "Sutra Brand Architecture & Typography Engine",
  },

  // 6. Digital Marketing & Meta Ads Infrastructure
  {
    id: "digital-marketing-ads",
    name: "Digital Marketing & Meta Ads",
    slug: "digital-marketing-ads",
    category: "Marketing",
    tagline: "Growth Strategy, Meta Ads & Creatives",
    description:
      "Data-driven creative growth strategies, end-to-end Facebook & Instagram campaign setups, high-converting creative ad variations, copy testing, and optimization.",
    workflow: "social",
    startingPrice: "₹4,999",
    isCustomQuote: false,
    priceDisplay: "Starting from ₹4,999 (Campaign Setup & 5 Ad Packs)",
    ctaText: "Launch Ad Campaign - ₹4,999",
    ctaHref: "/orders?service=digital-marketing-ads",
    deliverables: [
      "Targeting & Funnel Blueprint",
      "5 Creative Ad Variations (1:1, 9:16, 16:9)",
      "Conversion Pixel / CAPI Tracking Setup",
      "Copywriting & Audience Optimization",
      "48h SLA Turnaround",
    ],
    subBullets: [
      "5 high-converting ad variations",
      "End-to-end Meta ads campaign setup",
      "48h SLA turnaround",
    ],
    icon: "TrendingUp",
    thumbnail:
      "https://image.pollinations.ai/prompt/luxury%20digital%20marketing%20analytics%20growth%20dashboard%2C%20dark%20obsidian%20glass%2C%20golden%20wireframe%20holographic%20charts%2C%20cinematic%20lighting%2C%208k?width=1200&height=800&nologo=true",
    badge: "Meta & Growth",
    mediaType: "interactive",
    mediaFormat: "Multi-Ratio Ad Pack (1:1, 9:16, 16:9) + Strategy Deck",
    turnaround: "48 Hours",
    pipelineEngine: "Commercial Studio Fidelity Pipeline + Growth Engine",
  },

  // 7. Website & Mobile App Development
  {
    id: "web-mobile-dev",
    name: "Website & Mobile App Development",
    slug: "web-mobile-development",
    category: "Development",
    tagline: "Next.js Web Platforms & iOS / Android Apps",
    description:
      "High-performance bespoke websites, client portals, SaaS dashboards, and cross-platform native iOS & Android applications.",
    workflow: "website",
    startingPrice: "Custom Quote",
    isCustomQuote: true,
    priceDisplay: "Custom Quote",
    ctaText: "Scope Engineering Build",
    ctaHref: "/orders?service=web-mobile-development",
    deliverables: [
      "Production-Ready Next.js & React Native Code",
      "Cross-Platform Mobile Builds (iOS & Android)",
      "Full Responsive UI & Fluid Micro-interactions",
      "SEO & Meta Architecture",
      "5–14 Days Delivery",
    ],
    subBullets: [
      "Full responsive web & mobile code",
      "Next.js, TypeScript & React Native",
      "Sub-second page speeds guaranteed",
    ],
    icon: "Globe",
    thumbnail:
      "https://image.pollinations.ai/prompt/macbook%20pro%20titanium%20and%20iphone%2016%20pro%20displaying%20sutra%20studio%20luxury%20app%20interface%2C%20gold%20lotus%20emblem%2C%20architectural%20desk%2C%20soft%20ambient%20lighting%2C%208k?width=1200&height=800&nologo=true",
    badge: "Custom Quote",
    mediaType: "code",
    mediaFormat: "Next.js / TypeScript / React Native / Tailwind CSS",
    turnaround: "5–14 Days",
    pipelineEngine: "High-Performance Full-Stack & Mobile Architecture",
  },
];
