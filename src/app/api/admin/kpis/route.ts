import { NextResponse } from "next/server";
import { OrdersStore } from "@/lib/services/ordersStore";
import { QuotesStore } from "@/lib/services/quotesStore";
import { ClientsStore } from "@/lib/services/clientsStore";
import { requestRole } from "@/lib/auth/requestRole";

export async function GET(req: Request) {
  const userRole = await requestRole(req);
  if (userRole === "client") {
    return NextResponse.json({ error: "Forbidden: Admin clearance required." }, { status: 403 });
  }

  const allOrders = OrdersStore.getAll();
  const allQuotes = QuotesStore.getAll();
  const allClients = ClientsStore.getAll();
  const now = new Date();
  const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 3600 * 1000);
  const fortyEightHoursFromNow = new Date(now.getTime() + 2 * 24 * 3600 * 1000);

  // 1. Total Revenue
  const totalRevenueINR = allOrders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + (o.amountPaid || o.totalAmount || 0), 0);

  // 2. Active Orders
  const activeOrders = allOrders.filter((o) =>
    [
      "paid",
      "brief_review",
      "in_production",
      "revision_requested",
      "draft_delivered",
      "awaiting_approval",
    ].includes(o.status)
  );

  // 3. Awaiting Admin Review
  const awaitingAdminReview = allOrders.filter(
    (o) => o.status === "draft_delivered" || o.workflowStatus === "draft_ready"
  );

  // 4. Awaiting Client Approval
  const awaitingClientApproval = allOrders.filter(
    (o) => o.status === "awaiting_approval" || o.status === "delivered"
  );

  // 5. Plans Expiring in 5 Days
  const plansExpiringIn5Days = allOrders.filter((o) => {
    if (o.type !== "monthly_plan") return false;
    if (o.status !== "active" && o.subscriptionStatus !== "active") return false;
    if (!o.currentPeriodEnd) return false;
    const end = new Date(o.currentPeriodEnd);
    return end.getTime() > now.getTime() && end.getTime() <= fiveDaysFromNow.getTime();
  });

  // 6. Closed Plans
  const closedPlans = allOrders.filter(
    (o) =>
      o.type === "monthly_plan" &&
      (o.status === "closed" ||
        o.status === "expired" ||
        o.subscriptionStatus === "cancelled" ||
        o.subscriptionStatus === "expired" ||
        o.subscriptionStatus === "closed")
  );

  // 7. Trials Ending Soon (within 48h)
  const trialsEndingSoon = allOrders.filter((o) => {
    if (o.type !== "monthly_plan") return false;
    if (o.status !== "trial" && o.subscriptionStatus !== "trial") return false;
    if (!o.trialEndsAt) return false;
    const trialEnd = new Date(o.trialEndsAt);
    return trialEnd.getTime() > now.getTime() && trialEnd.getTime() <= fortyEightHoursFromNow.getTime();
  });

  // 8. Pipeline Failure Alerts
  const failedPipelines = allOrders.filter(
    (o) => o.workflowStatus === "generation_failed"
  );

  return NextResponse.json({
    timestamp: now.toISOString(),
    kpis: {
      totalRevenueINR,
      activeOrdersCount: activeOrders.length,
      awaitingAdminReviewCount: awaitingAdminReview.length,
      awaitingClientApprovalCount: awaitingClientApproval.length,
      plansExpiringIn5DaysCount: plansExpiringIn5Days.length,
      closedPlansCount: closedPlans.length,
      trialsEndingSoonCount: trialsEndingSoon.length,
      pendingQuotesCount: allQuotes.filter((q) => q.status === "pending_review").length,
      totalClientsCount: allClients.length,
      pipelineFailuresCount: failedPipelines.length,
    },
    actionableLists: {
      awaitingAdminReview: awaitingAdminReview.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber || o.code,
        service: o.service,
        clientName: o.clientName,
        workflowStatus: o.workflowStatus,
        updatedAt: o.updatedAt,
      })),
      failedPipelines: failedPipelines.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber || o.code,
        service: o.service,
        error: o.workflowLastError,
        retryCount: o.workflowRetryCount || 0,
      })),
      plansExpiringSoon: plansExpiringIn5Days.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber || o.code,
        clientName: o.clientName,
        planName: o.service,
        currentPeriodEnd: o.currentPeriodEnd,
      })),
      trialsEndingSoon: trialsEndingSoon.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber || o.code,
        clientName: o.clientName,
        planName: o.service,
        trialEndsAt: o.trialEndsAt,
      })),
    },
  });
}
