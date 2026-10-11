import { NextResponse } from "next/server";
import { PaymentsStore } from "@/lib/services/paymentsStore";
import { assertAdminSession } from "@/lib/auth/requestRole";

/**
 * GET /api/admin/payments/pending
 * Returns all UPI payments currently in 'payment_submitted' status for admin queue.
 */
export async function GET(req: Request) {
  const gate = await assertAdminSession(req);
  if (!gate.authorized) return gate.response;

  try {
    const pendingPayments = PaymentsStore.getPaymentsToVerify();
    return NextResponse.json({
      success: true,
      count: pendingPayments.length,
      payments: pendingPayments,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch pending payments queue.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
