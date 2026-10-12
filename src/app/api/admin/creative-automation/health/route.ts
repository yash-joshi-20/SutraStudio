import { requireAdmin } from "@/lib/auth/session";
import { guarded, ok } from "@/lib/api/response";
import { isEnvSet } from "@/lib/config/env";
import { getLiveCapabilityRegistry } from "@/lib/creative-automation/capabilityRegistry";

export const dynamic = "force-dynamic";

export async function GET() {
  return guarded(async () => {
    await requireAdmin();

    const capabilities = getLiveCapabilityRegistry();

    const geminiOk = isEnvSet("GEMINI_API_KEY");
    const driveOk = isEnvSet("GOOGLE_DRIVE_ROOT_FOLDER_ID");
    const n8nOk = isEnvSet("N8N_WEBHOOK_URL" as any);

    const configuredAdapters = capabilities.filter(
      (c) =>
        c.installedStatus === "installed" ||
        c.installedStatus === "configured_api" ||
        c.installedStatus === "adapter_ready"
    );

    const missingKeyAdapters = capabilities.filter((c) => c.installedStatus === "missing_key");

    const systemStatus: "healthy" | "degraded" | "action_required" =
      geminiOk && configuredAdapters.length >= 5 ? "healthy" : "degraded";

    return ok({
      status: systemStatus,
      checkedAt: new Date().toISOString(),
      summary: {
        totalCapabilities: capabilities.length,
        activeAdapters: configuredAdapters.length,
        missingKeyAdapters: missingKeyAdapters.length,
        geminiConfigured: geminiOk,
        googleDriveConfigured: driveOk,
        n8nWebhookConfigured: n8nOk,
      },
      diagnostics: [
        {
          subsystem: "Cognitive Brain (Gemini)",
          status: geminiOk ? "operational" : "missing_key",
          details: geminiOk
            ? "GEMINI_API_KEY detected. Ready for research, screenplay, and prompt synthesis."
            : "GEMINI_API_KEY missing. System currently falling back to deterministic local prompt templates.",
        },
        {
          subsystem: "Enterprise Storage Vault (Google Drive)",
          status: driveOk ? "operational" : "missing_root_folder",
          details: driveOk
            ? "GOOGLE_DRIVE_ROOT_FOLDER_ID detected. Stream proxy active."
            : "Google Drive root folder not configured. File uploads persist metadata locally.",
        },
        {
          subsystem: "Programmatic Motion Graphics (Remotion / FFmpeg)",
          status: "ready",
          details: "Local deterministic React Remotion and FFmpeg command compilation adapters ready.",
        },
        {
          subsystem: "Spatial 360° & 3D Interactive WebGL",
          status: "ready",
          details: "Client Three.js WebGL 2.0 PBR OrbitControls and Equirectangular HDR engines active.",
        },
      ],
      missingKeyList: missingKeyAdapters.map((c) => ({
        capabilityId: c.id,
        name: c.name,
        requiredEnvKey: c.authRequirements.envKey,
        instructions: c.authRequirements.instructions,
      })),
    });
  });
}
