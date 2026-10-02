"use client";

import React from "react";
import { AuthProvider } from "@/lib/auth/authContext";
import { FloatingChatModal } from "@/components/chat/FloatingChatModal";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <FloatingChatModal />
    </AuthProvider>
  );
}
