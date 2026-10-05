/**
 * SUTRA STUDIO — Server Session & Identity
 *
 * Single authoritative implementation of "who is calling this request".
 *
 * Design rules:
 *  - Identity comes ONLY from a Firebase Admin-verified session cookie.
 *  - Role comes ONLY from the `role` custom claim issued by the server.
 *  - A client-supplied JSON cookie (the previous `sutra_user`) is NEVER trusted.
 *  - If Firebase Admin is not configured, we throw NotConfiguredError so the
 *    route answers 503 "not configured" instead of serving fake data.
 */

import "server-only";
import { cookies } from "next/headers";
import { adminAuth, adminDb, isFirebaseAdminReady, serverTimestamp } from "@/lib/firebase/admin";
import type { DecodedIdToken } from "firebase-admin/auth";
import { isAdminAllowedEmail } from "@/lib/config/adminPolicy";

export const SESSION_COOKIE = "__session";
/** Step 1.5 — the admin portal has its own cookie and a 12-hour lifetime. */
export const SESSION_COOKIE_ADMIN = "sutra_admin_session";
export const SESSION_COOKIE_LEGACY = "sutra_user";
export const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000; // Firebase Admin createSessionCookie max is 14 days (2 weeks)

export type AccountRole = "client" | "admin";

export interface SessionUser {
  uid: string;
  email: string;
  name: string;
  role: AccountRole;
  emailVerified: boolean;
  picture?: string;
}

export interface SessionCookieOptions {
  rememberMe: boolean;
  /**
   * Explicit lifetime override. The admin portal uses 12 hours (Step 1.5)
   * instead of the client's 5/30-day window.
   */
  ttlMs?: number;
}

export class AuthRequiredError extends Error {
  readonly code = "AUTH_REQUIRED";
  readonly status = 401;
  constructor(message = "Please sign in to continue.") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export class ForbiddenError extends Error {
  readonly code = "FORBIDDEN";
  readonly status = 403;
  constructor(message = "You do not have access to this resource.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/* ------------------------------------------------------------------ */
/* Session cookie lifecycle                                            */
/* ------------------------------------------------------------------ */

export async function createSessionCookie(
  idToken: string,
  options: SessionCookieOptions
): Promise<{ cookie: string; maxAge: number }> {
  const maxAge =
    typeof options.ttlMs === "number" && options.ttlMs > 0
      ? options.ttlMs
      : options.rememberMe
        ? FOURTEEN_DAYS_MS
        : FIVE_DAYS_MS;
  const cookie = await adminAuth().createSessionCookie(idToken, { expiresIn: maxAge });
  return { cookie, maxAge };
}

export function sessionCookieOptions(
  maxAge: number,
  req?: Request | { headers?: Headers | { get(k: string): string | null }; url?: string }
) {
  let secure = process.env.NODE_ENV === "production";
  if (req) {
    const isHttps =
      req.headers?.get?.("x-forwarded-proto") === "https" ||
      (typeof req.url === "string" && req.url.startsWith("https:"));
    secure = Boolean(isHttps);
  }
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: Math.floor(maxAge / 1000),
  };
}

/**
 * Verify the session cookie. Returns null when absent or invalid.
 * `checkRevoked` forces a round-trip so sign-out-everywhere is instant.
 */
export async function decodeSession(
  cookieValue: string | undefined,
  opts: { checkRevoked?: boolean } = {}
): Promise<SessionUser | null> {
  if (!cookieValue) return null;
  if (!isFirebaseAdminReady()) return null;

  try {
    const decoded: DecodedIdToken = await adminAuth().verifySessionCookie(
      cookieValue,
      opts.checkRevoked ?? true
    );
    return toSessionUser(decoded);
  } catch {
    return null;
  }
}

function toSessionUser(decoded: DecodedIdToken): SessionUser {
  const rawRole = decoded.role;
  // `superAdmin` is written by scripts/bootstrap-super-admin.ts (Step 1.4);
  // `admin` is kept so accounts provisioned by set-admin-claim.ts still work.
  // Either one maps to the app-wide "admin" role every route already checks.
  const role: AccountRole = rawRole === "admin" || rawRole === "superAdmin" ? "admin" : "client";
  return {
    uid: decoded.uid,
    email: decoded.email ?? "",
    name: typeof decoded.name === "string" ? decoded.name : (decoded.email ?? "").split("@")[0],
    role,
    emailVerified: Boolean(decoded.email_verified),
    picture: decoded.picture,
  };
}

/** Read + verify the current session. Returns null for guests. */
export async function getSessionUser(opts: { checkRevoked?: boolean } = {}): Promise<SessionUser | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE_ADMIN)?.value ?? store.get(SESSION_COOKIE)?.value;
  return decodeSession(value, opts);
}

export async function requireUser(opts: { checkRevoked?: boolean } = {}): Promise<SessionUser> {
  const user = await getSessionUser(opts);
  if (!user) throw new AuthRequiredError();
  return user;
}

