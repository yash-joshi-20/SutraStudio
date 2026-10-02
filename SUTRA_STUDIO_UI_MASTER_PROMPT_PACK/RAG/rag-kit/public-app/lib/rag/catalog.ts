import "server-only";
import { adminDb } from "@/lib/firebase/admin";

export const SERVICES = [
  { slug: "image-creation", name: "Image Creation", tagline: "Product, ads, mockups" },
  { slug: "video-creation", name: "Video Creation", tagline: "Ads, reels, editing" },
  { slug: "3d-modeling", name: "3D Modeling", tagline: "Products, spaces" },
  { slug: "360-view", name: "360 View", tagline: "Virtual tours" },
  { slug: "interior-design", name: "Interior Design", tagline: "Spaces, renderings" },
  { slug: "window-design", name: "Window Design", tagline: "Frames, elevations" },
  { slug: "digital-marketing", name: "Digital Marketing", tagline: "Strategy, content" },
  { slug: "meta-ads-launcher", name: "Meta Ads Launcher", tagline: "Campaigns, ad creatives" },
  { slug: "website-development", name: "Website Development", tagline: "Landing pages, websites" },
  { slug: "web-app-development", name: "Web App Development", tagline: "Dashboards, portals" },
  { slug: "mobile-app-setup", name: "Mobile App Setup", tagline: "Android and iOS apps" },
  { slug: "ai-automation", name: "AI Automation", tagline: "Workflows, integrations" },
] as const;

export type ServiceSlug = (typeof SERVICES)[number]["slug"];
export const SERVICE_SLUGS: readonly string[] = SERVICES.map((s) => s.slug);

let cache: { at: number; text: string } | null = null;

/** Service list for the system prompt. Reads the admin-editable `services` collection (5 min cache), falls back to the static list. */
export async function getCatalogText(): Promise<string> {
  if (cache && Date.now() - cache.at < 5 * 60_000) return cache.text;
  let lines: string[] = [];
  try {
    const snap = await adminDb().collection("services").where("active", "==", true).orderBy("order").limit(30).get();
    lines = snap.docs.map((d) => {
      const s = d.data() as { name?: string; slug?: string; tagline?: string; startingPrice?: number; currency?: string };
      const price = typeof s.startingPrice === "number" ? ` From ${s.currency ?? ""}${s.startingPrice}.` : "";
      return `- ${s.name ?? d.id} (${s.slug ?? d.id}): ${s.tagline ?? ""}.${price}`;
    });
  } catch {
    /* fall through to the static list */
  }
  if (!lines.length) lines = SERVICES.map((s) => `- ${s.name} (${s.slug}): ${s.tagline}.`);
  const text = lines.join("\n");
  cache = { at: Date.now(), text };
  return text;
}
