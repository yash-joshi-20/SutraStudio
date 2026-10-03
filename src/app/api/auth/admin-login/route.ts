/**
 * POST /api/auth/admin-login
 *
 * The Executive Terminal gate. Two independent checks must BOTH pass:
 *   1. A Firebase ID token that verifies (so the password was real).
 *   2. That uid carries the `role: "admin"` custom claim.
 *
 * A valid client account is rejected with 403 — knowing the password is not
 * enough. There is no email-pattern shortcut; the previous implementation
 * granted admin to any address containing the substring "admin".
 */

import { NextResponse } from "next/server";
import { adminAuth, isFirebaseAdminReady, adminMissingKeys } from "@/lib/firebase/admin";
import {
  createSessionCookie,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth/session";
import { badRequest, guarded, notConfigured, ok, sameOrigin } from "@/lib/api/response";

interface AdminLoginBody {
  idToken: string;
  rememberMe?: boolean;
  returnTo?: string;
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

    let decoded;
    try {
      decoded = await adminAuth().verifyIdToken(body.idToken, true);
    } catch {
      return NextResponse.json(
        { error: "We could not verify those sign-in details.", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    const claims = (await adminAuth().getUser(decoded.uid)).customClaims ?? {};
    if (claims.role !== "admin") {
      return NextResponse.json(
        { error: "Administrator clearance required for the Executive Terminal.", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const freshToken = await adminAuth().createCustomToken(decoded.uid, { role: "admin" });
    const refreshed = await adminAuth().verifyIdToken(freshToken);

    // Short admin session: 8 hours unless "keep me signed in" is chosen.
    const { cookie, maxAge } = await createSessionCookie(refreshed.uid, {
      rememberMe: body.rememberMe === true,
    });

    const response = ok({
      success: true,
      message: "Administrative clearance verified.",
      user: {
        uid: decoded.uid,
        email: decoded.email ?? "",
        displayName: typeof decoded.name === "string" ? decoded.name : "Studio Administrator",
        role: "admin",
        emailVerified: Boolean(decoded.email_verified),
        picture: decoded.picture,
      },
    });

    response.cookies.set(SESSION_COOKIE, cookie, {
      ...sessionCookieOptions(maxAge),
      maxAge: body.rememberMe === true ? Math.floor(maxAge / 1000) : 60 * 60 * 8,
    });
    response.cookies.set("sutra_admin_last_activity", Date.now().toString(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return response;
  });
}