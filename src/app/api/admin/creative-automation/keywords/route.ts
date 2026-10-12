import { requireAdmin } from "@/lib/auth/session";
import { badRequest, guarded, ok, sameOrigin } from "@/lib/api/response";
import { CREATIVE_KEYWORD_LIBRARY, queryKeywords } from "@/lib/creative-automation/keywordLibrary";
import { KeywordCategory } from "@/lib/creative-automation/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return guarded(async () => {
    await requireAdmin();
    const url = new URL(req.url);
    const category = url.searchParams.get("category") as KeywordCategory | null;
    const search = url.searchParams.get("q") || undefined;
    const onlyEnabled = url.searchParams.get("enabled") === "true";

    const results = queryKeywords({
      category: category || undefined,
      search,
      onlyEnabled: onlyEnabled ? true : undefined,
    });

    return ok({
      keywords: results,
      totalCount: results.length,
      categories: ["cinematic", "educational_reel", "motion_graphics", "interior_3d", "marketing"],
    });
  });
}

export async function POST(req: Request) {
  return guarded(async () => {
    await requireAdmin();
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    const body = await req.json().catch(() => ({}));
    const { keywordId, isEnabled } = body;

    const target = CREATIVE_KEYWORD_LIBRARY.find((k) => k.id === keywordId);
    if (!target) {
      return badRequest("Keyword not found.");
    }

    if (typeof isEnabled === "boolean") {
      target.isEnabled = isEnabled;
    }

    return ok({
      message: `Keyword '${target.keyword}' updated.`,
      keyword: target,
    });
  });
}
