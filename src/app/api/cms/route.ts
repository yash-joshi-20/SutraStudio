import { NextResponse } from "next/server";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";
import { AuditLogService } from "@/lib/services/auditLogService";
import { assertAdminSession } from "@/lib/auth/requestRole";

const DEFAULT_SITE_CONTENT = {
  hero: {
    tagline: "ENTERPRISE CREATIVE TECHNOLOGY & SPATIAL 3D STUDIO",
    title: "Tradition Meets Computational Technology",
    description:
      "Sutra Studio delivers bespoke 3D architectural renders, cinematic commercial video reels, and autonomous creative pipelines engineered with timeless aesthetic rigor.",
    primaryCtaText: "Commission Creative Pipeline",
    secondaryCtaText: "Explore Studio Portfolio",
    statsTurnaround: "48-72 Hours",
    statsRating: "99.8% Precision",
    statsProjects: "300+ Delivered",
  },
  about: {
    title: "Rooted in Tradition, Engineered with Code",
    subtitle: "We unite heritage Vedic aesthetics with high-performance computational rendering pipelines.",
    story:
      "Founded as an elite digital atelier, Sutra Studio crafts spatial 3D environments, commercial cinematic motion, and autonomous creative infrastructure. Every frame is guided by classical proportion (Pramana), emotional resonance (Rasa), and algorithmic precision (Yantra).",
    valuesStatement: "Zero compromise on craft. Seamless 24/7 digital delivery vault. Direct founder-led engineering.",
    location: "Ahmedabad, Gujarat, India • Serving Discerning Global Brands",
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
  },
  pricing: {
    title: "Transparent Studio Investment",
    subtitle: "Clear, zero-fee direct UPI or card retainers with full master asset delivery.",
    starterName: "Standard Commission",
    starterPrice: "3,499",
    starterDelivery: "48-72 Hours Turnaround",
    starterFeatures: "1 Dedicated 4K Architectural Render • 2 Minor Revisions • High-Res Master Asset • Direct UPI Checkout",
    proName: "Commercial Pro Reel",
    proPrice: "7,499",
    proDelivery: "24-48 Hours Priority Turnaround",
    proFeatures: "3 Dedicated 4K Renders • 1 Cinematic 4K Reel (15-30s) • Color Grading • Google Drive Vault Access",
    retainerName: "Monthly Studio Retainer",
    retainerPrice: "19,999",
    retainerDelivery: "Continuous Dedicated Pipeline",
    retainerFeatures: "Continuous Weekly Renders & Reels • Dedicated Senior Producer • Unlimited Revisions • Direct WhatsApp VIP Concierge",
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
  },
  header: {
    announcementBarText: "Now Booking Q4 Autonomous Retainers • Instant Zero-Fee UPI Direct Checkout",
    announcementActive: true,
    navigationItems: [
      { label: "Services", href: "/services" },
      { label: "Pricing", href: "/pricing" },
      { label: "Portfolio", href: "/#portfolio" },
      { label: "Studio", href: "/studio" },
    ],
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

let IN_MEMORY_CONTENT = { ...DEFAULT_SITE_CONTENT };

export async function GET() {
  try {
    if (isFirebaseAdminReady()) {
      try {
        const snap = await adminDb().collection("site_settings").doc("content").get();
        if (snap.exists) {
          const data = snap.data();
          return NextResponse.json({
            success: true,
            content: {
              hero: { ...DEFAULT_SITE_CONTENT.hero, ...data?.hero },
              about: { ...DEFAULT_SITE_CONTENT.about, ...data?.about },
              services: { ...DEFAULT_SITE_CONTENT.services, ...data?.services },
              pricing: { ...DEFAULT_SITE_CONTENT.pricing, ...data?.pricing },
              contact: { ...DEFAULT_SITE_CONTENT.contact, ...data?.contact },
              header: { ...DEFAULT_SITE_CONTENT.header, ...data?.header },
              footer: { ...DEFAULT_SITE_CONTENT.footer, ...data?.footer },
              branding: { ...DEFAULT_SITE_CONTENT.branding, ...data?.branding },
              payment: { ...DEFAULT_SITE_CONTENT.payment, ...data?.payment },
            },
          });
        }
      } catch (e) {
        console.warn("[CMS GET] Firestore fallback:", e);
      }
    }

    return NextResponse.json({
      success: true,
      content: IN_MEMORY_CONTENT,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      content: DEFAULT_SITE_CONTENT,
    });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await assertAdminSession(req);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const updated = {
      hero: { ...DEFAULT_SITE_CONTENT.hero, ...(body.hero || {}) },
      about: { ...DEFAULT_SITE_CONTENT.about, ...(body.about || {}) },
      services: { ...DEFAULT_SITE_CONTENT.services, ...(body.services || {}) },
      pricing: { ...DEFAULT_SITE_CONTENT.pricing, ...(body.pricing || {}) },
      contact: { ...DEFAULT_SITE_CONTENT.contact, ...(body.contact || {}) },
      header: { ...DEFAULT_SITE_CONTENT.header, ...(body.header || {}) },
      footer: { ...DEFAULT_SITE_CONTENT.footer, ...(body.footer || {}) },
      branding: { ...DEFAULT_SITE_CONTENT.branding, ...(body.branding || {}) },
      payment: { ...DEFAULT_SITE_CONTENT.payment, ...(body.payment || {}) },
      updatedAt: new Date().toISOString(),
    };

    IN_MEMORY_CONTENT = { ...updated };

    if (isFirebaseAdminReady()) {
      try {
        await adminDb().collection("site_settings").doc("content").set(updated, { merge: true });
      } catch (err) {
        console.warn("[CMS POST] Firestore write warning:", err);
      }
    }

    AuditLogService.record({
      who: {
        uid: auth.user.uid,
        email: auth.user.email || "admin@sutrastudios.in",
        name: auth.user.name || "Studio Admin",
        role: "admin",
      },
      what: "SYSTEM_CONFIG_UPDATED",
      targetType: "system",
      targetId: "site_settings:content",
      targetTitle: "Site Content CMS",
      type: "success",
      note: `Site content updated at ${updated.updatedAt}`,
      after: updated,
    });

    return NextResponse.json({
      success: true,
      content: updated,
      message: "Site content updated in Firestore",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update content" },
      { status: 500 }
    );
  }
}
