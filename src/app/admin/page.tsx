"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { KPITile } from "@/components/dashboard/KPITile";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import {
  ShieldAlert,
  Users,
  Cpu,
  Bot,
  CheckCircle2,
  FileCheck,
  Activity,
  ArrowRight,
  Search,
  HardDrive,
  Eye,
  SlidersHorizontal,
  ExternalLink,
  Lock,
  Layers,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Send,
  Play,
  PlayCircle,
  Clock,
  RefreshCw,
  Terminal,
  Box,
  Video,
  Image as ImageIcon,
  Layout,
  Smartphone,
  Megaphone,
  Compass,
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";

interface ClientRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  tier: "Enterprise" | "Growth" | "Starter";
  driveFolderId: string;
  activeOrders: number;
  lifetimeVolume: string;
  status: "Active" | "Pending Brief" | "Under Review";
  lastActive: string;
}

const CLIENTS_DATA: ClientRecord[] = [
  {
    id: "cl-1",
    name: "Yash Joshi",
    company: "Studio Living Architecture",
    email: "yash@studioliving.com",
    tier: "Enterprise",
    driveFolderId: "drive_fld_sutra_001",
    activeOrders: 2,
    lifetimeVolume: "₹1,85,000",
    status: "Active",
    lastActive: "10 mins ago",
  },
  {
    id: "cl-2",
    name: "Aarav Singhania",
    company: "Maison Aura Luxury Fragrances",
    email: "aarav@maisonaura.com",
    tier: "Enterprise",
    driveFolderId: "drive_fld_maison_002",
    activeOrders: 3,
    lifetimeVolume: "₹2,40,000",
    status: "Active",
    lastActive: "45 mins ago",
  },
  {
    id: "cl-3",
    name: "Meera Patel",
    company: "Zenith Spatial & Interiors",
    email: "meera@zenithliving.in",
    tier: "Growth",
    driveFolderId: "drive_fld_zenith_003",
    activeOrders: 1,
    lifetimeVolume: "₹95,000",
    status: "Under Review",
    lastActive: "3 hours ago",
  },
  {
    id: "cl-4",
    name: "Karan Verma",
    company: "Shri Naturals D2C",
    email: "growth@shrinaturals.com",
    tier: "Starter",
    driveFolderId: "drive_fld_shri_004",
    activeOrders: 0,
    lifetimeVolume: "₹45,000",
    status: "Pending Brief",
    lastActive: "Yesterday",
  },
  {
    id: "cl-5",
    name: "Devika Rao",
    company: "Vedic Living Heritage Resorts",
    email: "devika@vedicresorts.com",
    tier: "Enterprise",
    driveFolderId: "drive_fld_vedic_005",
    activeOrders: 4,
    lifetimeVolume: "₹3,20,000",
    status: "Active",
    lastActive: "Just now",
  },
];

const AUDIT_LOGS = [
  { id: "log-1", event: "AUTH_SESSION", actor: "yash@studioliving.com", detail: "Firebase ID token validated. Session active.", time: "10:24:12 UTC", type: "info" },
  { id: "log-2", event: "DRIVE_SYNC", actor: "n8n_webhook_worker", detail: "Master render synced to drive_fld_sutra_001/3D_RENDERS", time: "10:18:05 UTC", type: "success" },
  { id: "log-3", event: "REVISION_REQUEST", actor: "yash@studioliving.com", detail: "Revision round 1 initiated on order #ORD-001", time: "10:04:30 UTC", type: "warning" },
  { id: "log-4", event: "WORKFLOW_DISPATCH", actor: "ai_router_core", detail: "Triggered 3D spatial meshing pipeline in isolated container", time: "09:55:18 UTC", type: "info" },
  { id: "log-5", event: "ORDER_CREATED", actor: "aarav@maisonaura.com", detail: "Order #ORD-008 created in Firestore: 4K Commercial Reel", time: "09:30:00 UTC", type: "success" },
];

interface AdminChatSession {
  id: string;
  clientName: string;
  company: string;
  vaultId: string;
  mode: "ai" | "human";
  lastPrompt: string;
  workflowTag: string;
  lastTime: string;
  messages: {
    sender: "client" | "ai" | "admin" | "note";
    text: string;
    time: string;
    workflow?: string;
  }[];
}

