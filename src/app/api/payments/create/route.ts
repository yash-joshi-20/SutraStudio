import { NextResponse } from "next/server";
import { PaymentsStore } from "@/lib/services/paymentsStore";
import { OrdersStore } from "@/lib/services/ordersStore";
import { getAuthenticatedUser } from "@/lib/auth/serverAuth";

/**
 * POST /api/payments/create
 * Creates / retrieves a locked UPI QR payment record for an order.
 * Amount is strictly locked from the database record (never client-supplied).
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();

    if (!body.orderId) {
      return NextResponse.json(
        { error: "orderId is a required parameter." },
        { status: 400 }
      );
    }

    // Lookup order in database (async lookup to guarantee Firestore sync)
    const order = (await OrdersStore.findByIdAsync(body.orderId)) || OrdersStore.findById(body.orderId);
    if (!order) {
      return NextResponse.json(
        { error: `Order record '${body.orderId}' not found in database.` },
        { status: 404 }
      );
    }

    // Multi-tenant client ownership check
    if (user.isAuthenticated && user.role === "client") {
      const ownerUid = order.clientUid || order.clientId;
      if (
        ownerUid &&
        ownerUid !== user.uid &&
        (!user.email || !order.clientEmail || order.clientEmail.toLowerCase() !== user.email.toLowerCase())
      ) {
        return NextResponse.json(
          { error: "Forbidden: You are not authorized to initialize payment for this order." },
          { status: 403 }
        );
      }
    }

    // If order already paid, prevent duplicate payment
    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "Order has already been verified and paid.", paymentStatus: "paid" },
        { status: 400 }
      );
    }

    // Server-recomputed locked amount directly from official order record
    const amountINR = Number(order.totalAmount);
    if (!amountINR || amountINR <= 0) {
      return NextResponse.json(
        { error: "Invalid order amount. The specified order has no valid price configured." },
        { status: 400 }
      );
    }

    const orderNumber = order.orderNumber || order.code || `ORD-${Date.now()}`;
    const clientEmail = order.clientEmail || (user.isAuthenticated ? user.email : body.customerEmail) || "";
    const clientId = order.clientUid || order.clientId || (user.isAuthenticated ? user.uid : body.clientId) || "client";
    const clientName = order.clientName || user.name || "Studio Client";

    const paymentRecord = await PaymentsStore.getOrCreatePaymentRecord({
      orderId: order.id,
      orderNumber,
      amountINR,
      clientId,
      clientName,
      clientEmail,
    });

    return NextResponse.json({
      success: true,
      provider: "UPI_DYNAMIC_QR",
      paymentId: paymentRecord.id,
      amountINR: paymentRecord.amountINR,
      currency: "INR",
      status: paymentRecord.status,
      upiUri: paymentRecord.upiUri,
      vpa: paymentRecord.vpa,
      payeeName: paymentRecord.payeeName,
      note: paymentRecord.note,
      orderNumber,
      orderTitle: order.title,
      clientName,
      clientEmail,
      clientPhone: order.clientPhone,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to initialize UPI QR payment intent.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
