/**
 * SUTRA STUDIO — Edge Middleware (navigation guard only)
 *
 * SCOPE LIMIT, STATED PLAINLY:
 * This runs on the Edge runtime, where `firebase-admin` cannot verify a
 * signature. It therefore performs a PRESENCE check only — it decides whether
 * to send the visitor to a sign-in screen. It is NOT an authorization layer.
 *
 * Actual authorization happens server-side, where the session cookie is
 * verified against Firebase:
 *   • every protected page calls `requireUser()` / `requireAdmin()` in a
 *     Server Component, and
 *   • every API route calls `requireUser()` / `requireAdmin()` via
 *     `@/lib/api/response`.
 *
 * The previous version read `role` and `sutra_user` cookies, which any script
 * could set (`document.cookie = 'sutra_role=admin'`), so every /admin page was
 * reachable by anyone. Those cookies are no longer read anywhere.
 */

import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "__session";
/** Step 1.5 — admin portal has its own cookie; a client session never opens it. */
const ADMIN_SESSION_COOKIE = "sutra_admin_session";
const LEGACY_COOKIES = ["sutra_user", "sutra_role", "role"];

const CLIENT_PROTECTED = [
  "/dashboard",
  "/orders",
  "/projects-client",
  "/media",
  "/invoices",
  "/profile",
  "/client-dashboard",
  "/client-form",
];

/** Cheap shape test so a junk cookie does not skip the server-side check. */
function looksLikeFirebaseSession(value: string | undefined): boolean {
  if (!value) return false;
  if (value.length < 100 || value.length > 4096) return false;
  const parts = value.split(".");
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const fullPath = pathname + search;
  const isSessionShaped = looksLikeFirebaseSession(request.cookies.get(SESSION_COOKIE)?.value);
  const isAdminSessionShaped = looksLikeFirebaseSession(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  );

  // Strip the forgeable legacy cookies on the first navigation after upgrade.
  if (LEGACY_COOKIES.some((c) => request.cookies.get(c))) {
    const cleaned = NextResponse.next();
    for (const name of LEGACY_COOKIES) {
      cleaned.cookies.set(name, "", { path: "/", maxAge: 0 });
    }
    return cleaned;
  }

  // 1. Executive Terminal — needs the ADMIN cookie, not the client one.
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!isAdminSessionShaped) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("returnTo", fullPath);
      return NextResponse.redirect(url);
    }
  }

  // 2. Client workspace
  const isClientProtected = CLIENT_PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (isClientProtected && !isSessionShaped) {
    const url = new URL("/login", request.url);
    url.searchParams.set("returnTo", fullPath);
    return NextResponse.redirect(url);
  }

  // 3. Signed-in visitors should not see the sign-in screens again.
  if (isSessionShaped && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const res = NextResponse.next();
  res.headers.set("x-sutra-session-present", isSessionShaped || isAdminSessionShaped ? "1" : "0");
  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/orders/:path*",
    "/projects-client/:path*",
    "/media/:path*",
    "/invoices/:path*",
    "/profile/:path*",
    "/client-dashboard/:path*",
    "/client-form/:path*",
    "/login",
    "/register",
  ],
};