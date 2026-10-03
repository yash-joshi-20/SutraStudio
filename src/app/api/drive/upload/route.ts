import { NextResponse } from "next/server";
import { uploadFileToDrive } from "@/lib/services/googleDriveService";
import { adminDb } from "@/lib/firebase/admin";
import { OrdersStore } from "@/lib/services/ordersStore";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") || "usr_mock_001";
    const userRole = (req.headers.get("x-user-role") || "client") as "client" | "admin" | "producer";

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const orderId = formData.get("orderId") as string;
    const category = (formData.get("category") as string || "client_assets") as
      | "client_assets"
      | "drafts"
      | "final_delivery"
      | "revisions";
    const subfolderId = formData.get("folderId") as string || `drive_fld_${orderId}_${category}`;
    const version = Number(formData.get("version")) || 1;
    const notes = (formData.get("notes") as string) || "";
    const uploaderName = (formData.get("uploaderName") as string) || (userRole === "admin" ? "Studio Producer" : "Studio Client");

    if (!file || !orderId) {
      return NextResponse.json(
        { error: "Missing required file or orderId" },
        { status: 400 }
      );
    }

    // Role check: Only admin/producer can upload to drafts, revisions, final_delivery
    if (category !== "client_assets" && userRole === "client") {
      return NextResponse.json(
        { error: "Clients are only authorized to upload into Client Assets" },
        { status: 403 }
      );
    }

    // 500MB size limit check
    const MAX_SIZE = 500 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 500MB limit. Please provide a Google Drive share link for ultra-large raw captures." },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Drive Subfolder
    const driveResult = await uploadFileToDrive({
      folderId: subfolderId,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      buffer,
      subfolderCategory: category,
      uploadedBy: {
        uid: userId,
        name: uploaderName,
        role: userRole,
      },
      version,
      notes,
    });

    // Update Firestore Order Document
    try {
      const db = adminDb();
      if (db) {
        const orderRef = db.collection("orders").doc(orderId);
        const orderSnap = await orderRef.get();

        if (orderSnap.exists) {
          const currentData = orderSnap.data() || {};

          if (category === "client_assets") {
            const currentAttachments = Array.isArray(currentData.attachments) ? currentData.attachments : [];
            const newAttachment = {
              name: driveResult.name,
              size: `${(driveResult.size / (1024 * 1024)).toFixed(1)} MB`,
              type: driveResult.mimeType,
              driveFileId: driveResult.id,
              driveFolderId: subfolderId,
              link: driveResult.webViewLink,
              uploadedAt: driveResult.uploadedAt,
            };
            await orderRef.update({
              attachments: [...currentAttachments, newAttachment],
              updatedAt: new Date().toISOString(),
            });
          } else {
            // Admin Deliverable (draft, revision, or final)
            const currentDeliverables = Array.isArray(currentData.deliverables) ? currentData.deliverables : [];
            const newDeliverable = {
              filename: driveResult.name,
              fileSize: `${(driveResult.size / (1024 * 1024)).toFixed(1)} MB`,
              mimeType: driveResult.mimeType,
              driveFileId: driveResult.id,
              driveFolderId: subfolderId,
              previewUrl: driveResult.webViewLink,
              category,
              version,
              notes,
              deliveredAt: driveResult.uploadedAt,
              uploadedBy: driveResult.uploadedBy,
            };

            const updates: any = {
              deliverables: [...currentDeliverables, newDeliverable],
              updatedAt: new Date().toISOString(),
            };

            if (category === "final_delivery") {
              updates.status = "delivered";
              updates.statusLabel = "Delivered — Awaiting Client Review";
              updates.deliveredAt = driveResult.uploadedAt;
            }

            await orderRef.update(updates);
          }
        }
      }
    } catch (dbErr) {
      console.warn("[API/drive/upload] Firestore record sync fallback:", dbErr);
    }

    // Also sync to in-memory OrdersStore
    try {
      if (category !== "client_assets") {
        OrdersStore.deliverOrder({
          orderId,
          deliverables: [
            {
              filename: driveResult.name,
              previewUrl: driveResult.webViewLink,
              fileSize: `${(driveResult.size / (1024 * 1024)).toFixed(1)} MB`,
              mimeType: driveResult.mimeType,
              driveFileId: driveResult.id,
            },
          ],
          deliveryNote: notes || `Deliverable uploaded to ${category}`,
          adminName: uploaderName,
        });
      }
    } catch {
      // Ignored
    }

    return NextResponse.json({
      success: true,
      file: driveResult,
    });
  } catch (error: any) {
    console.error("[API/drive/upload] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file to studio vault" },
      { status: 500 }
    );
  }
}
