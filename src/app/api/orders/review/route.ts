import { NextResponse } from "next/server";
import { OrdersStore } from "@/lib/services/ordersStore";
import { adminDb } from "@/lib/firebase/admin";
import { requestUid } from "@/lib/auth/requestRole";

export async function POST(req: Request) {
  try {
    const callerId = await requestUid(req);
    if (!callerId) {
      return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    }
    const body = await req.json();
    const { orderId, action, comment, clientName, annotationUrl } = body;

    if (!orderId || (action !== "approve" && action !== "revision")) {
      return NextResponse.json(
        { error: "Invalid payload: orderId and action ('approve' | 'revision') are required." },
        { status: 400 }
      );
    }

    const result = OrdersStore.clientReviewOrder({
      orderId,
      action,
      clientUid: callerId,
      clientName: clientName || "Valued Studio Client",
      comment,
      annotationUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Review action failed." },
        { status: result.error?.includes("Forbidden") ? 403 : 400 }
      );
    }

    // Persist to Firestore
    try {
      const db = adminDb();
      if (db && result.order) {
        await db.collection("orders").doc(result.order.id).set(
          {
            status: result.order.status,
            statusLabel: result.order.statusLabel,
            revisionRound: result.order.revisionRound,
            notes: result.order.notes,
            statusHistory: result.order.statusHistory,
            updatedAt: result.order.updatedAt,
          },
          { merge: true }
        );
      }
    } catch (dbErr) {
      console.warn("[Review API] Firestore sync error:", dbErr);
    }

    return NextResponse.json({
      success: true,
      limitReached: result.limitReached,
      message:
        action === "approve"
          ? "Deliverables officially approved (100% completed). Permanent commercial licenses granted."
          : result.limitReached
          ? "Extra revision request submitted to Lead Producer (revisionsIncluded limit reached)."
          : "Revision request submitted to Art Director with expedited turnaround.",
      order: result.order,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal error processing review action." },
      { status: 500 }
    );
  }
}
