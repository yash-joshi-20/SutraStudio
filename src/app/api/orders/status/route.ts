import { NextResponse } from "next/server";
import { OrdersStore } from "@/lib/services/ordersStore";
import { adminDb } from "@/lib/firebase/admin";
import { requestRole, requestUid } from "@/lib/auth/requestRole";

export async function POST(req: Request) {
  try {
    const role = await requestRole(req);
    const callerId = await requestUid(req);

    const body = await req.json();
    const { orderId, newStatus, note, adminName, assignedTo, internalNote } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = OrdersStore.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Role validation
    const actorRole = role === "admin" ? "admin" : "client";

    if (newStatus) {
      const result = OrdersStore.updateStatusWithValidation({
        orderId,
        newStatus,
        actorRole,
        actorName: adminName || (actorRole === "admin" ? "Studio Executive Producer" : "Studio Client"),
        note,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Status transition rejected." },
          { status: result.error?.includes("Forbidden") ? 403 : 400 }
        );
      }
    }

    // Team assignment update
    if (assignedTo && actorRole === "admin") {
      order.assignedTo = {
        id: assignedTo.id || `team_${Date.now()}`,
        name: assignedTo.name,
        role: assignedTo.role,
        assignedAt: new Date().toISOString(),
      };
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: order.status,
        changedAt: new Date().toISOString(),
        changedBy: adminName || "Administrator",
        note: `Assigned to ${assignedTo.name} (${assignedTo.role})`,
      });
    }

    // Private internal note
    if (internalNote?.trim() && actorRole === "admin") {
      OrdersStore.addInternalNote({
        orderId: order.id,
        authorName: adminName || "Studio Supervisor",
        text: internalNote.trim(),
      });
    }

    // Sync to Firestore
    try {
      const db = adminDb();
      if (db) {
        await db.collection("orders").doc(order.id).set(
          {
            status: order.status,
            statusLabel: order.statusLabel,
            assignedTo: order.assignedTo,
            internalNotes: order.internalNotes,
            statusHistory: order.statusHistory,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (dbErr) {
      console.warn("[Orders Status API] Firestore sync error:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: `Order #${order.orderNumber || order.code} successfully updated.`,
      order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update order status." },
      { status: 500 }
    );
  }
}
