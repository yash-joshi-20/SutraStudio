import { NextResponse } from "next/server";
import { assertUserSession } from "@/lib/auth/requestRole";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";

export interface StudioFileRecord {
  id: string;
  client_id: string;
  name: string;
  driveFileId?: string;
  size?: number;
  mimeType?: string;
  folder?: string;
  created_at: string;
  updated_at: string;
}

const IN_MEMORY_FILES: StudioFileRecord[] = [];

export async function GET(req: Request) {
  const gate = await assertUserSession(req);
  if (!gate.authorized) return gate.response;
  const { user } = gate;

  const url = new URL(req.url);
  const requestedClientId = url.searchParams.get("client_id");

  // Multi-tenant isolation: non-admin callers can ONLY view their own files
  if (!user.isAdmin && requestedClientId && requestedClientId !== user.uid) {
    return NextResponse.json(
      { error: "Forbidden: Cannot access files belonging to another client account." },
      { status: 403 }
    );
  }

  const effectiveClientId = user.isAdmin ? (requestedClientId || undefined) : user.uid;

  let fileList: StudioFileRecord[] = [];

  if (isFirebaseAdminReady()) {
    try {
      let query: FirebaseFirestore.Query = adminDb().collection("files");
      if (effectiveClientId) {
        query = query.where("client_id", "==", effectiveClientId);
      }
      const snap = await query.get();
      fileList = snap.docs.map((d) => d.data() as StudioFileRecord);
    } catch {
      fileList = IN_MEMORY_FILES;
    }
  } else {
    fileList = IN_MEMORY_FILES;
  }

  if (effectiveClientId) {
    fileList = fileList.filter((f) => f.client_id === effectiveClientId);
  }

  return NextResponse.json({ files: fileList });
}

export async function POST(req: Request) {
  const gate = await assertUserSession(req);
  if (!gate.authorized) return gate.response;
  const { user } = gate;

  try {
    const body = await req.json();
    const now = new Date().toISOString();

    // Enforce ownership: non-admin can only create files for themselves
    const clientId = user.isAdmin ? (body.client_id || user.uid) : user.uid;

    const fileRecord: StudioFileRecord = {
      id: body.id || `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      client_id: clientId,
      name: String(body.name || "Untitled File"),
      driveFileId: body.driveFileId ? String(body.driveFileId) : undefined,
      size: typeof body.size === "number" ? body.size : 0,
      mimeType: body.mimeType ? String(body.mimeType) : "application/octet-stream",
      folder: body.folder ? String(body.folder) : "General",
      created_at: now,
      updated_at: now,
    };

    if (isFirebaseAdminReady()) {
      try {
        await adminDb().collection("files").doc(fileRecord.id).set(fileRecord);
      } catch (err) {
        console.warn("[files POST] Firestore write warning:", err);
      }
    }

    IN_MEMORY_FILES.push(fileRecord);
    return NextResponse.json({ success: true, file: fileRecord }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to process file record" }, { status: 400 });
  }
}
