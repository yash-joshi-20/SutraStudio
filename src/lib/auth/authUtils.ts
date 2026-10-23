/**
 * SUTRA STUDIO — Authentication & Navigation Utilities
 *
 * Ensures only safe, local, non-protocol-relative redirection paths
 * are honored after authentication.
 */

export function safeReturnTo(raw: string | null, userRole?: string): string {
  const fallback = userRole === "admin" ? "/admin" : "/dashboard";
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }
  if (
    trimmed === "/login" ||
    trimmed === "/register" ||
    trimmed === "/admin/login" ||
    trimmed.startsWith("/login?") ||
    trimmed.startsWith("/register?") ||
    trimmed.startsWith("/admin/login?")
  ) {
    return fallback;
  }
  if (userRole === "admin") {
    return trimmed.startsWith("/admin") ? trimmed : "/admin";
  }
  if (trimmed.startsWith("/admin")) {
    return "/dashboard";
  }
  return trimmed;
}