const INITIAL_ADMIN_SESSIONS: AdminChatSession[] = [
  {
    id: "cl-1",
    clientName: "Yash Joshi",
    company: "Studio Living Architecture",
    vaultId: "drive_fld_sutra_001",
    mode: "ai",
    lastPrompt: "Can we do 4K multi-angle lighting passes for our new catalog?",
    workflowTag: "3D Visualization (95% match)",
    lastTime: "5m ago",
    messages: [
      { sender: "client", text: "Can we do 4K multi-angle lighting passes for our new catalog?", time: "10:20 AM" },
      { sender: "ai", text: "I have classified your request under 3D Visualization pipeline. We can generate draft renders in 48 hours.", time: "10:21 AM", workflow: "3D Visualization (95% match)" },
    ],
  },
  {
    id: "cl-2",
    clientName: "Aarav Singhania",
    company: "Maison Aura Luxury Fragrances",
    vaultId: "drive_fld_maison_002",
    mode: "human",
    lastPrompt: "ProRes master video ready for Google Drive vault export.",
    workflowTag: "Video Production",
    lastTime: "25m ago",
    messages: [
      { sender: "client", text: "Can you confirm the color grading pass on the fragrance reel?", time: "09:45 AM" },
      { sender: "admin", text: "Raghavan here: I've personally reviewed the color balance. ProRes master will be in your Drive vault by 2 PM.", time: "09:50 AM" },
      { sender: "note", text: "Client requested warm golden highlights on the glass bottle refraction.", time: "09:52 AM" },
    ],
  },
  {
    id: "cl-5",
    clientName: "Devika Rao",
    company: "Vedic Living Heritage Resorts",
    vaultId: "drive_fld_vedic_005",
    mode: "ai",
    lastPrompt: "Need 360 VR virtual tour bake for our heritage pavilion",
    workflowTag: "360 VR Spatial",
    lastTime: "1h ago",
    messages: [
      { sender: "client", text: "Need 360 VR virtual tour bake for our heritage pavilion", time: "09:10 AM" },
      { sender: "ai", text: "Sutra AI: Initialized 360 View pipeline. Panoramas will be compiled for web and VR headsets.", time: "09:12 AM", workflow: "360 View (96% match)" },
    ],
  },
];

export interface StudioWorkflowEngine {
  slug: string;
  name: string;
  category: "Visual & 3D" | "Video & VR" | "Code & Growth";
  provider: string;
  latency: string;
  activeJobs: number;
  description: string;
  inputFormat: string;
  outputVault: string;
  sla: string;
  iconName: "image" | "video" | "box" | "compass" | "layers" | "megaphone" | "layout" | "smartphone";
}

