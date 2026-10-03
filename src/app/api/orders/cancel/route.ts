import { NextResponse } from "next/server";
import { OrdersStore } from "@/lib/services/ordersStore";
import { sanitizeInputText } from "@/lib/security/sanitize";

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");
    const { orderId, reason } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing required orderId." }, { status: 400 });
    }

    const result = OrdersStore.clientCancelOrder({
      orderId,
      clientUid: userRole === "admin" ? undefined : userId || undefined,
      reason: sanitizeInputText(reason),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to process cancellation request.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
