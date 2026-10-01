"use client";

import React from "react";
import Link from "next/link";
import { useAuth, UserRole } from "@/lib/auth/authContext";
import { Button } from "@/components/ui/Button";
import { SutraLogo } from "@/components/brand/SutraLogo";
import { ShieldAlert, Lock, ArrowRight } from "lucide-react";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: "client" | "admin";
}

export function RouteGuard({
  children,
  requiredRole = "client",
}: RouteGuardProps) {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5EF]">
        <div className="w-8 h-8 rounded-full border-2 border-[#D4A35A] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F5EF] p-4 text-[#0F172A]">
        <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-warm p-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mx-auto text-[#5C3A1E]">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-[#0F172A]">
              Protected Studio Portal
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Authentication is required to view your orders, deliverables, and
              private studio media storage.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link href="/login" className="block w-full">
              <Button variant="primary" size="md" className="w-full" withArrow>
                Sign In to Continue
              </Button>
            </Link>

            <Link href="/" className="block text-xs text-[#64748B] hover:underline">
              Return to Studio Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin role check
  if (requiredRole === "admin" && role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F5EF] p-4 text-[#0F172A]">
        <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-warm p-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF5EB] border border-[#FDD0A8] flex items-center justify-center mx-auto text-[#B45309]">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-[#0F172A]">
              403 — Access Restricted
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              You do not have authorization to view this internal resource. Please return to your private studio workspace.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link href="/dashboard" className="block w-full">
              <Button variant="primary" size="md" className="w-full">
                Return to Workspace
              </Button>
            </Link>

            <Link href="/" className="block text-xs text-[#64748B] hover:underline">
              Return to Studio Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
