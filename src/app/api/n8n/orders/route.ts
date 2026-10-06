import { NextResponse } from "next/server";
import { OrdersStore } from "@/lib/services/ordersStore";
import { N8nAutomationService } from "@/lib/services/n8nService";

export async function GET(req: Request) {
  try {
    const isAuthorized = N8nAutomationService.verifySecretHeader(req);
    if (!isAuthorized && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing x-sutra-secret header." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId") || searchParams.get("id");

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing required query parameter: orderId" },
        { status: 400 }
      );
    }

    let order = OrdersStore.findById(orderId);
    if (!order) {
      order = await OrdersStore.findByIdAsync(orderId);
    }
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Return sanitized context for n8n execution
    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber || order.code,
      title: order.title,
      service: order.service,
      type: order.type || "service",
      clientUid: order.clientUid || order.clientId,
      clientName: order.clientName,
      clientEmail: order.clientEmail,
      requirements: order.requirements || order.notes || "High quality studio creative brief",
      attachments: order.attachments || [],
      driveFolderId: order.driveFolderId,
      driveSubfolders: order.driveSubfolders || {
        clientAssets: { name: "01 Client Assets", id: `${order.driveFolderId}_assets` },
        drafts: { name: "02 Drafts", id: `${order.driveFolderId}_drafts` },
        finalDelivery: { name: "03 Final Delivery", id: `${order.driveFolderId}_final` },
        revisions: { name: "04 Revisions", id: `${order.driveFolderId}_revisions` },
      },
      workflowStatus: order.workflowStatus || "idle",
      workflowRetryCount: order.workflowRetryCount || 0,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch order details for n8n.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
