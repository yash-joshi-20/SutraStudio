import { requireAdmin } from "@/lib/auth/session";
import { guarded, ok } from "@/lib/api/response";
import { getLiveCapabilityRegistry } from "@/lib/creative-automation/capabilityRegistry";

export const dynamic = "force-dynamic";

export async function GET() {
  return guarded(async () => {
    await requireAdmin();
    const capabilities = getLiveCapabilityRegistry();
    return ok({
      capabilities,
      totalCount: capabilities.length,
      configuredCount: capabilities.filter((c) => c.installedStatus === "installed" || c.installedStatus === "configured_api" || c.installedStatus === "adapter_ready").length,
      missingKeyCount: capabilities.filter((c) => c.installedStatus === "missing_key").length,
    });
  });
}
