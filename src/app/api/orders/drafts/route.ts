import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requestRole, requestUid } from "@/lib/auth/requestRole";

export interface OrderDraftData {
  id?: string;
  clientUid: string;
  orderType: "service" | "monthly_plan";
  selectedServices: Record<string, number>;
  selectedPlanId: string;
  billingCycle: "monthly" | "quarterly" | "annual";
  commissionTitle: string;
  requirements: string;
  briefAnswers: Record<string, any>;
  preferredTimeline: string;
  targetKickoffDate: string;
  clientContact: {
    name: string;
    email: string;
    phone: string;
  };
  driveLink: string;
  uploadedFiles: { name: string; size: string }[];
  currentStep?: number;
  updatedAt: string;
}

// In-memory fallback for local dev / demo mode
const IN_MEMORY_DRAFTS: Record<string, OrderDraftData> = {};

/**
 * The draft is keyed by uid. Only an authenticated admin may point the
 * request at a *different* uid (`?clientUid=` / `body.clientUid`); a client
 * always reads and writes their own. Without this, any signed-in account
 * could open someone else's half-finished order brief.
 */
async function resolveTargetUid(
  req: Request,
  requested: string | null | undefined
): Promise<string | null> {
  const uid = await requestUid(req);
  if (!uid) return null;
  if (requested && (await requestRole(req)) === "admin") return requested;
  return uid;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const clientUid = await resolveTargetUid(req, url.searchParams.get("clientUid"));
    if (!clientUid) {
      return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    }

    // Try Firestore first if available
    try {
      const db = adminDb();
      if (db) {
        const docRef = db.collection("order_drafts").doc(clientUid);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          return NextResponse.json({
            success: true,
            draft: docSnap.data() as OrderDraftData,
          });
        }
      }
    } catch (dbErr) {
      console.warn("[Drafts API] Firestore read fallback:", dbErr);
    }

    const draft = IN_MEMORY_DRAFTS[clientUid];
    if (draft) {
      return NextResponse.json({
        success: true,
        draft,
      });
    }

    return NextResponse.json({
      success: true,
      draft: null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch order draft." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const clientUid = await resolveTargetUid(req, body.clientUid);
    if (!clientUid) {
      return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    }

    const now = new Date().toISOString();

    const draftData: OrderDraftData = {
      clientUid,
      orderType: body.orderType === "monthly_plan" ? "monthly_plan" : "service",
      selectedServices: body.selectedServices || {},
      selectedPlanId: body.selectedPlanId || "studio-growth",
      billingCycle: body.billingCycle || "monthly",
      commissionTitle: body.commissionTitle || "",
      requirements: body.requirements || "",
      briefAnswers: body.briefAnswers || {},
      preferredTimeline: body.preferredTimeline || "Standard Studio SLA (48-72h)",
      targetKickoffDate: body.targetKickoffDate || "",
      clientContact: {
        name: body.clientContact?.name || "Studio Client",
        email: body.clientContact?.email || "client@sutrastudio.com",
        phone: body.clientContact?.phone || "",
      },
      driveLink: body.driveLink || "",
      uploadedFiles: Array.isArray(body.uploadedFiles) ? body.uploadedFiles : [],
      currentStep: typeof body.currentStep === "number" ? body.currentStep : 1,
      updatedAt: now,
    };

    // Save to Firestore if available
    try {
      const db = adminDb();
      if (db) {
        await db.collection("order_drafts").doc(clientUid).set(draftData);
      }
    } catch (dbErr) {
      console.warn("[Drafts API] Firestore write fallback:", dbErr);
    }

    IN_MEMORY_DRAFTS[clientUid] = draftData;

    return NextResponse.json({
      success: true,
      draft: draftData,
      message: "Order draft automatically saved.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save order draft." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const clientUid = await resolveTargetUid(req, url.searchParams.get("clientUid"));
    if (!clientUid) {
      return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    }

    try {
      const db = adminDb();
      if (db) {
        // delete / clean up
      }
    } catch (dbErr) {
      console.warn("[Drafts API] Firestore delete fallback:", dbErr);
    }

    delete IN_MEMORY_DRAFTS[clientUid];

    return NextResponse.json({
      success: true,
      message: "Order draft cleared.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete order draft." },
      { status: 500 }
    );
  }
}
