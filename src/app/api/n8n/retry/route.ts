import { NextResponse } from "next/server";
import { OrdersStore } from "@/lib/services/ordersStore";
import { N8nAutomationService } from "@/lib/services/n8nService";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { orderId, workflowId } = payload;

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing required orderId." },
        { status: 400 }
      );
    }

    const order = OrdersStore.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Reset failure state if any
    order.workflowLastError = undefined;

    // Dispatch via N8nAutomationService
    const result = await N8nAutomationService.dispatchWorkflow({
      workflowId: workflowId || order.workflowId || "W1_order_fulfillment_router",
      orderId: order.id,
      clientId: order.clientUid || order.clientId,
      service: order.service,
      brief: order.requirements || order.notes,
      driveFolderId: order.driveFolderId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to retry workflow.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
