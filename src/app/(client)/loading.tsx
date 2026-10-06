import React from "react";

export default function ClientLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-32 rounded-3xl bg-[#FAF9F5] border border-[#EADFCB] p-6 space-y-3">
        <div className="h-6 w-48 bg-[#EADFCB]/60 rounded-lg" />
        <div className="h-4 w-96 max-w-full bg-[#EADFCB]/40 rounded-lg" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 rounded-3xl bg-[#FAF9F5] border border-[#EADFCB] p-5 space-y-3">
            <div className="h-5 w-24 bg-[#EADFCB]/60 rounded-md" />
            <div className="h-8 w-16 bg-[#EADFCB]/80 rounded-lg" />
            <div className="h-3 w-full bg-[#EADFCB]/40 rounded-md" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="h-80 rounded-3xl bg-[#FAF9F5] border border-[#EADFCB] p-6 space-y-4">
        <div className="h-6 w-40 bg-[#EADFCB]/60 rounded-lg" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-full bg-[#EADFCB]/30 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
