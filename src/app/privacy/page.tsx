import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Shield, Lock, HardDrive, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Privacy Directive — Sutra Studio",
  description: "Studio data protection, client vault isolation, and encrypted Google Drive storage policies.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      <Navbar />

      <main id="main-content" className="flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-3 pb-6 border-b border-[#EADFCB]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-[#2E7D4F]" />
              <span>Studio Data Protection</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A]">
              Privacy Directive & Vault Isolation
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Last updated: October 2026 • Version 1.4
            </p>
          </div>

          {/* Legal Review Required Notice */}
          <div className="p-4 rounded-2xl bg-[#FFFDF9] border-l-4 border-[#D4A35A] border border-[#EADFCB] space-y-1">
            <span className="text-[11px] font-mono uppercase font-bold text-[#D4A35A]">
              [REVIEW REQUIRED: Legal draft for Sutra Studio]
            </span>
            <p className="text-xs text-[#64748B]">
              This policy describes current production engineering and data handling practices. Formal legal counsel review is recommended prior to commercial public distribution.
            </p>
          </div>

          <div className="space-y-6 text-sm text-[#334155] leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-[#0F172A]">
                1. Client Isolation & Dedicated Vaults
              </h2>
              <p>
                Sutra Studio operates a strict tenant-isolated architecture. Every client registered through our Firebase Authentication enclave is assigned a unique client ID and an isolated folder inside Google Drive. Deliverables, raw 3D scene files, and ProRes motion assets are never cross-referenced or shared with other accounts.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-[#0F172A]">
                2. AI Workflow Generation Privacy
              </h2>
              <p>
                Creative briefs and prompts provided to our 8 isolated AI workflow engines are utilized solely for generating your commissioned project assets. Client brand reference images and proprietary materials are never fed into public training corpuses.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-[#0F172A]">
                3. Financial & Invoice Records
              </h2>
              <p>
                All billing calculations, GST numbers, and payment milestones processed via Razorpay or Stripe are stored with end-to-end cryptographic signatures. Raw credit card numbers are never retained on Sutra Studio servers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-[#0F172A]">
                4. Data Erasure & Vault Export
              </h2>
              <p>
                Clients retain full ownership of finalized deliverables. You may request permanent archival deletion or instant Google Drive zip export of your studio vault at any time through our verified Client Inquiry Desk.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-[#EADFCB] flex items-center justify-between">
            <Link href="/">
              <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Studio
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="primary" size="sm">
                Inquire with Data Protection Officer
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
