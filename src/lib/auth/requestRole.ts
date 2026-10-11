/**
 * SUTRA STUDIO — Trusted request role (Step 1: admin lockdown)
 *
 * Replaces the `x-user-role` request header that ~28 API routes used to read.
 * That header is written by the caller's browser, so any client could send
 * `x-user-role: admin` and walk straight through an "admin only" branch.
 *
 * Role is now derived exclusively from a verified credential:
 *   - the httpOnly session cookie (admin portal sets `sutra_admin_session`,
 *     the client portal sets `__session`), or
 *   - `Authorization: Bearer <idToken>` for server-to-server callers (n8n,
 *     cron) — the token is verified against Firebase, never trusted as-is.
 *
 * A caller with no valid credential is always `"client"`. Note this only
 * decides *which view* of a shared route is served; mutations that matter must
 * additionally go through `requireAdmin()` (and `requireFreshAdminReauth()` for
 * sensitive ones) so a denial cannot be downgraded to a mere role string.
 */

import "server-only";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, type AuthenticatedUser } from "@/lib/auth/serverAuth";

export type TrustedRole = "admin" | "client";

export type AuthSessionResult =
  | { authorized: true; ok: true; user: AuthenticatedUser; response?: never }
  | { authorized: false; ok: false; user?: never; response: NextResponse };

export async function requestRole(req: Request): Promise<TrustedRole> {
  try {
    const user = await getAuthenticatedUser(req);
    return user.isAdmin ? "admin" : "client";
  } catch {
    return "client";
  }
}

/** Narrower guard for mutating handlers that must never accept a client. */
export async function requireAdminRole(req: Request): Promise<boolean> {
  return (await requestRole(req)) === "admin";
}

/**
 * The caller's uid, taken only from a verified credential.
 *
 * Replaces `req.headers.get("x-user-id")`, which any client could write to
 * read (or act as) another account — brand kits, orders, quotes, payment
 * records, notifications and data exports were all keyed off it.
 *
 * Returns `string | null` — exactly the type `Headers.get()` produced — so
 * existing `if (!uid) return 401` guards keep working unchanged. `""` never
 * occurs.
 */
export async function requestUid(req: Request): Promise<string | null> {
  try {
    const user = await getAuthenticatedUser(req);
    return user.isAuthenticated && user.uid ? user.uid : null;
  } catch {
    return null;
  }
}

/**
 * Robust API session assertion for admin endpoints.
 * Returns 401 if unauthenticated, 403 if not admin.
 * Provides verified session user with email and uid.
 */
export async function assertAdminSession(req: Request): Promise<AuthSessionResult> {
  const user = await getAuthenticatedUser(req);
  if (!user.isAuthenticated) {
    return {
      authorized: false,
      ok: false,
      response: NextResponse.json({ error: "Unauthorized: Please sign in to continue." }, { status: 401 }),
    };
  }
  if (!user.isAdmin) {
    return {
      authorized: false,
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden: Administrator clearance is required for this action." },
        { status: 403 }
      ),
    };
  }
  return { authorized: true, ok: true, user };
}

/**
 * Robust API session assertion for client endpoints.
 * Returns 401 if unauthenticated.
 */
export async function assertUserSession(req: Request): Promise<AuthSessionResult> {
  const user = await getAuthenticatedUser(req);
  if (!user.isAuthenticated || !user.uid) {
    return {
      authorized: false,
      ok: false,
      response: NextResponse.json({ error: "Unauthorized: Please sign in to continue." }, { status: 401 }),
    };
  }
  return { authorized: true, ok: true, user };
}
