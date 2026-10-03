import { NextResponse } from "next/server";
import { N8nAutomationService, N8nWorkflowPayload } from "@/lib/services/n8nService";
import { OrdersStore } from "@/lib/services/ordersStore";

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as N8nWorkflowPayload;

    if (!payload.workflowId) {
      return NextResponse.json(
        { error: "Missing required workflowId in request payload." },
        { status: 400 }
      );
    }

    // If orderId is provided, enrich payload from OrdersStore if brief or service is missing
    if (payload.orderId) {
      const order = OrdersStore.findById(payload.orderId);
      if (order) {
        if (!payload.service) payload.service = order.service;
        if (!payload.brief) payload.brief = order.requirements || order.notes;
        if (!payload.clientId) payload.clientId = order.clientUid || order.clientId;
        if (!payload.driveFolderId) payload.driveFolderId = order.driveFolderId;
      }
    }

    const result = await N8nAutomationService.dispatchWorkflow(payload);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to dispatch n8n automation pipeline.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
