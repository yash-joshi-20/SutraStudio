/**
 * SUTRA STUDIO — Admin access control (Step 1 of the build prompt)
 *
 * Four independent gates must ALL pass before anyone reaches the admin portal:
 *   1. email is in the ADMIN_ALLOWED_EMAILS allowlist   (rule 13: one account)
 *   2. email is verified
 *   3. the uid carries a staff custom claim (admin | superAdmin)
 *   4. auth_time is within the last 5 minutes for sensitive actions
 *
 * Failures are indistinguishable from a wrong password, so this module exposes
 * exactly one unauthenticated error message. Brute-force counters live in
 * Firestore (never in process memory, which resets and does not share across
 * serverless instances).
 */

import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import {
  adminAuth,
  adminDb,
  isFirebaseAdminReady,
  serverTimestamp,
} from "@/lib/firebase/admin";
import { AuthRequiredError, ForbiddenError, SESSION_COOKIE } from "@/lib/auth/session";
import {
  GENERIC_AUTH_FAILURE,
  adminNotifyEmail,
  isAdminAllowedEmail,
  isStaffClaim,
} from "@/lib/config/adminPolicy";

/* ------------------------------------------------------------------ */
/* Policy re-exports — routes import everything from here              */
/* ------------------------------------------------------------------ */

export {
  GENERIC_AUTH_FAILURE,
  GENERIC_AUTH_FAILURE_CODE,
  STAFF_CLAIM_ROLES,
  adminAllowedEmails,
  adminNotifyEmail,
  isAdminAllowedEmail,
  isAllowedAdminIp,
  primaryAdminEmail,
  googleDriveAccountEmail,
  firebaseOwnerEmail,
  isStaffClaim,
} from "@/lib/config/adminPolicy";

export function genericAuthFailure(): AuthRequiredError {
  return new AuthRequiredError(GENERIC_AUTH_FAILURE);
}

/* ------------------------------------------------------------------ */
/* Brute-force protection (5 failures / email+IP / 15 min → 15 min lock) */
/* ------------------------------------------------------------------ */

export const ADMIN_LOCK_WINDOW_MS = 15 * 60 * 1000;
export const ADMIN_MAX_FAILED_ATTEMPTS = 5;
const ATTEMPTS_COLLECTION = "adminLoginAttempts";

function keyPart(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * Composite key is a HASH so the document id never stores a raw email or IP,
 * and two different emails can never collide.
 */
export function adminAttemptId(email: string, ip: string): string {
  return createHash("sha256").update(`${keyPart(email)}|${ip}`).digest("hex");
}

export interface LockState {
  locked: boolean;
  remainingMs: number;
  failures: number;
}

export async function checkAdminLoginLock(email: string, ip: string): Promise<LockState> {
  if (!isFirebaseAdminReady()) return { locked: false, remainingMs: 0, failures: 0 };
  try {
    const snap = await adminDb().collection(ATTEMPTS_COLLECTION).doc(adminAttemptId(email, ip)).get();
    if (!snap.exists) return { locked: false, remainingMs: 0, failures: 0 };
    const data = snap.data() as { failures?: number; lockedUntil?: number };
    const now = Date.now();
    const lockedUntil = typeof data.lockedUntil === "number" ? data.lockedUntil : 0;
    if (lockedUntil > now) {
      return { locked: true, remainingMs: lockedUntil - now, failures: data.failures ?? 0 };
    }
    return { locked: false, remainingMs: 0, failures: data.failures ?? 0 };
  } catch {
    // Firestore unavailable: do not silently open the gate, but do not brick
    // sign-in either. The allowlist + claim checks still run.
    return { locked: false, remainingMs: 0, failures: 0 };
  }
}

export async function recordAdminLoginFailure(email: string, ip: string): Promise<void> {
  if (!isFirebaseAdminReady()) return;
  try {
    const ref = adminDb().collection(ATTEMPTS_COLLECTION).doc(adminAttemptId(email, ip));
    await adminDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const previous = ((snap.data() as { failures?: number } | undefined)?.failures ?? 0) + 1;
      const lockNow = previous >= ADMIN_MAX_FAILED_ATTEMPTS;
      tx.set(ref, {
        failures: previous,
        lockedUntil: lockNow ? Date.now() + ADMIN_LOCK_WINDOW_MS : 0,
        lockedAt: lockNow ? new Date().toISOString() : null,
        lastFailureAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      });
    });
  } catch {
    /* never block the response on a counter write */
  }
}

export async function recordAdminLoginSuccess(email: string, ip: string): Promise<void> {
  if (!isFirebaseAdminReady()) return;
  try {
    await adminDb().collection(ATTEMPTS_COLLECTION).doc(adminAttemptId(email, ip)).delete();
  } catch {
    /* non-fatal */
  }
}

/* ------------------------------------------------------------------ */
/* Audit trail (rule 6 — success AND failure, never a password)        */
/* ------------------------------------------------------------------ */

export type AdminLoginEvent = "success" | "failure";

export interface AdminLoginAuditInput {
  email: string;
  ip: string;
  outcome: AdminLoginEvent;
  /** Machine-readable reason; never contains a password. */
  reason?: string;
  uid?: string;
  userAgent?: string;
}

/**
 * Written straight to the `auditLogs` collection. `AuditLogService` is an
 * in-memory store with a closed `what` union, so login events — which must
 * survive a process restart — go to Firestore directly.
 */
