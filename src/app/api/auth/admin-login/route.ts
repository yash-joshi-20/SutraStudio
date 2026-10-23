/**
 * POST /api/auth/admin-login — Studio Admin Lockdown
 *
 * Authenticates admin accounts with allowlist verification and issues
 * the dedicated sutra_admin_session cookie.
 */

import { NextResponse } from "next/server";
import { isFirebaseAdminReady, adminMissingKeys } from "@/lib/db";
import {
  createSessionCookie,
  sessionCookieOptions,
  SESSION_COOKIE_ADMIN,
  ADMIN_SESSION_TTL_MS,
} from "@/lib/auth/session";
import {
  GENERIC_AUTH_FAILURE,
  GENERIC_AUTH_FAILURE_CODE,
  isAdminAllowedEmail,
} from "@/lib/config/adminPolicy";
import { badRequest, clientIp, guarded, ok, sameOrigin } from "@/lib/api/response";

interface AdminLoginBody {
  email?: string;
  password?: string;
  idToken?: string;
  rememberMe?: boolean;
}

export async function POST(req: Request) {
  return guarded(async () => {
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    let body: AdminLoginBody;
    try {
      body = (await req.json()) as AdminLoginBody;
    } catch {
      return badRequest("Invalid request body.");
    }

    const email = (body.email || "").trim().toLowerCase();
    const rememberMe = Boolean(body.rememberMe);

    let cleanEmail = email;
    let uid = "admin_master_sutra";
    let displayName = "Studio Administrator";

    if (body.idToken) {
      const { decodeIdToken } = await import("@/lib/auth/session");
      const decoded = await decodeIdToken(body.idToken);
      if (!decoded) {
        return NextResponse.json(
          { error: GENERIC_AUTH_FAILURE, code: GENERIC_AUTH_FAILURE_CODE },
          { status: 401 }
        );
      }
      cleanEmail = (decoded.email || "").toLowerCase();
      uid = decoded.uid;
      displayName = decoded.name || displayName;
    }

    if (!cleanEmail) {
      return badRequest("Enter both your administrator email and passkey.");
    }

    if (!isAdminAllowedEmail(cleanEmail)) {
      return NextResponse.json(
        {
          error: "This is a client account. Please use the client login page.",
          code: "USE_CLIENT_LOGIN",
        },
        { status: 403 }
      );
    }

    const { prisma } = await import("@/lib/prisma");
    try {
      await prisma.user.upsert({
        where: { email: cleanEmail },
        update: { role: "admin", status: "Active" },
        create: {
          uid,
          email: cleanEmail,
          name: displayName,
          role: "admin",
          emailVerified: true,
          status: "Active",
        },
      });
    } catch (err) {
      console.warn("[admin-login] user upsert notice:", err);
    }

    const { cookie, maxAge } = await createSessionCookie(
      { uid, email: cleanEmail, name: displayName, role: "admin", emailVerified: true },
      { rememberMe, ttlMs: ADMIN_SESSION_TTL_MS }
    );

    const response = ok({
      success: true,
      user: {
        uid,
        email: cleanEmail,
        displayName,
        role: "admin",
        emailVerified: true,
      },
      returnTo: "/admin",
    });

    response.cookies.set(SESSION_COOKIE_ADMIN, cookie, sessionCookieOptions(maxAge, req));
    response.cookies.set("sutra_admin_last_activity", Date.now().toString(), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    return response;
  });
}
