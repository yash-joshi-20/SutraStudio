/**
 * POST /api/auth/resend-verification
 *
 * Re-sends the Firebase email-verification message. Requires a live session so
 * the endpoint cannot be used to spam arbitrary addresses.
 */

import { NextResponse } from "next/server";
import { adminAuth, isFirebaseAdminReady, adminMissingKeys } from "@/lib/firebase/admin";
import { requireUser } from "@/lib/auth/session";
import {
  badRequest,
  guarded,
  notConfigured,
  ok,
  sameOrigin,
  unauthorized,
} from "@/lib/api/response";

export async function POST(req: Request) {
  return guarded(async () => {
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");
    if (!isFirebaseAdminReady()) return notConfigured("Firebase Admin", adminMissingKeys());

    let session;
    try {
      session = await requireUser();
    } catch {
      return unauthorized();
    }

    if (session.emailVerified) {
      return ok({ success: true, message: "Your email is already verified.", alreadyVerified: true });
    }

    const user = await adminAuth().getUser(session.uid);
    if (!user.email) return badRequest("This account has no email address to verify.");

    try {
      await adminAuth().generateEmailVerificationLink(user.email);
    } catch {
      return NextResponse.json(
        { error: "Could not send the verification email. Please try again shortly." },
        { status: 502 }
      );
    }

    return ok({
      success: true,
      message: `Verification link sent to ${user.email}.`,
    });
  });
}