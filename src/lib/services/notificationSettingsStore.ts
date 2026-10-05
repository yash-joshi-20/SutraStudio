/**
 * SUTRA STUDIO — Notification Settings & Thresholds Store
 * Stores configurable reminder intervals and delivery channel preferences in Firestore/memory.
 */

import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";

export interface StudioNotificationSettings {
  monthlyReminderDays: number[]; // e.g. [5, 1]
  draftReviewReminderDays: number; // e.g. 3
  unpaidReminderHours: number; // e.g. 24
  dueDateWarningDays: number; // e.g. 2
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  clientRemindersEnabled: boolean;
  adminAlertsEnabled: boolean;
  timezone: string;
  adminEmail: string;
  updatedAt: string;
}

export const DEFAULT_NOTIFICATION_SETTINGS: StudioNotificationSettings = {
  monthlyReminderDays: [5, 1],
  draftReviewReminderDays: 3,
  unpaidReminderHours: 24,
  dueDateWarningDays: 2,
  emailNotificationsEnabled: true,
  inAppNotificationsEnabled: true,
  clientRemindersEnabled: true,
  adminAlertsEnabled: true,
  timezone: "Asia/Kolkata",
  adminEmail: "yashjoshi20@zohomail.in",
  updatedAt: new Date().toISOString(),
};

const globalAny = globalThis as any;

if (!globalAny.__SUTRA_NOTIFICATION_SETTINGS__) {
  globalAny.__SUTRA_NOTIFICATION_SETTINGS__ = { ...DEFAULT_NOTIFICATION_SETTINGS };
}

async function persistSettingsToFirestore(settings: StudioNotificationSettings): Promise<void> {
  if (!isFirebaseAdminReady()) return;
  try {
    const db = adminDb();
    await db.collection("settings").doc("notifications").set(settings, { merge: true });
  } catch (err) {
    console.warn("[NotificationSettingsStore] Failed to persist settings to Firestore:", err);
  }
}

export class NotificationSettingsStore {
  public static async syncFromFirestore(): Promise<StudioNotificationSettings> {
    if (!isFirebaseAdminReady()) {
      return { ...(globalAny.__SUTRA_NOTIFICATION_SETTINGS__ as StudioNotificationSettings) };
    }

    try {
      const db = adminDb();
      const doc = await db.collection("settings").doc("notifications").get();
      if (doc.exists) {
        globalAny.__SUTRA_NOTIFICATION_SETTINGS__ = {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          ...doc.data(),
        };
      }
    } catch (err) {
      console.warn("[NotificationSettingsStore] sync error:", err);
    }
    return { ...(globalAny.__SUTRA_NOTIFICATION_SETTINGS__ as StudioNotificationSettings) };
  }

  public static getSettings(): StudioNotificationSettings {
    return { ...(globalAny.__SUTRA_NOTIFICATION_SETTINGS__ as StudioNotificationSettings) };
  }

  public static updateSettings(partial: Partial<StudioNotificationSettings>): StudioNotificationSettings {
    const current = globalAny.__SUTRA_NOTIFICATION_SETTINGS__ as StudioNotificationSettings;
    const updated: StudioNotificationSettings = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    globalAny.__SUTRA_NOTIFICATION_SETTINGS__ = updated;
    persistSettingsToFirestore(updated).catch(() => {});
    return updated;
  }
}
