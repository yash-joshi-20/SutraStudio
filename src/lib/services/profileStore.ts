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
import { prisma } from "@/lib/prisma";
import { adminDb, serverTimestamp } from "@/lib/db";
import { toIso } from "@/lib/db";
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
  const billingObj =
    (data.billing as Record<string, unknown>) ??
    (data.billingAddress as Record<string, unknown>) ??
    {};
  return {
    id,
    uid: (data.uid as string) ?? id,
    email: (data.email as string) ?? "",
    displayName: (data.displayName as string) ?? (data.name as string) ?? "",
    phone: (data.phone as string) ?? "",
    companyName: (data.companyName as string) ?? (data.company as string) ?? "",
    role: data.role === "admin" ? "admin" : "client",
    status:
      data.status === "suspended" || data.status === "Disabled" || data.status === "disabled"
        ? "suspended"
        : "active",
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
      ...billingObj,
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
  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ uid }, { id: uid }] },
    });
    if (user) {
      let meta: Record<string, unknown> = {};
      if (user.billingData) {
        try {
          meta = JSON.parse(user.billingData);
        } catch {
          meta = {};
        }
      }
      const rawBilling =
        (meta.billing as Record<string, unknown>) ||
        (meta.billingAddress as Record<string, unknown>) ||
        {};
      const merged = {
        ...meta,
        uid: user.uid,
        id: user.id,
        email: user.email,
        displayName: user.name || (meta.displayName as string) || "",
        name: user.name || (meta.displayName as string) || "",
        phone: user.phone || (meta.phone as string) || "",
        companyName: user.company || (meta.companyName as string) || "",
        company: user.company || (meta.companyName as string) || "",
        role: user.role === "admin" ? "admin" : "client",
        status:
          user.status === "Disabled" || user.status === "disabled" || user.status === "suspended"
            ? "suspended"
            : "active",
        emailVerified: Boolean(user.emailVerified),
        driveFolderId: user.driveFolderId || (meta.driveFolderId as string) || "",
        driveFolderLink: user.driveFolderLink || (meta.driveFolderLink as string) || "",
        billing: rawBilling,
        billingAddress: rawBilling,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      return serialiseProfile(user.uid, merged);
    }
  } catch (err) {
    console.warn(`[profileStore] direct prisma getProfile(${uid}) fallback:`, err);
  }

  const snap = await adminDb().collection(PROFILES).doc(uid).get();
  if (!snap.exists) return null;
  return serialiseProfile(snap.id, snap.data() ?? {});
}

export async function listProfiles(limit = 100) {
  try {
    const users = await prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    if (users.length > 0) {
      return users.map((u: Record<string, unknown>) => {
        let meta: Record<string, unknown> = {};
        if (u.billingData) {
          try {
            meta = JSON.parse(String(u.billingData));
          } catch {
            meta = {};
          }
        }
        return serialiseProfile(String(u.uid), {
          ...meta,
          ...u,
          displayName: u.name,
          name: u.name,
          companyName: u.company,
          company: u.company,
        });
      });
    }
  } catch (err) {
    console.warn(`[profileStore] listProfiles fallback:`, err);
  }
  const q = adminDb().collection(PROFILES).orderBy("createdAt", "desc").limit(limit);
  const snap = await q.get();
  return snap.docs.map((d: { id: string; data: () => Record<string, unknown> }) => serialiseProfile(d.id, d.data() ?? {}));
}

