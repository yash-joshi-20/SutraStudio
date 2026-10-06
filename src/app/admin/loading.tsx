import React from "react";

export default function AdminLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EADFCB]">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-[#EADFCB]/60 rounded-lg" />
          <div className="h-4 w-96 max-w-full bg-[#EADFCB]/40 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-[#EADFCB]/60 rounded-xl" />
          <div className="h-9 w-36 bg-[#EADFCB]/60 rounded-xl" />
        </div>
      </div>

      {/* Metric Tiles Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-4 space-y-2">
            <div className="h-4 w-20 bg-[#EADFCB]/50 rounded" />
            <div className="h-7 w-16 bg-[#EADFCB]/70 rounded" />
          </div>
        ))}
      </div>

      {/* Main Table Skeleton */}
      <div className="h-96 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 space-y-4">
        <div className="h-6 w-52 bg-[#EADFCB]/60 rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full bg-[#FAF9F5] border border-[#EADFCB]/40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
