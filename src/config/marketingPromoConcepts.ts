/**
 * SUTRA STUDIO — Marketing & Self-Promotion Concepts & Disciplines
 * Client-safe definitions for daily agency promotion across the 7 disciplines.
 */

export interface PromoConcept {
  disciplineId: string;
  disciplineName: string;
  theme: string;
  imagePrompt: string;
  imageTitle: string;
  imageCaption: string;
  curatedImageUrl: string;
  curatedPosterUrl: string;
  reelPrompt: string;
  reelTitle: string;
  reelCaption: string;
  curatedVideoUrl: string;
  voiceoverScript: string;
  hashtags: string[];
}

export const AGENCY_PROMO_CONCEPTS: PromoConcept[] = [
  // 1. Commercial Visuals & Motion
  {
    disciplineId: "visuals-motion",
    disciplineName: "Commercial Visuals & Motion",
    theme: "Vedic Architectural Luxury & 4K Diffusion Pipelines",
    imagePrompt:
      "cinematic architectural film still of modern Indian luxury sandstone villa with reflecting water pool, intricate teakwood jali screen, golden hour volumetric sunlight, anamorphic lens flare, 8k commercial photography",
    imageTitle: "Commercial Visuals: Vedic Architectural Flagship",
    imageCaption:
      "Harmonizing classical Indian aesthetic doctrines with high-velocity 4K diffusion renders. Daily master deliverable from Sutra Studio. #SutraStudio #CommercialVisuals #Architecture4K #DesignStudio #VedicDesign",
    curatedImageUrl: "/images/projects/proj-villa.webp",
    curatedPosterUrl: "/videos/services/ai-video-poster.webp",
    reelPrompt:
      "cinematic slow drone camera forward push through luxury sandstone courtyard with lotus reflection pool, warm morning light, 9:16 vertical 60fps",
    reelTitle: "Commercial Motion Reel: Vedic Sanctuaries",
    reelCaption:
      "Where ancient proportions meet contemporary refinement. Sutra Studio crafts master commercial visuals and cinematic motion reels. #VideoReels #KlingAI #CreativeAutomation #MetaAds",
    curatedVideoUrl: "/videos/services/ai-video-mobile.mp4",
    voiceoverScript:
      "Step into spatial harmony. Centuries of Vedic craftsmanship engineered into high-velocity digital flagships.",
    hashtags: ["#SutraStudio", "#LuxuryDesign", "#Architecture4K", "#CreativeAutomation"],
  },

  // 2. Product 3D Modeling & CGI
  {
    disciplineId: "3d-modeling",
    disciplineName: "Product 3D Modeling & CGI",
    theme: "High-Precision CAD Modeling & Interactive WebGL Assets",
    imagePrompt:
      "luxury modern armchair 3d render, emerald velvet and brushed brass, studio lighting, isolated on warm ivory plinth, octane render, 8k photorealistic cgi",
    imageTitle: "Product 3D CGI: Precision WebGL Atelier",
    imageCaption:
      "High-precision 3D CAD modeling with PBR shaders and turntable lighting. Engineered for real-time web interaction. #3DModeling #WebGL #ThreeJS #ProductCGI #SutraStudio",
    curatedImageUrl: "/images/projects/sutra-watch-3d.jpg",
    curatedPosterUrl: "/videos/services/spatial-3d-poster.webp",
    reelPrompt:
      "smooth 360 degree turntable rotation of luxury emerald velvet and brushed brass chair, exploded view animation, octane studio lighting, 9:16 vertical",
    reelTitle: "3D CGI Turntable Reel: Precision Engineering",
    reelCaption:
      "Experience luxury products in full 3D interactive fidelity before manufacturing. Explore WebGL assets by Sutra Studio. #3DCGI #IndustrialDesign #ProductAnimation",
    curatedVideoUrl: "/videos/services/spatial-3d-mobile.mp4",
    voiceoverScript:
      "Sub-millimeter precision. Every curve, stitch, and reflection rendered in real-time interactive 3D.",
    hashtags: ["#3DModeling", "#ThreeJS", "#WebGL", "#SutraStudio"],
  },

  // 3. 360° Virtual Tours & VR
  {
    disciplineId: "360-view",
    disciplineName: "360° Virtual Tours & VR",
    theme: "Immersive Panoramic Virtual Spaces & WebXR",
    imagePrompt:
      "equirectangular 360 degree panoramic luxury modern villa interior, floor to ceiling glass, calacatta marble, warm golden lighting, 8k seamless hdr spherical space",
    imageTitle: "360° Virtual Tour: Immersive Spatial Walkthrough",
    imageCaption:
      "Immersive 360-degree interactive panoramic virtual tours for luxury villas, hospitality resorts, and commercial showrooms. #VirtualTour #360VR #SpatialDesign #SutraStudio",
    curatedImageUrl: "/images/projects/proj-interior.webp",
    curatedPosterUrl: "/videos/services/spatial-3d-poster.webp",
    reelPrompt:
      "camera smooth gimbal pan through 360 panoramic luxury penthouse living room overlooking misty hills at twilight, warm 3000k interior glow, 9:16 vertical",
    reelTitle: "Virtual Tour Reel: Panoramic Walkthrough",
    reelCaption:
      "Step inside virtual spaces crafted with sub-millimeter precision and instant WebGL interactivity. #360Tour #VirtualReality #HospitalityDesign",
    curatedVideoUrl: "/videos/services/spatial-3d-mobile.mp4",
    voiceoverScript:
      "Immerse your clients in reality before the first stone is laid. High-fidelity 360 virtual spaces by Sutra Studio.",
    hashtags: ["#360Tour", "#VR", "#HospitalityDesign", "#SutraStudio"],
  },

  // 4. Interior Architecture & Spatial Staging
  {
    disciplineId: "interior-design",
    disciplineName: "Interior Architecture & Spatial Staging",
    theme: "Vedic Spatial Architecture & Luxury Hospitality Suites",
    imagePrompt:
      "architectural interior rendering, minimalist luxury living space, intricate golden jali screens, calacatta gold marble floors, recessed 3000k warm led, hasselblad photography, 8k",
    imageTitle: "Interior Architecture: Heritage Modern Staging",
    imageCaption:
      "Photorealistic architectural exterior and interior visualization, luxury room staging, lighting studies, and CAD elevations. #InteriorDesign #Architecture #SpatialStaging #SutraStudio",
    curatedImageUrl: "/images/projects/proj-exterior.webp",
    curatedPosterUrl: "/videos/services/spatial-3d-poster.webp",
    reelPrompt:
      "slow elegant tracking shot through minimalist luxury master suite with carved sandstone accents and floor-to-ceiling garden views, 9:16 vertical 4k",
    reelTitle: "Spatial Staging Reel: Architectural Harmony",
    reelCaption:
      "Harmonizing heritage aesthetic doctrines with cutting-edge architectural visualization. #InteriorDesign #VedicDesign #LuxuryLiving",
    curatedVideoUrl: "/videos/services/spatial-3d-mobile.mp4",
    voiceoverScript:
      "Spaces designed to inspire stillness and elegance. Bespoke architectural visualization by Sutra Studio.",
    hashtags: ["#InteriorArchitecture", "#LuxuryLiving", "#SpatialDesign", "#SutraStudio"],
  },

  // 5. Brand Identity & Design Systems
  {
    disciplineId: "brand-identity",
    disciplineName: "Brand Identity & Design Systems",
    theme: "Vedic Brand Architecture & Sacred Typographic Systems",
    imagePrompt:
      "luxury minimalist brand identity guidelines book mockup, gold foil embossed lotus emblem, warm ivory stationery, business cards, studio lighting, 8k",
    imageTitle: "Brand Identity: Sacred Geometry & Design Tokens",
    imageCaption:
      "Complete visual identities, luxury typography hierarchy, vector design tokens, comprehensive brand book, and asset packages. #BrandIdentity #GraphicDesign #DesignSystem #SutraStudio",
    curatedImageUrl: "/images/projects/sutra-cosmetic-render.jpg",
    curatedPosterUrl: "/videos/studio/studio-poster.webp",
    reelPrompt:
      "elegant stop-motion unboxing and page flip of luxury embossed gold foil brand guidelines book on warm ivory linen desk, 9:16 vertical",
    reelTitle: "Brand System Reel: Identity In Motion",
    reelCaption:
      "Timeless visual identities built for enduring distinction across digital and physical touchpoints. #Branding #LogoDesign #DesignTokens",
    curatedVideoUrl: "/videos/studio/studio-reel-mobile.mp4",
    voiceoverScript:
      "A brand is a sacred covenant with your audience. We engineer identities that endure.",
    hashtags: ["#BrandIdentity", "#DesignSystems", "#Typography", "#SutraStudio"],
  },

  // 6. Digital Marketing & Meta Ads
  {
    disciplineId: "digital-marketing-ads",
    disciplineName: "Digital Marketing & Meta Ads",
    theme: "High-Converting Multi-Ratio Meta Creative Campaigns",
    imagePrompt:
      "luxury digital marketing analytics growth dashboard, dark obsidian glass, golden wireframe holographic charts, cinematic lighting, 8k",
    imageTitle: "Meta Ads Infrastructure: High-ROAS Performance Creatives",
    imageCaption:
      "Data-driven creative growth strategies, end-to-end Facebook & Instagram campaign setups, high-converting creative ad variations. #MetaAds #GrowthMarketing #AdCreatives #SutraStudio",
    curatedImageUrl: "/images/projects/proj-ads.webp",
    curatedPosterUrl: "/videos/app/app-demo-poster.webp",
    reelPrompt:
      "dynamic split-screen showcasing 1:1 and 9:16 high-converting ad variations with animated typography and conversion metrics, 9:16 vertical",
    reelTitle: "Performance Ads Reel: Multi-Ratio Variations",
    reelCaption:
      "Deploying high-converting creative ad variations directly via Meta Graph v21.0 to maximize conversion and ROAS. #MetaAds #AdCreative #PerformanceMarketing",
    curatedVideoUrl: "/videos/app/app-demo-mobile.mp4",
    voiceoverScript:
      "Creative that does not merely impress, but converts. Scale your campaigns with Sutra Studio.",
    hashtags: ["#MetaAds", "#PerformanceMarketing", "#Growth", "#SutraStudio"],
  },

  // 7. Website & Mobile App Development
  {
    disciplineId: "web-mobile-dev",
    disciplineName: "Website & Mobile App Development",
    theme: "High-Performance Next.js Web Platforms & iOS Ecosystems",
    imagePrompt:
      "macbook pro titanium and iphone 16 pro displaying sutra studio luxury app interface, gold lotus emblem, architectural desk, soft ambient lighting, 8k",
    imageTitle: "Engineering: Next.js Flagships & Mobile Ecosystems",
    imageCaption:
      "High-performance bespoke websites, client portals, SaaS dashboards, and cross-platform native iOS & Android applications. #WebDevelopment #NextJS #MobileApp #TypeScript #SutraStudio",
    curatedImageUrl: "/images/projects/creme-dor.png",
    curatedPosterUrl: "/videos/app/app-demo-poster.webp",
    reelPrompt:
      "fluid screen scroll through ultra-smooth responsive Next.js portfolio website with 60fps animations and instant micro-interactions, 9:16 vertical",
    reelTitle: "Engineering Reel: Sub-Second Digital Flagships",
    reelCaption:
      "Engineering digital experiences with sub-second page loads, fluid micro-interactions, and enterprise architecture. #NextJS #React #AppDevelopment",
    curatedVideoUrl: "/videos/app/app-demo-mobile.mp4",
    voiceoverScript:
      "Speed is the ultimate luxury. High-performance digital platforms built for the modern web.",
    hashtags: ["#WebDevelopment", "#NextJS", "#React", "#SutraStudio"],
  },
];

export function getRandomDailyPromoConcept(disciplineId?: string): PromoConcept {
  if (disciplineId && disciplineId !== "all") {
    const found = AGENCY_PROMO_CONCEPTS.find((c) => c.disciplineId === disciplineId);
    if (found) return found;
  }
  const randomIndex = Math.floor(Math.random() * AGENCY_PROMO_CONCEPTS.length);
  return AGENCY_PROMO_CONCEPTS[randomIndex];
}
