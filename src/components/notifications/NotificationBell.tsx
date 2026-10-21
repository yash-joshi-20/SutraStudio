"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Package,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
  CreditCard,
  AlertTriangle,
  Calendar,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAuth } from "@/lib/auth/authContext";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { soundSystem } from "@/lib/audio/soundSystem";
import { AnimatedBellIcon } from "@/components/ui/AnimatedStatusIcons";
import { SyncManager } from "@/lib/sync/syncService";

export interface StudioNotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  actionUrl?: string;
  actionLabel?: string;
  read: boolean;
  createdAt: string;
}

export function NotificationBell({
  className = "",
  align = "auto",
}: {
  className?: string;
  align?: "left" | "right" | "auto";
}) {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("unread");
  const cachedNotifs = SyncManager.getCachedNotifications();
  const [notifications, setNotifications] = useState<StudioNotificationItem[]>(cachedNotifs.notifications);
  const [unreadCount, setUnreadCount] = useState(cachedNotifs.unreadCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(soundSystem.getMuted());
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevUnreadCountRef = useRef<number>(cachedNotifs.unreadCount);
  const hasInitializedRef = useRef<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const mql = window.matchMedia("(max-width: 639px)");
      const updateMobile = () => setIsMobile(mql.matches);
      updateMobile();
      mql.addEventListener("change", updateMobile);
      return () => mql.removeEventListener("change", updateMobile);
    }
  }, []);

  // Lock background body scroll when mobile bottom sheet is active
  useEffect(() => {
    if (isOpen && isMobile && typeof document !== "undefined") {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, isMobile]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        const items = data.notifications || [];
        const unread = data.unreadCount || 0;
        setNotifications(items);
        setUnreadCount(unread);
        SyncManager.setCachedNotifications(items, unread);

        // If new notifications arrived after initial load, play chime & trigger push notification
        if (hasInitializedRef.current && unread > prevUnreadCountRef.current) {
          soundSystem.play("notification");
          if (items.length > 0) {
            SyncManager.showPushNotification(items[0].title || "Sutra Studio Notification", {
              body: items[0].message,
              actionUrl: items[0].actionUrl || "/orders",
              orderId: items[0].orderId,
            });
          }
        }
        prevUnreadCountRef.current = unread;
        hasInitializedRef.current = true;
      }
    } catch {
      // quiet fallback to cache
      const cached = SyncManager.getCachedNotifications();
      if (cached.notifications.length > 0) {
        setNotifications(cached.notifications);
        setUnreadCount(cached.unreadCount);
      }
    }
  }, [user?.uid, role]);

  useEffect(() => {
    const handleMuteChange = (e: any) => {
      setIsMuted(e.detail?.isMuted ?? soundSystem.getMuted());
    };
    window.addEventListener("sutra_sound_mute_changed", handleMuteChange);
    return () => window.removeEventListener("sutra_sound_mute_changed", handleMuteChange);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 7000);
    const handleOrderChange = () => fetchNotifications();
    window.addEventListener("sutra_orders_changed", handleOrderChange);

    // Cross-tab real-time listener from SyncManager
    const unsubRead = SyncManager.subscribe("NOTIFICATION_READ", (payload: any) => {
      if (payload.allRead) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      } else if (payload.id) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === payload.id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    });

    const unsubUpdated = SyncManager.subscribe("NOTIFICATIONS_UPDATED", () => {
      fetchNotifications();
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener("sutra_orders_changed", handleOrderChange);
      unsubRead();
      unsubUpdated();
    };
  }, [fetchNotifications]);

  const handleRequestPush = async () => {
    const perm = await SyncManager.requestNotificationPermission();
    setPushPermission(perm);
  };

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isMobile) return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundSystem.play("tap");
    // Optimistic local and broadcast
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    SyncManager.broadcast("NOTIFICATION_READ", { id });

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
    } catch {
      // offline fallback
      SyncManager.queueOfflineMutation({
        endpoint: "/api/notifications",
        method: "PATCH",
        body: { id },
        description: `Mark notification #${id} as read`,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    soundSystem.play("action_success");
    setIsLoading(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    SyncManager.broadcast("NOTIFICATION_READ", { allRead: true });

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAllAsRead: true }),
      });
    } catch {
      SyncManager.queueOfflineMutation({
        endpoint: "/api/notifications",
        method: "PATCH",
        body: { markAllAsRead: true },
        description: "Mark all notifications as read",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundSystem.play("tap");
    const target = notifications.find((n) => n.id === id);
    const wasUnread = target && !target.read;

    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    SyncManager.broadcast("NOTIFICATIONS_UPDATED", {});

    try {
      await fetch(`/api/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch {
      SyncManager.queueOfflineMutation({
        endpoint: `/api/notifications?id=${encodeURIComponent(id)}`,
        method: "DELETE",
        body: {},
        description: `Delete notification #${id}`,
      });
    }
  };

  const handleClearAllNotifications = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundSystem.play("action_success");
    setIsLoading(true);
    setNotifications([]);
    setUnreadCount(0);
    SyncManager.broadcast("NOTIFICATIONS_UPDATED", {});

    try {
      await fetch("/api/notifications?clearAll=true", {
        method: "DELETE",
      });
    } catch {
      SyncManager.queueOfflineMutation({
        endpoint: "/api/notifications?clearAll=true",
        method: "DELETE",
        body: {},
        description: "Clear all notifications",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenOrDismiss = async (item: StudioNotificationItem) => {
    // When opened, mark as read and remove from active alerts list
    await handleDeleteNotification(item.id);
  };


  const getIcon = (type: string) => {
    switch (type) {
      case "order_delivered":
        return <Package className="w-4 h-4 text-[#D4A35A]" />;
      case "order_approved":
      case "order_paid":
      case "order_completed":
        return <Check className="w-4 h-4 text-[#2E7D4F]" />;
      case "revision_requested":
        return <RotateCcw className="w-4 h-4 text-[#B45309]" />;
      case "order_comment":
        return <MessageSquare className="w-4 h-4 text-[#5C3A1E]" />;
      case "order_placed":
        return <Sparkles className="w-4 h-4 text-[#5C3A1E]" />;
      case "order_overdue":
      case "order_due_warning":
        return <AlertTriangle className="w-4 h-4 text-[#B91C1C]" />;
      case "monthly_expiring_5d":
      case "monthly_expiring_1d":
      case "trial_ending_1d":
      case "monthly_expired":
        return <Calendar className="w-4 h-4 text-[#B45309]" />;
      case "unpaid_reminder":
        return <CreditCard className="w-4 h-4 text-[#B45309]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#5C3A1E]" />;
    }
  };

  const formatRelativeTime = (iso: string) => {
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(iso).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  const displayedNotifications =
    tab === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 70 || info.velocity.y > 350) {
      setIsOpen(false);
    }
  };

  const renderPanelContent = (isMobileSheet: boolean) => (
    <>
      {/* Mobile Drag Indicator Handle */}
      {isMobileSheet && (
        <div className="pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing shrink-0 bg-[#171717]">
          <div className="w-10 h-1 rounded-full bg-[#A98B57]/60" />
        </div>
      )}

      {/* Panel Header */}
      <div className="p-4 bg-[#171717] text-white border-b border-white/10 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A98B57] block">
              SUTRA REAL-TIME FEED
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-serif font-bold text-sm text-white">
                Studio Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#A98B57] text-white text-[10px] font-mono font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Sound Mute / Unmute Toggle */}
            <button
              type="button"
              onClick={() => {
                const newMuted = soundSystem.toggleMute();
                setIsMuted(newMuted);
                if (!newMuted) {
                  soundSystem.play("notification");
                }
              }}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isMuted ? "Unmute Studio Sounds" : "Mute Studio Sounds"}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-white/40" /> : <Volume2 className="w-3.5 h-3.5 text-[#A98B57]" />}
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
                className="text-[11px] font-semibold text-[#D4AF37] hover:underline transition-colors cursor-pointer flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark Read</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllNotifications}
                disabled={isLoading}
                className="text-[11px] font-semibold text-rose-300 hover:text-rose-100 hover:underline transition-colors cursor-pointer flex items-center gap-1"
                title="Clear all notifications"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close notifications"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-xl border border-white/15 text-xs">
          <button
            type="button"
            onClick={() => setTab("unread")}
            className={`flex-1 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              tab === "unread"
                ? "bg-white text-[#171717] shadow-xs font-bold"
                : "text-white/70 hover:text-white"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setTab("all")}
            className={`flex-1 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              tab === "all"
                ? "bg-white text-[#171717] shadow-xs font-bold"
                : "text-white/70 hover:text-white"
            }`}
          >
            All Archive ({notifications.length})
          </button>
        </div>
      </div>

      {/* Notification List Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#EADFCB]/60 overscroll-contain">
        {displayedNotifications.length === 0 ? (
          <div className="p-8 text-center text-[#94A3B8] space-y-2">
            <Bell className="w-7 h-7 mx-auto opacity-30 text-[#A98B57]" />
            <p className="font-semibold text-xs text-[#0F172A]">
              {tab === "unread" ? "No unread notifications" : "No notifications"}
            </p>
            <p className="text-[11px] max-w-[240px] mx-auto text-[#64748B]">
              {tab === "unread"
                ? "You are all caught up. Check 'All Archive' for historical logs."
                : "You have zero studio dispatches at this time."}
            </p>
          </div>
        ) : (
          displayedNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenOrDismiss(item)}
              className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 group relative ${
                !item.read ? "bg-[#FFF9EE]/70 hover:bg-[#FFF9EE]" : "hover:bg-[#FAF9F5]"
              }`}
            >
              <div className="p-2 rounded-xl bg-white border border-[#EADFCB] mt-0.5 shrink-0 shadow-2xs">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 space-y-1 pr-6">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-xs text-[#0F172A] leading-tight">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8] shrink-0">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>

                <p className="text-[11px] text-[#64748B] leading-relaxed break-words">
                  {item.message}
                </p>

                <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                  {item.orderNumber ? (
                    <span className="font-mono text-[10px] text-[#5C3A1E] bg-[#F8F5EF] px-1.5 py-0.5 rounded border border-[#EADFCB]">
                      #{item.orderNumber}
                    </span>
                  ) : (
                    <span />
                  )}

                  {item.actionUrl && (
                    <Link
                      href={item.actionUrl}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleOpenOrDismiss(item);
                        setIsOpen(false);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5C3A1E] hover:text-[#D4A35A] transition-colors"
                    >
                      <span>{item.actionLabel || "View Action"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handleDeleteNotification(item.id, e)}
                title="Dismiss and remove notification"
                aria-label="Dismiss notification"
                className="absolute top-3 right-3 text-stone-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Trigger Button with subtle luxury micro-animation */}
      <button
        type="button"
        onClick={() => {
          soundSystem.play("tap");
          setIsOpen(!isOpen);
        }}
        aria-label="View Studio Notifications"
        aria-expanded={isOpen}
        className="relative p-2 rounded-xl text-[#171717] hover:bg-[#F0ECE1] border border-[#E5E1D8] bg-[#FFFDF9] transition-all cursor-pointer shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A98B57] min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <AnimatedBellIcon hasUnread={unreadCount > 0} className="w-4 h-4 text-[#171717]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile Bottom Sheet: Rendered via React Portal to escape sticky/blur header containing blocks */}
      {mounted && isMobile && typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div className="fixed inset-0 z-[9999]">
                {/* Mobile Backdrop Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsOpen(false)}
                  className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-xs"
                  aria-hidden="true"
                />

                {/* Mobile Bottom Sheet Surface */}
                <motion.div
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.05, bottom: 0.6 }}
                  onDragEnd={handleDragEnd}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 320 }}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Studio Notifications"
                  className="fixed inset-x-0 bottom-0 z-[10000] w-full rounded-t-3xl bg-[#FFFDF9] border-t border-[#E5E1D8] shadow-2xl overflow-hidden text-xs text-[#171717] flex flex-col max-h-[85dvh] pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
                >
                  {renderPanelContent(true)}
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Desktop Popover Dropdown */}
      {!isMobile && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              role="dialog"
              aria-label="Studio Notifications"
              className={`absolute ${
                align === "left" ? "left-0" : "right-0"
              } top-full mt-2 w-96 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xl z-50 overflow-hidden text-xs text-[#171717] flex flex-col max-h-[520px]`}
            >
              {renderPanelContent(false)}
            </motion.div>
          )}
        </AnimatePresence>
      )}

    </div>
  );
}
