"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SyncManager, type SyncEventType } from "./syncService";

/**
 * React Hook: useNetworkStatus
 * Tracks online/offline status and pending offline queue mutations.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);
    setPendingQueueCount(SyncManager.getOfflineQueue().length);

    const handleNetworkChange = (e: any) => {
      setIsOnline(Boolean(e.detail?.isOnline ?? navigator.onLine));
      setPendingQueueCount(SyncManager.getOfflineQueue().length);
    };

    const handleQueueChange = () => {
      setPendingQueueCount(SyncManager.getOfflineQueue().length);
    };

    window.addEventListener("sutra_network_status", handleNetworkChange);
    const unsubQueue = SyncManager.subscribe("OFFLINE_MUTATION_QUEUED", handleQueueChange);
    const unsubFlushed = SyncManager.subscribe("OFFLINE_QUEUE_FLUSHED", handleQueueChange);

    return () => {
      window.removeEventListener("sutra_network_status", handleNetworkChange);
      unsubQueue();
      unsubFlushed();
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    pendingQueueCount,
    flushQueue: () => SyncManager.flushOfflineQueue(),
  };
}

/**
 * React Hook: useRealtimeOrders
 * Loads orders with offline fallback and updates in real-time across website and app.
 */
export function useRealtimeOrders(clientUid?: string) {
  const [orders, setOrders] = useState<any[]>(() => SyncManager.getCachedOrders());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const cached = SyncManager.getCachedOrders();
      setOrders(cached);
      setIsOffline(true);
      if (!silent) setIsLoading(false);
      return;
    }

    try {
      const queryParam = clientUid ? `?clientUid=${encodeURIComponent(clientUid)}` : "";
      const res = await fetch(`/api/orders${queryParam}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          setOrders((prev) => {
            if (data.orders.length === 0 && silent && prev.length > 0) {
              return prev;
            }
            SyncManager.setCachedOrders(data.orders);
            return data.orders;
          });
          setLastSyncedAt(new Date().toISOString());
          setIsOffline(false);
        }
      } else {
        // Fallback to cache on error
        const cached = SyncManager.getCachedOrders();
        if (cached.length > 0) setOrders(cached);
      }
    } catch {
      // Offline fallback
      const cached = SyncManager.getCachedOrders();
      if (cached.length > 0) setOrders(cached);
      setIsOffline(!navigator.onLine);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [clientUid]);

  useEffect(() => {
    fetchOrders();

    // Listen to real-time events from SyncManager and window
    const unsubOrders = SyncManager.subscribe("ORDERS_UPDATED", () => fetchOrders(true));
    const unsubStatus = SyncManager.subscribe("ORDER_STATUS_CHANGED", () => fetchOrders(true));

    const handleWindowOrderEvent = () => fetchOrders(true);
    window.addEventListener("sutra_orders_changed", handleWindowOrderEvent);

    // Periodic heartbeat sync (every 6 seconds when document is active)
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchOrders(true);
      }
    }, 6000);

    return () => {
      unsubOrders();
      unsubStatus();
      window.removeEventListener("sutra_orders_changed", handleWindowOrderEvent);
      clearInterval(interval);
    };
  }, [fetchOrders]);

  const updateOrderStatusOptimistic = useCallback((orderId: string, newStatus: string, statusLabel?: string) => {
    setOrders((prev) => {
      const updated = prev.map((ord) =>
        ord.id === orderId || ord.orderNumber === orderId
          ? { ...ord, status: newStatus, statusLabel: statusLabel || newStatus }
          : ord
      );
      SyncManager.setCachedOrders(updated);
      return updated;
    });

    SyncManager.broadcast("ORDER_STATUS_CHANGED", {
      orderId,
      status: newStatus,
      statusLabel,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  return {
    orders,
    isLoading,
    isOffline,
    lastSyncedAt,
    refreshOrders: () => fetchOrders(false),
    updateOrderStatusOptimistic,
  };
}

/**
 * React Hook: useRealtimeProfile
 * Synchronizes client profile in real-time between website and mobile app.
 */
export function useRealtimeProfile() {
  const [profile, setProfile] = useState<any | null>(() => SyncManager.getCachedProfile());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const fetchProfile = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setProfile(SyncManager.getCachedProfile());
      setIsOffline(true);
      if (!silent) setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/account/profile", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          SyncManager.setCachedProfile(data.profile);
          setIsOffline(false);
        }
      } else {
        const cached = SyncManager.getCachedProfile();
        if (cached) setProfile(cached);
      }
    } catch {
      const cached = SyncManager.getCachedProfile();
      if (cached) setProfile(cached);
      setIsOffline(!navigator.onLine);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    const unsubProfile = SyncManager.subscribe("PROFILE_UPDATED", (newProfile) => {
      setProfile(newProfile);
      SyncManager.setCachedProfile(newProfile);
    });

    const handleWindowProfileEvent = (e: any) => {
      if (e.detail?.profile) {
        setProfile(e.detail.profile);
      } else {
        fetchProfile(true);
      }
    };
    window.addEventListener("sutra_profile_changed", handleWindowProfileEvent);

    return () => {
      unsubProfile();
      window.removeEventListener("sutra_profile_changed", handleWindowProfileEvent);
    };
  }, [fetchProfile]);

  const saveProfile = async (updates: Record<string, any>) => {
    // If offline, queue mutation and apply optimistic update
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const optimisticProfile = { ...(profile || {}), ...updates };
      setProfile(optimisticProfile);
      SyncManager.setCachedProfile(optimisticProfile);

      SyncManager.queueOfflineMutation({
        endpoint: "/api/account/profile",
        method: "PATCH",
        body: updates,
        description: `Profile update (${Object.keys(updates).join(", ")})`,
      });

      SyncManager.broadcast("PROFILE_UPDATED", optimisticProfile);
      return { success: true, offline: true, profile: optimisticProfile };
    }

    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      throw new Error("Failed to save profile changes.");
    }

    const data = await res.json();
    const updated = data.profile || { ...(profile || {}), ...updates };
    setProfile(updated);
    SyncManager.setCachedProfile(updated);

    // Broadcast change across all tabs and mobile app views
    SyncManager.broadcast("PROFILE_UPDATED", updated);

    return { success: true, offline: false, profile: updated };
  };

  return {
    profile,
    isLoading,
    isOffline,
    refreshProfile: () => fetchProfile(false),
    saveProfile,
  };
}

/**
 * React Hook: useRealtimeNotifications
 * Unified shared notification listener with cross-tab read/unread state and push triggers.
 */
export function useRealtimeNotifications(userId?: string) {
  const cachedInitial = SyncManager.getCachedNotifications();
  const [notifications, setNotifications] = useState<any[]>(cachedInitial.notifications);
  const [unreadCount, setUnreadCount] = useState<number>(cachedInitial.unreadCount);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const prevCountRef = useRef<number>(cachedInitial.unreadCount);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const cached = SyncManager.getCachedNotifications();
      setNotifications(cached.notifications);
      setUnreadCount(cached.unreadCount);
      if (!silent) setIsLoading(false);
      return;
    }

    try {
      const queryParam = userId ? `?userId=${encodeURIComponent(userId)}` : "";
      const res = await fetch(`/api/notifications${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        const items = data.notifications || [];
        const count = data.unreadCount || 0;

        setNotifications(items);
        setUnreadCount(count);
        SyncManager.setCachedNotifications(items, count);

        // If new notifications arrived, trigger Web Push Notification
        if (count > prevCountRef.current && items.length > 0) {
          const newest = items[0];
          SyncManager.showPushNotification(newest.title, {
            body: newest.message,
            actionUrl: newest.actionUrl || "/orders",
            orderId: newest.orderId,
          });
        }
        prevCountRef.current = count;
      }
    } catch {
      const cached = SyncManager.getCachedNotifications();
      setNotifications(cached.notifications);
      setUnreadCount(cached.unreadCount);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();

    const unsubNotifs = SyncManager.subscribe("NOTIFICATIONS_UPDATED", () => fetchNotifications(true));
    const unsubRead = SyncManager.subscribe("NOTIFICATION_READ", (payload: any) => {
      if (payload.allRead) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        SyncManager.setCachedNotifications(
          notifications.map((n) => ({ ...n, read: true })),
          0
        );
      } else if (payload.id) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === payload.id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    });

    const handleWindowNotif = () => fetchNotifications(true);
    window.addEventListener("sutra_notifications_changed", handleWindowNotif);

    // Heartbeat poll every 7 seconds
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchNotifications(true);
      }
    }, 7000);

    return () => {
      unsubNotifs();
      unsubRead();
      window.removeEventListener("sutra_notifications_changed", handleWindowNotif);
      clearInterval(interval);
    };
  }, [fetchNotifications, notifications]);

  const markAsRead = async (id: string) => {
    // Optimistic local update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));

    // Broadcast to other tabs & mobile-app view immediately
    SyncManager.broadcast("NOTIFICATION_READ", { id });

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, userId }),
      });
    } catch {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        SyncManager.queueOfflineMutation({
          endpoint: "/api/notifications",
          method: "PATCH",
          body: { id, userId },
          description: `Mark notification #${id} as read`,
        });
      }
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    SyncManager.broadcast("NOTIFICATION_READ", { allRead: true });

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true, userId }),
      });
    } catch {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        SyncManager.queueOfflineMutation({
          endpoint: "/api/notifications",
          method: "PATCH",
          body: { markAllAsRead: true, userId },
          description: "Mark all notifications as read",
        });
      }
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications: () => fetchNotifications(false),
    markAsRead,
    markAllAsRead,
  };
}
