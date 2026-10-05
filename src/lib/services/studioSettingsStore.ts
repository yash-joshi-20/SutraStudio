/**
 * SUTRA STUDIO — Master Studio Settings Store
 * Manages administrative studio configurations: GST enablement, refund policies,
 * coupons toggle, and commission limits.
 */

import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";

export interface StudioSettings {
  enableGst: boolean;
  gstPercentage: number;
  studioGstin?: string;
  studioLegalName: string;
  studioState: string;
  couponsEnabled: boolean;
  refundPolicy: {
    refundBeforeKickoffPercentage: number; // e.g. 100% before kickoff
    refundInDraftPercentage: number; // e.g. 50% during draft
    refundAfterApprovalPercentage: number; // 0%
    processingDays: number;
  };
  pricingModel: {
    allowCustomQuotes: boolean;
    defaultCurrency: "INR";
    expressDeliveryMultiplier: number;
  };
}

const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
  enableGst: false, // Optional: Shown only if enabled by admin
  gstPercentage: 18,
  studioGstin: "24AAAAA0000A1Z5",
  studioLegalName: "Sutra Studio Technologies LLP",
  studioState: "Gujarat",
  couponsEnabled: true,
  refundPolicy: {
    refundBeforeKickoffPercentage: 100,
    refundInDraftPercentage: 50,
    refundAfterApprovalPercentage: 0,
    processingDays: 5,
  },
  pricingModel: {
    allowCustomQuotes: true,
    defaultCurrency: "INR",
    expressDeliveryMultiplier: 1.35,
  },
};

const globalAny = globalThis as any;

if (!globalAny.__SUTRA_STUDIO_SETTINGS__) {
  globalAny.__SUTRA_STUDIO_SETTINGS__ = { ...DEFAULT_STUDIO_SETTINGS };
}

async function persistStudioSettingsToFirestore(settings: StudioSettings): Promise<void> {
  if (!isFirebaseAdminReady()) return;
  try {
    const db = adminDb();
    await db.collection("settings").doc("studio").set(settings, { merge: true });
  } catch (err) {
    console.warn("[StudioSettingsStore] Failed to persist settings to Firestore:", err);
  }
}

export class StudioSettingsStore {
  public static async syncFromFirestore(): Promise<StudioSettings> {
    if (!isFirebaseAdminReady()) {
      return globalAny.__SUTRA_STUDIO_SETTINGS__;
    }

    try {
      const db = adminDb();
      const doc = await db.collection("settings").doc("studio").get();
      if (doc.exists) {
        globalAny.__SUTRA_STUDIO_SETTINGS__ = {
          ...DEFAULT_STUDIO_SETTINGS,
          ...doc.data(),
        };
      }
    } catch (err) {
      console.warn("[StudioSettingsStore] sync error:", err);
    }
    return globalAny.__SUTRA_STUDIO_SETTINGS__;
  }

  public static getSettings(): StudioSettings {
    return globalAny.__SUTRA_STUDIO_SETTINGS__;
  }

  public static updateSettings(updates: Partial<StudioSettings>): StudioSettings {
    globalAny.__SUTRA_STUDIO_SETTINGS__ = {
      ...globalAny.__SUTRA_STUDIO_SETTINGS__,
      ...updates,
      refundPolicy: {
        ...globalAny.__SUTRA_STUDIO_SETTINGS__.refundPolicy,
        ...(updates.refundPolicy || {}),
      },
      pricingModel: {
        ...globalAny.__SUTRA_STUDIO_SETTINGS__.pricingModel,
        ...(updates.pricingModel || {}),
      },
    };
    persistStudioSettingsToFirestore(globalAny.__SUTRA_STUDIO_SETTINGS__).catch(() => {});
    return globalAny.__SUTRA_STUDIO_SETTINGS__;
  }
}
