import { NextResponse } from "next/server";
import { PaymentsStore } from "@/lib/services/paymentsStore";
import { OrdersStore } from "@/lib/services/ordersStore";
import { getAuthenticatedUser } from "@/lib/auth/serverAuth";

/**
 * POST /api/payments/submit-utr
 * Client submits 12-16 digit Indian Banking UTR / UPI Reference and optional screenshot.
 *
 * Directives:
 * 1. Single-use UTR across all orders in database.
 * 2. Amount is always read from server record, never from client input.
 * 3. Transitions payment record from awaiting_payment -> payment_submitted.
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();
    const { orderId, utrNumber, screenshotUrl, screenshotDriveFileId } = body;

    if (!orderId || !utrNumber) {
      return NextResponse.json(
        { error: "orderId and utrNumber are required parameters." },
        { status: 400 }
      );
    }

    const cleanedUtr = String(utrNumber).trim().toUpperCase();
    if (!/^[0-9A-Z]{12,16}$/.test(cleanedUtr)) {
      return NextResponse.json(
        { error: "Invalid UTR format. Please provide a valid 12 to 16 character bank reference number from your UPI app receipt." },
        { status: 422 }
      );
    }

    // Lookup order
    const order = (await OrdersStore.findByIdAsync(orderId)) || OrdersStore.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: `Order '${orderId}' not found.` },
        { status: 404 }
      );
    }

    // Ownership check for clients
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
            { error: "Forbidden: Cross-user payment attempt detected. You do not own this order." },
            { status: 403 }
          );
        }
      }
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
          { error: "Unauthorized: Active authentication session or valid order token is required to submit payment." },
          { status: 401 }
        );
      }
    }

    // Prevent submission on already paid or cancelled orders
    if (order.paymentStatus === "paid" || order.status === "paid") {
      return NextResponse.json(
        { error: "This order has already been verified and paid.", paymentStatus: "paid" },
        { status: 400 }
      );
    }

    if (order.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot submit payment for a cancelled order.", status: "cancelled" },
        { status: 400 }
      );
    }

    const result = await PaymentsStore.submitUtr({
      orderId,
      utrNumber: cleanedUtr,
      screenshotUrl,
      screenshotDriveFileId,
      clientUid: user.isAuthenticated ? user.uid : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `UTR ${cleanedUtr} submitted. Zero-commission payment is awaiting studio administrator ledger verification before production begins.`,
      status: "payment_submitted",
      payment: result.payment,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal payment submission failed.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
