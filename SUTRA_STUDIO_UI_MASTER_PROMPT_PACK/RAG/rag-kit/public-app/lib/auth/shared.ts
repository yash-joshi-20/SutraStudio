// No Firebase imports here, so this file is safe in middleware (Edge) and client code.
export const SESSION_COOKIE = "sutra_session";

export const STAFF_ROLES = ["superAdmin", "admin", "editor", "support", "metaAdsManager"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaffRole(value: unknown): value is StaffRole {
  return typeof value === "string" && (STAFF_ROLES as readonly string[]).includes(value);
}

/** Basic CSRF defence for cookie-authenticated JSON endpoints: the Origin header must match our host. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Only allow same-site relative redirects. */
export function safeNext(next: unknown, fallback = "/dashboard"): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
    ? next
    : fallback;
}
