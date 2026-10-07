"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save, RefreshCw, CheckCircle2, Layout, Type, Bell, Mail } from "lucide-react";

export default function AdminCmsPage() {
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cms")
      .then((res) => res.json())
      .then((data) => {
        if (data.content) setContent(data.content);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      if (res.ok) {
        setSaveStatus("Content successfully updated in Firestore!");
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch {
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#F8F5EF] text-[#0F172A] p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#EADFCB]">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="p-2 rounded-xl bg-white border border-[#EADFCB] text-[#5C3A1E] hover:bg-[#FAF9F5] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="font-serif text-2xl font-bold text-[#0F172A]">
                  Dynamic Site CMS & Copy Engine
                </h1>
                <p className="text-xs text-[#64748B]">
                  Live Typography & Announcement Bar Management via Firestore
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !content}
              isLoading={isSaving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Live Changes
            </Button>
          </div>

          {saveStatus && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{saveStatus}</span>
            </div>
          )}

          {isLoading || !content ? (
            <div className="p-12 text-center text-xs text-[#64748B] bg-white rounded-2xl border border-[#EADFCB]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#A98B57] mb-2" />
              Loading CMS configuration from Firestore...
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {/* Section 1: Hero Section */}
              <div className="p-6 rounded-2xl bg-white border border-[#EADFCB] space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#EADFCB]/60">
                  <Layout className="w-4 h-4 text-[#A98B57]" />
                  <h3 className="font-serif font-bold text-sm text-[#0F172A]">Hero Section Copy</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">Badge Tagline</label>
                    <input
                      type="text"
                      value={content.hero?.tagline || ""}
                      onChange={(e) =>
                        setContent({ ...content, hero: { ...content.hero, tagline: e.target.value } })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#EADFCB] bg-[#FAF9F5] focus:outline-none focus:border-[#D4A35A]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">Headline Title</label>
                    <input
                      type="text"
                      value={content.hero?.title || ""}
                      onChange={(e) =>
                        setContent({ ...content, hero: { ...content.hero, title: e.target.value } })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#EADFCB] bg-[#FAF9F5] focus:outline-none focus:border-[#D4A35A] font-serif font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">Description Paragraph</label>
                    <textarea
                      rows={3}
                      value={content.hero?.description || ""}
                      onChange={(e) =>
                        setContent({ ...content, hero: { ...content.hero, description: e.target.value } })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#EADFCB] bg-[#FAF9F5] focus:outline-none focus:border-[#D4A35A]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">Primary Button Text</label>
                      <input
                        type="text"
                        value={content.hero?.primaryCtaText || ""}
                        onChange={(e) =>
                          setContent({ ...content, hero: { ...content.hero, primaryCtaText: e.target.value } })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#EADFCB] bg-[#FAF9F5]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">Secondary Button Text</label>
                      <input
                        type="text"
                        value={content.hero?.secondaryCtaText || ""}
                        onChange={(e) =>
                          setContent({ ...content, hero: { ...content.hero, secondaryCtaText: e.target.value } })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#EADFCB] bg-[#FAF9F5]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Header & Announcement Bar */}
              <div className="p-6 rounded-2xl bg-white border border-[#EADFCB] space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#EADFCB]/60">
                  <Bell className="w-4 h-4 text-[#A98B57]" />
                  <h3 className="font-serif font-bold text-sm text-[#0F172A]">Header & Announcement Bar</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">Announcement Banner Text</label>
                    <input
                      type="text"
                      value={content.header?.announcementBarText || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          header: { ...content.header, announcementBarText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#EADFCB] bg-[#FAF9F5]"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={!!content.header?.announcementActive}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          header: { ...content.header, announcementActive: e.target.checked },
                        })
                      }
                      className="rounded border-[#EADFCB] text-[#5C3A1E]"
                    />
                    <span className="font-medium text-[#0F172A]">Show announcement banner on top of site</span>
                  </label>
                </div>
              </div>

              {/* Section 3: Footer Contact Information */}
              <div className="p-6 rounded-2xl bg-white border border-[#EADFCB] space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#EADFCB]/60">
                  <Mail className="w-4 h-4 text-[#A98B57]" />
                  <h3 className="font-serif font-bold text-sm text-[#0F172A]">Footer & Contact Directives</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={content.footer?.contactEmail || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            footer: { ...content.footer, contactEmail: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#EADFCB] bg-[#FAF9F5]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#0F172A] mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={content.footer?.contactPhone || ""}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            footer: { ...content.footer, contactPhone: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#EADFCB] bg-[#FAF9F5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] mb-1">Copyright Notice</label>
                    <input
                      type="text"
                      value={content.footer?.copyrightText || ""}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          footer: { ...content.footer, copyrightText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#EADFCB] bg-[#FAF9F5]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSaving}
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Publish to Production
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}
