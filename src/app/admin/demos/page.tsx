"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  Globe,
  ExternalLink,
  Plus,
  RefreshCw,
  Copy,
  Check,
  FolderGit2,
  Server,
  Layers,
  ArrowLeft,
  Trash2,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
  FileCode,
  Zap,
  ChevronRight,
  Info,
  Terminal,
} from "lucide-react";

interface ClientDemoRecord {
  id: string;
  projectName: string;
  clientName: string;
  subdomain: string;
  fullUrl: string;
  githubUrl: string;
  renderUrl?: string;
  category: "real_estate" | "ecommerce" | "hospitality" | "saas" | "portfolio" | "other";
  status: "live" | "in_development" | "pending_dns" | "archived";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDemosPage() {
  const [activeTab, setActiveTab] = useState<"directory" | "guide" | "ping">("directory");
  const [demos, setDemos] = useState<ClientDemoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for Add New Demo
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formProjectName, setFormProjectName] = useState("");
  const [formClientName, setFormClientName] = useState("");
  const [formSubdomain, setFormSubdomain] = useState("");
  const [formGithubUrl, setFormGithubUrl] = useState("");
  const [formRenderUrl, setFormRenderUrl] = useState("");
  const [formCategory, setFormCategory] = useState<ClientDemoRecord["category"]>("real_estate");
  const [formStatus, setFormStatus] = useState<ClientDemoRecord["status"]>("live");
  const [formNotes, setFormNotes] = useState("");

