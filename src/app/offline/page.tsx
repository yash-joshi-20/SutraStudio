"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import { WifiOff, RefreshCw, Home, HardDrive, Smartphone } from "lucide-react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A]">
      <Navbar />

      <main id="main-content" className="flex-1 flex items-center justify-center p-6 py-20">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] flex items-center justify-center mx-auto">
            <WifiOff className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A]">
              Working Offline
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Your device is currently disconnected from the Internet. Sutra Studio cached previews and offline records remain accessible on this device.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] text-left text-xs space-y-2 text-[#5C3A1E]">
            <div className="flex items-center gap-2 font-semibold">
              <HardDrive className="w-4 h-4 text-[#D4A35A]" />
              <span>Offline Preservation Mode</span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-normal">
              Any drafts and cached client projects will automatically synchronize to Google Drive and Firestore as soon as connectivity resumes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleRetry}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Check Connection
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Home className="w-4 h-4" />}
                className="w-full sm:w-auto min-h-[44px]"
              >
                Cached Home
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
