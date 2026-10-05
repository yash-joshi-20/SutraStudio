/**
 * POST /api/auth/client-login
 *
 * Exchanges a Firebase ID token for an Admin-signed HTTP-only session cookie.
 * There is no password handling here — the Firebase Web SDK already verified
 * the password in the browser. An ID token that does not verify is rejected.
 */

import { NextResponse } from "next/server";
import { adminAuth, isFirebaseAdminReady, adminMissingKeys } from "@/lib/firebase/admin";
import { readEnv } from "@/lib/config/env";
import {
  createSessionCookie,
  sessionCookieOptions,
  SESSION_COOKIE,
  setUserRole,
  safeReturnTo,
} from "@/lib/auth/session";
import { badRequest, guarded, notConfigured, ok, sameOrigin } from "@/lib/api/response";
import {
  GENERIC_AUTH_FAILURE,
  GENERIC_AUTH_FAILURE_CODE,
  isAdminAllowedEmail,
  isStaffClaim,
} from "@/lib/auth/adminAccess";

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

    // Step 1.9 / rule 13: a staff or allowlisted identity must use the admin login portal
    const userRecord = await adminAuth().getUser(decoded.uid);
    const claims = userRecord.customClaims ?? {};
    if (isAdminAllowedEmail(decoded.email) || isStaffClaim(claims)) {
      return NextResponse.json(
        {
          error: "This is the admin account. Please use the Admin Login page.",
          code: "USE_ADMIN_LOGIN",
        },
        { status: 403 }
      );
    }

    if (userRecord.disabled) {
      return NextResponse.json(
        { error: "This account has been suspended. Contact the studio.", code: "ACCOUNT_DISABLED" },
        { status: 403 }
      );
    }

    // Anyone else can sign in; a missing/unknown role is normalised to client.
    if (claims.role !== "client") {
      await setUserRole(decoded.uid, "client");
    }

    const { cookie, maxAge } = await createSessionCookie(body.idToken, {
      rememberMe: body.rememberMe ?? false,
    });

    const isSecure =
      req.headers.get("x-forwarded-proto") === "https" ||
      (typeof req.url === "string" && req.url.startsWith("https:"));

    const response = ok({
      success: true,
      message: "Signed in.",
      user: {
        uid: decoded.uid,
        email: decoded.email ?? "",
        displayName: typeof decoded.name === "string" ? decoded.name : "",
        role: "client" as const,
        emailVerified: Boolean(decoded.email_verified),
        picture: decoded.picture,
      },
      emailVerified: Boolean(decoded.email_verified),
      returnTo: safeReturnTo(body.returnTo),
    });

    response.cookies.set(SESSION_COOKIE, cookie, {
      ...sessionCookieOptions(maxAge),
      secure: isSecure,
    });
    return response;
  });
}