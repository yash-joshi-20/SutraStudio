import { NextResponse } from "next/server";
import { N8nAutomationService, N8nWorkflowPayload } from "@/lib/services/n8nService";
import { OrdersStore } from "@/lib/services/ordersStore";
import { assertAdminSession } from "@/lib/auth/requestRole";

export async function POST(req: Request) {
  const gate = await assertAdminSession(req);
  if (!gate.authorized) return gate.response;

  try {
    const payload = (await req.json()) as N8nWorkflowPayload;

    if (!payload.workflowId) {
      return NextResponse.json(
        { success: false, error: "Missing required workflowId in request payload.", details: "Missing workflowId" },
        { status: 400 }
      );
    }

    // Default to admin dispatch if not specified
    if (payload.isAdminDispatch === undefined) {
      payload.isAdminDispatch = true;
    }

    // If orderId is provided, enrich payload from OrdersStore if brief or service is missing
    if (payload.orderId) {
      let order = OrdersStore.findById(payload.orderId);
      if (!order) {
        order = await OrdersStore.findByIdAsync(payload.orderId);
      }
      if (order) {
        if (!payload.service) payload.service = order.service || order.title;
        if (!payload.brief) payload.brief = order.requirements || order.notes;
        if (!payload.clientId) payload.clientId = order.clientUid || order.clientId;
        if (!payload.driveFolderId) payload.driveFolderId = order.driveFolderId;
      }
    }

    const result = await N8nAutomationService.dispatchWorkflow(payload);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Failed to dispatch automation pipeline.";
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        details: errorMsg,
      },
      { status: 500 }
    );
  }
}
