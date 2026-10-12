/**
 * SUTRA STUDIO — Admin Service Catalog & Pricing Controls API
 *
 * Server-side proxy for catalog CRUD, price governance, and lifecycle auditing.
 *
 * Security & Governance Rules:
 * 1. Admin-Only: Gated strictly by `requireAdmin()` using server-verified session cookie.
 *    Browser-supplied roles or client-side JSON cookies are NEVER trusted.
 * 2. Strict Price Ceilings:
 *    - Standalone services starting price <= ₹20,000 (project canonical ceiling).
 *    - Monthly subscription plan price <= ₹20,000 (project canonical ceiling).
 *    - Negative, non-finite, or prices exceeding ₹20,000 are rejected (HTTP 400).
 * 3. Currency & Validation:
 *    - Currency must be "INR".
 *    - Delivery days >= 1, revisions included >= 0, free trial days >= 0.
 * 4. Confirmed Order Protection:
 *    - Services or plans referenced by confirmed orders cannot be deleted or renamed.
 *    - They can only be archived/deactivated (active: false).
 *    - Confirmed orders retain their original agreed price snapshot in perpetuity.
 * 5. Full Audit Trail:
 *    - Every price modification, visibility toggle, or archival is recorded to
 *      `AuditLogService` with actor UID, email, before/after states, and timestamp.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { badRequest, guarded, notFound, ok, sameOrigin, fail } from "@/lib/api/response";
import { ServiceCatalogService } from "@/lib/services/serviceCatalog";
import { OrdersStore } from "@/lib/services/ordersStore";
import { AuditLogService } from "@/lib/services/auditLogService";
import type { CatalogService, CatalogPlan } from "@/lib/services/catalogData";

export const dynamic = "force-dynamic";

/** Strict project catalog pricing ceilings in INR */
const MAX_CATALOG_SERVICE_PRICE = 20_000;
const MAX_CATALOG_MONTHLY_PLAN_PRICE = 20_000;
const MAX_CATALOG_QUARTERLY_PLAN_PRICE = 60_000;
const MAX_CATALOG_ANNUAL_PLAN_PRICE = 240_000;

/** Confirmed order statuses where service references are locked */
const CONFIRMED_ORDER_STATUSES = new Set([
  "paid",
  "approved",
  "in_production",
  "completed",
  "active",
  "confirmed",
  "delivered",
]);

/** Check if a service or plan is referenced by any confirmed studio order */
function isReferencedByConfirmedOrder(id: string, slug?: string): boolean {
  try {
    const orders = OrdersStore.getAll();
    const targetId = id.toLowerCase();
    const targetSlug = slug?.toLowerCase();

    return orders.some((ord) => {
      const isConfirmed =
        CONFIRMED_ORDER_STATUSES.has(ord.status) || ord.paymentStatus === "paid";
      if (!isConfirmed) return false;

      const ordRecord = ord as unknown as Record<string, any>;
      const orderSrvId = typeof ordRecord.serviceId === "string" ? ordRecord.serviceId.toLowerCase() : undefined;
      const orderPlanId = typeof ordRecord.planId === "string" ? ordRecord.planId.toLowerCase() : undefined;
      const orderTitle = typeof ord.service === "string" ? ord.service.toLowerCase() : undefined;

      if (orderSrvId === targetId || (targetSlug && orderSrvId === targetSlug)) return true;
      if (orderPlanId === targetId) return true;
      if (orderTitle === targetId || (targetSlug && orderTitle === targetSlug)) return true;

      if (Array.isArray(ord.items)) {
        return ord.items.some((item) => {
          const itemSrvId = item.serviceId?.toLowerCase();
          const itemPlanId = item.planId?.toLowerCase();
          return (
            itemSrvId === targetId ||
            (targetSlug && itemSrvId === targetSlug) ||
            itemPlanId === targetId
          );
        });
      }

      return false;
    });
  } catch {
    return false;
  }
}

function cleanPrice(value: unknown, field: string, maxPrice = MAX_CATALOG_SERVICE_PRICE): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    throw new RangeError(`${field} must be a valid positive number.`);
  }
  if (n > maxPrice) {
    throw new RangeError(
      `${field} cannot exceed the approved project ceiling of ₹${maxPrice.toLocaleString("en-IN")}.`
    );
  }
  return Math.round(n * 100) / 100;
}

