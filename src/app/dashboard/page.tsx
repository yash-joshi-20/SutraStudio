"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { KPITile, EmptyState } from "@/components/dashboard/KPITile";
import { Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Plus, ArrowRight, Eye } from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function ClientDashboardPage() {
  // Allows testing both zero-data empty state and active order state
  const [showEmptyState, setShowEmptyState] = useState(false);

  const mockOrders = [
    {
      id: "ord-1",
      code: "#ORD-001",
      title: "3D Interior Design — Living Suite",
      status: "progress",
      statusLabel: "In Progress",
      deliverable: "Draft 4K renders ready for review",
      updatedAt: "2 hours ago",
    },
    {
      id: "ord-2",
      code: "#ORD-003",
      title: "Social Media Ad Video — 15s Reel",
      status: "completed",
      statusLabel: "Completed",
      deliverable: "Final video uploaded to Drive",
      updatedAt: "Yesterday",
    },
    {
      id: "ord-3",
      code: "#ORD-005",
      title: "Website Landing Page — Next.js Build",
      status: "review",
      statusLabel: "In Review",
      deliverable: "Staging deployment preview ready",
      updatedAt: "3 days ago",
    },
  ];

  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A]">
      <PortalSidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-6xl pb-24 md:pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-[#EADFCB] gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
              CLIENT WORKSPACE
            </span>
            <h1 className="font-serif text-3xl font-semibold text-[#0F172A] mt-1">
              Dashboard
            </h1>
            <p className="text-xs text-[#64748B]">
              Welcome back, Yash. Here is your studio production activity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEmptyState(!showEmptyState)}
              className="text-xs font-medium text-[#64748B] hover:text-[#5C3A1E] underline cursor-pointer"
            >
              {showEmptyState ? "View Active Orders" : "Simulate Zero-Data State"}
            </button>

            <Link href="/orders">
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                New Order
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 my-8">
          <KPITile
            label="Total Orders"
            value={showEmptyState ? 0 : 5}
            sublabel={showEmptyState ? "No orders placed" : "Lifetime studio work"}
            variant="ink"
          />
          <KPITile
            label="In Progress"
            value={showEmptyState ? 0 : 2}
            sublabel={showEmptyState ? "Idle" : "Active studio workflows"}
            variant="progress"
          />
          <KPITile
            label="Completed"
            value={showEmptyState ? 0 : 3}
            sublabel={showEmptyState ? "0 deliverables" : "Delivered to Drive"}
            variant="completed"
          />
          <KPITile
            label="Pending Payment"
            value={showEmptyState ? "$0" : "$0"}
            sublabel="Account in good standing"
            variant="pending"
          />
        </div>

        {/* Content Section: Recent Orders or Zero-Data State */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-[#0F172A]">
              My Recent Orders
            </h2>
            {!showEmptyState && (
              <Link
                href="/orders"
                className="text-xs font-semibold text-[#5C3A1E] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {showEmptyState ? (
            <EmptyState
              title="No active orders yet"
              description="Welcome to your Sutra Studio workspace. Select a service to launch your first creative or development project."
              actionLabel="Explore Services & Order"
              actionHref="/orders"
            />
          ) : (
            <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] divide-y divide-[#EADFCB]/60 overflow-hidden shadow-xs">
              {mockOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8F5EF]/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-[#5C3A1E] tracking-wider">
                        {ord.code}
                      </span>
                      <Badge
                        variant={
                          ord.status === "completed"
                            ? "completed"
                            : ord.status === "progress"
                            ? "progress"
                            : "review"
                        }
                      >
                        {ord.statusLabel}
                      </Badge>
                    </div>
                    <h3 className="font-serif text-base font-semibold text-[#0F172A]">
                      {ord.title}
                    </h3>
                    <p className="text-xs text-[#64748B]">{ord.deliverable}</p>
                  </div>

                  <div className="flex items-center gap-4 sm:shrink-0">
                    <span className="text-xs text-[#94A3B8]">{ord.updatedAt}</span>
                    <Link href={`/orders`}>
                      <button className="p-2 rounded-xl bg-[#F8F5EF] text-[#0F172A] hover:bg-[#EADFCB] transition-colors cursor-pointer">
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

        <MobileBottomNav />
      </div>
    </RouteGuard>
  );
}
