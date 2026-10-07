/**
 * SUTRA STUDIO - Service & Plan Catalog Data (Client Safe)
 *
 * Types and the canonical seed corpus for all 12 services and the plan tiers.
 *
 * This module is deliberately free of server-only, irebase-admin and every
 * other server dependency so that client components (pricing, services, orders,
 * admin) can render catalog copy without dragging the Admin SDK into the browser
 * bundle. Runtime catalog reads and writes live in ./serviceCatalog.ts.
 */

export interface BriefFormField {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "multiselect"
    | "number"
    | "url"
    | "date"
    | "file";
  required: boolean;
  helpText?: string;
  options?: string[];
  defaultValue?: string | number;
}

export interface CatalogService {
  id: string;
  name: string;
  slug: string;
  category: "Creative" | "Design" | "Development" | "Marketing" | "Automation";
  tagline: string;
  shortDescription: string;
  startingPrice: number;
  currency: "INR";
  icon: string;
  active: boolean;
  sortIndex: number;
  estimatedDeliveryDays: number;
  revisionsIncluded: number;
  workflowStages: string[];
  briefSchema: BriefFormField[];
  requiredAssets: string[];
  deliverables: string[];
  badge: string;
  thumbnail: string;
  mediaType: "image" | "video" | "3d" | "360" | "interactive" | "code";
  mediaFormat: string;
  turnaround: string;
  pipelineEngine: string;
  updatedAt: string;
}

