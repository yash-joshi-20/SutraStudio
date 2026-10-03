import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, RotateCcw, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Cancellation & Refund Policy — Sutra Studio",
  description: "Official studio rules for order cancellations, revisions, and Razorpay refund settlements.",
};

export default function CancellationRefundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#171717] selection:bg-[#A98B57]/20 selection:text-[#171717]">
      <Navbar />

      <main id="main-content" className="flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-3 pb-6 border-b border-[#E5E1D8]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E5E1D8] text-xs font-semibold text-[#A98B57] uppercase tracking-wider">
              <RotateCcw className="w-3.5 h-3.5 text-[#A98B57]" />
              <span>Studio Policy</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#171717]">
              Cancellation & Refund Policy
            </h1>
            <p className="text-xs sm:text-sm text-[#737373]">
              Last updated: October 2026 • Governed by Sutra Studio Master Engagement Terms
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFFFFF] border-l-4 border-[#A98B57] border border-[#E5E1D8] space-y-1">
            <span className="text-[11px] font-mono uppercase font-bold text-[#A98B57]">
              Fair & Transparent Policy
            </span>
            <p className="text-xs text-[#737373]">
              Every creative commission is backed by our milestone protection framework. Cancellations are honored smoothly prior to production kickoff.
            </p>
          </div>

          <div className="space-y-6 text-sm text-[#334155] leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-[#171717]">
                1. Cancellation Before Production Kickoff (100% Refund)
              </h2>
              <p>
                Clients may cancel any individual service commission at zero penalty while the order remains in <strong>Order Placed (Pending Payment)</strong>, <strong>Payment Verified</strong>, or <strong>Brief Review</strong> stage before actual 3D, video, architectural, or design production has been initiated. Upon cancellation, 100% of the paid amount is refunded immediately via Razorpay.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-[#171717]">
                2. Cancellation During Draft Production (50% Refund)
              </h2>
              <p>
                If cancellation is requested while a commission is actively in <strong>In Production</strong> or <strong>Draft Delivered</strong> stage prior to client approval, a 50% partial refund is granted to cover allocated compute, 3D rendering pipeline costs, and studio producer hours.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-[#171717]">
                3. Post-Approval & Delivered Deliverables (Non-Refundable)
              </h2>
              <p>
                Once a client explicitly approves final deliverables (or after 2 complimentary revision rounds have been concluded and commercial licenses transferred), the order is completed and fees become non-refundable.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-[#171717]">
                4. Monthly Retainer Subscriptions & 3-Day Free Trial
              </h2>
              <p>
                During the <strong>3-Day Free Trial</strong>, clients can cancel anytime with zero charge. For active paid monthly retainers, cancellation stops subsequent billing cycles while maintaining full studio access until the conclusion of the current 30-day period.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-[#171717]">
                5. Razorpay Settlement & Refund Processing Time
              </h2>
              <p>
                Approved refunds are initiated through our official <strong>Razorpay Payment Gateway</strong> integration directly back to the original source (UPI, Credit/Debit Card, Net Banking). Settlements typically reflect in your bank account within 3 to 5 business days.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-[#E5E1D8] flex items-center justify-between">
            <Link href="/terms">
              <Button variant="outline" size="sm" className="gap-2 border-[#E5E1D8] text-[#171717]">
                <ArrowLeft className="w-4 h-4" />
                View Full Terms of Engagement
              </Button>
            </Link>
            <Link href="/orders">
              <Button size="sm" className="bg-[#171717] text-white hover:bg-[#262626]">
                Go to Orders Portal
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
