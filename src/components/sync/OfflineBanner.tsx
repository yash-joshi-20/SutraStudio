"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { useNetworkStatus } from "@/lib/sync/useRealtimeSync";

export function OfflineBanner() {
  const { isOnline, pendingQueueCount, flushQueue } = useNetworkStatus();
  const [showRestored, setShowRestored] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [isFlushing, setIsFlushing] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowRestored(false);
    } else if (wasOffline && isOnline) {
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  const handleManualSync = async () => {
    setIsFlushing(true);
    try {
      await flushQueue();
    } finally {
      setIsFlushing(false);
    }
  };

  if (isOnline && !showRestored) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
    >
      {!isOnline ? (
        <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-amber-300/80 shadow-warm text-[#5C3A1E] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0">
              <WifiOff className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[#0F172A] truncate">Offline Mode Active</p>
              <p className="text-[11px] text-[#64748B] leading-tight">
                Viewing cached vault data. Changes will sync automatically when back online.
              </p>
              {pendingQueueCount > 0 && (
                <p className="text-[10px] font-mono text-amber-700 mt-0.5">
                  {pendingQueueCount} pending offline action{pendingQueueCount > 1 ? "s" : ""} queued.
                </p>
              )}
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold shrink-0">
            Cached
          </span>
        </div>
      ) : showRestored ? (
        <div className="p-3 rounded-2xl bg-[#FFFDF9] border border-emerald-300/80 shadow-warm text-[#1E293B] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-[#0F172A]">Connection Restored</p>
              <p className="text-[11px] text-[#64748B]">Real-time synchronization operational.</p>
            </div>
          </div>
          {pendingQueueCount > 0 && (
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isFlushing}
              className="px-2.5 py-1 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] hover:border-[#D4A35A] text-[11px] font-semibold text-[#5C3A1E] flex items-center gap-1 cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3 h-3 ${isFlushing ? "animate-spin" : ""}`} />
              <span>Sync Now</span>
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