/**
 * Step 1.5 / rule 13. The admin portal is gated by ITS OWN cookie, so a plain
 * client session — even one carrying an admin claim — cannot satisfy an admin
 * route. The caller must have gone through /api/auth/admin-login, which is
 * where the allowlist, verification, staff-claim and fresh-auth checks live.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const store = await cookies();
  const adminCookie = store.get(SESSION_COOKIE_ADMIN)?.value;
  if (!adminCookie) throw new AuthRequiredError("Please sign in to the studio console.");

  const user = await decodeSession(adminCookie, { checkRevoked: true });
  if (!user) throw new AuthRequiredError("Please sign in to the studio console.");
  
  if (user.role !== "admin" || !user.emailVerified || !isAdminAllowedEmail(user.email)) {
    throw new ForbiddenError("Administrator clearance is required for this action.");
  }

  // Inactivity check: 30 minutes
  const lastActivityStr = store.get("sutra_admin_last_activity")?.value;
  if (lastActivityStr) {
    const lastActivity = parseInt(lastActivityStr, 10);
    const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
    if (!isNaN(lastActivity) && Date.now() - lastActivity > INACTIVITY_TIMEOUT_MS) {
      throw new AuthRequiredError("Session expired due to inactivity. Please sign in again.");
    }
  }

  return user;
}

/* ------------------------------------------------------------------ */
/* Roles as custom claims                                              */
/* ------------------------------------------------------------------ */

export async function setUserRole(uid: string, role: AccountRole): Promise<void> {
  await adminAuth().setCustomUserClaims(uid, { role });
}

export async function getUserRole(uid: string): Promise<AccountRole | null> {
  const user = await adminAuth().getUser(uid);
  const role = user.customClaims?.role;
  return role === "admin" || role === "superAdmin" ? "admin" : role === "client" ? "client" : null;
}

export async function revokeSessions(uid: string): Promise<void> {
  await adminAuth().revokeRefreshTokens(uid);
}

/* ------------------------------------------------------------------ */
/* Sign-up profile bootstrap                                          */
/* ------------------------------------------------------------------ */

/** Role a brand-new account may ever receive. Never "admin". */
const INITIAL_ROLE: AccountRole = "client";

export interface SignupInput {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  marketingOptIn?: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  companyName: string;
  role: AccountRole;
  status: "active" | "suspended";
  emailVerified: boolean;
  locale: string;
  timezone: string;
  industry: string;
  website: string;
  socialLinks: Record<string, string>;
  referenceLinks: string[];
  brandColors: string[];
  billing: {
    legalName: string;
    gstin: string;
    gstEnabled: boolean;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  gstEnabled: boolean;
  driveFolderId: string;
  defaultBrandKitId: string;
  onboardingComplete: boolean;
  profileCompleteness: number;
  acceptedTermsAt: string;
  acceptedPrivacyAt: string;
  marketingOptIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export const PROFILE_FIELDS_TO_COMPLETE = [
  "displayName",
  "phone",
  "companyName",
  "industry",
  "website",
] as const;

/**
 * Creates users/{uid} exactly once. If the doc already exists the existing
 * document is preserved — a duplicate sign-in must never wipe a profile.
 */
export async function createProfileOnSignup(input: SignupInput): Promise<UserProfile> {
  const users = adminDb().collection("users");
  const ref = users.doc(input.uid);
  const existing = await ref.get();

  if (existing.exists) {
    return existing.data() as UserProfile;
  }

  await setUserRole(input.uid, INITIAL_ROLE);

  const profile = buildProfile(input);
  await ref.set({ ...profile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

  await adminDb()
    .collection("consents")
    .doc(`${input.uid}_${Date.now()}`)
    .set({
      uid: input.uid,
      terms: { accepted: true, at: new Date().toISOString(), version: TERMS_VERSION },
      privacy: { accepted: true, at: new Date().toISOString(), version: PRIVACY_VERSION },
      marketing: { optedIn: Boolean(input.marketingOptIn), at: new Date().toISOString() },
      ipAddress: input.ipAddress ?? "",
      userAgent: input.userAgent ?? "",
      createdAt: serverTimestamp(),
    });

  return profile;
}

export const TERMS_VERSION = "2026-01-01";
export const PRIVACY_VERSION = "2026-01-01";

function buildProfile(input: SignupInput): UserProfile {
  const iso = new Date().toISOString();
  return {
    uid: input.uid,
    email: input.email,
    displayName: input.name,
    phone: input.phone ?? "",
    companyName: input.company ?? "",
    role: INITIAL_ROLE,
    status: "active",
    emailVerified: false,
    locale: "en",
    timezone: "Asia/Kolkata",
    industry: "",
    website: "",
    socialLinks: {},
    referenceLinks: [],
    brandColors: [],
    billing: {
      legalName: input.company ?? "",
      gstin: "",
      gstEnabled: false,
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    },
    gstEnabled: false,
    driveFolderId: "",
    defaultBrandKitId: "",
    onboardingComplete: false,
    profileCompleteness: 20,
    acceptedTermsAt: iso,
    acceptedPrivacyAt: iso,
    marketingOptIn: Boolean(input.marketingOptIn),
    createdAt: iso,
    updatedAt: iso,
  };
}

export function computeProfileCompleteness(profile: Partial<UserProfile>): number {
  const checks: Array<[boolean, number]> = [
    [Boolean(profile.displayName?.trim()), 20],
    [Boolean(profile.phone?.trim()), 15],
    [Boolean(profile.companyName?.trim()), 20],
    [Boolean(profile.industry?.trim()), 15],
    [Boolean(profile.website?.trim()), 10],
    [Boolean(profile.brandColors && profile.brandColors.length > 0), 10],
    [Boolean(profile.referenceLinks && profile.referenceLinks.length > 0), 5],
    [Boolean(profile.billing?.legalName?.trim()), 5],
  ];
  return checks.reduce((sum, [ok, weight]) => sum + (ok ? weight : 0), 0);
}

export function safeReturnTo(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) return fallback;
  if (trimmed === "/login" || trimmed === "/register" || trimmed === "/admin/login") return fallback;
  if (trimmed.startsWith("/login?") || trimmed.startsWith("/register?") || trimmed.startsWith("/admin/login?")) return fallback;
  return trimmed;
}