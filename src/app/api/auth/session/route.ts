/**
 * GET  /api/auth/session → restore the session after reopening the app / PWA
 * POST /api/auth/session → rotate the session cookie from a fresh ID token
 *
 * Never returns data from a client-supplied cookie.
 */

import { NextResponse } from "next/server";
import { isFirebaseAdminReady, isNotConfigured, adminMissingKeys } from "@/lib/firebase/admin";
import {
  createSessionCookie,
  getSessionUser,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth/session";
import { badRequest, guarded, ok, sameOrigin } from "@/lib/api/response";
import { getProfile } from "@/lib/services/profileStore";
import { isNotConfigured as isDbNotConfigured } from "@/lib/firebase/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return guarded(async () => {
    const user = await getSessionUser();
    if (!user) {
      return ok({ authenticated: false, user: null, profile: null });
    }

    let profile = null;
    if (isFirebaseAdminReady()) {
      try {
        profile = await getProfile(user.uid);
      } catch (err) {
        if (!isDbNotConfigured(err) && !isNotConfigured(err)) throw err;
      }
    }

    return ok({
      authenticated: true,
      user,
      profile,
      needsProfileCompletion: !profile?.onboardingComplete,
      profileCompleteness: profile?.profileCompleteness ?? 0,
    });
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");
    if (!isFirebaseAdminReady()) {
      return NextResponse.json(
        { error: "Firebase Admin is not configured.", code: "NOT_CONFIGURED", missingKeys: adminMissingKeys() },
        { status: 503 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as { idToken?: string; rememberMe?: boolean };
    if (!body.idToken) return badRequest("Missing sign-in credential.");

    const { adminAuth } = await import("@/lib/firebase/admin");
    let decoded;
    try {
      decoded = await adminAuth().verifyIdToken(body.idToken, true);
    } catch {
      return NextResponse.json({ error: "Session could not be refreshed." }, { status: 401 });
    }

    const { cookie, maxAge } = await createSessionCookie(body.idToken, {
      rememberMe: body.rememberMe ?? false,
    });
    const response = ok({ success: true, authenticated: true });
    response.cookies.set(SESSION_COOKIE, cookie, sessionCookieOptions(maxAge));
    return response;
  });
}