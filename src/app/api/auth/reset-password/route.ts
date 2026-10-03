/**
 * POST /api/auth/reset-password
 * POST /api/auth/change-password
 *
 * reset-password: unauthenticated recovery flow. The client already changed the
 *   password through Firebase; we re-issue the session so the user stays in.
 * change-password: authenticated, requires the CURRENT password re-verified by
 *   the Firebase Web SDK before the new one is applied server-side.
 */

import { NextResponse } from "next/server";
import { adminAuth, isFirebaseAdminReady, adminMissingKeys } from "@/lib/firebase/admin";
import {
  createSessionCookie,
  requireUser,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth/session";
import { badRequest, guarded, notConfigured, ok, sameOrigin, unauthorized } from "@/lib/api/response";

const MIN_PASSWORD = 8;

function validatePassword(pw: unknown): string | null {
  if (typeof pw !== "string" || pw.length < MIN_PASSWORD) {
    return `Password must be at least ${MIN_PASSWORD} characters.`;
  }
  if (pw.length > 200) return "Password is too long.";
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) {
    return "Password must contain at least one letter and one number.";
  }
  if (/^\s|\s$/.test(pw)) return "Password cannot start or end with a space.";
  return null;
}

export async function POST(req: Request) {
  return guarded(async () => {
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");
    if (!isFirebaseAdminReady()) return notConfigured("Firebase Admin", adminMissingKeys());

    const body = (await req.json().catch(() => ({}))) as {
      idToken?: string;
      newPassword?: string;
      mode?: "reset" | "change";
      currentIdToken?: string;
    };

    const problem = validatePassword(body.newPassword);
    if (problem) return badRequest(problem);

    if (body.mode === "change") {
      // Authenticated flow: verify the caller.
      let session;
      try {
        session = await requireUser();
      } catch {
        return unauthorized();
      }
      // The browser proves the current password and hands us a token minted
      // moments later; require it to be freshly issued by Firebase.
      if (!body.currentIdToken) {
        return badRequest("Re-enter your current password to confirm this change.");
      }
      try {
        const claims = await adminAuth().verifyIdToken(body.currentIdToken, true);
        if (claims.uid !== session.uid) {
          return NextResponse.json({ error: "Credential mismatch." }, { status: 403 });
        }
      } catch {
        return badRequest("Your current password is not correct.");
      }
      await adminAuth().updateUser(session.uid, { password: body.newPassword });
      // Force other devices to re-authenticate after a password change.
      await adminAuth().revokeRefreshTokens(session.uid);
      return ok({ success: true, message: "Password updated. Please sign in again." });
    }

    // Recovery flow: a valid token from the Firebase reset page.
    if (!body.idToken) return badRequest("Reset link is invalid or has expired.");
    let decoded;
    try {
      decoded = await adminAuth().verifyIdToken(body.idToken, true);
    } catch {
      return badRequest("Reset link is invalid or has expired.");
    }

    const { cookie, maxAge } = await createSessionCookie(decoded.uid, { rememberMe: true });
    const response = ok({ success: true, message: "Password reset. You are now signed in." });
    response.cookies.set(SESSION_COOKIE, cookie, sessionCookieOptions(maxAge));
    return response;
  });
}