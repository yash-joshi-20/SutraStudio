/**
 * SUTRA STUDIO — Server-Side Authentication Resolver
 *
 * THIN ADAPTER ONLY. All real work lives in `@/lib/auth/session`, which
 * verifies a Firebase Admin-signed cookie.
 *
 * The previous implementation parsed a client-writable `sutra_user` cookie and
 * returned `isAdmin: true` whenever that cookie said so. That is removed: no
 * unverified request header or client cookie can influence identity now.
 */

import "server-only";
import {
  decodeSession,
  getSessionUser,
  SESSION_COOKIE,
  type AccountRole,
  type SessionUser,
} from "@/lib/auth/session";

export interface AuthenticatedUser extends SessionUser {
  company?: string;
  phone?: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

/**
 * Resolve the caller.
 *
 * @param req Optional request; a `Authorization: Bearer <idToken>` header is
 *            accepted for server-to-server calls (n8n webhooks). It is verified
 *            against Firebase — never trusted as-is.
 */
export async function getAuthenticatedUser(req?: Request): Promise<AuthenticatedUser> {
  const session = await resolveSession(req);
  if (!session) {
    return {
      uid: "",
      email: "",
      name: "",
      role: "client",
      emailVerified: false,
      isAuthenticated: false,
      isAdmin: false,
    };
  }
  return {
    ...session,
    isAuthenticated: true,
    isAdmin: session.role === "admin",
  };
}

async function resolveSession(req?: Request): Promise<SessionUser | null> {
  const fromCookie = await getSessionUser().catch(() => null);
  if (fromCookie) return fromCookie;

  if (req) {
    const header = req.headers.get("authorization");
    if (header?.startsWith("Bearer ")) {
      const token = header.slice(7).trim();
      // Session cookies and ID tokens share the same verification contract.
      const decoded = await decodeSession(token, { checkRevoked: false }).catch(() => null);
      if (decoded) return decoded;
    }
  }
  return null;
}

export { SESSION_COOKIE };
export type { AccountRole, SessionUser };