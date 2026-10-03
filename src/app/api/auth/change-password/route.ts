/**
 * POST /api/auth/change-password
 *
 * Thin alias over reset-password (mode: "change") so the settings page has a
 * stable, intention-revealing endpoint.
 */

import { POST as resetHandler } from "@/app/api/auth/reset-password/route";

export async function POST(req: Request) {
  const body = await req
    .clone()
    .json()
    .catch(() => ({}) as Record<string, unknown>);

  const enriched = new Request(req.url, {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify({ ...body, mode: "change" }),
  });

  return resetHandler(enriched);
}