import { NextResponse } from "next/server";
import { OrdersStore } from "@/lib/services/ordersStore";
import { N8nAutomationService } from "@/lib/services/n8nService";

export async function GET(req: Request) {
  try {
    const isAuthorized = N8nAutomationService.verifySecretHeader(req);
    if (!isAuthorized && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing x-sutra-secret header." },
        { status: 401 }
      );
    }

    const allOrders = OrdersStore.getAll();
    const now = new Date();

    // Filter only active, non-expired, non-closed monthly retainers / subscriptions
    const activeSubscriptions = allOrders.filter((order) => {
      if (order.type !== "monthly_plan") return false;

      // Exclude cancelled, expired, closed, refunded
      if (
        order.status === "cancelled" ||
        order.status === "refunded" ||
        order.status === "closed" ||
        order.status === "expired" ||
        order.subscriptionStatus === "cancelled" ||
        order.subscriptionStatus === "expired" ||
        order.subscriptionStatus === "closed"
      ) {
        return false;
      }

      // Check trial validity
      if (order.status === "trial" || order.subscriptionStatus === "trial") {
        if (order.trialEndsAt) {
          const trialEnd = new Date(order.trialEndsAt);
          if (trialEnd.getTime() < now.getTime()) {
            return false; // Trial expired
          }
        }
      }

      // Check current billing period validity
      if (order.currentPeriodEnd) {
        const periodEnd = new Date(order.currentPeriodEnd);
        if (periodEnd.getTime() < now.getTime()) {
          return false; // Billing period expired
        }
      }

      return true;
    });

    const sanitized = activeSubscriptions.map((sub) => ({
      orderId: sub.id,
      orderNumber: sub.orderNumber || sub.code,
      clientUid: sub.clientUid || sub.clientId,
      clientName: sub.clientName,
      clientEmail: sub.clientEmail,
      planName: sub.service || sub.title,
      billingCycle: sub.billingCycle || "monthly",
      isTrial: sub.status === "trial" || sub.subscriptionStatus === "trial",
      driveFolderId: sub.driveFolderId,
      currentPeriodStart: sub.currentPeriodStart || sub.createdAt,
      currentPeriodEnd: sub.currentPeriodEnd || sub.trialEndsAt,
      requirements: sub.requirements || sub.notes || "Monthly studio retainer creative stream",
    }));

    return NextResponse.json({
      timestamp: now.toISOString(),
      count: sanitized.length,
      subscriptions: sanitized,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch active subscriptions for n8n.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
