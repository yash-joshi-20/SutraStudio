"use client";

import React, { useEffect } from "react";
import { AuthProvider } from "@/lib/auth/authContext";
import { ToastProvider } from "@/components/ui/Toast";
import { FloatingChatModal } from "@/components/chat/FloatingChatModal";
import { OfflineBanner } from "@/components/sync/OfflineBanner";

import { RouteProgressIndicator } from "@/components/motion/RouteProgressIndicator";
import { Suspense } from "react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[SW] Service Worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[SW] Service Worker registration failed:", err);
        });
    }
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <Suspense fallback={null}>
          <RouteProgressIndicator />
        </Suspense>
        {children}
        <FloatingChatModal />
        <OfflineBanner />
      </ToastProvider>
    </AuthProvider>
  );
}

