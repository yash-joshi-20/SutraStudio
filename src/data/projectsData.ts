export interface ProjectItem {
  id: string;
  title: string;
  category: "Image" | "Video" | "3D" | "Interior" | "Website" | "App" | "Marketing";
  client: string;
  year: string;
  description: string;
  badge?: "360°" | "Video" | "Interactive" | "Case Study";
  thumbnail: string;
  videoUrl?: string;
  panoramaUrl?: string;
}

export const SUTRA_PROJECTS: ProjectItem[] = [
  {
    id: "proj-perfume",
    title: "Aura Noir — Luxury Fragrance Render",
    category: "Image",
    client: "Maison Aura",
    year: "2026",
    description: "4K photorealistic product render with caustic glass refraction and golden rim lighting.",
    badge: "Case Study",
    thumbnail: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "proj-villa",
    title: "The Banyan Pavilion — 360° Villa Tour",
    category: "3D",
    client: "Vedic Living Architecture",
    year: "2026",
    description: "Interactive 360-degree virtual tour with ambient sunset lighting and teakwood architectural accents.",
    badge: "360°",
    thumbnail: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "proj-exterior",
    title: "Zenith Courtyard — Architectural Film",
    category: "Video",
    client: "Zenith Developments",
    year: "2026",
    description: "10-second high-impact commercial reel highlighting modern sandstone elevations and courtyard reflections.",
    badge: "Video",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "proj-interior",
    title: "Saffron Haven — Contemporary Living Suite",
    category: "Interior",
    client: "IndoModern Residences",
    year: "2026",
    description: "Warm neutral tones, custom arched partitions, brass accent hardware, and diffused morning light.",
    badge: "Case Study",
    thumbnail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "proj-web",
    title: "Kalyan Heritage — Interactive Brand Portal",
    category: "Website",
    client: "Kalyan Silks & Craft",
    year: "2026",
    description: "Next.js dynamic web experience celebrating artisanal looms with GSAP scroll storytelling.",
    badge: "Interactive",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "proj-ads",
    title: "Meta Ads Growth Engine — Diwali Campaign",
    category: "Marketing",
    client: "Shri Naturals",
    year: "2026",
    description: "Multi-variant creative ads campaign driving 4.8x return on ad spend through AI-assisted creative optimization.",
    badge: "Case Study",
    thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
  },
];
