/**
 * /api/drive/folders
 *
 * GET: Retrieves authenticated client's folder hierarchy (Inputs, Deliverables, Invoices, per-order subfolders).
 * POST: Idempotently provisions client folder or order folder hierarchy.
 *
 * Security:
 * - Multi-tenant isolation: Clients can only access and provision their own folder structure.
 * - Drive links are NEVER exposed to clients (omitted/undefined unless caller is admin).
 */

import { NextResponse } from "next/server";
import {
  provisionClientDriveFolders,
  provisionOrderDriveFolders,
  getClientDriveFolders,
  type ClientFolderStructure,
  type DriveFolderStructure,
} from "@/lib/services/googleDriveService";
import { adminDb } from "@/lib/firebase/admin";
import { OrdersStore } from "@/lib/services/ordersStore";
import { requestRole, requestUid } from "@/lib/auth/requestRole";

export const dynamic = "force-dynamic";

function sanitizeFoldersForClient(folders: ClientFolderStructure | DriveFolderStructure, isAdmin: boolean) {
  if (isAdmin) return folders;

  // Deep clone and strip all drive web links for client privacy
  const sanitized = JSON.parse(JSON.stringify(folders));
  delete sanitized.orderFolderLink;
  delete sanitized.rootFolderId;
  delete sanitized.adminFolderId;

  if (sanitized.subfolders) {
    for (const key of Object.keys(sanitized.subfolders)) {
      if (sanitized.subfolders[key]) {
        delete sanitized.subfolders[key].link;
      }
    }
  }

  if (sanitized.orderFolders) {
    for (const key of Object.keys(sanitized.orderFolders)) {
      if (sanitized.orderFolders[key]) {
        delete sanitized.orderFolders[key].link;
      }
    }
  }

  return sanitized;
}

export async function GET(req: Request) {
  try {
    const userId = await requestUid(req);
    const userRole = await requestRole(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const targetClientId = url.searchParams.get("clientId");
    const isAdmin = userRole === "admin";

    // Non-admins can only request their own folder structure
    const effectiveClientId = isAdmin ? (targetClientId || userId) : userId;

    let folders = await getClientDriveFolders(effectiveClientId);
    if (!folders) {
      folders = await provisionClientDriveFolders({
        clientId: effectiveClientId,
        clientName: "Studio Client",
      });
    }

    return NextResponse.json({
      success: true,
      folders: sanitizeFoldersForClient(folders, isAdmin),
    });
  } catch (error: any) {
    console.error("[API/drive/folders GET] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve Drive folders" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requestUid(req);
    const userRole = await requestRole(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, orderNumber, serviceName, clientId, clientName } = body;
    const isAdmin = userRole === "admin";

    // Security check: Client can only provision folders for their own account
    if (!isAdmin && clientId && clientId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const effectiveClientId = isAdmin ? (clientId || userId) : userId;

    // If orderId is provided: provision order folder hierarchy
    if (orderId) {
      const structure = await provisionOrderDriveFolders({
        orderId,
        orderNumber: orderNumber || orderId.slice(0, 8),
        serviceName: serviceName || "Commission",
        clientId: effectiveClientId,
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
        folders: sanitizeFoldersForClient(structure, isAdmin),
      });
    }

    // Otherwise provision base client folder hierarchy (Inputs, Deliverables, Invoices, Admin)
    const clientStructure = await provisionClientDriveFolders({
      clientId: effectiveClientId,
      clientName: clientName || "Studio Client",
    });

    return NextResponse.json({
      success: true,
      folders: sanitizeFoldersForClient(clientStructure, isAdmin),
    });
  } catch (error: any) {
    console.error("[API/drive/folders] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to setup Drive folders" },
      { status: 500 }
    );
  }
}
