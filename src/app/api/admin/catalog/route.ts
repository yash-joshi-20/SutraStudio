/**
 * Admin → Service Catalog
 *
 * Server-side proxy for catalog CRUD.
 *
 * Why this exists: the admin portal used to call `ServiceCatalogService`
 * directly from a client component, which pulled `firebase-admin` into the
 * browser bundle and could never have worked at runtime. All catalog access is
 * admin-gated and server-authoritative.
 *
 * Prices are validated here. A negative, non-finite or absurd price is rejected
 * rather than stored.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { badRequest, guarded, notFound, ok, sameOrigin } from "@/lib/api/response";
import { ServiceCatalogService } from "@/lib/services/serviceCatalog";

export const dynamic = "force-dynamic";

/** Razorpay caps a single payment well below this; anything higher is a typo. */
const MAX_PRICE_RUPEES = 10_000_000;

export async function GET() {
  return guarded(async () => {
    await requireAdmin();
    const [services, plans] = await Promise.all([
      ServiceCatalogService.getAllServices(),
      ServiceCatalogService.getAllPlans(),
    ]);
    return ok({ services, plans });
  });
}

function cleanPrice(value: unknown, field: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > MAX_PRICE_RUPEES) {
    throw new RangeError(`${field} must be a number between 0 and ${MAX_PRICE_RUPEES}.`);
  }
  return Math.round(n * 100) / 100;
}

export async function PATCH(req: Request) {
  return guarded(async () => {
    const admin = await requireAdmin();
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    const body = (await req.json().catch(() => ({}))) as {
      kind?: "service" | "plan";
      id?: string;
      updates?: Record<string, unknown>;
    };

    if (body.kind !== "service" && body.kind !== "plan") {
      return badRequest("kind must be service or plan.");
    }
    if (!body.id) return badRequest("id is required.");
    const updates = body.updates ?? {};
    if (Object.keys(updates).length === 0) return badRequest("No changes supplied.");

    /* ---------------- service ---------------- */
    if (body.kind === "service") {
      if (!Object.prototype.hasOwnProperty.call(updates, "startingPrice") &&
          !Object.prototype.hasOwnProperty.call(updates, "active") &&
          Object.keys(updates).length > 2) {
        // Only pricing and visibility may be edited from this screen.
        const allowed = new Set(["startingPrice", "active"]);
        const rejected = Object.keys(updates).filter((k) => !allowed.has(k));
        if (rejected.length) {
          return badRequest(`These service fields are not editable here: ${rejected.join(", ")}.`);
        }
      }

      if (Object.prototype.hasOwnProperty.call(updates, "startingPrice")) {
        updates.startingPrice = cleanPrice(updates.startingPrice, "startingPrice");
      }

      const updated = await ServiceCatalogService.updateService(body.id, updates as never);
      if (!updated) return notFound("That service no longer exists.");
      return ok({ service: updated, updatedBy: admin.uid });
    }

    /* ---------------- plan ---------------- */
    const planPriceFields = ["price", "monthlyPrice", "quarterlyPrice", "annualPrice"];
    for (const field of planPriceFields) {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        updates[field] = cleanPrice(updates[field], field);
      }
    }
    const allowedPlanFields = new Set([...planPriceFields, "active"]);
    const rejected = Object.keys(updates).filter((k) => !allowedPlanFields.has(k));
    if (rejected.length) {
      return badRequest(`These plan fields are not editable here: ${rejected.join(", ")}.`);
    }

    const updatedPlan = await ServiceCatalogService.updatePlan(body.id, updates as never);
    if (!updatedPlan) return notFound("That plan no longer exists.");
    return ok({ plan: updatedPlan, updatedBy: admin.uid });
  });
}
