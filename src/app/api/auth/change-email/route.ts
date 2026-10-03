/**
 * POST /api/auth/change-email
 *
 * Issues a Firebase verification email for the new address. The address only
 * becomes active after the client clicks the link, at which point Firebase
 * swaps it in. We never overwrite `email` ourselves.
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

    const body = (await req.json().catch(() => ({}))) as {
      newEmail?: string;
      currentIdToken?: string;
    };

    const newEmail = (body.newEmail ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(newEmail)) return badRequest("Enter a valid new email address.");
    if (newEmail === session.email.toLowerCase()) {
      return badRequest("That is already your email address.");
    }

    if (!body.currentIdToken) {
      return badRequest("Re-enter your password to confirm the change.");
    }
    let claims;
    try {
      claims = await adminAuth().verifyIdToken(body.currentIdToken, true);
    } catch {
      return badRequest("Your password is not correct.");
    }
    if (claims.uid !== session.uid) {
      return NextResponse.json({ error: "Credential mismatch." }, { status: 403 });
    }

    const user = await adminAuth().getUser(session.uid);
    if (user.email?.toLowerCase() === newEmail) {
      return badRequest("That address is already linked to this account.");
    }

    try {
      await adminAuth().generateEmailVerificationLink(newEmail);
      await adminAuth().updateUser(session.uid, { email: newEmail, emailVerified: false });
    } catch {
      return badRequest("That email address cannot be used. It may already be registered.");
    }

    return ok({
      success: true,
      message: `We sent a verification link to ${newEmail}. The change applies once you open it.`,
      pendingEmail: newEmail,
    });
  });
}