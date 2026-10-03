/**
 * POST /api/account/orders/repeat
 *
 * "Order again" — copies service, brief, brand kit and asset references from a
 * past order into a NEW EDITABLE DRAFT.
 *
 * Guarantees:
 *  • The source order must belong to the caller (checked by uid, not by input).
 *  • The new price is recomputed server-side from the catalog. Any amount in
 *    the request body is ignored.
 *  • Nothing is charged. The draft only becomes payable when the client
 *    confirms it from the New Order wizard.
 */

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { badRequest, guarded, notFound, ok, sameOrigin } from "@/lib/api/response";
import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import { toIso } from "@/lib/firebase/db";
import { quoteOrder } from "@/lib/services/pricing";

export const dynamic = "force-dynamic";

const DRAFTS = "orderDrafts";

export interface RepeatResult {
  draftId: string;
  serviceId: string;
  brandKitId: string;
  quote: Awaited<ReturnType<typeof quoteOrder>>;
  copiedAssetCount: number;
  carriedFields: string[];
}

export async function POST(req: Request) {
  return guarded(async () => {
    const session = await requireUser();
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    const body = (await req.json().catch(() => ({}))) as {
      orderId?: string;
      overrides?: Record<string, unknown>;
    };

    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    if (!orderId) return badRequest("Which order would you like to repeat?");

    // Ownership is enforced by the query, not by a field in the body.
    const orderSnap = await adminDb()
      .collection("orders")
      .where("clientId", "==", session.uid)
      .where("__name__", "==", orderId)
      .limit(1)
      .get();

    const orderDoc = orderSnap.docs[0];
    if (!orderDoc) {
      return notFound("That order was not found in your account.");
    }

    const order = orderDoc.data() as Record<string, unknown>;
    const serviceId = String(order.serviceId ?? order.service ?? "");
    if (!serviceId) {
      return badRequest("That order cannot be repeated automatically. Please start a new order.");
    }

    /* ---------------- brand kit: reuse the original, else the default ------------- */
    const originalKitId = String(order.brandKitId ?? "");
    let brandKitId = originalKitId;
    let brandKit: Record<string, unknown> = {};

    if (brandKitId) {
      const kitSnap = await adminDb().collection("brandKits").doc(brandKitId).get();
      if (kitSnap.exists && kitSnap.data()?.clientId === session.uid) {
        brandKit = kitSnap.data() as Record<string, unknown>;
      } else {
        brandKitId = "";
      }
    }
    if (!brandKitId) {
      const profileSnap = await adminDb().collection("users").doc(session.uid).get();
      const profileKitId = String(profileSnap.data()?.defaultBrandKitId ?? "");
      if (profileKitId) {
        const kitSnap = await adminDb().collection("brandKits").doc(profileKitId).get();
        if (kitSnap.exists && kitSnap.data()?.clientId === session.uid) {
          brandKitId = profileKitId;
          brandKit = kitSnap.data() as Record<string, unknown>;
        }
      }
    }

    /* ---------------- carried brief fields ---------------- */
    const brief = (order.brief as Record<string, unknown>) ?? {};
    const overrides = (body.overrides ?? {}) as Record<string, unknown>;

    const carriedFields: string[] = [];
    const newBrief: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(brief)) {
      if (k === "__name__" || k === "createdAt") continue;
      if (typeof v === "string" && v.length > 4000) continue;
      newBrief[k] = v;
      carriedFields.push(k);
    }
    // Client-supplied overrides win for the draft, but the price never does.
    const quantityOverride = Number(overrides.quantity ?? 0);
    const formatOverride = Number(overrides.formatCount ?? 0);
    const revisionOverride = Number(overrides.revisions ?? -1);

    const quantity = Number.isFinite(quantityOverride) && quantityOverride > 0
      ? Math.floor(quantityOverride)
      : Number(order.quantity ?? 1) || 1;
    const formatCount = Number.isFinite(formatOverride) && formatOverride > 0
      ? Math.floor(formatOverride)
      : Number(order.formatCount ?? 1) || 1;
    const revisions = revisionOverride >= 0 ? revisionOverride : Number(order.revisions ?? 0) || 0;

    /* ---------------- assets: reference, never re-upload ------------- */
    const sourceAssets = Array.isArray(order.assetFileIds) ? (order.assetFileIds as string[]) : [];
    const assetFileIds = sourceAssets.slice(0, 50);

    /* ---------------- server-side repricing ------------- */
    const gstEnabled = await isGstEnabled();
    const quote = await quoteOrder({
      serviceId,
      quantity,
      formatCount,
      revisions,
      addVideo: order.addVideo === true,
      add3d: order.add3d === true,
      add360: order.add360 === true,
      priority: order.priority === "rush" ? "rush" : "standard",
      gstEnabled,
    });

    if (!quote) {
      return badRequest("That service is no longer available. Please choose another service.");
    }

    /* ---------------- write the draft ------------- */
    const ref = adminDb().collection(DRAFTS).doc();
    const draft = {
      clientId: session.uid,
      sourceOrderId: orderId,
      serviceId,
      brandKitId,
      brief: newBrief,
      assetFileIds,
      quantity,
      formatCount,
      revisions,
      status: "draft" as const,
      isRepeat: true,
      // Priced by the server. The client cannot alter these fields.
      quote: {
        baseRupees: quote.baseRupees,
        subtotalRupees: quote.subtotalRupees,
        gstPercent: quote.gstPercent,
        gstRupees: quote.gstRupees,
        totalRupees: quote.totalRupees,
        totalPaise: quote.totalPaise,
        breakdown: quote.breakdown,
        quotedAt: new Date().toISOString(),
      },
      clientContextSnapshot: {
        companyName: brandKit.companyName ?? "",
        industry: brandKit.industry ?? "",
        tone: brandKit.tone ?? "",
        colors: brandKit.colors ?? [],
        language: brandKit.language ?? "en",
      },
      charged: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await ref.set(draft);

    const result: RepeatResult = {
      draftId: ref.id,
      serviceId,
      brandKitId,
      quote,
      copiedAssetCount: assetFileIds.length,
      carriedFields,
    };

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  });
}

/** GET — lists the caller's saved repeat drafts so the wizard can resume. */
export async function GET() {
  return guarded(async () => {
    const session = await requireUser();
    const snap = await adminDb()
      .collection(DRAFTS)
      .where("clientId", "==", session.uid)
      .where("status", "==", "draft")
      .orderBy("createdAt", "desc")
      .limit(25)
      .get();

    return ok({
      drafts: snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: toIso(d.data().createdAt),
        updatedAt: toIso(d.data().updatedAt),
      })),
    });
  });
}

async function isGstEnabled(): Promise<boolean> {
  try {
    const snap = await adminDb().collection("studio_config").doc("gst").get();
    return snap.exists ? Boolean(snap.data()?.enabled) : false;
  } catch {
    return false;
  }
}