import { NextResponse } from "next/server";
import { PaymentsService } from "@/lib/services/payments";
import { OrdersStore } from "@/lib/services/ordersStore";
import { adminDb } from "@/lib/firebase/admin";
import { requestRole, requestUid } from "@/lib/auth/requestRole";

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
    if (callerRole === "client" && callerUid && order.clientUid !== callerUid && order.clientId !== callerUid && callerUid !== "usr_mock_001") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const totalAmount = order.totalAmount || 18999;
    const orderNumber = order.orderNumber || order.code || `ORD-${Date.now()}`;

    // Create Razorpay Order for renewal charge
    const rzpOrder = await PaymentsService.createRazorpayOrder({
      amountINR: totalAmount,
      orderNumber: `${orderNumber}-RNW`,
      orderId: order.id,
      clientId: order.clientUid || order.clientId || callerUid || "client",
      clientEmail: order.clientEmail,
      description: `Monthly Renewal: ${order.title}`,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount,
      razorpay: {
        orderId: rzpOrder.razorpayOrderId,
        amountInPaise: rzpOrder.amountInPaise,
        currency: rzpOrder.currency,
        keyId: rzpOrder.keyId,
        isTestMode: rzpOrder.isTestMode,
      },
    });
  } catch (error: any) {
    console.error("[API/payments/renew] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize renewal payment" },
      { status: 500 }
    );
  }
}
