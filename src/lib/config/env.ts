/**
 * SUTRA STUDIO — Canonical Environment Reader (Server Safe)
 *
 * SINGLE SOURCE OF TRUTH for every environment key in the project.
 *
 * HARD RULES ENFORCED HERE:
 *  1. Values are NEVER returned to the browser. `readEnv()` is server-only.
 *  2. `isEnvSet()` / `envStatus()` return booleans and key NAMES only.
 *  3. Nothing here invents a default for a secret. A missing secret stays missing.
 *  4. Only `NEXT_PUBLIC_*` keys are ever eligible for client bundling
 *     (see `CLIENT_SAFE_ENV_KEYS`).
 */

const CLIENT_SAFE_ENV_KEYS = new Set([
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_FIREBASE_VAPID_KEY",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
]);

export type EnvKey =
  | "APP_BASE_URL"
  | "NEXT_PUBLIC_APP_URL"
  | "ADMIN_EMAIL"
  | "ADMIN_ALLOWED_EMAILS"
  | "ADMIN_NOTIFY_EMAIL"
  | "CRON_SECRET"
  | "NEXT_PUBLIC_FIREBASE_API_KEY"
  | "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  | "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  | "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  | "NEXT_PUBLIC_FIREBASE_APP_ID"
  | "NEXT_PUBLIC_FIREBASE_VAPID_KEY"
  | "FIREBASE_CLIENT_EMAIL"
  | "FIREBASE_PRIVATE_KEY"
  | "FIREBASE_PROJECT_ID"
  | "NEXT_PUBLIC_RAZORPAY_KEY_ID"
  | "RAZORPAY_KEY_ID"
  | "RAZORPAY_KEY_SECRET"
  | "RAZORPAY_WEBHOOK_SECRET"
  | "GOOGLE_DRIVE_CLIENT_ID"
  | "GOOGLE_DRIVE_CLIENT_SECRET"
  | "GOOGLE_DRIVE_REFRESH_TOKEN"
  | "GOOGLE_DRIVE_ROOT_FOLDER_ID"
  | "GEMINI_API_KEY"
  | "GOOGLE_AI_API_KEY"
  | "GEMINI_CHAT_MODEL"
  | "OPENAI_API_KEY"
  | "GROQ_API_KEY"
  | "CEREBRAS_API_KEY"
  | "BFL_API_KEY"
  | "POLLINATIONS_API_KEY"
  | "PIXAZO_API_KEY"
  | "HF_TOKEN"
  | "KLING_API_KEY"
  | "TRIPO3D_API_KEY"
  | "ELEVENLABS_API_KEY"
  | "SERPAPI_API_KEY"
  | "RESEND_API_KEY"
  | "EMAIL_FROM"
  | "SENDGRID_API_KEY"
  | "META_APP_ID"
  | "META_APP_SECRET"
  | "META_PAGE_ACCESS_TOKEN"
  | "META_IG_USER_ID"
  | "META_AD_ACCOUNT_ID"
  | "N8N_BASE_URL"
  | "N8N_API_KEY"
  | "N8N_WEBHOOK_SECRET";

/** Read a raw value. Server-only. Returns "" when unset. */
export function readEnv(key: EnvKey): string {
  const raw = process.env[key];
  return typeof raw === "string" ? raw.trim() : "";
}

/** Boolean presence check. Never leaks the value. */
export function isEnvSet(key: EnvKey): boolean {
  return readEnv(key).length > 0;
}

/**
 * Public-safe read. Returns "" for any key that is not NEXT_PUBLIC_*.
 * This is the ONLY function a client component may import.
 */
export function readPublicEnv(key: EnvKey): string {
  if (!key.startsWith("NEXT_PUBLIC_")) return "";
  if (!CLIENT_SAFE_ENV_KEYS.has(key)) return "";
  return readEnv(key);
}

export function isPublicEnvSet(key: EnvKey): boolean {
  return CLIENT_SAFE_ENV_KEYS.has(key) && isEnvSet(key);
}

/** True when Firebase client SDK can boot. */
export function isFirebaseClientConfigured(): boolean {
  return (
    isEnvSet("NEXT_PUBLIC_FIREBASE_API_KEY") &&
    isEnvSet("NEXT_PUBLIC_FIREBASE_PROJECT_ID") &&
    isEnvSet("NEXT_PUBLIC_FIREBASE_APP_ID")
  );
}

/**
 * True when Firebase Admin SDK can boot.
 * Requires a service-account private key. Never fabricates one.
 */
export function isFirebaseAdminConfigured(): boolean {
  const email = readEnv("FIREBASE_CLIENT_EMAIL");
  const key = readEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");
  return email.length > 0 && key.includes("PRIVATE KEY") && isEnvSet("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
}

/** Google Drive via OAuth refresh token (personal/shared Drive). No service account needed. */
export function isGoogleDriveConfigured(): boolean {
  return (
    isEnvSet("GOOGLE_DRIVE_CLIENT_ID") &&
    isEnvSet("GOOGLE_DRIVE_CLIENT_SECRET") &&
    isEnvSet("GOOGLE_DRIVE_REFRESH_TOKEN")
  );
}

export function isRazorpayConfigured(): boolean {
  return isEnvSet("RAZORPAY_KEY_ID") && isEnvSet("RAZORPAY_KEY_SECRET");
}

export function isRazorpayWebhookConfigured(): boolean {
  return isEnvSet("RAZORPAY_WEBHOOK_SECRET");
}

export function isPushConfigured(): boolean {
  return isEnvSet("NEXT_PUBLIC_FIREBASE_VAPID_KEY") && isFirebaseAdminConfigured();
}

export function isResendConfigured(): boolean {
  return isEnvSet("RESEND_API_KEY") && isEnvSet("EMAIL_FROM");
}

export function isSendgridConfigured(): boolean {
  return isEnvSet("SENDGRID_API_KEY");
}

export function isN8nConfigured(): boolean {
  return isEnvSet("N8N_BASE_URL");
}

export function isN8nAuthConfigured(): boolean {
  return isEnvSet("N8N_API_KEY") && isEnvSet("N8N_WEBHOOK_SECRET");
}

export function isMetaConfigured(): boolean {
  return isEnvSet("META_APP_ID") && isEnvSet("META_APP_SECRET");
}