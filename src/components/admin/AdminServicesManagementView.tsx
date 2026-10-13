"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Clock,
  ShieldCheck,
  RefreshCw,
  Loader2,
  DollarSign,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatCurrencyINR } from "@/config/services";
import type { CatalogService } from "@/lib/services/catalogData";

export function AdminServicesManagementView() {
  const [services, setServices] = useState<CatalogService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Editing service state
  const [editingService, setEditingService] = useState<CatalogService | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDeliveryDays, setEditDeliveryDays] = useState<number>(3);
  const [editRevisions, setEditRevisions] = useState<number>(2);
  const [editTagline, setEditTagline] = useState<string>("");
  const [editDesc, setEditDesc] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // New service modal state
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceSlug, setNewServiceSlug] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState<CatalogService["category"]>("Creative");
  const [newServicePrice, setNewServicePrice] = useState(1999);
  const [newServiceDays, setNewServiceDays] = useState(3);
  const [newServiceDesc, setNewServiceDesc] = useState("");

  const fetchCatalog = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/catalog");
      if (!res.ok) {
        throw new Error(`Failed to load catalog (${res.status})`);
      }
      const data = await res.json();
      setServices(data.services || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load services");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(services.map((s) => s.category));
    return ["All", ...Array.from(cats)];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCat = selectedCategory === "All" || s.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.shortDescription?.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const handleToggleActive = async (service: CatalogService) => {
    const nextActive = !service.active;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "service",
          id: service.id,
          updates: { active: nextActive },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to toggle service status");
      }
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, active: nextActive } : s))
      );
      setNotice(`Service "${service.name}" ${nextActive ? "activated" : "deactivated"} successfully.`);
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      alert(`Error updating service: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEdit = (service: CatalogService) => {
    setEditingService(service);
    setEditPrice(service.startingPrice);
    setEditDeliveryDays(service.estimatedDeliveryDays || 3);
    setEditRevisions(service.revisionsIncluded || 2);
    setEditTagline(service.tagline || "");
    setEditDesc(service.shortDescription || "");
    setSaveError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingService) return;
    if (editPrice < 0 || editPrice > 20000) {
      setSaveError("Price must be between ₹0 and ₹20,000 (project canonical ceiling).");
      return;
    }
    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "service",
          id: editingService.id,
          updates: {
            startingPrice: editPrice,
            estimatedDeliveryDays: editDeliveryDays,
            revisionsIncluded: editRevisions,
            tagline: editTagline.trim(),
            shortDescription: editDesc.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save service updates");
      }

      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id
            ? {
                ...s,
                startingPrice: editPrice,
                estimatedDeliveryDays: editDeliveryDays,
                revisionsIncluded: editRevisions,
                tagline: editTagline.trim(),
                shortDescription: editDesc.trim(),
              }
            : s
        )
      );

      setEditingService(null);
      setNotice(`Updated "${editingService.name}" successfully.`);
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) {
      setSaveError("Service name is required.");
      return;
    }
    if (newServicePrice < 0 || newServicePrice > 20000) {
      setSaveError("Starting price cannot exceed ₹20,000 ceiling.");
      return;
    }

    const slug = newServiceSlug.trim() || newServiceName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const id = `srv-${slug}`;

    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "service",
          service: {
            id,
            name: newServiceName.trim(),
            slug,
            category: newServiceCategory,
            startingPrice: newServicePrice,
            currency: "INR",
            estimatedDeliveryDays: newServiceDays,
            revisionsIncluded: 2,
            active: true,
            sortIndex: services.length + 1,
            tagline: "Dedicated studio production craft",
            shortDescription: newServiceDesc.trim() || `${newServiceName} crafted to perfection.`,
            deliverables: ["High-resolution master asset", "Commercial usage rights"],
            briefSchema: [],
            requiredAssets: ["Brand Guidelines"],
            workflowStages: ["Brief Review", "Production", "Master QA"],
            badge: "Studio Verified",
            thumbnail: "/media/branding-sample.jpg",
            mediaType: "image",
            mediaFormat: "High-Res JPEG / PNG",
            turnaround: `${newServiceDays} Days`,
            pipelineEngine: "Standard Studio Engine",
            updatedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create service");
      }

      setServices((prev) => [...prev, data.service]);
      setIsNewServiceOpen(false);
      setNewServiceName("");
      setNewServiceSlug("");
      setNewServiceDesc("");
      setNotice(`Service "${newServiceName}" created successfully.`);
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
              Services &amp; Pricing Management
            </h2>
            <span className="rounded-full bg-[#D4A35A]/15 border border-[#D4A35A]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#5C3A1E] uppercase tracking-wider">
              Canonical Catalog
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Manage individual creative &amp; tech services, approved baseline prices (≤ ₹20,000), turnarounds, and active display status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchCatalog}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSaveError(null);
              setIsNewServiceOpen(true);
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add New Service
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
            placeholder="Search service by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#5C3A1E] text-white shadow-2xs"
                  : "bg-[#FAF9F5] text-[#64748B] border border-[#EADFCB] hover:text-[#0F172A]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Services Table / Grid */}
      {isLoading ? (
        <div className="p-12 text-center bg-[#FFFDF9] border border-[#EADFCB] rounded-3xl">
          <Loader2 className="w-8 h-8 text-[#D4A35A] animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#64748B]">Loading canonical services catalog...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="p-12 text-center bg-[#FFFDF9] border border-[#EADFCB] rounded-3xl">
          <Layers className="w-10 h-10 text-[#94A3B8] mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-[#0F172A]">No services found</p>
          <p className="text-xs text-[#64748B] mt-1">Try adjusting your search query or category filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#FFFDF9] border border-[#EADFCB] rounded-3xl shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EADFCB] bg-[#FAF9F5] text-[#64748B] font-semibold">
                <th className="py-3.5 px-4">Service Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Approved Starting Price</th>
                <th className="py-3.5 px-4">Delivery SLA</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFCB]/60">
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-[#FAF9F5]/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-[#0F172A] block">{service.name}</span>
                      <span className="text-[10px] font-mono text-[#94A3B8] block">
                        /{service.slug} • ID: {service.id}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-[#F4EFE6] border border-[#EADFCB] text-[10px] font-semibold text-[#5C3A1E]">
                      {service.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-serif font-bold text-sm text-[#5C3A1E]">
                      {formatCurrencyINR(service.startingPrice)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-[#475569]">
                      <Clock className="w-3.5 h-3.5 text-[#A98B57]" />
                      <span>{service.estimatedDeliveryDays || 3} Days ({service.revisionsIncluded || 2} Revs)</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(service)}
                      disabled={isSaving}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                        service.active
                          ? "bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]"
                          : "bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]"
                      }`}
                      title={service.active ? "Click to deactivate" : "Click to activate"}
                    >
                      {service.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{service.active ? "Active for Sale" : "Draft / Inactive"}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/services/${service.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg border border-[#EADFCB] bg-[#FFFDF9] text-[#64748B] hover:text-[#5C3A1E] hover:border-[#D4A35A] transition-all"
                        title="View Live Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(service)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#EADFCB] bg-[#5C3A1E] text-white hover:bg-[#432A15] transition-all font-semibold"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Edit Service Modal */}
      {editingService && (
        <Modal
          isOpen={!!editingService}
          onClose={() => setEditingService(null)}
          title={`Edit Service: ${editingService.name}`}
          description={`Update canonical pricing and deliverables for /services/${editingService.slug}`}
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
                Approved Baseline Price (INR ₹, Ceiling: ₹20,000)
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
                Directly governs `/services`, checkout, chat, and order intake totals.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#0F172A] block mb-1">
                  Estimated Delivery SLA (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={editDeliveryDays}
                  onChange={(e) => setEditDeliveryDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#0F172A] block mb-1">
                  Revisions Included
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={editRevisions}
                  onChange={(e) => setEditRevisions(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#0F172A] block mb-1">Tagline</label>
              <input
                type="text"
                value={editTagline}
                onChange={(e) => setEditTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#0F172A] block mb-1">Short Description</label>
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
                onClick={() => setEditingService(null)}
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
                {isSaving ? "Saving..." : "Save Service Changes"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. Add Service Modal */}
      {isNewServiceOpen && (
        <Modal
          isOpen={isNewServiceOpen}
          onClose={() => setIsNewServiceOpen(false)}
          title="Add New Creative or Tech Service"
          description="Register a new individual service in the canonical catalog (Ceiling ≤ ₹20,000)"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateService} className="space-y-4 pt-2 text-xs">
            {saveError && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] font-semibold">
                {saveError}
              </div>
            )}

            <div>
              <label className="font-semibold text-[#0F172A] block mb-1">Service Name *</label>
              <input
                type="text"
                required
                placeholder="e.g., Motion Graphics Reel"
                value={newServiceName}
                onChange={(e) => {
                  setNewServiceName(e.target.value);
                  if (!newServiceSlug) {
                    setNewServiceSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#0F172A] block mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., motion-graphics-reel"
                  value={newServiceSlug}
                  onChange={(e) => setNewServiceSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#0F172A] block mb-1">Category</label>
                <select
                  value={newServiceCategory}
                  onChange={(e) => setNewServiceCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                >
                  <option value="Creative">Creative &amp; Design</option>
                  <option value="Design">Brand &amp; Logo</option>
                  <option value="Development">Web &amp; App Development</option>
                  <option value="Marketing">Digital Marketing &amp; Ads</option>
                  <option value="Automation">Automation &amp; Spatial</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#0F172A] block mb-1">
                  Starting Price (INR ₹, Max ₹20,000)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20000"
                  required
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] font-bold focus:outline-none focus:border-[#D4A35A]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#0F172A] block mb-1">Delivery SLA (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={newServiceDays}
                  onChange={(e) => setNewServiceDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#0F172A] block mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="High-impact visuals produced for commercial channels..."
                value={newServiceDesc}
                onChange={(e) => setNewServiceDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EADFCB]">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setIsNewServiceOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={isSaving}
                leftIcon={isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              >
                {isSaving ? "Creating..." : "Create Service"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