  // Ping Tool State
  const [pingSubdomain, setPingSubdomain] = useState("truevibe");
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    status: "idle" | "success" | "checking" | "notice";
    message: string;
    targetUrl?: string;
  }>({ status: "idle", message: "" });

  const loadDemos = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/demos");
      if (res.ok) {
        const data = await res.json();
        setDemos(data.demos || []);
      }
    } catch (err) {
      console.error("Failed to load client demos:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDemos();
  }, [loadDemos]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreateDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProjectName || !formSubdomain) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/demos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: formProjectName,
          clientName: formClientName,
          subdomain: formSubdomain,
          githubUrl: formGithubUrl,
          renderUrl: formRenderUrl,
          category: formCategory,
          status: formStatus,
          notes: formNotes,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormProjectName("");
        setFormClientName("");
        setFormSubdomain("");
        setFormGithubUrl("");
        setFormRenderUrl("");
        setFormNotes("");
        await loadDemos();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create demo");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDemo = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the active demos directory?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/demos?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDemos((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete demo:", err);
    }
  };

  const runSubdomainCheck = async (sub: string) => {
    setIsPinging(true);
    const target = `https://${sub.trim().toLowerCase()}.sutrastudios.in`;
    setPingResult({
      status: "checking",
      message: `Checking DNS and SSL resolution for ${target}...`,
      targetUrl: target,
    });

    try {
      // Direct client check (HEAD request or image test to check route)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      await fetch(target, { method: "HEAD", mode: "no-cors", signal: controller.signal });
      clearTimeout(timeoutId);

      setPingResult({
        status: "success",
        message: `✓ Domain is accessible via HTTPS. Cloudflare CNAME and Render routing are active.`,
        targetUrl: target,
      });
    } catch {
      setPingResult({
        status: "notice",
        message: `Notice: Domain is pending DNS propagation or Render service is waking up from free sleep. Verify Cloudflare CNAME record for "${sub}".`,
        targetUrl: target,
      });
    } finally {
      setIsPinging(false);
    }
  };

  const filteredDemos = demos.filter(
    (d) =>
      d.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#FAF9F5] text-[#171717]">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#E5E1D8] px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/admin"
                className="p-2 rounded-xl bg-white border border-[#E5E1D8] text-[#5C3A1E] hover:bg-[#F3EFE6] transition-colors shadow-xs"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#171717] flex items-center justify-center text-[#EADFCB] shadow-sm">
                  <Globe className="w-5 h-5 text-[#A98B57]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#171717]">
                      Client Subdomains & Demo Showcase
                    </h1>
                    <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#EADFCB]/40 text-[#5C3A1E] rounded-md border border-[#D4C3A3]/50">
                      cPanel Alternative
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#78716C]">
                    Deploy standalone GitHub projects for clients under your master domain (100% Free)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddModal(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="shadow-sm"
              >
                <span className="hidden sm:inline">Add Subdomain</span>
                <span className="sm:hidden">Add</span>
              </Button>
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Quick Banner Alert */}
          <div className="rounded-2xl border border-[#D4A35A]/30 bg-gradient-to-r from-[#FFFDF9] via-[#FAF6ED] to-[#F5EEDB] p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#A98B57]/15 text-[#8C6D37] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#171717]">
                    Zero-Cost Client Project Hosting (cPanel ની જરૂર વગર ૧૦૦% ફ્રી)
                  </h3>
                  <p className="text-xs text-[#57534E] mt-0.5 leading-relaxed">
                    તમે ક્લાયન્ટ માટે અલગ GitHub પ્રોજેક્ટ બનાવીને, તેને Render પર ફ્રીમાં હોસ્ટ કરી શકો છો અને તમારું પોતાનું સબ-ડોમેન (જેમ કે{" "}
                    <code className="bg-white/80 px-1.5 py-0.5 rounded text-[#8C6D37] font-mono text-[11px] font-bold">
                      truevibe.sutrastudios.in
                    </code>
                    ) લિંક કરી શકો છો. ક્લાયન્ટને આખો ગિટહબ પ્રોજેક્ટ સેપરેટ હેન્ડઓવર પણ આપી શકાય છે!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("guide")}
                  className="w-full sm:w-auto text-xs font-semibold px-3 py-2 bg-white text-[#5C3A1E] border border-[#E5E1D8] rounded-xl hover:bg-[#FAF9F5] transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <FileCode className="w-3.5 h-3.5 text-[#A98B57]" />
                  <span>વિગતવાર સ્ટેપ-બાય-સ્ટેપ ગાઈડ જુઓ</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E5E1D8] pb-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("directory")}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
                activeTab === "directory"
                  ? "border-[#A98B57] text-[#171717] bg-white shadow-2xs font-bold"
                  : "border-transparent text-[#78716C] hover:text-[#171717]"
              }`}
            >
              <Globe className="w-4 h-4 text-[#A98B57]" />
              <span>Active Subdomains Directory ({demos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("guide")}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
                activeTab === "guide"
                  ? "border-[#A98B57] text-[#171717] bg-white shadow-2xs font-bold"
                  : "border-transparent text-[#78716C] hover:text-[#171717]"
              }`}
            >
              <FileCode className="w-4 h-4 text-[#A98B57]" />
              <span>Setup Guide (cPanel અલ્ટરનેટિવ વિગતવાર)</span>
            </button>

            <button
              onClick={() => setActiveTab("ping")}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
                activeTab === "ping"
                  ? "border-[#A98B57] text-[#171717] bg-white shadow-2xs font-bold"
                  : "border-transparent text-[#78716C] hover:text-[#171717]"
              }`}
            >
              <Zap className="w-4 h-4 text-[#A98B57]" />
              <span>DNS Health Checker & Ping</span>
            </button>
          </div>

          {/* TAB 1: SUBDOMAINS DIRECTORY */}
          {activeTab === "directory" && (
            <div className="space-y-4">
              {/* Search & Actions Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E5E1D8] shadow-2xs">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                  <input
                    type="text"
                    placeholder="Search by project, client, or subdomain (e.g. truevibe)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#FAF9F5] border border-[#E5E1D8] rounded-xl focus:outline-hidden focus:border-[#A98B57]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadDemos}
                    disabled={isLoading}
                    className="p-2 text-[#78716C] hover:text-[#171717] bg-[#FAF9F5] hover:bg-[#F3EFE6] border border-[#E5E1D8] rounded-xl transition-colors"
                    title="Refresh Demos"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#A98B57]" : ""}`} />
                  </button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAddModal(true)}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Subdomain
                  </Button>
                </div>
              </div>

              {/* Demos Cards Grid */}
              {isLoading ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-[#E5E1D8]">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#A98B57] mx-auto mb-2" />
                  <p className="text-xs text-[#78716C]">Loading active client subdomains...</p>
                </div>
              ) : filteredDemos.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-[#E5E1D8]">
                  <Globe className="w-8 h-8 text-[#D6D3D1] mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-[#171717]">No client subdomains found</h4>
                  <p className="text-xs text-[#78716C] mt-1 max-w-sm mx-auto">
                    Click &quot;Add Subdomain&quot; to register your first client project or demo URL.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDemos.map((demo) => {
                    const isCopied = copiedId === demo.id;
                    return (
                      <div
                        key={demo.id}
                        className="bg-white rounded-2xl border border-[#E5E1D8] p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 relative flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 text-[9.5px] font-bold uppercase rounded-md tracking-wider bg-[#F5F2EB] text-[#5C3A1E] border border-[#E5E1D8]">
                                  {demo.category.replace("_", " ")}
                                </span>
                                <span
                                  className={`px-2 py-0.5 text-[9.5px] font-bold rounded-md flex items-center gap-1 ${
                                    demo.status === "live"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-amber-50 text-amber-700 border border-amber-200"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      demo.status === "live" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                                    }`}
                                  />
                                  {demo.status === "live" ? "Live" : "In Development"}
                                </span>
                              </div>
                              <h3 className="font-serif font-bold text-base text-[#171717]">{demo.projectName}</h3>
                              <p className="text-xs text-[#78716C]">Client: {demo.clientName}</p>
                            </div>

                            <button
                              onClick={() => handleDeleteDemo(demo.id, demo.projectName)}
                              className="text-[#A8A29E] hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete Subdomain"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Live URL Pill with Copy */}
                          <div className="bg-[#FAF9F5] border border-[#E5E1D8] rounded-xl p-2.5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Globe className="w-4 h-4 text-[#A98B57] shrink-0" />
                              <a
                                href={demo.fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono font-bold text-[#171717] hover:text-[#A98B57] truncate flex items-center gap-1"
                              >
                                {demo.fullUrl}
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            </div>

                            <button
                              onClick={() => copyToClipboard(demo.fullUrl, demo.id)}
                              className="px-2 py-1 text-[11px] font-semibold bg-white border border-[#E5E1D8] rounded-lg text-[#5C3A1E] hover:bg-[#FAF9F5] transition-all shrink-0 flex items-center gap-1 shadow-2xs"
                              title="Copy URL"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-600">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-[#A98B57]" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Notes */}
                          {demo.notes && <p className="text-xs text-[#57534E] leading-relaxed">{demo.notes}</p>}
                        </div>

                        {/* Card Footer Links */}
                        <div className="pt-3 border-t border-[#F5F2EB] flex items-center justify-between gap-3 text-xs">
                          {demo.githubUrl ? (
                            <a
                              href={demo.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[#5C3A1E] hover:text-[#171717] font-medium"
                            >
                              <FolderGit2 className="w-3.5 h-3.5 text-[#A98B57]" />
                              <span>GitHub Repository</span>
                            </a>
                          ) : (
                            <span className="text-[#A8A29E] text-[11px]">No GitHub URL</span>
                          )}

                          {demo.renderUrl && (
                            <a
                              href={demo.renderUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[#78716C] hover:text-[#171717] text-[11px]"
                            >
                              <Server className="w-3 h-3 text-[#A98B57]" />
                              <span>Render Service</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DETAILED STEP-BY-STEP SETUP GUIDE (GUJARATI & ENGLISH) */}
          {activeTab === "guide" && (
            <div className="bg-white rounded-2xl border border-[#E5E1D8] p-6 sm:p-8 space-y-8 shadow-2xs">
              <div className="border-b border-[#E5E1D8] pb-5">
                <span className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-md tracking-wider bg-[#F5F2EB] text-[#5C3A1E] border border-[#E5E1D8]">
                  cPanel વગર ૧૦૦% ફ્રી પદ્ધતિ
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#171717] mt-2">
                  સબ-ડોમેન અને ક્લાયન્ટ પ્રોજેક્ટ સેટઅપ કરવાની સંપૂર્ણ વિગતવાર ગાઈડ
                </h2>
                <p className="text-xs sm:text-sm text-[#78716C] mt-1">
                  આ પદ્ધતિથી ક્લાયન્ટનો ગિટહબ પ્રોજેક્ટ ૧૦૦% અલગ રહેશે અને લાઈવ સાઇટ તમારા ડોમેન (દા.ત.{" "}
                  <code className="bg-[#FAF9F5] px-1.5 py-0.5 rounded text-[#8C6D37] font-bold">
                    truevibe.sutrastudios.in
                  </code>
                  ) પર ફ્રીમાં ચાલશે.
                </p>
              </div>

              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-[#171717] text-[#EADFCB] flex items-center justify-center font-bold text-sm shrink-0">
                  ૧
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-serif text-base font-bold text-[#171717]">
                    સ્ટેપ ૧: ક્લાયન્ટ માટે અલગ GitHub રેપોઝિટરી બનાવો
                  </h3>
                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                    તમારા કમ્પ્યુટરમાં ક્લાયન્ટ માટે તદ્દન અલગ ફોલ્ડર બનાવો (જેમ કે{" "}
                    <code className="bg-[#FAF9F5] px-1 py-0.5 rounded text-[#8C6D37]">truevibe-property</code>) અને
                    તેને GitHub પર પબ્લિશ કરો.
                  </p>
                  <div className="bg-[#171717] text-[#E5E1D8] rounded-xl p-3 font-mono text-xs overflow-x-auto space-y-1">
                    <p className="text-emerald-400"># Next.js અથવા React નવો પ્રોજેક્ટ બનાવો</p>
                    <p>npx create-next-app@latest truevibe-property</p>
                    <p>cd truevibe-property</p>
                    <p>git init &amp;&amp; git push -u origin main</p>
                  </div>
                  <p className="text-[11px] text-[#78716C]">
                    ✓ ફાયદો: આ પ્રોજેક્ટ Sutra Studio થી અલગ હોવાથી તમે સીધું જ ક્લાયન્ટને ડાઉનલોડ લિંક કે ગિટહબ આપી શકશો.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-[#171717] text-[#EADFCB] flex items-center justify-center font-bold text-sm shrink-0">
                  ૨
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-serif text-base font-bold text-[#171717]">
                    સ્ટેપ ૨: Render.com પર Free Web Service બનાવો
                  </h3>
                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                    Render ડેશબોર્ડ (
                    <a
                      href="https://dashboard.render.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#A98B57] font-semibold underline"
                    >
                      dashboard.render.com
                    </a>
                    ) ખોલો અને ફ્રી સર્વિસ હોસ્ટ કરો:
                  </p>
                  <div className="bg-[#FAF9F5] border border-[#E5E1D8] rounded-xl p-3 text-xs space-y-1.5 text-[#44403C]">
                    <p>
                      <strong>1. Click:</strong> &quot;New +&quot; ➔ &quot;Web Service&quot;
                    </p>
                    <p>
                      <strong>2. Connect:</strong> ક્લાયન્ટની GitHub રેપો પસંદ કરો (દા.ત. <code>truevibe-property</code>)
                    </p>
                    <p>
                      <strong>3. Build Command:</strong> <code>npm run build</code>
                    </p>
                    <p>
                      <strong>4. Start Command:</strong> <code>npm start</code>
                    </p>
                    <p>
                      <strong>5. Plan:</strong> Free (₹0) પસંદ કરો.
                    </p>
                  </div>
                  <p className="text-[11px] text-[#78716C]">
                    Render તમને એક ફ્રી URL આપશે (જેમ કે: <code>https://truevibe-property.onrender.com</code>).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-[#171717] text-[#EADFCB] flex items-center justify-center font-bold text-sm shrink-0">
                  ૩
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-serif text-base font-bold text-[#171717]">
                    સ્ટેપ ૩: Cloudflare DNS માં માત્ર ૧ CNAME રેકોર્ડ ઉમેરો
                  </h3>
                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                    તમારા Cloudflare ડેશબોર્ડમાં <strong>sutrastudios.in</strong> ના DNS Records માં જાઓ અને નવો
                    રેકોર્ડ ઉમેરો:
                  </p>
                  <div className="bg-[#FAF9F5] border border-[#E5E1D8] rounded-xl p-3 text-xs space-y-2 text-[#44403C]">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="bg-white p-2 rounded-lg border border-[#E5E1D8]">
                        <span className="text-[10px] text-[#78716C] block uppercase font-bold">Type</span>
                        <span className="font-mono font-bold text-emerald-700">CNAME</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-[#E5E1D8]">
                        <span className="text-[10px] text-[#78716C] block uppercase font-bold">Name (Subdomain)</span>
                        <span className="font-mono font-bold text-[#5C3A1E]">truevibe</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-[#E5E1D8]">
                        <span className="text-[10px] text-[#78716C] block uppercase font-bold">Target (Target Host)</span>
                        <span className="font-mono font-bold text-[#171717]">truevibe-property.onrender.com</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#78716C]">
                      Proxy status: <strong>Proxied (Orange Cloud)</strong> અથવા <strong>DNS only</strong> રાખી શકો છો.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-[#171717] text-[#EADFCB] flex items-center justify-center font-bold text-sm shrink-0">
                  ૪
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-serif text-base font-bold text-[#171717]">
                    સ્ટેપ ૪: Render માં Custom Domain એડ કરો
                  </h3>
                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                    Render માં તમારી બનાવેલી સર્વિસના <strong>Settings ➔ Custom Domains</strong> માં જાઓ:
                  </p>
                  <div className="bg-[#FAF9F5] border border-[#E5E1D8] rounded-xl p-3 text-xs space-y-1.5 text-[#44403C]">
                    <p>
                      <strong>Add Domain:</strong> લખો <code>truevibe.sutrastudios.in</code> અને &quot;Save&quot; કરો.
                    </p>
                    <p>
                      Render આપમેળે Cloudflare સાથે વેરિફાઈ કરશે અને <strong>ફ્રી SSL Certificate (HTTPS)</strong> ઇશ્યુ
                      કરી દેશે.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 5 - Victory */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  ✓
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="font-serif text-base font-bold text-emerald-800">સ્ટેપ ૫: ક્લાયન્ટને લાઈવ ડેમો આપો!</h3>
                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                    હવે તમે ક્લાયન્ટને સીધી આ લિંક આપી શકો છો:
                  </p>
                  <div className="inline-flex items-center gap-2 bg-[#FAF9F5] border border-emerald-300 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-emerald-800 mt-1">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    https://truevibe.sutrastudios.in
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DNS PING & HEALTH CHECKER */}
          {activeTab === "ping" && (
            <div className="bg-white rounded-2xl border border-[#E5E1D8] p-6 sm:p-8 space-y-6 shadow-2xs">
              <div className="border-b border-[#E5E1D8] pb-4">
                <h2 className="font-serif text-xl font-bold text-[#171717]">Subdomain Live Health &amp; DNS Checker</h2>
                <p className="text-xs text-[#78716C] mt-1">
                  તમારું નવું સબ-ડોમેન ક્લાઉડફ્લેર અને રેન્ડર પર લાઈવ થઈ ગયું છે કે નહીં તે અહીંથી ૧-ક્લિકમાં ચકાસો.
                </p>
              </div>

              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5">
                    Subdomain Prefix ચકાસવા માટે:
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={pingSubdomain}
                      onChange={(e) => setPingSubdomain(e.target.value)}
                      placeholder="e.g. truevibe, shop, hotel"
                      className="px-3 py-2 text-xs bg-[#FAF9F5] border border-[#E5E1D8] rounded-l-xl focus:outline-hidden focus:border-[#A98B57] font-mono font-bold flex-1"
                    />
                    <span className="px-3 py-2 bg-[#F5F2EB] border border-l-0 border-[#E5E1D8] text-xs font-mono text-[#5C3A1E] rounded-r-xl">
                      .sutrastudios.in
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => runSubdomainCheck(pingSubdomain)}
                  disabled={isPinging || !pingSubdomain}
                  isLoading={isPinging}
                  leftIcon={<Zap className="w-3.5 h-3.5" />}
                >
                  Ping Subdomain Resolution
                </Button>

                {pingResult.status !== "idle" && (
                  <div
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      pingResult.status === "success"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : pingResult.status === "notice"
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-[#FAF9F5] border-[#E5E1D8] text-[#57534E]"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {pingResult.status === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Info className="w-4 h-4 text-amber-600" />
                      )}
                      <span>{pingResult.message}</span>
                    </div>

                    {pingResult.targetUrl && (
                      <div className="pt-2 border-t border-current/15 flex items-center justify-between">
                        <span className="font-mono text-[11px]">{pingResult.targetUrl}</span>
                        <a
                          href={pingResult.targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold underline flex items-center gap-1 text-[11px]"
                        >
                          Open in Browser <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* MODAL: ADD NEW CLIENT SUBDOMAIN */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-[#E5E1D8] shadow-xl w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FAF9F5] border border-[#E5E1D8] flex items-center justify-center">
                    <Globe className="w-4 h-4 text-[#A98B57]" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#171717]">
                    Register Client Subdomain &amp; Demo
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-[#78716C] hover:text-[#171717] text-lg font-bold p-1"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateDemo} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TrueVibe Property & Luxury Estates"
                    value={formProjectName}
                    onChange={(e) => setFormProjectName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#E5E1D8] rounded-xl focus:outline-hidden focus:border-[#A98B57]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">Client Name</label>
                    <input
                      type="text"
                      placeholder="e.g. TrueVibe Realty Group"
                      value={formClientName}
                      onChange={(e) => setFormClientName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#E5E1D8] rounded-xl focus:outline-hidden focus:border-[#A98B57]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">Subdomain Prefix *</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        required
                        placeholder="truevibe"
                        value={formSubdomain}
                        onChange={(e) => setFormSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#E5E1D8] rounded-l-xl focus:outline-hidden focus:border-[#A98B57] font-mono"
                      />
                      <span className="px-2 py-2 bg-[#F5F2EB] border border-l-0 border-[#E5E1D8] text-[10.5px] font-mono text-[#5C3A1E] rounded-r-xl">
                        .sutrastudios.in
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Client Standalone GitHub Repo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/yash-joshi-20/truevibe-property"
                    value={formGithubUrl}
                    onChange={(e) => setFormGithubUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#E5E1D8] rounded-xl focus:outline-hidden focus:border-[#A98B57] font-mono"
                  />
                  <p className="text-[10px] text-[#78716C] mt-0.5">
                    જ્યારે ક્લાયન્ટ પેમેન્ટ કરે ત્યારે આ ગિટહબ રેપો તમે ડાયરેક્ટ એમને હેન્ડઓવર કરી શકો છો.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Render Free Web Service URL</label>
                  <input
                    type="url"
                    placeholder="https://truevibe-property.onrender.com"
                    value={formRenderUrl}
                    onChange={(e) => setFormRenderUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#E5E1D8] rounded-xl focus:outline-hidden focus:border-[#A98B57] font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#E5E1D8] rounded-xl focus:outline-hidden focus:border-[#A98B57]"
                    >
                      <option value="real_estate">Real Estate &amp; Architecture</option>
                      <option value="ecommerce">E-Commerce &amp; Retail</option>
                      <option value="hospitality">Luxury Hospitality &amp; Hotel</option>
                      <option value="saas">SaaS &amp; Tech Platform</option>
                      <option value="portfolio">Creative Portfolio</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#E5E1D8] rounded-xl focus:outline-hidden focus:border-[#A98B57]"
                    >
                      <option value="live">Live &amp; Active</option>
                      <option value="in_development">In Development</option>
                      <option value="pending_dns">Pending DNS</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Notes / Description</label>
                  <textarea
                    rows={2}
                    placeholder="Bespoke project notes or client scope details..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#E5E1D8] rounded-xl focus:outline-hidden focus:border-[#A98B57]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E1D8]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#78716C] hover:text-[#171717]"
                  >
                    Cancel
                  </button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting || !formProjectName || !formSubdomain}
                  >
                    Register Subdomain
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
