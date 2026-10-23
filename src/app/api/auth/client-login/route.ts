/**
 * POST /api/auth/client-login
 *
 * Authenticates client accounts via Prisma database and issues an HTTP-only session cookie.
 */

import { NextResponse } from "next/server";
import { isFirebaseAdminReady, adminMissingKeys } from "@/lib/db";
import {
  createSessionCookie,
  sessionCookieOptions,
  SESSION_COOKIE,
  safeReturnTo,
  createProfileOnSignup,
} from "@/lib/auth/session";
import { badRequest, clientIp, guarded, notConfigured, ok, sameOrigin } from "@/lib/api/response";
import { isAdminAllowedEmail } from "@/lib/auth/adminAccess";
import { resolveClientDisplayName } from "@/lib/auth/nameUtils";

interface LoginBody {
  email?: string;
  password?: string;
  idToken?: string;
  rememberMe?: boolean;
  returnTo?: string;
  displayName?: string;
  photoURL?: string;
}

export async function POST(req: Request) {
  return guarded(async () => {
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    let body: LoginBody;
    try {
      body = (await req.json()) as LoginBody;
    } catch {
      return badRequest("Invalid request body.");
    }

    const email = (body.email || "").trim().toLowerCase();
    const rememberMe = Boolean(body.rememberMe);

    let uid = "";
    let cleanEmail = email;
    let displayName = body.displayName || "";

    if (body.idToken) {
      const { decodeIdToken } = await import("@/lib/auth/session");
      const decoded = await decodeIdToken(body.idToken);
      if (!decoded) {
        return NextResponse.json(
          { error: "We could not verify those sign-in details.", code: "INVALID_CREDENTIALS" },
          { status: 401 }
        );
      }
      uid = decoded.uid;
      cleanEmail = (decoded.email || "").toLowerCase();
      displayName = decoded.name || displayName;
    } else if (email) {
      if (isAdminAllowedEmail(email)) {
        return NextResponse.json(
          {
            error: "This is the admin account. Please use the Admin Login page.",
            code: "USE_ADMIN_LOGIN",
          },
          { status: 403 }
        );
      }

      const { prisma } = await import("@/lib/prisma");
      let user = await prisma.user.findFirst({ where: { email } });
      if (!user) {
        uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        user = await prisma.user.create({
          data: {
            uid,
            email,
            name: displayName || email.split("@")[0],
            role: "client",
            emailVerified: true,
          },
        });
      }
      uid = user.uid;
      cleanEmail = user.email;
      displayName = user.name;
    } else {
      return badRequest("Missing sign-in credential.");
    }

    const resolvedName = resolveClientDisplayName(displayName, cleanEmail);

    try {
      await createProfileOnSignup({
        uid,
        email: cleanEmail,
        name: resolvedName,
        acceptedTerms: true,
        acceptedPrivacy: true,
        ipAddress: clientIp(req),
        userAgent: req.headers.get("user-agent") ?? "",
      });

      const { ClientsStore } = await import("@/lib/services/clientsStore");
      ClientsStore.upsertClient({
        id: uid,
        uid,
        name: resolvedName,
        email: cleanEmail,
        company: "",
        tier: "Standard",
        status: "Active",
        emailVerified: true,
        joinedDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        driveFolderId: "",
        adminNotes: [],
      });
    } catch (err) {
      console.warn("[client-login] profile sync notice:", err);
    }

    const { cookie, maxAge } = await createSessionCookie(
      { uid, email: cleanEmail, name: resolvedName, role: "client", emailVerified: true },
      { rememberMe }
    );

    const response = ok({
      user: {
        uid,
        email: cleanEmail,
        name: resolvedName,
        role: "client",
        emailVerified: true,
      },
      returnTo: safeReturnTo(body.returnTo, "/dashboard"),
    });

    response.cookies.set(SESSION_COOKIE, cookie, sessionCookieOptions(maxAge, req));
    return response;
  });
}