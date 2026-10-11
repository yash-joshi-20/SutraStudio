/**
 * SUTRA STUDIO — Central Origin & Canonical URL Controller
 *
 * THE RULE: Only TWO live URLs exist in this project.
 * 1) https://sutrastudios.in = the main site. Everything a client sees or receives comes through it.
 * 2) https://n8n.sutrastudios.in = used only for the n8n workflows (site -> n8n webhooks, and n8n admin). Clients never see this URL.
 *
 * No other live URL and absolutely no local URL (localhost, 127.0.0.1, 0.0.0.0, ngrok, cloudflared,
 * trycloudflare, onrender.com preview URLs, vercel.app, supabase) anywhere in code or config.
 */

export const SITE_BASE_URL = "https://sutrastudios.in";
export const NEXT_PUBLIC_SITE_URL = "https://sutrastudios.in";
export const N8N_BASE_URL = "https://n8n.sutrastudios.in";

export const ALLOWED_ORIGINS = [
  "https://sutrastudios.in",
  "https://n8n.sutrastudios.in",
] as const;

export type AllowedOrigin = (typeof ALLOWED_ORIGINS)[number];

const FORBIDDEN_HOST_PATTERNS = [
  /localhost/i,
  /127\.0\.0\.1/,
  /0\.0\.0\.0/,
  /ngrok/i,
  /cloudflared/i,
  /trycloudflare/i,
  /onrender\.com/i,
  /vercel\.app/i,
  /supabase/i,
];

/**
 * Startup validator: Asserts that environment URL configurations match allowed origins.
 * Fails loudly on startup if invalid or localhost defaults are encountered.
 */
export function validateOriginConfiguration(): void {
  const envKeys = [
    "SITE_BASE_URL",
    "NEXT_PUBLIC_SITE_URL",
    "APP_BASE_URL",
    "NEXT_PUBLIC_APP_URL",
    "N8N_BASE_URL",
  ];

  for (const key of envKeys) {
    const val = process.env[key];
    if (val && typeof val === "string" && val.trim() !== "") {
      const trimmed = val.trim().replace(/\/$/, "");

      for (const pattern of FORBIDDEN_HOST_PATTERNS) {
        if (pattern.test(trimmed)) {
          throw new Error(
            `[FATAL] Invalid origin in environment variable ${key}="${val}". ` +
              `Forbidden host detected. Only https://sutrastudios.in and https://n8n.sutrastudios.in are permitted.`
          );
        }
      }

      if (key.includes("N8N")) {
        if (trimmed !== N8N_BASE_URL) {
          throw new Error(
            `[FATAL] Environment variable ${key} must equal "${N8N_BASE_URL}". Found "${trimmed}".`
          );
        }
      } else {
        if (trimmed !== SITE_BASE_URL) {
          throw new Error(
            `[FATAL] Environment variable ${key} must equal "${SITE_BASE_URL}". Found "${trimmed}".`
          );
        }
      }
    }
  }
}

// Run validation on initial module evaluation
try {
  validateOriginConfiguration();
} catch (err: unknown) {
  if (process.env.NODE_ENV === "production") {
    throw err;
  } else {
    // In dev, warn loudly
    console.error((err as Error).message);
  }
}

/**
 * Constructs a fully qualified main-domain URL.
 */
export function getSiteUrl(pathname = ""): string {
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_BASE_URL}${pathname ? cleanPath : ""}`;
}

/**
 * Constructs an n8n webhook/workflow URL.
 * Internal server-side use only. Clients must never see this URL.
 */
export function getN8nUrl(pathname = ""): string {
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${N8N_BASE_URL}${pathname ? cleanPath : ""}`;
}

/**
 * Constructs an authenticated file delivery URL on the main domain.
 * Delivery of images, videos, audio, 3D models, 360 panoramas, PDFs, invoices,
 * and downloads flows strictly through https://sutrastudios.in/api/files/[id].
 */
export function getFileUrl(
  fileId: string,
  options?: { download?: boolean; token?: string }
): string {
  const params = new URLSearchParams();
  if (options?.download) params.set("download", "true");
  if (options?.token) params.set("token", options.token);
  const query = params.toString() ? `?${params.toString()}` : "";
  return `${SITE_BASE_URL}/api/files/${encodeURIComponent(fileId)}${query}`;
}

/**
 * Constructs a canonical URL for SEO and metadata.
 */
export function getCanonicalUrl(pathname = ""): string {
  return getSiteUrl(pathname);
}
