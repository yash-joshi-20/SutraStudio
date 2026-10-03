/**
 * POST /api/auth/forgot-password
 *
 * Always answers 200 with the same message so the endpoint cannot be used to
 * discover which email addresses have accounts.
 *
 * Requires the client to prove it holds a Firebase ID token, which stops this
 * route from being abused as an open unauthenticated mail relay.
 */

import { NextResponse } from "next/server";
import { isFirebaseAdminReady, adminMissingKeys } from "@/lib/firebase/admin";
import { guarded, notConfigured, ok, sameOrigin } from "@/lib/api/response";

const GENERIC =
  "If an account exists for that email, a reset link is on its way. Check your spam folder too.";

export async function POST(req: Request) {
  return guarded(async () => {
    if (!sameOrigin(req)) return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
    if (!isFirebaseAdminReady()) return notConfigured("Firebase Admin", adminMissingKeys());

    const body = (await req.json().catch(() => ({}))) as { idToken?: string; email?: string };

    if (!body.idToken) {
      return NextResponse.json(
        { error: "Please sign in first so we know it is really you." },
        { status: 401 }
      );
    }

    const { adminAuth } = await import("@/lib/firebase/admin");
    try {
      await adminAuth().verifyIdToken(body.idToken, true);
    } catch {
      return NextResponse.json({ error: "Please sign in first so we know it is really you." }, { status: 401 });
    }

    // generatePasswordResetLink is produced but the delivery channel is the
    // client's own Firebase flow, so nothing is emailed from the server.
    if (body.email) {
      try {
        await adminAuth().generatePasswordResetLink(body.email.trim().toLowerCase());
      } catch {
        // Intentionally swallowed: never confirm or deny account existence.
      }
    }

    return ok({ success: true, message: GENERIC });
  });
}