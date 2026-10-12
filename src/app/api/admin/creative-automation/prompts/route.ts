import { requireAdmin } from "@/lib/auth/session";
import { badRequest, guarded, ok, sameOrigin } from "@/lib/api/response";
import { MASTER_PROMPT_LIBRARY } from "@/lib/creative-automation/promptLibrary";
import { MasterPromptTemplate } from "@/lib/creative-automation/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return guarded(async () => {
    await requireAdmin();
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    let items = MASTER_PROMPT_LIBRARY;
    if (category) {
      items = items.filter((p) => p.category === category);
    }

    return ok({
      prompts: items,
      totalCount: items.length,
    });
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    await requireAdmin();
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    const body = (await req.json().catch(() => ({}))) as Partial<MasterPromptTemplate>;
    if (!body.title || !body.promptTemplate) {
      return badRequest("Missing title or promptTemplate.");
    }

    const newTemplate: MasterPromptTemplate = {
      id: body.id || `prompt-custom-${Date.now().toString(36)}`,
      version: body.version || "1.0.0",
      title: body.title,
      category: body.category || "educational_reels",
      subCategory: body.subCategory || "Custom",
      intendedAudience: body.intendedAudience || "General creative audience",
      requiredInputs: body.requiredInputs || [],
      researchInstructions: body.researchInstructions || "Standard verification",
      promptTemplate: body.promptTemplate,
      shotAndSceneInstructions: body.shotAndSceneInstructions || [],
      negativeConstraints: body.negativeConstraints || [],
      compatibleCapabilities: body.compatibleCapabilities || ["scriptwriting"],
      outputRequirements: body.outputRequirements || {
        aspectRatio: "9/16",
        fileFormat: "MP4",
        resolution: "1080x1920",
      },
      qualityChecks: body.qualityChecks || [],
      estimatedCost: body.estimatedCost || { minUsd: 0.01, maxUsd: 0.1, unit: "per run" },
      fallbackBehavior: body.fallbackBehavior || "Use local template engine",
      isDefault: false,
      isActive: true,
      updatedAt: new Date().toISOString(),
    };

    return ok({
      message: "Prompt template registered successfully.",
      prompt: newTemplate,
    });
  });
}
