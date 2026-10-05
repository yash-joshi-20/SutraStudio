/**
 * SUTRA STUDIO — Real-Time In-App & Email Notifications Store
 * Manages order lifecycle notifications, scheduled alerts, and idempotency for Clients and Studio Administrators.
 */

import { EmailService } from "./emailProvider";
import { NotificationSettingsStore } from "./notificationSettingsStore";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";

export type NotificationType =
  | "order_placed"
  | "order_paid"
  | "payment_failed"
  | "order_in_progress"
  | "order_delivered"
  | "order_approved"
  | "order_completed"
  | "revision_requested"
  | "status_update"
  | "order_comment"
  | "assets_uploaded"
  | "monthly_expiring_5d"
  | "monthly_expiring_1d"
  | "monthly_expired"
  | "trial_ending_1d"
  | "trial_converted"
  | "trial_cancelled"
  | "draft_review_reminder"
  | "unpaid_reminder"
  | "order_due_warning"
  | "order_overdue";

export interface StudioNotification {
  id: string;
  userId: string; // Target recipient: "admin" or client UID
  type: NotificationType;
  title: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  actionUrl?: string;
  actionLabel?: string;
  idempotencyKey?: string;
  emailSent?: boolean;
  read: boolean;
  createdAt: string;
  readAt?: string;
  metadata?: Record<string, any>;
}

const INITIAL_NOTIFICATIONS: StudioNotification[] = [];

const globalAny = globalThis as any;

if (!globalAny.__SUTRA_NOTIFICATIONS__) {
  globalAny.__SUTRA_NOTIFICATIONS__ = [...INITIAL_NOTIFICATIONS];
}

if (!globalAny.__SUTRA_NOTIFS_LAST_SYNC__) {
  globalAny.__SUTRA_NOTIFS_LAST_SYNC__ = 0;
}

async function persistNotificationToFirestore(notification: StudioNotification): Promise<void> {
  if (!isFirebaseAdminReady()) return;
  try {
    const db = adminDb();
    await db.collection("notifications").doc(notification.id).set(notification, { merge: true });
  } catch (err) {
    console.warn(`[NotificationsStore] Failed to persist notification ${notification.id} to Firestore:`, err);
  }
}

export class NotificationsStore {
  public static async syncFromFirestore(userId?: string, force = false): Promise<StudioNotification[]> {
    if (!isFirebaseAdminReady()) {
      return this.getAll(userId);
    }

    const now = Date.now();
    if (!force && now - globalAny.__SUTRA_NOTIFS_LAST_SYNC__ < 3000) {
      return this.getAll(userId);
    }

    try {
      const db = adminDb();
      let query: FirebaseFirestore.Query = db.collection("notifications");
      if (userId && userId !== "admin") {
        query = query.where("userId", "==", userId);
      }
      const snapshot = await query.get();
      const loaded: StudioNotification[] = [];
      snapshot.forEach((doc) => {
        loaded.push(doc.data() as StudioNotification);
      });

      loaded.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      // Merge into in-memory list
      const current = globalAny.__SUTRA_NOTIFICATIONS__ as StudioNotification[];
      const mergedMap = new Map<string, StudioNotification>();
      for (const item of loaded) mergedMap.set(item.id, item);
      for (const item of current) {
        if (!mergedMap.has(item.id)) mergedMap.set(item.id, item);
      }
      globalAny.__SUTRA_NOTIFICATIONS__ = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      globalAny.__SUTRA_NOTIFS_LAST_SYNC__ = now;
      return this.getAll(userId);
    } catch (err) {
      console.warn("[NotificationsStore] syncFromFirestore warning:", err);
      return this.getAll(userId);
    }
  }

  public static getAll(userId?: string): StudioNotification[] {
    const all = globalAny.__SUTRA_NOTIFICATIONS__ as StudioNotification[];
    if (!userId) return all;
    return all.filter(
      (n) =>
        n.userId === userId ||
        (userId === "admin" && (n.userId === "admin" || n.userId === "usr_admin_001"))
    );
  }

  public static getUnreadCount(userId: string): number {
    return this.getAll(userId).filter((n) => !n.read).length;
  }

  public static hasIdempotencyKey(key: string): boolean {
    if (!key) return false;
    const all = globalAny.__SUTRA_NOTIFICATIONS__ as StudioNotification[];
    return all.some((n) => n.idempotencyKey === key);
  }

  public static async addWithIdempotency(
    notification: Omit<StudioNotification, "id" | "createdAt" | "read"> & {
      read?: boolean;
      createdAt?: string;
      recipientEmail?: string;
    }
  ): Promise<{ notification: StudioNotification | null; duplicate: boolean }> {
    if (notification.idempotencyKey && this.hasIdempotencyKey(notification.idempotencyKey)) {
      return { notification: null, duplicate: true };
    }

    const created = await this.add(notification);
    return { notification: created, duplicate: false };
  }

  public static add(
    notification: Omit<StudioNotification, "id" | "createdAt" | "read"> & {
      read?: boolean;
      createdAt?: string;
      recipientEmail?: string;
    }
  ): StudioNotification {
    const settings = NotificationSettingsStore.getSettings();

    const record: StudioNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: notification.createdAt || new Date().toISOString(),
      read: notification.read ?? false,
      emailSent: false,
      ...notification,
    };

    globalAny.__SUTRA_NOTIFICATIONS__.unshift(record);
    persistNotificationToFirestore(record).catch(() => {});

    // Dispatch email asynchronously if enabled
    if (settings.emailNotificationsEnabled) {
      const emailRecipient =
        notification.recipientEmail ||
        (notification.userId === "admin" || notification.userId === "usr_admin_001"
          ? settings.adminEmail
          : undefined);

      if (emailRecipient) {
        EmailService.dispatchNotificationEmail({
          to: emailRecipient,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          orderNumber: notification.orderNumber,
          actionUrl: notification.actionUrl,
          actionLabel: notification.actionLabel,
        })
          .then((res) => {
            if (res.success) {
              record.emailSent = true;
              persistNotificationToFirestore(record).catch(() => {});
            }
          })
          .catch((err) => {
            console.warn(`[NotificationsStore] Email dispatch omitted: ${err.message}`);
          });
      }
    }

    return record;
  }

  public static markAsRead(id: string, userId?: string): boolean {
    const list = globalAny.__SUTRA_NOTIFICATIONS__ as StudioNotification[];
    const item = list.find(
      (n) =>
        n.id === id &&
        (!userId ||
          n.userId === userId ||
          (userId === "admin" && (n.userId === "admin" || n.userId === "usr_admin_001")))
    );
    if (item) {
      item.read = true;
      item.readAt = new Date().toISOString();
      persistNotificationToFirestore(item).catch(() => {});
      return true;
    }
    return false;
  }

  public static markAllAsRead(userId: string): number {
    const list = globalAny.__SUTRA_NOTIFICATIONS__ as StudioNotification[];
    let count = 0;
    for (const n of list) {
      if (
        (n.userId === userId ||
          (userId === "admin" && (n.userId === "admin" || n.userId === "usr_admin_001"))) &&
        !n.read
      ) {
        n.read = true;
        n.readAt = new Date().toISOString();
        persistNotificationToFirestore(n).catch(() => {});
        count++;
      }
    }
    return count;
  }
}
