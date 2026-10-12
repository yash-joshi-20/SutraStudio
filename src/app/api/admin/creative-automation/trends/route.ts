import { requireAdmin } from "@/lib/auth/session";
import { badRequest, guarded, ok, sameOrigin } from "@/lib/api/response";
import { executeTrendResearch } from "@/lib/creative-automation/trendResearchEngine";
import { TrendResearchQuery } from "@/lib/creative-automation/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return guarded(async () => {
    await requireAdmin();
    if (!sameOrigin(req)) return badRequest("Cross-origin request blocked.");

    const body = (await req.json().catch(() => ({}))) as Partial<TrendResearchQuery>;
    const query: TrendResearchQuery = {
      industry: body.industry || "Creative Technology",
      targetAudience: body.targetAudience || "Design Directors and Agency Founders",
      region: body.region || "India",
      language: body.language || "English",
      platform: body.platform || "instagram_reels",
      campaignObjective: body.campaignObjective || "brand_awareness",
      dateRange: body.dateRange || "Last 30 Days",
    };

    const results = await executeTrendResearch(query);
    return ok(results);
  });
}
