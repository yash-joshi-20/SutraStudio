import { NextResponse } from "next/server";
import { PaymentsService } from "@/lib/services/payments";
import { OrdersStore } from "@/lib/services/ordersStore";
import { requireAdmin } from "@/lib/auth/session";
import { requireFreshAdminReauth } from "@/lib/auth/adminAccess";
import { guarded } from "@/lib/api/response";
import { AuditLogService } from "@/lib/services/auditLogService";

export async function POST(req: Request) {
  return guarded(async () => {
    // Step 1.5: financial actions run behind the admin portal's own cookie,
    // not a client session carrying an admin claim.
    const user = await requireAdmin();
    // Step 1.8: a refund needs a sign-in from the last 5 minutes.
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

    const paymentId = order.razorpayPaymentId || `pay_${order.id}`;

    // Issue refund via Razorpay REST API
    const refundResult = await PaymentsService.refundPayment({
      paymentId,
      amountINR: amountINR || order.totalAmount,
      reason: reason || "Administrative studio commission cancellation and refund.",
    });

    const now = new Date().toISOString();
    const beforeStatus = order.status;
    const updatedOrder = OrdersStore.update(order.id, {
      paymentStatus: "refunded",
      status: "cancelled",
      statusLabel: "Cancelled & Refunded",
      updatedAt: now,
      statusHistory: [
        ...(order.statusHistory || []),
        {
          status: "cancelled",
          changedAt: now,
          changedBy: user.name || "admin",
          note: `Commission refunded (${refundResult.refundId}) by Studio Administrator: ${reason || "Client refund requested"}`,
        },
      ],
    });

    OrdersStore.logPaymentEvent({
      orderId: order.id,
      eventType: "payment.refunded",
      amountINR: amountINR || order.totalAmount,
      paymentId,
      source: "refund",
      payload: { refundId: refundResult.refundId, reason, adminId: user.uid },
    });

    // Record in immutable Administrative Audit Trail
    try {
      AuditLogService.record({
        who: {
          uid: user.uid || "admin",
          email: user.email || "yashjoshi20@zohomail.in",
          name: user.name || "Studio Administrator",
          role: "admin",
        },
        what: "PAYMENT_REFUNDED",
        targetType: "order",
        targetId: order.id,
        targetTitle: `${order.title} (#${order.orderNumber || order.code})`,
        before: { status: beforeStatus, paymentStatus: "paid" },
        after: { status: "cancelled", paymentStatus: "refunded", refundId: refundResult.refundId },
        note: `Issued refund of ₹${amountINR || order.totalAmount}. Reason: ${reason || "Admin discretion"}`,
        type: "warning",
      });
    } catch {}

    return NextResponse.json(
      {
        success: true,
        refundId: refundResult.refundId,
        order: updatedOrder,
        message: `Refund of ₹${amountINR || order.totalAmount} processed successfully. Order status updated to refunded/cancelled.`,
      },
      { status: 200 }
    );
  });
}
