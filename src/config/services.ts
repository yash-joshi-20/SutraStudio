/**
 * SUTRA STUDIO — Canonical Service Catalog & Single Source of Truth
 *
 * Defines the complete studio service catalog, per-unit rates, standalone packs,
 * and 12 core disciplines conforming to the approved Sutra Studios pricing baseline.
 *
 * Business Rules:
 * - Hard ceiling: Every listed price is at or below ₹20,000.
 * - Workflow Automation is internal-only (active: false for public catalog).
 * - Pack prices are per bundle and never double-multiplied by quantity.
 */

export type PricingType = "per_unit" | "pack" | "recurring" | "starting_at" | "fixed";

export type ServiceCategory =
  | "Image"
  | "Video"
  | "3D & Spatial"
  | "Design"
  | "Marketing"
  | "Development"
  | "Automation"
  | "Creative";

export interface CanonicalServiceItem {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  tagline: string;
  description: string;
  numericPrice: number;
  pricingType: PricingType;
  startingPrice: string;
  priceDisplay: string;
  isCustomQuote?: boolean;
  ctaText: string;
  ctaHref: string;
  ctaTarget: string;
  deliverables: string[];
  subBullets?: string[];
  quantity: number;
  duration: string;
  revisionPolicy: string;
  estimatedTurnaround: string;
  turnaround: string;
  exclusions: string[];
  icon: string;
  thumbnail: string;
  badge: string;
  mediaType: "image" | "video" | "3d" | "360" | "interactive" | "code";
  mediaFormat: string;
  pipelineEngine: string;
  workflow: string;
  active: boolean;
}

export type ServiceDefinition = CanonicalServiceItem;

/**
 * Shared Indian Rupee Currency Formatter
 */
export function formatCurrencyINR(amount: number | "custom" | string): string {
  if (amount === "custom" || amount === "Custom Quote") return "Custom Quote";
  const num = typeof amount === "string" ? Number(amount.replace(/[^0-9.-]+/g, "")) : amount;
  if (isNaN(num)) return "Custom Quote";
  return `₹${Math.round(num).toLocaleString("en-IN")}`;
}

/**
 * Line Total Calculator
 * Handles per_unit, pack, and fixed items accurately.
 * Quantity = 1 for a pack (e.g. 3 for ₹249) computes exactly ₹249 (not 3 * ₹249).
 */
export function computeItemTotal(
  item: { numericPrice: number; pricingType: string },
  quantity = 1
): number {
  const safeQty = Math.max(1, Math.floor(quantity));
  return item.numericPrice * safeQty;
}

/**
 * ----------------------------------------------------------------------------
 * 1. ALL APPROVED STANDALONE SERVICES & PACKS (36 ITEMS)
 * ----------------------------------------------------------------------------
 */
