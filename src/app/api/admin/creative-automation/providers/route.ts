import { requireAdmin } from "@/lib/auth/session";
import { guarded, ok } from "@/lib/api/response";
import {
  ALL_PROVIDER_ADAPTERS,
  selectBestProviderAdapter,
  ProviderTask,
  AIProviderAdapter,
} from "@/lib/creative-automation/providerAdapters";
import { CapabilityType } from "@/lib/creative-automation/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return guarded(async () => {
    await requireAdmin();

    const providerSummaries = ALL_PROVIDER_ADAPTERS.map((adapter: AIProviderAdapter) => ({
      providerId: adapter.providerId,
      name: adapter.name,
      description: adapter.description,
      capabilities: adapter.capabilities,
      isAvailable: adapter.isAvailable(),
      costEstimate: adapter.estimateCost({ type: "image_generation", prompt: "test" }),
      missingKeyNotice: typeof adapter.getMissingKeyNotice === "function" ? adapter.getMissingKeyNotice() : null,
    }));

    return ok({
      totalCount: providerSummaries.length,
      availableCount: providerSummaries.filter((p) => p.isAvailable).length,
      missingKeyCount: providerSummaries.filter((p) => !p.isAvailable).length,
      providers: providerSummaries,
    });
  });
}


export async function POST(req: Request) {
  return guarded(async () => {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const { taskType, prompt, aspectRatio } = body;

    const task: ProviderTask = {
      type: (taskType || "image_generation") as CapabilityType,
      prompt: prompt || "A luxury architectural sanctuary in Rajasthan, warm sandstone",
      aspectRatio: aspectRatio || "16/9",
    };

    const { primary, fallbacks } = selectBestProviderAdapter(task);

    return ok({
      task,
      selectedPrimary: {
        providerId: primary.providerId,
        name: primary.name,
        isAvailable: primary.isAvailable(),
        missingKeyNotice: typeof primary.getMissingKeyNotice === "function" ? primary.getMissingKeyNotice() : null,
      },

      fallbackOptions: fallbacks.map((f) => ({
        providerId: f.providerId,
        name: f.name,
        isAvailable: f.isAvailable(),
      })),
    });
  });
}
