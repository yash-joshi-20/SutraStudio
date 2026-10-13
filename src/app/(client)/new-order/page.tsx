"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { MasterOrderForm } from "@/components/orders/MasterOrderForm";
import {
  ArrowLeft,
  ChevronRight,
  Globe,
  Sparkles,
  Layers,
  ShieldCheck,
  Package as PackageIcon,
} from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";

function NewOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const serviceParam = searchParams.get("service") || undefined;
  const packageParam = searchParams.get("package") || undefined;
  const qtyParam = searchParams.get("qty") ? Number(searchParams.get("qty")) : undefined;

  const handleOrderSuccess = (order: any) => {
    // Dispatch event so any open widgets or listeners sync
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sutra_orders_changed"));
    }
    // Navigate to orders list to track the newly created order
    router.push("/orders");
  };

  return (
    <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      <PortalSidebar />

      <main id="main-content" className="flex-1 p-4 sm:p-8 lg:p-10 max-w-5xl pb-24 md:pb-12 space-y-6">
        {/* Navigation & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EADFCB] gap-4">
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#64748B] mb-2">
              <Link href="/dashboard" className="hover:text-[#5C3A1E]">
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <Link href="/orders" className="hover:text-[#5C3A1E]">
                Orders
              </Link>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[#0F172A] font-semibold">New Order</span>
            </nav>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
              Commission Creative Project
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Select an individual creative service or curated package bundle, provide your project brief, and pay via instant zero-fee UPI QR.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/orders"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A] hover:bg-[#F4EFE6] transition-all shadow-xs touch-target min-h-[36px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Orders</span>
            </Link>

            <NotificationBell />
          </div>
        </div>

        {/* Quick Context Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-xs">
          <div className="flex items-center gap-2 text-[#5C3A1E]">
            <Sparkles className="w-4 h-4 text-[#D4A35A] shrink-0" />
            <span className="font-medium">
              Individual Services &amp; 30-Day Retainers available with SLA turnaround guarantees.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[#64748B]">
            <Link href="/services" className="hover:text-[#5C3A1E] font-medium underline">
              Browse Services
            </Link>
            <span>•</span>
            <Link href="/packages" className="hover:text-[#5C3A1E] font-medium underline">
              Browse Packages
            </Link>
          </div>
        </div>

        {/* Master Order Intake Form Container */}
        <div className="rounded-3xl border border-[#EADFCB] bg-[#FFFDF9] p-6 sm:p-8 shadow-warm-lg">
          <MasterOrderForm
            initialServiceId={serviceParam}
            initialTierId={packageParam}
            initialQty={qtyParam}
            onOrderSuccess={handleOrderSuccess}
          />
        </div>
      </main>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <RouteGuard requiredRole="client">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#F8F5EF]">
            <div className="w-8 h-8 rounded-full border-2 border-[#D4A35A] border-t-transparent animate-spin" />
          </div>
        }
      >
        <NewOrderContent />
      </Suspense>
    </RouteGuard>
  );
}
