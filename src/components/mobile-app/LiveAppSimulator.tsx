"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  User,
  Bell,
  Wifi,
  WifiOff,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Send,
  ShieldCheck,
  Check,
  Eye,
  Edit2,
  Save,
  ArrowRight,
} from "lucide-react";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  useRealtimeOrders,
  useRealtimeProfile,
  useRealtimeNotifications,
  useNetworkStatus,
} from "@/lib/sync/useRealtimeSync";
import { SyncManager } from "@/lib/sync/syncService";

export function LiveAppSimulator() {
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "alerts" | "offline">("orders");
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);

  // Sync hooks
  const { orders, isLoading: loadingOrders, refreshOrders } = useRealtimeOrders();
  const { profile, saveProfile, isLoading: loadingProfile } = useRealtimeProfile();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtimeNotifications();
  const { isOnline, pendingQueueCount } = useNetworkStatus();

  // Profile edit state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditName(profile.displayName || profile.fullName || "Studio Client");
      setEditPhone(profile.phone || "+91 98765 43210");
      setEditCompany(profile.companyName || "Heritage Luxe Living");
    }
  }, [profile]);

  const handleSaveProfileInApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileSavedMsg("");
    try {
      await saveProfile({
        displayName: editName,
        phone: editPhone,
        companyName: editCompany,
      });
      setIsEditingProfile(false);
      setProfileSavedMsg("✓ Synced with Website & Firebase!");
      setTimeout(() => setProfileSavedMsg(""), 3500);
    } catch {
      setProfileSavedMsg("✓ Saved to Offline Queue!");
      setIsEditingProfile(false);
      setTimeout(() => setProfileSavedMsg(""), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestAlert = () => {
    SyncManager.showPushNotification("Sutra Studio Push Notification", {
      body: "Milestone render pass ready for 1-click review in Vault.",
      actionUrl: "/orders",
    });

    // Also broadcast notification event
    SyncManager.broadcast("NOTIFICATIONS_UPDATED", {});
  };

  // Filter display orders
  const displayOrders = orders.length > 0 ? orders.slice(0, 5) : [
    {
      id: "ord_live_demo_01",
      orderNumber: "ORD-942",
      service: "Visual Imagery Suite",
      status: "in_production",
      statusLabel: "In Production",
      totalAmount: 2499,
      deliverables: [{ filename: "render_pass_4k.webp" }],
      updatedAt: new Date().toISOString(),
    },
    {
      id: "ord_live_demo_02",
      orderNumber: "ORD-941",
      service: "Spatial 3D Modeling",
      status: "pending_verification",
      statusLabel: "Pending UPI Verification",
      totalAmount: 5999,
      deliverables: [],
      updatedAt: new Date().toISOString(),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#FAF9F5] text-[#0F172A] select-none text-[12px] font-sans">
      {/* Top Mobile Status Bar */}
      <div className="pt-7 px-4 pb-2 bg-[#FFFDF9] border-b border-[#EADFCB]/80 flex items-center justify-between text-[10px] text-[#64748B]">
        <span className="font-semibold text-[#0F172A]">9:41</span>
        <div className="flex items-center gap-1.5">
          {isSimulatedOffline ? (
            <span className="flex items-center gap-1 text-amber-700 font-semibold">
              <WifiOff className="w-3 h-3" /> Offline
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <Wifi className="w-3 h-3" /> 5G
            </span>
          )}
          <span className="w-4 h-2 rounded-xs border border-[#64748B] flex items-center p-0.5">
            <span className="w-full h-full bg-[#2E7D4F] rounded-xs" />
          </span>
        </div>
      </div>

      {/* App Header Bar with Sync Status Pill */}
      <div className="px-3.5 py-2.5 bg-[#FFFDF9] border-b border-[#EADFCB] flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-1.5">
          <LotusSymbol className="w-4 h-4 text-[#A98B57]" color="gold" />
          <span className="font-serif font-bold text-xs tracking-wider text-[#5C3A1E]">SUTRA STUDIO</span>
        </div>

        {/* Sync Pill */}
        <div className="flex items-center gap-1">
          {isSimulatedOffline ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold border border-amber-300">
              <WifiOff className="w-2.5 h-2.5" /> Cached Vault
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[9px] font-bold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Firebase Sync
            </span>
          )}
        </div>
      </div>

      {/* Main App Content Area (Scrollable within Phone) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar pb-14">
        {/* TAB 1: COMMISSIONS / ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#0F172A]">Active Commissions</h4>
                <p className="text-[10px] text-[#64748B]">Real-time Firestore pipeline listener</p>
              </div>
              <button
                type="button"
                onClick={() => refreshOrders()}
                className="p-1 rounded-lg bg-white border border-[#EADFCB] text-[#5C3A1E] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                title="Refresh orders"
              >
                <RefreshCw className={`w-3 h-3 ${loadingOrders ? "animate-spin" : ""}`} />
              </button>
            </div>

            {displayOrders.map((ord: any) => {
              const isProd = ord.status === "in_production";
              const isComp = ord.status === "completed" || ord.status === "approved";
              const isPending = ord.status === "pending_verification";

              return (
                <div
                  key={ord.id}
                  className="p-3 rounded-2xl bg-white border border-[#EADFCB] shadow-2xs space-y-2 transition-all hover:border-[#D4A35A]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[10px] text-[#5C3A1E]">
                      #{ord.orderNumber || ord.code || String(ord.id).slice(-4)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        isComp
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : isProd
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : isPending
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-stone-50 text-stone-700 border-stone-200"
                      }`}
                    >
                      {ord.statusLabel || ord.status?.replace("_", " ")}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-serif font-bold text-xs text-[#0F172A] truncate">
                      {ord.service || ord.title || "Studio Commission"}
                    </h5>
                    <div className="flex items-center justify-between text-[10px] text-[#64748B] mt-0.5">
                      <span>Total: ₹{(ord.totalAmount || 2499).toLocaleString("en-IN")}</span>
                      {ord.deliverables && ord.deliverables.length > 0 && (
                        <span className="text-[#8B6508] font-semibold flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> {ord.deliverables.length} Deliverable(s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="p-2.5 rounded-xl bg-[#FAF6EE] border border-[#D4A35A]/30 text-[10px] text-[#5C3A1E] space-y-1">
              <div className="flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-[#2E7D4F]" />
                <span>Zero-Latency Website Sync</span>
              </div>
              <p className="text-[9px] text-[#64748B] leading-tight">
                Change an order status in Admin — this card updates live without refreshing.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE & SETTINGS */}
        {activeTab === "profile" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#0F172A]">Client Profile</h4>
                <p className="text-[10px] text-[#64748B]">Bi-directional website-app data</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-[10px] font-semibold text-[#5C3A1E] flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-[#EADFCB] cursor-pointer"
              >
                <Edit2 className="w-2.5 h-2.5" />
                <span>{isEditingProfile ? "Cancel" : "Edit"}</span>
              </button>
            </div>

            {profileSavedMsg && (
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-semibold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{profileSavedMsg}</span>
              </div>
            )}

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfileInApp} className="p-3 rounded-2xl bg-white border border-[#EADFCB] shadow-2xs space-y-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-[#0F172A] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[#EADFCB] bg-[#FAF9F5] focus:outline-none focus:border-[#D4A35A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#0F172A] mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[#EADFCB] bg-[#FAF9F5] focus:outline-none focus:border-[#D4A35A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#0F172A] mb-1">Company / Brand</label>
                  <input
                    type="text"
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[#EADFCB] bg-[#FAF9F5] focus:outline-none focus:border-[#D4A35A]"
                  />
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={isSaving}
                  className="w-full justify-center text-xs py-1.5"
                  leftIcon={<Save className="w-3 h-3" />}
                >
                  Save &amp; Sync to Website
                </Button>
              </form>
            ) : (
              <div className="p-3 rounded-2xl bg-white border border-[#EADFCB] shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#EADFCB]/60">
                  <div className="w-9 h-9 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center font-bold text-xs">
                    {(editName || "C").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-semibold text-xs text-[#0F172A] truncate">{editName}</h5>
                    <p className="text-[10px] text-[#64748B] truncate">{profile?.email || "client@sutrastudio.com"}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-[10px] pt-1">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Company:</span>
                    <span className="font-medium text-[#0F172A]">{editCompany}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Phone:</span>
                    <span className="font-medium text-[#0F172A] font-mono">{editPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Vault ID:</span>
                    <span className="font-medium text-[#0F172A] font-mono">{profile?.driveFolderId || "drive_fld_001"}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-[10px] text-[#64748B] space-y-1">
              <span className="font-semibold text-[#0F172A] block">Real-time Profile Sync:</span>
              <p>Saving here updates your profile on the website in real time using the shared Firestore users store.</p>
            </div>
          </div>
        )}

        {/* TAB 3: ALERTS / NOTIFICATIONS */}
        {activeTab === "alerts" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#0F172A]">Notifications</h4>
                <p className="text-[10px] text-[#64748B]">{unreadCount} unread • Shared state</p>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[10px] font-semibold text-[#5C3A1E] hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="p-6 text-center text-[10px] text-[#64748B] bg-white rounded-2xl border border-[#EADFCB]">
                <Bell className="w-5 h-5 text-[#94A3B8] mx-auto mb-1 opacity-50" />
                No notifications in your feed.
              </div>
            ) : (
              notifications.slice(0, 4).map((n: any) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markAsRead(n.id)}
                  className={`p-2.5 rounded-xl border text-[11px] space-y-1 transition-all cursor-pointer ${
                    !n.read
                      ? "bg-[#FFFDF9] border-[#D4A35A] shadow-2xs"
                      : "bg-white border-[#EADFCB]/80 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#0F172A]">{n.title}</span>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4A35A]" />
                    )}
                  </div>
                  <p className="text-[10px] text-[#64748B] leading-tight">{n.message}</p>
                </div>
              ))
            )}

            <button
              type="button"
              onClick={handleSendTestAlert}
              className="w-full py-2 rounded-xl bg-white border border-[#EADFCB] hover:border-[#D4A35A] text-[10px] font-semibold text-[#5C3A1E] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Bell className="w-3 h-3 text-[#D4A35A]" />
              <span>Test Native Push Notification</span>
            </button>
          </div>
        )}

        {/* TAB 4: OFFLINE SIMULATOR */}
        {activeTab === "offline" && (
          <div className="space-y-2.5">
            <h4 className="font-serif font-bold text-sm text-[#0F172A]">Offline Simulator</h4>
            <p className="text-[10px] text-[#64748B]">Verify cached data &amp; automatic reconnection sync</p>

            <div className="p-3 rounded-2xl bg-white border border-[#EADFCB] space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-[#0F172A] block">Simulate Offline</span>
                  <span className="text-[10px] text-[#64748B]">Disconnect app from live network</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                    isSimulatedOffline
                      ? "bg-amber-700 text-white shadow-2xs"
                      : "bg-[#FAF9F5] text-[#5C3A1E] border border-[#EADFCB]"
                  }`}
                >
                  {isSimulatedOffline ? "Offline Active" : "Go Offline"}
                </button>
              </div>

              <div className="text-[10px] text-[#64748B] space-y-1 pt-2 border-t border-[#EADFCB]/60">
                <div className="flex justify-between">
                  <span>Network status:</span>
                  <span className="font-semibold text-[#0F172A]">{isSimulatedOffline ? "Simulated Offline" : "Online"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cached orders available:</span>
                  <span className="font-semibold text-[#2E7D4F]">{orders.length} cached</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending offline queue:</span>
                  <span className="font-semibold text-amber-700">{pendingQueueCount} mutations</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-900 leading-tight">
              When offline, the mobile app and website serve the last cached snapshot from LocalStorage &amp; ServiceWorker, allowing browsing and queueing changes until back online.
            </div>
          </div>
        )}
      </div>

      {/* Bottom Phone App Navigation Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#EADFCB] py-2 px-3 flex items-center justify-around z-20">
        {[
          { id: "orders", label: "Orders", icon: Layers, badge: orders.length },
          { id: "profile", label: "Profile", icon: User },
          { id: "alerts", label: "Alerts", icon: Bell, badge: unreadCount },
          { id: "offline", label: "Offline", icon: isSimulatedOffline ? WifiOff : Wifi },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSel = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold relative transition-colors cursor-pointer ${
                isSel ? "text-[#5C3A1E]" : "text-[#94A3B8] hover:text-[#64748B]"
              }`}
            >
              <div className="relative">
                <Icon className="w-3.5 h-3.5" />
                {typeof tab.badge === "number" && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-[#D4A35A] text-white text-[7px] font-bold">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
