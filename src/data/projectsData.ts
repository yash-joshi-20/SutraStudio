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
      "Luxury fragrance packaging render featuring fluted crystal glass engraved NOIR ATELIER, glowing amber nectar, and brushed brass monogram accents with realistic caustic lighting.",
    badge: "Case Study",
    thumbnail: "/images/projects/proj-perfume.webp",
    deliverables: [
      "Product Rendering & Glass Caustics Study",
      "Brushed Brass & Crystal Refraction Tuning",
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
      "Immersive 360-degree spatial pavilion tour showcasing Calacatta Gold marble flooring, teakwood acoustic slats, and an infinity pool vista at dusk with interactive spatial hotspots.",
    badge: "360°",
    thumbnail: "/images/projects/proj-villa.webp",
    deliverables: [
      "Equirectangular 360 Panoramic VR Node",
      "Spatial Hotspot & Orbit Navigation",
      "Luxury Villa Architectural Staging",
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
      "Swiss chronomètre 3D visualization highlighting the hand-finished brushed steel case, tachymeter bezel, sapphire crystal reflections, and precision dial typography.",
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
      "Sculptural commercial staging for Aura Botanicals Radiance Elixir, featuring authentic typography on frosted amber glass and an embossed gold foil presentation box on raw travertine.",
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
  {
    id: "proj-sutra-showreel",
    title: "Sutra Atelier Showreel — Cinematic Brand Film",
    category: "Video",
    client: "Sutra Studio Atelier",
    year: "2026",
    projectType: "Studio Platform",
    badge: "Video",
    thumbnail: "/videos/studio/studio-poster.webp",
    videoUrl: "/videos/studio/studio-reel-desktop.mp4",
    description:
      "Cinematic 4K promotional atelier showreel celebrating the synthesis of sacred geometric Indian heritage and cutting-edge digital craft.",
    deliverables: [
      "4K UHD Master Video Cut",
      "Color Grading & Motion Typography",
      "Bespoke Sound Design & Score",
      "Vertical 9:16 Social Cutdowns",
    ],
    status: "Completed",
  },
  {
    id: "proj-ai-commercial-reel",
    title: "Aethelgard Spatial — Commercial Reel & Motion Typography",
    category: "Video",
    client: "Aethelgard Real Estate",
    year: "2026",
    projectType: "Client Project",
    badge: "Video",
    thumbnail: "/videos/services/ai-video-poster.webp",
    videoUrl: "/videos/services/ai-video-desktop.mp4",
    description:
      "High-converting promotional video advertisement with kinetic type, 3D camera projections, and audio-reactive pacing for social ads.",
    deliverables: [
      "15s & 30s Multi-Hook Commercial Cuts",
      "Kinetic Motion Typography Overlay",
      "Commercial Ad Rights & Licensing",
      "Drive Vault Master Archive",
    ],
    status: "Completed",
  },
  {
    id: "proj-haveli-interior",
    title: "The Jali Sanctuary — Architectural Interior CGI & AutoCAD Blueprint",
    category: "Interior",
    client: "Heritage Architecture",
    year: "2026",
    projectType: "Client Project",
    badge: "Case Study",
    thumbnail: "/images/projects/proj-interior.webp",
    description:
      "Dual-perspective architectural presentation featuring an AutoCAD technical blueprint with millwork dimensions and a photorealistic 3D interior render with jali daylight casting across Calacatta marble.",
    deliverables: [
      "AutoCAD 2D Blueprint & Millwork Specifications",
      "4K Daylight Interior CGI Render",
      "Custom Teakwood & Brass Architectural Details",
    ],
    status: "Completed",
  },
  {
    id: "proj-zenith-exterior",
    title: "Zenith Horizon — Luxury Residential Pavilion CGI",
    category: "3D",
    client: "Zenith Living",
    year: "2026",
    projectType: "Client Project",
    badge: "Case Study",
    thumbnail: "/images/projects/proj-exterior.webp",
    description:
      "Lush tropical exterior villa architectural CGI render capturing twilight ambient glow, infinity pool water caustics, and monolithic stone textures.",
    deliverables: [
      "4K Architectural Exterior Renderings",
      "Photometric Landscape Lighting Study",
      "Print & Billboard Master Exports",
    ],
    status: "Completed",
  },
  {
    id: "proj-aurum-campaign",
    title: "Aurum Botanica — Omni-Channel Performance Ad Suite",
    category: "Marketing",
    client: "Aurum Botanica",
    year: "2026",
    projectType: "Client Project",
    badge: "Case Study",
    thumbnail: "/images/projects/proj-ads.webp",
    description:
      "Omni-channel paid growth advertising creative suite with 10 high-converting static variations, hook copy matrices, and demographic audience testing.",
    deliverables: [
      "10x Multi-Ratio Ad Creatives (1:1, 4:5, 9:16)",
      "Direct-Response Copywriting Matrix",
      "Meta Ads Campaign Architecture",
    ],
    status: "Completed",
  },
];
