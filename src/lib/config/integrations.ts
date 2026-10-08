/**
 * SUTRA STUDIO — Integration Status Registry & Central Configuration Module
 *
 * SINGLE SOURCE OF TRUTH for declaring every studio integration:
 *  - Environment variable names
 *  - Feature dependencies (which studio modules rely on it)
 *  - Priority level (CRITICAL | HIGH | MEDIUM | LOW)
 *  - Step-by-step instructions and URLs on where to obtain credentials
 *  - Live configuration status
 *
 * HARD RULES:
 *  1. Exposes KEY NAMES ONLY — NEVER real values or partial secrets.
 *  2. Missing keys are safely surfaced without crashing or generating fake data.
 *  3. Integrations page shows "configured" or "not configured" only.
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
  isSmtpConfigured,
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
  | "Social"
  | "Security";

export type IntegrationPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type IntegrationState = "configured" | "not configured";

export interface IntegrationRequirement {
  key: EnvKey;
  /** Human label; defaults to the key name. */
  label?: string;
  /** Optional documentation or credential generation URL. */
  docs?: string;
  /** Specific instructions on how to get the key. */
  whereToGet?: string;
}

export interface IntegrationDefinition {
  id: string;
  name: string;
  group: IntegrationGroup;
  description: string;
  /** Studio features / business capabilities that depend on this integration. */
  features: string[];
  /** Priority tier indicating how critical the integration is to operation. */
  priority: IntegrationPriority;
  /** Required environment keys and hints. */
  requirements: IntegrationRequirement[];
  /** Primary link or dashboard to get credentials. */
  whereToGet: string;
  /** Optional custom readiness checker. */
  ready?: () => boolean;
  /** Detailed human-readable setup steps. */
  manualSteps?: string[];
}

export interface IntegrationStatus {
  id: string;
  name: string;
  group: IntegrationGroup;
  description: string;
  features: string[];
  priority: IntegrationPriority;
  state: IntegrationState;
  whereToGet: string;
  /** Only the NAMES of keys that are missing. Never values. */
  missingKeys: EnvKey[];
  /** Only the NAMES of keys that are present. Never values. */
  presentKeys: EnvKey[];
  manualSteps: string[];
}

