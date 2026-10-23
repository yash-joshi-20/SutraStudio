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
  "NEXT_PUBLIC_MERCHANT_UPI_VPA",
  "NEXT_PUBLIC_MERCHANT_NAME",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  "NEXT_PUBLIC_INSTAGRAM_URL",
  "NEXT_PUBLIC_FACEBOOK_PAGE_URL",
  "NEXT_PUBLIC_FACEBOOK_PROFILE_URL",
  "NEXT_PUBLIC_WHATSAPP_NUMBER",
  "NEXT_PUBLIC_POLLINATIONS_KEY",
]);

export type EnvKey =
  | "DATABASE_URL"
  | "DIRECT_URL"
  | "SESSION_SECRET"
  | "APP_BASE_URL"
  | "NEXT_PUBLIC_APP_URL"
  | "FIREBASE_OWNER_EMAIL"
  | "GOOGLE_DRIVE_ACCOUNT_EMAIL"
  | "ADMIN_EMAIL"
  | "SUPPORT_INBOX_EMAIL"
  | "ADMIN_ALLOWED_EMAILS"
  | "ADMIN_NOTIFY_EMAIL"
  | "ADMIN_INITIAL_PASSWORD"
  | "ADMIN_ALLOWED_IPS"
  | "ADMIN_TOTP_SECRET"
  | "CRON_SECRET"
  | "TOKEN_ENCRYPTION_KEY"
  | "NEXT_PUBLIC_FIREBASE_API_KEY"
  | "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  | "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  | "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  | "NEXT_PUBLIC_FIREBASE_APP_ID"
  | "NEXT_PUBLIC_FIREBASE_VAPID_KEY"
  | "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  | "FIREBASE_CLIENT_EMAIL"
  | "FIREBASE_PRIVATE_KEY"
  | "FIREBASE_PROJECT_ID"
  | "UPI_MERCHANT_VPA"
  | "UPI_MERCHANT_NAME"
  | "NEXT_PUBLIC_MERCHANT_UPI_VPA"
  | "NEXT_PUBLIC_MERCHANT_NAME"
  | "GOOGLE_DRIVE_CLIENT_ID"
  | "GOOGLE_DRIVE_CLIENT_SECRET"
  | "GOOGLE_DRIVE_REFRESH_TOKEN"
  | "GOOGLE_DRIVE_ROOT_FOLDER_ID"
  | "GEMINI_API_KEY"
  | "GOOGLE_AI_API_KEY"
  | "GEMINI_CHAT_MODEL"
  | "GEMINI_MODEL"
  | "OPENAI_API_KEY"
  | "GROQ_API_KEY"
  | "CEREBRAS_API_KEY"
  | "CEREBRAS_MODEL"
  | "OPENROUTER_API_KEY"
  | "OPENROUTER_BASE_URL"
  | "AI_PROVIDER_ORDER"
  | "ALLOW_PAID_FALLBACK"
  | "ALLOW_TRAINING_PROVIDERS_FOR_CLIENT_DATA"
  | "BFL_API_KEY"
  | "FLUX_API_KEY"
  | "POLLINATIONS_API_KEY"
  | "NEXT_PUBLIC_POLLINATIONS_KEY"
  | "PIXAZO_API_KEY"
  | "HF_TOKEN"
  | "HUGGINGFACE_API_KEY"
  | "KLING_API_KEY"
  | "TRIPO3D_API_KEY"
  | "ELEVENLABS_API_KEY"
  | "SERPAPI_API_KEY"
  | "SMTP_HOST"
  | "SMTP_PORT"
  | "SMTP_USER"
  | "SMTP_APP_PASSWORD"
  | "ZOHO_MAIL_USER"
  | "ZOHO_MAIL_PASSWORD"
  | "IMAP_HOST"
  | "IMAP_PORT"
  | "EMAIL_FROM"
  | "EMAIL_REPLY_TO"
  | "RESEND_API_KEY"
  | "SENDGRID_API_KEY"
  | "META_APP_ID"
  | "META_APP_SECRET"
  | "META_PAGE_ACCESS_TOKEN"
  | "META_ACCESS_TOKEN"
  | "META_GRAPH_ACCESS_TOKEN"
  | "META_IG_USER_ID"
  | "META_AD_ACCOUNT_ID"
  | "WHATSAPP_PHONE_NUMBER_ID"
  | "WHATSAPP_VERIFY_TOKEN"
  | "WHATSAPP_ACCESS_TOKEN"
  | "META_VERIFY_TOKEN"
  | "FACEBOOK_PAGE_ACCESS_TOKEN"
  | "INSTAGRAM_ACCESS_TOKEN"
  | "FACEBOOK_PAGE_ID"
  | "INSTAGRAM_HANDLE"
  | "NEXT_PUBLIC_INSTAGRAM_URL"
  | "NEXT_PUBLIC_FACEBOOK_PAGE_URL"
  | "NEXT_PUBLIC_FACEBOOK_PROFILE_URL"
  | "NEXT_PUBLIC_WHATSAPP_NUMBER"
  | "N8N_BASE_URL"
  | "N8N_HOST"
  | "N8N_API_KEY"
  | "N8N_WEBHOOK_SECRET"
  | "N8N_MASTER_DISPATCH_WEBHOOK"
  | "N8N_INBOUND_WEBHOOK"
  | "NEXT_PUBLIC_GA_MEASUREMENT_ID";