export const CANONICAL_SERVICES: CanonicalServiceItem[] = [
  // --- STANDALONE IMAGE SERVICES ---
  {
    id: "img-basic-template",
    slug: "basic-template-image",
    name: "Basic Template Image",
    category: "Image",
    tagline: "Template Visual Graphic",
    description: "Single high-quality visual creative adapted from studio-designed brand templates.",
    numericPrice: 99,
    pricingType: "per_unit",
    startingPrice: "₹99",
    priceDisplay: "₹99 each",
    isCustomQuote: false,
    ctaText: "Order Template Image",
    ctaHref: "/orders?service=basic-template-image",
    ctaTarget: "/orders?service=basic-template-image",
    deliverables: [
      "1x High-Resolution Graphic (1080×1080 or 1080×1350)",
      "Standard studio typography & layout adaptation",
      "Full commercial usage rights",
    ],
    subBullets: ["1x High-Res Graphic", "Standard typography", "24h SLA"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "24 Hours",
    turnaround: "24 Hours",
    exclusions: ["Custom 3D modeling excluded", "Multiple distinct design concepts excluded"],
    icon: "Image",
    thumbnail: "/images/services/image-creation.webp",
    badge: "Quick Graphic",
    mediaType: "image",
    mediaFormat: "PNG / WebP (1080×1080)",
    pipelineEngine: "Standard Visual Engine",
    workflow: "image",
    active: true,
  },
  {
    id: "img-branded-social",
    slug: "branded-social-image",
    name: "Branded Social Image",
    category: "Image",
    tagline: "Custom Brand Social Visual",
    description: "Customized branded social graphic crafted with brand typography, palette, and styling.",
    numericPrice: 199,
    pricingType: "per_unit",
    startingPrice: "₹199",
    priceDisplay: "₹199 each",
    isCustomQuote: false,
    ctaText: "Order Branded Image",
    ctaHref: "/orders?service=branded-social-image",
    ctaTarget: "/orders?service=branded-social-image",
    deliverables: [
      "1x Custom Branded Graphic",
      "Brand typography, color palette & logo lockup alignment",
      "Full commercial usage license",
    ],
    subBullets: ["1x Custom Branded Graphic", "Brand palette alignment", "24h SLA"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "24 Hours",
    turnaround: "24 Hours",
    exclusions: ["Raw vector source files excluded", "Animated motion elements excluded"],
    icon: "Image",
    thumbnail: "/images/services/image-creation.webp",
    badge: "Branded Social",
    mediaType: "image",
    mediaFormat: "High-Res PNG (1080×1350)",
    pipelineEngine: "Branded Visual Engine",
    workflow: "image",
    active: true,
  },
  {
    id: "img-ai-product",
    slug: "ai-product-creative",
    name: "Product Creative Design",
    category: "Image",
    tagline: "Photorealistic 4K Product Staging",
    description: "Photorealistic product staging imagery crafted with professional studio lighting, depth staging, and precision retouching.",
    numericPrice: 299,
    pricingType: "per_unit",
    startingPrice: "₹299",
    priceDisplay: "₹299 each",
    isCustomQuote: false,
    ctaText: "Order Product Creative",
    ctaHref: "/orders?service=ai-product-creative",
    ctaTarget: "/orders?service=ai-product-creative",
    deliverables: [
      "1x 4K Photorealistic Product Staging Image",
      "Studio lighting & lifestyle ambient pass",
      "Full commercial copyright license",
    ],
    subBullets: ["1x 4K Product Staging", "Studio lighting pass", "Milestone Delivery"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "24–48 Hours",
    turnaround: "24–48 Hours",
    exclusions: ["Physical product studio photography excluded"],
    icon: "Image",
    thumbnail: "/images/services/image-creation.webp",
    badge: "AI Product Staging",
    mediaType: "image",
    mediaFormat: "4K UHD PNG (3840×2160)",
    pipelineEngine: "Commercial Visual Production",
    workflow: "image",
    active: true,
  },
  {
    id: "pack-img-basic-3x",
    slug: "basic-image-pack-3",
    name: "Basic Image Pack (3 Images)",
    category: "Image",
    tagline: "3 Template Social Graphics",
    description: "Bundle of 3 template-based graphics for standard social posting.",
    numericPrice: 249,
    pricingType: "pack",
    startingPrice: "₹249",
    priceDisplay: "3 for ₹249",
    isCustomQuote: false,
    ctaText: "Order 3-Image Pack",
    ctaHref: "/orders?package=basic-image-pack-3",
    ctaTarget: "/orders?package=basic-image-pack-3",
    deliverables: [
      "3x Template-Based Social Graphics",
      "Web-optimized PNG & WebP formats",
      "Commercial usage license",
    ],
    subBullets: ["3x Template graphics", "Web-ready PNG", "Milestone Delivery"],
    quantity: 3,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round across bundle",
    estimatedTurnaround: "24–48 Hours",
    turnaround: "24–48 Hours",
    exclusions: ["Bespoke concept ideation & strategy excluded"],
    icon: "Image",
    thumbnail: "/images/services/image-creation.webp",
    badge: "3-Image Bundle",
    mediaType: "image",
    mediaFormat: "PNG Bundle",
    pipelineEngine: "Standard Visual Engine",
    workflow: "image",
    active: true,
  },
  {
    id: "pack-img-branded-3x",
    slug: "branded-image-pack-3",
    name: "Branded Image Pack (3 Images)",
    category: "Image",
    tagline: "3 Branded Campaign Creatives",
    description: "Trio of custom branded social visuals tailored to brand guidelines.",
    numericPrice: 499,
    pricingType: "pack",
    startingPrice: "₹499",
    priceDisplay: "3 for ₹499",
    isCustomQuote: false,
    ctaText: "Order 3 Branded Images",
    ctaHref: "/orders?package=branded-image-pack-3",
    ctaTarget: "/orders?package=branded-image-pack-3",
    deliverables: [
      "3x Custom Branded Visual Creatives",
      "Cohesive brand styling & color grading",
      "Full commercial rights",
    ],
    subBullets: ["3x Custom branded graphics", "Cohesive brand styling", "Milestone Delivery"],
    quantity: 3,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "24–48 Hours",
    turnaround: "24–48 Hours",
    exclusions: ["Motion reel animations excluded"],
    icon: "Image",
    thumbnail: "/images/services/image-creation.webp",
    badge: "Branded 3-Pack",
    mediaType: "image",
    mediaFormat: "High-Res PNG (1080×1350)",
    pipelineEngine: "Branded Visual Engine",
    workflow: "image",
    active: true,
  },
  {
    id: "pack-img-branded-5x",
    slug: "branded-image-pack-5",
    name: "Branded Image Pack (5 Images)",
    category: "Image",
    tagline: "5 Weekly Campaign Creatives",
    description: "Curated suite of 5 branded creatives for weekly campaign schedules.",
    numericPrice: 799,
    pricingType: "pack",
    startingPrice: "₹799",
    priceDisplay: "5 for ₹799",
    isCustomQuote: false,
    ctaText: "Order 5 Branded Images",
    ctaHref: "/orders?package=branded-image-pack-5",
    ctaTarget: "/orders?package=branded-image-pack-5",
    deliverables: [
      "5x Custom Branded Visual Creatives",
      "Campaign-aligned angles and layout variations",
      "Full commercial license",
    ],
    subBullets: ["5x Branded graphics", "Weekly campaign coverage", "48h SLA"],
    quantity: 5,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "48 Hours",
    turnaround: "48 Hours",
    exclusions: ["Video deliverables excluded"],
    icon: "Image",
    thumbnail: "/images/services/image-creation.webp",
    badge: "Weekly 5-Pack",
    mediaType: "image",
    mediaFormat: "High-Res PNG Bundle",
    pipelineEngine: "Branded Visual Engine",
    workflow: "image",
    active: true,
  },
  {
    id: "pack-img-branded-10x",
    slug: "branded-image-pack-10",
    name: "Branded Image Pack (10 Images)",
    category: "Image",
    tagline: "10-Asset Branded Content Library",
    description: "Comprehensive 10-asset branded image library for multi-week content coverage.",
    numericPrice: 1499,
    pricingType: "pack",
    startingPrice: "₹1,499",
    priceDisplay: "10 for ₹1,499",
    isCustomQuote: false,
    ctaText: "Order 10 Branded Images",
    ctaHref: "/orders?package=branded-image-pack-10",
    ctaTarget: "/orders?package=branded-image-pack-10",
    deliverables: [
      "10x Custom Branded Visual Creatives",
      "Diverse hero, detail, and promo staging passes",
      "Commercial usage & Google Drive Vault archive",
    ],
    subBullets: ["10x Branded graphics", "Multi-week content library", "48–72h SLA"],
    quantity: 10,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round across library",
    estimatedTurnaround: "48–72 Hours",
    turnaround: "48–72 Hours",
    exclusions: ["Video deliverables excluded"],
    icon: "Image",
    thumbnail: "/images/services/image-creation.webp",
    badge: "Value 10-Pack",
    mediaType: "image",
    mediaFormat: "High-Res PNG Bundle",
    pipelineEngine: "Branded Visual Engine",
    workflow: "image",
    active: true,
  },
  {
    id: "img-banner-cover",
    slug: "banner-cover-design",
    name: "Banner & Cover Design",
    category: "Image",
    tagline: "Social Profile & Channel Headers",
    description: "High-impact banner for LinkedIn, YouTube, Facebook, or Twitter headers.",
    numericPrice: 299,
    pricingType: "per_unit",
    startingPrice: "₹299",
    priceDisplay: "₹299 each",
    isCustomQuote: false,
    ctaText: "Order Banner",
    ctaHref: "/orders?service=banner-cover-design",
    ctaTarget: "/orders?service=banner-cover-design",
    deliverables: [
      "1x Platform-Optimized Banner/Cover Graphic",
      "Safe-zone typography framing for desktop and mobile",
      "Ultra-crisp export in PNG / JPEG",
    ],
    subBullets: ["1x Platform banner", "Desktop & mobile safe-zones", "24h SLA"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "24 Hours",
    turnaround: "24 Hours",
    exclusions: ["Multi-platform variations priced per platform"],
    icon: "Image",
    thumbnail: "/images/services/image-creation.webp",
    badge: "Social Banner",
    mediaType: "image",
    mediaFormat: "UHD Banner PNG",
    pipelineEngine: "Standard Visual Engine",
    workflow: "image",
    active: true,
  },
  {
    id: "img-carousel-5s",
    slug: "social-carousel-5-slides",
    name: "Social Carousel (5 Slides)",
    category: "Image",
    tagline: "5-Slide Educational Swipe Deck",
    description: "Engaging 5-slide educational or promotional swipe carousel with seamless flow.",
    numericPrice: 499,
    pricingType: "pack",
    startingPrice: "₹499",
    priceDisplay: "₹499 (5 Slides)",
    isCustomQuote: false,
    ctaText: "Order Carousel",
    ctaHref: "/orders?service=social-carousel-5-slides",
    ctaTarget: "/orders?service=social-carousel-5-slides",
    deliverables: [
      "5x Seamless Storytelling Carousel Slides",
      "Attention-grabbing cover hook & decisive closing CTA",
      "Multi-slide PDF presentation + individual PNGs",
    ],
    subBullets: ["5x Carousel slides", "Hook & CTA slides", "PDF + PNG exports"],
    quantity: 5,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "24–48 Hours",
    turnaround: "24–48 Hours",
    exclusions: ["Video animations within slides excluded"],
    icon: "Image",
    thumbnail: "/images/services/image-creation.webp",
    badge: "Swipe Carousel",
    mediaType: "image",
    mediaFormat: "PDF + PNG Slides",
    pipelineEngine: "Standard Visual Engine",
    workflow: "image",
    active: true,
  },
  {
    id: "copy-caption-hashtags",
    slug: "caption-hashtags",
    name: "Caption & Hashtags Copy",
    category: "Marketing",
    tagline: "High-Converting Post Copywriting",
    description: "Direct-response post copy with compelling hook, body text, CTA, and targeted hashtag set.",
    numericPrice: 99,
    pricingType: "per_unit",
    startingPrice: "₹99",
    priceDisplay: "₹99 per post",
    isCustomQuote: false,
    ctaText: "Order Caption Copy",
    ctaHref: "/orders?service=caption-hashtags",
    ctaTarget: "/orders?service=caption-hashtags",
    deliverables: [
      "1x Complete Post Caption Deck",
      "3 Hook variations & clear call-to-action",
      "15–20 Research-backed hashtags",
    ],
    subBullets: ["1x Caption deck", "3 Hook variations", "15–20 Hashtags"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "12–24 Hours",
    turnaround: "12–24 Hours",
    exclusions: ["Graphic or video asset design excluded"],
    icon: "TrendingUp",
    thumbnail: "/images/services/digital-marketing.webp",
    badge: "Content Copy",
    mediaType: "interactive",
    mediaFormat: "Formatted Markdown / Text Deck",
    pipelineEngine: "Copywriting Engine",
    workflow: "marketing",
    active: true,
  },
  {
    id: "img-product-cleanup",
    slug: "product-image-cleanup",
    name: "Product Image Cleanup",
    category: "Image",
    tagline: "Background Removal & Retouching",
    description: "Background removal, shadow enhancement, artifact cleaning, and color balance correction.",
    numericPrice: 199,
    pricingType: "per_unit",
    startingPrice: "₹199",
    priceDisplay: "₹199 per image",
    isCustomQuote: false,
    ctaText: "Order Image Cleanup",
    ctaHref: "/orders?service=product-image-cleanup",
    ctaTarget: "/orders?service=product-image-cleanup",
    deliverables: [
      "1x Retouched & Cutout Product Image",
      "Transparent PNG cutout + Pure White background versions",
      "Lighting & reflection cleanup",
    ],
    subBullets: ["1x Cutout & Retouch", "Transparent PNG + White BG", "24h SLA"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "24 Hours",
    turnaround: "24 Hours",
    exclusions: ["Complex 3D reconstructions excluded"],
    icon: "Image",
    thumbnail: "/images/services/image-creation.webp",
    badge: "Retouching Pass",
    mediaType: "image",
    mediaFormat: "Transparent PNG (Alpha)",
    pipelineEngine: "Image Processing Engine",
    workflow: "image",
    active: true,
  },

  // --- STANDALONE VIDEO SERVICES ---
  {
    id: "vid-template-10s",
    slug: "basic-template-video-10s",
    name: "Basic Template Video (Up to 10s)",
    category: "Video",
    tagline: "10-Second Short Template Clip",
    description: "Short 10-second video clip using pre-styled motion templates and royalty-free audio.",
    numericPrice: 199,
    pricingType: "per_unit",
    startingPrice: "₹199",
    priceDisplay: "₹199 each",
    isCustomQuote: false,
    ctaText: "Order 10s Video",
    ctaHref: "/orders?service=basic-template-video-10s",
    ctaTarget: "/orders?service=basic-template-video-10s",
    deliverables: [
      "1x 10-Second Template Video",
      "Vertical 9:16 Reel/Story format",
      "Synchronized background audio track",
    ],
    subBullets: ["1x 10-Second Video", "9:16 Vertical format", "24h SLA"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "24 Hours",
    turnaround: "24 Hours",
    exclusions: ["Custom voiceover narration excluded", "Multi-scene storyboarding excluded"],
    icon: "Video",
    thumbnail: "/images/services/video-creation.webp",
    badge: "10s Short",
    mediaType: "video",
    mediaFormat: "1080p MP4 (9:16)",
    pipelineEngine: "Standard Video Engine",
    workflow: "video",
    active: true,
  },
  {
    id: "vid-promo-reel-30s",
    slug: "promotional-reel-30s",
    name: "Promotional Reel (15–30s)",
    category: "Video",
    tagline: "15–30s Commercial Promo Reel",
    description: "Dynamic 15–30 second promotional commercial reel featuring kinetic text and sound design.",
    numericPrice: 499,
    pricingType: "per_unit",
    startingPrice: "₹499",
    priceDisplay: "₹499 each",
    isCustomQuote: false,
    ctaText: "Order Promo Reel",
    ctaHref: "/orders?service=promotional-reel-30s",
    ctaTarget: "/orders?service=promotional-reel-30s",
    deliverables: [
      "1x 15–30s Commercial Promo Reel",
      "Kinetic typography & branding animation",
      "Percussive sound effects & licensed background score",
    ],
    subBullets: ["1x 15–30s Promo Reel", "Kinetic titles & sound design", "Milestone Delivery"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "24–48 Hours",
    turnaround: "24–48 Hours",
    exclusions: ["Complex 3D character animation excluded"],
    icon: "Video",
    thumbnail: "/images/services/video-creation.webp",
    badge: "Commercial Reel",
    mediaType: "video",
    mediaFormat: "1080p / 4K MP4 (9:16 Vertical)",
    pipelineEngine: "Cinematic Motion Production",
    workflow: "video",
    active: true,
  },
  {
    id: "vid-ai-product-reel",
    slug: "ai-product-reel-30s",
    name: "AI-Assisted Product Reel (15–30s)",
    category: "Video",
    tagline: "Cinematic 3D Product Ad Reel",
    description: "Cinematic product showcase featuring AI camera motion, realistic 3D staging, and voiceover.",
    numericPrice: 799,
    pricingType: "per_unit",
    startingPrice: "₹799",
    priceDisplay: "₹799 each",
    isCustomQuote: false,
    ctaText: "Order Product Reel",
    ctaHref: "/orders?service=ai-product-reel-30s",
    ctaTarget: "/orders?service=ai-product-reel-30s",
    deliverables: [
      "1x 15–30s Cinematic Product Reel",
      "AI camera motion & dynamic perspective passes",
      "Natural voiceover narration sync & sound mastering",
    ],
    subBullets: ["1x 15–30s Product Reel", "Dynamic AI camera motion", "Voiceover sync"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "48 Hours",
    turnaround: "48 Hours",
    exclusions: ["On-location live video shoot excluded"],
    icon: "Video",
    thumbnail: "/images/services/video-creation.webp",
    badge: "AI Product Reel",
    mediaType: "video",
    mediaFormat: "4K MP4 (9:16 & 16:9)",
    pipelineEngine: "Cinematic Motion Production",
    workflow: "video",
    active: true,
  },
  {
    id: "pack-vid-basic-3x",
    slug: "basic-video-pack-3",
    name: "Basic Video Pack (3 Edits)",
    category: "Video",
    tagline: "3 Short Video Edits",
    description: "Pack of 3 short video edits (up to 10s each) for fast social media posting.",
    numericPrice: 499,
    pricingType: "pack",
    startingPrice: "₹499",
    priceDisplay: "3 for ₹499",
    isCustomQuote: false,
    ctaText: "Order 3 Video Edits",
    ctaHref: "/orders?package=basic-video-pack-3",
    ctaTarget: "/orders?package=basic-video-pack-3",
    deliverables: [
      "3x 10-Second Template Short Videos",
      "Vertical 9:16 format for Reels/Shorts",
      "Basic audio & logo watermark pass",
    ],
    subBullets: ["3x 10-Second videos", "9:16 Vertical format", "48h SLA"],
    quantity: 3,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round across pack",
    estimatedTurnaround: "48 Hours",
    turnaround: "48 Hours",
    exclusions: ["Custom voiceovers excluded"],
    icon: "Video",
    thumbnail: "/images/services/video-creation.webp",
    badge: "3-Edit Pack",
    mediaType: "video",
    mediaFormat: "1080p MP4 Bundle",
    pipelineEngine: "Standard Video Engine",
    workflow: "video",
    active: true,
  },
  {
    id: "pack-vid-promo-3x",
    slug: "promotional-reels-pack-3",
    name: "Promotional Reels Pack (3 Reels)",
    category: "Video",
    tagline: "3 High-Energy Promo Reels",
    description: "Bundle of 3 high-converting 15–30s promotional reels with motion typography.",
    numericPrice: 1299,
    pricingType: "pack",
    startingPrice: "₹1,299",
    priceDisplay: "3 for ₹1,299",
    isCustomQuote: false,
    ctaText: "Order 3 Promo Reels",
    ctaHref: "/orders?package=promotional-reels-pack-3",
    ctaTarget: "/orders?package=promotional-reels-pack-3",
    deliverables: [
      "3x 15–30s High-Energy Commercial Promo Reels",
      "Custom brand color grading & kinetic titles",
      "Sound effects and voiceover alignment",
    ],
    subBullets: ["3x 15–30s Promo reels", "Kinetic text & sound FX", "48–72h SLA"],
    quantity: 3,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round across pack",
    estimatedTurnaround: "48–72 Hours",
    turnaround: "48–72 Hours",
    exclusions: ["Celebrity voiceover licensing fees excluded"],
    icon: "Video",
    thumbnail: "/images/services/video-creation.webp",
    badge: "Promo 3-Pack",
    mediaType: "video",
    mediaFormat: "1080p MP4 Bundle",
    pipelineEngine: "Cinematic Motion Production",
    workflow: "video",
    active: true,
  },
  {
    id: "pack-vid-promo-5x",
    slug: "promotional-reels-pack-5",
    name: "Promotional Reels Pack (5 Reels)",
    category: "Video",
    tagline: "5 Campaign Promo Reels",
    description: "Suite of 5 promotional reels designed for multi-angle social ad testing.",
    numericPrice: 1999,
    pricingType: "pack",
    startingPrice: "₹1,999",
    priceDisplay: "5 for ₹1,999",
    isCustomQuote: false,
    ctaText: "Order 5 Promo Reels",
    ctaHref: "/orders?package=promotional-reels-pack-5",
    ctaTarget: "/orders?package=promotional-reels-pack-5",
    deliverables: [
      "5x 15–30s Commercial Promo Reels",
      "Multi-hook creative variations for ad testing",
      "Full commercial broadcast licensing",
    ],
    subBullets: ["5x 15–30s Promo reels", "Multi-hook creative variations", "3–4 Days"],
    quantity: 5,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round across pack",
    estimatedTurnaround: "3–4 Days",
    turnaround: "3–4 Days",
    exclusions: ["On-camera actor filming excluded"],
    icon: "Video",
    thumbnail: "/images/services/video-creation.webp",
    badge: "Campaign 5-Pack",
    mediaType: "video",
    mediaFormat: "1080p / 4K MP4 Bundle",
    pipelineEngine: "Cinematic Motion Production",
    workflow: "video",
    active: true,
  },
  {
    id: "pack-vid-promo-10x",
    slug: "promotional-reels-pack-10",
    name: "Promotional Reels Pack (10 Reels)",
    category: "Video",
    tagline: "10 Commercial Video Reels",
    description: "Comprehensive 10-reel video suite providing a full month of short-form video content.",
    numericPrice: 3499,
    pricingType: "pack",
    startingPrice: "₹3,499",
    priceDisplay: "10 for ₹3,499",
    isCustomQuote: false,
    ctaText: "Order 10 Promo Reels",
    ctaHref: "/orders?package=promotional-reels-pack-10",
    ctaTarget: "/orders?package=promotional-reels-pack-10",
    deliverables: [
      "10x 15–30s Commercial Video Reels",
      "Kinetic motion graphics, sound design & transitions",
      "Vertical 9:16 UHD master exports in Google Drive Vault",
    ],
    subBullets: ["10x 15–30s Commercial reels", "Full monthly video coverage", "5–7 Days"],
    quantity: 10,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round across pack",
    estimatedTurnaround: "5–7 Days",
    turnaround: "5–7 Days",
    exclusions: ["Custom live videography shoots excluded"],
    icon: "Video",
    thumbnail: "/images/services/video-creation.webp",
    badge: "Monthly 10-Pack",
    mediaType: "video",
    mediaFormat: "UHD MP4 Video Suite",
    pipelineEngine: "Cinematic Motion Production",
    workflow: "video",
    active: true,
  },

  // --- OTHER APPROVED SERVICES ---
  {
    id: "mkt-content-calendar-30d",
    slug: "30-day-content-calendar",
    name: "30-Day Content Calendar",
    category: "Marketing",
    tagline: "30-Day Strategic Editorial Matrix",
    description: "Structured 30-day editorial calendar with themes, post topics, content types, and post dates.",
    numericPrice: 999,
    pricingType: "fixed",
    startingPrice: "₹999",
    priceDisplay: "₹999 fixed",
    isCustomQuote: false,
    ctaText: "Order Content Calendar",
    ctaHref: "/orders?service=30-day-content-calendar",
    ctaTarget: "/orders?service=30-day-content-calendar",
    deliverables: [
      "30-Day Editorial Content Matrix",
      "Themes, content formats & publishing frequency recommendations",
      "Notion workspace & PDF format delivery",
    ],
    subBullets: ["30-Day Content matrix", "Themes & formats", "48h SLA"],
    quantity: 1,
    duration: "30-day plan",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "48 Hours",
    turnaround: "48 Hours",
    exclusions: ["Visual asset production excluded (calendar strategy only)"],
    icon: "TrendingUp",
    thumbnail: "/images/services/digital-marketing.webp",
    badge: "Content Strategy",
    mediaType: "interactive",
    mediaFormat: "PDF Deck + Notion Matrix",
    pipelineEngine: "Marketing Strategy Engine",
    workflow: "marketing",
    active: true,
  },
  {
    id: "mkt-trending-research",
    slug: "trending-topic-research",
    name: "Trending-Topic Research",
    category: "Marketing",
    tagline: "Monthly Trending Topic Intelligence",
    description: "Monthly intelligence reports on trending industry themes, viral hooks, and content gaps for 1 brand.",
    numericPrice: 1499,
    pricingType: "recurring",
    startingPrice: "₹1,499",
    priceDisplay: "₹1,499 / month",
    isCustomQuote: false,
    ctaText: "Order Trend Research",
    ctaHref: "/orders?service=trending-topic-research",
    ctaTarget: "/orders?service=trending-topic-research",
    deliverables: [
      "Weekly Trending Topic Dispatches (4 total / month)",
      "Viral hook concepts tailored specifically to your niche",
      "Competitor momentum & hashtag intelligence",
    ],
    subBullets: ["4 Weekly trend dispatches", "Viral hook concepts", "Competitor intelligence"],
    quantity: 1,
    duration: "30 days",
    revisionPolicy: "Ongoing monthly delivery",
    estimatedTurnaround: "Weekly dispatch cycle",
    turnaround: "Weekly Sprints",
    exclusions: ["Asset production excluded (intelligence and research only)"],
    icon: "TrendingUp",
    thumbnail: "/images/services/digital-marketing.webp",
    badge: "Market Intel",
    mediaType: "interactive",
    mediaFormat: "Weekly PDF Briefings",
    pipelineEngine: "Trend Intelligence Engine",
    workflow: "marketing",
    active: true,
  },
  {
    id: "des-brand-identity-starter",
    slug: "brand-identity-starter",
    name: "Brand Identity Starter",
    category: "Design",
    tagline: "Essential Logo & Brand Styling System",
    description: "Essential visual identity system including primary logo refinements, color palette, and typography lockup.",
    numericPrice: 2999,
    pricingType: "fixed",
    startingPrice: "₹2,999",
    priceDisplay: "₹2,999 fixed",
    isCustomQuote: false,
    ctaText: "Order Brand Identity",
    ctaHref: "/orders?service=brand-identity-starter",
    ctaTarget: "/orders?service=brand-identity-starter",
    deliverables: [
      "Primary Logo Suite (Vector SVG, PNG, PDF formats)",
      "Curated Brand Color Palette (Hex, RGB, CMYK tokens)",
      "Typography hierarchy and pairings sheet",
      "Mini Brand Style Guidelines Deck (PDF)",
    ],
    subBullets: ["Primary logo suite", "Palette tokens", "Typography guide"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "2 revision rounds",
    estimatedTurnaround: "3–5 Days",
    turnaround: "3–5 Days",
    exclusions: ["3D packaging and physical merchandise guidelines excluded"],
    icon: "Image",
    thumbnail: "/images/services/image-creation.webp",
    badge: "Brand Identity",
    mediaType: "image",
    mediaFormat: "Vector SVG & PDF Style Guide",
    pipelineEngine: "Brand Identity Engine",
    workflow: "image",
    active: true,
  },
  {
    id: "3d-render-existing",
    slug: "3d-render-from-model",
    name: "3D Render from Existing Model",
    category: "3D & Spatial",
    tagline: "4K Photorealistic Render per View",
    description: "Studio lighting, texturing pass, and photorealistic 4K render using client-supplied 3D CAD/model.",
    numericPrice: 999,
    pricingType: "per_unit",
    startingPrice: "₹999",
    priceDisplay: "₹999 per view",
    isCustomQuote: false,
    ctaText: "Order 3D Render",
    ctaHref: "/orders?service=3d-render-from-model",
    ctaTarget: "/orders?service=3d-render-from-model",
    deliverables: [
      "1x 4K Photorealistic Render per perspective view",
      "Studio lighting staging and shader tuning",
      "High-resolution PNG / TIFF master export",
    ],
    subBullets: ["1x 4K Render per view", "Studio lighting setup", "Milestone Delivery"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "24–48 Hours",
    turnaround: "24–48 Hours",
    exclusions: ["Creating 3D model from scratch excluded (requires supplied 3D CAD file)"],
    icon: "Box",
    thumbnail: "/images/services/3d-modeling.webp",
    badge: "4K Render",
    mediaType: "3d",
    mediaFormat: "4K UHD PNG (3840×2160)",
    pipelineEngine: "Precision 3D Production",
    workflow: "three-d",
    active: true,
  },
  {
    id: "3d-simple-model",
    slug: "simple-3d-model",
    name: "Simple 3D Model",
    category: "3D & Spatial",
    tagline: "Precision 3D CAD / Mesh Model",
    description: "Clean-topology 3D mesh modeling for single products or objects based on reference photos or sketches.",
    numericPrice: 2999,
    pricingType: "starting_at",
    startingPrice: "₹2,999",
    priceDisplay: "Starting from ₹2,999",
    isCustomQuote: false,
    ctaText: "Order 3D Model",
    ctaHref: "/orders?service=simple-3d-model",
    ctaTarget: "/orders?service=simple-3d-model",
    deliverables: [
      "1x Precision 3D CAD / Product Mesh",
      "Standard PBR textures (Albedo, Roughness, Metallic)",
      "Web-ready glTF/GLB + OBJ and FBX exports",
    ],
    subBullets: ["1x 3D Product Mesh", "Standard PBR textures", "glTF, OBJ, FBX exports"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "2 revision rounds",
    estimatedTurnaround: "48–72 Hours",
    turnaround: "48–72 Hours",
    exclusions: ["Complex organic character sculpting or rigging excluded"],
    icon: "Box",
    thumbnail: "/images/services/3d-modeling.webp",
    badge: "CAD / 3D Asset",
    mediaType: "3d",
    mediaFormat: "GLB / OBJ / FBX",
    pipelineEngine: "Precision 3D Production",
    workflow: "three-d",
    active: true,
  },
  {
    id: "3d-animation-10s",
    slug: "simple-3d-animation-10s",
    name: "Simple 3D Animation (Up to 10s)",
    category: "3D & Spatial",
    tagline: "10-Second 3D Motion Sequence",
    description: "Smooth 360° turntable, explode-view, or camera orbit animation for 3D products up to 10 seconds.",
    numericPrice: 4999,
    pricingType: "fixed",
    startingPrice: "₹4,999",
    priceDisplay: "₹4,999 fixed",
    isCustomQuote: false,
    ctaText: "Order 3D Animation",
    ctaHref: "/orders?service=simple-3d-animation-10s",
    ctaTarget: "/orders?service=simple-3d-animation-10s",
    deliverables: [
      "1x 10-Second 3D Motion Sequence (1080p/4K)",
      "Turntable rotation, orbit, or assembly explode",
      "Alpha transparent or studio backdrop export",
    ],
    subBullets: ["1x 10s 3D Motion", "Turntable orbit", "1080p / 4K MP4"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "3–5 Days",
    turnaround: "3–5 Days",
    exclusions: ["Complex physics simulations or fluid dynamics excluded"],
    icon: "Box",
    thumbnail: "/images/services/3d-modeling.webp",
    badge: "3D Motion",
    mediaType: "3d",
    mediaFormat: "1080p / 4K MP4",
    pipelineEngine: "Precision 3D Production",
    workflow: "three-d",
    active: true,
  },
  {
    id: "tour-360-digital-only",
    slug: "digital-360-tour-supplied",
    name: "Digital-Only 360° Tour (Supplied Panoramas)",
    category: "3D & Spatial",
    tagline: "Interactive WebGL 360 Virtual Tour",
    description: "Interactive WebXR/HTML5 virtual tour assembled using client-supplied 360° panoramic photos.",
    numericPrice: 2999,
    pricingType: "starting_at",
    startingPrice: "₹2,999",
    priceDisplay: "Starting from ₹2,999",
    isCustomQuote: false,
    ctaText: "Order 360 Tour",
    ctaHref: "/orders?service=digital-360-tour-supplied",
    ctaTarget: "/orders?service=digital-360-tour-supplied",
    deliverables: [
      "Interactive Virtual Tour (Up to 5 nodes)",
      "Seamless room-to-room transitions & information hotspots",
      "Embeddable HTML5 code + WebGL viewer",
    ],
    subBullets: ["Interactive Tour (Up to 5 nodes)", "Hotspots & transitions", "Embeddable code"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "2 revision rounds",
    estimatedTurnaround: "48–72 Hours",
    turnaround: "48–72 Hours",
    exclusions: ["Physical on-site photography capture excluded (uses supplied 360 panoramas)"],
    icon: "Compass",
    thumbnail: "/images/services/360-view.webp",
    badge: "Virtual Tour",
    mediaType: "360",
    mediaFormat: "Interactive HTML5 / WebGL",
    pipelineEngine: "Spatial 360 Production",
    workflow: "three-sixty",
    active: true,
  },
  {
    id: "tour-360-local-capture",
    slug: "local-360-capture-tour",
    name: "Local 360° Capture + Tour",
    category: "3D & Spatial",
    tagline: "On-Site 360 HDR Capture & Virtual Tour",
    description: "On-site 360° photography capture and interactive virtual walkthrough compilation for commercial spaces.",
    numericPrice: 7999,
    pricingType: "starting_at",
    startingPrice: "₹7,999",
    priceDisplay: "Starting from ₹7,999",
    isCustomQuote: false,
    ctaText: "Scope Local 360 Tour",
    ctaHref: "/orders?service=local-360-capture-tour",
    ctaTarget: "/orders?service=local-360-capture-tour",
    deliverables: [
      "On-Site 360° HDR Photography Capture (Up to 6 nodes)",
      "Spherical stitch optimization & color calibration",
      "Interactive WebGL tour compilation with custom hotspots & embed code",
    ],
    subBullets: ["On-Site HDR capture (Up to 6 nodes)", "Stitch optimization", "Interactive WebGL tour"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "2 revision rounds",
    estimatedTurnaround: "5–7 Days",
    turnaround: "5–7 Days",
    exclusions: ["Travel beyond local perimeter subject to separate scope agreement"],
    icon: "Compass",
    thumbnail: "/images/services/360-view.webp",
    badge: "On-Site Virtual Tour",
    mediaType: "360",
    mediaFormat: "Interactive WebGL Suite",
    pipelineEngine: "Spatial 360 Production",
    workflow: "three-sixty",
    active: true,
  },
  {
    id: "arch-interior-viz-view",
    slug: "basic-interior-viz-view",
    name: "Basic Interior Visualization (Per View)",
    category: "Design",
    tagline: "4K Architectural Interior Perspective",
    description: "Photorealistic interior render for residential or commercial spaces from supplied 2D/3D floor plans.",
    numericPrice: 1499,
    pricingType: "per_unit",
    startingPrice: "₹1,499",
    priceDisplay: "₹1,499 per view",
    isCustomQuote: false,
    ctaText: "Order Interior Render",
    ctaHref: "/orders?service=basic-interior-viz-view",
    ctaTarget: "/orders?service=basic-interior-viz-view",
    deliverables: [
      "1x 4K Architectural Interior Perspective Render",
      "Lighting simulation (Daylight or Warm Evening choice)",
      "Material and texture palette staging",
    ],
    subBullets: ["1x 4K Interior Render", "Lighting simulation", "48h SLA"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "48 Hours",
    turnaround: "48 Hours",
    exclusions: ["Structural architectural drafting excluded"],
    icon: "Home",
    thumbnail: "/images/services/interior-design.webp",
    badge: "Interior Render",
    mediaType: "image",
    mediaFormat: "4K UHD PNG (3840×2160)",
    pipelineEngine: "Interior Visualization Production",
    workflow: "interior",
    active: true,
  },
  {
    id: "arch-single-room-starter",
    slug: "single-room-starter",
    name: "Single-Room Interior Starter",
    category: "Design",
    tagline: "3-View Interior Design Suite",
    description: "Complete spatial design package for a single room including 3 multi-angle 4K renders and moodboard.",
    numericPrice: 4999,
    pricingType: "fixed",
    startingPrice: "₹4,999",
    priceDisplay: "₹4,999 fixed",
    isCustomQuote: false,
    ctaText: "Order Single Room Starter",
    ctaHref: "/orders?service=single-room-starter",
    ctaTarget: "/orders?service=single-room-starter",
    deliverables: [
      "3x 4K Photorealistic Interior Render Views",
      "Furniture spatial layout & lighting concept",
      "Material specification deck (PDF format)",
    ],
    subBullets: ["3x 4K Interior Views", "Furniture layout concept", "Material specification deck"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "2 revision rounds",
    estimatedTurnaround: "3–5 Days",
    turnaround: "3–5 Days",
    exclusions: ["Full-home architecture excluded (single room scope only)"],
    icon: "Home",
    thumbnail: "/images/services/interior-design.webp",
    badge: "Room Concept",
    mediaType: "image",
    mediaFormat: "4K Render Suite + PDF Deck",
    pipelineEngine: "Interior Visualization Production",
    workflow: "interior",
    active: true,
  },
  {
    id: "arch-3d-floorplan",
    slug: "3d-floor-plan",
    name: "3D Floor Plan",
    category: "Design",
    tagline: "Isometric 4K Cutaway Floor Plan",
    description: "Isometric cutaway 3D floor plan render illustrating architectural layout, materials, and spacing.",
    numericPrice: 1499,
    pricingType: "fixed",
    startingPrice: "₹1,499",
    priceDisplay: "₹1,499 per level",
    isCustomQuote: false,
    ctaText: "Order 3D Floor Plan",
    ctaHref: "/orders?service=3d-floor-plan",
    ctaTarget: "/orders?service=3d-floor-plan",
    deliverables: [
      "1x 4K Isometric 3D Floor Plan Perspective Render",
      "Furniture staging & realistic floor materials",
      "High-resolution PNG export with clean annotations",
    ],
    subBullets: ["1x 4K Isometric Render", "Furniture staging", "48h SLA"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "48 Hours",
    turnaround: "48 Hours",
    exclusions: ["Multi-story properties priced per individual floor level"],
    icon: "Grid",
    thumbnail: "/images/services/interior-design.webp",
    badge: "3D Floor Plan",
    mediaType: "image",
    mediaFormat: "4K UHD Isometric PNG",
    pipelineEngine: "Interior Visualization Production",
    workflow: "interior",
    active: true,
  },
  {
    id: "arch-facade-render-view",
    slug: "facade-elevation-render",
    name: "Facade / Elevation Render (Per View)",
    category: "Design",
    tagline: "4K Exterior Architectural Visualization",
    description: "Exterior architectural perspective render showcasing building facade, glazing, and day/sunset lighting.",
    numericPrice: 1999,
    pricingType: "per_unit",
    startingPrice: "₹1,999",
    priceDisplay: "₹1,999 per view",
    isCustomQuote: false,
    ctaText: "Order Facade Render",
    ctaHref: "/orders?service=facade-elevation-render",
    ctaTarget: "/orders?service=facade-elevation-render",
    deliverables: [
      "1x 4K Exterior Architectural Perspective Render",
      "Glazing reflection bake & architectural material detailing",
      "Landscape ambient staging & lighting simulation",
    ],
    subBullets: ["1x 4K Exterior Render", "Glazing reflections", "48–72h SLA"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "1 revision round",
    estimatedTurnaround: "48–72 Hours",
    turnaround: "48–72 Hours",
    exclusions: ["Urban masterplanning or large commercial complexes excluded"],
    icon: "Grid",
    thumbnail: "/images/services/window-design.webp",
    badge: "Exterior Facade",
    mediaType: "image",
    mediaFormat: "4K UHD PNG (3840×2160)",
    pipelineEngine: "Exterior Visualization Production",
    workflow: "interior",
    active: true,
  },
  {
    id: "mkt-smm-monthly",
    slug: "social-media-management",
    name: "Social Media Management",
    category: "Marketing",
    tagline: "Monthly Curated Profile Management",
    description: "Monthly profile coordination including 12 curated posts, copy, hashtag sets, and monthly performance review.",
    numericPrice: 9999,
    pricingType: "recurring",
    startingPrice: "₹9,999",
    priceDisplay: "₹9,999 / month",
    isCustomQuote: false,
    ctaText: "Order Social Management",
    ctaHref: "/orders?service=social-media-management",
    ctaTarget: "/orders?service=social-media-management",
    deliverables: [
      "12 Curated Brand Posts / Month",
      "Strategic captions, hooks & hashtag bundles",
      "Monthly performance analytics and audience insights review",
    ],
    subBullets: ["12 Curated Posts / Month", "Captions & hashtags", "Monthly review"],
    quantity: 1,
    duration: "30 days",
    revisionPolicy: "Ongoing monthly campaign revisions",
    estimatedTurnaround: "Weekly delivery cadence",
    turnaround: "Monthly Retainer",
    exclusions: ["Community management (inbox direct messages) excluded"],
    icon: "Share2",
    thumbnail: "/images/services/digital-marketing.webp",
    badge: "Monthly Social",
    mediaType: "interactive",
    mediaFormat: "Curated Post Matrix & Analytics",
    pipelineEngine: "Marketing Strategy Engine",
    workflow: "marketing",
    active: true,
  },
  {
    id: "mkt-meta-ads-mgmt",
    slug: "meta-ads-management",
    name: "Meta Ads Management",
    category: "Marketing",
    tagline: "End-to-End Meta Campaign Optimization",
    description: "Campaign setup, audience targeting, pixel check, and performance tuning on Facebook & Instagram.",
    numericPrice: 4999,
    pricingType: "recurring",
    startingPrice: "₹4,999",
    priceDisplay: "₹4,999 / month",
    isCustomQuote: false,
    ctaText: "Order Meta Ads Management",
    ctaHref: "/orders?service=meta-ads-management",
    ctaTarget: "/orders?service=meta-ads-management",
    deliverables: [
      "Full Campaign Setup & Architecture on Meta Ads Manager",
      "Custom Audience & Lookalike blueprint configuration",
      "A/B creative testing & weekly optimization reporting",
    ],
    subBullets: ["Meta Campaign setup", "Audience blueprints", "Weekly optimization"],
    quantity: 1,
    duration: "30 days",
    revisionPolicy: "Ongoing weekly tuning",
    estimatedTurnaround: "Active campaign management",
    turnaround: "Monthly Retainer",
    exclusions: ["Advertising media budget excluded (billed directly to client ad account)"],
    icon: "TrendingUp",
    thumbnail: "/images/services/meta-ads-launcher.webp",
    badge: "Meta Ads",
    mediaType: "interactive",
    mediaFormat: "Meta Campaign Architecture",
    pipelineEngine: "Paid Acquisition Engine",
    workflow: "marketing",
    active: true,
  },
  {
    id: "mkt-seo-starter",
    slug: "seo-starter",
    name: "SEO Starter",
    category: "Marketing",
    tagline: "Organic Search Foundation & Technical SEO",
    description: "Essential organic search optimization: technical site audit, meta title/description tuning, and keyword plan.",
    numericPrice: 4999,
    pricingType: "recurring",
    startingPrice: "₹4,999",
    priceDisplay: "₹4,999 / month",
    isCustomQuote: false,
    ctaText: "Order SEO Starter",
    ctaHref: "/orders?service=seo-starter",
    ctaTarget: "/orders?service=seo-starter",
    deliverables: [
      "Comprehensive Technical SEO Audit",
      "On-page meta tags & heading structure optimization (Up to 10 URLs)",
      "Target keyword roadmap & competitor ranking benchmark",
    ],
    subBullets: ["Technical SEO audit", "On-page optimization (10 URLs)", "Keyword roadmap"],
    quantity: 1,
    duration: "30 days",
    revisionPolicy: "Monthly optimization cycle",
    estimatedTurnaround: "Monthly delivery",
    turnaround: "Monthly Retainer",
    exclusions: ["Paid off-page link building campaigns excluded"],
    icon: "Globe",
    thumbnail: "/images/services/website-development.webp",
    badge: "Organic SEO",
    mediaType: "interactive",
    mediaFormat: "Technical Audit & Tag Deck",
    pipelineEngine: "Marketing Strategy Engine",
    workflow: "marketing",
    active: true,
  },
  {
    id: "dev-landing-page-starter",
    slug: "landing-page-starter",
    name: "Landing Page Starter",
    category: "Development",
    tagline: "Next.js 16 High-Conversion Landing Page",
    description: "High-conversion single-page website built with modern Next.js 16, mobile-responsive layout, and contact intake.",
    numericPrice: 4999,
    pricingType: "fixed",
    startingPrice: "₹4,999",
    priceDisplay: "₹4,999 fixed",
    isCustomQuote: false,
    ctaText: "Order Landing Page",
    ctaHref: "/orders?service=landing-page-starter",
    ctaTarget: "/orders?service=landing-page-starter",
    deliverables: [
      "1x High-Performance Responsive Landing Page",
      "Hero section, social proof, benefits & lead intake form",
      "SEO metadata tags & Vercel deployment setup",
    ],
    subBullets: ["1x Responsive Landing Page", "Hero, benefits & form", "3–5 Days"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "2 revision rounds",
    estimatedTurnaround: "3–5 Days",
    turnaround: "3–5 Days",
    exclusions: ["Multi-page navigation excluded; custom authentication excluded"],
    icon: "Globe",
    thumbnail: "/images/services/website-development.webp",
    badge: "Next.js Landing",
    mediaType: "code",
    mediaFormat: "Next.js Production Codebase",
    pipelineEngine: "Web Development Atelier",
    workflow: "website",
    active: true,
  },
  {
    id: "dev-business-website",
    slug: "business-website-5-pages",
    name: "Business Website (Up to 5 Pages)",
    category: "Development",
    tagline: "Complete 5-Page Studio Web Architecture",
    description: "Complete professional studio website (Home, About, Services, Projects, Contact) with fluid responsive interactions.",
    numericPrice: 14999,
    pricingType: "fixed",
    startingPrice: "₹14,999",
    priceDisplay: "₹14,999 (Up to 5 Pages)",
    isCustomQuote: false,
    ctaText: "Order Business Website",
    ctaHref: "/orders?service=business-website-5-pages",
    ctaTarget: "/orders?service=business-website-5-pages",
    deliverables: [
      "Up to 5 Responsive Custom Pages (Home, About, Services, Portfolio, Contact)",
      "Modern Next.js 16 & Tailwind CSS architecture",
      "SEO metadata tags, Google Analytics & Vercel deployment",
      "Contact form with automated email notification routing",
    ],
    subBullets: ["Up to 5 Pages", "Next.js & Tailwind", "SEO & analytics setup", "5–7 Days"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "3 revision rounds",
    estimatedTurnaround: "5–7 Days",
    turnaround: "5–7 Days",
    exclusions: ["Client login portals and shopping carts excluded"],
    icon: "Globe",
    thumbnail: "/images/services/website-development.webp",
    badge: "5-Page Website",
    mediaType: "code",
    mediaFormat: "Production Next.js Source Code",
    pipelineEngine: "Web Development Atelier",
    workflow: "website",
    active: true,
  },
  {
    id: "dev-starter-ecommerce",
    slug: "starter-ecommerce",
    name: "Starter E-Commerce",
    category: "Development",
    tagline: "Boutique Online Storefront (Up to 15 Products)",
    description: "Fast online storefront for boutique brands with product catalog (up to 15 products), cart, and UPI payment gateway.",
    numericPrice: 19999,
    pricingType: "fixed",
    startingPrice: "₹19,999",
    priceDisplay: "₹19,999 fixed",
    isCustomQuote: false,
    ctaText: "Order Starter Store",
    ctaHref: "/orders?service=starter-ecommerce",
    ctaTarget: "/orders?service=starter-ecommerce",
    deliverables: [
      "Product Catalog Showcase (Up to 15 products)",
      "Shopping cart & streamlined checkout flow",
      "UPI QR / Payment Gateway Integration",
      "Automated order confirmation routing",
    ],
    subBullets: ["Catalog up to 15 products", "Cart & checkout", "UPI gateway", "7–10 Days"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "3 revision rounds",
    estimatedTurnaround: "7–10 Days",
    turnaround: "7–10 Days",
    exclusions: ["Enterprise ERP integration and multi-vendor marketplace excluded"],
    icon: "Globe",
    thumbnail: "/images/services/website-development.webp",
    badge: "Boutique Store",
    mediaType: "code",
    mediaFormat: "Production E-Commerce Codebase",
    pipelineEngine: "Web Development Atelier",
    workflow: "website",
    active: true,
  },
  {
    id: "dev-webapp-prototype",
    slug: "web-app-prototype",
    name: "Web App Prototype (MVP Scope)",
    category: "Development",
    tagline: "Functional Full-Stack SaaS MVP",
    description: "Functional full-stack web application MVP with authentication, dashboard UI, and primary CRUD workflows.",
    numericPrice: 19999,
    pricingType: "fixed",
    startingPrice: "₹19,999",
    priceDisplay: "₹19,999 (MVP Scope)",
    isCustomQuote: false,
    ctaText: "Order Web App Prototype",
    ctaHref: "/orders?service=web-app-prototype",
    ctaTarget: "/orders?service=web-app-prototype",
    deliverables: [
      "Authentication System (Sign in & Sign up)",
      "Client Dashboard Workspace Layout",
      "Single Primary Interactive Workflow / Database CRUD Tool",
      "Firebase Cloud Firestore real-time integration",
    ],
    subBullets: ["Auth system", "Dashboard layout", "Primary CRUD workflow", "10–14 Days"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "3 revision rounds",
    estimatedTurnaround: "10–14 Days",
    turnaround: "10–14 Days",
    exclusions: ["Multi-tenant enterprise permissions and custom microservices excluded"],
    icon: "Layout",
    thumbnail: "/images/services/web-app-development.webp",
    badge: "SaaS / Portal MVP",
    mediaType: "code",
    mediaFormat: "Full-Stack Next.js Source Code",
    pipelineEngine: "Solutions Engineering",
    workflow: "website",
    active: true,
  },
  {
    id: "dev-mobile-app-prototype",
    slug: "mobile-app-prototype",
    name: "Mobile App UI Prototype",
    category: "Development",
    tagline: "6-Screen Interactive Mobile App Prototype",
    description: "Interactive mobile application prototype with up to 6 key app screens designed for iOS and Android.",
    numericPrice: 9999,
    pricingType: "fixed",
    startingPrice: "₹9,999",
    priceDisplay: "₹9,999 (Design Prototype)",
    isCustomQuote: false,
    ctaText: "Order App Prototype",
    ctaHref: "/orders?service=mobile-app-prototype",
    ctaTarget: "/orders?service=mobile-app-prototype",
    deliverables: [
      "Up to 6 Mobile Screen Layouts (Figma / Web Interactive Prototype)",
      "Interactive clickable navigation and screen flow",
      "Design tokens, asset exports & component specifications",
    ],
    subBullets: ["Up to 6 screens", "Interactive navigation flow", "Design tokens & specs"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "2 revision rounds",
    estimatedTurnaround: "5–7 Days",
    turnaround: "5–7 Days",
    exclusions: ["Native production store build excluded (design/prototype only)"],
    icon: "Smartphone",
    thumbnail: "/images/services/mobile-app-setup.webp",
    badge: "Mobile UI Prototype",
    mediaType: "code",
    mediaFormat: "Interactive Prototype & Assets",
    pipelineEngine: "Solutions Engineering",
    workflow: "website",
    active: true,
  },
];

/**
 * ----------------------------------------------------------------------------
 * 2. THE 12 CORE STUDIO DISCIPLINES (PUBLIC SERVICES OVERVIEW)
 * ----------------------------------------------------------------------------
 * Conforms to the 12 canonical disciplines shown on /services.
 * Discipline 12 (Workflow Automation) is strictly internal-only (active: false).
 */
export const SUTRA_SERVICES_CONFIG: ServiceDefinition[] = [
  // 1. Image Creation
  {
    id: "img-creation",
    slug: "image-creation",
    name: "Commercial & Product Image Creation",
    category: "Creative",
    tagline: "Commercial Visuals & Key Brand Imagery",
    description:
      "High-fidelity commercial product imagery, luxury brand mockups, and high-impact visual campaign assets crafted for premium commercial presence.",
    numericPrice: 99,
    pricingType: "starting_at",
    startingPrice: "₹99",
    priceDisplay: "Starting from ₹99 (Single) / ₹249 (3-Pack)",
    isCustomQuote: false,
    ctaText: "Order Image Creation",
    ctaHref: "/orders?service=image-creation",
    ctaTarget: "/orders?service=image-creation",
    deliverables: [
      "4K Photorealistic Master Renders",
      "Studio Lighting & Multi-Angle Passes",
      "Lifestyle Ambient Staging",
      "Full Commercial Copyright License",
      "Prompt Milestone Delivery",
    ],
    subBullets: ["4K Photorealistic Master Renders", "Multi-Angle Passes", "Clear Milestones"],
    quantity: 1,
    duration: "One-time or pack delivery",
    revisionPolicy: "1 to 2 revision rounds",
    estimatedTurnaround: "24–48 Hours",
    turnaround: "24–48 Hours",
    exclusions: ["Physical studio photo shoots excluded"],
    icon: "Image",
    thumbnail: "/images/services/image-creation.webp",
    badge: "4K Visuals",
    mediaType: "image",
    mediaFormat: "4K UHD PNG / TIFF (3840×2160)",
    pipelineEngine: "Commercial Visual Production",
    workflow: "image",
    active: true,
  },

  // 2. Video Creation
  {
    id: "vid-creation",
    slug: "video-creation",
    name: "Promotional Video & Reel Production",
    category: "Creative",
    tagline: "Cinematic Ads, Commercial Reels & Shorts",
    description:
      "Engaging 10-to-30 second cinematic video ads, social reels, motion sequences, and studio-narrated commercial clips with high production polish.",
    numericPrice: 199,
    pricingType: "starting_at",
    startingPrice: "₹199",
    priceDisplay: "Starting from ₹199 (10s Edit) / ₹499 (Promo Reel)",
    isCustomQuote: false,
    ctaText: "Order Video Creation",
    ctaHref: "/orders?service=video-creation",
    ctaTarget: "/orders?service=video-creation",
    deliverables: [
      "15–30s Commercial Video Reels",
      "Studio Voiceover Narration & Sound Design",
      "Multi-Ratio Ad Formats (9:16 Vertical, 16:9 Landscape)",
      "Motion Typography & Color Grading",
      "Organized Project Delivery",
    ],
    subBullets: ["15–30s Commercial Video Reels", "Voiceover & Sound Design", "Organized Delivery"],
    quantity: 1,
    duration: "One-time or pack delivery",
    revisionPolicy: "1 to 2 revision rounds",
    estimatedTurnaround: "24–48 Hours",
    turnaround: "24–48 Hours",
    exclusions: ["Custom live cinematography shoots excluded"],
    icon: "Video",
    thumbnail: "/images/services/video-creation.webp",
    badge: "Commercial Reel",
    mediaType: "video",
    mediaFormat: "ProRes 422 / 4K MP4 (24fps / 60fps)",
    pipelineEngine: "Cinematic Motion Production",
    workflow: "video",
    active: true,
  },

  // 3. 3D Modeling
  {
    id: "3d-modeling",
    slug: "3d-modeling",
    name: "3D Product Modeling & Visualization",
    category: "Design",
    tagline: "High-Precision CAD & Interactive 3D Models",
    description:
      "Precision 3D product CAD modeling, studio product lighting setups, exploded views, and interactive web-ready 3D assets.",
    numericPrice: 999,
    pricingType: "starting_at",
    startingPrice: "₹999",
    priceDisplay: "Starting from ₹999 (Render) / ₹2,999 (Model)",
    isCustomQuote: false,
    ctaText: "Order 3D Model",
    ctaHref: "/orders?service=3d-modeling",
    ctaTarget: "/orders?service=3d-modeling",
    deliverables: [
      "Interactive Web-Ready 3D Asset",
      "glTF / USDZ / OBJ Format Exports",
      "4K PBR Textured Materials",
      "Turntable Lighting Stills",
      "Milestone-Based Delivery",
    ],
    subBullets: ["Interactive Web-Ready 3D Asset", "4K PBR Textured Materials", "Clear Milestones"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "2 revision rounds",
    estimatedTurnaround: "48–72 Hours",
    turnaround: "48 Hours",
    exclusions: ["Complex organic character sculpting excluded"],
    icon: "Box",
    thumbnail: "/images/services/3d-modeling.webp",
    badge: "3D Spatial",
    mediaType: "3d",
    mediaFormat: "GLTF / USDZ / OBJ (4K PBR Textures)",
    pipelineEngine: "Precision 3D Production",
    workflow: "three-d",
    active: true,
  },

  // 4. 360 View
  {
    id: "360-view",
    slug: "360-view",
    name: "360° Virtual Tours",
    category: "Design",
    tagline: "Immersive Panoramic Virtual Tours",
    description:
      "Interactive 360-degree virtual tours built from client-supplied panoramic captures, with optional on-location panoramic capture available for local properties.",
    numericPrice: 2999,
    pricingType: "starting_at",
    startingPrice: "₹2,999",
    priceDisplay: "Starting from ₹2,999 (Supplied Panoramas)",
    isCustomQuote: false,
    ctaText: "Order 360 Tour",
    ctaHref: "/orders?service=360-view",
    ctaTarget: "/orders?service=360-view",
    deliverables: [
      "Equirectangular 360° Panoramic Panoramas",
      "Interactive Spatial Hotspots & Navigation",
      "Embeddable HTML5 WebXR Viewer Code",
      "Mobile Gyroscope & Fullscreen Compatibility",
      "Cloud CDN Staging & Asset Vault Hosting",
    ],
    subBullets: ["Equirectangular 360° Panoramas", "Interactive Hotspots", "Embeddable Viewer"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "2 revision rounds",
    estimatedTurnaround: "48–72 Hours",
    turnaround: "48–72 Hours",
    exclusions: ["Travel beyond local perimeter subject to quote"],
    icon: "Compass",
    thumbnail: "/images/services/360-view.webp",
    badge: "Virtual Tour",
    mediaType: "360",
    mediaFormat: "8K Equirectangular HDR / WebXR HTML5",
    pipelineEngine: "Spatial 360 Production",
    workflow: "three-sixty",
    active: true,
  },

  // 5. Interior Design
  {
    id: "interior-design",
    slug: "interior-design",
    name: "Interior 3D Visualization",
    category: "Design",
    tagline: "Photorealistic Spaces, Staging & CAD Elevations",
    description:
      "Photorealistic interior architectural visualization, luxury spatial staging, daylight simulations, and material schedule decks.",
    numericPrice: 1499,
    pricingType: "starting_at",
    startingPrice: "₹1,499",
    priceDisplay: "Starting from ₹1,499 (Per View) / ₹4,999 (Single Room)",
    isCustomQuote: false,
    ctaText: "Order Interior Viz",
    ctaHref: "/orders?service=interior-design",
    ctaTarget: "/orders?service=interior-design",
    deliverables: [
      "4K Photorealistic Interior Renders",
      "Daylight & Warm Evening Lighting Passes",
      "Material, Finish & Texture Specifications",
      "Furniture Layout Staging Alignment",
      "High-Resolution PDF Presentation Deck",
    ],
    subBullets: ["4K Interior Renders", "Daylight & Evening Passes", "Material Deck"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "1 to 2 revision rounds",
    estimatedTurnaround: "48–72 Hours",
    turnaround: "48–72 Hours",
    exclusions: ["Structural architectural blueprints excluded"],
    icon: "Home",
    thumbnail: "/images/services/interior-design.webp",
    badge: "Interior CGI",
    mediaType: "image",
    mediaFormat: "4K UHD EXR / PNG Render Suite",
    pipelineEngine: "Interior Visualization Production",
    workflow: "interior",
    active: true,
  },

  // 6. Window Design & Facades
  {
    id: "window-design",
    slug: "window-design",
    name: "Exterior 3D Visualization",
    category: "Design",
    tagline: "Architectural Elevation Profiles & Exterior Facades",
    description:
      "Precision facade visualizations, architectural framing profiles, glass transmittance studies, and luxury exterior daylight simulations.",
    numericPrice: 1999,
    pricingType: "starting_at",
    startingPrice: "₹1,999",
    priceDisplay: "Starting from ₹1,999 (Per View)",
    isCustomQuote: false,
    ctaText: "Order Facade Design",
    ctaHref: "/orders?service=window-design",
    ctaTarget: "/orders?service=window-design",
    deliverables: [
      "Exterior Perspective Visualizations",
      "Architectural Elevation Profiles",
      "Framing & Glass Material Bake",
      "Lighting & Glazing Simulation",
      "CAD-Compatible High-Res Drawings",
    ],
    subBullets: ["Exterior Perspective Visualizations", "Elevation Profiles", "CAD Drawings"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "1 to 2 revision rounds",
    estimatedTurnaround: "48–72 Hours",
    turnaround: "48–72 Hours",
    exclusions: ["Structural engineering certification excluded"],
    icon: "Grid",
    thumbnail: "/images/services/window-design.webp",
    badge: "Facade Design",
    mediaType: "image",
    mediaFormat: "4K Exterior Visualization PNG",
    pipelineEngine: "Exterior Visualization Production",
    workflow: "interior",
    active: true,
  },

  // 7. Digital Marketing
  {
    id: "digital-marketing",
    slug: "digital-marketing",
    name: "AI-Powered Digital Marketing",
    category: "Marketing",
    tagline: "Comprehensive Content Matrices & Growth Playbooks",
    description:
      "Strategic content matrices, editorial calendars, demographic targeting research, and direct-response copywriting frameworks.",
    numericPrice: 999,
    pricingType: "starting_at",
    startingPrice: "₹999",
    priceDisplay: "Starting from ₹999 (Content Calendar) / ₹1,499 (Research)",
    isCustomQuote: false,
    ctaText: "Order Marketing Strategy",
    ctaHref: "/orders?service=digital-marketing",
    ctaTarget: "/orders?service=digital-marketing",
    deliverables: [
      "30-Day Content Matrix & Editorial Calendar",
      "Direct-Response Copywriting Angles & Hooks",
      "Target Audience Blueprint & Demographics",
      "Competitor Creative Gap Analysis",
      "Executive Growth Presentation Deck",
    ],
    subBullets: ["30-Day Content Matrix", "Copywriting Angles & Hooks", "Audience Blueprint"],
    quantity: 1,
    duration: "Strategy delivery",
    revisionPolicy: "1 to 2 revision rounds",
    estimatedTurnaround: "48–72 Hours",
    turnaround: "48–72 Hours",
    exclusions: ["Asset production excluded unless ordered in bundle"],
    icon: "TrendingUp",
    thumbnail: "/images/services/digital-marketing.webp",
    badge: "Marketing Strategy",
    mediaType: "interactive",
    mediaFormat: "Digital Workspace & Strategy Deck",
    pipelineEngine: "Marketing Strategy Engine",
    workflow: "marketing",
    active: true,
  },

  // 8. Meta Ads Launcher
  {
    id: "meta-ads",
    slug: "meta-ads",
    name: "Meta Ads Campaign Management",
    category: "Marketing",
    tagline: "High-Converting Facebook & Instagram Ad Creative Packs",
    description:
      "End-to-end Meta ad creative variations, high-converting direct-response copywriting angles, and audience targeting setup for Instagram and Facebook.",
    numericPrice: 4999,
    pricingType: "starting_at",
    startingPrice: "₹4,999",
    priceDisplay: "Starting from ₹4,999 / month (Ad Spend Excluded)",
    isCustomQuote: false,
    ctaText: "Order Meta Ads",
    ctaHref: "/orders?service=meta-ads",
    ctaTarget: "/orders?service=meta-ads",
    deliverables: [
      "High-Converting Ad Creative Variations (1:1 & 9:16)",
      "Direct-Response Copy Angles (Hook, Problem, Offer)",
      "Target Audience Blueprint & Pixel Verification",
      "A/B Testing Creative Matrix",
      "Meta Ads Campaign Setup Blueprint",
    ],
    subBullets: ["Ad Creative Variations", "Direct-Response Copy Angles", "Audience Blueprint"],
    quantity: 1,
    duration: "Campaign setup / monthly",
    revisionPolicy: "Ongoing weekly tuning",
    estimatedTurnaround: "48 Hours",
    turnaround: "48 Hours",
    exclusions: ["Direct media spend paid to Meta excluded"],
    icon: "Share2",
    thumbnail: "/images/services/meta-ads-launcher.webp",
    badge: "Paid Acquisition",
    mediaType: "interactive",
    mediaFormat: "Multi-Ratio Ad Creatives (1:1 & 9:16)",
    pipelineEngine: "Paid Acquisition Engine",
    workflow: "marketing",
    active: true,
  },

  // 9. Website Development
  {
    id: "website-development",
    slug: "website-development",
    name: "Website Design & Development",
    category: "Development",
    tagline: "Fast, Bespoke Next.js 16 Web Experiences",
    description:
      "High-performance Next.js 16 websites featuring fluid micro-interactions, mobile-first responsive architecture, and production deployment.",
    numericPrice: 4999,
    pricingType: "starting_at",
    startingPrice: "₹4,999",
    priceDisplay: "Starting from ₹4,999 (Landing Page) / ₹14,999 (Business Web)",
    isCustomQuote: false,
    ctaText: "Order Website",
    ctaHref: "/orders?service=website-development",
    ctaTarget: "/orders?service=website-development",
    deliverables: [
      "Modern Next.js 16 App Router Architecture",
      "Fully Responsive (Mobile, Tablet, Desktop)",
      "Fluid Motion & Micro-Interactions",
      "On-Page Technical SEO & Meta Tags",
      "Vercel Production Deployment Setup",
    ],
    subBullets: ["Next.js 16 App Router", "Fully Responsive Layout", "SEO & Meta Tags"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "2 to 3 revision rounds",
    estimatedTurnaround: "3–7 Days",
    turnaround: "5–7 Days",
    exclusions: ["Custom SaaS backend logic excluded (see Web App)"],
    icon: "Globe",
    thumbnail: "/images/services/website-development.webp",
    badge: "Next.js Web",
    mediaType: "code",
    mediaFormat: "Production TypeScript / Next.js Source Code",
    pipelineEngine: "Web Development Atelier",
    workflow: "website",
    active: true,
  },

  // 10. Web App Development
  {
    id: "web-app-development",
    slug: "web-app-development",
    name: "Web Application & Client Portal MVP",
    category: "Development",
    tagline: "Custom SaaS Dashboards, Client Portals & Web Apps",
    description:
      "Full-stack web application MVP with authentication, real-time Firestore database, role-based access control, and payment flow integration.",
    numericPrice: 19999,
    pricingType: "starting_at",
    startingPrice: "₹19,999",
    priceDisplay: "Starting from ₹19,999 (Prototype / MVP Scope)",
    isCustomQuote: false,
    ctaText: "Order Web App MVP",
    ctaHref: "/orders?service=web-app-development",
    ctaTarget: "/orders?service=web-app-development",
    deliverables: [
      "Full-Stack Web App Architecture",
      "Firebase Authentication & Role-Based Access Control",
      "Real-Time Cloud Firestore Integration",
      "UPI QR / Gateway Checkout Workflow",
      "Admin Control Hub Layout",
    ],
    subBullets: ["Full-Stack Architecture", "Firebase Auth & RBAC", "Real-Time Firestore"],
    quantity: 1,
    duration: "One-time MVP delivery",
    revisionPolicy: "3 revision rounds",
    estimatedTurnaround: "10–14 Days",
    turnaround: "10–14 Days",
    exclusions: ["Complex microservices and multi-tenant billing tiers require custom quote"],
    icon: "Layout",
    thumbnail: "/images/services/web-app-development.webp",
    badge: "Web App MVP",
    mediaType: "code",
    mediaFormat: "Full-Stack Source Code & Cloud Deployment",
    pipelineEngine: "Solutions Engineering",
    workflow: "website",
    active: true,
  },

  // 11. Mobile App Setup
  {
    id: "mobile-app-setup",
    slug: "mobile-app-setup",
    name: "Mobile App UI Prototype",
    category: "Development",
    tagline: "React Native Expo Mobile Applications for iOS & Android",
    description:
      "Interactive mobile UI design prototypes and React Native Expo cross-platform mobile setups featuring fluid user experiences.",
    numericPrice: 9999,
    pricingType: "starting_at",
    startingPrice: "₹9,999",
    priceDisplay: "Starting from ₹9,999 (UI Prototype)",
    isCustomQuote: false,
    ctaText: "Order Mobile Prototype",
    ctaHref: "/orders?service=mobile-app-setup",
    ctaTarget: "/orders?service=mobile-app-setup",
    deliverables: [
      "Cross-Platform Mobile UI Prototype (iOS & Android)",
      "Interactive Navigation & Flow Animations",
      "Design System Specifications & Component Tokens",
      "Mobile Responsive Viewport Parity",
      "Expo Codebase Ready for Integration",
    ],
    subBullets: ["Cross-Platform UI Prototype", "Interactive Navigation", "Design System Tokens"],
    quantity: 1,
    duration: "One-time delivery",
    revisionPolicy: "2 to 3 revision rounds",
    estimatedTurnaround: "5–10 Days",
    turnaround: "5–10 Days",
    exclusions: ["App Store & Play Store review approval guarantee excluded"],
    icon: "Smartphone",
    thumbnail: "/images/services/mobile-app-setup.webp",
    badge: "Mobile App",
    mediaType: "code",
    mediaFormat: "React Native / Expo Architecture",
    pipelineEngine: "Solutions Engineering",
    workflow: "website",
    active: true,
  },

  // 12. Workflow Automation (INTERNAL OPERATIONAL ENGINE - NOT PUBLIC)
  {
    id: "workflow-automation",
    slug: "workflow-automation",
    name: "Workflow Automation & AI Integration",
    category: "Automation",
    tagline: "Internal Production Pipelines & Cloud Orchestration",
    description:
      "Internal operational infrastructure coordinating automated media generation, render dispatches, and Drive Vault staging.",
    numericPrice: 0,
    pricingType: "starting_at",
    startingPrice: "Custom Quote",
    priceDisplay: "Internal Operational Engine",
    isCustomQuote: true,
    ctaText: "Internal Operations",
    ctaHref: "/orders?service=workflow-automation",
    ctaTarget: "/orders?service=workflow-automation",
    deliverables: [
      "Automated Operational Render Pipelines",
      "Secure Webhook & Integration Configuration",
      "Automated Asset Routing & Vault Delivery",
    ],
    subBullets: ["Automated Operational Pipelines", "Webhook Configuration", "Vault Delivery"],
    quantity: 1,
    duration: "Internal pipeline",
    revisionPolicy: "Internal testing",
    estimatedTurnaround: "Internal Engine",
    turnaround: "Internal",
    exclusions: ["Not publicly promoted as a standard studio service"],
    icon: "Cpu",
    thumbnail: "/images/services/workflow-automation.webp",
    badge: "Internal Only",
    mediaType: "code",
    mediaFormat: "Cloud Workflow Engine",
    pipelineEngine: "Solutions Engineering",
    workflow: "workflow",
    active: false, // HIDDEN FROM PUBLIC MARKETING
  },
];

/**
 * Universal slug resolution map supporting canonical slugs, IDs, and legacy aliases
 */
export const SERVICE_SLUG_ALIASES: Record<string, string> = {
  // Legacy aliases
  "visuals-and-motion": "image-creation",
  "visuals-motion": "image-creation",
  "img-creation": "image-creation",
  "vid-creation": "video-creation",
  "interior-architecture": "interior-design",
  "brand-identity": "digital-marketing",
  "digital-marketing-ads": "meta-ads",
  "meta-ads-launcher": "meta-ads",
  "web-mobile-development": "website-development",
  "web-mobile-dev": "website-development",
  "web-dev": "website-development",
  "webapp-dev": "web-app-development",
  "mobile-setup": "mobile-app-setup",
  "ai-automation": "workflow-automation",
};

/**
 * Resolve any service by ID
 */
export function findServiceById(id: string): CanonicalServiceItem | undefined {
  if (!id) return undefined;
  const cleanId = id.toLowerCase().trim();
  return (
    CANONICAL_SERVICES.find((s) => s.id.toLowerCase() === cleanId) ||
    SUTRA_SERVICES_CONFIG.find((s) => s.id.toLowerCase() === cleanId)
  );
}

/**
 * Resolve any service slug or ID to its canonical definition
 */
export function findServiceBySlug(slugOrId: string): ServiceDefinition | undefined {
  if (!slugOrId) return undefined;
  const normalized = slugOrId.toLowerCase().trim();
  const canonicalSlug = SERVICE_SLUG_ALIASES[normalized] || normalized;

  // Search in disciplines first, then standalone catalog
  return (
    SUTRA_SERVICES_CONFIG.find(
      (s) =>
        s.slug.toLowerCase() === canonicalSlug ||
        s.id.toLowerCase() === canonicalSlug ||
        s.slug.toLowerCase() === normalized ||
        s.id.toLowerCase() === normalized
    ) ||
    CANONICAL_SERVICES.find(
      (s) =>
        s.slug.toLowerCase() === canonicalSlug ||
        s.id.toLowerCase() === canonicalSlug ||
        s.slug.toLowerCase() === normalized ||
        s.id.toLowerCase() === normalized
    )
  );
}

/**
 * Filter services by category
 */
export function getServicesByCategory(category: string): CanonicalServiceItem[] {
  if (!category || category === "All") {
    return CANONICAL_SERVICES.filter((s) => s.active);
  }
  return CANONICAL_SERVICES.filter(
    (s) => s.active && s.category.toLowerCase() === category.toLowerCase()
  );
}

export interface ServiceProductionStep {
  step: number;
  title: string;
  desc: string;
}

export interface ServiceDetailSpec {
  intendedAudience: string;
  pricingUnit: string;
  dimensionsSpecs: string;
  clientInputs: string[];
  productionSteps: ServiceProductionStep[];
  customQuoteConditions: string;
  sampleDisclaimer: string;
}

/**
 * Returns structured production, audience, format, input, and workflow specifications
 * for any canonical service item or discipline.
 */
export function getServiceDetailSpec(service: CanonicalServiceItem): ServiceDetailSpec {
  const slug = (service.slug || "").toLowerCase();

  // 1. Image Design & Commercial Visuals
  if (
    slug === "image-creation" ||
    slug === "basic-template-image" ||
    slug === "branded-social-image" ||
    slug === "ai-product-creative" ||
    slug.includes("image-pack") ||
    slug === "banner-cover-design" ||
    slug === "product-image-cleanup"
  ) {
    return {
      intendedAudience:
        "D2C Brands, E-Commerce Stores, Marketing Agencies, and Retail Brands requiring high-converting visual creative.",
      pricingUnit: slug.includes("pack") ? "per bundle" : "per graphic",
      dimensionsSpecs:
        "1080×1080 (1:1 Feed Square), 1080×1350 (4:5 Portrait), 3840×2160 (4K UHD) | PNG & WebP (RGB, 300 DPI)",
      clientInputs: [
        "Brand logo in vector (SVG) or transparent high-res PNG format",
        "Raw product packshots or reference imagery (if product-specific)",
        "Brand style guide, primary hex colors, and typography preferences",
        "Target promotional headline or promotional offer text (if applicable)",
      ],
      productionSteps: [
        {
          step: 1,
          title: "Brief & Demographic Research",
          desc: "Analyze brand visual guidelines, audience demographics, and high-converting visual trends.",
        },
        {
          step: 2,
          title: "Prompt Architecture & Creative Direction",
          desc: "Structure tailored visual direction, studio lighting setups, and composition parameters.",
        },
        {
          step: 3,
          title: "High-Fidelity 4K Production",
          desc: "Produce photorealistic multi-angle visuals and lifestyle ambient staging in ultra-high resolution.",
        },
        {
          step: 4,
          title: "Art Director QA & Color Balance",
          desc: "Rigorous quality review, brand color grading, typography placement, and contrast verification.",
        },
        {
          step: 5,
          title: "Cloud Deliverables Vault Delivery",
          desc: "Sync final master assets and web-optimized exports directly to your private Google Drive vault.",
        },
      ],
      customQuoteConditions:
        "Bulk product catalogs exceeding 20 SKUs, multi-model lifestyle sets, or physical product staging require a custom studio quote.",
      sampleDisclaimer:
        "✦ STUDIO SAMPLE / SPECULATIVE PROTOTYPE — Visual demonstration of studio technical capability; not a client-contracted endorsement.",
    };
  }

  // 2. Video Editing & Cinematic Reels
  if (
    slug === "video-creation" ||
    slug === "basic-template-video-10s" ||
    slug === "promotional-reel-30s" ||
    slug === "ai-product-reel-30s" ||
    slug.includes("video-pack") ||
    slug.includes("reels-pack")
  ) {
    return {
      intendedAudience:
        "Content Creators, D2C Founders, Social Media Marketers, and Performance Advertising Teams.",
      pricingUnit: slug.includes("pack") ? "per bundle" : "per video edit / reel",
      dimensionsSpecs:
        "9:16 Vertical (1080×1920 Reels/TikTok/Shorts) & 16:9 Landscape (1920×1080 / 4K UHD) | MP4 / ProRes 422 (60fps)",
      clientInputs: [
        "Raw video clips, unboxing footage, or product still images",
        "Script draft, talking points, or key value propositions",
        "Brand logo, preferred font styles, and brand guidelines",
        "Voiceover preference (AI studio narrator, human voiceover, or instrumental only)",
      ],
      productionSteps: [
        {
          step: 1,
          title: "Hook & Pacing Analysis",
          desc: "Script evaluation, 3-second hook optimization, and audio rhythm mapping.",
        },
        {
          step: 2,
          title: "Voiceover & Audio Engineering",
          desc: "Studio narration recording and mastering, background music curation, and sound design.",
        },
        {
          step: 3,
          title: "Multi-Track Motion Assembly",
          desc: "Fast-paced video cutting, kinetic typography, b-roll insertions, and color grading.",
        },
        {
          step: 4,
          title: "Art Director QA & Timing Check",
          desc: "Frame-by-frame pacing inspection, caption synchronization, and audio loudness compliance.",
        },
        {
          step: 5,
          title: "Cloud Deliverables Vault Delivery",
          desc: "Sync vertical reels and landscape cuts to your private Google Drive deliverables vault.",
        },
      ],
      customQuoteConditions:
        "Multi-location physical shoots, on-camera actor hiring, and full-length documentary/podcast edits are quoted on custom request.",
      sampleDisclaimer:
        "✦ STUDIO SAMPLE / SPECULATIVE PROTOTYPE — Demonstration of video pacing, audio grading, and motion graphics; presented for aesthetic reference.",
    };
  }

  // 3. 3D Modeling, Spatial Assets & Animation
  if (
    slug === "3d-modeling" ||
    slug === "simple-3d-model" ||
    slug === "3d-render-from-model" ||
    slug === "simple-3d-animation-10s"
  ) {
    return {
      intendedAudience:
        "Hardware Tech Startups, Luxury Goods Brands, Consumer Packaged Goods, and Industrial Product Designers.",
      pricingUnit: slug.includes("animation") ? "per 10s animation" : "per 3D model / render",
      dimensionsSpecs:
        "glTF 2.0, USDZ, OBJ, FBX | 4K PBR Textures (Albedo, Normal, Roughness, Metalness) | Web-optimized mesh budget (<25MB)",
      clientInputs: [
        "Orthographic product dimension drawings or engineering blueprints (.step or .dwg if available)",
        "Reference photographs from front, side, top, and perspective angles",
        "Physical material samples or finish specifications (matte, gloss, brushed metal, glass)",
        "Target export format requirements (Web 3D, AR QuickLook, or 4K Render Stills)",
      ],
      productionSteps: [
        {
          step: 1,
          title: "Topology & Mesh Construction",
          desc: "Construct clean low/mid-poly polygonal geometry with proper edge-flow.",
        },
        {
          step: 2,
          title: "UV Unwrapping & PBR Material Baking",
          desc: "Generate non-overlapping UVs and author photorealistic 4K Physically Based Rendering textures.",
        },
        {
          step: 3,
          title: "Studio Lighting & Turntable Staging",
          desc: "Configure multi-light studio environment, HDRI reflections, and camera framing.",
        },
        {
          step: 4,
          title: "Mesh & Performance QA",
          desc: "Inspect draw calls, polygon count, material accuracy, and WebGL viewer compatibility.",
        },
        {
          step: 5,
          title: "Drive Vault Handover",
          desc: "Deliver 3D model packages, texture maps, and rendered stills to your private cloud storage.",
        },
      ],
      customQuoteConditions:
        "Complex organic character sculpting, mechanical simulations with >100 sub-parts, or rigged character animations require custom quote.",
      sampleDisclaimer:
        "✦ STUDIO SAMPLE / SPECULATIVE PROTOTYPE — Interactive WebGL PBR model demonstration; presented for aesthetic reference.",
    };
  }

  // 4. 360° Spherical Panoramic Tours
  if (
    slug === "360-view" ||
    slug === "digital-360-tour-supplied" ||
    slug === "local-360-capture-tour"
  ) {
    return {
      intendedAudience:
        "Real Estate Developers, Boutique Hotels & Resorts, Luxury Interior Showrooms, and Architecture Studios.",
      pricingUnit: "per interactive tour",
      dimensionsSpecs:
        "8K Equirectangular Spherical Panoramas (8192×4096 HDR) | WebXR HTML5 Responsive Embed",
      clientInputs: [
        "Supplied 360° camera panoramas (or on-site access within local studio perimeter)",
        "Architectural floor plan schematic for spatial navigation map",
        "Points of interest, hotspot descriptions, and custom interactive markers",
        "Brand logo and custom domain / iframe embed requirements",
      ],
      productionSteps: [
        {
          step: 1,
          title: "Spatial Stitching & HDR Calibration",
          desc: "Equirectangular stitching, zenith/nadir patching, exposure blending, and chromatic correction.",
        },
        {
          step: 2,
          title: "Virtual Tour Graph & Node Linking",
          desc: "Establish directional navigation nodes, spatial walkthrough paths, and mini-map sync.",
        },
        {
          step: 3,
          title: "Hotspot & Information Synthesis",
          desc: "Integrate interactive info cards, video popups, audio ambient guides, and custom branding.",
        },
        {
          step: 4,
          title: "Cross-Device & WebXR QA",
          desc: "Validate mobile gyroscope orientation, touchscreen pan/zoom, and desktop fullscreen controls.",
        },
        {
          step: 5,
          title: "Cloud Hosting & Vault Delivery",
          desc: "Deploy tour to high-speed CDN and deliver standalone embed code to your deliverables library.",
        },
      ],
      customQuoteConditions:
        "Travel outside local radius, massive multi-building campuses (>15 nodes), or drone aerial 360 captures quoted on request.",
      sampleDisclaimer:
        "✦ STUDIO SAMPLE / SPECULATIVE PROTOTYPE — Interactive equirectangular spatial sample; demonstration only.",
    };
  }

  // 5. Interior & Architectural Visualization
  if (
    slug === "interior-design" ||
    slug === "window-design" ||
    slug === "basic-interior-viz-view" ||
    slug === "single-room-starter" ||
    slug === "3d-floor-plan" ||
    slug === "facade-elevation-render"
  ) {
    return {
      intendedAudience:
        "Architects, Interior Designers, Real Estate Developers, and Furniture/Fitout Manufacturers.",
      pricingUnit: slug.includes("single-room") ? "per room" : "per render view",
      dimensionsSpecs:
        "3840×2160 (4K UHD) & 5120×2880 (5K) | PNG / TIFF Suite (300 DPI Print-Ready)",
      clientInputs: [
        "2D Floor plans or CAD elevations with ceiling heights (.dwg, .pdf, or annotated sketches)",
        "Mood board or visual references for furniture style, materials, and color palette",
        "Material specification schedule (wood finishes, stone/marble type, paint codes)",
        "Daylight vs night lighting preference",
      ],
      productionSteps: [
        {
          step: 1,
          title: "Architectural Volume Modeling",
          desc: "Build structural geometry, window openings, architectural moldings, and spatial partitions.",
        },
        {
          step: 2,
          title: "Prop Placement & Staging",
          desc: "Curate designer furniture, bespoke light fixtures, artwork, and interior decor accents.",
        },
        {
          step: 3,
          title: "Photometric Lighting & Materials",
          desc: "Simulate sun position, sky irradiance, physical IES light distributions, and micro-surface roughness.",
        },
        {
          step: 4,
          title: "Art Director QA & Composition",
          desc: "Review photographic composition, vanishing points, reflections, and material fidelity.",
        },
        {
          step: 5,
          title: "Ultra-High-Res Vault Delivery",
          desc: "Deliver 4K render passes, contact sheets, and presentation slides to your client vault.",
        },
      ],
      customQuoteConditions:
        "Large commercial developments, high-rise exterior facades, or animated architectural walkthroughs quoted on request.",
      sampleDisclaimer:
        "✦ STUDIO SAMPLE / SPECULATIVE PROTOTYPE — 4K Interior CGI visualization sample; demonstration only.",
    };
  }

  // 6. Digital Marketing & Meta Ads
  if (
    slug === "digital-marketing" ||
    slug === "meta-ads" ||
    slug === "social-media-management" ||
    slug === "meta-ads-management" ||
    slug === "brand-identity-starter"
  ) {
    return {
      intendedAudience:
        "E-Commerce Founders, Performance Marketers, Direct-to-Consumer Brands, and Local Service Providers.",
      pricingUnit: slug.includes("management") ? "per month" : "per campaign pack",
      dimensionsSpecs:
        "1:1 Square (1080×1080), 9:16 Story/Reel (1080×1920), 4:5 Feed (1080×1350) | Copywriting Markdown & PDF",
      clientInputs: [
        "Meta Business Manager or ad account ID (for setup/pixel checks)",
        "Core offer details, pricing, discount codes, and landing page URLs",
        "Top product imagery, logos, and competitive brand references",
        "Target location, demographics, and customer pain points",
      ],
      productionSteps: [
        {
          step: 1,
          title: "Competitor & Angle Research",
          desc: "Analyze Meta Ad Library for top competitor creatives, hooks, and audience resonance.",
        },
        {
          step: 2,
          title: "Direct-Response Copywriting",
          desc: "Draft high-converting ad copy angles: Problem-Agitate-Solve, Social Proof, and Direct Offer.",
        },
        {
          step: 3,
          title: "Multi-Ratio Creative Design",
          desc: "Design high-contrast visual and video ad variations optimized for thumb-stopping feed presence.",
        },
        {
          step: 4,
          title: "Policy Compliance & Tracking QA",
          desc: "Verify Meta advertising policies, text-to-image ratios, CTA clarity, and UTM attribution.",
        },
        {
          step: 5,
          title: "Campaign Launch / Vault Delivery",
          desc: "Deliver production ad creative packages and copy matrices directly to your workspace.",
        },
      ],
      customQuoteConditions:
        "Direct media spend paid to Meta is strictly excluded; enterprise multi-channel ad management (>₹2L monthly spend) quoted on request.",
      sampleDisclaimer:
        "✦ STUDIO SAMPLE / SPECULATIVE PROTOTYPE — Meta ad creative showcase; demonstration only.",
    };
  }

  // 7. Website & E-Commerce Development
  if (
    slug === "website-development" ||
    slug === "business-website-5-pages" ||
    slug === "starter-ecommerce" ||
    slug === "landing-page-starter"
  ) {
    return {
      intendedAudience:
        "Growing Startups, D2C Brands, Professional Practices, and Premium Creative Agencies.",
      pricingUnit: "per website project",
      dimensionsSpecs:
        "Responsive Web (Mobile 360px to Ultrawide 2560px) | Next.js 16 App Router / TypeScript / Tailwind CSS",
      clientInputs: [
        "Domain registrar login or DNS management access (Cloudflare, GoDaddy, Namecheap)",
        "Brand logo, color palette, and high-resolution media assets",
        "Written page copy (or outline for our team to refine)",
        "Product catalog details and payment gateway keys (Razorpay/Stripe) if e-commerce",
      ],
      productionSteps: [
        {
          step: 1,
          title: "Information Architecture & Wireframes",
          desc: "Structure sitemap, page hierarchy, conversion funnels, and responsive layout wireframes.",
        },
        {
          step: 2,
          title: "Design System & Micro-Interactions",
          desc: "Establish typographic scales, color tokens, button states, and smooth motion transitions.",
        },
        {
          step: 3,
          title: "Next.js App Router Engineering",
          desc: "Build modular TypeScript components, optimize Core Web Vitals, and wire form submissions.",
        },
        {
          step: 4,
          title: "Cross-Device & Technical SEO QA",
          desc: "Test mobile responsiveness, open graph meta tags, Lighthouse performance score (>90), and SSL.",
        },
        {
          step: 5,
          title: "Production Deployment & Handover",
          desc: "Deploy to production Vercel / Cloud CDN, configure custom domain, and deliver repository.",
        },
      ],
      customQuoteConditions:
        "Custom multi-vendor marketplaces, legacy database migrations, and complex headless CMS architectures require custom quote.",
      sampleDisclaimer:
        "✦ STUDIO SAMPLE / SPECULATIVE PROTOTYPE — Next.js responsive website showcase; demonstration only.",
    };
  }

  // 8. Web App Prototype
  if (slug === "web-app-development" || slug === "web-app-prototype") {
    return {
      intendedAudience:
        "Tech Entrepreneurs, SaaS Founders, Operations Teams, and Digital Product Studios.",
      pricingUnit: "per application MVP / prototype",
      dimensionsSpecs:
        "Full-Stack Web App | Next.js 16 / TypeScript / Firebase Auth / Cloud Firestore / Cloud Functions",
      clientInputs: [
        "Product feature brief, user story document, or wireframe concept",
        "User roles and permission hierarchy requirements (Client, Admin, Member)",
        "Data structure and field specifications",
        "Required business service accounts (Payment gateways, transactional email, SMS)",
      ],
      productionSteps: [
        {
          step: 1,
          title: "Architecture & Schema Modeling",
          desc: "Design data structure models, security access rules, and system integration points.",
        },
        {
          step: 2,
          title: "UI Dashboard & State Management",
          desc: "Build responsive client portal views, form validation, and reactive application state.",
        },
        {
          step: 3,
          title: "Authentication & Database Integration",
          desc: "Implement secure Firebase Authentication, session management, and real-time Firestore sync.",
        },
        {
          step: 4,
          title: "Security & Edge-Case QA",
          desc: "Verify authentication guards, payment verification integrity, input sanitation, and role security.",
        },
        {
          step: 5,
          title: "Cloud Deployment & Source Handover",
          desc: "Deploy to cloud infrastructure, transfer GitHub repository access, and provide documentation.",
        },
      ],
      customQuoteConditions:
        "Multi-tenant enterprise SaaS with dedicated isolated databases or high-throughput microservices require bespoke quote.",
      sampleDisclaimer:
        "✦ STUDIO SAMPLE / SPECULATIVE PROTOTYPE — SaaS client portal prototype sample; demonstration only.",
    };
  }

  // 9. Mobile App UI Prototype
  if (slug === "mobile-app-setup" || slug === "mobile-app-prototype") {
    return {
      intendedAudience:
        "Mobile Startups, App Creators, E-Commerce Brands, and Service Businesses launching iOS & Android apps.",
      pricingUnit: "per mobile UI prototype",
      dimensionsSpecs:
        "Mobile Viewports (iOS 393×852, Android 360×800) | React Native Expo / TypeScript Component Tokens",
      clientInputs: [
        "App concept summary, target user personas, and core 3–6 user flow screens",
        "Brand visual guidelines, preferred app icon ideas, and color palettes",
        "Design references of benchmark mobile apps you admire",
        "Expo / React Native preference and device test requirements",
      ],
      productionSteps: [
        {
          step: 1,
          title: "User Journey & Screen Flow Mapping",
          desc: "Map navigation hierarchy, tab bar routes, drawer menus, and modal sheet interactions.",
        },
        {
          step: 2,
          title: "Mobile UI Design & Component Tokens",
          desc: "Craft pixel-perfect mobile screens, touch buttons, inputs, cards, and icon typography.",
        },
        {
          step: 3,
          title: "React Native Expo Implementation",
          desc: "Build cross-platform screens, fluid gestures, list animations, and dark/light themes.",
        },
        {
          step: 4,
          title: "Device Viewport & Touch QA",
          desc: "Test notch/dynamic island spacing, bottom sheet safe areas, tap targets, and performance.",
        },
        {
          step: 5,
          title: "Codebase & Design Asset Handover",
          desc: "Deliver Expo project repository, Figma/design token assets, and testing build guides.",
        },
      ],
      customQuoteConditions:
        "Apple App Store & Google Play Store developer account management and third-party approval warranties excluded.",
      sampleDisclaimer:
        "✦ STUDIO SAMPLE / SPECULATIVE PROTOTYPE — Mobile application UI prototype sample; demonstration only.",
    };
  }

  // 10. Trending Research & Content Strategy
  if (
    slug === "trending-topic-research" ||
    slug === "30-day-content-calendar" ||
    slug === "caption-hashtags" ||
    slug === "social-carousel-5-slides"
  ) {
    return {
      intendedAudience:
        "Social Media Managers, Growth Agencies, Founders, and Content Creators seeking high viral leverage.",
      pricingUnit: slug.includes("calendar") ? "per 30-day calendar" : "per research dossier",
      dimensionsSpecs:
        "Interactive Notion / Google Sheet Matrix & Executive Presentation PDF (1080×1350 for carousels)",
      clientInputs: [
        "Brand industry niche, primary social channels (Instagram, LinkedIn, X, YouTube)",
        "Current customer demographic profile and primary products/services",
        "3 top competitor handles or industry benchmark leaders",
        "Brand tone of voice (educational, authoritative, witty, luxury)",
      ],
      productionSteps: [
        {
          step: 1,
          title: "Real-Time Social Trend Mining",
          desc: "Scan algorithmic velocity, trending audio tracks, viral hooks, and breaking search trends.",
        },
        {
          step: 2,
          title: "Audience Sentiment & Gap Analysis",
          desc: "Identify unanswered customer questions, competitor content blindspots, and engagement hooks.",
        },
        {
          step: 3,
          title: "Hook & Angle Matrix Synthesis",
          desc: "Draft 30 platform-specific post angles, headline variations, and high-retention frameworks.",
        },
        {
          step: 4,
          title: "Editorial QA & Hashtag Optimization",
          desc: "Review hashtag clusters, post timing schedules, and channel-specific best practices.",
        },
        {
          step: 5,
          title: "Workspace & Dossier Delivery",
          desc: "Deliver organized spreadsheet/Notion matrix and executive summary to your deliverables library.",
        },
      ],
      customQuoteConditions:
        "Content visual creative production excluded unless bundled with Daily Trend Creator (₹19,999) or standalone image/video packs.",
      sampleDisclaimer:
        "✦ STUDIO SAMPLE / SPECULATIVE PROTOTYPE — Trend intelligence dossier sample; demonstration only.",
    };
  }

  // Default Fallback for any other service
  return {
    intendedAudience: "Brands, Creators, and Businesses seeking premium studio deliverables.",
    pricingUnit: service.pricingType === "per_unit" ? "per item" : "per project",
    dimensionsSpecs: service.mediaFormat || "Master 4K / High-Resolution Digital Deliverables",
    clientInputs: [
      "Brand logo and visual identity assets",
      "Project specifications, requirements, and reference links",
      "Copy guidelines and target audience definition",
    ],
    productionSteps: [
      { step: 1, title: "Brief & Research", desc: "Understand requirements and target brand standards." },
      { step: 2, title: "Creative Architecture", desc: "Structure initial composition, concept, or blueprint." },
      { step: 3, title: "Studio Production", desc: "Produce high-fidelity master deliverables." },
      { step: 4, title: "Quality Assurance", desc: "Rigorous art-director verification and polish." },
      { step: 5, title: "Vault Delivery", desc: "Synchronize master files to private client storage." },
    ],
    customQuoteConditions:
      "Scopes exceeding standard deliverable quotas or multi-team enterprise requirements require a bespoke quote.",
    sampleDisclaimer:
      "✦ STUDIO PORTFOLIO SHOWCASE — Visual demonstration of studio creative capability; presented for aesthetic reference.",
  };
}
