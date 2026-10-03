import { NextResponse } from "next/server";
import { OrdersStore } from "@/lib/services/ordersStore";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { mapApiError } from "@/lib/api/response";
import { AuditLogService } from "@/lib/services/auditLogService";

export async function POST(req: Request) {
  // Step 1.5: releasing output to a client is an admin action and must run
  // behind the admin portal's own cookie. Auth is resolved BEFORE the try so a
  // rejected caller gets a 401/403 rather than a generic 500.
  let user: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    user = await requireAdmin();
  } catch (err: unknown) {
    return mapApiError(err);
  }

  try {

    const body = await req.json();
    const { orderId, deliverables, deliveryNote, adminName, isFinal } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId in delivery payload." },
        { status: 400 }
      );
    }

    const previousOrder = OrdersStore.findById(orderId);
    const beforeStatus = previousOrder?.status;

    const updated = OrdersStore.deliverOrder({
      orderId,
      deliverables: deliverables || [],
      deliveryNote: deliveryNote || (isFinal ? "Final master deliverables vaulted for client review." : "Draft render passes vaulted for client review."),
      adminName: adminName || user.name || "Studio Executive Producer",
      isFinal: Boolean(isFinal),
    });

    if (!updated) {
      return NextResponse.json(
        { error: `Order ${orderId} not found in studio store.` },
        { status: 404 }
      );
    }

    // Record in immutable Administrative Audit Trail
    try {
      AuditLogService.record({
        who: {
          uid: user.uid || "usr_admin_001",
          email: user.email || "admin@sutrastudio.com",
          name: adminName || user.name || "Studio Executive Producer",
          role: "admin",
        },
        what: "ORDER_DELIVERED",
        targetType: "order",
        targetId: updated.id,
        targetTitle: `${updated.title} (#${updated.orderNumber || updated.code})`,
        before: { status: beforeStatus },
        after: {
          status: updated.status,
          deliverablesCount: updated.deliverables?.length || 0,
          isFinal: Boolean(isFinal),
        },
        note: deliveryNote || `${isFinal ? "Final master deliverables" : "Draft preview"} uploaded to Drive vault.`,
        type: "success",
      });
    } catch {}

    // Sync to Firestore
    try {
      const db = adminDb();
      if (db) {
        await db.collection("orders").doc(updated.id).set(
          {
            status: updated.status,
            statusLabel: updated.statusLabel,
            deliverablePreview: updated.deliverablePreview,
            deliverables: updated.deliverables,
            deliveredAt: updated.deliveredAt,
            statusHistory: updated.statusHistory,
            updatedAt: updated.updatedAt,
          },
          { merge: true }
        );
      }
    } catch (dbErr) {
      console.warn("[Deliver API] Firestore sync error:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: `${isFinal ? "Final deliverables" : "Draft deliverables"} successfully vaulted and released to client for order #${updated.orderNumber || updated.code}.`,
      order: updated,
    });
} catch {
      // Never echo an internal message to the client.
      return NextResponse.json(
        { error: "We could not complete that delivery. Please try again." },
        { status: 500 }
      );
    }
  }

