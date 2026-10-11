import { NextResponse } from "next/server";
import { assertAdminSession } from "@/lib/auth/requestRole";
import { OrderPipelineService, type OrderSource } from "@/lib/services/orderPipeline";

/**
 * POST /api/admin/outreach/record
 * Logs a manually transmitted message from the Outreach Desk into the order's unified conversation history.
 */
export async function POST(req: Request) {
  const auth = await assertAdminSession(req);
  if (!auth.ok) return auth.response;

  try {
    const { orderId, channel, text, recipientHandle } = await req.json();
    if (!orderId || !text) {
      return NextResponse.json({ error: "Missing orderId or message text" }, { status: 400 });
    }

    const validChannel: OrderSource = ["whatsapp", "instagram", "facebook", "email"].includes(channel)
      ? channel
      : "whatsapp";

    const updated = await OrderPipelineService.recordMessage(orderId, {
      sender: "studio",
      channel: validChannel,
      text,
      authorName: auth.user.email || auth.user.uid || "Studio Admin",
      metadata: {
        manualOutreachDesk: true,
        recipientHandle: recipientHandle || null,
        sentAt: new Date().toISOString(),
      },
    });

    if (!updated) {
      return NextResponse.json({ error: "Order not found or update failed" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Outreach message successfully appended to order conversation history.",
      conversationHistory: (updated as any).conversationHistory,
    });
  } catch (err: any) {
    console.error("[Outreach/Record] Error recording outreach:", err);
    return NextResponse.json(
      { error: "Failed to record outreach message", details: err.message },
      { status: 500 }
    );
  }
}
