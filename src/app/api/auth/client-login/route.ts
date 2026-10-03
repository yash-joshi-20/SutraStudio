/**
 * POST /api/auth/client-login
 *
 * Exchanges a Firebase ID token for an Admin-signed HTTP-only session cookie.
 * There is no password handling here — the Firebase Web SDK already verified
 * the password in the browser. An ID token that does not verify is rejected.
 */

import { NextResponse } from "next/server";
import { adminAuth, isFirebaseAdminReady, adminMissingKeys } from "@/lib/firebase/admin";
import {
  createSessionCookie,
  sessionCookieOptions,
  SESSION_COOKIE,
  setUserRole,
} from "@/lib/auth/session";
import { badRequest, guarded, notConfigured, ok, sameOrigin } from "@/lib/api/response";
import { safeReturnTo } from "@/app/api/auth/register/route";

interface LoginBody {
  idToken: string;
  rememberMe?: boolean;
  returnTo?: string;
}

export async function POST(req: Request) {
  return guarded(async () => {
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");
    if (!isFirebaseAdminReady()) return notConfigured("Firebase Admin", adminMissingKeys());

    let body: LoginBody;
    try {
      body = (await req.json()) as LoginBody;
    } catch {
      return badRequest("Invalid request body.");
    }

    if (!body.idToken) return badRequest("Missing sign-in credential.");

    let decoded;
    try {
      decoded = await adminAuth().verifyIdToken(body.idToken, true);
    } catch {
      // Uniform message: never reveal whether the account exists.
      return NextResponse.json(
        { error: "We could not verify those sign-in details.", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    // Anyone can sign in, but only an account carrying the admin custom claim
    // is ever treated as an administrator.
    const claims = (await adminAuth().getUser(decoded.uid)).customClaims ?? {};
    if (claims.role !== "client" && claims.role !== "admin") {
      await setUserRole(decoded.uid, "client");
    }
    if (decoded.disabled) {
      return NextResponse.json(
        { error: "This account has been suspended. Contact the studio.", code: "ACCOUNT_DISABLED" },
        { status: 403 }
      );
    }

    const freshToken = await adminAuth().createCustomToken(decoded.uid, { role: claims.role ?? "client" });
    const refreshed = await adminAuth().verifyIdToken(freshToken);

    const { cookie, maxAge } = await createSessionCookie(refreshed.uid, {
      rememberMe: body.rememberMe ?? false,
    });

    const response = ok({
      success: true,
      message: "Signed in.",
      user: {
        uid: decoded.uid,
        email: decoded.email ?? "",
        displayName: typeof decoded.name === "string" ? decoded.name : "",
        role: (claims.role as "client" | "admin") ?? "client",
        emailVerified: Boolean(decoded.email_verified),
        picture: decoded.picture,
      },
      emailVerified: Boolean(decoded.email_verified),
      returnTo: safeReturnTo(body.returnTo),
    });

    response.cookies.set(SESSION_COOKIE, cookie, sessionCookieOptions(maxAge));
    return response;
  });
}