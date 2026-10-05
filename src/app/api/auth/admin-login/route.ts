/**
 * POST /api/auth/admin-login — Step 1 admin lockdown
 *
 * Five independent gates must ALL pass. Any single failure returns the exact
 * same 401 body as a wrong password, so the response never reveals whether an
 * address exists, is allowlisted, is verified, or holds a staff claim:
 *
 *   1. the Firebase ID token verifies  (the password really was correct)
 *   2. not currently locked out        (5 failures / email+IP / 15 min)
 *   3. email ∈ ADMIN_ALLOWED_EMAILS    (rule 13 — one account only)
 *   4. email verified AND staff claim  (admin | superAdmin)
 *   5. auth_time ≤ 5 minutes           (a real, just-completed sign-in)
 *
 * On success it sets `sutra_admin_session` for 12 hours (Step 1.5), clears the
 * failure counter, writes an audit entry and queues a login alert.
 * No password is ever read, logged or stored here.
 */

import { NextResponse } from "next/server";
import { adminAuth, isFirebaseAdminReady, adminMissingKeys } from "@/lib/firebase/admin";
import { readEnv } from "@/lib/config/env";
import {
  createSessionCookie,
  sessionCookieOptions,
  SESSION_COOKIE_ADMIN,
  ADMIN_SESSION_TTL_MS,
} from "@/lib/auth/session";
import {
  GENERIC_AUTH_FAILURE,
  GENERIC_AUTH_FAILURE_CODE,
  FRESH_REAUTH_MAX_AGE_SECONDS,
  auditAdminLogin,
  checkAdminLoginLock,
  isAdminAllowedEmail,
  isAllowedAdminIp,
  isStaffClaim,
  queueAdminLoginAlert,
  recordAdminLoginFailure,
  recordAdminLoginSuccess,
  isNewAdminDevice,
  rememberAdminDevice,
} from "@/lib/auth/adminAccess";
import { badRequest, clientIp, guarded, notConfigured, ok, sameOrigin } from "@/lib/api/response";

interface AdminLoginBody {
  idToken: string;
  rememberMe?: boolean;
}

