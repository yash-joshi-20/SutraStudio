"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/authContext";
import { LotusSymbol } from "@/components/brand/SutraLogo";

function ChatPageRedirector() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-sutra-chat"));
        router.replace(user ? "/dashboard" : "/");
      }
    }
  }, [router, user, isLoading]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#FFFDF9] border border-[#E5E1D8] flex items-center justify-center shadow-md mb-4 animate-pulse">
        <LotusSymbol className="w-9 h-9" color="gold" />
      </div>
      <h1 className="font-serif text-lg font-bold text-[#171717] mb-1">
        Opening Sutra Studio Concierge...
      </h1>
      <p className="text-xs text-[#64748B]">
        Redirecting you to the interactive studio workspace.
      </p>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center font-serif text-[#5C3A1E]">
          Loading Sutra Chat...
        </div>
      }
    >
      <ChatPageRedirector />
    </Suspense>
  );
}
