import { NextResponse } from "next/server";
import { provisionOrderDriveFolders } from "@/lib/services/googleDriveService";
import { adminDb } from "@/lib/firebase/admin";
import { OrdersStore } from "@/lib/services/ordersStore";

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role") || "client";

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, orderNumber, serviceName, clientId, clientName } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // Security check: Client can only provision folders for their own order
    if (userRole === "client" && clientId && clientId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const structure = await provisionOrderDriveFolders({
      orderId,
      orderNumber: orderNumber || orderId.slice(0, 8),
      serviceName: serviceName || "Commission",
      clientId: clientId || userId,
      clientName: clientName || "Studio Client",
    });

    // Persist folder structure to Firestore order document
    try {
      const db = adminDb();
      if (db) {
        await db.collection("orders").doc(orderId).set(
          {
            driveFolderId: structure.orderFolderId,
            driveFolderPath: `Clients/${structure.clientFolderName}/${structure.orderFolderName}`,
            driveFolderLink: structure.orderFolderLink,
            driveSubfolders: structure.subfolders,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (e) {
      console.warn("[API/drive/folders] Firestore write fallback:", e);
    }

    // Update in-memory OrdersStore if present
    try {
      const existing = OrdersStore.findById(orderId);
      if (existing) {
        existing.driveFolderId = structure.orderFolderId;
        existing.driveFolderPath = `Clients/${structure.clientFolderName}/${structure.orderFolderName}`;
        (existing as any).driveFolderLink = structure.orderFolderLink;
        (existing as any).driveSubfolders = structure.subfolders;
        existing.updatedAt = new Date().toISOString();
      }
    } catch {
      // Ignored
    }

    return NextResponse.json({
      success: true,
      folders: structure,
    });
  } catch (error: any) {
    console.error("[API/drive/folders] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to setup Drive folders" },
      { status: 500 }
    );
  }
}
