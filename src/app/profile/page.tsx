"use client";

import React, { useState } from "react";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Card";
import { Save, Building, Mail, Phone, Upload } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    businessName: "Studio Living Architecture",
    contactName: "Yash Joshi",
    email: "yash@studioliving.com",
    industry: "Luxury Architecture & Real Estate",
    brandColors: "#5C3A1E, #D4A35A",
    driveFolder: "SUTRA_CLIENT_001_LIVING",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A]">
      <PortalSidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-4xl pb-24 md:pb-10 space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
            ACCOUNT & BRAND
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#0F172A] mt-1">
            Client Profile & Brand Vault
          </h1>
          <p className="text-xs text-[#64748B]">
            Maintain your brand guidelines, primary colors, and synchronized Google Drive folder.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business / Studio Name"
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Notification Email"
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
            />
            <Input
              label="Industry / Sector"
              value={profile.industry}
              onChange={(e) =>
                setProfile({ ...profile, industry: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
              Brand Palette Hex Codes
            </label>
            <Input
              value={profile.brandColors}
              onChange={(e) =>
                setProfile({ ...profile, brandColors: e.target.value })
              }
            />
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] space-y-1">
            <p className="text-xs font-semibold text-[#0F172A]">
              Private Google Drive Sync Location
            </p>
            <p className="text-xs text-[#64748B]">
              Folder: <code>SUTRA STUDIO / CLIENTS / {profile.driveFolder}</code>
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#EADFCB]">
            {saved ? (
              <span className="text-xs text-[#2E7D4F] font-semibold">
                ✓ Profile & Brand Preferences Saved
              </span>
            ) : (
              <span className="text-xs text-[#64748B]">
                Changes sync automatically to Firestore metadata
              </span>
            )}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </main>

      <MobileBottomNav />
    </div>
  );
}
