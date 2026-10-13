import { requireAdmin } from "@/lib/auth/session";
import { badRequest, guarded, ok } from "@/lib/api/response";
import {
  CINEMATIC_SHOT_PRESETS,
  getShotPresetsByCategory,
  compileShotPrompt,
} from "@/lib/creative-automation/shotPresets";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return guarded(async () => {
    await requireAdmin();
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const tag = url.searchParams.get("tag");
    const search = url.searchParams.get("search")?.toLowerCase();

    let presets = [...CINEMATIC_SHOT_PRESETS];

    if (category) {
      presets = getShotPresetsByCategory(category);
    }

    if (tag) {
      presets = presets.filter((p) => p.tags.includes(tag));
    }

    if (search) {
      presets = presets.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.purpose.toLowerCase().includes(search) ||
          p.cameraMovement.toLowerCase().includes(search)
      );
    }

    return ok({
      totalCount: presets.length,
      allCount: CINEMATIC_SHOT_PRESETS.length,
      presets,
      categories: [
        { id: "all", label: "All 18 Presets" },
        { id: "architectural", label: "Architecture & Real Estate" },
        { id: "product", label: "Product & Macro" },
        { id: "brand_film", label: "Brand Films & Storytelling" },
        { id: "aerial", label: "Aerial & Drones" },
        { id: "social_motion", label: "Social & Dynamic Motion" },
      ],
    });
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const { presetId, subject, environment, lighting, details } = body;

    const preset = CINEMATIC_SHOT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return badRequest(`Preset '${presetId}' not found.`);

    const compiledPrompt = compileShotPrompt(preset, {
      subject: subject || "architectural pavilion",
      environment: environment || "sunset desert horizon",
      lighting: lighting || preset.lightingAtmosphere || preset.lightingAndAtmosphere,
      details: details || "warm ivory stone, brushed brass accents",
    });


    return ok({
      preset,
      compiledPrompt,
      recommendedAspectRatio: preset.aspectRatio,
      cameraMovement: preset.cameraMovement,
      lensStyle: preset.lensStyleGuidance,
      negativePrompt: preset.negativePrompt,
    });
  });
}
