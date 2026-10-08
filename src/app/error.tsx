"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { RotateCcw, AlertTriangle, Home, Mail } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime exception to console or telemetry
    console.error("Runtime exception captured by Sutra error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8F5EF] text-[#0F172A]">
      <div className="max-w-md w-full p-8 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xl text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-[#0F172A]">
            Unexpected Studio Exception
          </h1>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Our creative pipeline encountered an unexpected state. Your project data and session in Google Drive and Firestore remain completely secure.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-[11px] font-mono text-[#5C3A1E] text-left overflow-x-auto">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => reset()}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Retry Pipeline
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Home className="w-4 h-4" />}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
