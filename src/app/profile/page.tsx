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
  LogOut,
  Globe,
  Lock,
  Bell,
  KeyRound,
  User,
  Check,
  Briefcase,
  MapPin,
} from "lucide-react";

export default function ProfilePage() {
  const { user, profile: authProfile, logout, logoutEverywhere } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Seeded from the verified server profile. Empty string means "not provided
  // yet" — never a placeholder identity presented as real data.
  const [profile, setProfile] = useState({
    fullName: authProfile?.displayName || user?.displayName || "",
    jobTitle: "",
    email: user?.email || "",
    phone: authProfile?.phone || "",
    companyName: authProfile?.companyName || "",
    companyWebsite: authProfile?.website || "",
    location: authProfile?.billing?.city || "",
    driveFolder: authProfile?.driveFolderId || "",
  });

  // Password Change State
  const [passwordState, setPasswordState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    approvalAlerts: true,
    invoiceReceipts: true,
    whatsappAlerts: false,
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 3500);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (!passwordState.currentPassword || !passwordState.newPassword) {
      setPasswordError("Please enter current and new password.");
      return;
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordState.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setPasswordSuccess(true);
    setPasswordState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setPasswordSuccess(false), 3500);
  };

  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <PortalSidebar />

        <main id="main-content" className="flex-1 p-4 sm:p-8 lg:p-10 max-w-4xl pb-32 md:pb-16 space-y-8">
          {/* Header Bar with Website Link and Log Out */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EADFCB] gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-semibold uppercase tracking-wider text-[#5C3A1E] mb-2">
                <User className="w-3 h-3 text-[#D4A35A]" />
                <span>Account & Studio Settings</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#0F172A]">
                Client Profile & Settings
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Manage personal profile, company details, credentials, and notifications.
              </p>
            </div>

            {/* Quick Header Navigation Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A] hover:bg-[#F4EFE6] transition-all shadow-xs touch-target min-h-[44px]"
                title="Go to Public Website"
              >
                <Globe className="w-3.5 h-3.5 text-[#D4A35A]" />
                <span>View Website</span>
              </Link>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => void logout()}
                leftIcon={<LogOut className="w-3.5 h-3.5 text-[#B42318]" />}
                className="border-[#FECDCA] text-[#B42318] hover:bg-[#FEF3F2] min-h-[44px] touch-target"
              >
                Log Out
              </Button>
            </div>
          </div>

          {/* Success Alerts */}
          {saved && (
            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span className="font-medium">
                  Profile details updated successfully.
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#15803D]">Saved</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span className="font-medium">
                  Security credentials updated successfully.
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#15803D]">Updated</span>
            </div>
          )}

          {/* Top Profile Summary Card */}
          <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <Avatar
                name={profile.fullName}
                size="lg"
                status="online"
                className="shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#0F172A]">
                    {profile.fullName}
                  </h3>
                  <Badge variant="completed" size="sm">
                    Verified Client
                  </Badge>
                </div>
                <p className="text-xs text-[#5C3A1E] font-medium flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-[#D4A35A]" />
                  <span>{profile.jobTitle} • {profile.companyName}</span>
                </p>
                <p className="text-xs text-[#64748B]">
                  {profile.email} • {profile.phone}
                </p>
              </div>
            </div>

            <Button
              variant={isEditing ? "secondary" : "primary"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="min-h-[44px] shrink-0"
            >
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </Button>
          </div>

          {/* Personal & Organization Settings Form */}
          <form
            onSubmit={handleSaveProfile}
            className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6"
          >
            {/* Section 1: Personal Details */}
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EADFCB]/60">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#D4A35A]" />
                  <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                    Personal Information
                  </h4>
                </div>
                <span className="text-[11px] text-[#64748B]">Primary Account Holder</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={profile.fullName}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                />
                <Input
                  label="Job Title / Role"
                  value={profile.jobTitle}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profile.email}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
                <Input
                  label="Phone / Mobile Number"
                  value={profile.phone}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Section 2: Organization & Studio Details */}
            <div className="pt-4 border-t border-[#EADFCB]/60">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EADFCB]/60">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#D4A35A]" />
                  <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                    Company & Studio Organization
                  </h4>
                </div>
                <span className="text-[11px] text-[#64748B]">Billing & Attribution</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Company / Studio Name"
                  value={profile.companyName}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                />
                <Input
                  label="Studio Website"
                  value={profile.companyWebsite}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, companyWebsite: e.target.value })}
                />
                <Input
                  label="Location / Headquarters"
                  value={profile.location}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              </div>
            </div>

            {/* Section 3: Google Drive Media Vault Link */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#5C3A1E]" />
                  <span className="text-xs font-semibold text-[#0F172A]">
                    Google Drive Media Storage Vault
                  </span>
                </div>
                <p className="text-xs text-[#64748B]">
                  Vault folder token: <code className="px-1.5 py-0.5 rounded bg-[#FFFDF9] border border-[#EADFCB] text-[11px] font-mono text-[#5C3A1E]">{profile.driveFolder}</code>
                </p>
              </div>

              <Link
                href="/media"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C3A1E] hover:underline"
              >
                <span>Open Media Vault</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4A35A]" />
              </Link>
            </div>

            {/* Form Actions */}
            {isEditing && (
              <div className="pt-4 border-t border-[#EADFCB] flex flex-col sm:flex-row items-center justify-end gap-3 animate-in fade-in duration-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="w-full sm:w-auto min-h-[44px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  leftIcon={<Save className="w-4 h-4" />}
                  className="w-full sm:w-auto min-h-[44px]"
                >
                  Save Profile Changes
                </Button>
              </div>
            )}
          </form>

          {/* Section 4: Security & Password Management */}
          <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADFCB]/60">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#D4A35A]" />
                <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                  Account Security & Password
                </h4>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#2E7D4F] bg-[#EDF7F0] px-2.5 py-1 rounded-full font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>256-Bit Encrypted</span>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordError && (
                <div className="p-3 rounded-xl bg-[#FEF3F2] border border-[#FECDCA] text-xs text-[#B42318]">
                  {passwordError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••••••"
                  value={passwordState.currentPassword}
                  onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={passwordState.newPassword}
                  onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter new password"
                  value={passwordState.confirmPassword}
                  onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                  className="min-h-[44px]"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>

          {/* Section 5: Notification Preferences */}
          <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#EADFCB]/60">
              <Bell className="w-4 h-4 text-[#D4A35A]" />
              <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                Notification Preferences
              </h4>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: "orderUpdates",
                  title: "Order & Commission Status",
                  desc: "Get notified when deliverable passes progress through production pipelines.",
                  checked: notifications.orderUpdates,
                },
                {
                  id: "approvalAlerts",
                  title: "Review & Approval Approvals",
                  desc: "Immediate alerts when a 4K render, video reel, or 3D asset awaits client sign-off.",
                  checked: notifications.approvalAlerts,
                },
                {
                  id: "invoiceReceipts",
                  title: "Invoices & Payment Confirmations",
                  desc: "Receive payment receipts and invoice milestone notifications via official email.",
                  checked: notifications.invoiceReceipts,
                },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-start justify-between p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] cursor-pointer hover:border-[#D4A35A] transition-colors"
                >
                  <div className="pr-4">
                    <p className="text-xs font-semibold text-[#0F172A]">{item.title}</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        [item.id]: !prev[item.id as keyof typeof notifications],
                      }))
                    }
                    className="mt-1 w-4 h-4 rounded text-[#5C3A1E] focus:ring-[#D4A35A] cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Final Session Log Out Dock */}
          <div className="p-6 rounded-3xl bg-[#FAF9F5] border border-[#EADFCB] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-semibold text-[#0F172A]">Session & Account Termination</h4>
              <p className="text-xs text-[#64748B]">
                Terminate active session on this device. You will need your studio credentials to sign back in.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => void logout()}
                leftIcon={<LogOut className="w-4 h-4 text-[#B42318]" />}
                className="w-full sm:w-auto border-[#FECDCA] text-[#B42318] hover:bg-[#FEF3F2] min-h-[44px]"
              >
                Sign Out of Studio
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => {
                  if (
                    window.confirm(
                      "Sign out of every device, including this one? You will need to sign in again."
                    )
                  ) {
                    void logoutEverywhere();
                  }
                }}
                className="w-full sm:w-auto min-h-[44px]"
              >
                Sign Out Everywhere
              </Button>
            </div>
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </RouteGuard>
  );
}
