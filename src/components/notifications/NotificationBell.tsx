"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Package,
  RotateCcw,
  Sparkles,
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
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useAuth } from "@/lib/auth/authContext";
import { soundSystem } from "@/lib/audio/soundSystem";

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

export function NotificationBell({ className = "" }: { className?: string }) {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("unread");
  const [notifications, setNotifications] = useState<StudioNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(soundSystem.getMuted());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevUnreadCountRef = useRef<number>(0);
  const hasInitializedRef = useRef<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", {
        headers: {},
      });
      if (res.ok) {
        const data = await res.json();
        const items = data.notifications || [];
        const unread = data.unreadCount || 0;
        setNotifications(items);
        setUnreadCount(unread);

        // If new notifications arrived after initial load, play chime
        if (hasInitializedRef.current && unread > prevUnreadCountRef.current) {
          soundSystem.play("notification");
        }
        prevUnreadCountRef.current = unread;
        hasInitializedRef.current = true;
      }
    } catch {
      // quiet fallback
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
    const interval = setInterval(fetchNotifications, 8000);
    const handleOrderChange = () => fetchNotifications();
    window.addEventListener("sutra_orders_changed", handleOrderChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("sutra_orders_changed", handleOrderChange);
    };
  }, [fetchNotifications]);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // fallback
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          soundSystem.play("tap");
          setIsOpen(!isOpen);
        }}
        aria-label="View Studio Notifications"
        aria-expanded={isOpen}
        className="relative p-2 rounded-xl text-[#5C3A1E] hover:bg-[#F8F5EF] border border-[#EADFCB] bg-[#FFFDF9] transition-all cursor-pointer shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A35A] min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <Bell className="w-4 h-4 text-[#5C3A1E]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#B91C1C] text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop Overlay (<sm screens) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="sm:hidden fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-[var(--z-drawer)]"
              aria-hidden="true"
            />

            {/* Notification Panel Surface: Desktop Popover / Mobile Bottom Sheet */}
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.05, bottom: 0.5 }}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.18 }}
              role="dialog"
              aria-label="Notifications"
              className="fixed inset-x-0 bottom-0 sm:bottom-auto sm:inset-x-auto sm:absolute sm:right-0 sm:top-full sm:mt-2 w-full sm:w-96 rounded-t-3xl sm:rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-2xl z-[var(--z-modal)] sm:z-[var(--z-dropdown)] overflow-hidden text-xs text-[#0F172A] flex flex-col max-h-[80dvh] sm:max-h-[520px] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-0"
            >
              {/* Mobile Drag Indicator Handle */}
              <div className="sm:hidden pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 rounded-full bg-[#D4A35A]/50" />
              </div>

              {/* Panel Header */}
              <div className="p-3.5 sm:p-4 bg-[#FAF9F5] border-b border-[#EADFCB] space-y-2.5 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#5C3A1E]">
                      Studio Dispatch
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#5C3A1E] text-white text-[10px] font-mono font-semibold">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
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
                      className="p-1 rounded-md text-[#64748B] hover:text-[#5C3A1E] hover:bg-[#EADFCB]/40 transition-colors cursor-pointer"
                      title={isMuted ? "Unmute Studio Sounds" : "Mute Studio Sounds"}
                      aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#94A3B8]" /> : <Volume2 className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                    </button>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        disabled={isLoading}
                        className="text-[11px] font-semibold text-[#5C3A1E] hover:text-[#432813] transition-colors cursor-pointer flex items-center gap-1 ml-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="sm:hidden p-1 rounded-full text-[#64748B] hover:text-[#0F172A]"
                      aria-label="Close notifications"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-[#FFFDF9] p-0.5 rounded-lg border border-[#EADFCB]/80 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setTab("unread")}
                    className={`flex-1 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      tab === "unread"
                        ? "bg-[#5C3A1E] text-white shadow-2xs font-semibold"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("all")}
                    className={`flex-1 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      tab === "all"
                        ? "bg-[#5C3A1E] text-white shadow-2xs font-semibold"
                        : "text-[#64748B] hover:text-[#0F172A]"
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
                      onClick={() => !item.read && handleMarkAsRead(item.id)}
                      className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                        !item.read ? "bg-[#FFF9EE]/70 hover:bg-[#FFF9EE]" : "hover:bg-[#FAF9F5]"
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-white border border-[#EADFCB] mt-0.5 shrink-0 shadow-2xs">
                        {getIcon(item.type)}
                      </div>

                      <div className="flex-1 space-y-1">
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
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!item.read) handleMarkAsRead(item.id);
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

                      {!item.read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          title="Mark as read"
                          className="text-[#D4A35A] hover:text-[#5C3A1E] p-1 rounded transition-colors"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#D4A35A] block" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
