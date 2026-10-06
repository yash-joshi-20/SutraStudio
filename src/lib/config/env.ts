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
  | "GEMINI_MODEL"
  | "OPENAI_API_KEY"
  | "GROQ_API_KEY"
  | "CEREBRAS_API_KEY"
  | "CEREBRAS_MODEL"
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
  | "EMAIL_FROM"
  | "EMAIL_REPLY_TO"
  | "RESEND_API_KEY"
  | "SENDGRID_API_KEY"
  | "META_APP_ID"
  | "META_APP_SECRET"
  | "META_PAGE_ACCESS_TOKEN"
  | "META_ACCESS_TOKEN"
  | "META_IG_USER_ID"
  | "META_AD_ACCOUNT_ID"
  | "FACEBOOK_PAGE_ID"
  | "N8N_BASE_URL"
  | "N8N_HOST"
  | "N8N_API_KEY"
  | "N8N_WEBHOOK_SECRET"
  | "NEXT_PUBLIC_GA_MEASUREMENT_ID";

let cachedDiskEnv: Record<string, string> | null = null;

function getDiskEnv(): Record<string, string> {
  if (typeof window !== "undefined") return {};
  if (cachedDiskEnv) return cachedDiskEnv;
  const map: Record<string, string> = {};
  try {
    // Dynamic import to prevent Webpack client-side bundle errors
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");

    const candidates = [
      path.resolve(process.cwd(), ".env.local"),
      path.resolve(process.cwd(), ".env"),
    ];
    for (const file of candidates) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, "utf8");
        for (const rawLine of content.split(/\r?\n/)) {
          const line = rawLine.trim();
          if (!line || line.startsWith("#")) continue;
          const eq = line.indexOf("=");
          if (eq <= 0) continue;
          const k = line.slice(0, eq).trim();
          if (map[k] !== undefined) continue;
          let val = line.slice(eq + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          map[k] = val;
        }
      }
    }

    // Also check secrets/sutra-studio-firebase-adminsdk.json if service account is used
    const saPath =
      map["FIREBASE_SERVICE_ACCOUNT"] ||
      path.resolve(process.cwd(), "secrets/sutra-studio-firebase-adminsdk.json");
    if (fs.existsSync(saPath)) {
      try {
        const saData = JSON.parse(fs.readFileSync(saPath, "utf8"));
        if (saData.client_email && !map["FIREBASE_CLIENT_EMAIL"]) {
          map["FIREBASE_CLIENT_EMAIL"] = saData.client_email;
        }
        if (saData.private_key && !map["FIREBASE_PRIVATE_KEY"]) {
          map["FIREBASE_PRIVATE_KEY"] = saData.private_key;
        }
        if (saData.project_id && !map["FIREBASE_PROJECT_ID"]) {
          map["FIREBASE_PROJECT_ID"] = saData.project_id;
        }
      } catch {
        // quiet
      }
    }
  } catch {
    // quiet
  }
  cachedDiskEnv = map;
  return map;
}

/** Read a raw value. Server-only. Returns "" when unset. */
export function readEnv(key: EnvKey): string {
  if (process.env[key] !== undefined) {
    return (process.env[key] ?? "").trim();
  }
  const disk = getDiskEnv();
  return disk[key]?.trim() ?? "";
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
    case "NEXT_PUBLIC_RAZORPAY_KEY_ID":
      return (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "").trim();
    case "NEXT_PUBLIC_APP_URL":
      return (process.env.NEXT_PUBLIC_APP_URL ?? "").trim();
    case "NEXT_PUBLIC_GA_MEASUREMENT_ID":
      return (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim();
    default:
      return "";
  }
}

export function isPublicEnvSet(key: EnvKey): boolean {
  return readPublicEnv(key).length > 0;
}

/** True when Firebase client SDK can boot. */
export function isFirebaseClientConfigured(): boolean {
  return (
    isPublicEnvSet("NEXT_PUBLIC_FIREBASE_API_KEY") &&
    isPublicEnvSet("NEXT_PUBLIC_FIREBASE_PROJECT_ID") &&
    isPublicEnvSet("NEXT_PUBLIC_FIREBASE_APP_ID")
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

/** Google Drive via OAuth refresh token or Google Service Account. */
export function isGoogleDriveConfigured(): boolean {
  const hasOAuth =
    isEnvSet("GOOGLE_DRIVE_CLIENT_ID") &&
    isEnvSet("GOOGLE_DRIVE_CLIENT_SECRET") &&
    isEnvSet("GOOGLE_DRIVE_REFRESH_TOKEN");
  const hasServiceAccount = isFirebaseAdminConfigured();
  return hasOAuth || hasServiceAccount;
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
  return isEnvSet("META_APP_ID") && isEnvSet("META_APP_SECRET");
}