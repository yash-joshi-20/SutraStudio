"use client";

import React from "react";
import { AuthProvider } from "@/lib/auth/authContext";
import { ToastProvider } from "@/components/ui/Toast";
import { FloatingChatModal } from "@/components/chat/FloatingChatModal";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
        <FloatingChatModal />
      </ToastProvider>
    </AuthProvider>
  );
}

