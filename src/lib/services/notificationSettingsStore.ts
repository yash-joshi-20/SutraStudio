/**
 * SUTRA STUDIO — Notification Settings & Thresholds Store
 * Stores configurable reminder intervals and delivery channel preferences in Firestore/memory.
 */

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
  adminEmail: "admin@sutrastudio.com",
  updatedAt: new Date().toISOString(),
};

const globalAny = globalThis as any;

if (!globalAny.__SUTRA_NOTIFICATION_SETTINGS__) {
  globalAny.__SUTRA_NOTIFICATION_SETTINGS__ = { ...DEFAULT_NOTIFICATION_SETTINGS };
}

export class NotificationSettingsStore {
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
    return updated;
  }
}