export async function updateProfile(
  session: SessionUser,
  payload: Record<string, unknown>,
  opts: { gstEnabledGlobally: boolean }
): Promise<{ profile: ReturnType<typeof serialiseProfile>; issues: FieldIssue[] }> {
  const issues = assertNoProtectedFields(payload);
  if (issues.length) {
    const current = await getProfile(session.uid);
    return {
      profile: current || serialiseProfile(session.uid, { uid: session.uid, email: session.email }),
      issues,
    };
  }

  const { patch, issues: fieldIssues } = validateProfilePatch(payload, opts);
  if (fieldIssues.length) {
    const current = await getProfile(session.uid);
    return {
      profile: current || serialiseProfile(session.uid, { uid: session.uid, email: session.email }),
      issues: fieldIssues,
    };
  }
  if (Object.keys(patch).length === 0) {
    const current = await getProfile(session.uid);
    return {
      profile: current || serialiseProfile(session.uid, { uid: session.uid, email: session.email }),
      issues: [],
    };
  }

  // Find or bootstrap user in PostgreSQL User table
  let user = await prisma.user.findFirst({
    where: { OR: [{ uid: session.uid }, { id: session.uid }] },
  });

  if (!user && session.email) {
    const { syncAuthenticatedClientUser } = await import("@/lib/auth/userPersistence");
    await syncAuthenticatedClientUser({
      uid: session.uid,
      email: session.email,
      name: session.name,
      emailVerified: session.emailVerified,
    });
    user = await prisma.user.findFirst({
      where: { OR: [{ uid: session.uid }, { id: session.uid }] },
    });
  }

  if (!user) {
    throw new Error(`Cannot update profile: user record for UID ${session.uid} not found.`);
  }

  let currentMeta: Record<string, unknown> = {};
  if (user.billingData) {
    try {
      currentMeta = JSON.parse(user.billingData);
    } catch {
      currentMeta = {};
    }
  }

  const existingBilling = (currentMeta.billing as Record<string, unknown>) || {};
  const patchBilling = (patch.billing as Record<string, unknown>) || {};
  const mergedBilling = {
    ...existingBilling,
    ...patchBilling,
  };

  const mergedMeta: Record<string, unknown> = {
    ...currentMeta,
    ...patch,
    billing: mergedBilling,
  };

  const displayName =
    typeof patch.displayName === "string" && patch.displayName.trim()
      ? patch.displayName.trim()
      : user.name;
  const phone =
    patch.phone !== undefined
      ? patch.phone
        ? String(patch.phone).trim()
        : null
      : user.phone;
  const company =
    patch.companyName !== undefined
      ? String(patch.companyName).trim()
      : user.company;

  const profileForCompleteness = {
    displayName,
    phone: phone || "",
    companyName: company,
    website: (mergedMeta.website as string) || "",
    industry: (mergedMeta.industry as string) || "",
    brandColors: (mergedMeta.brandColors as string[]) || [],
    referenceLinks: (mergedMeta.referenceLinks as string[]) || [],
    billing: mergedBilling,
  };

  const completeness = computeProfileCompleteness(profileForCompleteness as Partial<UserProfile>);
  mergedMeta.profileCompleteness = completeness;
  mergedMeta.onboardingComplete = completeness >= 80;

  const updateData: Record<string, unknown> = {
    name: displayName,
    phone,
    company,
    billingData: JSON.stringify(mergedMeta),
  };

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  // Keep the Auth display name in sync when the client edits it
  if (typeof patch.displayName === "string" && patch.displayName !== user.name) {
    try {
      const { adminAuth } = await import("@/lib/db");
      await adminAuth().updateUser(session.uid, { displayName: patch.displayName });
    } catch {
      // Non-fatal: profile doc is the source of truth for the app
    }
  }

  // Keep ClientsStore in-memory cache in sync
  try {
    const { ClientsStore } = await import("@/lib/services/clientsStore");
    const existing = ClientsStore.findById(updatedUser.uid);
    if (existing) {
      existing.name = updatedUser.name;
      existing.phone = updatedUser.phone || "";
      existing.company = updatedUser.company;
      existing.billingAddress = mergedBilling as Record<string, string>;
    }
  } catch {
    // Non-fatal cache sync
  }

  const refreshedProfile = await getProfile(updatedUser.uid);
  return {
    profile: refreshedProfile || serialiseProfile(updatedUser.uid, { ...mergedMeta, ...updatedUser }),
    issues: [],
  };
}

/** Admin-only: set suspension / role flags. Never exposed to clients. */
export async function adminSetStatus(uid: string, status: "active" | "suspended", reason = "") {
  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ uid }, { id: uid }] },
    });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          status: status === "active" ? "Active" : "Disabled",
        },
      });
    }
  } catch (err) {
    console.warn(`[profileStore] adminSetStatus prisma notice:`, err);
  }
  await adminDb().collection(PROFILES).doc(uid).set(
    { status, suspendedReason: status === "suspended" ? reason : "", updatedAt: serverTimestamp() },
    { merge: true }
  );
}