export async function GET() {
  return guarded(async () => {
    await requireAdmin();
    const [services, plans] = await Promise.all([
      ServiceCatalogService.getAllServices(),
      ServiceCatalogService.getAllPlans(),
    ]);
    return ok({
      services,
      plans,
      ceiling: {
        maxServicePrice: MAX_CATALOG_SERVICE_PRICE,
        maxMonthlyPlanPrice: MAX_CATALOG_MONTHLY_PLAN_PRICE,
        currency: "INR",
      },
    });
  });
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

    // Validation: Currency
    if (Object.prototype.hasOwnProperty.call(updates, "currency")) {
      if (updates.currency !== "INR") {
        return badRequest("Catalog currency must be INR (₹).");
      }
    }

    // Validation: Active flag
    if (Object.prototype.hasOwnProperty.call(updates, "active")) {
      if (typeof updates.active !== "boolean") {
        return badRequest("active must be a boolean (true or false).");
      }
    }

    /* ---------------- SERVICE UPDATES ---------------- */
    if (body.kind === "service") {
      const existingService = await ServiceCatalogService.getServiceById(body.id);
      if (!existingService) return notFound("That service no longer exists.");

      // Check if attempt to rename ID or slug when referenced by confirmed orders
      if (
        (Object.prototype.hasOwnProperty.call(updates, "id") && updates.id !== existingService.id) ||
        (Object.prototype.hasOwnProperty.call(updates, "slug") && updates.slug !== existingService.slug)
      ) {
        if (isReferencedByConfirmedOrder(existingService.id, existingService.slug)) {
          return fail(
            409,
            `Cannot rename service "${existingService.name}" (${existingService.id}): referenced by confirmed studio orders. Create a new service or deactivate instead.`,
            "REFERENCED_BY_CONFIRMED_ORDER"
          );
        }
      }

      // Allowed service fields
      const allowedServiceFields = new Set([
        "startingPrice",
        "active",
        "estimatedDeliveryDays",
        "revisionsIncluded",
        "currency",
        "tagline",
        "shortDescription",
      ]);

      const rejected = Object.keys(updates).filter((k) => !allowedServiceFields.has(k));
      if (rejected.length) {
        return badRequest(`These service fields are not editable here: ${rejected.join(", ")}.`);
      }

      // Starting price validation
      if (Object.prototype.hasOwnProperty.call(updates, "startingPrice")) {
        try {
          updates.startingPrice = cleanPrice(
            updates.startingPrice,
            "startingPrice",
            MAX_CATALOG_SERVICE_PRICE
          );
        } catch (err: any) {
          return badRequest(err.message);
        }
      }

      // Delivery days validation
      if (Object.prototype.hasOwnProperty.call(updates, "estimatedDeliveryDays")) {
        const days = Number(updates.estimatedDeliveryDays);
        if (!Number.isInteger(days) || days < 1) {
          return badRequest("estimatedDeliveryDays must be an integer >= 1.");
        }
        updates.estimatedDeliveryDays = days;
      }

      // Revisions included validation
      if (Object.prototype.hasOwnProperty.call(updates, "revisionsIncluded")) {
        const revs = Number(updates.revisionsIncluded);
        if (!Number.isInteger(revs) || revs < 0) {
          return badRequest("revisionsIncluded must be an integer >= 0.");
        }
        updates.revisionsIncluded = revs;
      }

      const beforeSnapshot: Record<string, any> = {};
      for (const key of Object.keys(updates)) {
        beforeSnapshot[key] = (existingService as any)[key];
      }

      const updated = await ServiceCatalogService.updateService(body.id, updates as never);
      if (!updated) return notFound("That service no longer exists.");

      // Record administrative audit trail
      try {
        AuditLogService.record({
          who: {
            uid: admin.uid,
            email: admin.email,
            name: admin.name || "Administrator",
            role: admin.role,
          },
          what: "SYSTEM_CONFIG_UPDATED",
          targetType: "system",
          targetId: body.id,
          targetTitle: `Service: ${updated.name}`,
          before: beforeSnapshot,
          after: updates,
          note: `Admin ${admin.email} updated catalog service "${updated.name}" (${Object.keys(updates).join(", ")}).`,
          type: "info",
        });
      } catch {}

      return ok({ service: updated, updatedBy: admin.uid });
    }

    /* ---------------- PLAN UPDATES ---------------- */
    const existingPlan = await ServiceCatalogService.getPlanById(body.id);
    if (!existingPlan) return notFound("That plan no longer exists.");

    // Check if attempt to rename ID when referenced by confirmed orders
    if (Object.prototype.hasOwnProperty.call(updates, "id") && updates.id !== existingPlan.id) {
      if (isReferencedByConfirmedOrder(existingPlan.id)) {
        return fail(
          409,
          `Cannot rename plan "${existingPlan.name}" (${existingPlan.id}): referenced by confirmed studio orders. Deactivate instead.`,
          "REFERENCED_BY_CONFIRMED_ORDER"
        );
      }
    }

    const planPriceFields: Record<string, number> = {
      price: MAX_CATALOG_MONTHLY_PLAN_PRICE,
      monthlyPrice: MAX_CATALOG_MONTHLY_PLAN_PRICE,
      quarterlyPrice: MAX_CATALOG_QUARTERLY_PLAN_PRICE,
      annualPrice: MAX_CATALOG_ANNUAL_PLAN_PRICE,
    };

    for (const [field, maxLimit] of Object.entries(planPriceFields)) {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        try {
          updates[field] = cleanPrice(updates[field], field, maxLimit);
        } catch (err: any) {
          return badRequest(err.message);
        }
      }
    }

    if (Object.prototype.hasOwnProperty.call(updates, "freeTrialDays")) {
      const trialDays = Number(updates.freeTrialDays);
      if (!Number.isInteger(trialDays) || trialDays < 0) {
        return badRequest("freeTrialDays must be an integer >= 0.");
      }
      updates.freeTrialDays = trialDays;
    }

    const allowedPlanFields = new Set([
      ...Object.keys(planPriceFields),
      "active",
      "freeTrialDays",
      "razorpayPlanId",
    ]);

    const rejectedPlan = Object.keys(updates).filter((k) => !allowedPlanFields.has(k));
    if (rejectedPlan.length) {
      return badRequest(`These plan fields are not editable here: ${rejectedPlan.join(", ")}.`);
    }

    const beforePlanSnapshot: Record<string, any> = {};
    for (const key of Object.keys(updates)) {
      beforePlanSnapshot[key] = (existingPlan as any)[key];
    }

    const updatedPlan = await ServiceCatalogService.updatePlan(body.id, updates as never);
    if (!updatedPlan) return notFound("That plan no longer exists.");

    // Record administrative audit trail
    try {
      AuditLogService.record({
        who: {
          uid: admin.uid,
          email: admin.email,
          name: admin.name || "Administrator",
          role: admin.role,
        },
        what: "SYSTEM_CONFIG_UPDATED",
        targetType: "system",
        targetId: body.id,
        targetTitle: `Plan: ${updatedPlan.name}`,
        before: beforePlanSnapshot,
        after: updates,
        note: `Admin ${admin.email} updated catalog plan "${updatedPlan.name}" (${Object.keys(updates).join(", ")}).`,
        type: "info",
      });
    } catch {}

    return ok({ plan: updatedPlan, updatedBy: admin.uid });
  });
}

