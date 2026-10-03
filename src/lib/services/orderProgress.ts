/**
 * SUTRA STUDIO - Order Progress Computation (Client Safe)
 *
 * Pure function that maps an order's status onto a percentage, a stage label
 * and a status category for the client portal timeline and the admin list.
 *
 * No imports on purpose: this module is rendered in client components, so it
 * must stay free of irebase-admin, route handlers and in-memory stores.
 */
export interface OrderProgressInfo {
  percentage: number;
  stageName: string;
  stageLabel: string;
  isComplete: boolean;
  statusCategory: "active" | "review" | "completed" | "paused" | "cancelled" | "payment";
  daysRemaining?: number;
  periodSummary?: string;
}

export function computeOrderProgress(order: any): OrderProgressInfo {
  if (order.type === "monthly_plan") {
    const isClosed =
      (order.status as string) === "closed" ||
      (order.status as string) === "expired" ||
      order.subscriptionStatus === "cancelled" ||
      order.subscriptionStatus === "expired" ||
      order.subscriptionStatus === "closed";

    if (isClosed) {
      return {
        percentage: 100,
        stageName: "Period Closed",
        stageLabel: "Monthly Cycle Concluded",
        isComplete: true,
        statusCategory: "completed",
        periodSummary: "Billing cycle concluded",
      };
    }

    if (order.subscriptionStatus === "trial") {
      const trialEnd = order.trialEndsAt ? new Date(order.trialEndsAt) : null;
      const now = new Date();
      let daysLeft = 3;
      if (trialEnd) {
        daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      }
      return {
        percentage: Math.min(100, Math.max(20, Math.round(((3 - daysLeft) / 3) * 100))),
        stageName: "3-Day Free Trial",
        stageLabel: `${daysLeft} day(s) left in trial authorization`,
        isComplete: false,
        statusCategory: "active",
        daysRemaining: daysLeft,
        periodSummary: `Trial ends ${trialEnd ? trialEnd.toLocaleDateString("en-IN") : "in 3 days"}`,
      };
    }

    // Active Monthly Retainer Cycle
    const start = order.currentPeriodStart
      ? new Date(order.currentPeriodStart)
      : order.paidAt
      ? new Date(order.paidAt)
      : new Date(order.createdAt);
    const end = order.currentPeriodEnd
      ? new Date(order.currentPeriodEnd)
      : order.nextBillingDate
      ? new Date(order.nextBillingDate)
      : new Date(start.getTime() + 30 * 24 * 3600 * 1000);
    const now = new Date();
    const totalDuration = Math.max(1, end.getTime() - start.getTime());
    const elapsed = Math.max(0, now.getTime() - start.getTime());
    const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const timeProgress = Math.min(100, Math.max(15, Math.round((elapsed / totalDuration) * 100)));

    return {
      percentage: timeProgress,
      stageName: "Active Studio Retainer",
      stageLabel: `${daysLeft} days remaining in current period`,
      isComplete: false,
      statusCategory: "active",
      daysRemaining: daysLeft,
      periodSummary: `Cycle: ${start.toLocaleDateString("en-IN")} – ${end.toLocaleDateString("en-IN")}`,
    };
  }

  // Individual Service Lifecycle Progress
  switch (order.status) {
    case "pending_payment":
    case "pending":
      return {
        percentage: 10,
        stageName: "Order Placed",
        stageLabel: "Order Placed — Awaiting Payment Settlement",
        isComplete: false,
        statusCategory: "payment",
      };

    case "paid":
    case "confirmed":
      return {
        percentage: 20,
        stageName: "Payment Verified",
        stageLabel: "Payment Settled — In Studio Queue",
        isComplete: false,
        statusCategory: "active",
      };

    case "brief_review":
      return {
        percentage: 30,
        stageName: "Brief Reviewed",
        stageLabel: "Brief Reviewed & Creative Kickoff",
        isComplete: false,
        statusCategory: "active",
      };

    case "in_production":
      return {
        percentage: 60,
        stageName: "In Production",
        stageLabel: "In Studio Production Pipeline",
        isComplete: false,
        statusCategory: "active",
      };

    case "draft_delivered":
    case "awaiting_approval":
    case "delivered":
      return {
        percentage: 80,
        stageName: "Draft Delivered",
        stageLabel: "Draft Vaulted — Waiting for Client Review",
        isComplete: false,
        statusCategory: "review",
      };

    case "revision_requested":
      return {
        percentage: 90,
        stageName: `Revision Pass 0${order.revisionRound || 1}`,
        stageLabel: `Revision in Progress (Round ${order.revisionRound || 1} of ${order.maxRevisions || 2})`,
        isComplete: false,
        statusCategory: "active",
      };

    case "approved":
      return {
        percentage: 100,
        stageName: "Approved",
        stageLabel: "Deliverables Approved by Client",
        isComplete: true,
        statusCategory: "completed",
      };

    case "completed":
      return {
        percentage: 100,
        stageName: "Completed",
        stageLabel: "Project Completed & Vaulted (100%)",
        isComplete: true,
        statusCategory: "completed",
      };

    case "on_hold":
      return {
        percentage: 45,
        stageName: "On Hold",
        stageLabel: "Production Temporarily Paused",
        isComplete: false,
        statusCategory: "paused",
      };

    case "cancelled":
      return {
        percentage: 0,
        stageName: "Cancelled",
        stageLabel: "Order Cancelled",
        isComplete: true,
        statusCategory: "cancelled",
      };

    case "refunded":
      return {
        percentage: 0,
        stageName: "Refunded",
        stageLabel: "Payment Refunded",
        isComplete: true,
        statusCategory: "cancelled",
      };

    default:
      return {
        percentage: 50,
        stageName: "In Progress",
        stageLabel: "In Progress",
        isComplete: false,
        statusCategory: "active",
      };
  }
}