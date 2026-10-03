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

export const SESSION_COOKIE = "__session";
export const SESSION_COOKIE_LEGACY = "sutra_user";

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

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
  const maxAge = options.rememberMe ? THIRTY_DAYS_MS : FIVE_DAYS_MS;
  const cookie = await adminAuth().createSessionCookie(idToken, { expiresIn: maxAge });
  return { cookie, maxAge };
}

export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
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
  const role: AccountRole = rawRole === "admin" ? "admin" : "client";
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
  return decodeSession(store.get(SESSION_COOKIE)?.value, opts);
}

export async function requireUser(opts: { checkRevoked?: boolean } = {}): Promise<SessionUser> {
  const user = await getSessionUser(opts);
  if (!user) throw new AuthRequiredError();
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new ForbiddenError("Administrator clearance is required for this action.");
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
  return role === "admin" ? "admin" : role === "client" ? "client" : null;
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