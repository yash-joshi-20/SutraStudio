import { NextResponse } from "next/server";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";
import { AuditLogService } from "@/lib/services/auditLogService";

export interface DeliverableRecord {
  deliverableId: string;
  orderId: string;
  clientName: string;
  clientEmail: string;
  brandName: string;
  headline: string;
  caption: string;
  imageUrl: string;
  videoUrl?: string;
  voiceoverScript?: string;
  status: "in_admin_review" | "approved" | "released" | "rejected";
  appBaseUrl?: string;
  generatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

// In-memory fallback ledger for zero-setup / offline local dev
const IN_MEMORY_DELIVERABLES: DeliverableRecord[] = [];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");

    let deliverables: DeliverableRecord[] = [];

    if (isFirebaseAdminReady()) {
      try {
        const snap = await adminDb().collection("admin_deliverables").get();
        deliverables = snap.docs.map((d: FirebaseFirestore.QueryDocumentSnapshot) => d.data() as DeliverableRecord);
      } catch (err) {
        console.warn("[deliverables GET] Firestore query fallback:", err);
        deliverables = [...IN_MEMORY_DELIVERABLES];
      }
    } else {
      deliverables = [...IN_MEMORY_DELIVERABLES];
    }

    if (orderId) {
      deliverables = deliverables.filter((d) => d.orderId === orderId);
    }

    deliverables.sort(
      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );

