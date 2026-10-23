import { NextResponse } from "next/server";
import { adminDb, isFirebaseAdminReady } from "@/lib/db";
import { AuditLogService } from "@/lib/services/auditLogService";
import { assertAdminSession } from "@/lib/auth/requestRole";

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const CMS_FILE_PATH = path.join(DATA_DIR, "sutra_cms_content.json");

function readDiskCms(): any | null {
  try {
    if (fs.existsSync(CMS_FILE_PATH)) {
      const raw = fs.readFileSync(CMS_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("[CMS API] Error reading disk CMS file:", e);
  }
  return null;
}

function writeDiskCms(data: any): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CMS_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.warn("[CMS API] Error writing disk CMS file:", e);
    return false;
  }
}

import { DEFAULT_SITE_CONTENT } from "@/config/siteContent";

// Seed initial memory content from disk if present
const diskInitial = readDiskCms();
let IN_MEMORY_CONTENT = diskInitial
  ? {
      theme: { ...DEFAULT_SITE_CONTENT.theme, ...diskInitial.theme },
      hero: { ...DEFAULT_SITE_CONTENT.hero, ...diskInitial.hero },
      about: { ...DEFAULT_SITE_CONTENT.about, ...diskInitial.about },
      services: { ...DEFAULT_SITE_CONTENT.services, ...diskInitial.services },
      pricing: { ...DEFAULT_SITE_CONTENT.pricing, ...diskInitial.pricing },
      contact: { ...DEFAULT_SITE_CONTENT.contact, ...diskInitial.contact },
      header: { ...DEFAULT_SITE_CONTENT.header, ...diskInitial.header },
      footer: { ...DEFAULT_SITE_CONTENT.footer, ...diskInitial.footer },
      branding: { ...DEFAULT_SITE_CONTENT.branding, ...diskInitial.branding },
      payment: { ...DEFAULT_SITE_CONTENT.payment, ...diskInitial.payment },
    }
  : { ...DEFAULT_SITE_CONTENT };

export async function GET() {
  try {
    if (isFirebaseAdminReady()) {
      try {
        const snap = await adminDb().collection("site_settings").doc("content").get();
        if (snap.exists) {
          const data = snap.data();
          const merged = {
            theme: { ...DEFAULT_SITE_CONTENT.theme, ...data?.theme },
            hero: { ...DEFAULT_SITE_CONTENT.hero, ...data?.hero },
            about: { ...DEFAULT_SITE_CONTENT.about, ...data?.about },
            services: { ...DEFAULT_SITE_CONTENT.services, ...data?.services },
            pricing: { ...DEFAULT_SITE_CONTENT.pricing, ...data?.pricing },
            contact: { ...DEFAULT_SITE_CONTENT.contact, ...data?.contact },
            header: { ...DEFAULT_SITE_CONTENT.header, ...data?.header },
            footer: { ...DEFAULT_SITE_CONTENT.footer, ...data?.footer },
            branding: { ...DEFAULT_SITE_CONTENT.branding, ...data?.branding },
            payment: { ...DEFAULT_SITE_CONTENT.payment, ...data?.payment },
          };
          IN_MEMORY_CONTENT = merged;
          writeDiskCms(merged);
          return NextResponse.json({
            success: true,
            content: merged,
          });
        }
      } catch (e) {
        console.warn("[CMS GET] Firestore fallback:", e);
      }
    }

    const diskData = readDiskCms();
    if (diskData) {
      IN_MEMORY_CONTENT = {
        theme: { ...DEFAULT_SITE_CONTENT.theme, ...diskData.theme },
        hero: { ...DEFAULT_SITE_CONTENT.hero, ...diskData.hero },
        about: { ...DEFAULT_SITE_CONTENT.about, ...diskData.about },
        services: { ...DEFAULT_SITE_CONTENT.services, ...diskData.services },
        pricing: { ...DEFAULT_SITE_CONTENT.pricing, ...diskData.pricing },
        contact: { ...DEFAULT_SITE_CONTENT.contact, ...diskData.contact },
        header: { ...DEFAULT_SITE_CONTENT.header, ...diskData.header },
        footer: { ...DEFAULT_SITE_CONTENT.footer, ...diskData.footer },
        branding: { ...DEFAULT_SITE_CONTENT.branding, ...diskData.branding },
        payment: { ...DEFAULT_SITE_CONTENT.payment, ...diskData.payment },
      };
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
      theme: { ...DEFAULT_SITE_CONTENT.theme, ...(body.theme || {}) },
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
    writeDiskCms(updated);

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
