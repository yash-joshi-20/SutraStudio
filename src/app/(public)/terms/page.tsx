import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { FileText, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Terms of Engagement — Sutra Studio",
  description: "Studio service terms, intellectual property transfer, and revision delivery agreements.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      <Navbar />

      <main id="main-content" className="flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-3 pb-6 border-b border-[#EADFCB]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-[#D4A35A]" />
              <span>Studio Master Agreement</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A]">
              Terms of Creative Engagement
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Last updated: October 2026 • Version 2.1
            </p>
          </div>

          {/* Legal Review Required Notice */}
          <div className="p-4 rounded-2xl bg-[#FFFDF9] border-l-4 border-[#D4A35A] border border-[#EADFCB] space-y-1">
            <span className="text-[11px] font-mono uppercase font-bold text-[#D4A35A]">
              [REVIEW REQUIRED: Legal draft for Sutra Studio]
            </span>
            <p className="text-xs text-[#64748B]">
              This master agreement establishes standard deliverables and turnaround SLAs for Sutra Studio commissions. Customize specific contractual requirements prior to commercial execution.
            </p>
          </div>

          <div className="space-y-6 text-sm text-[#334155] leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-[#0F172A]">
                1. Creative Commissions & Scope
              </h2>
              <p>
                All project orders placed through our Order Wizard or bespoke Producer consultations are governed by the specifications detailed in your confirmed project brief. Deliverables include specified format standards (e.g. 4K ProRes, GLTF 3D models, or production Next.js repositories).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-[#0F172A]">
                2. Revisions & 24-Hour Turnaround SLA
              </h2>
              <p>
                Each commission includes up to two complimentary revision rounds unless otherwise specified in an Enterprise service contract. Revision notes submitted through the Client Portal are processed within our 24-hour creative turnaround window.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-[#0F172A]">
                3. Intellectual Property Transfer
              </h2>
              <p>
                Upon receipt of 100% milestone payment and 1-Click Client Approval, all intellectual property rights, copyrights, and commercial licenses for the delivered assets transfer completely to the client. Sutra Studio retains the limited right to showcase non-confidential deliverables in our curated portfolio.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-[#0F172A]">
                4. Deliverable Preservation & Vault Access
              </h2>
              <p>
                Approved assets are archived in encrypted Sutra Cloud Vaults for a minimum of 36 months following project completion, accessible 24/7 via the Client Media Vault.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-[#EADFCB] flex items-center justify-between">
            <Link href="/">
              <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Studio
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="primary" size="sm">
                Initiate Project Order
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
