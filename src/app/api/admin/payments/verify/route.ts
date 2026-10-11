import { NextResponse } from "next/server";
import { PaymentsStore } from "@/lib/services/paymentsStore";
import { assertAdminSession } from "@/lib/auth/requestRole";

/**
 * POST /api/admin/payments/verify
 * Studio Administrator verifies a submitted UPI payment (UTR).
 *
 * Rules:
 *  - Admin only
 *  - Moves payment to verified & paid
 *  - Moves order to paid and in_production
 *  - Starts work (dispatches to n8n)
 *  - Audit-logged
 */
export async function POST(req: Request) {
  const gate = await assertAdminSession(req);
  if (!gate.authorized) return gate.response;

  try {
    const body = await req.json();
    const { orderId, paymentId, notes } = body;

    if (!orderId && !paymentId) {
      return NextResponse.json(
        { error: "orderId or paymentId is required." },
        { status: 400 }
      );
    }

    const adminActor = {
      uid: gate.user.uid,
      email: gate.user.email || "yashjoshi20@zohomail.in",
      name: gate.user.name || "Studio Administrator",
    };

    const result = await PaymentsStore.verifyPayment({
      orderId,
      paymentId,
      adminActor,
      notes,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to verify payment." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Payment verified by ${adminActor.email}. Order marked paid and work dispatched.`,
      payment: result.payment,
      order: result.order,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Admin payment verification failed.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