export const STUDIO_WORKFLOW_ENGINES: StudioWorkflowEngine[] = [
  {
    slug: "image",
    name: "Image Generation Pipeline",
    category: "Visual & 3D",
    provider: "Midjourney v6.1 / Flux Pro + Real-ESRGAN Upscale",
    latency: "850ms",
    activeJobs: 4,
    description: "Diffusion model synthesis, studio multi-light simulation pass, and ultra-high resolution upscale for marketing & print.",
    inputFormat: "Text Prompt / Brand Moodboard",
    outputVault: "drive_fld_*/IMAGES",
    sla: "99.98%",
    iconName: "image",
  },
  {
    slug: "video",
    name: "Video Production Pipeline",
    category: "Video & VR",
    provider: "Runway Gen-3 Alpha / Luma Dream Machine + ElevenLabs Audio",
    latency: "2.4s",
    activeJobs: 2,
    description: "Cinematographic commercial reels, 4K camera maneuvers, motion graphics, and synchronized spatial audio passes.",
    inputFormat: "Storyboards / Scene Descriptors",
    outputVault: "drive_fld_*/VIDEOS",
    sla: "99.95%",
    iconName: "video",
  },
  {
    slug: "three-d",
    name: "3D Spatial Pipeline",
    category: "Visual & 3D",
    provider: "Meshy v2 / Tripo 3D + Blender Geometry Nodes",
    latency: "1.2s",
    activeJobs: 3,
    description: "High-poly mesh modeling, PBR procedural materials, and GLTF/USDZ asset export for luxury e-commerce and AR.",
    inputFormat: "Product CAD / Orthographic Views",
    outputVault: "drive_fld_*/3D_RENDERS",
    sla: "99.99%",
    iconName: "box",
  },
  {
    slug: "three-sixty",
    name: "360 Virtual Tour VR",
    category: "Video & VR",
    provider: "Pannellum Engine + HDR Equirectangular Stitching",
    latency: "1.1s",
    activeJobs: 1,
    description: "Interactive architectural walkthroughs, spherical HDR node stitching, and multi-room portal linking for web and VR.",
    inputFormat: "Spherical Panoramas / Floor Plan",
    outputVault: "drive_fld_*/360_TOURS",
    sla: "99.94%",
    iconName: "compass",
  },
  {
    slug: "interior",
    name: "Interior Architectural Engine",
    category: "Visual & 3D",
    provider: "ControlNet SDXL Architecture + Depth Maps",
    latency: "1.8s",
    activeJobs: 2,
    description: "Transforms architectural line drawings and rough wireframes into photorealistic styled spaces with heritage materials.",
    inputFormat: "2D Layout / Architectural Blueprint",
    outputVault: "drive_fld_*/INTERIOR",
    sla: "99.97%",
    iconName: "layers",
  },
  {
    slug: "marketing",
    name: "Marketing & Ad Creative Pipeline",
    category: "Code & Growth",
    provider: "Automated Copywriting + Multi-Aspect Ratio Resizing",
    latency: "420ms",
    activeJobs: 3,
    description: "Generates multi-platform ad banners (1:1, 9:16, 16:9), copy variations, and campaign collateral ready for ad networks.",
    inputFormat: "Campaign Goal / Target Audience",
    outputVault: "drive_fld_*/MARKETING",
    sla: "99.99%",
    iconName: "megaphone",
  },
  {
    slug: "website",
    name: "Website Development Pipeline",
    category: "Code & Growth",
    provider: "Next.js 16 Turbopack CI/CD + Vercel Deployment",
    latency: "3.2s",
    activeJobs: 2,
    description: "Compiles responsive Next.js landing pages, headless CMS bindings, and sub-second Lighthouse 98+ optimizations.",
    inputFormat: "Figma Tokens / Section Specs",
    outputVault: "drive_fld_*/WEBSITE",
    sla: "99.99%",
    iconName: "layout",
  },
  {
    slug: "app",
    name: "App & Mobile Pipeline",
    category: "Code & Growth",
    provider: "React Native / PWA Component Architecture & Firebase Auth Sync",
    latency: "4.1s",
    activeJobs: 1,
    description: "Scaffolds cross-platform iOS & Android screens, offline state persistence, and Firebase security rule validation.",
    inputFormat: "User Journey / Design Tokens",
    outputVault: "drive_fld_*/MOBILE_APP",
    sla: "99.96%",
    iconName: "smartphone",
  },
];

