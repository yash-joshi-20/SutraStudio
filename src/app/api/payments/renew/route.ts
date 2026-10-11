import { NextResponse } from "next/server";
import { PaymentsStore } from "@/lib/services/paymentsStore";
import { OrdersStore } from "@/lib/services/ordersStore";
import { requestRole, requestUid } from "@/lib/auth/requestRole";

/**
 * POST /api/payments/renew
 * Generates the next subscription cycle's UPI QR payment record.
 * Subscriptions have NO auto-charge; clients pay via UPI QR before expiry.
 */
export async function POST(req: Request) {
  try {
    const callerUid = await requestUid(req);
    const callerRole = await requestRole(req);
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = OrdersStore.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Access control
    if (callerRole === "client" && callerUid && order.clientUid !== callerUid && order.clientId !== callerUid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const totalAmount = Number(order.totalAmount || 18999);
    const orderNumber = String(order.orderNumber || order.code || `ORD-${Date.now()}`);

    // Create next cycle payment record
    const cycleIndex = ((order as any).currentCycleIndex || 1) + 1;
    const payment = await PaymentsStore.getOrCreatePaymentRecord({
      orderId: order.id,
      orderNumber: `${orderNumber}-RNW`,
      amountINR: totalAmount,
      clientId: order.clientUid || order.clientId || callerUid || "client",
      clientEmail: order.clientEmail,
      clientName: order.clientName,
      cycleIndex,
    });

    return NextResponse.json({
      success: true,
      provider: "UPI_DYNAMIC_QR",
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount,
      cycleIndex,
      payment: {
        id: payment.id,
        amountINR: payment.amountINR,
        currency: "INR",
        status: payment.status,
        upiUri: payment.upiUri,
        vpa: payment.vpa,
        payeeName: payment.payeeName,
        note: payment.note,
      },
      message: `Renewal payment QR generated for Order #${order.orderNumber}. Scan or tap to pay via UPI app.`,
    });
  } catch (error: any) {
    console.error("[API/payments/renew] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize renewal payment" },
      { status: 500 }
    );
  }
}
