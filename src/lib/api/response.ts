/**
 * SUTRA STUDIO — API Response Helpers (Server Only)
 *
 * One consistent envelope for every route, plus the single place where
 * NotConfiguredError becomes an honest HTTP 503 instead of fake data.
 */

import "server-only";
import { NextResponse } from "next/server";
import { isNotConfigured, NotConfiguredError } from "@/lib/firebase/admin";
import {
  AuthRequiredError,
  ForbiddenError,
  type SessionUser,
} from "@/lib/auth/session";

export interface ApiErrorBody {
  error: string;
  code: string;
  missingKeys?: string[];
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data as object, init);
}

export function created<T>(data: T) {
  return NextResponse.json(data as object, { status: 201 });
}

export function fail(status: number, error: string, code = "ERROR", extra?: { missingKeys?: string[] }) {
  return NextResponse.json<ApiErrorBody>({ error, code, ...extra }, { status });
}

export const badRequest = (error: string, extra?: { fields?: Record<string, string> }) =>
  NextResponse.json({ error, code: "INVALID_INPUT", ...extra }, { status: 400 });

export const unauthorized = (error = "Please sign in to continue.") =>
  NextResponse.json<ApiErrorBody>({ error, code: "AUTH_REQUIRED" }, { status: 401 });

export const forbidden = (error = "You do not have access to this resource.") =>
  NextResponse.json<ApiErrorBody>({ error, code: "FORBIDDEN" }, { status: 403 });

export const notFound = (error = "Not found.") =>
  NextResponse.json<ApiErrorBody>({ error, code: "NOT_FOUND" }, { status: 404 });

export const notConfigured = (integration: string, missingKeys: string[] = []) =>
  NextResponse.json<ApiErrorBody>(
    {
      error: `${integration} is not configured. This feature stays disabled until the missing keys are provided.`,
      code: "NOT_CONFIGURED",
      missingKeys,
    },
    { status: 503 }
  );

/**
 * Map a thrown value onto a correct status code. No internal message or stack
 * ever reaches the client. Exported so streaming routes, which cannot use
 * `guarded()` because they return a plain `Response`, share the same rules.
 */
export function mapApiError(err: unknown): NextResponse {
  if (isNotConfigured(err)) {
    const e = err as NotConfiguredError;
    return notConfigured(e.integration, e.missingKeys);
  }
  if (err instanceof AuthRequiredError) return unauthorized(err.message);
  if (err instanceof ForbiddenError) return forbidden(err.message);

  const message = err instanceof Error ? err.message : "Unexpected server error.";
  // Only surface messages we authored; never raw provider/SDK text.
  if (/must be one of|is required|Invalid|invalid|exceeds|must be a|must contain|too long/i.test(message)) {
    return badRequest(message);
  }
  console.error("[api] unhandled error:", message);
  return fail(500, "Something went wrong on our side. Please try again.", "INTERNAL");
}

/**
 * Wrap a handler so every failure mode maps to a correct status code and no
 * internal message or stack ever reaches the client.
 */
export async function guarded(handler: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await handler();
  } catch (err) {
    return mapApiError(err);
  }
}

/** Convenience: resolve the session or throw AuthRequiredError. */
export async function actorOrThrow(req?: Request): Promise<SessionUser> {
  void req;
  const { requireUser } = await import("@/lib/auth/session");
  return requireUser();
}

/** Same-origin CSRF guard for cookie-authenticated mutations. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin fetch from some browsers omits it
  try {
    const host = req.headers.get("host");
    if (!host) return false;
    const originHost = new URL(origin).host;
    if (originHost === host) return true;
    if (process.env.NODE_ENV !== "production") {
      const isLocal = (h: string) =>
        h.startsWith("localhost") ||
        h.startsWith("127.0.0.1") ||
        h.startsWith("192.168.") ||
        h.startsWith("10.") ||
        h.startsWith("172.");
      if (isLocal(originHost) && isLocal(host)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "";
}