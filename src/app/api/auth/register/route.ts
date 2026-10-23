/**
 * POST /api/auth/register
 *
 * Real account creation:
 *   1. Client signs up with the Firebase Web SDK (proves the password) and
 *      receives a real ID token.
 *   2. This route exchanges that ID token for an Admin-signed session cookie
 *      and creates users/{uid} exactly once.
 *
 * The route can never mint an identity from an email + password, so a caller
 * cannot register, sign in, or escalate to admin by guessing credentials.
 */

import { NextResponse } from "next/server";
import { adminAuth, isFirebaseAdminReady, adminMissingKeys } from "@/lib/db";
import {
  createProfileOnSignup,
  createSessionCookie,
  sessionCookieOptions,
  SESSION_COOKIE,
  SESSION_COOKIE_ADMIN,
  safeReturnTo,
} from "@/lib/auth/session";
import { badRequest, clientIp, guarded, notConfigured, ok, sameOrigin } from "@/lib/api/response";
import {
  GENERIC_AUTH_FAILURE,
  GENERIC_AUTH_FAILURE_CODE,
  isAdminAllowedEmail,
} from "@/lib/auth/adminAccess";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s\-()]{6,19}$/;

interface RegisterBody {
  idToken: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  password?: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  marketingOptIn?: boolean;
  rememberMe?: boolean;
  returnTo?: string;
}

export async function POST(req: Request) {
  return guarded(async () => {
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    if (!isFirebaseAdminReady()) {
      return notConfigured("Firebase Admin", adminMissingKeys());
    }

    let body: RegisterBody;
    try {
      body = (await req.json()) as RegisterBody;
    } catch {
      return badRequest("Invalid request body.");
    }

    const fieldErrors: Record<string, string> = {};

    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();
    const phone = (body.phone ?? "").trim();
    const companyName = (body.companyName ?? "").trim();

    if (!body.idToken) fieldErrors.email = "Sign-up could not be verified. Please try again.";
    if (name.length < 2) fieldErrors.name = "Enter your full name (at least 2 characters).";
    if (name.length > 80) fieldErrors.name = "Name must be under 80 characters.";
    if (!EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email address.";
    if (phone && !PHONE_RE.test(phone)) fieldErrors.phone = "Enter a valid phone number.";
    if (companyName.length > 120) fieldErrors.companyName = "Company name is too long.";
    if (!body.acceptedTerms) fieldErrors.acceptedTerms = "You must accept the Terms to continue.";
    if (!body.acceptedPrivacy) fieldErrors.acceptedPrivacy = "You must accept the Privacy Policy to continue.";

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { error: "Please correct the highlighted fields.", code: "INVALID_INPUT", fieldErrors },
        { status: 400 }
      );
    }

    // Verify the caller actually completed Firebase sign-up with this password.
    let decoded;
    try {
      decoded = await adminAuth().verifyIdToken(body.idToken, true);
    } catch {
      return NextResponse.json(
        { error: "Sign-up could not be verified. Please create the account again.", code: "INVALID_TOKEN" },
        { status: 401 }
      );
    }

    if (decoded.email?.toLowerCase() !== email) {
      return NextResponse.json(
        { error: "The signed-in email does not match the form.", code: "EMAIL_MISMATCH" },
        { status: 400 }
      );
    }

    // If an allowlisted administrator signs up, seamlessly auto-provision executive privileges
    if (isAdminAllowedEmail(email)) {
      await adminAuth().updateUser(decoded.uid, {
        displayName: name,
        emailVerified: true,
      });

      await adminAuth().setCustomUserClaims(decoded.uid, {
        role: "admin",
        admin: true,
        staffRole: "admin",
        superAdmin: true,
      });

      await createProfileOnSignup({
        uid: decoded.uid,
        email,
        name,
        phone,
        company: companyName,
        acceptedTerms: true,
        acceptedPrivacy: true,
        marketingOptIn: body.marketingOptIn ?? false,
        ipAddress: clientIp(req),
        userAgent: req.headers.get("user-agent") ?? "",
      });

      const { cookie, maxAge } = await createSessionCookie(body.idToken, {
        rememberMe: body.rememberMe ?? true,
      });

      const response = ok({
        success: true,
        message: "Administrator account created and authorized.",
        user: {
          uid: decoded.uid,
          email,
          displayName: name,
          role: "admin",
          emailVerified: true,
          companyName,
          phone,
        },
        emailVerificationSent: false,
        returnTo: "/admin",
      });

      response.cookies.set(SESSION_COOKIE_ADMIN, cookie, sessionCookieOptions(maxAge, req));
      response.cookies.set(SESSION_COOKIE, cookie, sessionCookieOptions(maxAge, req));
      response.cookies.set("sutra_admin_last_activity", Date.now().toString(), sessionCookieOptions(maxAge, req));
      return response;
    }

    await createProfileOnSignup({
      uid: decoded.uid,
      email,
      name,
      phone,
      company: companyName,
      acceptedTerms: true,
      acceptedPrivacy: true,
      marketingOptIn: body.marketingOptIn ?? false,
      ipAddress: clientIp(req),
      userAgent: req.headers.get("user-agent") ?? "",
    });

    try {
      const { ClientsStore } = await import("@/lib/services/clientsStore");
      ClientsStore.upsertClient({
        uid: decoded.uid,
        email,
        name,
        phone,
        company: companyName || "Studio Client",
      });
    } catch (clientSyncErr) {
      console.warn("[register] ClientsStore sync notice:", clientSyncErr);
    }

    const { cookie, maxAge } = await createSessionCookie(body.idToken, {
      rememberMe: body.rememberMe ?? true,
    });

    const response = ok({
      success: true,
      message: "Welcome to Sutra Studio. Opening your workspace…",
      user: {
        uid: decoded.uid,
        email,
        displayName: name,
        role: "client",
        emailVerified: Boolean(decoded.emailVerified ?? decoded.email_verified),
        companyName,
        phone,
      },
      emailVerificationSent: false,
      returnTo: safeReturnTo(body.returnTo),
    });

    response.cookies.set(SESSION_COOKIE, cookie, sessionCookieOptions(maxAge, req));
    return response;
  });
}