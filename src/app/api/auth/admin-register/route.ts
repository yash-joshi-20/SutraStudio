/**
 * POST /api/auth/admin-register — Executive Admin Self-Provisioning / Registration
 *
 * Strictly restricted to emails declared in ADMIN_ALLOWED_EMAILS (or ADMIN_EMAIL).
 * When an authorized administrator registers:
 *   1. Verifies the client-proven Firebase ID token.
 *   2. Enforces that email is in ADMIN_ALLOWED_EMAILS.
 *   3. Sets emailVerified = true and assigns role="admin", admin=true, superAdmin=true custom claims.
 *   4. Creates/updates the users/{uid} document in Firestore with role="admin".
 *   5. Issues both sutra_admin_session and __session cookies so both the admin portal
 *      and standard session checks immediately recognize the administrator.
 */

import { NextResponse } from "next/server";
import { adminAuth, adminDb, isFirebaseAdminReady, adminMissingKeys } from "@/lib/db";
import {
  createSessionCookie,
  sessionCookieOptions,
  SESSION_COOKIE,
  SESSION_COOKIE_ADMIN,
} from "@/lib/auth/session";
import {
  isAdminAllowedEmail,
  isAllowedAdminIp,
  auditAdminLogin,
  recordAdminLoginSuccess,
  rememberAdminDevice,
} from "@/lib/auth/adminAccess";
import { badRequest, clientIp, guarded, notConfigured, ok, sameOrigin } from "@/lib/api/response";

interface AdminRegisterBody {
  idToken: string;
  name?: string;
  email: string;
  rememberMe?: boolean;
}

export async function POST(req: Request) {
  return guarded(async () => {
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");
    if (!isFirebaseAdminReady()) return notConfigured("Firebase Admin", adminMissingKeys());

    let body: AdminRegisterBody;
    try {
      body = (await req.json()) as AdminRegisterBody;
    } catch {
      return badRequest("Invalid request body.");
    }
    if (!body.idToken) return badRequest("Missing sign-up credential.");

    const ip = clientIp(req);
    const userAgent = req.headers.get("user-agent") ?? "";

    // 1. Verify IP allowlist if configured
    if (!isAllowedAdminIp(ip)) {
      return NextResponse.json(
        { error: "Access from this IP address is not permitted for administrator registration.", code: "IP_NOT_ALLOWED" },
        { status: 403 }
      );
    }

    // 2. Verify the Firebase ID token
    let decoded;
    try {
      decoded = await adminAuth().verifyIdToken(body.idToken, true);
    } catch {
      return NextResponse.json(
        { error: "Admin registration could not be verified. Please try again.", code: "INVALID_TOKEN" },
        { status: 401 }
      );
    }

    const email = (decoded.email ?? body.email ?? "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json(
        { error: "An email address is required to register an administrator.", code: "MISSING_EMAIL" },
        { status: 400 }
      );
    }

    // 3. Strictly enforce the admin email allowlist
    if (!isAdminAllowedEmail(email)) {
      return NextResponse.json(
        {
          error: "Administrative clearance restricted: only pre-authorized studio administrator emails can register an executive account.",
          code: "NOT_ON_ADMIN_ALLOWLIST",
        },
        { status: 403 }
      );
    }

    const displayName = (body.name || decoded.name || email.split("@")[0] || "Administrator").trim();

    // 4. Provision administrator custom claims & auto-verify email
    await adminAuth().updateUser(decoded.uid, {
      displayName,
      emailVerified: true,
    });

    await adminAuth().setCustomUserClaims(decoded.uid, {
      role: "admin",
      admin: true,
      staffRole: "admin",
      superAdmin: true,
    });

    // 5. Create or merge users/{uid} document in Firestore
    try {
      await adminDb()
        .collection("users")
        .doc(decoded.uid)
        .set(
          {
            uid: decoded.uid,
            email,
            displayName,
            role: "admin",
            admin: true,
            emailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
    } catch (dbErr) {
      console.warn("[AdminRegister] Firestore user write notice:", dbErr);
    }

    // 6. Record success and audits
    await recordAdminLoginSuccess(email, ip);
    await auditAdminLogin({
      email,
      ip,
      outcome: "success",
      uid: decoded.uid,
      userAgent,
      reason: "admin_registration_provisioned",
    });
    await rememberAdminDevice(email, ip);

    // 7. Create session cookies
    const { cookie, maxAge } = await createSessionCookie(body.idToken, {
      rememberMe: body.rememberMe ?? true,
    });

    const response = ok({
      success: true,
      authenticated: true,
      user: {
        uid: decoded.uid,
        email,
        displayName,
        role: "admin",
        emailVerified: true,
      },
      message: "Administrator account provisioned and authorized.",
      returnTo: "/admin",
    });

    // Set both cookies so both admin portal and general session checks succeed
    response.cookies.set(SESSION_COOKIE_ADMIN, cookie, sessionCookieOptions(maxAge, req));
    response.cookies.set(SESSION_COOKIE, cookie, sessionCookieOptions(maxAge, req));
    response.cookies.set("sutra_admin_last_activity", Date.now().toString(), sessionCookieOptions(maxAge, req));

    return response;
  });
}
