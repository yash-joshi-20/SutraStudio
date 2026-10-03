import { NextResponse } from "next/server";
import { archiveOrderFolder } from "@/lib/services/googleDriveService";
import { adminDb } from "@/lib/firebase/admin";
import { requestRole } from "@/lib/auth/requestRole";

export async function POST(req: Request) {
  try {
    const userRole = await requestRole(req);
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin clearance required." }, { status: 403 });
    }

    const { folderId, orderId } = await req.json();

    if (!folderId && !orderId) {
      return NextResponse.json({ error: "Missing folderId or orderId" }, { status: 400 });
    }

    let targetFolderId = folderId;

    // Look up folder ID from order if only orderId passed
    if (!targetFolderId && orderId) {
      try {
        const db = adminDb();
        if (db) {
          const doc = await db.collection("orders").doc(orderId).get();
          if (doc.exists) {
            targetFolderId = doc.data()?.driveFolderId;
          }
        }
      } catch (e) {
        console.warn("[API/drive/archive] Order lookup error:", e);
      }
    }

    if (!targetFolderId) {
      targetFolderId = `drive_fld_${orderId}`;
    }

    const result = await archiveOrderFolder(targetFolderId);

    // Update Firestore order record if orderId provided
    if (orderId) {
      try {
        const db = adminDb();
        if (db) {
          await db.collection("orders").doc(orderId).update({
            driveStatus: "archived",
            archivedAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn("[API/drive/archive] Firestore update error:", e);
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to archive folder" },
      { status: 500 }
    );
  }
}