export const INTEGRATION_DEFINITIONS: IntegrationDefinition[] = [
  {
    id: "firebase-client",
    name: "Firebase Web Client",
    group: "Core Platform",
    description: "Client SDK used in the browser for Client Authentication and client-side Firestore listeners.",
    features: ["Client Auth", "Client Portal", "Real-Time Updates", "Order Tracking"],
    priority: "CRITICAL",
    whereToGet: "https://console.firebase.google.com → Project settings → General → Your apps → Web app",
    requirements: [
      { key: "NEXT_PUBLIC_FIREBASE_API_KEY", label: "Firebase API Key", whereToGet: "Firebase Console Web App Config" },
      { key: "NEXT_PUBLIC_FIREBASE_PROJECT_ID", label: "Firebase Project ID", whereToGet: "Firebase Console Web App Config" },
      { key: "NEXT_PUBLIC_FIREBASE_APP_ID", label: "Firebase App ID", whereToGet: "Firebase Console Web App Config" },
      { key: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", label: "Firebase Auth Domain", whereToGet: "Firebase Console Web App Config" },
    ],
    ready: isFirebaseClientConfigured,
    manualSteps: [
      "Firebase console → Project settings → General → Your apps → Web app.",
      "Copy the web config values into the NEXT_PUBLIC_FIREBASE_* keys in .env.local.",
      "No Storage bucket is needed (all media lives in Google Drive).",
    ],
  },
  {
    id: "firebase-admin",
    name: "Firebase Admin (Server)",
    group: "Authentication",
    description: "Server SDK for session cookie verification, custom claims, RBAC enforcement, and server-side Firestore operations.",
    features: ["Admin RBAC", "Session Cookies", "Super Admin Claims", "Server-Side Firestore", "Order Approvals"],
    priority: "CRITICAL",
    whereToGet: "https://console.firebase.google.com → Project settings → Service accounts → Generate new private key",
    requirements: [
      { key: "FIREBASE_CLIENT_EMAIL", label: "Service Account Client Email", whereToGet: "Service Account JSON (`client_email` field)" },
      { key: "FIREBASE_PRIVATE_KEY", label: "Service Account Private Key", whereToGet: "Service Account JSON (`private_key` field with \\n)" },
    ],
    ready: isFirebaseAdminConfigured,
    manualSteps: [
      "Firebase console → Project settings → Service accounts → Generate new private key.",
      "Set FIREBASE_CLIENT_EMAIL to the client_email.",
      "Set FIREBASE_PRIVATE_KEY to the full private_key (retain the \\n escapes).",
      "Without this key the server CANNOT verify sessions and will refuse to serve account data.",
    ],
  },
  {
    id: "google-drive",
    name: "Google Drive Storage Vault",
    group: "Storage",
    description: "5 TB studio cloud vault holding all master renders, commercial videos, 3D GLTF models, 360 virtual tours, and client deliverables.",
    features: ["5TB Media Vault", "3D Spatial Renders", "Commercial Video Storage", "High-Resolution Render Delivery", "Client Uploads"],
    priority: "CRITICAL",
    whereToGet: "https://console.cloud.google.com → Credentials → OAuth 2.0 Client IDs + Run scripts/get-drive-refresh-token.ts",
    requirements: [
      { key: "GOOGLE_DRIVE_CLIENT_ID", label: "Google Drive OAuth Client ID", whereToGet: "Google Cloud Console OAuth Client" },
      { key: "GOOGLE_DRIVE_CLIENT_SECRET", label: "Google Drive OAuth Client Secret", whereToGet: "Google Cloud Console OAuth Client" },
      { key: "GOOGLE_DRIVE_REFRESH_TOKEN", label: "Google Drive OAuth Refresh Token", whereToGet: "Generated once via scripts/get-drive-refresh-token.ts" },
      { key: "GOOGLE_DRIVE_ROOT_FOLDER_ID", label: "Root Vault Folder ID", whereToGet: "Created automatically or set to folder ID from Drive URL" },
    ],
    ready: isGoogleDriveConfigured,
    manualSteps: [
      "Google Cloud console → APIs & Services → Enable Google Drive API.",
      "OAuth consent screen → External → Add test user account.",
      "Credentials → Create OAuth client ID → Web application (redirect URI: https://sutrastudio-1.onrender.com/api/auth/drive or http://localhost:3000/api/auth/drive).",
      "Scope requested: https://www.googleapis.com/auth/drive.file (isolated access).",
      "Run `npx tsx scripts/get-drive-refresh-token.ts` once to generate GOOGLE_DRIVE_REFRESH_TOKEN.",
    ],
  },
  {
    id: "razorpay",
    name: "Razorpay Payment Gateway",
    group: "Payments",
    description: "Indian Rupee (INR) order checkout, subscription billing, payment verification, and refund management.",
    features: ["Online Checkout", "Order Settlement", "Invoices", "Monthly Retainer Billing", "Automated Refunds"],
    priority: "CRITICAL",
    whereToGet: "https://dashboard.razorpay.com → Settings → API Keys → Generate Key",
    requirements: [
      { key: "RAZORPAY_KEY_ID", label: "Razorpay Key ID", whereToGet: "Razorpay Dashboard API Keys" },
      { key: "RAZORPAY_KEY_SECRET", label: "Razorpay Key Secret", whereToGet: "Razorpay Dashboard API Keys" },
      { key: "NEXT_PUBLIC_RAZORPAY_KEY_ID", label: "Razorpay Public Key", whereToGet: "Mirrors RAZORPAY_KEY_ID for client checkout modal" },
    ],
    ready: isRazorpayConfigured,
    manualSteps: [
      "Razorpay dashboard → Account & Settings → API Keys → Generate Key ID and Key Secret.",
      "Copy Key ID to both RAZORPAY_KEY_ID and NEXT_PUBLIC_RAZORPAY_KEY_ID.",
      "Copy Key Secret to RAZORPAY_KEY_SECRET.",
    ],
  },
  {
    id: "razorpay-webhook",
    name: "Razorpay Webhooks",
    group: "Payments",
    description: "Server-to-server webhook confirmation for asynchronous payment settlement and recurring subscription charges.",
    features: ["Payment Webhook Handlers", "Instant Order Confirmation", "Subscription Auto-Charge Sync"],
    priority: "HIGH",
    whereToGet: "https://dashboard.razorpay.com → Webhooks → Add New Webhook (/api/payments/webhook)",
    requirements: [
      { key: "RAZORPAY_WEBHOOK_SECRET", label: "Webhook Signing Secret", whereToGet: "Razorpay Webhook configuration modal" },
    ],
    ready: isRazorpayWebhookConfigured,
    manualSteps: [
      "Razorpay dashboard → Webhooks → Add endpoint `/api/payments/webhook`.",
      "Subscribe to `payment.captured`, `payment.failed`, `subscription.charged`.",
      "Copy the secret string to RAZORPAY_WEBHOOK_SECRET.",
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini AI",
    group: "AI Providers",
    description: "Primary AI engine powering Sutra AI creative concierge, brief analysis, trend summarisation, and moderation.",
    features: ["Sutra AI Chat Concierge", "Client Brief Analysis", "Prompt Structuring", "Market Trend Summaries"],
    priority: "HIGH",
    whereToGet: "https://aistudio.google.com → Get API key",
    requirements: [
      { key: "GEMINI_API_KEY", label: "Gemini API Key", whereToGet: "Google AI Studio" },
    ],
    manualSteps: [
      "Visit https://aistudio.google.com and sign in.",
      "Click 'Get API key' → Create API key in project.",
      "Set GEMINI_API_KEY in .env.local.",
    ],
  },
  {
    id: "flux",
    name: "FLUX / BFL Pro",
    group: "AI Providers",
    description: "Photorealistic 4K key visuals, advertising campaigns, and social media creative graphics generator.",
    features: ["Discipline 1: Image Creation", "Discipline 7: Digital Marketing", "Ad Campaign Key Visuals"],
    priority: "HIGH",
    whereToGet: "https://api.bfl.ai → Dashboard → API Keys",
    requirements: [
      { key: "BFL_API_KEY", label: "Black Forest Labs API Key", whereToGet: "api.bfl.ai" },
    ],
    manualSteps: [
      "Register at https://api.bfl.ai.",
      "Generate an API Key under your developer dashboard.",
      "Set BFL_API_KEY in .env.local.",
    ],
  },
  {
    id: "kling",
    name: "Kling AI Video Engine",
    group: "AI Providers",
    description: "Cinematic commercial reels, text/image-to-video generation, and motion graphics rendering.",
    features: ["Discipline 2: Video Creation", "Commercial Motion Reels", "Story Reels"],
    priority: "HIGH",
    whereToGet: "https://klingai.com → Developer Console → API Key",
    requirements: [
      { key: "KLING_API_KEY", label: "Kling API Key", whereToGet: "Kling AI Developer Console" },
    ],
    manualSteps: [
      "Access Kling AI developer portal.",
      "Create Bearer API Key and set KLING_API_KEY in .env.local.",
    ],
  },
  {
    id: "tripo3d",
    name: "Tripo3D Spatial Engine",
    group: "AI Providers",
    description: "Interactive 3D GLTF / USDZ / OBJ spatial model generation from briefs and 2D concepts.",
    features: ["Discipline 3: 3D Modeling", "Discipline 4: 360 View", "Interactive GLTF Previews"],
    priority: "HIGH",
    whereToGet: "https://tripo3d.ai → API Platform → Key",
    requirements: [
      { key: "TRIPO3D_API_KEY", label: "Tripo3D API Key", whereToGet: "tripo3d.ai Developer Hub" },
    ],
    manualSteps: [
      "Register at https://tripo3d.ai.",
      "Generate API Key and configure TRIPO3D_API_KEY in .env.local.",
    ],
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs Voice Synthesis",
    group: "AI Providers",
    description: "Studio voiceover audio generation for commercial reels and video advertisements.",
    features: ["Commercial Voiceovers", "Discipline 2 Audio", "Narration Tracks"],
    priority: "MEDIUM",
    whereToGet: "https://elevenlabs.io → Profile → API Keys",
    requirements: [
      { key: "ELEVENLABS_API_KEY", label: "ElevenLabs API Key", whereToGet: "elevenlabs.io" },
    ],
    manualSteps: [
      "Sign in to ElevenLabs.",
      "Profile Settings → API Keys → Generate new key.",
    ],
  },
  {
    id: "serpapi",
    name: "SerpAPI Trend Intelligence",
    group: "AI Providers",
    description: "Regional market trend research and competitor intelligence for the studio daily content engine.",
    features: ["Daily Content Engine", "Market Intelligence", "SEO & Hashtag Research"],
    priority: "MEDIUM",
    whereToGet: "https://serpapi.com → Dashboard → API Key",
    requirements: [
      { key: "SERPAPI_API_KEY", label: "SerpAPI Key", whereToGet: "serpapi.com" },
    ],
    manualSteps: [
      "Create an account at https://serpapi.com.",
      "Copy private API key from dashboard into SERPAPI_API_KEY.",
    ],
  },
  {
    id: "zoho-smtp",
    name: "Zoho Mail SMTP (Primary Email)",
    group: "Notifications",
    description: "Zero-cost direct TLS SMTP delivery using your Zoho Mailbox for transactional emails, notifications, and client communications.",
    features: ["Client Invoices & Receipts", "Deliverable Ready Alerts", "Admin Security Alerts", "Client Contact Reply-To"],
    priority: "CRITICAL",
    whereToGet: "Zoho Mail (https://mail.zoho.in) → Settings → Mail Accounts → Security → App Passwords",
    requirements: [
      { key: "SMTP_HOST", label: "SMTP Host Server", whereToGet: "Set to `smtppro.zoho.in` (India) or `smtp.zoho.com`" },
      { key: "SMTP_PORT", label: "SMTP TLS Port", whereToGet: "Set to `465` (SSL/TLS) or `587` (STARTTLS)" },
      { key: "SMTP_USER", label: "SMTP Account Email", whereToGet: "Set to your Zoho email (e.g. `yashjoshi20@zohomail.in`)" },
      { key: "SMTP_APP_PASSWORD", label: "Zoho App-Specific Password", whereToGet: "Generated from Zoho Account Security → App Passwords" },
      { key: "EMAIL_FROM", label: "Default Sender Email", whereToGet: "Matches your Zoho email or studio sender" },
    ],
    ready: isSmtpConfigured,
    manualSteps: [
      "Log in to Zoho Mail (mail.zoho.in or mail.zoho.com).",
      "Go to My Account → Security → App Passwords → Generate New Password (Name: 'SutraStudio').",
      "Copy the 16-character generated password into SMTP_APP_PASSWORD in .env.local.",
      "Set SMTP_HOST=smtppro.zoho.in, SMTP_PORT=465, and SMTP_USER=your-email@zohomail.in.",
    ],
  },
  {
    id: "resend",
    name: "Resend Email Dispatcher",
    group: "Notifications",
    description: "Transactional emails for client onboarding, payment receipts, deliverable approvals, and missing-key alerts.",
    features: ["Client Invoices", "Deliverable Alerts", "Admin Missing-Key Daily Notice", "Password Resets"],
    priority: "HIGH",
    whereToGet: "https://resend.com → API Keys & Domains",
    requirements: [
      { key: "RESEND_API_KEY", label: "Resend API Key", whereToGet: "resend.com API Keys" },
      { key: "EMAIL_FROM", label: "Verified Sender Email", whereToGet: "Verified domain sender (e.g. concierge@sutrastudio.com)" },
    ],
    ready: isResendConfigured,
    manualSteps: [
      "Create an account at https://resend.com.",
      "Add and verify DNS records for your domain under Domains.",
      "Create API key and configure RESEND_API_KEY and EMAIL_FROM in .env.local.",
    ],
  },
  {
    id: "sendgrid",
    name: "SendGrid Email (Fallback)",
    group: "Notifications",
    description: "Secondary email provider fallback for transactional messaging.",
    features: ["Transactional Email Fallback"],
    priority: "LOW",
    whereToGet: "https://app.sendgrid.com → Settings → API Keys",
    requirements: [
      { key: "SENDGRID_API_KEY", label: "SendGrid API Key", whereToGet: "SendGrid API Keys" },
    ],
    ready: isSendgridConfigured,
  },
  {
    id: "web-push",
    name: "Web Push (FCM / VAPID)",
    group: "Notifications",
    description: "Browser web push notifications for real-time delivery notices and chat takeover.",
    features: ["PWA Web Push", "Live Chat Alerts", "Deliverable Ready Notifications"],
    priority: "MEDIUM",
    whereToGet: "https://console.firebase.google.com → Project Settings → Cloud Messaging → Web Push certificates",
    requirements: [
      { key: "NEXT_PUBLIC_FIREBASE_VAPID_KEY", label: "Firebase VAPID Public Key", whereToGet: "Firebase Cloud Messaging Web Push Certificates" },
    ],
    ready: isPushConfigured,
  },
  {
    id: "n8n",
    name: "n8n Workflow Automation",
    group: "Automation",
    description: "Background orchestration engine handling W1-W8 automated order fulfillment, approval hooks, and monthly retainer dispatch.",
    features: ["W1-W8 Orchestration", "Async Background Fulfillment", "Admin Approval Webhooks", "Discipline 12: AI Automation"],
    priority: "HIGH",
    whereToGet: "Local n8n instance (http://localhost:5678) or Cloud n8n Dashboard",
    requirements: [
      { key: "N8N_BASE_URL", label: "n8n Instance URL", whereToGet: "http://localhost:5678 or your hosted n8n URL" },
      { key: "N8N_WEBHOOK_SECRET", label: "n8n HMAC Secret", whereToGet: "32-byte secret generated via `openssl rand -hex 32`" },
      { key: "N8N_API_KEY", label: "n8n API Key", whereToGet: "n8n Settings → n8n API" },
    ],
    ready: () => isN8nConfigured() && isN8nAuthConfigured(),
    manualSteps: [
      "Launch n8n instance.",
      "Generate HMAC secret and set N8N_WEBHOOK_SECRET.",
      "Set N8N_BASE_URL to the n8n endpoint.",
    ],
  },
  {
    id: "meta",
    name: "Meta Ads & Publishing",
    group: "Social",
    description: "Direct ad campaign launching (Discipline 8) and Facebook/Instagram content publishing.",
    features: ["Discipline 8: Meta Ads Launcher", "Social Content Publishing", "Instagram Campaign Sync"],
    priority: "MEDIUM",
    whereToGet: "https://developers.facebook.com → Apps → App Dashboard",
    requirements: [
      { key: "META_APP_ID", label: "Meta App ID", whereToGet: "Meta for Developers Dashboard" },
      { key: "META_APP_SECRET", label: "Meta App Secret", whereToGet: "Meta App Settings → Basic" },
      { key: "META_PAGE_ACCESS_TOKEN", label: "Meta Page Access Token", whereToGet: "Graph API Explorer / App OAuth" },
    ],
    ready: isMetaConfigured,
  },
  {
    id: "groq",
    name: "Groq Fast Inference",
    group: "AI Providers",
    description: "Ultra-low latency LLM fallback for conversational chat concierge.",
    features: ["Fast Chat Fallback", "Concierge Fallback"],
    priority: "MEDIUM",
    whereToGet: "https://console.groq.com → API Keys",
    requirements: [{ key: "GROQ_API_KEY", label: "Groq API Key", whereToGet: "console.groq.com" }],
  },
  {
    id: "cerebras",
    name: "Cerebras Inference",
    group: "AI Providers",
    description: "High-speed inference fallback provider for text analysis and RAG acceleration.",
    features: ["RAG Acceleration", "High-Speed Fallback"],
    priority: "LOW",
    whereToGet: "https://cloud.cerebras.ai → API Keys",
    requirements: [{ key: "CEREBRAS_API_KEY", label: "Cerebras API Key", whereToGet: "cloud.cerebras.ai" }],
  },
  {
    id: "openai",
    name: "OpenAI Platform",
    group: "AI Providers",
    description: "Optional secondary chat and copywriting fallback.",
    features: ["Copywriting Fallback", "Secondary Chat Fallback"],
    priority: "LOW",
    whereToGet: "https://platform.openai.com → API Keys",
    requirements: [{ key: "OPENAI_API_KEY", label: "OpenAI API Key", whereToGet: "platform.openai.com" }],
  },
  {
    id: "security-enclave",
    name: "Security & Administrative Controls",
    group: "Security",
    description: "Security credentials safeguarding admin lockdown, cron execution, and at-rest token encryption.",
    features: ["Admin Lockout Defense", "Scheduled Cron Authentication", "AES-256-GCM Token Encryption"],
    priority: "CRITICAL",
    whereToGet: "Generated locally via openssl and specified in .env.local",
    requirements: [
      { key: "ADMIN_ALLOWED_EMAILS", label: "Admin Allowed Emails", whereToGet: "Comma-separated list containing `yashjoshi20@zohomail.in`" },
      { key: "ADMIN_NOTIFY_EMAIL", label: "Admin Notification Email", whereToGet: "Set to `yashjoshi20@zohomail.in`" },
      { key: "CRON_SECRET", label: "Cron Authentication Secret", whereToGet: "Generate via `openssl rand -hex 32`" },
      { key: "TOKEN_ENCRYPTION_KEY", label: "AES Token Encryption Key", whereToGet: "Generate via `openssl rand -base64 32`" },
    ],
  },
];

export function getIntegrationDefinitions(): IntegrationDefinition[] {
  return INTEGRATION_DEFINITIONS;
}

export function getIntegration(id: string): IntegrationDefinition | undefined {
  return INTEGRATION_DEFINITIONS.find((def) => def.id === id);
}

export function getIntegrationStatuses(): IntegrationStatus[] {
  return INTEGRATION_DEFINITIONS.map((def) => {
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
      features: def.features,
      priority: def.priority,
      state,
      whereToGet: def.whereToGet,
      missingKeys,
      presentKeys,
      manualSteps: def.manualSteps ?? [],
    };
  });
}

export function getIntegrationSummary() {
  const all = getIntegrationStatuses();
  const configured = all.filter((i) => i.state === "configured").length;
  const missing = all.length - configured;
  const criticalMissing = all
    .filter((i) => i.state === "not configured" && i.priority === "CRITICAL")
    .map((i) => i.name);
  const highMissing = all
    .filter((i) => i.state === "not configured" && i.priority === "HIGH")
    .map((i) => i.name);

  // Flatten all unique missing key names
  const allMissingKeySet = new Set<EnvKey>();
  for (const item of all) {
    for (const k of item.missingKeys) {
      allMissingKeySet.add(k);
    }
  }

  return {
    total: all.length,
    configured,
    missing,
    criticalMissing,
    highMissing,
    allMissingKeys: Array.from(allMissingKeySet),
  };
}