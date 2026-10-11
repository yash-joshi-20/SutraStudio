import { NextResponse } from "next/server";
import { PaymentsStore } from "@/lib/services/paymentsStore";
import { OrdersStore } from "@/lib/services/ordersStore";
import { getAuthenticatedUser } from "@/lib/auth/serverAuth";

/**
 * POST /api/payments/verify
 * Handles UPI UTR payment submission from checkout modals/pages.
 * Razorpay verification is permanently removed.
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();

    // Catch discontinued Razorpay payload
    if (body.razorpay_order_id || body.razorpay_payment_id || body.razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Razorpay payment integration has been discontinued. All transactions are processed via Pay by UPI QR.",
        },
        { status: 400 }
      );
    }

    const orderId = body.orderId || body.order_id;
    const utrNumber = body.utrNumber || body.utr;

    if (!orderId || !utrNumber) {
      return NextResponse.json(
        { error: "orderId and utrNumber are required parameters." },
        { status: 400 }
      );
    }

    const cleanUtr = String(utrNumber).trim().toUpperCase();
    if (!/^[0-9A-Z]{12,16}$/.test(cleanUtr)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid UTR format. Please provide a valid 12-digit bank reference number from your UPI receipt.",
        },
        { status: 422 }
      );
    }

    // Lookup order
    const order = (await OrdersStore.findByIdAsync(orderId)) || OrdersStore.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: "Order record not found." },
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

    // Prevent duplicate processing if already paid
    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        {
          success: true,
          verified: true,
          alreadyProcessed: true,
          orderId: order.id,
          orderNumber: order.orderNumber,
          amountPaid: order.totalAmount,
          message: "Payment on this order was already verified and logged.",
        },
        { status: 200 }
      );
    }

    const result = await PaymentsStore.submitUtr({
      orderId,
      utrNumber: cleanUtr,
      screenshotUrl: body.screenshotUrl,
      screenshotDriveFileId: body.screenshotDriveFileId,
      clientUid: user.isAuthenticated ? user.uid : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: false,
      status: "payment_submitted",
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountINR: result.payment?.amountINR ?? order.totalAmount,
      utrNumber: cleanUtr,
      message: `UTR ${cleanUtr} submitted. Zero-commission payment is awaiting studio administrator ledger verification before production begins.`,
      payment: result.payment,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal payment verification failed.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