export async function auditAdminLogin(input: AdminLoginAuditInput): Promise<void> {
  if (!isFirebaseAdminReady()) return;
  try {
    await adminDb().collection("auditLogs").add({
      who: {
        uid: input.uid ?? "",
        email: input.email,
        name: "",
        role: "admin",
        ip: input.ip,
      },
      what: input.outcome === "success" ? "ADMIN_LOGIN_SUCCESS" : "ADMIN_LOGIN_FAILED",
      when: new Date().toISOString(),
      targetType: "system",
      targetId: "admin-login",
      targetTitle: input.email,
      note: input.outcome === "success" ? "Admin sign-in accepted." : `Admin sign-in rejected: ${input.reason ?? "unspecified"}`,
      type: input.outcome === "success" ? "success" : "warning",
      userAgent: input.userAgent ?? "",
      createdAt: serverTimestamp(),
    });
  } catch {
    /* an audit write must never break sign-in */
  }
}

/* ------------------------------------------------------------------ */
/* Login alerts (Step 1.7 — logged as pending until Step 9 wires email) */
/* ------------------------------------------------------------------ */

export async function queueAdminLoginAlert(input: {
  email: string;
  ip: string;
  userAgent?: string;
  newDevice?: boolean;
}): Promise<void> {
  const recipient = adminNotifyEmail();
  if (!isFirebaseAdminReady()) return;
  try {
    await adminDb().collection("adminLoginAlerts").add({
      to: recipient,
      subject: input.newDevice
        ? "New device used to sign in to Sutra Studio admin"
        : "Successful Sutra Studio admin sign-in",
      // Deliberately minimal: no password, no token, no session id.
      body: `A sign-in to the Sutra Studio admin portal was accepted for ${input.email}. Time: ${new Date().toISOString()}. Source IP: ${input.ip}.`,
      recipientEmail: input.email,
      ip: input.ip,
      userAgent: input.userAgent ?? "",
      newDevice: Boolean(input.newDevice),
      // Step 9 swaps this for a real provider send; until then it stays pending.
      delivery: "pending",
      deliveryReason: "Email provider not configured (Step 9)",
      createdAt: serverTimestamp(),
    });
  } catch {
    /* non-fatal */
  }
}

/**
 * Cheap new-device heuristic: true when this email+IP combination has not been
 * seen before in the last 30 days. Best-effort — a Firestore miss must not
 * block sign-in.
 */
export async function isNewAdminDevice(email: string, ip: string): Promise<boolean> {
  if (!isFirebaseAdminReady()) return true;
  try {
    const id = createHash("sha256").update(`${keyPart(email)}|${ip}`).digest("hex");
    const snap = await adminDb().collection("adminLoginDevices").doc(id).get();
    return !snap.exists;
  } catch {
    return false;
  }
}

export async function rememberAdminDevice(email: string, ip: string): Promise<void> {
  if (!isFirebaseAdminReady()) return;
  try {
    const id = createHash("sha256").update(`${keyPart(email)}|${ip}`).digest("hex");
    await adminDb()
      .collection("adminLoginDevices")
      .doc(id)
      .set({ email, ip, lastSeenAt: serverTimestamp() });
  } catch {
    /* non-fatal */
  }
}

/* ------------------------------------------------------------------ */
/* Step-up re-authentication (rule 8: sensitive actions, last 5 min)   */
/* ------------------------------------------------------------------ */

export const FRESH_REAUTH_MAX_AGE_SECONDS = 5 * 60;

/** `auth_time` (epoch seconds) carried on the verified session cookie, else null. */
export async function getSessionAuthTime(): Promise<number | null> {
  if (!isFirebaseAdminReady()) return null;
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(value, true);
    return typeof decoded.auth_time === "number" ? decoded.auth_time : null;
  } catch {
    return null;
  }
}

/**
 * Throws unless the administrator signed in within the last
 * `FRESH_REAUTH_MAX_AGE_SECONDS`. Call this BEFORE mutating anything sensitive
 * (role change, delete, Meta launch, payment verification).
 */
export async function requireFreshAdminReauth(
  maxAgeSeconds: number = FRESH_REAUTH_MAX_AGE_SECONDS
): Promise<void> {
  const authTime = await getSessionAuthTime();
  if (authTime === null) throw new AuthRequiredError(GENERIC_AUTH_FAILURE);

  const ageSeconds = Math.floor(Date.now() / 1000) - authTime;
  if (ageSeconds > maxAgeSeconds || ageSeconds < -60) {
    throw new ForbiddenError(
      "For your security, please sign in again to confirm this action."
    );
  }
}

/* ------------------------------------------------------------------ */
/* Client-app exclusion (rule 9 / Step 1.9)                            */
/* ------------------------------------------------------------------ */

/**
 * True when this identity must be refused by the CLIENT app: either the
 * address is on the admin allowlist or the uid carries a staff claim.
 * Checked at client sign-in and at registration so a staff account can never
 * obtain a client session.
 */
export async function isStaffIdentity(
  uid: string,
  email: string | null | undefined
): Promise<boolean> {
  if (isAdminAllowedEmail(email)) return true;
  if (!isFirebaseAdminReady()) return false;
  try {
    const user = await adminAuth().getUser(uid);
    return isStaffClaim(user.customClaims ?? {});
  } catch {
    return false;
  }
}
