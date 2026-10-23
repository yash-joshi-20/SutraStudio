import React from "react";
import { RotateCcw } from "lucide-react";
import { LegalDocumentLayout } from "@/components/layout/LegalDocumentLayout";

export const metadata = {
  title: "Cancellation & Refund Policy — Sutra Studio",
  description: "Official studio rules for order cancellations, revisions, and bank refund settlements.",
};

const CANCELLATION_SECTIONS = [
  {
    title: "1. Cancellation Before Production Kickoff (100% Refund)",
    content: (
      <p>
        Clients may cancel any individual service commission at zero penalty while the order remains in <strong>Order Placed (Pending Payment)</strong>, <strong>Payment Verified</strong>, or <strong>Brief Review</strong> stage before actual 3D, video, architectural, or design production has been initiated. Upon cancellation, 100% of the paid amount is refunded via verified bank transfer / UPI settlement.
      </p>
    ),
  },
  {
    title: "2. Cancellation During Draft Production (50% Refund)",
    content: (
      <p>
        If cancellation is requested while a commission is actively in <strong>In Production</strong> or <strong>Draft Delivered</strong> stage prior to client approval, a 50% partial refund is granted to cover studio creative production costs, rendering resources, and creative direction hours.
      </p>
    ),
  },
  {
    title: "3. Post-Approval & Delivered Deliverables (Non-Refundable)",
    content: (
      <p>
        Once a client explicitly approves final deliverables (or after 2 complimentary revision rounds have been concluded and commercial licenses transferred), the order is completed and fees become non-refundable.
      </p>
    ),
  },
  {
    title: "4. Monthly Retainer Subscriptions & 3-Day Free Trial",
    content: (
      <p>
        During the <strong>3-Day Free Trial</strong>, clients can cancel anytime with zero charge. For active paid monthly retainers, cancellation stops subsequent billing cycles while maintaining full studio access until the conclusion of the current 30-day period.
      </p>
    ),
  },
  {
    title: "5. Refund Processing & Bank Settlement",
    content: (
      <p>
        Approved refunds are processed by studio administration directly back to your source bank account / UPI VPA. Settlements typically reflect in your bank account within 2 to 3 business days.
      </p>
    ),
  },
];

export default function CancellationRefundPage() {
  return (
    <LegalDocumentLayout
      badgeIcon={<RotateCcw className="w-3.5 h-3.5 text-[#A98B57]" />}
      badgeLabel="Studio Policy"
      title="Cancellation & Refund Policy"
      lastUpdated="Last updated: October 2026 • Governed by Sutra Studio Master Engagement Terms"
      noticeTitle="Fair & Transparent Policy"
      noticeContent="Every creative commission is backed by our milestone protection framework. Cancellations are honored smoothly prior to production kickoff."
      sections={CANCELLATION_SECTIONS}
      backHref="/terms"
      backLabel="View Full Terms of Engagement"
    />
  );
}