export default function AdminHubPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "clients" | "conversations" | "workflows" | "audit"
  >("overview");

  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);

  // Admin Chat & AI Takeover Console State
  const [sessions, setSessions] = useState<AdminChatSession[]>(INITIAL_ADMIN_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("cl-1");
  const [producerInput, setProducerInput] = useState("");

  const currentSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  const handleToggleTakeover = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              mode: s.mode === "human" ? "ai" : "human",
            }
          : s
      )
    );
  };

  const handleSendProducerMessage = (textToSend?: string) => {
    const content = textToSend || producerInput;
    if (!content.trim()) return;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSessionId
          ? {
              ...s,
              mode: "human",
              lastPrompt: content,
              lastTime: "Just now",
              messages: [
                ...s.messages,
                {
                  sender: "admin",
                  text: content,
                  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }
          : s
      )
    );
    setProducerInput("");
  };

  const handleAddInternalNote = () => {
    if (!producerInput.trim()) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSessionId
          ? {
              ...s,
              messages: [
                ...s.messages,
                {
                  sender: "note",
                  text: producerInput,
                  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }
          : s
      )
    );
    setProducerInput("");
  };

  // 8 AI Workflow Engines State
  const [workflowFilter, setWorkflowFilter] = useState("All");
  const [workflowJobs, setWorkflowJobs] = useState([
    { id: "run_three-d_9821", name: "3D Spatial Pipeline", order: "#ORD-001", status: "Running", progress: 65, duration: "1m 14s", target: "drive_fld_sutra_001/3D_RENDERS" },
    { id: "run_video_8842", name: "Video Production Pipeline", order: "#ORD-003", status: "Completed", progress: 100, duration: "3m 40s", target: "drive_fld_sutra_001/VIDEOS" },
    { id: "run_interior_7714", name: "Interior Architectural Engine", order: "#ORD-005", status: "Running", progress: 88, duration: "48s", target: "drive_fld_zenith_003/INTERIOR" },
    { id: "run_website_6621", name: "Website Development Pipeline", order: "#ORD-002", status: "Completed", progress: 100, duration: "2m 10s", target: "drive_fld_sutra_001/CODE" },
    { id: "run_app_5510", name: "App & Mobile Pipeline", order: "#ORD-007", status: "Running", progress: 40, duration: "25s", target: "drive_fld_vedic_005/APP" },
  ]);
  const [dispatchingWf, setDispatchingWf] = useState<string | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<string>("");

  const handleDispatchJob = async (wfSlug: string, wfName: string) => {
    setDispatchingWf(wfSlug);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: `ORD-QA-${Math.floor(Math.random() * 900 + 100)}`,
          workflowType: wfSlug,
          action: "dispatch",
        }),
      });
      const data = await res.json();
      const newJob = {
        id: data.runId || `run_${wfSlug}_${Date.now()}`,
        name: wfName,
        order: data.orderId || "#ORD-TEST",
        status: "Running",
        progress: 20,
        duration: "Just now",
        target: "Google Drive Client Folder",
      };
      setWorkflowJobs((prev) => [newJob, ...prev]);
      setDispatchSuccess(`Job ${newJob.id} dispatched to isolated ${wfName} container.`);
      setTimeout(() => setDispatchSuccess(""), 3500);
    } catch {
      setDispatchSuccess(`Test execution triggered for ${wfName}.`);
      setTimeout(() => setDispatchSuccess(""), 3500);
    } finally {
      setDispatchingWf(null);
    }
  };

  const filteredClients = CLIENTS_DATA.filter((client) => {
    const matchesTier = tierFilter === "All" || client.tier === tierFilter;
    const matchesSearch =
      searchQuery === "" ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <PortalSidebar />

        <main id="main-content" className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto pb-24 md:pb-12 space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EADFCB] gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-semibold uppercase tracking-wider text-[#5C3A1E] mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-[#D4A35A]" />
                <span>STUDIO OPERATIONS COMMAND</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
                Admin Operations & Client Management
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Centralized control: manage client workspaces, inspect isolated AI pipelines, approve master deliverables, and audit security.
              </p>
            </div>

            {/* System Status Pills */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 bg-[#FFFDF9] border border-[#EADFCB] px-3.5 py-1.5 rounded-full text-xs text-[#2E7D4F] font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
                <span>Pipelines Operational</span>
              </div>
            </div>
          </div>

          {/* High-Density Top Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto border-b border-[#EADFCB] pb-2">
            {[
              { id: "overview", label: "Operations Overview" },
              { id: "clients", label: `Client Directory (${CLIENTS_DATA.length})` },
              { id: "conversations", label: "Chat Sessions & Takeover" },
              { id: "workflows", label: "Isolated n8n Pipelines" },
              { id: "audit", label: "Security & Audit Logs" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as "overview" | "clients" | "conversations" | "workflows" | "audit")}
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

          {/* ========================================================
              TAB 1: OPERATIONS OVERVIEW
              ======================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* KPI Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <KPITile
                  label="Registered Clients"
                  value="48"
                  sublabel="+5 onboarded this month"
                  variant="ink"
                />
                <KPITile
                  label="Running Workflows"
                  value="12"
                  sublabel="Isolated n8n containers"
                  variant="progress"
                />
                <KPITile
                  label="Deliverables Ready"
                  value="7"
                  sublabel="Awaiting review/sign-off"
                  variant="completed"
                />
                <KPITile
                  label="Monthly Volume"
                  value="₹4,28,000"
                  sublabel="Active pipeline value"
                  variant="pending"
                />
              </div>

              {/* Action Required & Pipeline Health */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Urgent Deliverables & Approvals (7 Cols) */}
                <div className="lg:col-span-7 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#EADFCB]">
                    <h3 className="font-serif font-semibold text-base text-[#0F172A] flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-[#5C3A1E]" />
                      <span>Deliverables Pending Producer Review</span>
                    </h3>
                    <Badge variant="gold" size="sm">
                      3 Urgent
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#5C3A1E]">#ORD-001</span>
                          <span className="text-xs font-semibold text-[#0F172A]">Luxury Living Suite 3D</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          Client requested revision on wood texture specularity. Draft 02 ready for QA.
                        </p>
                      </div>
                      <Link href="/orders">
                        <Button variant="primary" size="sm">
                          Review QA
                        </Button>
                      </Link>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#5C3A1E]">#ORD-003</span>
                          <span className="text-xs font-semibold text-[#0F172A]">Commercial Brand Reel 15s</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          ProRes 422 color pass complete. Ready to dispatch to Google Drive vault.
                        </p>
                      </div>
                      <Button variant="secondary" size="sm">
                        Approve Release
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Engine Health & Sync Status (5 Cols) */}
                <div className="lg:col-span-5 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#EADFCB]">
                    <h3 className="font-serif font-semibold text-base text-[#0F172A] flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#5C3A1E]" />
                      <span>Infrastructure Status</span>
                    </h3>
                    <Badge variant="completed" size="sm">
                      100% Uptime
                    </Badge>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-[#5C3A1E]" />
                        <span className="font-semibold text-[#0F172A]">Google Drive Vault API</span>
                      </div>
                      <span className="text-[#2E7D4F] font-bold">Connected (AES-256)</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#5C3A1E]" />
                        <span className="font-semibold text-[#0F172A]">Firebase Auth Service</span>
                      </div>
                      <span className="text-[#2E7D4F] font-bold">Active & Enforced</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#5C3A1E]" />
                        <span className="font-semibold text-[#0F172A]">n8n Workflow Daemon</span>
                      </div>
                      <span className="text-[#2E7D4F] font-bold">12 Isolated Queues</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: CLIENT DIRECTORY & MANAGEMENT
              ======================================================== */}
          {activeTab === "clients" && (
            <div className="space-y-6">
              {/* Search & Tier Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {["All", "Enterprise", "Growth", "Starter"].map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setTierFilter(tier)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        tierFilter === tier
                          ? "bg-[#5C3A1E] text-white shadow-xs"
                          : "bg-[#FFFDF9] text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A]"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>

                <div className="relative flex items-center w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search client, email or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A]"
                  />
                </div>
              </div>

              {/* High-Density Client Table */}
              <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9F5] border-b border-[#EADFCB] text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
                      <tr>
                        <th className="py-3.5 px-6">Client / Company</th>
                        <th className="py-3.5 px-4">Tier</th>
                        <th className="py-3.5 px-4">Vault ID</th>
                        <th className="py-3.5 px-4">Active Orders</th>
                        <th className="py-3.5 px-4">Lifetime Spend</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EADFCB]/60">
                      {filteredClients.map((client) => (
                        <tr
                          key={client.id}
                          className="hover:bg-[#FAF9F5]/60 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <Avatar name={client.name} size="sm" />
                              <div>
                                <p className="font-semibold text-[#0F172A]">{client.name}</p>
                                <p className="text-[11px] text-[#64748B]">{client.company}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={
                                client.tier === "Enterprise"
                                  ? "gold"
                                  : client.tier === "Growth"
                                  ? "progress"
                                  : "neutral"
                              }
                              size="sm"
                              showDot={false}
                            >
                              {client.tier}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 font-mono text-[11px] text-[#5C3A1E]">
                            {client.driveFolderId}
                          </td>
                          <td className="py-4 px-4 font-semibold text-[#0F172A]">
                            {client.activeOrders} Orders
                          </td>
                          <td className="py-4 px-4 font-serif font-bold text-[#5C3A1E]">
                            {client.lifetimeVolume}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`text-[11px] font-semibold ${
                                client.status === "Active"
                                  ? "text-[#2E7D4F]"
                                  : client.status === "Under Review"
                                  ? "text-[#C2761A]"
                                  : "text-[#64748B]"
                              }`}
                            >
                              ● {client.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedClient(client)}
                            >
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: CONVERSATIONS & HUMAN TAKEOVER
              ======================================================== */}
          {activeTab === "conversations" && (
            <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
              {/* Left Column: Client Sessions List (4 Cols) */}
              <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#EADFCB] bg-[#FAF9F5] flex flex-col">
                <div className="p-4 border-b border-[#EADFCB]">
                  <h3 className="font-serif font-semibold text-base text-[#0F172A]">
                    Client AI Sessions ({sessions.length})
                  </h3>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Live client conversations with Sutra AI router.
                  </p>
                </div>

                <div className="divide-y divide-[#EADFCB]/60 overflow-y-auto flex-1">
                  {sessions.map((sess) => {
                    const isSelected = selectedSessionId === sess.id;
                    const isTakenOver = sess.mode === "human";
                    return (
                      <div
                        key={sess.id}
                        onClick={() => setSelectedSessionId(sess.id)}
                        className={`p-4 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#FFFDF9] border-l-4 border-l-[#5C3A1E]"
                            : "hover:bg-[#FFFDF9]/60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-xs text-[#0F172A]">
                            {sess.clientName}
                          </span>
                          <Badge
                            variant={isTakenOver ? "completed" : "gold"}
                            size="sm"
                            showDot={true}
                          >
                            {isTakenOver ? "Producer Lead" : "AI Routing"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-[#64748B] truncate font-medium">
                          {sess.company}
                        </p>
                        <p className="text-[11px] text-[#475569] mt-1 line-clamp-2 italic">
                          &quot;{sess.lastPrompt}&quot;
                        </p>
                        <span className="text-[10px] text-[#94A3B8] block mt-1.5 font-mono">
                          {sess.workflowTag} • {sess.lastTime}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Interactive Takeover Console (8 Cols) */}
              <div className="lg:col-span-8 flex flex-col justify-between bg-[#FFFDF9]">
                {/* Takeover Header */}
                <div className="p-4 sm:p-5 border-b border-[#EADFCB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF9F5]/50">
                  <div className="flex items-center gap-3">
                    <Avatar name={currentSession.clientName} size="md" status="online" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-semibold text-base text-[#0F172A]">
                          {currentSession.clientName}
                        </h4>
                        <span className="text-xs text-[#64748B]">({currentSession.company})</span>
                      </div>
                      <p className="text-[11px] text-[#94A3B8]">
                        Vault ID: <span className="font-mono text-[#5C3A1E]">{currentSession.vaultId}</span> • Channel: {currentSession.mode === "human" ? "Direct Producer (Human Lead)" : "Autonomous Sutra AI"}
                      </p>
                    </div>
                  </div>

                  {/* Mode Switcher Toggle */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={currentSession.mode === "human" ? "secondary" : "primary"}
                      size="sm"
                      onClick={() => handleToggleTakeover(currentSession.id)}
                      leftIcon={currentSession.mode === "human" ? <Bot className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    >
                      {currentSession.mode === "human"
                        ? "Release to AI Router"
                        : "Take Over as Producer"}
                    </Button>
                  </div>
                </div>

                {/* Message Stream */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 max-h-[380px]">
                  {currentSession.messages.map((m, idx) => {
                    const isClient = m.sender === "client";
                    const isAdmin = m.sender === "admin";
                    const isNote = m.sender === "note";

                    if (isNote) {
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-center gap-2 max-w-lg mx-auto font-medium"
                        >
                          <Lock className="w-3.5 h-3.5 shrink-0 text-[#D97706]" />
                          <span>[Studio Producer Note]: {m.text}</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 max-w-xl ${
                          isAdmin
                            ? "ml-auto flex-row-reverse"
                            : isClient
                            ? "mr-auto"
                            : "mr-auto"
                        }`}
                      >
                        <div className="shrink-0 pt-0.5">
                          {isAdmin ? (
                            <Avatar name="Raghavan Sharma" size="sm" status="online" />
                          ) : isClient ? (
                            <div className="w-7 h-7 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center text-[10px] font-bold">
                              C
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-center text-[10px] text-[#5C3A1E] font-bold">
                              ✦
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isAdmin
                                ? "bg-[#5C3A1E] text-white rounded-tr-none shadow-xs"
                                : isClient
                                ? "bg-[#F8F5EF] border border-[#EADFCB] text-[#0F172A] rounded-tl-none"
                                : "bg-[#FAF9F5] border border-[#EADFCB] text-[#0F172A] rounded-tl-none"
                            }`}
                          >
                            <p>{m.text}</p>
                            {m.workflow && (
                              <div className="mt-2 pt-2 border-t border-[#EADFCB]/60 text-[10px] font-semibold text-[#D4A35A] flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Classified: {m.workflow}</span>
                              </div>
                            )}
                          </div>
                          <span className={`text-[9px] text-[#94A3B8] block ${isAdmin ? "text-right" : "text-left"}`}>
                            {m.sender.toUpperCase()} • {m.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Producer Dispatch Input */}
                <div className="p-4 border-t border-[#EADFCB] bg-[#FAF9F5]/40 space-y-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-[10px] uppercase font-bold text-[#94A3B8] shrink-0">Quick Producer Replies:</span>
                    {[
                      "I am reviewing your 4K renders right now.",
                      "Revision round 01 assigned to senior 3D lead.",
                      "Google Drive vault files updated.",
                    ].map((snippet, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendProducerMessage(snippet)}
                        className="text-[11px] bg-[#FFFDF9] border border-[#EADFCB] text-[#5C3A1E] hover:border-[#D4A35A] px-2.5 py-1 rounded-full whitespace-nowrap shadow-2xs cursor-pointer"
                      >
                        {snippet}
                      </button>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendProducerMessage(producerInput);
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder={
                        currentSession.mode === "human"
                          ? "Send message as Raghavan Sharma (Principal Art Director)..."
                          : "Take over session to message directly..."
                      }
                      value={producerInput}
                      onChange={(e) => setProducerInput(e.target.value)}
                      className="flex-1 bg-[#FFFFFF] border border-[#EADFCB] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddInternalNote()}
                      title="Post Internal Producer Note (Not sent to client)"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#A98B57]" />
                      <span className="hidden sm:inline">Note</span>
                    </Button>

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!producerInput.trim()}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Send
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: ISOLATED WORKFLOW PIPELINES & JOB EXECUTION
              ======================================================== */}
          {activeTab === "workflows" && (
            <div className="space-y-8">
              {/* Notification Banner */}
              {dispatchSuccess && (
                <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] flex items-center justify-between text-xs animate-in fade-in duration-300">
                  <div className="flex items-center gap-2.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>{dispatchSuccess}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#15803D]">Dispatched to container</span>
                </div>
              )}

              {/* Main Panel */}
              <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EADFCB]/60 pb-6">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#0F172A]">
                        Studio AI Workflow Engines
                      </h3>
                      <Badge variant="completed" size="sm">
                        8 Active
                      </Badge>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      Automated creative generation pipelines executing inside isolated micro-containers with Google Drive sync.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {(["All", "Visual & 3D", "Video & VR", "Code & Growth"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setWorkflowFilter(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
                          workflowFilter === cat
                            ? "bg-[#5C3A1E] text-white shadow-xs"
                            : "bg-[#FAF9F5] text-[#64748B] hover:text-[#0F172A] border border-[#EADFCB]"
                        }`}
                      >
                        {cat}
                        {cat === "All" && ` (8)`}
                        {cat === "Visual & 3D" && ` (3)`}
                        {cat === "Video & VR" && ` (2)`}
                        {cat === "Code & Growth" && ` (3)`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 8 Engine Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {STUDIO_WORKFLOW_ENGINES.filter((eng) => {
                    if (workflowFilter === "All") return true;
                    return eng.category === workflowFilter;
                  }).map((eng) => (
                    <div
                      key={eng.slug}
                      className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex flex-col justify-between space-y-4 hover:border-[#D4A35A] transition-all hover:shadow-xs group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-10 h-10 rounded-xl bg-white border border-[#EADFCB] flex items-center justify-center shrink-0 shadow-xs">
                            {eng.iconName === "image" && <ImageIcon className="w-5 h-5 text-[#5C3A1E]" />}
                            {eng.iconName === "video" && <Video className="w-5 h-5 text-[#5C3A1E]" />}
                            {eng.iconName === "box" && <Box className="w-5 h-5 text-[#5C3A1E]" />}
                            {eng.iconName === "compass" && <Compass className="w-5 h-5 text-[#5C3A1E]" />}
                            {eng.iconName === "layers" && <Layers className="w-5 h-5 text-[#5C3A1E]" />}
                            {eng.iconName === "megaphone" && <Megaphone className="w-5 h-5 text-[#5C3A1E]" />}
                            {eng.iconName === "layout" && <Layout className="w-5 h-5 text-[#5C3A1E]" />}
                            {eng.iconName === "smartphone" && <Smartphone className="w-5 h-5 text-[#5C3A1E]" />}
                          </div>
                          <span className="font-mono text-[10px] text-[#A98B57] bg-[#F8F5EF] px-2 py-0.5 rounded border border-[#EADFCB] font-bold">
                            {eng.sla} SLA
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-serif font-semibold text-sm text-[#0F172A] group-hover:text-[#5C3A1E] transition-colors">
                              {eng.name}
                            </h4>
                          </div>
                          <span className="text-[11px] font-mono text-[#D4A35A] uppercase tracking-wider block mt-0.5">
                            {eng.category}
                          </span>
                        </div>

                        <p className="text-xs text-[#64748B] line-clamp-3 leading-relaxed">
                          {eng.description}
                        </p>

                        <div className="space-y-1.5 pt-2 border-t border-[#EADFCB]/60 text-[11px] font-mono text-[#64748B]">
                          <div className="flex items-center justify-between">
                            <span className="text-[#94A3B8]">Stack:</span>
                            <span className="text-[#0F172A] truncate max-w-[140px] text-right font-medium" title={eng.provider}>
                              {eng.provider.split("/")[0]}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#94A3B8]">Vault Sync:</span>
                            <span className="text-[#5C3A1E] font-medium truncate max-w-[140px]">
                              {eng.outputVault}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#EADFCB]/60 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[11px] text-[#5C3A1E] font-bold">
                            {eng.activeJobs} Jobs Active
                          </span>
                          <span className="text-[#94A3B8] font-mono text-[11px]">Avg {eng.latency}</span>
                        </div>

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="w-full text-xs justify-center py-1.5"
                          disabled={dispatchingWf === eng.slug}
                          onClick={() => handleDispatchJob(eng.slug, eng.name)}
                          leftIcon={
                            dispatchingWf === eng.slug ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#5C3A1E]" />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-[#5C3A1E]" />
                            )
                          }
                        >
                          {dispatchingWf === eng.slug ? "Dispatching..." : "Dispatch Job"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Job Execution Queue */}
              <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EADFCB]/60 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#A98B57]" />
                      <h4 className="font-serif text-lg font-semibold text-[#0F172A]">
                        Live Workflow Execution Ledger
                      </h4>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Real-time asynchronous job progress synced to client Google Drive vaults.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]"></span>
                    </span>
                    <span className="text-xs font-mono text-[#16A34A] font-medium">Worker Polling Active</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#EADFCB] text-[#64748B] font-mono uppercase text-[10px] tracking-wider">
                        <th className="pb-3 font-semibold">Job ID / Run</th>
                        <th className="pb-3 font-semibold">Pipeline Engine</th>
                        <th className="pb-3 font-semibold">Order</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Progress</th>
                        <th className="pb-3 font-semibold">Target Drive Vault</th>
                        <th className="pb-3 font-semibold text-right">Elapsed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EADFCB]/60">
                      {workflowJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-[#FAF9F5] transition-colors">
                          <td className="py-3.5 font-mono text-[11px] font-bold text-[#0F172A]">
                            {job.id}
                          </td>
                          <td className="py-3.5 font-medium text-[#0F172A]">
                            {job.name}
                          </td>
                          <td className="py-3.5 font-mono text-[11px] text-[#A98B57] font-semibold">
                            {job.order}
                          </td>
                          <td className="py-3.5">
                            {job.status === "Running" ? (
                              <Badge variant="progress" size="sm">
                                <span className="animate-pulse mr-1 inline-block">●</span> Running
                              </Badge>
                            ) : (
                              <Badge variant="completed" size="sm">
                                Completed
                              </Badge>
                            )}
                          </td>
                          <td className="py-3.5 w-44">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                                <span>{job.progress}%</span>
                              </div>
                              <div className="w-full bg-[#EADFCB]/60 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    job.progress === 100 ? "bg-[#16A34A]" : "bg-[#D4A35A]"
                                  }`}
                                  style={{ width: `${job.progress}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 font-mono text-[11px] text-[#5C3A1E] truncate max-w-[200px]" title={job.target}>
                            {job.target}
                          </td>
                          <td className="py-3.5 text-right font-mono text-[11px] text-[#94A3B8]">
                            {job.duration}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: SECURITY AUDIT TRAIL
              ======================================================== */}
          {activeTab === "audit" && (
            <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                  Cryptographic Security & System Audit Trail
                </h3>
                <p className="text-xs text-[#64748B]">
                  Immutable ledger of authentication events, Google Drive file synchronizations, and pipeline dispatches.
                </p>
              </div>

              <div className="space-y-2.5 font-mono text-xs text-[#475569]">
                {AUDIT_LOGS.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-[#5C3A1E] text-[11px] px-2 py-0.5 rounded bg-[#F8F5EF] border border-[#EADFCB]">
                        [{log.event}]
                      </span>
                      <span className="font-medium text-[#0F172A]">{log.detail}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#94A3B8] shrink-0">
                      <span>{log.actor}</span>
                      <span>• {log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <MobileBottomNav />

        {/* Client Detail Drawer / Modal */}
        <Modal
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          title={selectedClient?.name || "Client Dossier"}
          description={`${selectedClient?.company} • Tier: ${selectedClient?.tier}`}
          maxWidth="md"
        >
          {selectedClient && (
            <div className="space-y-5 text-xs">
              <div className="p-4 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Email:</span>
                  <span className="font-semibold text-[#0F172A]">{selectedClient.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Google Drive Vault:</span>
                  <span className="font-mono text-[#5C3A1E] font-semibold">{selectedClient.driveFolderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Active Orders:</span>
                  <span className="font-bold text-[#0F172A]">{selectedClient.activeOrders} Orders</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Total Volume:</span>
                  <span className="font-serif font-bold text-[#5C3A1E] text-sm">{selectedClient.lifetimeVolume}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Last Studio Activity:</span>
                  <span className="text-[#0F172A]">{selectedClient.lastActive}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedClient(null)}
                >
                  Close
                </Button>
                <Link href="/chat">
                  <Button variant="primary" size="sm" withArrow>
                    Message Client
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </RouteGuard>
  );
}
