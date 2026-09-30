"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { KPITile } from "@/components/dashboard/KPITile";
import { Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ShieldAlert,
  Users,
  Cpu,
  Bot,
  CheckCircle,
  FileCheck,
  Activity,
  ArrowRight,
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function AdminHubPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "clients" | "conversations" | "workflows" | "audit"
  >("overview");

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A]">
      <PortalSidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-6xl pb-24 md:pb-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EADFCB] gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
              STUDIO OPERATIONS
            </span>
            <h1 className="font-serif text-3xl font-semibold text-[#0F172A] mt-1">
              Admin Command Workspace
            </h1>
            <p className="text-xs text-[#64748B]">
              Role-based control center: clients, AI routing pipelines, deliverable approvals, and audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FFFDF9] border border-[#EADFCB] px-3.5 py-1.5 rounded-full text-xs text-[#5C3A1E] font-semibold">
            <ShieldAlert className="w-4 h-4 text-[#D4A35A]" />
            <span>Admin Clearance Active</span>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-[#EADFCB] pb-2">
          {[
            { id: "overview", label: "Operations Overview" },
            { id: "clients", label: "Client Directory" },
            { id: "conversations", label: "AI & Client Chats" },
            { id: "workflows", label: "Active Workflows" },
            { id: "audit", label: "System Audit Logs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#5C3A1E] text-white shadow-xs"
                  : "bg-[#FFFDF9] text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <KPITile label="Registered Clients" value="48" sublabel="+4 this week" />
              <KPITile label="Running Workflows" value="12" sublabel="n8n & AI active" variant="progress" />
              <KPITile label="Deliverables Ready" value="7" sublabel="Awaiting review" variant="completed" />
              <KPITile label="Total Studio Volume" value="$42,800" sublabel="Sep 2026" variant="pending" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Client Events */}
              <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EADFCB]">
                  <h3 className="font-serif font-semibold text-base text-[#0F172A] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#5C3A1E]" />
                    <span>New Client Registrations</span>
                  </h3>
                  <Badge variant="progress">Real-time</Badge>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#F8F5EF]">
                    <div>
                      <p className="font-semibold text-[#0F172A]">Maison Aura Luxury</p>
                      <p className="text-[#64748B]">client@maisonaura.com</p>
                    </div>
                    <span className="text-[#94A3B8]">15m ago</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#F8F5EF]">
                    <div>
                      <p className="font-semibold text-[#0F172A]">Vedic Living Residences</p>
                      <p className="text-[#64748B]">architecture@vedicliving.in</p>
                    </div>
                    <span className="text-[#94A3B8]">2h ago</span>
                  </div>
                </div>
              </div>

              {/* Active AI Routing Jobs */}
              <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EADFCB]">
                  <h3 className="font-serif font-semibold text-base text-[#0F172A] flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#5C3A1E]" />
                    <span>Workflow Pipelines in Execution</span>
                  </h3>
                  <Badge variant="completed">12 Active</Badge>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#F8F5EF]">
                    <div>
                      <p className="font-semibold text-[#0F172A]">3D Room Texture & Lighting</p>
                      <p className="text-[#64748B]">Workflow: `interior` • Step 3/5</p>
                    </div>
                    <Badge variant="progress">Running</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#F8F5EF]">
                    <div>
                      <p className="font-semibold text-[#0F172A]">10s Video Voiceover Sync</p>
                      <p className="text-[#64748B]">Workflow: `video` • Render Done</p>
                    </div>
                    <Badge variant="completed">Completed</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Clients */}
        {activeTab === "clients" && (
          <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] divide-y divide-[#EADFCB]/60 shadow-xs overflow-hidden">
            {[
              { name: "Maison Aura", email: "info@maisonaura.com", orders: 3, spend: "$2,250", status: "Active" },
              { name: "Vedic Living Architecture", email: "projects@vedic.com", orders: 2, spend: "$1,600", status: "Active" },
              { name: "Zenith Developments", email: "marketing@zenith.ae", orders: 5, spend: "$5,400", status: "Active" },
              { name: "Shri Naturals", email: "growth@shrinaturals.com", orders: 1, spend: "$750", status: "Active" },
            ].map((client) => (
              <div key={client.name} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-[#0F172A]">{client.name}</h4>
                  <p className="text-xs text-[#64748B]">{client.email} • {client.orders} orders placed</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-[#5C3A1E]">{client.spend}</p>
                  <span className="text-[11px] text-[#2E7D4F] font-semibold">{client.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Conversations & AI Takeover */}
        {activeTab === "conversations" && (
          <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-semibold text-lg text-[#0F172A]">
              Live AI Conversations & Human Takeover
            </h3>
            <p className="text-xs text-[#64748B]">
              Inspect live client AI sessions. Admin leads can intervene and switch thread to human producer mode.
            </p>
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#0F172A]">Yash Joshi (Living Suite)</span>
                    <Badge variant="gold">AI Classifier Active</Badge>
                  </div>
                  <p className="text-xs text-[#475569] mt-1">
                    Last prompt: &quot;Can we do 4K multi-angle lighting for our new catalog?&quot;
                  </p>
                </div>
                <Link href="/chat">
                  <Button variant="primary" size="sm">
                    Take Over Chat
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Workflows */}
        {activeTab === "workflows" && (
          <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-semibold text-lg text-[#0F172A]">
              Isolated AI Service Workflow Engines
            </h3>
            <p className="text-xs text-[#64748B]">
              Each workflow executes independently without cross-contaminating other pipelines.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {[
                { name: "Image Pipeline", slug: "image", active: 4, provider: "Midjourney/Flux + Retouch" },
                { name: "Video Pipeline", slug: "video", active: 2, provider: "Runway/Luma + ElevenLabs" },
                { name: "3D Spatial Pipeline", slug: "three-d", active: 3, provider: "Meshy/Spline + Blender" },
                { name: "360 Virtual Tour", slug: "three-sixty", active: 1, provider: "Pannellum + Equirectangular" },
                { name: "Interior Render Engine", slug: "interior", active: 2, provider: "ControlNet SDXL Architectural" },
                { name: "Automation & Drive Sync", slug: "automation", active: 5, provider: "n8n Webhook HMAC" },
              ].map((wf) => (
                <div key={wf.slug} className="p-4 rounded-xl border border-[#EADFCB] bg-[#FFFFFF]">
                  <h4 className="font-semibold text-xs text-[#0F172A]">{wf.name}</h4>
                  <p className="text-[10px] text-[#64748B] mt-0.5">{wf.provider}</p>
                  <p className="text-xs font-bold text-[#5C3A1E] mt-3">{wf.active} Jobs Running</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: System Audit Logs */}
        {activeTab === "audit" && (
          <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-6 shadow-xs space-y-4">
            <h3 className="font-serif font-semibold text-lg text-[#0F172A]">
              Security & Operations Audit Trail
            </h3>
            <div className="space-y-2 text-xs font-mono text-[#475569]">
              <div className="p-2.5 rounded-lg bg-[#F8F5EF] flex justify-between">
                <span>[AUTH] Client UID_098 verified via Firebase ID Token</span>
                <span className="text-[#94A3B8]">10:14:22 UTC</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F8F5EF] flex justify-between">
                <span>[DRIVE] Asset `Aura_Noir.png` synced to Drive folder `SUTRA_CLIENT_001`</span>
                <span className="text-[#94A3B8]">10:12:05 UTC</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F8F5EF] flex justify-between">
                <span>[WORKFLOW] Isolated run `img-wf-9921` completed in 4.2s</span>
                <span className="text-[#94A3B8]">09:58:11 UTC</span>
              </div>
            </div>
          </div>
        )}
      </main>

        <MobileBottomNav />
      </div>
    </RouteGuard>
  );
}