    return NextResponse.json({
      success: true,
      count: deliverables.length,
      deliverables,
    });
  } catch (error: any) {
    console.error("[deliverables GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load deliverables" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    let body = await req.json();
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {}
    }
    const {
      deliverableId,
      orderId,
      clientName,
      clientEmail,
      brandName,
      headline,
      caption,
      imageUrl,
      videoUrl,
      voiceoverScript,
      status = "in_admin_review",
      appBaseUrl,
      generatedAt = new Date().toISOString(),
    } = body;

    if (!deliverableId || !imageUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required deliverableId or imageUrl" },
        { status: 400 }
      );
    }

    const record: DeliverableRecord = {
      deliverableId: String(deliverableId),
      orderId: String(orderId || `ORD-${Date.now().toString().slice(-6)}`),
      clientName: String(clientName || "Sutra Client"),
      clientEmail: String(clientEmail || "client@sutrastudio.com"),
      brandName: String(brandName || "Sutra Luxe"),
      headline: String(headline || "Bespoke Luxury Visual"),
      caption: String(caption || ""),
      imageUrl: String(imageUrl),
      videoUrl: videoUrl ? String(videoUrl) : undefined,
      voiceoverScript: voiceoverScript ? String(voiceoverScript) : undefined,
      status: "in_admin_review",
      appBaseUrl: appBaseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://sutrastudios.in",
      generatedAt: String(generatedAt),
    };

    // 1. Update in-memory
    const existingIdx = IN_MEMORY_DELIVERABLES.findIndex(
      (d) => d.deliverableId === record.deliverableId
    );
    if (existingIdx >= 0) {
      IN_MEMORY_DELIVERABLES[existingIdx] = record;
    } else {
      IN_MEMORY_DELIVERABLES.unshift(record);
    }

    // 2. Persist to Firestore
    if (isFirebaseAdminReady()) {
      try {
        await adminDb().collection("admin_deliverables").doc(record.deliverableId).set(record);

        // Also update matching order in orders collection
        if (record.orderId) {
          try {
            const orderRef = adminDb().collection("orders").doc(record.orderId);
            const orderDoc = await orderRef.get();
            if (orderDoc.exists) {
              const currentOrder = orderDoc.data() || {};
              const existingDeliverables = Array.isArray(currentOrder.deliverables)
                ? currentOrder.deliverables
                : [];

              const updatedDeliverables = [
                ...existingDeliverables,
                {
                  filename: `${record.brandName}_4K_Render.png`,
                  previewUrl: record.imageUrl,
                  downloadUrl: record.imageUrl,
                  fileSize: "18.4 MB",
                  mimeType: "image/png",
                  version: "v1.0",
                  category: "4K Render",
                },
              ];

              if (record.videoUrl) {
                updatedDeliverables.push({
                  filename: `${record.brandName}_Commercial_Reel.mp4`,
                  previewUrl: record.imageUrl,
                  downloadUrl: record.videoUrl,
                  fileSize: "48.2 MB",
                  mimeType: "video/mp4",
                  version: "v1.0",
                  category: "Video Reel",
                });
              }

              await orderRef.update({
                status: "awaiting_approval",
                statusLabel: "Awaiting Client Approval",
                deliverables: updatedDeliverables,
                deliverablePreview: record.headline || "4K Master Render & Motion Reel generated",
                updatedAt: new Date().toISOString(),
              });
            }
          } catch (orderUpdateErr) {
            console.warn("[deliverables POST] Order link warning:", orderUpdateErr);
          }
        }
      } catch (firestoreErr) {
        console.warn("[deliverables POST] Firestore save warning:", firestoreErr);
      }
    }

    AuditLogService.record({
      who: {
        uid: "n8n_engine",
        email: "n8n@sutrastudio.com",
        name: "n8n Local Engine",
        role: "system",
      },
      what: "WORKFLOW_DISPATCH",
      targetType: "order",
      targetId: record.orderId,
      targetTitle: record.headline,
      type: "info",
      note: `Deliverable ${record.deliverableId} received from n8n engine`,
    });

    return NextResponse.json({
      success: true,
      deliverableId: record.deliverableId,
      orderId: record.orderId,
      status: "in_admin_review",
      message: "Deliverable bundle queued for Admin Review on Render",
    });
  } catch (error: any) {
    console.error("[deliverables POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process deliverable" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { deliverableId, action, notes, adminEmail = "yashjoshi20@zohomail.in" } = body;

    if (!deliverableId || !action) {
      return NextResponse.json(
        { success: false, error: "deliverableId and action required" },
        { status: 400 }
      );
    }

    let currentRecord: DeliverableRecord | null = null;

    if (isFirebaseAdminReady()) {
      try {
        const doc = await adminDb().collection("admin_deliverables").doc(deliverableId).get();
        if (doc.exists) currentRecord = doc.data() as DeliverableRecord;
      } catch {}
    }
    if (!currentRecord) {
      currentRecord = IN_MEMORY_DELIVERABLES.find((d) => d.deliverableId === deliverableId) || null;
    }

    if (!currentRecord) {
      return NextResponse.json(
        { success: false, error: "Deliverable not found" },
        { status: 404 }
      );
    }

    const newStatus = action === "approve" ? "released" : "rejected";
    currentRecord.status = newStatus;
    currentRecord.reviewedAt = new Date().toISOString();
    currentRecord.reviewedBy = adminEmail;
    if (notes) currentRecord.notes = notes;

    // Persist status change
    if (isFirebaseAdminReady()) {
      try {
        await adminDb().collection("admin_deliverables").doc(deliverableId).update({
          status: newStatus,
          reviewedAt: currentRecord.reviewedAt,
          reviewedBy: currentRecord.reviewedBy,
          notes: currentRecord.notes,
        });

        if (action === "approve" && currentRecord.orderId) {
          try {
            await adminDb().collection("orders").doc(currentRecord.orderId).update({
              status: "completed",
              statusLabel: "Completed & Released to Vault",
              progress: 100,
              updatedAt: new Date().toISOString(),
            });
          } catch {}
        }
      } catch {}
    }

    const memoryIdx = IN_MEMORY_DELIVERABLES.findIndex((d) => d.deliverableId === deliverableId);
    if (memoryIdx >= 0) {
      IN_MEMORY_DELIVERABLES[memoryIdx] = currentRecord;
    }

    AuditLogService.record({
      who: {
        uid: adminEmail,
        email: adminEmail,
        name: "Studio Admin",
        role: "admin",
      },
      what: action === "approve" ? "ORDER_DELIVERED" : "STATUS_UPDATED",
      targetType: "order",
      targetId: currentRecord.orderId,
      targetTitle: currentRecord.headline,
      type: action === "approve" ? "success" : "warning",
      note:
        action === "approve"
          ? "Deliverable approved and released to Sutra Cloud Vault"
          : "Deliverable rejected by admin",
    });

    return NextResponse.json({
      success: true,
      deliverableId,
      status: newStatus,
      message:
        action === "approve"
          ? "Deliverable approved & released to client Sutra Cloud Vault"
          : "Deliverable rejected",
    });
  } catch (error: any) {
    console.error("[deliverables PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update deliverable" },
      { status: 500 }
    );
  }
}
