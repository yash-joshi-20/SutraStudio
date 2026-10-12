# Trend Research & Marketing Intelligence Engine
**Document:** `docs/ai-creative-automation/TREND_RESEARCH.md`  
**Version:** 2.4.0

---

## 1. Engine Specifications

The Trend Research Engine conducts structured topic inquiries without hallucinating traffic figures or engagement metrics.

### Input Parameters (`TrendResearchQuery`)
- `industry: string` (e.g., Creative Technology, Spatial Architecture, Luxury Living)
- `targetAudience: string` (e.g., Agency Founders, Design Directors, Modern Developers)
- `region: string` (e.g., India, Global, North America)
- `language: string` (Default: English)
- `platform: string` (`instagram_reels`, `youtube_shorts`, `linkedin`, `meta_ads`)
- `campaignObjective: string` (`brand_awareness`, `lead_generation`, `service_launch`)
- `dateRange: string` (e.g., Last 30 Days)

---

## 2. Output Schema (`TrendObservation`)

Every observation distinguishes between verified market observations and AI topic suggestions:
- `source: "verified_market_data" | "ai_topic_synthesis"`
- `relevanceScore: number` (0 to 100)
- `trendVelocity: "rising" | "peak" | "evergreen"`
- `suggestedHooks: string[]` — 2 to 3 scroll-stopping openers.
- `recommendedFormats: CreativeCategory[]` — Optimal aspect ratio and video category.
- `scriptOutline: { hook, point1, point2, callToAction }` — Concrete screenplay skeleton.
- `targetKeywords: string[]` — Matching keywords from the Keyword Library.
- `proposedPublishingWindow: string` — Scheduled calendar window.
