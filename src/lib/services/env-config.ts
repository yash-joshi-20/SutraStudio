/**
 * SUTRA STUDIO — Environment Configuration & Diagnostics
 * Centralized, type-safe loader for all application environment variables.
 */

export interface SutraEnvConfig {
  appUrl: string;
  isProduction: boolean;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    isConfigured: boolean;
  };
  googleDrive: {
    rootFolderId: string;
    clientEmail: string;
    isConfigured: boolean;
  };
  payments: {
    razorpayKeyId: string;
    isRazorpayActive: boolean;
    isStripeActive: boolean;
  };
  aiEngine: {
    isOpenAIConfigured: boolean;
    isPineconeConfigured: boolean;
    isGeminiConfigured: boolean;
    geminiModel: string;
  };
}

export function getSutraConfig(): SutraEnvConfig {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sutra-studio-production";
  const driveRoot = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || "";
  const driveEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL || "";
  const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";

  return {
    appUrl: process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://sutrastudio.com",
    isProduction: process.env.NODE_ENV === "production",
    firebase: {
      apiKey,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
      isConfigured: !!apiKey,
    },
    googleDrive: {
      rootFolderId: driveRoot,
      clientEmail: driveEmail,
      isConfigured: !!(driveRoot && driveEmail),
    },
    payments: {
      razorpayKeyId: rzpKey,
      isRazorpayActive: !!rzpKey,
      isStripeActive: !!process.env.STRIPE_SECRET_KEY,
    },
    aiEngine: {
      isOpenAIConfigured: !!process.env.OPENAI_API_KEY,
      isPineconeConfigured: !!process.env.PINECONE_API_KEY,
      isGeminiConfigured: !!process.env.GEMINI_API_KEY,
      geminiModel: process.env.GEMINI_CHAT_MODEL || "gemini-2.0-flash",
    },
  };
}
