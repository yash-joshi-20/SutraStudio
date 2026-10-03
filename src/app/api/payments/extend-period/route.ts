import { NextResponse } from "next/server";
import { OrdersStore } from "@/lib/services/ordersStore";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const callerRole = req.headers.get("x-user-role");
    const callerUid = req.headers.get("x-user-id");

    if (callerRole !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { orderId, daysToAdd, reason, adminName } = await req.json();

    if (!orderId || !daysToAdd) {
      return NextResponse.json(
        { error: "Missing required orderId or daysToAdd" },
        { status: 400 }
      );
    }

    const order = OrdersStore.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const baseDate = (order as any).currentPeriodEnd
      ? new Date((order as any).currentPeriodEnd)
      : new Date();

    baseDate.setDate(baseDate.getDate() + Number(daysToAdd));
    const newPeriodEnd = baseDate.toISOString();
    const now = new Date().toISOString();

    const note = `Administrative Extension (+${daysToAdd} days): ${reason || "Extended by Studio Supervisor"}`;

    // Update in-memory OrdersStore
    OrdersStore.update(order.id, {
      currentPeriodEnd: newPeriodEnd,
      status: "in_progress",
      subscriptionStatus: "active",
    } as any);

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: "in_progress",
      changedAt: now,
      changedBy: adminName || "Administrator",
      note,
    });

    OrdersStore.logPaymentEvent({
      orderId: order.id,
      eventType: "subscription.period_extended",
      source: "admin_portal",
      payload: { daysToAdd, reason, newPeriodEnd, adminUid: callerUid },
    });

    // Update Firestore
    try {
      const db = adminDb();
      if (db) {
        await db.collection("orders").doc(order.id).set(
          {
            currentPeriodEnd: newPeriodEnd,
            status: "in_progress",
            subscriptionStatus: "active",
            updatedAt: now,
            statusHistory: order.statusHistory,
          },
          { merge: true }
        );
      }
    } catch (e) {
      console.warn("[API/payments/extend-period] Firestore error:", e);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      newPeriodEnd,
      order: OrdersStore.findById(order.id),
      message: `Period extended by ${daysToAdd} days until ${new Date(newPeriodEnd).toLocaleDateString("en-IN")}.`,
    });
  } catch (error: any) {
    console.error("[API/payments/extend-period] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to extend subscription period" },
      { status: 500 }
    );
  }
}
