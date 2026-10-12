export interface ProjectItem {
  id: string;
  title: string;
  category: "Image" | "Video" | "3D" | "Interior" | "Website" | "App" | "Marketing" | "Design";
  client: string;
  year: string;
  description: string;
  projectType: "Client Project" | "Studio Platform" | "Design Concept" | "Personal Portfolio" | "3D Experience" | "Studio Concept";
  badge?: "360°" | "Video" | "Interactive" | "Case Study";
  thumbnail: string;
  deliverables?: string[];
  liveUrl?: string;
  status?: string;
  videoUrl?: string;
  panoramaUrl?: string;
}

export const SUTRA_PROJECTS: ProjectItem[] = [
  {
    id: "proj-sutra-studio",
    title: "Sutra Studio — Creative Digital Flagship",
    category: "Website",
    client: "Sutra Studio",
    year: "2026",
    projectType: "Studio Platform",
    description:
      "The official Sutra Studio flagship digital platform. Designed with traditional Indian geometric doctrines, warm ivory surfaces, Next.js App Router architecture, canonical pricing catalog, interactive 3D logo showcase, and seamless UPI QR checkout.",
    badge: "Interactive",
    thumbnail: "/assets/showcase/live-home-desktop.png",
    deliverables: [
      "Next.js App Router & Tailwind CSS Architecture",
      "Vedic Symmetry & Warm Ivory Design System",
      "Canonical INR Pricing & Order Engine",
      "Interactive 3D WebGL Logo & Showreel Viewer",
      "Client Workspace & Private File Storage",
    ],
    liveUrl: "https://sutrastudio.com",
    status: "Live Platform",
  },
  {
    id: "proj-viva-lifestyle",
    title: "Viva Live Better — Living Essentials & E-Commerce Store",
    category: "Website",
    client: "Viva Lifestyle",
    year: "2026",
    projectType: "Client Project",
    description:
      "Modern living essentials marketplace and lifestyle e-commerce storefront. Features summer sale banner integrations, responsive category navigation, product grid layouts, and streamlined cart UX.",
    badge: "Case Study",
    thumbnail: "/images/projects/viva-lifestyle.png",
    deliverables: [
      "E-Commerce Storefront UX/UI Design",
      "Promotional Campaign Banners & Merchandising",
      "Responsive Category & Search Architecture",
      "Mobile Shopping & Quick Cart Flows",
    ],
    status: "Completed",
  },
  {
    id: "proj-shri-ram-tech",
    title: "Shri Ram Tech — High-Converting Technology Agency Platform",
    category: "Website",
    client: "Shri Ram Tech",
    year: "2026",
    projectType: "Client Project",
    description:
      "High-performance digital agency platform engineered for fast-moving founders. Designed with clean typographic hierarchy, global design tokens, interactive service showcases, and conversational assistant launcher.",
    badge: "Case Study",
    thumbnail: "/images/projects/shri-ram-tech.png",
    deliverables: [
      "Brand Identity & Corporate Web Architecture",
      "High-Converting Landing Experience",
      "Interactive AI Concierge Integration",
      "Case Study & Service Showcase Modules",
    ],
    status: "Completed",
  },
  {
    id: "proj-yash-joshi-qa",
    title: "Yash Joshi — Quality Engineering & Test Automation Portfolio",
    category: "Website",
    client: "Yash Joshi Engineering",
    year: "2026",
    projectType: "Personal Portfolio",
    description:
      "Clean engineering portfolio showcasing automated testing systems, test case matrices, bug lifecycle metrics, and interactive resume access.",
    badge: "Case Study",
    thumbnail: "/images/projects/yash-joshi-qa.png",
    deliverables: [
      "Quality Assurance Portfolio Layout",
      "Test Execution Metrics & Badges",
      "Interactive Resume Download Flow",
      "Fully Responsive Mobile Experience",
    ],
    status: "Completed",
  },
  {
    id: "proj-creme-dor",
    title: "Crème d'Or — Artisanal Gelateria Brand & Digital Experience",
    category: "Design",
    client: "Crème d'Or Gelateria",
    year: "2026",
    projectType: "Design Concept",
    description:
      "Luxury culinary brand identity and interactive digital experience celebrating artisanal soft-serve churn, Belgian waffle cones, and curated boutique flavor collections.",
    badge: "Case Study",
    thumbnail: "/images/projects/creme-dor.png",
    deliverables: [
      "Artisanal Culinary Visual Identity",
      "Hypnotic Churn Editorial Landing Page",
      "Boutique Flavor Presentation Cards",
      "Warm Luxury Color & Typographic Palette",
    ],
    status: "Concept Design",
  },
  {
    id: "proj-koenigsegg-velocity",
    title: "Koenigsegg Apex Velocity — 3D Automotive Twin Showcase",
    category: "3D",
    client: "Koenigsegg Apex Concept",
    year: "2026",
    projectType: "3D Experience",
    description:
      "High-octane digital automotive showcase exploring the duality of velocity between the Agera RS and Regera. Features cinematic vehicle reveal sequences, comparative powertrain specifications, and aerodynamic analysis.",
    badge: "Interactive",
    thumbnail: "/images/projects/koenigsegg-velocity.png",
    deliverables: [
      "Interactive 3D Automotive Reveal Sequence",
      "Comparative Powertrain Specs Interface",
      "Aerodynamic Telemetry Visualizations",
      "Dark Cinematic Editorial Atmosphere",
    ],
    status: "3D Prototype",
  },
  {
    id: "proj-vitrine-salon",
    title: "Vitrine Salon — Luxury Beauty Atelier & Booking Portal",
    category: "Website",
    client: "Vitrine Salon & Spa",
    year: "2026",
    projectType: "Client Project",
    description:
      "Serene, warm editorial web platform for premium salon and spa services. Designed with arched architectural aesthetic motifs, treatment menus, real-time appointment booking, and CRM portal access.",
    badge: "Case Study",
    thumbnail: "/images/projects/vitrine-salon.png",
    deliverables: [
      "Luxury Salon Editorial Web Design",
      "Online Appointment Booking Flow",
      "Interactive Treatment Gallery",
      "Integrated Client Management Access",
    ],
    status: "Completed",
  },
  {
    id: "proj-perfume",
    title: "Noir Atelier — Luxury Fragrance Render",
    category: "Image",
    client: "Studio 3D Concept",
    year: "2026",
    projectType: "Studio Concept",
    description:
      "Studio creative lighting study exploring caustic glass refraction, fluid simulation, and golden rim highlights for luxury packaging.",
    badge: "Case Study",
    thumbnail: "/images/projects/proj-perfume.webp",
    deliverables: [
      "Product Rendering & Glass Caustics Study",
      "Warm Gold Studio Lighting Pass",
      "Packaging Presentation Deck",
    ],
    status: "Design Concept",
  },
  {
    id: "proj-villa",
    title: "The Banyan Pavilion — 360° Spatial Villa Tour",
    category: "3D",
    client: "Architectural Concept",
    year: "2026",
    projectType: "Studio Concept",
    description:
      "Interactive 360-degree spatial tour prototype showcasing ambient sunset lighting, Calacatta marble, and teakwood architectural accents.",
    badge: "360°",
    thumbnail: "/images/projects/proj-villa.webp",
    deliverables: [
      "Equirectangular 360 Panoramic Node",
      "Spatial Orbit & Hotspot Navigation",
      "Architectural Interior Staging",
    ],
    status: "Spatial Prototype",
  },
  {
    id: "proj-sutra-watch",
    title: "Chronos Atelier — 3D Mechanical Chronograph Visualization",
    category: "3D",
    client: "Studio 3D Concept",
    year: "2026",
    projectType: "Studio Concept",
    description:
      "High-precision 3D hard-surface modeling study examining brushed steel bevels, sapphire crystal reflections, and studio lighting passes for luxury timepieces.",
    badge: "Interactive",
    thumbnail: "/images/projects/sutra-watch-3d.jpg",
    deliverables: [
      "3D Hard-Surface CAD Modeling",
      "Anisotropic Brushed Steel Shading",
      "Studio Lighting & Reflection Tuning",
      "Commercial Product Staging",
    ],
    status: "3D Concept",
  },
  {
    id: "proj-sutra-cosmetic",
    title: "Aura Skincare — Sculptural Commercial Product Staging",
    category: "Image",
    client: "Studio Creative Concept",
    year: "2026",
    projectType: "Studio Concept",
    description:
      "Commercial product key visual study on a raw travertine stone pedestal, featuring frosted amber glass, matte bronze caps, and warm architectural window shadows.",
    badge: "Case Study",
    thumbnail: "/images/projects/sutra-cosmetic-render.jpg",
    deliverables: [
      "Directional Warm Studio Lighting",
      "Minimal Travertine Pedestal Staging",
      "Advertising Campaign Key Visuals",
      "High-Resolution Master Retouching",
    ],
    status: "Visual Concept",
  },
];
