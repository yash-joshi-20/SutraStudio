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

    // Authentication & Multi-tenant Ownership Verification
    if (user.isAuthenticated) {
      if (user.role === "client") {
        const ownerUid = order.clientUid || order.clientId;
        const ownerEmail = order.clientEmail?.toLowerCase();
        const callerEmail = user.email?.toLowerCase();
        const isOwner =
          (ownerUid && ownerUid === user.uid) ||
          (ownerEmail && callerEmail && ownerEmail === callerEmail);

        if (!isOwner) {
          return NextResponse.json(
            { error: "Forbidden: Cross-user payment attempt detected. You do not have ownership of this order." },
            { status: 403 }
          );
        }
      }
      // Admins are authorized to view / initiate payment records
    } else {
      // Unauthenticated caller: must supply matching order confirmToken or verified matching client email
      const candidateToken = body.confirmToken || body.token;
      const orderToken = (order as any).confirmToken;
      const candidateEmail = body.clientEmail?.toLowerCase() || body.customerEmail?.toLowerCase();
      const orderEmail = order.clientEmail?.toLowerCase();

      const hasValidToken = Boolean(candidateToken && orderToken && candidateToken === orderToken);
      const hasValidEmail = Boolean(candidateEmail && orderEmail && candidateEmail === orderEmail);

      if (!hasValidToken && !hasValidEmail) {
        return NextResponse.json(
          { error: "Unauthorized: Active authentication session or valid order token is required to initialize payment." },
          { status: 401 }
        );
      }
    }

    // State Validation: Prevent payment on already paid or cancelled orders
    if (order.paymentStatus === "paid" || order.status === "paid") {
      return NextResponse.json(
        { error: "Order has already been verified and paid.", paymentStatus: "paid" },
        { status: 400 }
      );
    }

    if (order.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot initialize payment for a cancelled order.", status: "cancelled" },
        { status: 400 }
      );
    }

    // Server-Authoritative Amount Calculation from Canonical Snapshot or Order Total
    const amountINR = Number(order.orderSnapshot?.total ?? order.totalAmount);
    if (!amountINR || amountINR <= 0) {
      return NextResponse.json(
        { error: "Invalid order amount. The specified order has no valid price configured." },
        { status: 400 }
      );
    }

    // Anti-Tamper Check: Reject forged client-submitted amounts
    const clientSubmittedAmount = body.amount ?? body.amountINR;
    if (clientSubmittedAmount !== undefined && Number(clientSubmittedAmount) !== amountINR) {
      return NextResponse.json(
        {
          error: `Security Error: Amount tampering detected. Client submitted ₹${clientSubmittedAmount}, but authoritative order total is ₹${amountINR}.`,
          authoritativeAmount: amountINR,
        },
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
      orderId: order.id,
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
