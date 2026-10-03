/**
 * SUTRA STUDIO — Environment Configuration Validator & Startup Check
 * Audits presence of required and optional environment keys on server startup.
 * SECURITY: NEVER prints, logs, or returns secret values.
 */

export interface EnvValidationReport {
  isValid: boolean;
  environment: string;
  configuredKeysCount: number;
  missingRequired: string[];
  missingOptional: string[];
  clientExposedKeys: string[];
}

const REQUIRED_SERVER_VARS = [
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

const OPTIONAL_INTEGRATION_VARS = [
  "APP_BASE_URL",
  "ADMIN_EMAIL",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_SERVICE_ACCOUNT",
  "GOOGLE_APPLICATION_CREDENTIALS",
  "RAZORPAY_WEBHOOK_SECRET",
  "GOOGLE_DRIVE_ROOT_FOLDER_ID",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "GEMINI_API_KEY",
  "IMAGE_PROVIDER_API_KEY",
  "KLING_ACCESS_KEY",
  "KLING_SECRET_KEY",
  "ELEVENLABS_API_KEY",
  "SERPAPI_API_KEY",
  "OPENAI_API_KEY",
  "GROQ_API_KEY",
  "BFL_API_KEY",
  "SAMBANOVA_API_KEY",
  "RUNWAY_API_KEY",
  "HEYGEN_API_KEY",
  "META_APP_ID",
  "META_APP_SECRET",
  "META_GRAPH_ACCESS_TOKEN",
  "N8N_BASE_URL",
  "N8N_WEBHOOK_SECRET",
  "N8N_API_KEY",
  "EMAIL_PROVIDER_API_KEY",
  "SENDGRID_API_KEY",
  "CRON_SECRET",
];

export function validateEnvironment(): EnvValidationReport {
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];
  const clientExposedKeys: string[] = [];
  let configuredCount = 0;

  for (const key of REQUIRED_SERVER_VARS) {
    const val = process.env[key];
    if (!val || val.trim() === "" || val.includes("example") || val.includes("placeholder")) {
      missingRequired.push(key);
    } else {
      configuredCount++;
    }
  }

  for (const key of OPTIONAL_INTEGRATION_VARS) {
    const val = process.env[key];
    if (!val || val.trim() === "" || val.includes("example") || val.includes("placeholder")) {
      missingOptional.push(key);
    } else {
      configuredCount++;
    }
  }

  // Scan for client-exposed variables (NEXT_PUBLIC_*)
  if (typeof process !== "undefined" && process.env) {
    for (const key of Object.keys(process.env)) {
      if (key.startsWith("NEXT_PUBLIC_")) {
        clientExposedKeys.push(key);
      }
    }
  }

  return {
    isValid: missingRequired.length === 0,
    environment: process.env.NODE_ENV || "development",
    configuredKeysCount: configuredCount,
    missingRequired,
    missingOptional,
    clientExposedKeys,
  };
}

/**
 * Runs startup log check safely without revealing credentials
 */
export function runStartupEnvCheck(): void {
  if (process.env.NODE_ENV === "production") {
    const report = validateEnvironment();
    if (!report.isValid) {
      console.warn(
        `[Sutra Studio Security] Startup Check: ${report.missingRequired.length} required variable(s) not set: [${report.missingRequired.join(", ")}]. Ensure production .env is configured.`
      );
    } else {
      console.log(`[Sutra Studio Security] Environment validated. ${report.configuredKeysCount} keys recognized.`);
    }
  }
}