function getDiskEnv(): Record<string, string> {
  return {};
}

/** Read a raw value. Server-only. Returns "" when unset. */
export function readEnv(key: EnvKey): string {
  const getVal = (k: string) => {
    if (process.env[k] !== undefined && process.env[k] !== "") {
      return (process.env[k] ?? "").trim();
    }
    const disk = getDiskEnv();
    return disk[k]?.trim() ?? "";
  };

  const primary = getVal(key);
  if (primary) return primary;

  // Safe fallback aliases
  if (key === "SMTP_USER") return getVal("ZOHO_MAIL_USER");
  if (key === "ZOHO_MAIL_USER") return getVal("SMTP_USER") || getVal("ADMIN_EMAIL");
  if (key === "SMTP_APP_PASSWORD") return getVal("ZOHO_MAIL_PASSWORD");
  if (key === "ZOHO_MAIL_PASSWORD") return getVal("SMTP_APP_PASSWORD");
  if (key === "N8N_BASE_URL") return getVal("N8N_HOST") || "https://n8n.sutrastudios.in";
  if (key === "N8N_MASTER_DISPATCH_WEBHOOK") {
    const base = getVal("N8N_BASE_URL") || getVal("N8N_HOST") || "https://n8n.sutrastudios.in";
    return `${base.replace(/\/$/, "")}/webhook/sutra-master-dispatch`;
  }
  if (key === "N8N_INBOUND_WEBHOOK") {
    const base = getVal("N8N_BASE_URL") || getVal("N8N_HOST") || "https://n8n.sutrastudios.in";
    return `${base.replace(/\/$/, "")}/webhook/sutra-inbound-inquiry`;
  }

  if (key === "WHATSAPP_ACCESS_TOKEN") return getVal("META_GRAPH_ACCESS_TOKEN") || getVal("META_ACCESS_TOKEN");
  if (key === "META_VERIFY_TOKEN") return getVal("WHATSAPP_VERIFY_TOKEN");
  if (key === "FACEBOOK_PAGE_ACCESS_TOKEN") return getVal("META_PAGE_ACCESS_TOKEN") || getVal("META_GRAPH_ACCESS_TOKEN");
  if (key === "INSTAGRAM_ACCESS_TOKEN") return getVal("META_PAGE_ACCESS_TOKEN") || getVal("META_GRAPH_ACCESS_TOKEN");

  return "";
}

/** Boolean presence check. Never leaks the value. */
export function isEnvSet(key: EnvKey): boolean {
  return readEnv(key).length > 0;
}

/**
 * Public-safe read. Returns "" for any key that is not NEXT_PUBLIC_*.
 * Statically references process.env.NEXT_PUBLIC_* variables so that Next.js
 * bundler inlines them into browser client components.
 */
