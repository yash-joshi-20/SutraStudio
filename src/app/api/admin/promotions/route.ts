import { NextResponse } from "next/server";
import { adminDb, isFirebaseAdminReady } from "@/lib/db";
import { assertAdminSession } from "@/lib/auth/requestRole";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PROMOTIONS_FILE_PATH = path.join(DATA_DIR, "sutra_promotions.json");

function readDiskPromotions(): any[] {
  try {
    if (fs.existsSync(PROMOTIONS_FILE_PATH)) {
      const raw = fs.readFileSync(PROMOTIONS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.warn("[Promotions Storage] Error reading disk file:", e);
  }
  return [];
}

function writeDiskPromotions(list: any[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PROMOTIONS_FILE_PATH, JSON.stringify(list, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.warn("[Promotions Storage] Error writing disk file:", e);
    return false;
  }
}

// GET: List all saved studio self-promotions
export async function GET(req: Request) {
  const sessionCheck = await assertAdminSession(req);
  if (!sessionCheck.authorized) {
    return sessionCheck.response;
  }

  let promotions: any[] = [];

  if (isFirebaseAdminReady()) {
    try {
      const db = adminDb();
      const snap = await db.collection("crm_promotions").orderBy("createdAt", "desc").limit(50).get();
      promotions = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn("[Promotions API] Firestore read failed, reading disk cache:", e);
      promotions = readDiskPromotions();
    }
  } else {
    promotions = readDiskPromotions();
  }

  return NextResponse.json({
    success: true,
    promotions,
    total: promotions.length,
  });
}

// POST: Save a generated promotion to the studio archive
export async function POST(req: Request) {
  const sessionCheck = await assertAdminSession(req);
  if (!sessionCheck.authorized) {
    return sessionCheck.response;
  }

  try {
    const promotion = await req.json();
    if (!promotion || !promotion.title) {
      return NextResponse.json({ error: "Invalid promotion payload." }, { status: 400 });
    }

    const promoId = promotion.id || `promo_${Date.now()}`;
    const payload = {
      ...promotion,
      id: promoId,
      updatedAt: new Date().toISOString(),
    };

    // Save to disk cache
    const existing = readDiskPromotions();
    const updated = [payload, ...existing.filter((p: any) => p.id !== promoId)];
    writeDiskPromotions(updated);

    // Save to Firestore if available
    if (isFirebaseAdminReady()) {
      try {
        const db = adminDb();
        await db.collection("crm_promotions").doc(promoId).set(payload, { merge: true });
      } catch (e) {
        console.warn("[Promotions API] Firestore write failed, persisted to disk only:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Promotion saved to Studio Promotion Library.",
      promotion: payload,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to save promotion: ${error?.message || error}` },
      { status: 500 }
    );
  }
}

// DELETE: Remove a promotion from the studio archive
export async function DELETE(req: Request) {
  const sessionCheck = await assertAdminSession(req);
  if (!sessionCheck.authorized) {
    return sessionCheck.response;
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing promotion id." }, { status: 400 });
    }

    const existing = readDiskPromotions();
    const filtered = existing.filter((p: any) => p.id !== id);
    writeDiskPromotions(filtered);

    if (isFirebaseAdminReady()) {
      try {
        const db = adminDb();
        await db.collection("crm_promotions").doc(id).delete();
      } catch (e) {
        console.warn("[Promotions API] Firestore delete failed:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Promotion removed from library.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to delete promotion: ${error?.message || error}` },
      { status: 500 }
    );
  }
}
