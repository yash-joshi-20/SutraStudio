import { NextResponse } from "next/server";
import { PaymentsService, PaymentIntentOptions } from "@/lib/services/payments";
import { OrdersStore } from "@/lib/services/ordersStore";
import { getAuthenticatedUser } from "@/lib/auth/serverAuth";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = (await req.json()) as (PaymentIntentOptions & { orderId: string });

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

    // If order already paid, prevent double charge
    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "Order has already been verified and paid.", paymentStatus: "paid" },
        { status: 400 }
      );
    }

    // Server-recomputed amount directly from official order record (never trust client)
    const amountINR = order.totalAmount;
    if (!amountINR || typeof amountINR !== "number" || amountINR <= 0) {
      return NextResponse.json(
        { error: "Invalid order amount. The specified order has no valid price configured." },
        { status: 400 }
      );
    }

    const orderNumber = order.orderNumber || order.code;
    if (!orderNumber) {
      return NextResponse.json(
        { error: "Order is missing an assigned order number." },
        { status: 400 }
      );
    }

    const clientEmail = order.clientEmail || (user.isAuthenticated ? user.email : body.customerEmail);
    if (!clientEmail) {
      return NextResponse.json(
        { error: "A verified client email address is required for payment processing." },
        { status: 400 }
      );
    }

    const clientId = order.clientUid || order.clientId || (user.isAuthenticated ? user.uid : body.clientId);
    if (!clientId) {
      return NextResponse.json(
        { error: "A valid client identification is required for payment initialization." },
        { status: 400 }
      );
    }

    const razorpayOrder = await PaymentsService.createRazorpayOrder({
      amountINR,
      orderNumber,
      orderId: body.orderId,
      clientId,
      clientEmail,
      description: order?.title || body.description || `Sutra Studio Commission ${orderNumber}`,
    });

    // Update order with newly assigned Razorpay Order ID if missing
    if (order && !order.razorpayOrderId) {
      OrdersStore.update(order.id, {
        razorpayOrderId: razorpayOrder.razorpayOrderId,
      });
    }

    return NextResponse.json({
      success: true,
      provider: "RAZORPAY",
      razorpayOrderId: razorpayOrder.razorpayOrderId,
      amountInPaise: razorpayOrder.amountInPaise,
      currency: razorpayOrder.currency,
      keyId: razorpayOrder.keyId,
      isTestMode: razorpayOrder.isTestMode,
      orderNumber,
      orderTitle: order?.title,
      clientName: order?.clientName,
      clientEmail,
      clientPhone: order?.clientPhone,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to initialize Razorpay checkout intent.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
