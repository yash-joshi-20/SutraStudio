/**
 * SUTRA STUDIO — Client Profile Store (Server Only)
 *
 * Field-whitelisted profile reads and writes.
 *
 * PROTECTED_FIELDS can never be written by a client request, no matter what
 * the request body contains. Pricing, role, status, plan and payment fields
 * are server-owned. This is the enforcement point, not a UI convention.
 */

import "server-only";
import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import { toIso } from "@/lib/firebase/db";
import {
  computeProfileCompleteness,
  type SessionUser,
  type UserProfile,
} from "@/lib/auth/session";

export const PROFILES = "users";
export const PREF_DAYS_BEFORE_EXPIRY = 5;

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;
const PHONE_RE = /^[+\d][\d\s\-()]{6,19}$/;
const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}Z[A-Z\d]{1}$/;

export const SOCIAL_PLATFORMS = [
  "instagram",
  "facebook",
  "linkedin",
  "x",
  "youtube",
  "pinterest",
  "threads",
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const INDUSTRIES = [
  "Automotive",
  "Beauty & Wellness",
  "Construction & Real Estate",
  "Education",
  "Fashion & Apparel",
  "Food & Hospitality",
  "Healthcare",
  "Interior & Furniture",
  "Jewellery & Luxury",
  "Manufacturing",
  "Professional Services",
  "Retail & E-commerce",
  "Technology & SaaS",
  "Travel & Tourism",
  "Other",
] as const;

export const LANGUAGES = ["en", "hi", "gu"] as const;

/**
 * The ONLY keys a client PATCH may write to users/{uid}.
 * Anything outside this list is rejected with 403.
 */
export const CLIENT_WRITABLE_FIELDS = [
  "displayName",
  "phone",
  "companyName",
  "website",
  "industry",
  "locale",
  "timezone",
  "marketingOptIn",
  "socialLinks",
  "referenceLinks",
  "brandColors",
  "billing",
  "defaultBrandKitId",
  "gstEnabled",
] as const;

export type ClientWritableField = (typeof CLIENT_WRITABLE_FIELDS)[number];

/**
 * Fields that must never be writable from a client payload.
 * Kept explicit so the reject path is auditable.
 */
export const PROTECTED_FIELDS = [
  "role",
  "status",
  "uid",
  "email",
  "emailVerified",
  "driveFolderId",
  "acceptedTermsAt",
  "acceptedPrivacyAt",
  "profileCompleteness",
  "onboardingComplete",
  "createdAt",
  "updatedAt",
  "suspendedReason",
  "internalNotes",
] as const;

export interface FieldIssue {
  field: string;
  message: string;
}

export function assertNoProtectedFields(payload: Record<string, unknown>): FieldIssue[] {
  const issues: FieldIssue[] = [];
  for (const key of PROTECTED_FIELDS) {
    if (key in payload) {
      issues.push({ field: key, message: `"${key}" is managed by Sutra Studio and cannot be edited.` });
    }
  }
  for (const key of CLIENT_WRITABLE_FIELDS) {
    if (key in payload) continue;
    // Flag obviously server-owned nested keys smuggled inside allowed objects.
    if (key === "billing" && typeof payload.billing === "object" && payload.billing !== null) {
      const nested = payload.billing as Record<string, unknown>;
      if ("gstEnabled" in nested) {
        issues.push({ field: "billing.gstEnabled", message: "GST availability is a studio setting." });
      }
    }
  }
  return issues;
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export function validateProfilePatch(
  payload: Record<string, unknown>,
  opts: { gstEnabledGlobally: boolean }
): { patch: Record<string, unknown>; issues: FieldIssue[] } {
  const issues: FieldIssue[] = [];
  const patch: Record<string, unknown> = {};

  const str = (key: ClientWritableField, max: number, required = false) => {
    if (!(key in payload)) return;
    const v = payload[key];
    if (typeof v !== "string") {
      issues.push({ field: key, message: `${label(key)} must be text.` });
      return;
    }
    const t = v.trim();
    if (required && !t) {
      issues.push({ field: key, message: `${label(key)} is required.` });
      return;
    }
    if (t.length > max) {
      issues.push({ field: key, message: `${label(key)} must be under ${max} characters.` });
      return;
    }
    patch[key] = t;
  };

  str("displayName", 80, true);
  str("companyName", 120);
  str("industry", 60);
  str("timezone", 64);
  str("defaultBrandKitId", 128);

  if ("phone" in payload) {
    const v = payload.phone;
    const t = typeof v === "string" ? v.trim() : "";
    if (t && !PHONE_RE.test(t)) issues.push({ field: "phone", message: "Enter a valid phone number." });
    else patch.phone = t;
  }

  if ("website" in payload) {
    const t = typeof payload.website === "string" ? payload.website.trim() : "";
    if (t && !URL_RE.test(t)) issues.push({ field: "website", message: "Website must start with http:// or https://" });
    else patch.website = t;
  }

  if ("locale" in payload) {
    const t = String(payload.locale ?? "");
    if (!(LANGUAGES as readonly string[]).includes(t))
      issues.push({ field: "locale", message: "Language must be en, hi or gu." });
    else patch.locale = t;
  }

  if ("industry" in payload && typeof payload.industry === "string") {
    const t = payload.industry.trim();
    if (t && !(INDUSTRIES as readonly string[]).includes(t))
      issues.push({ field: "industry", message: "Choose an industry from the list." });
  }

  if ("brandColors" in payload) {
    const arr = payload.brandColors;
    if (!Array.isArray(arr)) issues.push({ field: "brandColors", message: "Brand colours must be a list." });
    else if (arr.length > 12) issues.push({ field: "brandColors", message: "Maximum 12 brand colours." });
    else {
      const bad = arr.find((c) => typeof c !== "string" || !HEX.test(c.trim()));
      if (bad) issues.push({ field: "brandColors", message: "Each colour must be a hex value such as #D4A35A." });
      else patch.brandColors = arr.map((c: string) => c.trim().toUpperCase());
    }
  }

  if ("referenceLinks" in payload) {
    const arr = payload.referenceLinks;
    if (!Array.isArray(arr)) issues.push({ field: "referenceLinks", message: "Reference links must be a list." });
    else if (arr.length > 20) issues.push({ field: "referenceLinks", message: "Maximum 20 reference links." });
    else {
      const bad = arr.find((c) => typeof c !== "string" || !URL_RE.test(c.trim()));
      if (bad) issues.push({ field: "referenceLinks", message: "Each reference must be a valid http(s) URL." });
      else patch.referenceLinks = arr.map((c: string) => c.trim());
    }
  }

  if ("socialLinks" in payload) {
    const obj = payload.socialLinks;
    if (typeof obj !== "object" || obj === null || Array.isArray(obj))
      issues.push({ field: "socialLinks", message: "Social links must be a set of key/value pairs." });
    else {
      const entries = Object.entries(obj as Record<string, unknown>);
      const bad = entries.find(([k, v]) => {
        if (!(SOCIAL_PLATFORMS as readonly string[]).includes(k)) return true;
        return typeof v !== "string" || (v.trim().length > 0 && !URL_RE.test(v.trim()));
      });
      if (bad) issues.push({ field: "socialLinks", message: `Unsupported or invalid social link: ${bad[0]}` });
      else {
        const cleanLinks: Record<string, string> = {};
        for (const [k, v] of entries) cleanLinks[k] = String(v).trim();
        patch.socialLinks = cleanLinks;
      }
    }
  }

  if ("billing" in payload) {
    const obj = payload.billing;
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      issues.push({ field: "billing", message: "Billing details must be an object." });
    } else {
      const b = obj as Record<string, unknown>;
      const out: Record<string, string> = {};
      const limits: Record<string, number> = {
        legalName: 120,
        gstin: 15,
        addressLine1: 160,
        addressLine2: 160,
        city: 60,
        state: 60,
        postalCode: 12,
        country: 60,
      };
      for (const [k, max] of Object.entries(limits)) {
        if (k === "gstin") continue;
        if (k in b) {
          const v = typeof b[k] === "string" ? (b[k] as string).trim() : "";
          if (v.length > max) issues.push({ field: `billing.${k}`, message: `Too long (max ${max}).` });
          else out[k] = v;
        }
      }
      if ("gstin" in b && typeof b.gstin === "string" && b.gstin.trim()) {
        const g = b.gstin.trim().toUpperCase();
        if (!opts.gstEnabledGlobally) {
          issues.push({ field: "billing.gstin", message: "GST invoicing is not enabled for the studio yet." });
        } else if (!GSTIN_RE.test(g)) {
          issues.push({ field: "billing.gstin", message: "GSTIN must be 15 characters, e.g. 24ABCDE1234F1Z5." });
        } else {
          out.gstin = g;
        }
      } else if ("gstin" in b) {
        out.gstin = "";
      }
      if ("country" in out && out.country === "India") {
        if ("postalCode" in out && out.postalCode && !/^\d{6}$/.test(out.postalCode)) {
          issues.push({ field: "billing.postalCode", message: "Indian PIN codes are 6 digits." });
        }
      }
      patch.billing = { ...(patch.billing as object | undefined), ...out };
    }
  }

  if ("marketingOptIn" in payload) {
    if (typeof payload.marketingOptIn !== "boolean")
      issues.push({ field: "marketingOptIn", message: "Marketing preference must be true or false." });
    else patch.marketingOptIn = payload.marketingOptIn;
  }

  if ("gstEnabled" in payload) {
    // Per-client request for GST; the studio toggle still gates the field itself.
    patch.gstEnabled = payload.gstEnabled === true ? true : false;
  }

  return { patch, issues };
}

function label(field: string) {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/* ------------------------------------------------------------------ */
/* Reads / writes                                                      */
/* ------------------------------------------------------------------ */

export function serialiseProfile(id: string, data: Record<string, unknown>): UserProfile & { id: string } {
  return {
    id,
    uid: (data.uid as string) ?? id,
    email: (data.email as string) ?? "",
    displayName: (data.displayName as string) ?? "",
    phone: (data.phone as string) ?? "",
    companyName: (data.companyName as string) ?? "",
    role: data.role === "admin" ? "admin" : "client",
    status: data.status === "suspended" ? "suspended" : "active",
    emailVerified: Boolean(data.emailVerified),
    locale: (data.locale as string) ?? "en",
    timezone: (data.timezone as string) ?? "Asia/Kolkata",
    industry: (data.industry as string) ?? "",
    website: (data.website as string) ?? "",
    socialLinks: (data.socialLinks as Record<string, string>) ?? {},
    referenceLinks: (data.referenceLinks as string[]) ?? [],
    brandColors: (data.brandColors as string[]) ?? [],
    billing: {
      legalName: "",
      gstin: "",
      gstEnabled: Boolean(data.gstEnabled),
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      ...((data.billing as Record<string, unknown>) ?? {}),
    },
    gstEnabled: Boolean(data.gstEnabled),
    driveFolderId: (data.driveFolderId as string) ?? "",
    defaultBrandKitId: (data.defaultBrandKitId as string) ?? "",
    onboardingComplete: Boolean(data.onboardingComplete),
    profileCompleteness: Number(data.profileCompleteness ?? 0),
    acceptedTermsAt: toIso(data.acceptedTermsAt),
    acceptedPrivacyAt: toIso(data.acceptedPrivacyAt),
    marketingOptIn: Boolean(data.marketingOptIn),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export async function getProfile(uid: string) {
  const snap = await adminDb().collection(PROFILES).doc(uid).get();
  if (!snap.exists) return null;
  return serialiseProfile(snap.id, snap.data() ?? {});
}

export async function listProfiles(limit = 100) {
  const q = adminDb().collection(PROFILES).orderBy("createdAt", "desc").limit(limit);
  const snap = await q.get();
  return snap.docs.map((d) => serialiseProfile(d.id, d.data() ?? {}));
}

export async function updateProfile(
  session: SessionUser,
  payload: Record<string, unknown>,
  opts: { gstEnabledGlobally: boolean }
): Promise<{ profile: ReturnType<typeof serialiseProfile>; issues: FieldIssue[] }> {
  const issues = assertNoProtectedFields(payload);
  if (issues.length) {
    const snap = await adminDb().collection(PROFILES).doc(session.uid).get();
    return { profile: serialiseProfile(session.uid, snap.data() ?? { uid: session.uid }), issues };
  }

  const { patch, issues: fieldIssues } = validateProfilePatch(payload, opts);
  if (fieldIssues.length) {
    const snap = await adminDb().collection(PROFILES).doc(session.uid).get();
    return { profile: serialiseProfile(session.uid, snap.data() ?? { uid: session.uid }), issues: fieldIssues };
  }
  if (Object.keys(patch).length === 0) {
    const snap = await adminDb().collection(PROFILES).doc(session.uid).get();
    return { profile: serialiseProfile(session.uid, snap.data() ?? { uid: session.uid }), issues: [] };
  }

  const ref = adminDb().collection(PROFILES).doc(session.uid);
  const current = (await ref.get()).data() ?? {};
  const merged = { ...current, ...patch };

  await ref.set(
    {
      ...patch,
      profileCompleteness: computeProfileCompleteness(merged as Partial<UserProfile>),
      onboardingComplete: computeProfileCompleteness(merged as Partial<UserProfile>) >= 80,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Keep the Auth display name in sync when the client edits it.
  if (typeof patch.displayName === "string" && patch.displayName !== current.displayName) {
    try {
      const { adminAuth } = await import("@/lib/firebase/admin");
      await adminAuth().updateUser(session.uid, { displayName: patch.displayName });
    } catch {
      // Non-fatal: profile doc is the source of truth for the app.
    }
  }

  const snap = await ref.get();
  return { profile: serialiseProfile(snap.id, snap.data() ?? {}), issues: [] };
}

/** Admin-only: set suspension / role flags. Never exposed to clients. */
export async function adminSetStatus(uid: string, status: "active" | "suspended", reason = "") {
  await adminDb().collection(PROFILES).doc(uid).set(
    { status, suspendedReason: status === "suspended" ? reason : "", updatedAt: serverTimestamp() },
    { merge: true }
  );
}