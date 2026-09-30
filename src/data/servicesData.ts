export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  category: "Creative" | "Design" | "Development" | "Marketing" | "Automation";
  tagline: string;
  description: string;
  workflow: string;
  startingPrice: string;
  deliverables: string[];
  icon: string;
}

export const SUTRA_SERVICES: ServiceItem[] = [
  {
    id: "img-creation",
    name: "Image Creation",
    slug: "image-creation",
    category: "Creative",
    tagline: "Product, Ads, Mockups",
    description:
      "High-fidelity AI generated and human-perfected commercial product imagery, luxury brand mockups, and advertising visual assets.",
    workflow: "image",
    startingPrice: "$250",
    deliverables: ["4K High-Res Renders", "Commercial Usage Rights", "Multi-Angle Mockups"],
    icon: "Image",
  },
  {
    id: "vid-creation",
    name: "Video Creation",
    slug: "video-creation",
    category: "Creative",
    tagline: "Ads, Reels, Editing",
    description:
      "Engaging 10-to-30 second cinematic video ads, social reels, motion sequences, and voiceover-synced commercial promotional clips.",
    workflow: "video",
    startingPrice: "$450",
    deliverables: ["10-30s Cinematic Ad", "Voiceover Audio", "Vertical & Horizontal Aspect Ratios"],
    icon: "Video",
  },
  {
    id: "3d-modeling",
    name: "3D Modeling",
    slug: "3d-modeling",
    category: "Design",
    tagline: "Products, Spaces",
    description:
      "Precision 3D product models, architectural exterior structures, and interactive web-ready 3D assets.",
    workflow: "three-d",
    startingPrice: "$500",
    deliverables: ["glTF / USDZ Files", "PBR Textured Models", "Turntable Renders"],
    icon: "Box",
  },
  {
    id: "360-view",
    name: "360 View",
    slug: "360-view",
    category: "Design",
    tagline: "Virtual Tours",
    description:
      "Immersive 360-degree interactive panoramic virtual tours for luxury villas, hospitality spaces, and real-estate showrooms.",
    workflow: "three-sixty",
    startingPrice: "$600",
    deliverables: ["Interactive Panorama Viewer", "Hotspot Annotations", "Embeddable Web Code"],
    icon: "Compass",
  },
  {
    id: "interior-design",
    name: "Interior Design",
    slug: "interior-design",
    category: "Design",
    tagline: "Spaces, Renderings",
    description:
      "Photorealistic interior architectural visualization, luxury room staging, lighting studies, and material palettes.",
    workflow: "interior",
    startingPrice: "$650",
    deliverables: ["High-Res Renders", "Moodboard & Color Schemes", "Furniture Layout Specs"],
    icon: "Home",
  },
  {
    id: "window-design",
    name: "Window Design",
    slug: "window-design",
    category: "Design",
    tagline: "Frames, Elevations",
    description:
      "Architectural window framing, modern facade elevations, and custom glass architectural visualization.",
    workflow: "window",
    startingPrice: "$350",
    deliverables: ["Elevation Profiles", "Glass Material Studies", "Facade Renders"],
    icon: "Grid",
  },
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    slug: "digital-marketing",
    category: "Marketing",
    tagline: "Strategy, Content",
    description:
      "Data-driven creative growth strategies, content blueprints, audience profiling, and brand storytelling campaigns.",
    workflow: "marketing",
    startingPrice: "$800",
    deliverables: ["Monthly Content Calendar", "Copywriting Decks", "Competitor Trend Analysis"],
    icon: "TrendingUp",
  },
  {
    id: "meta-ads",
    name: "Meta Ads Launcher",
    slug: "meta-ads-launcher",
    category: "Marketing",
    tagline: "Campaigns, Ad Creatives",
    description:
      "End-to-end Facebook & Instagram ad campaign setups, high-converting creative ad variations, copy testing, and optimization.",
    workflow: "social",
    startingPrice: "$750",
    deliverables: ["Targeting Blueprint", "5 Creative Ad Variations", "Conversion Tracking Setup"],
    icon: "Share2",
  },
  {
    id: "web-dev",
    name: "Website Development",
    slug: "website-development",
    category: "Development",
    tagline: "Landing Pages, Websites",
    description:
      "High-performance, bespoke websites engineered with Next.js, fluid GSAP micro-interactions, responsive precision, and fast loading.",
    workflow: "website",
    startingPrice: "$1,200",
    deliverables: ["Full Responsive Web Code", "SEO & Meta Optimization", "CMS Integration"],
    icon: "Globe",
  },
  {
    id: "webapp-dev",
    name: "Web App Development",
    slug: "web-app-development",
    category: "Development",
    tagline: "Dashboards, Portals",
    description:
      "Robust SaaS applications, custom client portals, real-time collaboration dashboards, and secure backend integrations.",
    workflow: "app",
    startingPrice: "$2,400",
    deliverables: ["Auth & RBAC", "Firestore Real-time DB", "Production-Ready Code"],
    icon: "Layout",
  },
  {
    id: "mobile-setup",
    name: "Mobile App Setup",
    slug: "mobile-app-setup",
    category: "Development",
    tagline: "Android & iOS Apps",
    description:
      "Cross-platform Expo / React Native mobile applications sharing unified Firebase backends and APIs.",
    workflow: "app",
    startingPrice: "$2,800",
    deliverables: ["Expo / React Native Codebase", "iOS & Android Builds", "Push Notification Setup"],
    icon: "Smartphone",
  },
  {
    id: "ai-automation",
    name: "AI Automation",
    slug: "ai-automation",
    category: "Automation",
    tagline: "n8n, Workflows, Integrations",
    description:
      "Custom automated operational pipelines, n8n webhook integrations, AI content classifiers, and automated Drive synchronization.",
    workflow: "automation",
    startingPrice: "$950",
    deliverables: ["n8n Workflow Blueprints", "Webhook Security Verification", "Drive Automated Pipeline"],
    icon: "Cpu",
  },
];
