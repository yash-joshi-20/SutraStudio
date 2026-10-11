"use client";

/**
 * SUTRA STUDIO — Real-Time Synchronization & Offline Caching Hub
 *
 * Provides sub-second cross-window/cross-tab state replication, offline caching,
 * reconnection replay, and unified push notification dispatch for Orders, Status,
 * Profiles, and Notifications.
 */

export type SyncEventType =
  | "ORDERS_UPDATED"
  | "ORDER_STATUS_CHANGED"
  | "PROFILE_UPDATED"
  | "NOTIFICATIONS_UPDATED"
  | "NOTIFICATION_READ"
  | "CATALOG_UPDATED"
  | "OFFLINE_MUTATION_QUEUED"
  | "OFFLINE_QUEUE_FLUSHED";

export interface SyncMessage<T = any> {
  type: SyncEventType;
  payload: T;
  timestamp: string;
  sourceId: string;
}

export interface OfflineMutation {
  id: string;
  endpoint: string;
  method: "POST" | "PATCH" | "PUT" | "DELETE";
  body: any;
  queuedAt: string;
  description: string;
}

const STORAGE_KEYS = {
  ORDERS: "sutra_cache_orders",
  PROFILE: "sutra_cache_profile",
  NOTIFICATIONS: "sutra_cache_notifications",
  UNREAD_COUNT: "sutra_cache_unread_count",
  CATALOG: "sutra_cache_catalog",
  OFFLINE_QUEUE: "sutra_cache_offline_queue",
  MUTED: "sutra_sound_muted",
} as const;

class RealtimeSyncManager {
  private channel: BroadcastChannel | null = null;
  private clientId: string;
  private listeners: Map<SyncEventType, Set<(payload: any) => void>> = new Map();
  private isOnlineStatus: boolean = true;

