import { NextResponse } from "next/server";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";
import { AuditLogService } from "@/lib/services/auditLogService";

const DEFAULT_SITE_CONTENT = {
  hero: {
    tagline: "AUTONOMOUS AI CREATIVE & SPATIAL 3D STUDIO",
    title: "Tradition Meets Computational Technology",
    description:
      "Sutra Studio delivers bespoke 3D architectural renders, cinematic commercial video reels, and autonomous creative pipelines engineered with timeless aesthetic rigor.",
    primaryCtaText: "Commission Creative Pipeline",
    secondaryCtaText: "Explore Studio Portfolio",
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
    logoUrl: "/brand/logo.svg",
    studioTitle: "Sutra Studio",
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
              header: { ...DEFAULT_SITE_CONTENT.header, ...data?.header },
              footer: { ...DEFAULT_SITE_CONTENT.footer, ...data?.footer },
              branding: { ...DEFAULT_SITE_CONTENT.branding, ...data?.branding },
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
    const body = await req.json();
    const updated = {
      hero: { ...DEFAULT_SITE_CONTENT.hero, ...(body.hero || {}) },
      header: { ...DEFAULT_SITE_CONTENT.header, ...(body.header || {}) },
      footer: { ...DEFAULT_SITE_CONTENT.footer, ...(body.footer || {}) },
      branding: { ...DEFAULT_SITE_CONTENT.branding, ...(body.branding || {}) },
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
        uid: "admin_cms",
        email: "yashjoshi20@zohomail.in",
        name: "Admin CMS",
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
