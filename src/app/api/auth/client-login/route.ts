/**
 * POST /api/auth/client-login
 *
 * Authenticates client accounts via Prisma database and issues an HTTP-only session cookie.
 * Persists client identity idempotently to the PostgreSQL User model.
 */

import { NextResponse } from "next/server";
import {
  createSessionCookie,
  sessionCookieOptions,
  SESSION_COOKIE,
  safeReturnTo,
  createProfileOnSignup,
} from "@/lib/auth/session";
import { badRequest, clientIp, guarded, ok, sameOrigin } from "@/lib/api/response";
import { isAdminAllowedEmail } from "@/lib/auth/adminAccess";
import { resolveClientDisplayName } from "@/lib/auth/nameUtils";
import { syncAuthenticatedClientUser } from "@/lib/auth/userPersistence";
import type { ClientProfileRecord } from "@/lib/services/clientsStore";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
    let photoURL: string | null = null;
    let emailVerified = true;

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
      photoURL = (decoded.picture as string) || (typeof (decoded as Record<string, unknown>).photoURL === "string" ? ((decoded as Record<string, unknown>).photoURL as string) : null);
      emailVerified = Boolean(decoded.emailVerified ?? decoded.email_verified ?? true);
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

      if (!EMAIL_REGEX.test(email)) {
        return badRequest("Enter a valid email address.");
      }

      cleanEmail = email;
      displayName = displayName || email.split("@")[0];
      emailVerified = true;
    } else {
      return badRequest("Missing sign-in credential.");
    }

    if (!cleanEmail) {
      return badRequest("A valid email address is required.");
    }

    const resolvedName = resolveClientDisplayName(displayName, cleanEmail);

    // Persist authenticated client identity to PostgreSQL User model
    let dbUser;
    try {
      dbUser = await syncAuthenticatedClientUser({
        uid: uid || null,
        email: cleanEmail,
        name: resolvedName,
        photoURL,
        emailVerified,
        role: "client",
      });
    } catch (dbErr: unknown) {
      console.error("[client-login] database persistence failure:", dbErr);
      return NextResponse.json(
        {
          error: "Database authentication service unavailable. Please try again shortly.",
          code: "AUTH_PERSISTENCE_FAILED",
        },
        { status: 503 }
      );
    }

    const finalUid = dbUser.uid;
    const finalEmail = dbUser.email;
    const finalName = dbUser.name || resolvedName;
    const finalVerified = Boolean(dbUser.emailVerified);

    const clientTier: ClientProfileRecord["tier"] =
      dbUser.tier === "Enterprise" || dbUser.tier === "Growth" || dbUser.tier === "Starter"
        ? dbUser.tier
        : "Standard";

    const clientStatus: ClientProfileRecord["status"] =
      dbUser.status === "Disabled" || dbUser.status === "Under Review"
        ? dbUser.status
        : "Active";

    try {
      await createProfileOnSignup({
        uid: finalUid,
        email: finalEmail,
        name: finalName,
        acceptedTerms: true,
        acceptedPrivacy: true,
        ipAddress: clientIp(req),
        userAgent: req.headers.get("user-agent") ?? "",
      });

      const { ClientsStore } = await import("@/lib/services/clientsStore");
      ClientsStore.upsertClient({
        id: finalUid,
        uid: finalUid,
        name: finalName,
        email: finalEmail,
        company: dbUser.company || "",
        tier: clientTier,
        status: clientStatus,
        emailVerified: finalVerified,
        joinedDate: dbUser.createdAt ? dbUser.createdAt.toISOString() : new Date().toISOString(),
        lastActive: new Date().toISOString(),
        driveFolderId: dbUser.driveFolderId || "",
        adminNotes: [],
      });
    } catch (err) {
      console.warn("[client-login] profile sync notice:", err);
    }

    const { cookie, maxAge } = await createSessionCookie(
      { uid: finalUid, email: finalEmail, name: finalName, role: "client", emailVerified: finalVerified },
      { rememberMe }
    );

    const response = ok({
      user: {
        uid: finalUid,
        email: finalEmail,
        name: finalName,
        role: "client",
        emailVerified: finalVerified,
      },
      returnTo: safeReturnTo(body.returnTo, "/dashboard"),
    });

    response.cookies.set(SESSION_COOKIE, cookie, sessionCookieOptions(maxAge, req));
    return response;
  });
}
