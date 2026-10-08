/**
 * SUTRA STUDIO — Canonical Services Configuration & Pricing Architecture
 *
 * Defines the 12 core creative and engineering services.
 * Strictly adheres to:
 * 1. Standalone Creative Deliverables:
 *    - Image Creation: Starting from ₹499 (5x 4K Photorealistic Master Renders (~₹100/image))
 *    - Video Creation: Starting from ₹1,499 (2x Complete Commercial Reels / Shorts)
 * 2. Bespoke Services: Strictly "Custom Quote" (no fixed pricing)
 *    - Interior Architecture: "Custom Quote", CTA: [Request Spatial Quote]
 *    - Meta Ads Launcher: "Custom Quote", CTA: [Discuss Ad Campaign]
 *    - Website Architecture: "Custom Quote", CTA: [Scope Web Build]
 *    - Mobile App Development: "Custom Quote", CTA: [Scope Mobile App]
 * 3. Jargon-free studio descriptions:
 *    - High-Performance Web Architecture
 *    - Bespoke iOS & Android Mobile Apps
 *    - Commercial Studio Fidelity
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
  // 1. Standalone Creative: Image Creation (₹499)
  {
    id: "img-creation",
    name: "Image Creation",
    slug: "image-creation",
    category: "Creative",
    tagline: "Product, Ads, Mockups",
    description:
      "High-fidelity studio-crafted commercial product imagery, luxury brand mockups, and advertising visual assets.",
    workflow: "image",
    startingPrice: "₹499",
    priceDisplay: "Starting from ₹499 (5x 4K Master Pack)",
    isCustomQuote: false,
    ctaText: "Order 5-Image Pack - ₹499",
    ctaHref: "/orders?service=image-creation",
    deliverables: [
      "5x Ultra-HD 4K Photorealistic Master Renders (~₹100/image)",
      "2x Studio product angles",
      "2x Lifestyle ambient context",
      "1x Ad campaign visual",
      "24h SLA. 100% Commercial rights.",
    ],
    subBullets: [
      "2x Studio product angles",
      "2x Lifestyle ambient context",
      "1x Ad campaign visual",
      "24h SLA turnaround",
    ],
    icon: "Image",
    thumbnail:
      "https://image.pollinations.ai/prompt/luxury%20perfume%20bottle%2C%20obsidian%20glass%2C%2024k%20gold%20cap%2C%20caustic%20refractions%2C%20warm%20saffron%20rim%20lighting%2C%20hasselblad%20commercial%20product%20shot%2C%208k?width=1200&height=800&nologo=true",
    badge: "5x 4K Master Pack",
    mediaType: "image",
    mediaFormat: "PNG / TIFF (3840×2160)",
    turnaround: "24 Hours",
    pipelineEngine: "Studio Proprietary 4K Pipeline",
  },

  // 2. Standalone Creative: Video Creation (₹1,499)
  {
    id: "vid-creation",
    name: "Video Creation",
    slug: "video-creation",
    category: "Creative",
    tagline: "Commercial Reels, Shorts, Motion",
    description:
      "Engaging 15-to-30 second cinematic commercial video ads, social reels, motion sequences, and high-fidelity voiceover-synced promotional clips.",
    workflow: "video",
    startingPrice: "₹1,499",
    priceDisplay: "Starting from ₹1,499 (2x Viral Reels Pack)",
    isCustomQuote: false,
    ctaText: "Order 2-Reels Pack - ₹1,499",
    ctaHref: "/orders?service=video-creation",
    deliverables: [
      "2x Complete Commercial Video Reels / Shorts (15–30 Seconds Each)",
      "1x Product showcase reel + 1x Feature highlight reel",
      "High-fidelity studio voice narration (EN/HI)",
      "Licensed background score & animated subtitles included",
      "24–48h SLA",
    ],
    subBullets: [
      "15–30s each",
      "1x Product showcase reel + 1x Feature highlight reel",
      "High-fidelity studio voice narration (EN/HI), background score, and subtitles included",
      "24–48h SLA turnaround",
    ],
    icon: "Video",
    thumbnail:
      "https://image.pollinations.ai/prompt/cinematic%20architectural%20film%20still%2C%20modern%20sandstone%20courtyard%20villa%20at%20sunset%2C%20ambient%20water%20reflection%2C%20anamorphic%20lens%20flare%2C%208k?width=1200&height=800&nologo=true",
    badge: "2x Viral Reels Pack",
    mediaType: "video",
    mediaFormat: "ProRes / 4K MP4 (24fps)",
    turnaround: "24–48 Hours",
    pipelineEngine: "Commercial Studio Fidelity + Studio Audio Suite",
  },

  // 3. 3D Modeling (Interactive WebGL Asset)
  {
    id: "3d-modeling",
    name: "3D Modeling",
    slug: "3d-modeling",
    category: "Design",
    tagline: "Products, Spaces",
    description:
      "Precision 3D product models, architectural exterior structures, and interactive web-ready 3D assets.",
    workflow: "three-d",
    startingPrice: "₹2,499",
    priceDisplay: "Starting from ₹2,499 (Interactive WebGL Asset)",
    isCustomQuote: false,
    ctaText: "Order 3D Model - ₹2,499",
    ctaHref: "/orders?service=3d-modeling",
    deliverables: [
      "Interactive WebGL Asset",
      "glTF / USDZ Files",
      "PBR Textured Models",
      "Turntable Renders",
      "48h SLA",
    ],
    icon: "Box",
    thumbnail:
      "https://image.pollinations.ai/prompt/luxury%20modern%20armchair%203d%20render%2C%20emerald%20velvet%20and%20brushed%20brass%2C%20studio%20lighting%2C%20isolated%20on%20warm%20ivory%20plinth%2C%20octane%20render%2C%208k?width=1200&height=800&nologo=true",
    badge: "Interactive WebGL Asset",
    mediaType: "3d",
    mediaFormat: "GLTF / USDZ / OBJ (PBR Textures)",
    turnaround: "48 Hours",
    pipelineEngine: "Three.js WebGL + Commercial Studio Fidelity",
  },

  // 4. 360 View (Single Panoramic Virtual Space)
  {
    id: "360-view",
    name: "360 View",
    slug: "360-view",
    category: "Design",
    tagline: "Virtual Tours",
    description:
      "Immersive 360-degree interactive panoramic virtual tours for luxury villas, hospitality spaces, and real-estate showrooms.",
    workflow: "three-sixty",
    startingPrice: "₹3,499",
    priceDisplay: "Starting from ₹3,499 (Single Panoramic Virtual Space)",
    isCustomQuote: false,
    ctaText: "Order 360° Tour - ₹3,499",
    ctaHref: "/orders?service=360-view",
    deliverables: [
      "Single Panoramic Virtual Space",
      "Interactive Panorama Viewer",
      "Hotspot Annotations",
      "Embeddable Web Code",
      "48–72h SLA",
    ],
    icon: "Compass",
    thumbnail:
      "https://image.pollinations.ai/prompt/equirectangular%20360%20degree%20panoramic%20luxury%20modern%20villa%20interior%2C%20floor%20to%20ceiling%20glass%2C%20calacatta%20marble%2C%20warm%20golden%20lighting%2C%208k%20seamless%20hdr%20spherical?width=2048&height=1024&nologo=true",
    badge: "Single Panoramic Virtual Space",
    mediaType: "360",
    mediaFormat: "Equirectangular HDR / WebXR Panoramas",
    turnaround: "48–72 Hours",
    pipelineEngine: "Three.js Equirectangular Spatial Engine",
  },

  // 5. Bespoke Service: Interior Architecture (Custom Quote)
  {
    id: "interior-design",
    name: "Interior Architecture",
    slug: "interior-design",
    category: "Design",
    tagline: "Spaces, Renderings & Staging",
    description:
      "Photorealistic interior architectural visualization, luxury room staging, lighting studies, and bespoke material palettes.",
    workflow: "interior",
    startingPrice: "Custom Quote",
    isCustomQuote: true,
    ctaText: "Request Custom Quote",
    ctaHref: "https://wa.me/918200192781?text=Hello%20Sutra%20Studio%2C%20I%20would%20like%20to%20request%20a%20custom%20quote%20for%20Interior%20Architecture.",
    deliverables: ["High-Res Renders", "Moodboard & Color Schemes", "Furniture Layout Specs"],
    icon: "Home",
    thumbnail:
      "https://image.pollinations.ai/prompt/architectural%20interior%20rendering%2C%20minimalist%20luxury%20living%20space%2C%20intricate%20golden%20jali%20screens%2C%20calacatta%20gold%20marble%20floors%2C%20recessed%203000k%20warm%20led%2C%20hasselblad%20photography%2C%208k?width=1200&height=800&nologo=true",
    badge: "Custom Quote",
    mediaType: "image",
    mediaFormat: "High-Res Render Suite (4K PNG)",
    turnaround: "48–72 Hours",
    pipelineEngine: "Commercial Studio Fidelity + Depth Maps",
  },

  // 6. Window Design (Elevations)
  {
    id: "window-design",
    name: "Window Design",
    slug: "window-design",
    category: "Design",
    tagline: "Frames, Elevations",
    description:
      "Architectural window framing, modern facade elevations, and custom glass architectural visualization.",
    workflow: "window",
    startingPrice: "₹6,499",
    isCustomQuote: false,
    ctaText: "Commission Elevations",
    ctaHref: "/orders?service=window-design",
    deliverables: ["Elevation Profiles", "Glass Material Studies", "Facade Renders"],
    icon: "Grid",
    thumbnail:
      "https://image.pollinations.ai/prompt/modern%20architectural%20facade%20elevation%2C%20geometric%20jali%20brass%20window%20framing%2C%20minimalist%20limestone%20villa%2C%20dramatic%20architectural%20shadows%2C%208k?width=1200&height=800&nologo=true",
    badge: "Elevations",
    mediaType: "image",
    mediaFormat: "CAD DWG / 4K Render Passes",
    turnaround: "24–48 Hours",
    pipelineEngine: "Parametric Facade Modeler + V-Ray",
  },

  // 7. Digital Marketing Strategy
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    slug: "digital-marketing",
    category: "Marketing",
    tagline: "Strategy, Content",
    description:
      "Data-driven creative growth strategies, content blueprints, audience profiling, and brand storytelling campaigns.",
    workflow: "marketing",
    startingPrice: "₹14,999",
    isCustomQuote: false,
    ctaText: "Commission Strategy",
    ctaHref: "/orders?service=digital-marketing",
    deliverables: ["Monthly Content Calendar", "Copywriting Decks", "Competitor Trend Analysis"],
    icon: "TrendingUp",
    thumbnail:
      "https://image.pollinations.ai/prompt/luxury%20digital%20marketing%20analytics%20growth%20dashboard%2C%20dark%20obsidian%20glass%2C%20golden%20wireframe%20holographic%20charts%2C%20cinematic%20lighting%2C%208k?width=1200&height=800&nologo=true",
    badge: "Growth",
    mediaType: "interactive",
    mediaFormat: "PDF Strategy Deck / Notion Workspace",
    turnaround: "3–5 Days",
    pipelineEngine: "Sutra Growth Analytics Engine",
  },

  // 8. Bespoke Service: Meta Ads Launcher (Custom Quote)
  {
    id: "meta-ads",
    name: "Meta Ads Launcher",
    slug: "meta-ads-launcher",
    category: "Marketing",
    tagline: "Campaigns, Ad Creatives",
    description:
      "End-to-end Facebook & Instagram ad campaign setups, high-converting creative ad variations, copy testing, and audience optimization.",
    workflow: "social",
    startingPrice: "Custom Quote",
    isCustomQuote: true,
    ctaText: "Request Custom Quote",
    ctaHref:
      "https://wa.me/918200192781?text=Hello%20Sutra%20Studio%2C%20I%20would%20like%20to%20request%20a%20custom%20quote%20for%20Meta%20Ads%20Launcher.",
    deliverables: ["Targeting Blueprint", "5 Creative Ad Variations", "Conversion Tracking Setup"],
    icon: "Share2",
    thumbnail:
      "https://image.pollinations.ai/prompt/luxury%20digital%20marketing%20analytics%20growth%20dashboard%2C%20dark%20obsidian%20glass%2C%20golden%20wireframe%20holographic%20charts%2C%20cinematic%20lighting%2C%208k?width=1200&height=800&nologo=true",
    badge: "Custom Quote",
    mediaType: "interactive",
    mediaFormat: "Multi-Ratio Ad Pack (1:1, 9:16, 16:9)",
    turnaround: "48 Hours",
    pipelineEngine: "Commercial Studio Fidelity Pipeline",
  },

  // 9. Bespoke Service: Website Architecture (Custom Quote)
  {
    id: "web-dev",
    name: "Website Architecture",
    slug: "website-development",
    category: "Development",
    tagline: "Landing Pages, Websites",
    description:
      "High-performance, bespoke websites engineered with fluid micro-interactions, responsive precision, and sub-second page loads.",
    workflow: "website",
    startingPrice: "Custom Quote",
    isCustomQuote: true,
    ctaText: "Scope Project",
    ctaHref:
      "https://wa.me/918200192781?text=Hello%20Sutra%20Studio%2C%20I%20would%20like%20to%20scope%20a%20project%20for%20Website%20Architecture.",
    deliverables: ["Full Responsive Web Code", "SEO & Meta Optimization", "CMS Integration"],
    icon: "Globe",
    thumbnail:
      "https://image.pollinations.ai/prompt/macbook%20pro%20titanium%20open%20displaying%20sutra%20studio%20luxury%20website%20homepage%20with%20gold%20lotus%20logo%2C%20architectural%20desk%2C%20soft%20ambient%20studio%20lighting%2C%208k?width=1200&height=800&nologo=true",
    badge: "Custom Quote",
    mediaType: "code",
    mediaFormat: "Next.js / TypeScript / Tailwind CSS",
    turnaround: "5–7 Days",
    pipelineEngine: "High-Performance Web Architecture",
  },

  // 10. Web App Development (Portals & SaaS)
  {
    id: "webapp-dev",
    name: "Web App Development",
    slug: "web-app-development",
    category: "Development",
    tagline: "Dashboards, Portals",
    description:
      "Robust SaaS applications, custom client portals, real-time collaboration dashboards, and secure cloud backend integrations.",
    workflow: "app",
    startingPrice: "Custom Quote",
    isCustomQuote: true,
    ctaText: "Scope Project",
    ctaHref:
      "https://wa.me/918200192781?text=Hello%20Sutra%20Studio%2C%20I%20would%20like%20to%20scope%20a%20project%20for%20Web%20App%20Development.",
    deliverables: ["Auth & RBAC", "Real-time Cloud DB", "Production-Ready Code"],
    icon: "Layout",
    thumbnail:
      "https://image.pollinations.ai/prompt/dark%20mode%20saas%20dashboard%20ui%20design%2C%20obsidian%20glassmorphism%2C%20gold%20accent%20charts%2C%20enterprise%20portal%2C%20clean%20modern%2C%208k?width=1200&height=800&nologo=true",
    badge: "Custom Quote",
    mediaType: "interactive",
    mediaFormat: "React / Firestore / Next.js",
    turnaround: "7–14 Days",
    pipelineEngine: "Full-Stack Portal Scaffolder",
  },

  // 11. Bespoke Service: Mobile App Development (Custom Quote)
  {
    id: "mobile-setup",
    name: "Mobile App Development",
    slug: "mobile-app-setup",
    category: "Development",
    tagline: "Android & iOS Apps",
    description:
      "Cross-platform bespoke iOS & Android mobile applications sharing unified cloud backends and APIs.",
    workflow: "app",
    startingPrice: "Custom Quote",
    isCustomQuote: true,
    ctaText: "Scope Project",
    ctaHref:
      "https://wa.me/918200192781?text=Hello%20Sutra%20Studio%2C%20I%20would%20like%20to%20scope%20a%20project%20for%20Mobile%20App%20Development.",
    deliverables: [
      "Bespoke iOS & Android Mobile Apps",
      "iOS & Android Builds",
      "Push Notification Setup",
    ],
    icon: "Smartphone",
    thumbnail:
      "https://image.pollinations.ai/prompt/luxury%20mobile%20app%20interface%20on%20iphone%2016%20pro%2C%20sutra%20studio%20concierge%20screen%2C%20warm%20gold%20accents%2C%20flawless%20ui%2C%208k?width=1200&height=800&nologo=true",
    badge: "Custom Quote",
    mediaType: "interactive",
    mediaFormat: "iOS IPA / Android APK",
    turnaround: "10–14 Days",
    pipelineEngine: "React Native Mobile Engine",
  },

  // 12. Computational Automation & Cloud Workflows
  {
    id: "ai-automation",
    name: "Cloud Automation & Workflows",
    slug: "cloud-automation",
    category: "Automation",
    tagline: "Autonomous Pipelines & Integrations",
    description:
      "Custom automated operational pipelines, secure cloud webhook integrations, intelligent content routing, and automated Vault synchronization.",
    workflow: "automation",
    startingPrice: "₹15,999",
    isCustomQuote: false,
    ctaText: "Commission Pipeline",
    ctaHref: "/orders?service=cloud-automation",
    deliverables: [
      "Automated Workflow Blueprints",
      "Webhook Security Verification",
      "Cloud Vault Automated Pipeline",
    ],
    icon: "Cpu",
    thumbnail:
      "https://image.pollinations.ai/prompt/futuristic%20autonomous%20ai%20workflow%20engine%20core%2C%20glowing%20gold%20neural%20fibers%2C%20cybernetic%20luxury%20server%2C%20dark%20bronze%2C%208k?width=1200&height=800&nologo=true",
    badge: "Automation",
    mediaType: "code",
    mediaFormat: "Cloud Workflow Engine + Secure Webhooks",
    turnaround: "48–72 Hours",
    pipelineEngine: "HMAC Webhook & Vault Router",
  },
];
