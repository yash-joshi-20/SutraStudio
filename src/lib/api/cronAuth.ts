/**
 * SUTRA STUDIO — Scheduled-endpoint authorisation (Server Only)
 *
 * n8n or any external cron calls our secured endpoints with a shared secret.
 * Accepted proofs, in order:
 *   1. `Authorization: Bearer <N8N_WEBHOOK_SECRET>`
 *   2. `Authorization: Bearer <CRON_SECRET>`
 *   3. a genuine admin session cookie (so the Admin "Run now" button works)
 *
 * The previous implementation accepted `x-user-role: admin` from the client and
 * honoured `CRON_SECRET=mock_secret`. Both were spoofable and are gone.
 */

import "server-only";
import { timingSafeEqual } from "node:crypto";
import { readEnv } from "@/lib/config/env";
import { requireAdmin } from "@/lib/auth/session";

function secretsMatch(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function bearer(req: Request): string {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();
  // Some n8n credentials prefer a dedicated header.
  return req.headers.get("x-webhook-secret")?.trim() ?? "";
}

export async function authorizeScheduledCall(req: Request): Promise<boolean> {
  const provided = bearer(req);
  if (provided) {
    if (secretsMatch(provided, readEnv("N8N_WEBHOOK_SECRET"))) return true;
    if (secretsMatch(provided, readEnv("CRON_SECRET"))) return true;
    return false;
  }

  // No secret presented — accept only a verified admin session.
  try {
    const admin = await requireAdmin();
    return admin.role === "admin";
  } catch {
    return false;
  }
}
