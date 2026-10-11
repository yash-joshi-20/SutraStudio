import { NextResponse } from "next/server";
import { OrdersStore } from "@/lib/services/ordersStore";
import { OrderPipelineService } from "@/lib/services/orderPipeline";
import { getAuthenticatedUser } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

/**
 * GET: Validate token and fetch public draft overview for the confirmation page
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const token = searchParams.get("token");

    if (!orderId || !token) {
      return NextResponse.json(
        { error: "Order ID and confirmation security token are required." },
        { status: 400 }
      );
    }

    const order = await OrdersStore.findByIdAsync(orderId);
    if (!order) {
      return NextResponse.json({ error: "Draft order not found." }, { status: 404 });
    }

    if ((order as any).confirmToken !== token) {
      return NextResponse.json({ error: "Invalid or expired confirmation link token." }, { status: 403 });
    }

    // Return client-safe overview
    return NextResponse.json({
      success: true,
      draft: {
        id: order.id,
        orderNumber: order.orderNumber || order.code,
        code: order.code,
        title: order.title,
        service: order.service,
        type: order.type,
        totalAmount: order.totalAmount,
        currency: "INR",
        requirements: order.requirements,
        source: order.source,
        isDraft: Boolean((order as any).isDraft || order.status === "draft"),
        status: order.status,
        statusLabel: order.statusLabel,
        createdAt: order.createdAt,
        clientName: order.clientName,
        clientEmail: order.clientEmail,
        clientPhone: order.clientPhone,
        conversationHistory: (order as any).conversationHistory || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to inspect draft order." }, { status: 500 });
  }
}

/**
 * POST: Confirm and activate draft order (requires client login & payment confirmation)
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json().catch(() => ({}));

    const { orderId, token, paymentMethod, paymentReference } = body;

    if (!orderId || !token) {
      return NextResponse.json(
        { error: "Order ID and confirmation token are required." },
        { status: 400 }
      );
    }

    // Authenticated client binding check
    if (!user.isAuthenticated && !body.clientUid) {
      return NextResponse.json(
        {
          error: "Authentication Required: Please sign in or register to claim this order in your private client workspace.",
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    const effectiveUid = user.isAuthenticated ? user.uid : body.clientUid;
    const effectiveEmail = user.isAuthenticated ? user.email : body.clientEmail;
    const effectiveName = user.isAuthenticated ? user.name : body.clientName;

    const result = await OrderPipelineService.confirmAndActivateDraftOrder({
      orderId,
      token,
      clientUid: effectiveUid,
      clientEmail: effectiveEmail,
      clientName: effectiveName,
      paymentMethod: paymentMethod || "gpay_verification",
      paymentReference,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to activate draft order." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      message: "Order successfully confirmed and placed into Studio Production Queue.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server confirmation error." }, { status: 500 });
  }
}
