import { requireAdmin } from "@/lib/auth/session";
import { badRequest, guarded, ok, sameOrigin } from "@/lib/api/response";
import { INITIAL_BRAND_PROFILES } from "@/lib/creative-automation/brandProfiles";
import { BrandProfile } from "@/lib/creative-automation/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return guarded(async () => {
    await requireAdmin();
    return ok({
      brands: INITIAL_BRAND_PROFILES,
      totalCount: INITIAL_BRAND_PROFILES.length,
    });
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    await requireAdmin();
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    const body = (await req.json().catch(() => ({}))) as Partial<BrandProfile>;
    if (!body.brandName || !body.industry) {
      return badRequest("Missing brandName or industry.");
    }

    const newBrand: BrandProfile = {
      id: body.id || `brand-${Date.now().toString(36)}`,
      clientUid: body.clientUid || "client-new",
      brandName: body.brandName,
      tagline: body.tagline || "",
      industry: body.industry,
      region: body.region || "India",
      website: body.website || "",
      targetAudience: body.targetAudience || "",
      productsAndServices: body.productsAndServices || [],
      contentPreferences: body.contentPreferences || {
        voiceTone: "minimal_modern",
        primaryColor: "#171717",
        secondaryColor: "#FAF9F5",
        accentColor: "#A98B57",
        backgroundColor: "#FAF9F5",
        fontFamily: "Inter",
        negativeStyleRules: [],
      },
      referenceAssets: body.referenceAssets || [],
      approvedPromptIds: body.approvedPromptIds || [],
      contentCalendar: body.contentCalendar || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return ok({
      message: "Brand profile saved.",
      brand: newBrand,
    });
  });
}