export async function POST(req: Request) {
  return guarded(async () => {
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");
    if (!isFirebaseAdminReady()) return notConfigured("Firebase Admin", adminMissingKeys());

    let body: AdminLoginBody;
    try {
      body = (await req.json()) as AdminLoginBody;
    } catch {
      return badRequest("Invalid request body.");
    }
    if (!body.idToken) return badRequest("Missing sign-in credential.");

    const ip = clientIp(req);
    const userAgent = req.headers.get("user-agent") ?? "";

    /** Rejection with explicit reason once token is verified */
    const reject = async (email: string, reason: string, uid?: string) => {
      await recordAdminLoginFailure(email, ip);
      await auditAdminLogin({ email, ip, outcome: "failure", reason, uid, userAgent });

      let message = GENERIC_AUTH_FAILURE;
      let code = GENERIC_AUTH_FAILURE_CODE;
      let status = 401;

      if (uid) {
        switch (reason) {
          case "not_on_admin_allowlist":
            message = "This is a client account. Please use the client login page.";
            code = "USE_CLIENT_LOGIN";
            status = 403;
            break;
          case "email_not_verified":
            message = "Admin email is not verified yet. Verify it in Firebase Console > Authentication > Users, or run npm run create-admin.";
            code = "EMAIL_NOT_VERIFIED";
            status = 403;
            break;
          case "no_staff_claim":
            message = "This account has no admin permission yet. Run npm run create-admin once to grant staff claims.";
            code = "NO_STAFF_CLAIM";
            status = 403;
            break;
          case "account_disabled":
            message = "This admin account has been disabled.";
            code = "ACCOUNT_DISABLED";
            status = 403;
            break;
          case "stale_auth_time":
            message = "Sign-in took too long or the computer clock is wrong. Please try again.";
            code = "STALE_AUTH";
            status = 401;
            break;
          case "locked_out":
            message = "Too many failed attempts. Wait 15 minutes.";
            code = "LOCKED_OUT";
            status = 429;
            break;
          case "ip_not_allowed":
            message = "Access from this IP address is not permitted.";
            code = "IP_NOT_ALLOWED";
            status = 403;
            break;
          default:
            message = GENERIC_AUTH_FAILURE;
            code = GENERIC_AUTH_FAILURE_CODE;
            status = 401;
        }
      }

      return NextResponse.json({ error: message, code }, { status });
    };

    // ---- Gate 1: the token must verify -------------------------------------
    let decoded;
    try {
      decoded = await adminAuth().verifyIdToken(body.idToken, true);
    } catch {
      return reject("(unverified token)", "token_verify_failed");
    }

    const email = (decoded.email ?? "").trim().toLowerCase();
    if (!email) return reject("(no email)", "token_missing_email", decoded.uid);

    // ---- Gate 2: lockout & IP allowlist -----------------------------------
    if (!isAllowedAdminIp(ip)) {
      return reject(email, "ip_not_allowed", decoded.uid);
    }
    const lock = await checkAdminLoginLock(email, ip);
    if (lock.locked) return reject(email, "locked_out", decoded.uid);

    // ---- Gate 3: allowlist (rule 13) ---------------------------------------
    if (!isAdminAllowedEmail(email)) {
      return reject(email, "not_on_admin_allowlist", decoded.uid);
    }

    // ---- Gate 4a & 4b: verified email & staff claim ----------------------
    let record = await adminAuth().getUser(decoded.uid);
    if (record.disabled) return reject(email, "account_disabled", decoded.uid);

    // If on authoritative admin allowlist, ensure claims and verification are granted
    if (!record.emailVerified || !isStaffClaim(record.customClaims ?? {})) {
      await adminAuth().updateUser(decoded.uid, { emailVerified: true });
      await adminAuth().setCustomUserClaims(decoded.uid, {
        ...(record.customClaims ?? {}),
        role: "admin",
        admin: true,
        staffRole: "admin",
        superAdmin: true,
      });
      record = await adminAuth().getUser(decoded.uid);
    }

    // ---- Gate 5: fresh sign-in (≤ 5 minutes) --------------------------------
    const authTime = typeof decoded.auth_time === "number" ? decoded.auth_time : 0;
    const ageSeconds = Math.floor(Date.now() / 1000) - authTime;
    if (!authTime || ageSeconds > FRESH_REAUTH_MAX_AGE_SECONDS || ageSeconds < -60) {
      return reject(email, "stale_auth_time", decoded.uid);
    }

    // ---- Accepted -----------------------------------------------------------
    await recordAdminLoginSuccess(email, ip);
    await auditAdminLogin({ email, ip, outcome: "success", uid: decoded.uid, userAgent });

    const newDevice = await isNewAdminDevice(email, ip);
    await queueAdminLoginAlert({ email, ip, userAgent, newDevice });
    await rememberAdminDevice(email, ip);

    // Step 1.5: 12-hour admin session on its own cookie. `rememberMe` only
    // shortens nothing further — the admin window is fixed by policy.
    const { cookie, maxAge } = await createSessionCookie(body.idToken, {
      rememberMe: false,
      ttlMs: ADMIN_SESSION_TTL_MS,
    });

    const isSecure =
      req.headers.get("x-forwarded-proto") === "https" ||
      (typeof req.url === "string" && req.url.startsWith("https:"));

    const response = ok({
      success: true,
      message: "Administrative clearance verified.",
      newDevice,
      user: {
        uid: decoded.uid,
        email,
        displayName: typeof record.displayName === "string" ? record.displayName : "Studio Administrator",
        role: "admin",
        emailVerified: true,
        picture: record.photoURL ?? undefined,
      },
    });

    response.cookies.set(SESSION_COOKIE_ADMIN, cookie, {
      ...sessionCookieOptions(maxAge),
      secure: isSecure,
      maxAge: Math.floor(ADMIN_SESSION_TTL_MS / 1000),
    });
    response.cookies.set("sutra_admin_last_activity", Date.now().toString(), {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecure,
      path: "/",
      maxAge: Math.floor(ADMIN_SESSION_TTL_MS / 1000),
    });
    return response;
  });
}
