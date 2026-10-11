import { NextResponse } from "next/server";
import { PaymentsStore } from "@/lib/services/paymentsStore";
import { OrdersStore } from "@/lib/services/ordersStore";
import { requireAdmin } from "@/lib/auth/session";
import { requireFreshAdminReauth } from "@/lib/auth/adminAccess";
import { guarded } from "@/lib/api/response";

/**
 * POST /api/payments/refund
 * Studio Administrator manual ledger refund recording.
 *
 * Rules:
 *  - Requires active admin session with fresh re-auth (< 5 mins)
 *  - Refunds are recorded manually by admin (no automated gateway chargeback)
 *  - Audit-logged
 */
export async function POST(req: Request) {
  return guarded(async () => {
    const user = await requireAdmin();
    await requireFreshAdminReauth();

    const body = await req.json();
    const { orderId, amountINR, reason } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is a required parameter." },
        { status: 400 }
      );
    }

    const order = OrdersStore.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    if (order.paymentStatus !== "paid") {
      return NextResponse.json(
        { error: `Cannot refund order with payment status: ${order.paymentStatus || "unpaid"}. Only paid orders can be refunded.` },
        { status: 400 }
      );
    }

    const adminActor = {
      uid: user.uid || "admin",
      email: user.email || "yashjoshi20@zohomail.in",
      name: user.name || "Studio Administrator",
    };

    const refundResult = await PaymentsStore.recordManualRefund({
      orderId,
      amountINR,
      reason: reason || "Administrative studio commission manual refund recorded in ledger.",
      adminActor,
    });

    if (!refundResult.success) {
      return NextResponse.json(
        { error: refundResult.error || "Failed to process manual refund." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        refundId: refundResult.refundId,
        order: refundResult.order,
        message: `Manual refund of ₹${amountINR || order.totalAmount} recorded successfully in studio ledger. Order status updated to refunded/cancelled.`,
      },
      { status: 200 }
    );
  });
}
