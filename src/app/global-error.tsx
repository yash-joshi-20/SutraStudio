"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-6 bg-[#F8F5EF] text-[#0F172A] font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xl text-center space-y-4">
          <h2 className="text-xl font-bold text-[#0F172A]">Something went wrong</h2>
          <p className="text-xs text-[#64748B]">
            A critical error occurred while rendering the application.
          </p>
          {error?.message && (
            <p className="text-[11px] font-mono text-[#5C3A1E] bg-[#FAF9F5] p-3 rounded-lg border border-[#EADFCB] text-left break-all">
              {error.message}
            </p>
          )}
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#5C3A1E] text-white text-xs font-semibold hover:bg-[#432A15] transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
