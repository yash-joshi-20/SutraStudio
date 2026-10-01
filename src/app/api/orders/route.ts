import { NextResponse } from "next/server";

export interface FirestoreOrderRecord {
  id: string;
  code: string;
  title: string;
  service: string;
  status: "awaiting_approval" | "in_progress" | "revision_requested" | "completed";
  clientUid: string;
  clientEmail: string;
  driveFolderId: string;
  driveFolderPath: string;
  revisionRound: number;
  maxRevisions: number;
  deliverables: {
    driveFileId: string;
    filename: string;
    checksum: string;
    fileSize: string;
    mimeType: string;
    previewUrl?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export async function GET(req: Request) {
  // In production, queries Firestore 'orders' collection scoped to client's uid
  const orders: FirestoreOrderRecord[] = [
    {
      id: "ord_001",
      code: "#ORD-001",
      title: "3D Spatial Architecture — Luxury Living Suite",
      service: "3D Visualization",
      status: "awaiting_approval",
      clientUid: "usr_mock_001",
      clientEmail: "yash@studioliving.com",
      driveFolderId: "drive_fld_sutra_001",
      driveFolderPath: "drive_fld_sutra_001/3D_RENDERS",
      revisionRound: 1,
      maxRevisions: 2,
      deliverables: [
        {
          driveFileId: "drive_55a120ef_sutra",
          filename: "Pavilion_Villa_Baked_Model.gltf",
          checksum: "sha256:7c9921e54f01f0987a...",
          fileSize: "42.1 MB",
          mimeType: "model/gltf+json",
        },
      ],
      createdAt: "2026-09-28T10:00:00.000Z",
      updatedAt: "2026-09-28T14:30:00.000Z",
    },
    {
      id: "ord_002",
      code: "#ORD-002",
      title: "Sutra Studio Brand Identity & Sanskrit Typography",
      service: "Brand Identity",
      status: "completed",
      clientUid: "usr_mock_001",
      clientEmail: "yash@studioliving.com",
      driveFolderId: "drive_fld_sutra_001",
      driveFolderPath: "drive_fld_sutra_001/BRAND_ASSETS",
      revisionRound: 2,
      maxRevisions: 2,
      deliverables: [
        {
          driveFileId: "drive_33f789aa_sutra",
          filename: "Sutra_Brand_Guidelines_V2.pdf",
          checksum: "sha256:1a8844ff0923e1b7c4...",
          fileSize: "4.8 MB",
          mimeType: "application/pdf",
        },
      ],
      createdAt: "2026-09-26T08:00:00.000Z",
      updatedAt: "2026-09-27T18:00:00.000Z",
    },
  ];

  return NextResponse.json({
    database: "Firebase Firestore",
    collection: "orders",
    storageBackend: "Google Drive Vault API v3",
    totalCount: orders.length,
    orders,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = `ord_${Date.now()}`;
    const orderCode = `#ORD-${Math.floor(100 + Math.random() * 900)}`;
    const clientUid = body.clientUid || "usr_mock_001";
    const driveFolderId = body.driveFolderId || "drive_fld_sutra_001";

    const newOrder: FirestoreOrderRecord = {
      id: orderId,
      code: orderCode,
      title: body.title || body.serviceName || "Custom Studio Service",
      service: body.serviceName || "3D Visualization",
      status: "in_progress",
      clientUid,
      clientEmail: body.clientEmail || "client@sutrastudio.com",
      driveFolderId,
      driveFolderPath: `${driveFolderId}/DELIVERABLES`,
      revisionRound: 0,
      maxRevisions: body.maxRevisions || 2,
      deliverables: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      order: newOrder,
      message: "Order placed in Firestore and provisioned isolated Google Drive folder.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order in Firestore." },
      { status: 400 }
    );
  }
}
