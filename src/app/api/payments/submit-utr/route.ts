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
    if (user.isAuthenticated && user.role === "client") {
      const ownerUid = order.clientUid || order.clientId;
      if (
        ownerUid &&
        ownerUid !== user.uid &&
        (!user.email || !order.clientEmail || order.clientEmail.toLowerCase() !== user.email.toLowerCase())
      ) {
        return NextResponse.json(
          { error: "Forbidden: You are not authorized to submit payment for this order." },
          { status: 403 }
        );
      }
    }

    // Prevent re-submission if already paid
    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "This order has already been verified and paid.", paymentStatus: "paid" },
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
