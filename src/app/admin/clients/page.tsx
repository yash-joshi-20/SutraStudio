import React, { Suspense } from "react";
import { AdminDashboardClient } from "../AdminDashboardClient";

export const dynamic = "force-dynamic";

export default function AdminClientsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-8 text-xs text-[#737373]">
          Loading Sutra CRM Clients Directory...
        </div>
      }
    >
      <AdminDashboardClient initialTab="clients" />
    </Suspense>
  );
}