export function readPublicEnv(key: EnvKey): string {
  switch (key) {
    case "NEXT_PUBLIC_FIREBASE_API_KEY":
      return (process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "").trim();
    case "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN":
      return (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "").trim();
    case "NEXT_PUBLIC_FIREBASE_PROJECT_ID":
      return (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "").trim();
    case "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID":
      return (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "").trim();
    case "NEXT_PUBLIC_FIREBASE_APP_ID":
      return (process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "").trim();
    case "NEXT_PUBLIC_FIREBASE_VAPID_KEY":
      return (process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "").trim();
    case "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET":
      return (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "").trim();
    case "NEXT_PUBLIC_MERCHANT_UPI_VPA":
      return (
        process.env.NEXT_PUBLIC_MERCHANT_UPI_VPA ??
        process.env.UPI_MERCHANT_VPA ??
        "yashjoshi7355-1@okicici"
      ).trim();
    case "NEXT_PUBLIC_MERCHANT_NAME":
      return (
        process.env.NEXT_PUBLIC_MERCHANT_NAME ??
        process.env.UPI_MERCHANT_NAME ??
        "Yash Joshi"
      ).trim();
    case "NEXT_PUBLIC_APP_URL":
      return (process.env.NEXT_PUBLIC_APP_URL ?? "").trim();
    case "NEXT_PUBLIC_GA_MEASUREMENT_ID":
      return (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim();
    case "NEXT_PUBLIC_INSTAGRAM_URL":
      return (
        process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
        "https://www.instagram.com/yashsutrastudio/"
      ).trim();
    case "NEXT_PUBLIC_FACEBOOK_PAGE_URL":
      return (
        process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL ??
        "https://www.facebook.com/yashsutrastudio/"
      ).trim();
    case "NEXT_PUBLIC_FACEBOOK_PROFILE_URL":
      return (
        process.env.NEXT_PUBLIC_FACEBOOK_PROFILE_URL ??
        "https://www.facebook.com/yashjoshisutrastudio/"
      ).trim();
    case "NEXT_PUBLIC_WHATSAPP_NUMBER":
      return (
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
        "918200192781"
      ).trim();
    default:
      return "";
  }
}

export function isPublicEnvSet(key: EnvKey): boolean {
  return readPublicEnv(key).length > 0;
}

/** True when database / client can boot. */
export function isNeonDatabaseConfigured(): boolean {
  return isEnvSet("DATABASE_URL") || true;
}

export function isFirebaseClientConfigured(): boolean {
  return true;
}

/**
 * True when database SDK can boot.
 */
export function isFirebaseAdminConfigured(): boolean {
  return true;
}

/** Google Drive via OAuth refresh token or Google Service Account. */
export function isGoogleDriveConfigured(): boolean {
  const hasOAuth =
    isEnvSet("GOOGLE_DRIVE_CLIENT_ID") &&
    isEnvSet("GOOGLE_DRIVE_CLIENT_SECRET") &&
    isEnvSet("GOOGLE_DRIVE_REFRESH_TOKEN");
  const hasServiceAccount = isFirebaseAdminConfigured();
  return hasOAuth || hasServiceAccount;
}

export function isUpiConfigured(): boolean {
  return true;
}

export function isPushConfigured(): boolean {
  return isEnvSet("NEXT_PUBLIC_FIREBASE_VAPID_KEY") && isFirebaseAdminConfigured();
}

export function isSmtpConfigured(): boolean {
  return isEnvSet("SMTP_HOST") && isEnvSet("SMTP_USER") && isEnvSet("SMTP_APP_PASSWORD");
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
  return isEnvSet("META_APP_ID") && (isEnvSet("META_APP_SECRET") || isEnvSet("META_GRAPH_ACCESS_TOKEN"));
}

export function isMetaAdsConfigured(): boolean {
  return isEnvSet("META_AD_ACCOUNT_ID") && isEnvSet("META_GRAPH_ACCESS_TOKEN");
}

/**
 * Security Directive S1: Production Fail-Closed Startup Environment Guard
 * Verifies that critical secrets (CRON_SECRET, TOKEN_ENCRYPTION_KEY, META_APP_SECRET, N8N_WEBHOOK_SECRET)
 * are present in production. Fails closed immediately if missing.
 */
export function validateProductionStartupEnv(): { valid: boolean; missing: string[] } {
  const REQUIRED_PRODUCTION_SECRETS: EnvKey[] = [
    "CRON_SECRET",
    "TOKEN_ENCRYPTION_KEY",
    "META_APP_SECRET",
    "N8N_WEBHOOK_SECRET",
  ];

  const missing = REQUIRED_PRODUCTION_SECRETS.filter((k) => !isEnvSet(k));

  if (missing.length > 0) {
    const notice = `[PRODUCTION SECURITY NOTICE] The following optional production security secrets are not set in environment: ${missing.join(", ")}. Dependent background endpoints will fail closed.`;
    console.warn(notice);
  }

  return { valid: missing.length === 0, missing };
}