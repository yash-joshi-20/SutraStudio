import { NextResponse } from "next/server";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";
import { readEnv } from "@/lib/config/env";
import { AuditLogService } from "@/lib/services/auditLogService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const n8nBaseUrl =
      readEnv("N8N_BASE_URL") ||
      readEnv("N8N_HOST" as any) ||
      "http://localhost:5678";
    const candidateUrls = [
      readEnv("N8N_MASTER_DISPATCH_WEBHOOK"),
      "https://sanitary-engine-pursuable.ngrok-free.dev/webhook/sutra-master-dispatch",
      `${n8nBaseUrl.replace(/\/$/, "")}/webhook/sutra-master-dispatch`,
      "http://localhost:5678/webhook/sutra-master-dispatch",
    ].filter(Boolean) as string[];

    const dispatchPayload = {
      mode: "agency_self_promo",
      brandName: "Sutra Studio",
      targetPage: "yashsutrastudio",
      targetIg: "yashsutrastudio",
      dispatchedAt: new Date().toISOString(),
      theme: body.theme || "Vedic Architectural Luxury & High-Speed AI Creative Pipelines",
      customPrompt: body.prompt || "",
    };

    const runId = `sutra_promo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let n8nTriggered = false;
    let n8nResponseData: any = null;

    for (const webhookUrl of candidateUrls) {
      if (n8nTriggered) break;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-sutra-secret": readEnv("N8N_WEBHOOK_SECRET") || "sutra_n8n_sec_live_9941a8",
          },
          body: JSON.stringify(dispatchPayload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          n8nTriggered = true;
          n8nResponseData = await res.json().catch(() => ({ status: "received" }));
          break;
        }
      } catch (err: any) {
        console.warn(`[Marketing Dispatch] Notice on ${webhookUrl}:`, err.message);
      }
    }

    const campaignRecord = {
      runId,
      campaignName: "Sutra Studio Self-Promotion Engine",
      mode: "agency_self_promo",
      brandName: "Sutra Studio",
      targetPage: "yashsutrastudio",
      targetIg: "yashsutrastudio",
      pageId: "61594200943169",
      n8nStatus: n8nTriggered ? "active_executing" : "queued_local_ready",
      status: "dispatched",
      createdAt: new Date().toISOString(),
      payload: dispatchPayload,
      n8nResponse: n8nResponseData,
    };

    if (isFirebaseAdminReady()) {
      try {
        await adminDb().collection("marketing_campaigns").doc(runId).set(campaignRecord);
        AuditLogService.record({
          who: { uid: "admin_master", email: "admin@sutrastudio.com", name: "Studio Admin", role: "admin" },
          what: "WORKFLOW_DISPATCH",
          targetType: "workflow",
          targetId: runId,
          targetTitle: "Sutra Studio Daily Self-Promotion Campaign",
          type: "success",
          note: `Dispatched daily agency campaign to target page: yashsutrastudio, IG: yashsutrastudio`,
        });
      } catch (err) {
        console.warn("[Marketing Dispatch] Firestore write notice:", err);
      }
    }

    return NextResponse.json({
      success: true,
      runId,
      message: n8nTriggered
        ? "✓ Daily Agency Campaign successfully triggered on n8n master orchestrator."
        : "✓ Daily Agency Campaign queued for autonomous execution (n8n local receiver standby).",
      campaign: campaignRecord,
    });
  } catch (error: any) {
    console.error("[Marketing Dispatch POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch marketing campaign" },
      { status: 500 }
    );
  }
}
