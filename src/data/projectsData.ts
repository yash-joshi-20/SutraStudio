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
    thumbnail: "https://image.pollinations.ai/prompt/luxury%20perfume%20bottle%2C%20obsidian%20glass%2C%2024k%20gold%20cap%2C%20caustic%20refractions%2C%20warm%20saffron%20rim%20lighting%2C%20hasselblad%20commercial%20product%20shot%2C%208k?width=1200&height=800&nologo=true",
  },
  {
    id: "proj-villa",
    title: "The Banyan Pavilion — 360° Spatial Villa Tour",
    category: "3D",
    client: "Vedic Living Architecture",
    year: "2026",
    description: "Interactive 360-degree virtual tour with ambient sunset lighting and teakwood architectural accents.",
    badge: "360°",
    thumbnail: "https://image.pollinations.ai/prompt/equirectangular%20360%20degree%20panoramic%20luxury%20modern%20villa%20interior%2C%20floor%20to%20ceiling%20glass%2C%20calacatta%20marble%2C%20warm%20golden%20lighting%2C%208k%20seamless%20hdr%20spherical?width=2048&height=1024&nologo=true",
  },
  {
    id: "proj-exterior",
    title: "Zenith Courtyard — Architectural Film",
    category: "Video",
    client: "Zenith Developments",
    year: "2026",
    description: "10-second high-impact commercial reel highlighting modern sandstone elevations and courtyard reflections.",
    badge: "Video",
    thumbnail: "https://image.pollinations.ai/prompt/cinematic%20architectural%20film%20still%2C%20modern%20sandstone%20courtyard%20villa%20at%20sunset%2C%20ambient%20water%20reflection%2C%20anamorphic%20lens%20flare%2C%208k?width=1200&height=800&nologo=true",
  },
  {
    id: "proj-interior",
    title: "Saffron Haven — Contemporary Living Suite",
    category: "Interior",
    client: "IndoModern Residences",
    year: "2026",
    description: "Warm neutral tones, custom arched partitions, brass accent hardware, and diffused morning light.",
    badge: "Case Study",
    thumbnail: "https://image.pollinations.ai/prompt/architectural%20interior%20rendering%2C%20minimalist%20luxury%20living%20space%2C%20intricate%20golden%20jali%20screens%2C%20calacatta%20gold%20marble%20floors%2C%20recessed%203000k%20warm%20led%2C%20hasselblad%20photography%2C%208k?width=1200&height=800&nologo=true",
  },
  {
    id: "proj-web",
    title: "Kalyan Heritage — Interactive Brand Portal",
    category: "Website",
    client: "Kalyan Silks & Craft",
    year: "2026",
    description: "Next.js dynamic web experience celebrating artisanal looms with GSAP scroll storytelling.",
    badge: "Interactive",
    thumbnail: "/assets/showcase/live-home-desktop.png",
  },
  {
    id: "proj-ads",
    title: "Meta Ads Growth Engine — Diwali Campaign",
    category: "Marketing",
    client: "Shri Naturals",
    year: "2026",
    description: "Multi-variant creative ads campaign driving 4.8x return on ad spend through algorithmic creative optimization.",
    badge: "Case Study",
    thumbnail: "https://image.pollinations.ai/prompt/social%20media%20advertising%20campaign%20creative%2C%20luxury%20aesthetic%2C%20warm%20gold%20and%20obsidian%20palette%2C%20modern%20typography%2C%20commercial%20grade%2C%208k?width=1200&height=800&nologo=true",
  },
];
