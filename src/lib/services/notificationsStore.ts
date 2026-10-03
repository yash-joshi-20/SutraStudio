/**
 * SUTRA STUDIO — Real-Time In-App & Email Notifications Store
 * Manages order lifecycle notifications, scheduled alerts, and idempotency for Clients and Studio Administrators.
 */

import { EmailService } from "./emailProvider";
import { NotificationSettingsStore } from "./notificationSettingsStore";

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
  userId: string; // Target recipient: "usr_admin_001" / "admin" or client UID
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

const INITIAL_NOTIFICATIONS: StudioNotification[] = [
  {
    id: "notif_001",
    userId: "usr_admin_001",
    type: "order_paid",
    title: "New Commission Paid",
    message: "Client Yash Joshi settled ₹9,499 for 3D Spatial Architecture (#ORD-001).",
    orderId: "ord_001",
    orderNumber: "ORD-2026-0001",
    actionUrl: "/admin",
    actionLabel: "View Order in Hub",
    idempotencyKey: "init_001",
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "notif_002",
    userId: "usr_mock_001",
    type: "order_delivered",
    title: "Deliverables Ready for Review",
    message: "Render Pass 02 for #ORD-001 has been uploaded to your Media Vault.",
    orderId: "ord_001",
    orderNumber: "ORD-2026-0001",
    actionUrl: "/orders",
    actionLabel: "Review Draft Deliverables",
    idempotencyKey: "init_002",
    read: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

const globalAny = globalThis as any;

if (!globalAny.__SUTRA_NOTIFICATIONS__) {
  globalAny.__SUTRA_NOTIFICATIONS__ = [...INITIAL_NOTIFICATIONS];
}

export class NotificationsStore {
  public static getAll(userId?: string): StudioNotification[] {
    const all = globalAny.__SUTRA_NOTIFICATIONS__ as StudioNotification[];
    if (!userId) return all;
    return all.filter(
      (n) =>
        n.userId === userId ||
        (userId === "admin" && (n.userId === "usr_admin_001" || n.userId === "admin")) ||
        (userId === "usr_admin_001" && (n.userId === "usr_admin_001" || n.userId === "admin"))
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
            if (res.success) record.emailSent = true;
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
          (userId === "admin" && (n.userId === "usr_admin_001" || n.userId === "admin")) ||
          (userId === "usr_admin_001" && (n.userId === "usr_admin_001" || n.userId === "admin")))
    );
    if (item) {
      item.read = true;
      item.readAt = new Date().toISOString();
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
          (userId === "admin" && (n.userId === "usr_admin_001" || n.userId === "admin")) ||
          (userId === "usr_admin_001" && (n.userId === "usr_admin_001" || n.userId === "admin"))) &&
        !n.read
      ) {
        n.read = true;
        n.readAt = new Date().toISOString();
        count++;
      }
    }
    return count;
  }
}
