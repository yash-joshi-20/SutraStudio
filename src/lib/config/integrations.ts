/**
 * SUTRA STUDIO — Integration Status Registry
 *
 * Powers the admin "Integrations" screen. Reports ONE of two states per
 * integration: "configured" or "not configured".
 *
 * It deliberately exposes KEY NAMES ONLY — never values, never partial values.
 * It never reports "ok" for a key that is absent.
 */

import {
  type EnvKey,
  isEnvSet,
  isFirebaseClientConfigured,
  isFirebaseAdminConfigured,
  isGoogleDriveConfigured,
  isRazorpayConfigured,
  isRazorpayWebhookConfigured,
  isPushConfigured,
  isResendConfigured,
  isSendgridConfigured,
  isN8nConfigured,
  isN8nAuthConfigured,
  isMetaConfigured,
  isPublicEnvSet,
} from "@/lib/config/env";

export type IntegrationGroup =
  | "Core Platform"
  | "Authentication"
  | "Payments"
  | "Storage"
  | "AI Providers"
  | "Automation"
  | "Notifications"
  | "Social";

export type IntegrationState = "configured" | "not configured";

export interface IntegrationRequirement {
  key: EnvKey;
  /** Human label; defaults to the key name. */
  label?: string;
  /** Optional manual setup URL shown in the admin "how to fix" hint. */
  docs?: string;
}

export interface IntegrationStatus {
  id: string;
  name: string;
  group: IntegrationGroup;
  description: string;
  state: IntegrationState;
  /** Only the NAMES of keys that are missing. Never values. */
  missingKeys: EnvKey[];
  /** Only the NAMES of keys that are present. Never values. */
  presentKeys: EnvKey[];
  manualSteps: string[];
}

interface IntegrationDefinition {
  id: string;
  name: string;
  group: IntegrationGroup;
  description: string;
  requirements: IntegrationRequirement[];
  /** Optional aggregate check; defaults to "all requirements present". */
  ready?: () => boolean;
  manualSteps?: string[];
}

