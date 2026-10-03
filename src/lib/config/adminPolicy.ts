/**
 * SUTRA STUDIO — Admin access policy (Step 1)
 *
 * Deliberately free of `server-only` so it can be unit-tested from a plain
 * Node script. The Firestore/Firebase-dependent gates live in
 * `@/lib/auth/adminAccess`, which re-exports everything here.
 *
 * Rule 13: only addresses in ADMIN_ALLOWED_EMAILS may ever enter the admin
 * portal. Everything is compared case-insensitively after trimming.
 */

import { readEnv } from "@/lib/config/env";

/**
 * ADMIN_ALLOWED_EMAILS is the primary source. ADMIN_EMAIL is kept as a
 * fallback so an existing deployment does not lock itself out before the new
 * variable is filled in.
 */
export function adminAllowedEmails(): string[] {
  const raw = [readEnv("ADMIN_ALLOWED_EMAILS") ?? "", readEnv("ADMIN_EMAIL") ?? ""].join(",");
  const seen = new Set<string>();
  for (const part of raw.split(",")) {
    const normalised = part.trim().toLowerCase();
    if (normalised) seen.add(normalised);
  }
  return [...seen];
}

export function isAdminAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalised = email.trim().toLowerCase();
  if (!normalised) return false;
  return adminAllowedEmails().includes(normalised);
}

export function adminNotifyEmail(): string {
  return (readEnv("ADMIN_NOTIFY_EMAIL") || readEnv("ADMIN_EMAIL") || "").trim();
}

/**
 * `superAdmin` is what scripts/bootstrap-super-admin.ts writes (Step 1.4);
 * `admin` is kept so accounts provisioned by the older set-admin-claim script
 * still work. `session.toSessionUser` maps either down to the app's "admin".
 */
export const STAFF_CLAIM_ROLES: ReadonlySet<string> = new Set(["admin", "superAdmin"]);

export function isStaffClaim(
  claims: Record<string, unknown> | undefined | null
): boolean {
  const role = claims?.role;
  return typeof role === "string" && STAFF_CLAIM_ROLES.has(role);
}

/**
 * The one and only unauthenticated failure message. Every rejection path —
 * bad password, not allowlisted, unverified, no claim, stale auth, locked out
 * — must return exactly this, so the response never reveals why.
 */
export const GENERIC_AUTH_FAILURE = "We could not verify those sign-in details.";
export const GENERIC_AUTH_FAILURE_CODE = "INVALID_CREDENTIALS";