export interface CatalogPlan {
  id: string;
  name: string;
  tier: "Starter" | "Growth" | "Enterprise";
  price: number; // Monthly price in INR
  monthlyPrice: number;
  quarterlyPrice: number;
  annualPrice: number;
  features: string[];
  includedServices: Record<string, number>;
  freeTrialDays: number;
  active: boolean;
  sortIndex: number;
  razorpayPlanId: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// SEED CORPUS: ALL 12 CANONICAL DATA-DRIVEN SERVICES
// ----------------------------------------------------------------------------
export const SEED_CATALOG_SERVICES: CatalogService[] = [
  {
    id: "img-creation",
    name: "Image Creation",
    slug: "image-creation",
    category: "Creative",
    tagline: "Product, Ads, Mockups",
    shortDescription:
      "High-fidelity AI-generated and human-perfected commercial product imagery, luxury brand mockups, and advertising visual assets.",
    startingPrice: 3499,
    currency: "INR",
    icon: "Image",
    active: true,
    sortIndex: 1,
    estimatedDeliveryDays: 2,
    revisionsIncluded: 2,
    workflowStages: [
      "Creative Brief & Reference Intake",
      "Diffusion Generation & Staging",
      "Lighting & Retouching Pass",
      "Color Grade & 4K Polish",
      "Client Approval & Vault Sync",
    ],
    briefSchema: [
      {
        key: "useCase",
        label: "Visual Use Case",
        type: "select",
        required: true,
        options: [
          "E-commerce Hero Product",
          "Social Media Ad Campaign",
          "Luxury Brand Packaging Mockup",
          "Editorial / Catalog Feature",
          "Billboard / Print High-Res",
        ],
        helpText: "Select primary commercial destination for the visuals.",
      },
      {
        key: "numberOfImages",
        label: "Number of Visuals Required",
        type: "number",
        required: true,
        defaultValue: 3,
        helpText: "Standard single commission includes 3-5 multi-angle passes.",
      },
      {
        key: "dimensions",
        label: "Aspect Ratio & Dimensions",
        type: "select",
        required: true,
        options: [
          "1:1 Square (1080x1080 / 4K Square)",
          "4:5 Portrait (1080x1350 Instagram Feed)",
          "9:16 Vertical (Story / Reels / TikTok)",
          "16:9 Landscape (Hero Banner / Web)",
          "Custom High-Resolution",
        ],
      },
      {
        key: "brandColors",
        label: "Brand Color Palette & Mood",
        type: "text",
        required: false,
        helpText: "e.g. Warm ivory (#FAF9F5), muted brass (#A98B57), deep charcoal",
      },
      {
        key: "backgroundType",
        label: "Background Environment",
        type: "select",
        required: true,
        options: [
          "Studio White / Minimal Seamless",
          "Architectural Interior / Luxury Staging",
          "Natural Warm Sunlight / Outdoor",
          "Gradient & Abstract Sacred Geometry",
          "Isolated Transparent Alpha PNG",
        ],
      },
      {
        key: "styleReferences",
        label: "Style References & Specific Prompts",
        type: "textarea",
        required: false,
        helpText: "Add URLs or descriptions of lighting, materials, and angles you admire.",
      },
    ],
    requiredAssets: [
      "Product Clean Photography or Sketches",
      "Brand Vector Mark (SVG / AI / PNG)",
      "Target Moodboard or Reference Links",
    ],
    deliverables: [
      "4K Ultra-High Resolution Renders (PNG / TIFF)",
      "Commercial Usage & Copyright License",
      "Multi-Angle Staging Passes",
    ],
    badge: "4K Image",
    thumbnail:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    mediaFormat: "PNG / TIFF (3840×2160 4K UHD)",
    turnaround: "24–48 Hours",
    pipelineEngine: "Midjourney v6.1 + Real-ESRGAN Upscale",
    updatedAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "vid-creation",
    name: "Video Creation",
    slug: "video-creation",
    category: "Creative",
    tagline: "Ads, Reels, Editing",
    shortDescription:
      "Engaging 10-to-30 second cinematic video ads, social reels, motion sequences, and voiceover-synced commercial promotional clips.",
    startingPrice: 7999,
    currency: "INR",
    icon: "Video",
    active: true,
    sortIndex: 2,
    estimatedDeliveryDays: 3,
    revisionsIncluded: 2,
    workflowStages: [
      "Storyboard & Script Verification",
      "Generative Video Ingestion",
      "Editorial Timeline & Cut",
      "DaVinci Color & Audio Mix",
      "Client Approval & Vault Sync",
    ],
    briefSchema: [
      {
        key: "videoType",
        label: "Video Production Category",
        type: "select",
        required: true,
        options: [
          "Commercial Product Ad (15-30s)",
          "Social Instagram Reel / TikTok (9:16)",
          "Brand Anthem & Editorial Teaser",
          "Explainer / Feature Demonstration",
        ],
      },
      {
        key: "duration",
        label: "Target Video Duration",
        type: "select",
        required: true,
        options: ["10–15 Seconds", "30 Seconds", "60 Seconds", "90 Seconds+"],
      },
      {
        key: "aspectRatio",
        label: "Primary Aspect Ratio",
        type: "select",
        required: true,
        options: [
          "9:16 Vertical (Mobile Reels & Stories)",
          "16:9 Cinematic Horizontal (YouTube & Web)",
          "1:1 Square (Universal Multi-Platform)",
          "Dual Bundle (9:16 Vertical + 16:9 Horizontal)",
        ],
      },
      {
        key: "voiceoverOption",
        label: "Script & Voiceover Audio",
        type: "select",
        required: true,
        options: [
          "Client Provided Script + Studio AI Voiceover",
          "Full Sutra Studio Scriptwriting & Voiceover",
          "Music & Sound Design Only (No Voiceover)",
          "Client Supplied Audio Master File",
        ],
      },
      {
        key: "musicPreference",
        label: "Audio & Music Direction",
        type: "text",
        required: false,
        helpText: "e.g. Ambient luxury, cinematic Indian classical percussion, upbeat lo-fi",
      },
      {
        key: "referenceVideos",
        label: "Reference Video Links",
        type: "textarea",
        required: false,
        helpText: "Paste YouTube / Vimeo / Instagram links for pacing and tone inspiration.",
      },
    ],
    requiredAssets: [
      "Product Footage or High-Res Stills",
      "Script or Key Talking Points",
      "Brand Vector Mark with Transparent Background",
    ],
    deliverables: [
      "10-30s Cinematic Master (4K ProRes / MP4)",
      "Spatial Audio & Sound Design Mix",
      "Vertical & Horizontal Aspect Ratios",
    ],
    badge: "Video",
    thumbnail:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    mediaType: "video",
    mediaFormat: "ProRes 422 HQ / 4K MP4 (24fps / 60fps)",
    turnaround: "48–72 Hours",
    pipelineEngine: "Runway Gen-3 Alpha + ElevenLabs Audio",
    updatedAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "3d-modeling",
    name: "3D Modeling",
    slug: "3d-modeling",
    category: "Design",
    tagline: "Products, Spaces",
    shortDescription:
      "Precision 3D product models, architectural exterior structures, and interactive web-ready 3D assets.",
    startingPrice: 9499,
    currency: "INR",
    icon: "Box",
    active: true,
    sortIndex: 3,
    estimatedDeliveryDays: 3,
    revisionsIncluded: 2,
    workflowStages: [
      "Mesh Construction & CAD Cleanup",
      "High-Poly Sculpt & Topology",
      "PBR Shading & Material Baking",
      "Lighting Passes & Camera Rig",
      "GLTF Web Export & Vault Sync",
    ],
    briefSchema: [
      {
        key: "targetEntity",
        label: "3D Object or Space Type",
        type: "select",
        required: true,
        options: [
          "Consumer Product / Packaging",
          "Furniture & Luxury Decor Object",
          "Architectural Structure / Exterior",
          "Vehicle / Industrial Hardware",
          "Spatial Environmental Set",
        ],
      },
      {
        key: "dimensions",
        label: "Real-World Dimensions / Scale",
        type: "text",
        required: true,
        helpText: "e.g. Width: 45cm, Depth: 30cm, Height: 85cm",
      },
      {
        key: "outputFormats",
        label: "Required Output 3D Formats",
        type: "multiselect",
        required: true,
        options: [
          "GLTF / GLB (Web Embed & Three.js)",
          "USDZ (Apple iOS QuickLook AR)",
          "OBJ / FBX (Universal 3D Exchange)",
          "Blender Master .blend Project",
        ],
      },
      {
        key: "materialSpecs",
        label: "Material & Texture Requirements",
        type: "textarea",
        required: true,
        helpText: "e.g. Brushed gold brass, polished teak wood grain, frosted glass, matte leather",
      },
      {
        key: "animationNeeds",
        label: "Animation Requirements",
        type: "select",
        required: true,
        options: [
          "Static 3D Asset (PBR Textures)",
          "360-Degree Turntable Loop Animation",
          "Exploded Parts Assembly Sequence",
          "Interactive Web Scene Setup",
        ],
      },
    ],
    requiredAssets: [
      "Multi-Angle Reference Photos or Blueprint",
      "Exact Dimensions & Scale Specifications",
      "Material Swatches or Color Codes",
    ],
    deliverables: [
      "GLTF / USDZ PBR Textured Master Files",
      "High-Resolution 360 Turntable Stills",
      "4K Diffused Material Pass Maps",
    ],
    badge: "3D",
    thumbnail:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
    mediaType: "3d",
    mediaFormat: "GLTF / USDZ / OBJ (4K PBR Textures)",
    turnaround: "48–72 Hours",
    pipelineEngine: "Meshy v2 + Blender Geometry Nodes",
    updatedAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "360-view",
    name: "360 View",
    slug: "360-view",
    category: "Design",
    tagline: "Virtual Tours",
    shortDescription:
      "Immersive 360-degree interactive panoramic virtual tours for luxury villas, hospitality spaces, and real-estate showrooms.",
    startingPrice: 11999,
    currency: "INR",
    icon: "Compass",
    active: true,
    sortIndex: 4,
    estimatedDeliveryDays: 4,
    revisionsIncluded: 2,
    workflowStages: [
      "Spatial Node Map & Path Planning",
      "Equirectangular HDR Stitching",
      "Hotspot Annotations & GUI Embed",
      "WebXR Cross-Device Verification",
      "Client Approval & Embed Code Delivery",
    ],
    briefSchema: [
      {
        key: "spaceType",
        label: "Location / Space Classification",
        type: "select",
        required: true,
        options: [
          "Luxury Residential Villa / Penthouse",
          "Hospitality Resort / Boutique Hotel",
          "Automobile or Product Showroom",
          "Art Gallery / Museum Exhibition",
          "Commercial Headquarters / Corporate Office",
        ],
      },
      {
        key: "scenesCount",
        label: "Number of 360 Panoramas / Rooms",
        type: "number",
        required: true,
        defaultValue: 4,
        helpText: "Standard virtual tour bundle includes 4-8 interconnected rooms.",
      },
      {
        key: "hotspotsType",
        label: "Interactive Hotspot Features",
        type: "select",
        required: true,
        options: [
          "Spatial Navigation Arrows & Floorplan Radar",
          "Rich Media Cards (Photos, Videos, Spec Sheets)",
          "Direct Buy / Reservation In-Tour Links",
          "Custom Branded UI with Audio Narration",
        ],
      },
      {
        key: "hostingEmbed",
        label: "Hosting & Embed Destination",
        type: "select",
        required: true,
        options: [
          "Hosted on Sutra Cloud CDN (Single iFrame Embed)",
          "Self-Hosted Standalone HTML5 / WebXR Package",
          "Google Street View Integration Package",
        ],
      },
    ],
    requiredAssets: [
      "Floor Plan or Room Navigation Hierarchy",
      "Room Reference Photography or 3D Models",
      "Point-of-Interest Copy & Image Assets",
    ],
    deliverables: [
      "Interactive Panorama Web Viewer (Pannellum / WebXR)",
      "High-Resolution 8K Equirectangular HDR Spheres",
      "One-Click Embeddable HTML5 Code",
    ],
    badge: "360°",
    thumbnail:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    mediaType: "360",
    mediaFormat: "Equirectangular HDR / WebXR Panoramas (8192×4096)",
    turnaround: "2–4 Days",
    pipelineEngine: "Pannellum HDR Equirectangular Engine",
    updatedAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "interior-design",
    name: "Interior Design",
    slug: "interior-design",
    category: "Design",
    tagline: "Spaces, Renderings",
    shortDescription:
      "Photorealistic interior architectural visualization, luxury room staging, lighting studies, and material palettes.",
    startingPrice: 12499,
    currency: "INR",
    icon: "Home",
    active: true,
    sortIndex: 5,
    estimatedDeliveryDays: 3,
    revisionsIncluded: 2,
    workflowStages: [
      "Spatial Layout & Floor Plan Review",
      "Architectural Staging & Furniture Selection",
      "Natural & Ambient Lighting Simulation",
      "4K Photorealistic Render Passes",
      "Client Approval & Drive Vault Sync",
    ],
    briefSchema: [
      {
        key: "roomType",
        label: "Space / Room Type",
        type: "select",
        required: true,
        options: [
          "Living & Dining Salon",
          "Master Suite & Walk-in Dressing",
          "Modular Gourmet Kitchen",
          "Executive Home Office / Library",
          "Luxury Bathroom / Wellness Spa",
        ],
      },
      {
        key: "areaSize",
        label: "Approximate Area Size",
        type: "text",
        required: true,
        helpText: "e.g. 450 sq ft or 42 sq meters",
      },
      {
        key: "designStyle",
        label: "Aesthetic Direction",
        type: "select",
        required: true,
        options: [
          "Modern Indic Luxury (Teak, Brass, Warm Ivory)",
          "Warm Minimalist / Japandi",
          "Contemporary European Classic",
          "Industrial Loft / Exposed Concrete",
          "Art Deco Elegance",
        ],
      },
      {
        key: "budgetRange",
        label: "Estimated Execution Budget",
        type: "select",
        required: false,
        options: [
          "Under ₹10 Lakhs",
          "₹10 Lakhs – ₹25 Lakhs",
          "₹25 Lakhs – ₹50 Lakhs",
          "₹50 Lakhs+ (Ultra Luxury)",
        ],
      },
      {
        key: "existingFloorPlan",
        label: "Room Photos or Floor Plan Status",
        type: "text",
        required: false,
        helpText: "Mention if you have CAD drawings, hand sketches, or current photos to upload.",
      },
    ],
    requiredAssets: [
      "Architectural Floor Plan or Room Dimensions",
      "Photos of Existing Space (if renovation)",
      "Style Moodboard or Color Palette References",
    ],
    deliverables: [
      "High-Resolution 4K Render Suite (Day & Night)",
      "Material Specification & Moodboard Sheet",
      "Furniture Layout & Dimension Spec Sheet",
    ],
    badge: "Interior",
    thumbnail:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    mediaFormat: "High-Res Render Suite (4K PNG / EXR)",
    turnaround: "48–72 Hours",
    pipelineEngine: "ControlNet SDXL Architecture + Depth Maps",
    updatedAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "window-design",
    name: "Window Design",
    slug: "window-design",
    category: "Design",
    tagline: "Frames, Elevations",
    shortDescription:
      "Architectural window framing, modern facade elevations, and custom glass architectural visualization.",
    startingPrice: 6499,
    currency: "INR",
    icon: "Grid",
    active: true,
    sortIndex: 6,
    estimatedDeliveryDays: 2,
    revisionsIncluded: 2,
    workflowStages: [
      "Elevation & Structural Sizing",
      "Frame Material & Profile Modeling",
      "Glass Transmittance & Reflection Bake",
      "Facade Perspective Rendering",
      "CAD Spec Export & Vault Sync",
    ],
    briefSchema: [
      {
        key: "windowType",
        label: "Window / Facade System",
        type: "select",
        required: true,
        options: [
          "Floor-to-Ceiling Panoramic Glass",
          "Architectural Casement & Awning Windows",
          "Sliding Minimalist Glass System",
          "Classic Arched / Heritage Colonial Frame",
          "Geometric Skylight / Clerestory",
        ],
      },
      {
        key: "frameMaterial",
        label: "Frame Material & Finish",
        type: "select",
        required: true,
        options: [
          "Anodized Charcoal Aluminum (Slimline)",
          "Solid Teak Wood with Brass Accents",
          "UPVC High-Performance Thermal",
          "Custom Powder-Coated Steel Grid",
        ],
      },
      {
        key: "measurements",
        label: "Measurements & Configuration",
        type: "text",
        required: true,
        helpText: "e.g. 10ft wide x 8ft high (3-panel configuration)",
      },
      {
        key: "numberOfWindows",
        label: "Total Number of Windows / Openings",
        type: "number",
        required: true,
        defaultValue: 2,
      },
      {
        key: "elevationStyle",
        label: "Facade Architectural Style",
        type: "select",
        required: true,
        options: [
          "Contemporary Minimalist",
          "Modern Heritage Indic",
          "Colonial Bungalow",
          "Industrial Bauhaus",
        ],
      },
    ],
    requiredAssets: [
      "Wall Opening Measurements / CAD Elevation",
      "Exterior Facade Photos or References",
      "Finish & Glass Tint Preferences",
    ],
    deliverables: [
      "Facade Elevation Profiles (CAD DWG / PDF)",
      "Glass Material & Tint Study Passes",
      "4K Exterior Perspective Renders",
    ],
    badge: "Elevations",
    thumbnail:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    mediaFormat: "CAD DWG / 4K Render Passes (PNG)",
    turnaround: "24–48 Hours",
    pipelineEngine: "Parametric Facade Modeler + V-Ray",
    updatedAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    slug: "digital-marketing",
    category: "Marketing",
    tagline: "Strategy, Content",
    shortDescription:
      "Data-driven creative growth strategies, content blueprints, audience profiling, and brand storytelling campaigns.",
    startingPrice: 14999,
    currency: "INR",
    icon: "TrendingUp",
    active: true,
    sortIndex: 7,
    estimatedDeliveryDays: 4,
    revisionsIncluded: 2,
    workflowStages: [
      "Brand Audit & Market Analysis",
      "Content Matrix & Messaging Pillar Design",
      "Editorial Copywriting & Reel Hooks",
      "Multi-Platform Publishing Strategy",
      "Monthly Strategy Deck & Vault Sync",
    ],
    briefSchema: [
      {
        key: "businessNameIndustry",
        label: "Company / Brand Name & Industry",
        type: "text",
        required: true,
        helpText: "e.g. Maison Luxury Fragrances (D2C Luxury Perfumery)",
      },
      {
        key: "marketingGoals",
        label: "Primary Marketing Objective",
        type: "multiselect",
        required: true,
        options: [
          "High-Intent Lead Generation",
          "Brand Authority & Awareness",
          "D2C E-commerce Sales & ROAS",
          "VIP Client Community Growth",
        ],
      },
      {
        key: "targetPlatforms",
        label: "Focus Marketing Channels",
        type: "multiselect",
        required: true,
        options: ["Instagram", "LinkedIn", "Google Search & YouTube", "Facebook", "X / Twitter"],
      },
      {
        key: "monthlyContentVolume",
        label: "Target Content Output per Month",
        type: "select",
        required: true,
        options: [
          "12 Curated Posts & Reels (3 / week)",
          "20 High-Impact Visuals & Stories (5 / week)",
          "Daily Content Pipeline (30 pieces)",
        ],
      },
      {
        key: "targetAudience",
        label: "Target Audience Demographics & Geography",
        type: "textarea",
        required: true,
        helpText: "Specify age group, interests, tier-1 cities, purchasing capacity.",
      },
    ],
    requiredAssets: [
      "Brand Guidelines & Logo Assets",
      "Product Catalog or Service Deck",
      "Current Social Media Links",
    ],
    deliverables: [
      "Monthly 30-Day Content Matrix Calendar",
      "Headline & Captions Copywriting Deck",
      "Competitor Trend & Hashtag Blueprint",
    ],
    badge: "Growth",
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    mediaType: "interactive",
    mediaFormat: "PDF Strategy Deck / Notion Workspace",
    turnaround: "3–5 Days",
    pipelineEngine: "Sutra Growth Analytics Engine",
    updatedAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "meta-ads",
    name: "Meta Ads Launcher",
    slug: "meta-ads-launcher",
    category: "Marketing",
    tagline: "Campaigns, Ad Creatives",
    shortDescription:
      "End-to-end Facebook & Instagram ad campaign setups, high-converting creative ad variations, copy testing, and optimization.",
    startingPrice: 13499,
    currency: "INR",
    icon: "Share2",
    active: true,
    sortIndex: 8,
    estimatedDeliveryDays: 2,
    revisionsIncluded: 2,
    workflowStages: [
      "Offer Architecture & Copy Hooks",
      "Multi-Ratio Creative Asset Generation",
      "Audience Targeting & Pixel Verification",
      "Campaign Setup in Meta Ads Manager",
      "Launch Review & Vault Sync",
    ],
    briefSchema: [
      {
        key: "productOffer",
        label: "Product / Promotional Offer",
        type: "text",
        required: true,
        helpText: "e.g. Diwali Luxury Villa Pre-Launch with 10% Early Bird Benefit",
      },
      {
        key: "monthlyAdBudget",
        label: "Planned Monthly Ad Spend (INR)",
        type: "text",
        required: true,
        helpText: "e.g. ₹50,000 / month on Meta Ads",
      },
      {
        key: "targetGeography",
        label: "Target Geography & Demographic",
        type: "textarea",
        required: true,
        helpText: "e.g. Mumbai, Delhi NCR, Bengaluru (Ages 28-55, High Net Worth Interests)",
      },
      {
        key: "campaignObjective",
        label: "Meta Ads Campaign Objective",
        type: "select",
        required: true,
        options: [
          "Conversions / Direct Online Orders",
          "High-Quality WhatsApp / Instant Form Leads",
          "Website Traffic & Retargeting Audience Pool",
          "Brand Reach & Video Views",
        ],
      },
      {
        key: "pixelStatus",
        label: "Meta Business Manager & Pixel Status",
        type: "select",
        required: true,
        options: [
          "Meta Business Manager Access Ready",
          "Pixel Needs Setup on Website",
          "Brand New Ad Account Setup Required",
        ],
      },
    ],
    requiredAssets: [
      "Meta Business Manager Access / Partner Request",
      "High-Res Product Assets or Video Clips",
      "Target Landing Page URL",
    ],
    deliverables: [
      "5 High-Converting Creative Ad Variations (1:1 & 9:16)",
      "High-ROAS Direct Response Copywriting Sets",
      "Audience Targeting Blueprint & Pixel Audit",
    ],
    badge: "Meta Ads",
    thumbnail:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
    mediaType: "interactive",
    mediaFormat: "Multi-Ratio Ad Pack (1:1, 9:16, 16:9)",
    turnaround: "48 Hours",
    pipelineEngine: "Automated Multi-Aspect Banner Pipeline",
    updatedAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "web-dev",
    name: "Website Development",
    slug: "website-development",
    category: "Development",
    tagline: "Landing Pages, Websites",
    shortDescription:
      "High-performance, bespoke websites engineered with Next.js, fluid GSAP micro-interactions, responsive precision, and fast loading.",
    startingPrice: 16999,
    currency: "INR",
    icon: "Globe",
    active: true,
    sortIndex: 9,
    estimatedDeliveryDays: 6,
    revisionsIncluded: 3,
    workflowStages: [
      "Information Architecture & Wireframes",
      "UI Design & Typography Selection",
      "Next.js App Router Engineering",
      "GSAP Interactions & Responsive Polish",
      "Vercel Deployment & Domain DNS Sync",
    ],
    briefSchema: [
      {
        key: "websiteType",
        label: "Website Scope & Purpose",
        type: "select",
        required: true,
        options: [
          "Luxury Brand Showcase & Portfolio",
          "High-Converting Landing Page",
          "Corporate Multi-Page Website (5-8 Pages)",
          "E-commerce Direct-to-Consumer Store",
        ],
      },
      {
        key: "pageCount",
        label: "Estimated Page Count",
        type: "select",
        required: true,
        options: ["1–3 Pages", "4–7 Pages", "8–12 Pages", "Enterprise (12+ Pages)"],
      },
      {
        key: "interactiveFeatures",
        label: "Key Interactive Features Required",
        type: "multiselect",
        required: true,
        options: [
          "GSAP Fluid Micro-Animations",
          "Interactive Contact & Briefing Forms",
          "Firebase Dynamic Content / CMS",
          "Razorpay Payment Gateway Checkout",
          "Multi-Language Localization",
        ],
      },
      {
        key: "referenceSites",
        label: "Inspirational Reference Websites",
        type: "textarea",
        required: false,
        helpText: "Paste URLs of benchmark websites whose aesthetics you love.",
      },
      {
        key: "domainStatus",
        label: "Domain & Hosting Status",
        type: "select",
        required: true,
        options: [
          "Domain Owned (Ready for Vercel DNS link)",
          "Domain & Hosting Already Configured",
          "Need Sutra Studio to Register & Setup Domain",
        ],
      },
      {
        key: "contentReadiness",
        label: "Copywriting & Visual Content Status",
        type: "select",
        required: true,
        options: [
          "All Copy & High-Res Images 100% Ready",
          "Images Ready, Need Copywriting Assistance",
          "Need Complete Studio Content Creation & Direction",
        ],
      },
    ],
    requiredAssets: [
      "Brand Vector Mark & Style Guidelines",
      "Approved Copywriting Drafts (if available)",
      "High-Resolution Visual Assets",
    ],
    deliverables: [
      "Complete Production Next.js 16 Codebase",
      "Fluid Responsive Layout (Mobile, Tablet, Desktop)",
      "SEO Metadata, Sitemap & Google Analytics Setup",
    ],
    badge: "Next.js",
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    mediaType: "code",
    mediaFormat: "Next.js 16 / TypeScript / Tailwind CSS",
    turnaround: "5–7 Days",
    pipelineEngine: "Next.js 16 Turbopack CI/CD",
    updatedAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "webapp-dev",
    name: "Web App Development",
    slug: "web-app-development",
    category: "Development",
    tagline: "Dashboards, Portals",
    shortDescription:
      "Robust SaaS applications, custom client portals, real-time collaboration dashboards, and secure backend integrations.",
    startingPrice: 19999,
    currency: "INR",
    icon: "Layout",
    active: true,
    sortIndex: 10,
    estimatedDeliveryDays: 10,
    revisionsIncluded: 3,
    workflowStages: [
      "System Architecture & Data Modeling",
      "Auth & Role-Based Access Control Setup",
      "Real-time Firestore & API Implementation",
      "Dashboard UI & Component Engineering",
      "Security Audits & Production Deploy",
    ],
    briefSchema: [
      {
        key: "appPurpose",
        label: "Core Web Application Purpose",
        type: "textarea",
        required: true,
        helpText: "Describe the business problem, SaaS workflow, or portal functionality.",
      },
      {
        key: "userRoles",
        label: "User Roles & Permissions",
        type: "select",
        required: true,
        options: [
          "2 Roles (Client & Studio Administrator)",
          "3 Roles (Client, Manager, Super Admin)",
          "Multi-Tenant Multi-Organization RBAC",
        ],
      },
      {
        key: "keyFeatures",
        label: "Essential Functional Features",
        type: "textarea",
        required: true,
        helpText: "e.g. Real-time chat, file vault, Razorpay subscriptions, order tracking, notifications",
      },
      {
        key: "integrations",
        label: "Backend & Third-Party Integrations",
        type: "multiselect",
        required: true,
        options: [
          "Firebase Auth & Firestore Real-Time DB",
          "Razorpay Subscriptions & Automated Invoicing",
          "Google Drive Vault File Synchronization",
          "AI LLM Concierge / Assistant (Gemini API)",
          "SendGrid / Twilio Notification Webhooks",
        ],
      },
      {
        key: "techPreference",
        label: "Architecture & Stack Preference",
        type: "select",
        required: true,
        options: [
          "Next.js App Router + TypeScript + Firebase",
          "React SPA + Express Node.js Backend",
          "Full-Stack Serverless Cloud Architecture",
        ],
      },
    ],
    requiredAssets: [
      "Feature Specification or Wireframes",
      "Data Model Requirements / Schema Draft",
      "Third-Party Service API Keys (if ready)",
    ],
    deliverables: [
      "Production-Ready Full-Stack Web Application",
      "Firebase Security Rules & Role-Based Auth",
      "Executive Dashboard & Reporting Interfaces",
    ],
    badge: "Web App",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    mediaType: "interactive",
    mediaFormat: "React / Firebase Cloud Firestore / Next.js",
    turnaround: "7–14 Days",
    pipelineEngine: "Full-Stack Portal Scaffolder",
    updatedAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "mobile-setup",
    name: "Mobile App Setup",
    slug: "mobile-app-setup",
    category: "Development",
    tagline: "Android & iOS Apps",
    shortDescription:
      "Cross-platform Expo / React Native mobile applications sharing unified Firebase backends and APIs.",
    startingPrice: 18499,
    currency: "INR",
    icon: "Smartphone",
    active: true,
    sortIndex: 11,
    estimatedDeliveryDays: 10,
    revisionsIncluded: 3,
    workflowStages: [
      "Cross-Platform Navigation Wireframing",
      "React Native & Expo App Scaffolding",
      "Unified Auth & Push Notification Binding",
      "iOS Simulator & Android APK Testing",
      "App Store & Play Store Build Export",
    ],
    briefSchema: [
      {
        key: "targetPlatforms",
        label: "Target Mobile Platforms",
        type: "select",
        required: true,
        options: [
          "Cross-Platform (Both iOS & Android)",
          "iOS App Only (Apple App Store)",
          "Android App Only (Google Play Store)",
          "Progressive Web App (PWA) First",
        ],
      },
      {
        key: "mobileFeatures",
        label: "Key Mobile Native Capabilities",
        type: "multiselect",
        required: true,
        options: [
          "Push Notifications (FCM / Expo)",
          "Biometric Authentication (FaceID / Fingerprint)",
          "Camera & Gallery Media Upload",
          "Offline Data Caching",
          "In-App Razorpay Payments",
        ],
      },
      {
        key: "storeAccountsStatus",
        label: "App Store Developer Accounts Status",
        type: "select",
        required: true,
        options: [
          "Apple & Google Developer Accounts Active",
          "Need Sutra Studio Assistance Setting Up Accounts",
          "Internal Enterprise Distribution (Ad-Hoc / TestFlight)",
        ],
      },
      {
        key: "designStatus",
        label: "UI/UX Mobile Design Status",
        type: "select",
        required: true,
        options: [
          "Figma Mobile UI Kit 100% Ready",
          "Basic Wireframes Ready (Need Polish)",
          "Need Complete Sutra Studio UI/UX Mobile Design",
        ],
      },
    ],
    requiredAssets: [
      "Figma UI Design or Wireframe Links",
      "App Icon Vector & Splash Screen Assets",
      "Developer Account Credentials (when ready to deploy)",
    ],
    deliverables: [
      "Cross-Platform React Native Expo Codebase",
      "Production-Ready iOS IPA & Android AAB Builds",
      "Push Notification & Deep Linking Setup",
    ],
    badge: "Mobile",
    thumbnail:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
    mediaType: "interactive",
    mediaFormat: "React Native Expo / iOS IPA / Android APK",
    turnaround: "10–14 Days",
    pipelineEngine: "React Native Mobile Engine",
    updatedAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "ai-automation",
    name: "AI Automation",
    slug: "ai-automation",
    category: "Automation",
    tagline: "Autonomous Pipelines & Integrations",
    shortDescription:
      "Custom automated operational pipelines, secure cloud webhook integrations, AI content classifiers, and automated Drive synchronization.",
    startingPrice: 15999,
    currency: "INR",
    icon: "Cpu",
    active: true,
    sortIndex: 12,
    estimatedDeliveryDays: 3,
    revisionsIncluded: 2,
    workflowStages: [
      "Manual Workflow & Bottleneck Mapping",
      "Cloud Function & Webhook Architecture",
      "LLM Model Tuning & Embedding Pipeline",
      "Fail-safe Error Handling & Retry Logic",
      "Live Testing & Vault Sync",
    ],
    briefSchema: [
      {
        key: "processToAutomate",
        label: "Process / Workflow to Automate",
        type: "textarea",
        required: true,
        helpText: "Describe the repetitive manual task, order processing step, or content pipeline.",
      },
      {
        key: "toolsUsed",
        label: "Target Tools & Cloud Services",
        type: "multiselect",
        required: true,
        options: [
          "Firebase Cloud Functions / Firestore Triggers",
          "Google Drive Automated File Router",
          "Gemini / OpenAI API Content Pipelines",
          "Razorpay Payment & Invoicing Webhooks",
          "Slack / WhatsApp Instant Notification Bots",
        ],
      },
      {
        key: "expectedOutcome",
        label: "Expected Automated Business Outcome",
        type: "textarea",
        required: true,
        helpText: "e.g. Reduce deliverable handoff time from 2 hours to 10 seconds, zero human errors.",
      },
      {
        key: "dataSources",
        label: "Input Data Sources & Format",
        type: "text",
        required: false,
        helpText: "e.g. Firestore records, REST API webhooks, CSV / Google Sheets uploads",
      },
      {
        key: "integrations",
        label: "CRM or External Endpoints to Connect",
        type: "textarea",
        required: false,
        helpText: "List target endpoints, webhook URLs, or internal database links.",
      },
    ],
    requiredAssets: [
      "Process Flowchart or Step-by-Step Description",
      "Sample Input Data and Desired Output File",
      "API Credentials / Webhook Secret Tokens",
    ],
    deliverables: [
      "Automated Cloud Function Workflow Blueprints",
      "HMAC Webhook Security & Signature Verification",
      "Real-Time Automated Google Drive Router",
    ],
    badge: "Automation",
    thumbnail:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    mediaType: "code",
    mediaFormat: "Cloud Workflow Engine + Secure Webhooks",
    turnaround: "48–72 Hours",
    pipelineEngine: "HMAC Webhook & Drive Router",
    updatedAt: "2026-10-01T00:00:00.000Z",
  },
];

// ----------------------------------------------------------------------------
// SEED CORPUS: ALL CANONICAL MONTHLY RETAINER PLANS
// ----------------------------------------------------------------------------
export const SEED_CATALOG_PLANS: CatalogPlan[] = [
  {
    id: "autonomous-growth-retainer",
    name: "Autonomous Growth Retainer",
    tier: "Growth",
    price: 14999,
    monthlyPrice: 14999,
    quarterlyPrice: 42747, // 5% discount
    annualPrice: 152989, // 15% discount
    features: [
      "Daily 1x 4K Brand Image / Graphic (30 Assets/month) powered by trend research",
      "Daily 1x Commercial Video Reel / Short (30 Assets/month) with voiceover and motion typography",
      "Dedicated 3D Asset Modeling & Spatial Renders",
      "Interactive 360° Virtual Panoramic Tour",
      "Interior / Spatial Visualizations",
      "Meta Ads Creative Variation Pack (Multi-Ratio)",
      "Private Sutra Cloud Vault with Auto-Sync & Instant Downloads",
      "Executive Producer Direct Access & Priority Daily Active Queue",
    ],
    includedServices: {
      "img-creation": 30,
      "vid-creation": 30,
      "3d-modeling": 4,
      "360-view": 2,
      "meta-ads": 6,
    },
    freeTrialDays: 3,
    active: true,
    sortIndex: 1,
    razorpayPlanId: "plan_autonomous_retainer_01",
    updatedAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "studio-starter",
    name: "Starter Creative",
    tier: "Starter",
    price: 3499,
    monthlyPrice: 3499,
    quarterlyPrice: 9972,
    annualPrice: 35689,
    features: [
      "Up to 5 Photorealistic 4K Renders per month",
      "1x 10-Second Commercial Video Ad",
      "Full Commercial Copyright License",
      "48-Hour Turnaround Pipeline",
      "Sutra Cloud Vault Delivery & Master Archive",
      "2 Revision Rounds Included",
    ],
    includedServices: {
      "img-creation": 5,
      "vid-creation": 1,
    },
    freeTrialDays: 3,
    active: true,
    sortIndex: 2,
    razorpayPlanId: "plan_starter_monthly_01",
    updatedAt: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "studio-growth",
    name: "Studio Growth",
    tier: "Growth",
    price: 7999,
    monthlyPrice: 7999,
    quarterlyPrice: 22797,
    annualPrice: 81589,
    features: [
      "15x High-Resolution 3D & Product Renders",
      "3x 15-Second Video Ads with Voiceover",
      "Interactive 360° Space or Product Tour",
      "Meta Ads Creative Variation Pack (3 Sets)",
      "Dedicated Creative Lead & Priority Queue",
      "Priority 24-72 Hour Delivery Pipeline",
      "Unlimited Minor Revisions (7 Days)",
    ],
    includedServices: {
      "img-creation": 15,
      "vid-creation": 3,
      "3d-modeling": 3,
      "360-view": 1,
      "meta-ads": 3,
    },
    freeTrialDays: 3,
    active: true,
    sortIndex: 3,
    razorpayPlanId: "plan_growth_monthly_02",
    updatedAt: "2026-10-01T00:00:00.000Z",
  },
];