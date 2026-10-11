import { NextResponse } from "next/server";
import { PaymentsStore } from "@/lib/services/paymentsStore";
import { assertAdminSession } from "@/lib/auth/requestRole";

/**
 * POST /api/admin/payments/reject
 * Studio Administrator rejects an invalid/unmatched UPI UTR submission.
 *
 * Rules:
 *  - Admin only
 *  - Moves payment to rejected with rejection reason
 *  - Moves order to payment_failed
 *  - Audit-logged
 */
export async function POST(req: Request) {
  const gate = await assertAdminSession(req);
  if (!gate.authorized) return gate.response;

  try {
    const body = await req.json();
    const { orderId, paymentId, reason } = body;

    if (!orderId && !paymentId) {
      return NextResponse.json(
        { error: "orderId or paymentId is required." },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "A valid rejection reason must be provided." },
        { status: 400 }
      );
    }

    const adminActor = {
      uid: gate.user.uid,
      email: gate.user.email || "yashjoshi20@zohomail.in",
      name: gate.user.name || "Studio Administrator",
    };

    const result = await PaymentsStore.rejectPayment({
      orderId,
      paymentId,
      reason: reason.trim(),
      adminActor,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to reject payment." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Payment rejected by ${adminActor.email}.`,
      payment: result.payment,
      order: result.order,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Admin payment rejection failed.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
