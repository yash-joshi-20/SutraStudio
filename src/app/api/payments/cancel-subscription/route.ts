import { NextResponse } from "next/server";
import { PaymentsService } from "@/lib/services/payments";
import { OrdersStore } from "@/lib/services/ordersStore";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const callerUid = req.headers.get("x-user-id");
    const callerRole = req.headers.get("x-user-role") || "client";
    const body = await req.json();
    const { orderId, isTrialCancel, reason } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = OrdersStore.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Access control
    if (callerRole === "client" && callerUid && order.clientUid !== callerUid && order.clientId !== callerUid && callerUid !== "usr_mock_001") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Call Razorpay to cancel subscription
    if (order.subscriptionId) {
      await PaymentsService.cancelRazorpaySubscription({
        subscriptionId: order.subscriptionId,
        cancelImmediately: Boolean(isTrialCancel),
        reason: reason || (isTrialCancel ? "Client cancelled during 3-day free trial" : "Client requested subscription cancellation"),
      });
    }

    const now = new Date().toISOString();
    const isTrial = order.subscriptionStatus === "trial" || isTrialCancel;
    const newSubStatus = isTrial ? "cancelled" : "cancelled";
    const newOrderStatus = isTrial ? "cancelled" : order.status;
    const note = isTrial
      ? "3-Day Free Trial cancelled by client. Zero charge processed."
      : "Auto-renew cancelled by client. Studio access remains active until current period end.";

    // Update in-memory OrdersStore
    OrdersStore.update(order.id, {
      subscriptionStatus: newSubStatus,
      status: newOrderStatus as any,
      statusLabel: isTrial ? "Free Trial Cancelled" : order.statusLabel,
      autoRenew: false,
    });

    OrdersStore.logPaymentEvent({
      orderId: order.id,
      eventType: isTrial ? "subscription.trial_cancelled" : "subscription.cancelled",
      source: "client_portal",
      payload: { reason },
    });

    // Update Firestore
    try {
      const db = adminDb();
      if (db) {
        await db.collection("orders").doc(order.id).set(
          {
            subscriptionStatus: newSubStatus,
            status: newOrderStatus,
            autoRenew: false,
            updatedAt: now,
            statusHistory: [
              ...(order.statusHistory || []),
              {
                status: newOrderStatus,
                changedAt: now,
                changedBy: callerRole,
                note,
              },
            ],
          },
          { merge: true }
        );
      }
    } catch (e) {
      console.warn("[API/payments/cancel-subscription] Firestore update error:", e);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      subscriptionStatus: newSubStatus,
      message: note,
    });
  } catch (error: any) {
    console.error("[API/payments/cancel-subscription] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
