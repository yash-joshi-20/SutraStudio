"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Search,
  Plus,
  Edit2,
  Check,
  AlertCircle,
  ExternalLink,
  Clock,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Box,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatCurrencyINR } from "@/config/services";
import {
  getAllApprovedPackages,
  type AnyStudioPackage,
  type RetainerPackage,
} from "@/config/packages";

export function AdminPackagesManagementView() {
  const [packages, setPackages] = useState<AnyStudioPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTabFilter, setActiveTabFilter] = useState<"All" | "Retainers" | "Bundles" | "Packs">("All");

  // Edit package state
  const [editingPkg, setEditingPkg] = useState<AnyStudioPackage | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editTurnaround, setEditTurnaround] = useState<string>("");
  const [editDesc, setEditDesc] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load canonical packages
  const loadPackages = () => {
    setIsLoading(true);
    try {
      const all = getAllApprovedPackages();
      setPackages(all);
    } catch (err: any) {
      setError(err?.message || "Failed to load packages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const isRetainer = "billingCycle" in pkg && pkg.billingCycle === "monthly";
      const isStandalone = "serviceId" in pkg;
      const isBundle = !isRetainer && !isStandalone;

      if (activeTabFilter === "Retainers" && !isRetainer) return false;
      if (activeTabFilter === "Bundles" && !isBundle) return false;
      if (activeTabFilter === "Packs" && !isStandalone) return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        pkg.name.toLowerCase().includes(q) ||
        pkg.slug.toLowerCase().includes(q) ||
        pkg.description.toLowerCase().includes(q)
      );
    });
  }, [packages, activeTabFilter, searchQuery]);

  const handleToggleActive = (pkg: AnyStudioPackage) => {
    const nextActive = !pkg.active;
    setPackages((prev) =>
      prev.map((p) => (p.id === pkg.id ? { ...p, active: nextActive } : p))
    );
    setNotice(`Package "${pkg.name}" ${nextActive ? "activated" : "deactivated"} successfully.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleOpenEdit = (pkg: AnyStudioPackage) => {
    setEditingPkg(pkg);
    setEditPrice(pkg.numericPrice);
    setEditTurnaround(pkg.turnaround || "");
    setEditDesc(pkg.description || "");
    setSaveError(null);
  };

  const handleSaveEdit = () => {
    if (!editingPkg) return;
    if (editPrice < 0 || editPrice > 20000) {
      setSaveError("Package price must be between ₹0 and ₹20,000 (project canonical ceiling).");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      setPackages((prev) =>
        prev.map((p) =>
          p.id === editingPkg.id
            ? {
                ...p,
                numericPrice: editPrice,
                price: editPrice,
                formattedPrice: formatCurrencyINR(editPrice),
                turnaround: editTurnaround.trim() || p.turnaround,
                description: editDesc.trim() || p.description,
              }
            : p
        )
      );

      setEditingPkg(null);
      setNotice(`Updated "${editingPkg.name}" successfully.`);
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADFCB] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-serif text-2xl font-bold text-[#0F172A]">
              Production Packages &amp; Retainers
            </h2>
            <span className="rounded-full bg-[#D4A35A]/15 border border-[#D4A35A]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#5C3A1E] uppercase tracking-wider">
              Curated Bundles
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Manage multi-service packages, 30-day production retainers (images + reels), and high-velocity deliverable packs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadPackages}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Notifications & Alerts */}
      {notice && (
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-xs font-semibold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-[#15803D] shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#991B1B] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Filter & Search Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#FFFDF9] border border-[#EADFCB] p-3.5 rounded-2xl">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search package name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(["All", "Retainers", "Bundles", "Packs"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTabFilter(tab)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTabFilter === tab
                  ? "bg-[#5C3A1E] text-white shadow-2xs"
                  : "bg-[#FAF9F5] text-[#64748B] border border-[#EADFCB] hover:text-[#0F172A]"
              }`}
            >
              {tab === "All"
                ? "All Packages"
                : tab === "Retainers"
                ? "30-Day Retainers"
                : tab === "Bundles"
                ? "Curated Bundles"
                : "Deliverable Packs"}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Packages Table */}
      <div className="overflow-x-auto bg-[#FFFDF9] border border-[#EADFCB] rounded-3xl shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#EADFCB] bg-[#FAF9F5] text-[#64748B] font-semibold">
              <th className="py-3.5 px-4">Package Name</th>
              <th className="py-3.5 px-4">Classification</th>
              <th className="py-3.5 px-4">Approved Price</th>
              <th className="py-3.5 px-4">Included Scope &amp; Quota</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EADFCB]/60">
            {filteredPackages.map((pkg) => {
              const isRetainer = "billingCycle" in pkg && pkg.billingCycle === "monthly";
              const isStandalone = "serviceId" in pkg;
              const retainer = isRetainer ? (pkg as RetainerPackage) : null;

              return (
                <tr key={pkg.id} className="hover:bg-[#FAF9F5]/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-[#0F172A] block">{pkg.name}</span>
                      <span className="text-[10px] font-mono text-[#94A3B8] block">
                        /{pkg.slug} • ID: {pkg.id}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-[#F4EFE6] border border-[#EADFCB] text-[10px] font-semibold text-[#5C3A1E]">
                      {isRetainer
                        ? "30-Day Retainer"
                        : isStandalone
                        ? "Deliverable Pack"
                        : "Multi-Service Bundle"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-serif font-bold text-sm text-[#5C3A1E]">
                      {pkg.formattedPrice}
                    </span>
                    {isRetainer && (
                      <span className="text-[10px] text-[#94A3B8] block">/ 30 Days</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {retainer ? (
                      <div className="space-y-0.5 text-[#475569]">
                        <span className="font-medium text-[#0F172A] block">
                          {retainer.includedServices.images} Images + {retainer.includedServices.videos} Reels
                        </span>
                        <span className="text-[10px] text-[#A98B57] block">
                          {retainer.monthlyQuotaDescription}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#475569]">
                        {pkg.deliverables?.length || (pkg as any).features?.length || 1} Deliverables Included
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(pkg)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                        pkg.active
                          ? "bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]"
                          : "bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]"
                      }`}
                      title={pkg.active ? "Click to deactivate" : "Click to activate"}
                    >
                      {pkg.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{pkg.active ? "Active" : "Draft / Inactive"}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/packages/${pkg.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg border border-[#EADFCB] bg-[#FFFDF9] text-[#64748B] hover:text-[#5C3A1E] hover:border-[#D4A35A] transition-all"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(pkg)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#EADFCB] bg-[#5C3A1E] text-white hover:bg-[#432A15] transition-all font-semibold"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 5. Edit Package Modal */}
      {editingPkg && (
        <Modal
          isOpen={!!editingPkg}
          onClose={() => setEditingPkg(null)}
          title={`Edit Package: ${editingPkg.name}`}
          description={`Update approved price and deliverables for /packages/${editingPkg.slug}`}
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2 text-xs">
            {saveError && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] font-semibold">
                {saveError}
              </div>
            )}

            <div>
              <label className="font-semibold text-[#0F172A] block mb-1">
                Approved Package Price (INR ₹, Ceiling: ₹20,000)
              </label>
              <input
                type="number"
                min="0"
                max="20000"
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-sm text-[#0F172A] font-bold focus:outline-none focus:border-[#D4A35A]"
              />
              <span className="text-[10px] text-[#94A3B8] mt-0.5 block">
                Directly governs package catalog, detail view, checkout, and intake totals.
              </span>
            </div>

            <div>
              <label className="font-semibold text-[#0F172A] block mb-1">Turnaround SLA</label>
              <input
                type="text"
                value={editTurnaround}
                onChange={(e) => setEditTurnaround(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#0F172A] block mb-1">Description</label>
              <textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EADFCB]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditingPkg(null)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                disabled={isSaving}
                leftIcon={isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              >
                {isSaving ? "Saving..." : "Save Package Changes"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