  constructor() {
    this.clientId = typeof window !== "undefined"
      ? `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      : "server";

    if (typeof window !== "undefined") {
      this.isOnlineStatus = navigator.onLine;
      this.initBroadcastChannel();
      this.initNetworkListeners();
      this.initStorageListener();
    }
  }

  private initBroadcastChannel() {
    try {
      if (typeof BroadcastChannel !== "undefined") {
        this.channel = new BroadcastChannel("sutra_realtime_sync");
        this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
          this.handleIncomingMessage(event.data);
        };
      }
    } catch (e) {
      console.warn("[SyncService] BroadcastChannel unavailable, using storage events:", e);
    }
  }

  private initNetworkListeners() {
    window.addEventListener("online", () => {
      this.isOnlineStatus = true;
      window.dispatchEvent(new CustomEvent("sutra_network_status", { detail: { isOnline: true } }));
      this.flushOfflineQueue().catch(() => {});
      this.broadcast("ORDERS_UPDATED", { source: "reconnect" });
      this.broadcast("NOTIFICATIONS_UPDATED", { source: "reconnect" });
    });

    window.addEventListener("offline", () => {
      this.isOnlineStatus = false;
      window.dispatchEvent(new CustomEvent("sutra_network_status", { detail: { isOnline: false } }));
    });
  }

  private initStorageListener() {
    window.addEventListener("storage", (event) => {
      if (!event.key) return;

      if (event.key === STORAGE_KEYS.ORDERS) {
        window.dispatchEvent(new CustomEvent("sutra_orders_changed", { detail: { fromStorage: true } }));
      } else if (event.key === STORAGE_KEYS.PROFILE) {
        window.dispatchEvent(new CustomEvent("sutra_profile_changed", { detail: { fromStorage: true } }));
      } else if (event.key === STORAGE_KEYS.NOTIFICATIONS) {
        window.dispatchEvent(new CustomEvent("sutra_notifications_changed", { detail: { fromStorage: true } }));
      }
    });
  }

  private handleIncomingMessage(msg: SyncMessage) {
    if (!msg || msg.sourceId === this.clientId) return;

    // Trigger local listeners
    const handlers = this.listeners.get(msg.type);
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(msg.payload);
        } catch (err) {
          console.warn("[SyncService] Error in listener handler:", err);
        }
      });
    }

    // Trigger corresponding standard window custom events
    if (msg.type === "ORDERS_UPDATED" || msg.type === "ORDER_STATUS_CHANGED") {
      window.dispatchEvent(new CustomEvent("sutra_orders_changed", { detail: msg.payload }));
    } else if (msg.type === "PROFILE_UPDATED") {
      window.dispatchEvent(new CustomEvent("sutra_profile_changed", { detail: msg.payload }));
    } else if (msg.type === "NOTIFICATIONS_UPDATED" || msg.type === "NOTIFICATION_READ") {
      window.dispatchEvent(new CustomEvent("sutra_notifications_changed", { detail: msg.payload }));
    }
  }

  /** Broadcast a sync event across all open tabs, windows, and the mobile-app view */
  public broadcast<T = any>(type: SyncEventType, payload: T): void {
    const message: SyncMessage<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      sourceId: this.clientId,
    };

    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (err) {
        console.warn("[SyncService] broadcast postMessage error:", err);
      }
    }

    // Also trigger local event
    if (typeof window !== "undefined") {
      if (type === "ORDERS_UPDATED" || type === "ORDER_STATUS_CHANGED") {
        window.dispatchEvent(new CustomEvent("sutra_orders_changed", { detail: payload }));
      } else if (type === "PROFILE_UPDATED") {
        window.dispatchEvent(new CustomEvent("sutra_profile_changed", { detail: payload }));
      } else if (type === "NOTIFICATIONS_UPDATED" || type === "NOTIFICATION_READ") {
        window.dispatchEvent(new CustomEvent("sutra_notifications_changed", { detail: payload }));
      }
    }
  }

  /** Subscribe to a sync event type */
  public subscribe<T = any>(type: SyncEventType, callback: (payload: T) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    return () => {
      const set = this.listeners.get(type);
      if (set) {
        set.delete(callback);
      }
    };
  }

  /** Current network connection state */
  public isOnline(): boolean {
    if (typeof window === "undefined") return true;
    return navigator.onLine;
  }

  /* -------------------------------------------------------------------------
   * LOCAL STORAGE CACHE HELPERS (OFFLINE PERSISTENCE)
   * ------------------------------------------------------------------------- */

  public getCachedOrders(): any[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public setCachedOrders(orders: any[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {}
  }

  public getCachedProfile(): any | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public setCachedProfile(profile: any): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {}
  }

  public getCachedNotifications(): { notifications: any[]; unreadCount: number } {
    if (typeof window === "undefined") return { notifications: [], unreadCount: 0 };
    try {
      const rawNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const rawCount = localStorage.getItem(STORAGE_KEYS.UNREAD_COUNT);
      return {
        notifications: rawNotifs ? JSON.parse(rawNotifs) : [],
        unreadCount: rawCount ? Number(rawCount) : 0,
      };
    } catch {
      return { notifications: [], unreadCount: 0 };
    }
  }

  public setCachedNotifications(notifications: any[], unreadCount: number): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      localStorage.setItem(STORAGE_KEYS.UNREAD_COUNT, String(unreadCount));
    } catch {}
  }

  /* -------------------------------------------------------------------------
   * OFFLINE MUTATION QUEUE & RECONNECTION REPLAY
   * ------------------------------------------------------------------------- */

  public queueOfflineMutation(mutation: Omit<OfflineMutation, "id" | "queuedAt">): void {
    if (typeof window === "undefined") return;
    const item: OfflineMutation = {
      ...mutation,
      id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      queuedAt: new Date().toISOString(),
    };

    try {
      const existing = this.getOfflineQueue();
      existing.push(item);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(existing));
      this.broadcast("OFFLINE_MUTATION_QUEUED", item);
    } catch (e) {
      console.warn("[SyncService] Failed to queue offline mutation:", e);
    }
  }

  public getOfflineQueue(): OfflineMutation[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public async flushOfflineQueue(): Promise<{ succeeded: number; failed: number }> {
    if (typeof window === "undefined") return { succeeded: 0, failed: 0 };
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return { succeeded: 0, failed: 0 };

    let succeeded = 0;
    let failed = 0;
    const remaining: OfflineMutation[] = [];

    for (const item of queue) {
      try {
        const res = await fetch(item.endpoint, {
          method: item.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.body),
        });

        if (res.ok) {
          succeeded++;
        } else {
          failed++;
          remaining.push(item);
        }
      } catch {
        failed++;
        remaining.push(item);
      }
    }

    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(remaining));
    } catch {}

    if (succeeded > 0) {
      this.broadcast("OFFLINE_QUEUE_FLUSHED", { succeeded, remainingCount: remaining.length });
    }

    return { succeeded, failed };
  }

  /* -------------------------------------------------------------------------
   * UNIFIED PUSH NOTIFICATIONS
   * ------------------------------------------------------------------------- */

  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return "default";
    }
  }

  public showPushNotification(
    title: string,
    options?: {
      body?: string;
      actionUrl?: string;
      orderId?: string;
      tag?: string;
    }
  ): void {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    try {
      // If service worker registration is available, use showNotification
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body: options?.body || "New update in Sutra Studio.",
            icon: "/brand/sutra-app-icon.png",
            badge: "/brand/sutra-favicon.png",
            data: { url: options?.actionUrl || "/orders" },
            tag: options?.tag,
          });
        });
      } else {
        // Fallback to standard window Notification
        const notif = new Notification(title, {
          body: options?.body || "New update in Sutra Studio.",
          icon: "/brand/sutra-app-icon.png",
          badge: "/brand/sutra-favicon.png",
          tag: options?.tag,
        });

        notif.onclick = () => {
          window.focus();
          if (options?.actionUrl) {
            window.location.href = options.actionUrl;
          }
          notif.close();
        };
      }
    } catch (e) {
      console.warn("[SyncService] Failed to show push notification:", e);
    }
  }
}

// Singleton export
export const SyncManager = new RealtimeSyncManager();
