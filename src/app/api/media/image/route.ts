import { NextRequest, NextResponse } from "next/server";
import { readEnv } from "@/lib/config/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Resilient Media Proxy for AI & Studio Assets.
 * Prevents broken 503 / "Free limit reached" errors from Pollinations by:
 * 1. Using authenticated Pollinations endpoints with project API key.
 * 2. Validating content-type and HTTP status with a short timeout.
 * 3. Gracefully falling back to high-resolution local studio project assets.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get("prompt") || "luxury modern architectural design warm ivory lighting 8k";
  const width = searchParams.get("width") || "1200";
  const height = searchParams.get("height") || "800";
  const seed = searchParams.get("seed") || "42";
  const model = searchParams.get("model") || "flux";
  const fallback = searchParams.get("fallback") || "/images/projects/proj-villa.webp";

  const apiKey =
    readEnv("POLLINATIONS_API_KEY") ||
    readEnv("NEXT_PUBLIC_POLLINATIONS_KEY") ||
    process.env.POLLINATIONS_API_KEY ||
    process.env.NEXT_PUBLIC_POLLINATIONS_KEY ||
    "";

  // Build target upstream Pollinations URL
  const encodedPrompt = encodeURIComponent(prompt);
  const upstreamUrl = apiKey
    ? `https://gen.pollinations.ai/image/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=${model}&key=${apiKey}`
    : `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=${model}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(upstreamUrl, {
      signal: controller.signal,
      headers: {
        Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
        "User-Agent": "SutraStudio-MediaProxy/1.0",
      },
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type") || "";

    if (res.ok && contentType.startsWith("image/")) {
      const arrayBuffer = await res.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    // Upstream returned non-image (e.g. 503 limit or HTML error)
    console.warn(`[MediaProxy] Upstream Pollinations returned status ${res.status} (${contentType}). Redirecting to fallback: ${fallback}`);
    const fallbackUrl = new URL(fallback.startsWith("/") ? fallback : `/${fallback}`, req.url);
    return NextResponse.redirect(fallbackUrl, 307);
  } catch (err: any) {
    console.warn(`[MediaProxy] Upstream request failed or timed out (${err?.message || err}). Redirecting to fallback: ${fallback}`);
    const fallbackUrl = new URL(fallback.startsWith("/") ? fallback : `/${fallback}`, req.url);
    return NextResponse.redirect(fallbackUrl, 307);
  }
}
