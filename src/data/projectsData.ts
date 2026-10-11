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
    client: "Studio Production Showcase",
    year: "2026",
    description:
      "4K photorealistic product render with caustic glass refraction and golden rim lighting.",
    badge: "Case Study",
    thumbnail: "/images/projects/proj-perfume.webp",
  },
  {
    id: "proj-villa",
    title: "The Banyan Pavilion — 360° Spatial Villa Tour",
    category: "3D",
    client: "Architectural Showcase",
    year: "2026",
    description:
      "Interactive 360-degree virtual tour with ambient sunset lighting and teakwood architectural accents.",
    badge: "360°",
    thumbnail: "/images/projects/proj-villa.webp",
  },
  {
    id: "proj-exterior",
    title: "Zenith Courtyard — Architectural Film",
    category: "Video",
    client: "Studio Motion Showcase",
    year: "2026",
    description:
      "10-second commercial reel highlighting modern sandstone elevations and courtyard reflections.",
    badge: "Video",
    thumbnail: "/images/projects/proj-exterior.webp",
  },
  {
    id: "proj-interior",
    title: "Saffron Haven — Contemporary Living Suite",
    category: "Interior",
    client: "Spatial Design Concept",
    year: "2026",
    description:
      "Warm neutral tones, custom arched partitions, brass accent hardware, and diffused morning light.",
    badge: "Case Study",
    thumbnail: "/images/projects/proj-interior.webp",
  },
  {
    id: "proj-web",
    title: "Kalyan Heritage — Interactive Brand Portal",
    category: "Website",
    client: "Web Engineering Showcase",
    year: "2026",
    description:
      "High-performance responsive web experience celebrating artisanal craftsmanship with fluid scroll storytelling.",
    badge: "Interactive",
    thumbnail: "/assets/showcase/live-home-desktop.png",
  },
  {
    id: "proj-ads",
    title: "Meta Ads Growth Engine — Creative Campaign",
    category: "Marketing",
    client: "Digital Growth Showcase",
    year: "2026",
    description:
      "Multi-variant creative ads campaign featuring high-CTR visual angles, strategic headlines, and audience testing.",
    badge: "Case Study",
    thumbnail: "/images/projects/proj-ads.webp",
  },
];
