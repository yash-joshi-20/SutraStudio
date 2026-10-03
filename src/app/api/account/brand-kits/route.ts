/**
 * GET  /api/account/brand-kits   → this client's kits
 * POST /api/account/brand-kits   → create
 * PATCH /api/account/brand-kits  → update (must own it)
 *
 * Every order and every daily monthly job resolves a kit through here, so the
 * kit is the single reusable brand profile described in the product concept.
 * Multiple kits per client are supported; one may be the default.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { badRequest, guarded, notFound, ok, sameOrigin } from "@/lib/api/response";
import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import { toIso } from "@/lib/firebase/db";
import { INDUSTRIES, LANGUAGES } from "@/lib/services/profileStore";

export const dynamic = "force-dynamic";

const COLLECTION = "brandKits";
const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;

export interface BrandKitRecord {
  id: string;
  clientId: string;
  name: string;
  companyName: string;
  logoFileId: string;
  logoUrl: string;
  imageFileIds: string[];
  imageUrls: string[];
  colors: Array<{ name: string; hex: string }>;
  fonts: Array<{ role: string; family: string }>;
  tone: string;
  industry: string;
  language: string;
  website: string;
  socialLinks: Record<string, string>;
  referenceLinks: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

const WRITABLE = [
  "name",
  "companyName",
  "logoFileId",
  "logoUrl",
  "imageFileIds",
  "imageUrls",
  "colors",
  "fonts",
  "tone",
  "industry",
  "language",
  "website",
  "socialLinks",
  "referenceLinks",
  "isDefault",
] as const;

function serialise(id: string, data: Record<string, unknown>): BrandKitRecord {
  return {
    id,
    clientId: String(data.clientId ?? ""),
    name: String(data.name ?? ""),
    companyName: String(data.companyName ?? ""),
    logoFileId: String(data.logoFileId ?? ""),
    logoUrl: String(data.logoUrl ?? ""),
    imageFileIds: (data.imageFileIds as string[]) ?? [],
    imageUrls: (data.imageUrls as string[]) ?? [],
    colors: (data.colors as BrandKitRecord["colors"]) ?? [],
    fonts: (data.fonts as BrandKitRecord["fonts"]) ?? [],
    tone: String(data.tone ?? ""),
    industry: String(data.industry ?? ""),
    language: String(data.language ?? "en"),
    website: String(data.website ?? ""),
    socialLinks: (data.socialLinks as Record<string, string>) ?? {},
    referenceLinks: (data.referenceLinks as string[]) ?? [],
    isDefault: Boolean(data.isDefault),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function validate(body: Record<string, unknown>) {
  const issues: Array<{ field: string; message: string }> = [];
  const out: Record<string, unknown> = {};

  if ("name" in body) {
    const v = typeof body.name === "string" ? body.name.trim() : "";
    if (v.length < 2) issues.push({ field: "name", message: "Give this brand kit a name." });
    else if (v.length > 80) issues.push({ field: "name", message: "Name must be under 80 characters." });
    else out.name = v;
  }
  if ("companyName" in body) {
    const v = typeof body.companyName === "string" ? body.companyName.trim() : "";
    if (v.length > 120) issues.push({ field: "companyName", message: "Company name is too long." });
    else out.companyName = v;
  }
  if ("tone" in body) {
    const v = typeof body.tone === "string" ? body.tone.trim() : "";
    if (v.length > 400) issues.push({ field: "tone", message: "Tone description is too long." });
    else out.tone = v;
  }
  if ("industry" in body) {
    const v = String(body.industry ?? "");
    if (v && !(INDUSTRIES as readonly string[]).includes(v))
      issues.push({ field: "industry", message: "Choose an industry from the list." });
    else out.industry = v;
  }
  if ("language" in body) {
    const v = String(body.language ?? "");
    if (!(LANGUAGES as readonly string[]).includes(v))
      issues.push({ field: "language", message: "Language must be English, Hindi or Gujarati." });
    else out.language = v;
  }
  if ("website" in body) {
    const v = typeof body.website === "string" ? body.website.trim() : "";
    if (v && !URL_RE.test(v)) issues.push({ field: "website", message: "Website must be a valid http(s) URL." });
    else out.website = v;
  }
  if ("colors" in body) {
    const arr = body.colors;
    if (!Array.isArray(arr)) issues.push({ field: "colors", message: "Colours must be a list." });
    else if (arr.length > 12) issues.push({ field: "colors", message: "Maximum 12 colours." });
    else {
      const clean = arr.map((c) => {
        const o = (c ?? {}) as Record<string, unknown>;
        const hex = String(o.hex ?? "").trim().toUpperCase();
        const name = String(o.name ?? "").trim().slice(0, 40);
        return { name, hex };
      });
      if (clean.some((c) => !HEX.test(c.hex)))
        issues.push({ field: "colors", message: "Each colour needs a hex value such as #D4A35A." });
      else out.colors = clean;
    }
  }
  if ("fonts" in body) {
    const arr = body.fonts;
    if (!Array.isArray(arr)) issues.push({ field: "fonts", message: "Fonts must be a list." });
    else if (arr.length > 6) issues.push({ field: "fonts", message: "Maximum 6 font roles." });
    else {
      const clean = arr.map((f) => {
        const o = (f ?? {}) as Record<string, unknown>;
        return { role: String(o.role ?? "").trim().slice(0, 30), family: String(o.family ?? "").trim().slice(0, 80) };
      });
      if (clean.some((f) => !f.role || !f.family))
        issues.push({ field: "fonts", message: "Each font needs a role and a family." });
      else out.fonts = clean;
    }
  }
  if ("referenceLinks" in body) {
    const arr = body.referenceLinks;
    if (!Array.isArray(arr)) issues.push({ field: "referenceLinks", message: "Reference links must be a list." });
    else if (arr.length > 20) issues.push({ field: "referenceLinks", message: "Maximum 20 links." });
    else {
      const clean = arr.map((l) => String(l ?? "").trim());
      if (clean.some((l) => l && !URL_RE.test(l)))
        issues.push({ field: "referenceLinks", message: "Each reference must be a valid http(s) URL." });
      else out.referenceLinks = clean.filter(Boolean);
    }
  }
  if ("socialLinks" in body) {
    const obj = body.socialLinks;
    if (typeof obj !== "object" || obj === null || Array.isArray(obj))
      issues.push({ field: "socialLinks", message: "Social links must be key/value pairs." });
    else {
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        const url = String(v ?? "").trim();
        if (url && !URL_RE.test(url)) {
          issues.push({ field: `socialLinks.${k}`, message: "Must be a valid http(s) URL." });
        } else if (url) clean[k] = url;
      }
      if (!issues.length) out.socialLinks = clean;
    }
  }
  for (const key of ["logoFileId", "logoUrl"] as const) {
    if (key in body) out[key] = String(body[key] ?? "").trim().slice(0, 400);
  }
  for (const key of ["imageFileIds", "imageUrls"] as const) {
    if (key in body) {
      const arr = body[key];
      if (!Array.isArray(arr)) issues.push({ field: key, message: "Must be a list." });
      else if (arr.length > 30) issues.push({ field: key, message: "Maximum 30 files." });
      else out[key] = arr.map((v) => String(v ?? "").trim()).filter(Boolean);
    }
  }
  if ("isDefault" in body) {
    if (typeof body.isDefault !== "boolean")
      issues.push({ field: "isDefault", message: "Must be true or false." });
    else out.isDefault = body.isDefault;
  }

  return { patch: out, issues };
}

export async function GET() {
  return guarded(async () => {
    const session = await requireUser();
    const snap = await adminDb()
      .collection(COLLECTION)
      .where("clientId", "==", session.uid)
      .orderBy("updatedAt", "desc")
      .get();

    const kits = snap.docs.map((d) => serialise(d.id, d.data() ?? {}));
    kits.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
    return ok({ brandKits: kits, total: kits.length });
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    const session = await requireUser();
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const { patch, issues } = validate(body);
    if (issues.length) {
      return NextResponse.json(
        { error: "Please correct the highlighted fields.", code: "INVALID_INPUT", issues },
        { status: 400 }
      );
    }
    if (!patch.name) {
      return NextResponse.json(
        { error: "Please correct the highlighted fields.", code: "INVALID_INPUT", issues: [{ field: "name", message: "Give this brand kit a name." }] },
        { status: 400 }
      );
    }

    const isFirst = patch.isDefault === true || (await countKits(session.uid)) === 0;

    const ref = adminDb().collection(COLLECTION).doc();
    await ref.set({
      ...patch,
      clientId: session.uid,
      isDefault: isFirst,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (isFirst) await clearOtherDefaults(session.uid, ref.id);
    else await syncProfileDefaultKit(session.uid, ref.id);

    const snap = await ref.get();
    return NextResponse.json(
      { success: true, brandKit: serialise(snap.id, snap.data() ?? {}) },
      { status: 201 }
    );
  });
}

export async function PATCH(req: Request) {
  return guarded(async () => {
    const session = await requireUser();
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return badRequest("Which brand kit? Send its id.");

    const ref = adminDb().collection(COLLECTION).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound("Brand kit not found.");
    if (snap.data()?.clientId !== session.uid) {
      return NextResponse.json({ error: "Not found.", code: "NOT_FOUND" }, { status: 404 });
    }

    const { patch, issues } = validate(body);
    if (issues.length) {
      return NextResponse.json(
        { error: "Please correct the highlighted fields.", code: "INVALID_INPUT", issues },
        { status: 400 }
      );
    }

    await ref.set({ ...patch, updatedAt: serverTimestamp() }, { merge: true });

    if (patch.isDefault === true) {
      await clearOtherDefaults(session.uid, id);
      await syncProfileDefaultKit(session.uid, id);
    }

    const fresh = await ref.get();
    return ok({ success: true, brandKit: serialise(fresh.id, fresh.data() ?? {}) });
  });
}

export async function DELETE(req: Request) {
  return guarded(async () => {
    const session = await requireUser();
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    const id = new URL(req.url).searchParams.get("id") ?? "";
    if (!id) return badRequest("Which brand kit? Send its id.");

    const ref = adminDb().collection(COLLECTION).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return notFound("Brand kit not found.");
    if (snap.data()?.clientId !== session.uid) {
      return NextResponse.json({ error: "Not found.", code: "NOT_FOUND" }, { status: 404 });
    }

    await ref.delete();
    if (snap.data()?.isDefault) await syncProfileDefaultKit(session.uid, "");
    return ok({ success: true, deleted: id });
  });
}

async function countKits(uid: string): Promise<number> {
  const snap = await adminDb().collection(COLLECTION).where("clientId", "==", uid).get();
  return snap.size;
}

async function clearOtherDefaults(uid: string, keepId: string) {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("clientId", "==", uid)
    .where("isDefault", "==", true)
    .get();
  const batch = adminDb().batch();
  for (const doc of snap.docs) {
    if (doc.id === keepId) continue;
    batch.update(doc.ref, { isDefault: false, updatedAt: serverTimestamp() });
  }
  await batch.commit();
}

async function syncProfileDefaultKit(uid: string, kitId: string) {
  await adminDb().collection("users").doc(uid).set({ defaultBrandKitId: kitId }, { merge: true });
}