const DEFINITIONS: IntegrationDefinition[] = [
  {
    id: "firebase-client",
    name: "Firebase Web Client",
    group: "Core Platform",
    description: "Client SDK used in the browser for Auth and Firestore only. Object storage lives in Google Drive.",
    requirements: [
      { key: "NEXT_PUBLIC_FIREBASE_API_KEY" },
      { key: "NEXT_PUBLIC_FIREBASE_PROJECT_ID" },
      { key: "NEXT_PUBLIC_FIREBASE_APP_ID" },
      { key: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" },
    ],
    ready: isFirebaseClientConfigured,
    manualSteps: [
      "Firebase console → Project settings → General → Your apps → Web app.",
      "Copy the web config values into the NEXT_PUBLIC_FIREBASE_* keys.",
      "No Storage bucket and no Cloud Functions are needed — the Spark (free) plan is sufficient.",
    ],
  },
  {
    id: "firebase-admin",
    name: "Firebase Admin (Server)",
    group: "Authentication",
    description: "Server SDK. Required for session cookies, custom claims, and all server-side Firestore writes.",
    requirements: [
      { key: "FIREBASE_CLIENT_EMAIL" },
      { key: "FIREBASE_PRIVATE_KEY" },
    ],
    ready: isFirebaseAdminConfigured,
    manualSteps: [
      "Firebase console → Project settings → Service accounts → Generate new private key.",
      "Set FIREBASE_CLIENT_EMAIL to the client_email and FIREBASE_PRIVATE_KEY to the full private_key (keep the \\n escapes).",
      "Without this key the server CANNOT verify sessions and will refuse to serve account data.",
    ],
  },
  {
    id: "razorpay",
    name: "Razorpay Payments",
    group: "Payments",
    description: "Order creation, signature verification and refunds.",
    requirements: [{ key: "RAZORPAY_KEY_ID" }, { key: "RAZORPAY_KEY_SECRET" }],
    ready: isRazorpayConfigured,
    manualSteps: ["Razorpay dashboard → Account & Settings → API Keys → generate Key ID and Key Secret."],
  },
  {
    id: "razorpay-webhook",
    name: "Razorpay Webhooks",
    group: "Payments",
    description: "Server-to-server payment confirmation for orders and subscriptions.",
    requirements: [{ key: "RAZORPAY_WEBHOOK_SECRET" }],
    ready: isRazorpayWebhookConfigured,
    manualSteps: [
      "Razorpay dashboard → Webhooks → add endpoint /api/payments/webhook.",
      "Subscribe to payment.captured, payment.failed, subscription.charged, subscription.charged.",
      "Copy the generated signing secret into RAZORPAY_WEBHOOK_SECRET.",
    ],
  },
  {
    id: "google-drive",
    name: "Google Drive Storage",
    group: "Storage",
    description:
      "The studio's 5 TB Drive holds every image, video, 3D file, panorama, deliverable and client upload. Firestore keeps metadata only.",
    requirements: [
      { key: "GOOGLE_DRIVE_CLIENT_ID" },
      { key: "GOOGLE_DRIVE_CLIENT_SECRET" },
      { key: "GOOGLE_DRIVE_REFRESH_TOKEN" },
      { key: "GOOGLE_DRIVE_ROOT_FOLDER_ID" },
    ],
    ready: isGoogleDriveConfigured,
    manualSteps: [
      "Google Cloud console → APIs & Services → enable the Google Drive API.",
      "OAuth consent screen → External → add your Google account as a test user.",
      "Credentials → Create OAuth client ID → Web application → add http://localhost:3000/api/auth/drive as an authorised redirect URI.",
      "Scope requested: https://www.googleapis.com/auth/drive.file (files this app created only — NOT full drive access).",
      "Generate a refresh token once and set GOOGLE_DRIVE_CLIENT_ID / CLIENT_SECRET / REFRESH_TOKEN.",
      "GOOGLE_DRIVE_ROOT_FOLDER_ID may stay empty: under drive.file a hand-made folder is invisible, so the app creates its own root on first use and records the id in studio_config/drive.",
      "Note: a service account has NO quota on a personal Drive — that is why this uses an OAuth refresh token instead.",
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    group: "AI Providers",
    description: "AI chat, brief analysis, trend summarisation and content moderation.",
    requirements: [{ key: "GEMINI_API_KEY" }],
    manualSteps: ["Google AI Studio → Get API key."],
  },
  {
    id: "openai",
    name: "OpenAI",
    group: "AI Providers",
    description: "Optional chat and copy fallback.",
    requirements: [{ key: "OPENAI_API_KEY" }],
    manualSteps: ["platform.openai.com → API keys."],
  },
  {
    id: "groq",
    name: "Groq",
    group: "AI Providers",
    description: "Fast low-cost chat fallback.",
    requirements: [{ key: "GROQ_API_KEY" }],
    manualSteps: ["console.groq.com → API keys."],
  },
  {
    id: "cerabras",
    name: "Cerebras",
    group: "AI Providers",
    description: "Fast inference fallback.",
    requirements: [{ key: "CEREBRAS_API_KEY" }],
    manualSteps: ["cloud.cerebras.ai → API keys."],
  },
  {
    id: "flux",
    name: "FLUX / BFL",
    group: "AI Providers",
    description: "Primary image and banner generation.",
    requirements: [{ key: "BFL_API_KEY" }],
    manualSteps: ["api.bfl.ai → API keys."],
  },
  {
    id: "pollinations",
    name: "Pollinations",
    group: "AI Providers",
    description: "Keyless image fallback. Rate limited; disabled in production unless allowed.",
    requirements: [{ key: "POLLINATIONS_API_KEY" }],
    manualSteps: ["Optional. Leave unset to keep the provider disabled."],
  },
  {
    id: "pixazo",
    name: "Pixazo",
    group: "AI Providers",
    description: "Secondary image provider fallback.",
    requirements: [{ key: "PIXAZO_API_KEY" }],
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    group: "AI Providers",
    description: "Background removal and image-editing models.",
    requirements: [{ key: "HF_TOKEN" }],
    manualSteps: ["huggingface.co → Settings → Access Tokens → Read token."],
  },
  {
    id: "kling",
    name: "Kling Video",
    group: "AI Providers",
    description: "Text/image to video generation. Uses a single Bearer API key.",
    requirements: [{ key: "KLING_API_KEY" }],
    manualSteps: ["Kling AI developer console → API key. Sent as `Authorization: Bearer <key>`."],
  },
  {
    id: "tripo3d",
    name: "Tripo3D",
    group: "AI Providers",
    description: "Image or text to 3D model drafts (GLB / USDZ / OBJ).",
    requirements: [{ key: "TRIPO3D_API_KEY" }],
    manualSteps: ["Tripo3D platform → API key."],
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    group: "AI Providers",
    description: "Voiceover audio for video orders.",
    requirements: [{ key: "ELEVENLABS_API_KEY" }],
    manualSteps: ["elevenlabs.io → Profile → API Keys."],
  },
  {
    id: "serpapi",
    name: "SerpAPI",
    group: "AI Providers",
    description: "Trend research by industry and region for the daily content engine.",
    requirements: [{ key: "SERPAPI_API_KEY" }],
    manualSteps: ["serpapi.com → Dashboard → API Key."],
  },
  {
    id: "resend",
    name: "Resend Email",
    group: "Notifications",
    description: "Transactional email for order, payment and plan lifecycle events.",
    requirements: [{ key: "RESEND_API_KEY" }, { key: "EMAIL_FROM" }],
    ready: isResendConfigured,
    manualSteps: [
      "resend.com → Domains → add and verify your sending domain.",
      "Create an API key and set EMAIL_FROM to a verified sender such as notifications@yourdomain.com.",
    ],
  },
  {
    id: "sendgrid",
    name: "SendGrid Email",
    group: "Notifications",
    description: "Alternative transactional email provider.",
    requirements: [{ key: "SENDGRID_API_KEY" }],
    ready: isSendgridConfigured,
    manualSteps: ["app.sendgrid.com → Settings → API Keys."],
  },
  {
    id: "web-push",
    name: "Web Push (FCM)",
    group: "Notifications",
    description: "PWA push notifications. Needs a VAPID key and the Admin SDK.",
    requirements: [{ key: "NEXT_PUBLIC_FIREBASE_VAPID_KEY" }],
    ready: isPushConfigured,
    manualSteps: [
      "Firebase console → Project settings → Cloud Messaging → Web Push certificates → Generate key pair.",
      "Put the public key in NEXT_PUBLIC_FIREBASE_VAPID_KEY.",
      "Requires FIREBASE_PRIVATE_KEY server-side to send.",
    ],
  },
  {
    id: "n8n",
    name: "n8n Automation",
    group: "Automation",
    description: "Order fulfilment, approval, monthly content and error-handling workflows.",
    requirements: [{ key: "N8N_BASE_URL" }],
    ready: isN8nConfigured,
    manualSteps: ["n8n → Settings → n8n API → create an API key. Set N8N_BASE_URL to your public instance URL."],
  },
  {
    id: "n8n-auth",
    name: "n8n Webhook Signing",
    group: "Automation",
    description: "HMAC signature and API key protecting webhook calls.",
    requirements: [{ key: "N8N_WEBHOOK_SECRET" }, { key: "N8N_API_KEY" }],
    ready: isN8nAuthConfigured,
    manualSteps: ["Set a long random N8N_WEBHOOK_SECRET and mirror it in the n8n webhook header credential."],
  },
  {
    id: "meta",
    name: "Meta (Facebook / Instagram)",
    group: "Social",
    description: "Direct posting and scheduling to the client's own pages and accounts.",
    requirements: [
      { key: "META_APP_ID" },
      { key: "META_APP_SECRET" },
      { key: "META_PAGE_ACCESS_TOKEN" },
    ],
    ready: isMetaConfigured,
    manualSteps: [
      "developers.facebook.com → create a Business app.",
      "Add the Facebook Login and Instagram Graph API products.",
      "Request advanced access for pages_manage_posts and instagram_content_publish — this needs Meta App Review and a Business Verification.",
      "Only request these scopes after explicit written client consent; Sutra Studio never posts without it.",
    ],
  },
];

export function getIntegrationStatuses(): IntegrationStatus[] {
  return DEFINITIONS.map((def) => {
    const presentKeys: EnvKey[] = [];
    const missingKeys: EnvKey[] = [];

    for (const req of def.requirements) {
      const key = req.key;
      const present = key.startsWith("NEXT_PUBLIC_") ? isPublicEnvSet(key) : isEnvSet(key);
      if (present) presentKeys.push(key);
      else missingKeys.push(key);
    }

    const state: IntegrationState =
      missingKeys.length === 0 && (!def.ready || def.ready()) ? "configured" : "not configured";

    return {
      id: def.id,
      name: def.name,
      group: def.group,
      description: def.description,
      state,
      missingKeys,
      presentKeys,
      manualSteps: def.manualSteps ?? [],
    };
  });
}

export function getIntegrationSummary() {
  const all = getIntegrationStatuses();
  const configured = all.filter((i) => i.state === "configured").length;
  return {
    total: all.length,
    configured,
    missing: all.length - configured,
    criticalMissing: all.filter(
      (i) =>
        i.state === "not configured" &&
        (i.id === "firebase-admin" || i.id === "firebase-client" || i.id === "razorpay")
    ).map((i) => i.name),
  };
}