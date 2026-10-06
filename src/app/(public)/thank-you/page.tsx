"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { CheckCircle2, ArrowRight, Home, LayoutDashboard, ShoppingBag, Mail } from "lucide-react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "order";
  const code = searchParams.get("code") || searchParams.get("orderNumber") || "";

  const contentMap: Record<
    string,
    { title: string; subtitle: string; badge: string; primaryLink: string; primaryText: string; secondaryLink: string; secondaryText: string }
  > = {
    order: {
      badge: "Commission Confirmed",
      title: "Thank You for Your Order",
      subtitle: code
        ? `Commission #${code} has been successfully recorded and placed into our creative production pipeline.`
        : "Your commission has been successfully recorded and placed into our creative production pipeline.",
      primaryLink: "/dashboard",
      primaryText: "View in Client Portal",
      secondaryLink: "/services",
      secondaryText: "Explore More Services",
    },
    contact: {
      badge: "Inquiry Dispatched",
      title: "Message Received",
      subtitle: "Thank you for reaching out to Sutra Studio. Our creative directors review every brief and will respond within 24 hours.",
      primaryLink: "/",
      primaryText: "Return to Studio",
      secondaryLink: "/services",
      secondaryText: "Browse Services",
    },
    lead: {
      badge: "Consultation Requested",
      title: "We Have Received Your Brief",
      subtitle: "Our creative team will review your project parameters and contact you shortly to schedule an initial discovery session.",
      primaryLink: "/dashboard",
      primaryText: "Go to Portal",
      secondaryLink: "/",
      secondaryText: "Return to Studio",
    },
    verified: {
      badge: "Account Verified",
      title: "Welcome to Sutra Studio",
      subtitle: "Your email address has been verified. You now have full access to the client portal and order tracking.",
      primaryLink: "/dashboard",
      primaryText: "Enter Client Portal",
      secondaryLink: "/",
      secondaryText: "Return to Studio",
    },
  };

  const details = contentMap[type] || contentMap.order;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      <Navbar />

      <main id="main-content" className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Lotus Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03]">
          <LotusSymbol className="w-[500px] h-[500px]" color="gold" />
        </div>

        <div className="max-w-xl w-full text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#065F46] shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            <span>{details.badge}</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#0F172A] tracking-tight">
              {details.title}
            </h1>
            <p className="text-sm sm:text-base text-[#64748B] max-w-md mx-auto leading-relaxed">
              {details.subtitle}
            </p>
          </div>

          {/* Card with summary info */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-warm text-left space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#EADFCB]/60">
              <span className="text-xs font-bold text-[#A98B57] uppercase tracking-wider">Next Step</span>
              <span className="text-xs font-mono text-[#5C3A1E] font-semibold">Production Status: Active</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              You can track real-time progress, exchange assets with our creative team, and preview deliverables directly inside your dedicated client portal.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href={details.primaryLink} className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full sm:w-auto min-h-[44px]">
                <span className="flex items-center gap-2">
                  <span>{details.primaryText}</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Button>
            </Link>
            <Link href={details.secondaryLink} className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="w-full sm:w-auto min-h-[44px]">
                {details.secondaryText}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F5EF] text-[#5C3A1E]">
          Loading Confirmation...
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
