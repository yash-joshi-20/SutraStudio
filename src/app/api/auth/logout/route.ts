/**
 * POST /api/auth/logout
 * DELETE /api/auth/logout  → sign out everywhere (revokes refresh tokens)
 */

import { NextResponse } from "next/server";
import { isFirebaseAdminReady, isNotConfigured } from "@/lib/firebase/admin";
import {
  getSessionUser,
  revokeSessions,
  SESSION_COOKIE,
  SESSION_COOKIE_ADMIN,
} from "@/lib/auth/session";
import { guarded, ok, sameOrigin } from "@/lib/api/response";

/** Legacy, forgeable cookies from the previous implementation. */
const LEGACY_COOKIES = ["sutra_user", "sutra_role", "role", "sutra_admin_last_activity"];

export async function POST(req: Request) {
  return guarded(async () => {
    if (!sameOrigin(req)) {
      return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
    }
    return clearSession();
  });
}

export async function DELETE(req: Request) {
  return guarded(async () => {
    if (!sameOrigin(req)) {
      return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
    }
    const user = await getSessionUser().catch(() => null);
    if (user && isFirebaseAdminReady()) {
      try {
        await revokeSessions(user.uid);
      } catch (err) {
        if (!isNotConfigured(err)) {
          console.error("[logout] revoke failed:", err instanceof Error ? err.message : err);
        }
      }
    }
    const response = ok({ success: true, message: "Signed out on all devices." });
    response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    response.cookies.set(SESSION_COOKIE_ADMIN, "", { path: "/", maxAge: 0 });
    return response;
  });
}

function clearSession() {
  const response = ok({ success: true, message: "Signed out." });
  for (const name of [SESSION_COOKIE, SESSION_COOKIE_ADMIN]) {
    response.cookies.set(name, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
  }
  for (const name of LEGACY_COOKIES) {
    response.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
  return response;
}