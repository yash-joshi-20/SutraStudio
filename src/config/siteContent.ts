/**
 * SUTRA STUDIO — Master Site Content & CMS Defaults
 *
 * Canonical defaults strictly aligned with:
 * - AGENTS.md
 * - docs/ai/PROJECT.md
 * - docs/ai/DESIGN-SYSTEM.md
 */

export interface CmsContent {
  theme?: {
    accentColor?: string;
    bodyBgColor?: string;
    bodyBgImage?: string;
    bodyFont?: string;
    headingFont?: string;
    texturePattern?: "none" | "subtle-dots" | "warm-grain" | "grid";
    navbarBgColor?: string;
    footerBgColor?: string;
  };
  hero?: any;
  about?: any;
  services?: any;
  pricing?: any;
  contact?: any;
  header?: any;
  footer?: any;
  branding?: any;
  payment?: any;
  [key: string]: any;
}

export const DEFAULT_SITE_CONTENT: CmsContent = {
  theme: {
    accentColor: "#A98B57",
    bodyBgColor: "#FAF9F5",
    bodyBgImage: "",
    bodyFont: "Inter",
    headingFont: "Inter",
    texturePattern: "subtle-dots",
    navbarBgColor: "#FFFDF9",
    footerBgColor: "#171717",
  },
  hero: {
    tagline: "IDEAS ◆ DESIGN ◆ DEVELOPMENT ◆ GROWTH",
    title: "Tradition Meets Modern Creative Technology",
    description:
      "Bespoke Creative Technology, 3D Spatial Design, Full-Stack Engineering & Digital Marketing Solutions. Rooted in traditional Indian aesthetics, executed with high-precision studio craftsmanship.",
    primaryCtaText: "Start Your Project Today",
    secondaryCtaText: "Explore Solutions & Work",
    statsTurnaround: "48-72 Hours",
    statsRating: "99.8% Precision",
    statsProjects: "300+ Delivered",
    bgColor: "#F8F5EF",
    bgImage: "",
    mediaImage: "/brand/sutra-hero-banner.jpg",
    overlayOpacity: 0.15,
  },
  about: {
    title: "Rooted in Tradition, Engineered with Code",
    subtitle: "We unite heritage Vedic aesthetics with high-performance computational rendering pipelines.",
    story:
      "Founded as an elite digital atelier, Sutra Studio crafts spatial 3D environments, commercial cinematic motion, and autonomous creative infrastructure. Every frame is guided by classical proportion (Pramana), emotional resonance (Rasa), and algorithmic precision (Yantra).",
    valuesStatement: "Zero compromise on craft. Seamless 24/7 digital delivery vault. Direct founder-led engineering.",
    location: "Ahmedabad, Gujarat, India • Serving Discerning Global Brands",
    bgColor: "#FFFFFF",
    bgImage: "",
    mediaImage: "/brand/sutra-founder-atelier.jpg",
    overlayOpacity: 0.05,
  },
  services: {
    title: "Master Disciplines & Studio Capabilities",
    subtitle: "Architectural visualization, cinematic CGI reels, and automated generative pipelines.",
    service1Title: "3D Architectural & Spatial Visualization",
    service1Desc: "Ultra-realistic 4K renders, interior lighting studies, and walkthrough simulations engineered with photorealistic realism.",
    service2Title: "Cinematic Motion & Commercial Reels",
    service2Desc: "Scroll-stopping commercial CGI reels engineered for social engagement, luxury campaigns, and brand storytelling.",
    service3Title: "Autonomous Creative Retainers",
    service3Desc: "End-to-end continuous creative pipeline delivering on-demand assets via secure Google Drive vaults.",
    turnaroundSla: "Standard turnaround within 48–72 hours. Rush 24-hour delivery available on request.",
    bgColor: "#FAF9F5",
    bgImage: "",
    mediaImage: "",
    overlayOpacity: 0.1,
  },
  pricing: {
    title: "Transparent Studio Investment",
    subtitle: "Clear, zero-fee direct UPI or card retainers with full master asset delivery.",
    starterName: "Standard Commission",
    starterPrice: "3,499",
    starterDelivery: "Dedicated Studio Staging",
    starterFeatures: "1 Dedicated 4K Architectural Render • 2 Minor Revisions • High-Res Master Asset • Direct UPI Checkout",
    proName: "Commercial Pro Reel",
    proPrice: "7,499",
    proDelivery: "Dedicated Priority Staging",
    proFeatures: "3 Dedicated 4K Renders • 1 Cinematic 4K Reel (15-30s) • Color Grading • Google Drive Vault Access",
    retainerName: "Monthly Studio Retainer",
    retainerPrice: "19,999",
    retainerDelivery: "Continuous Dedicated Pipeline",
    retainerFeatures: "Continuous Weekly Renders & Reels • Dedicated Senior Producer • Unlimited Revisions • Direct WhatsApp VIP Concierge",
    bgColor: "#FFFDF9",
    bgImage: "",
    mediaImage: "",
    overlayOpacity: 0.05,
  },
  contact: {
    title: "Initiate a Studio Commission",
    subtitle: "Direct access to our senior producer via WhatsApp, phone, or verified inquiry form.",
    email: "yashjoshi20@zohomail.in",
    phone: "+91 82001 92781",
    whatsapp: "+91 82001 92781",
    address: "Ahmedabad, Gujarat, India",
    operatingHours: "Monday – Saturday: 9:00 AM – 8:00 PM IST",
    responseSla: "All inquiries receive a response within 2 hours during studio business hours.",
    bgColor: "#F8F5EF",
    bgImage: "",
    mediaImage: "",
    overlayOpacity: 0.05,
  },
  header: {
    announcementBarText: "Now Booking Creative Studio Retainers & Custom Commissions • Instant Direct Checkout",
    announcementActive: true,
    navigationItems: [
      { label: "Services", href: "/services" },
      { label: "Pricing", href: "/pricing" },
      { label: "Portfolio", href: "/#portfolio" },
      { label: "Studio", href: "/studio" },
    ],
    bgColor: "#FFFDF9",
    textColor: "#171717",
    announcementBg: "#171717",
    announcementTextColor: "#FAF9F5",
  },
  footer: {
    brandTagline: "High-precision computational design and luxury 3D visual engineering atelier.",
    copyrightText: "© 2026 Sutra Studio. All rights reserved. Registered Creative Atelier.",
    contactEmail: "yashjoshi20@zohomail.in",
    contactPhone: "Studio WhatsApp Concierge",
    socialLinks: {
      instagram: "https://www.instagram.com/yashsutrastudio/",
      facebookPage: "https://www.facebook.com/yashsutrastudio/",
      facebookProfile: "https://www.facebook.com/yashjoshisutrastudio/",
      whatsapp: "https://wa.me/918200192781?text=Hello%20Sutra%20Studio%2C%20I%20would%20like%20to%20discuss%20a%20project.",
    },
    bgColor: "#171717",
    textColor: "#FAF9F5",
    bgImage: "",
    overlayOpacity: 0.2,
  },
  branding: {
    logoUrl: "/brand/sutra-logo-primary.png",
    studioTitle: "Sutra Studio",
    faviconUrl: "/favicon.ico",
  },
  payment: {
    upiVpa: "yashjoshi7355@okaxis",
    merchantName: "Sutra Studio / Yash Joshi",
    accountHolder: "Yash Joshi",
  },
};
