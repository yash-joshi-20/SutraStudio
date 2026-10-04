/**
 * GET /api/admin/provider-router
 * POST /api/admin/provider-router
 *
 * Admin-only endpoint for Step 31B:
 * - Fetches provider routing chains, configured status, daily usage counters,
 *   estimated spend, and Firebase Spark limit tracking.
 * - Updates fallback order, noTrainingOnly privacy switch, and daily/order cost caps in Firestore.
 */

import { requireAdmin } from "@/lib/auth/session";
import { badRequest, guarded, ok, sameOrigin } from "@/lib/api/response";
import { ProviderRouter, RouterConfig } from "@/lib/ai/providerRouter";

export const dynamic = "force-dynamic";

export async function GET() {
  return guarded(async () => {
    await requireAdmin();
    const summary = await ProviderRouter.getAdminUsageSummary();
    return ok(summary);
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    const admin = await requireAdmin();
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    const body = (await req.json().catch(() => ({}))) as Partial<RouterConfig>;

    const updated = await ProviderRouter.saveConfig(
      {
        taskChains: body.taskChains,
        noTrainingOnly: typeof body.noTrainingOnly === "boolean" ? body.noTrainingOnly : undefined,
        dailyCostCapUSD: typeof body.dailyCostCapUSD === "number" ? body.dailyCostCapUSD : undefined,
        orderCostCapUSD: typeof body.orderCostCapUSD === "number" ? body.orderCostCapUSD : undefined,
      },
      admin.name || "Studio Administrator"
    );

    return ok({
      message: "Provider router configuration updated successfully.",
      config: updated,
    });
  });
}