export async function DELETE(req: Request) {
  return guarded(async () => {
    const admin = await requireAdmin();
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const kind = url.searchParams.get("kind") || "service";

    if (!id) return badRequest("id parameter is required.");
    if (kind !== "service" && kind !== "plan") return badRequest("kind must be service or plan.");

    // Protection: referenced by confirmed order
    if (isReferencedByConfirmedOrder(id)) {
      return fail(
        409,
        `Cannot delete ${kind} "${id}": referenced by confirmed studio orders. Deactivate/archive (active: false) instead.`,
        "REFERENCED_BY_CONFIRMED_ORDER"
      );
    }

    if (kind === "service") {
      const before = await ServiceCatalogService.getServiceById(id);
      if (!before) return notFound("Service not found.");
      const updated = await ServiceCatalogService.updateService(id, { active: false });

      AuditLogService.record({
        who: {
          uid: admin.uid,
          email: admin.email,
          name: admin.name || "Administrator",
          role: admin.role,
        },
        what: "SYSTEM_CONFIG_UPDATED",
        targetType: "system",
        targetId: id,
        targetTitle: `Service Archived: ${before.name}`,
        before: { active: before.active },
        after: { active: false },
        note: `Admin ${admin.email} archived/deactivated unreferenced service "${before.name}".`,
        type: "warning",
      });

      return ok({
        success: true,
        message: `Service "${before.name}" archived successfully.`,
        service: updated,
      });
    } else {
      const before = await ServiceCatalogService.getPlanById(id);
      if (!before) return notFound("Plan not found.");
      const updated = await ServiceCatalogService.updatePlan(id, { active: false });

      AuditLogService.record({
        who: {
          uid: admin.uid,
          email: admin.email,
          name: admin.name || "Administrator",
          role: admin.role,
        },
        what: "SYSTEM_CONFIG_UPDATED",
        targetType: "system",
        targetId: id,
        targetTitle: `Plan Archived: ${before.name}`,
        before: { active: before.active },
        after: { active: false },
        note: `Admin ${admin.email} archived/deactivated unreferenced plan "${before.name}".`,
        type: "warning",
      });

      return ok({
        success: true,
        message: `Plan "${before.name}" archived successfully.`,
        plan: updated,
      });
    }
  });
}
