import React from "react";
import { FileText } from "lucide-react";
import { LegalDocumentLayout } from "@/components/layout/LegalDocumentLayout";

export const metadata = {
  title: "Terms of Engagement — Sutra Studio",
  description: "Studio service terms, intellectual property transfer, and revision delivery agreements.",
};

const TERMS_SECTIONS = [
  {
    title: "1. Creative Commissions & Scope",
    content: (
      <p>
        All project orders placed through our Order Wizard or bespoke Producer consultations are governed by the specifications detailed in your confirmed project brief. Deliverables include specified format standards (e.g. 4K ProRes, GLTF 3D models, or production Next.js repositories).
      </p>
    ),
  },
  {
    title: "2. Revisions & 24-Hour Turnaround SLA",
    content: (
      <p>
        Each commission includes up to two complimentary revision rounds unless otherwise specified in an Enterprise service contract. Revision notes submitted through the Client Portal are processed within our 24-hour creative turnaround window.
      </p>
    ),
  },
  {
    title: "3. Intellectual Property Transfer",
    content: (
      <p>
        Upon receipt of 100% milestone payment and 1-Click Client Approval, all intellectual property rights, copyrights, and commercial licenses for the delivered assets transfer completely to the client. Sutra Studio retains the limited right to showcase non-confidential deliverables in our curated portfolio.
      </p>
    ),
  },
  {
    title: "4. Deliverable Preservation & Vault Access",
    content: (
      <p>
        Approved assets are archived in encrypted Sutra Cloud Vaults for a minimum of 36 months following project completion, accessible 24/7 via the Client Media Vault.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocumentLayout
      badgeIcon={<FileText className="w-3.5 h-3.5 text-[#A98B57]" />}
      badgeLabel="Studio Master Agreement"
      title="Terms of Creative Engagement"
      lastUpdated="Last updated: October 2026 • Official Terms of Engagement"
      noticeTitle="[REVIEW REQUIRED: Legal draft for Sutra Studio]"
      noticeContent="This master agreement establishes standard deliverables and turnaround SLAs for Sutra Studio commissions. Customize specific contractual requirements prior to commercial execution."
      sections={TERMS_SECTIONS}
      backHref="/"
      backLabel="Back to Studio"
    />
  );
}
