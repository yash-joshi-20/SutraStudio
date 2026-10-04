"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/authContext";
import { Button } from "@/components/ui/Button";
import { ShieldAlert, Lock, ArrowRight } from "lucide-react";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: "client" | "admin";
}

export function RouteGuard({
  children,
  requiredRole = "client",
}: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const targetLogin = requiredRole === "admin" ? "/admin/login" : "/login";
        const currentPath = pathname || (requiredRole === "admin" ? "/admin" : "/dashboard");
        if (currentPath === "/login" || currentPath === "/register" || currentPath === "/admin/login") {
          return;
        }
        if (currentPath === "/dashboard" || currentPath === "/admin" || currentPath === "/") {
          router.push(targetLogin);
        } else {
          router.push(`${targetLogin}?returnTo=${encodeURIComponent(currentPath)}`);
        }
      } else if (requiredRole === "admin" && role !== "admin") {
        router.push("/admin/login");
      }
    }
  }, [isLoading, isAuthenticated, role, requiredRole, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5EF]">
        <div className="w-8 h-8 rounded-full border-2 border-[#D4A35A] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Not authenticated fallback
  if (!isAuthenticated) {
    const loginHref = requiredRole === "admin" ? "/admin/login" : "/login";
    const targetLink = pathname && pathname !== "/dashboard" && pathname !== "/admin" && pathname !== "/"
      ? `${loginHref}?returnTo=${encodeURIComponent(pathname)}`
      : loginHref;
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
              Authentication is required to view your orders, deliverables, and private studio media storage.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              withArrow
              href={targetLink}
            >
              Sign In to Continue
            </Button>

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
              Administrative clearance required for Executive Operations. Please sign in with your administrative credentials.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full !bg-[#171717] hover:!bg-[#262626] !text-[#FAF9F5]"
              href="/admin/login"
            >
              Sign In to Executive Terminal
            </Button>

            <Button
              variant="secondary"
              size="md"
              className="w-full"
              href="/dashboard"
            >
              Return to Client Workspace
            </Button>

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
