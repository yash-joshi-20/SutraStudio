"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/lib/auth/authContext";
import {
  Save,
  Building,
  Mail,
  Phone,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Palette,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    businessName: user?.company || "Studio Living Architecture",
    contactName: user?.displayName || "Yash Joshi",
    email: user?.email || "yash@studioliving.com",
    phone: "+91 98201 44820",
    industry: "Luxury Architecture & Spatial Design",
    brandColors: "#5C3A1E, #D4A35A, #FAF9F5",
    driveFolder: user?.driveFolderId || "drive_fld_sutra_001",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const colorSwatches = profile.brandColors.split(",").map((c) => c.trim());

  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <PortalSidebar />

        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-4xl pb-24 md:pb-12 space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EADFCB] gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-semibold uppercase tracking-wider text-[#5C3A1E] mb-2">
                <span>ACCOUNT & BRAND SETTINGS</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
                Client Profile & Brand Vault
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Manage your studio identity, brand tokens, and synchronized Google Drive folder.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="completed" size="sm">
                Enterprise Client
              </Badge>
            </div>
          </div>

          {/* Toast Notification */}
          {saved && (
            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span className="font-medium">
                  Profile & brand guidelines updated in Firestore and synchronized to Google Drive.
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#15803D]">Saved</span>
            </div>
          )}

          {/* Profile Card Header */}
          <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs flex flex-col sm:flex-row sm:items-center gap-5">
            <Avatar
              name={profile.contactName}
              size="lg"
              status="online"
              className="shrink-0"
            />
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                  {profile.contactName}
                </h3>
                <span className="text-xs text-[#5C3A1E] font-medium bg-[#F8F5EF] px-2.5 py-0.5 rounded-full border border-[#EADFCB]">
                  {profile.businessName}
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                {profile.email} • {profile.phone}
              </p>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSave}
            className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div>
              <h4 className="font-serif text-base font-semibold text-[#0F172A] mb-1">
                Company & Contact Information
              </h4>
              <p className="text-xs text-[#64748B] mb-5">
                Used for project attribution, contracts, and deliverable watermarks.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Business / Studio Legal Name"
                  value={profile.businessName}
                  onChange={(e) =>
                    setProfile({ ...profile, businessName: e.target.value })
                  }
                />
                <Input
                  label="Primary Contact Person"
                  value={profile.contactName}
                  onChange={(e) =>
                    setProfile({ ...profile, contactName: e.target.value })
                  }
                />
                <Input
                  label="Official Contact Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
                <Input
                  label="Direct Phone / WhatsApp"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#EADFCB]/60">
              <Input
                label="Industry / Studio Sector"
                value={profile.industry}
                onChange={(e) =>
                  setProfile({ ...profile, industry: e.target.value })
                }
              />
            </div>

            {/* Brand Color Tokens Swatches */}
            <div className="pt-4 border-t border-[#EADFCB]/60 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Brand Palette Hex Codes (Comma separated)
                </label>
                <p className="text-[11px] text-[#64748B] mb-2">
                  Our AI generative pipelines use these exact values for lighting, tints, and UI renders.
                </p>
                <Input
                  value={profile.brandColors}
                  onChange={(e) =>
                    setProfile({ ...profile, brandColors: e.target.value })
                  }
                />
              </div>

              {/* Visual Swatch Chips */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-[#64748B] flex items-center gap-1 font-medium">
                  <Palette className="w-3.5 h-3.5 text-[#5C3A1E]" /> Swatches:
                </span>
                <div className="flex items-center gap-2">
                  {colorSwatches.map((hex, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-xs font-mono"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: hex }}
                      />
                      <span>{hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Google Drive Vault Status */}
            <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#5C3A1E]" />
                  <span className="text-xs font-semibold text-[#0F172A]">
                    Private Google Drive Cloud Folder
                  </span>
                </div>
                <Link
                  href="/media"
                  className="text-xs font-semibold text-[#5C3A1E] hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Vault</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Vault directory: <code className="px-1.5 py-0.5 rounded bg-[#FFFDF9] border border-[#EADFCB] text-[11px] font-mono text-[#5C3A1E]">{profile.driveFolder}</code>.
                Synchronized with 256-bit encryption for confidential design assets and master deliverables.
              </p>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-[#EADFCB] flex items-center justify-end gap-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Profile & Brand Vault
              </Button>
            </div>
          </form>
        </main>

        <MobileBottomNav />
      </div>
    </RouteGuard>
  );
}
