import React from "react";
import { Shield } from "lucide-react";
import { LegalDocumentLayout } from "@/components/layout/LegalDocumentLayout";

export const metadata = {
  title: "Privacy Directive — Sutra Studio",
  description: "Studio data protection, client vault isolation, and encrypted Sutra Cloud Vault storage policies.",
};

const PRIVACY_SECTIONS = [
  {
    title: "1. Client Isolation & Dedicated Vaults",
    content: (
      <p>
        Sutra Studio operates a strict tenant-isolated architecture. Every client registered through our secure identity enclave is assigned a unique client ID and an isolated directory in Sutra Cloud Vault. Deliverables, raw 3D scene files, and ProRes motion assets are never cross-referenced or shared with other accounts.
      </p>
    ),
  },
  {
    title: "2. Cloud Infrastructure & Confidential Data Safeguards",
    content: (
      <>
        <p>
          Sutra Studio operates a high-security, multi-tier computational rendering and storage architecture with rigorous privacy protections:
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm text-[#475569]">
          <li>
            <strong className="text-[#171717]">Zero Public Training for Confidential Data:</strong> For sensitive client commissions, brand guidelines, and proprietary digital assets, our studio enforces zero-retention enterprise cloud endpoints that guarantee client data is never retained, indexed, or utilized for public training datasets.
          </li>
          <li>
            <strong className="text-[#171717]">Draft & Review Lifecycle:</strong> Exploratory work is strictly segregated from production outputs. All final commercial deliverables undergo executive studio review and quality assurance prior to release into client vaults.
          </li>
          <li>
            <strong className="text-[#171717]">Ephemeral Caching:</strong> Intermediate processing artifacts are temporarily cached in-memory with strict 24-hour time-to-live (TTL) expiration and automated purging.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Financial & Invoice Records",
    content: (
      <p>
        All billing calculations, GST numbers, and payment milestones processed via Pay by UPI QR or direct banking are stored with end-to-end audit logs. Banking credentials and UPI PINs are never requested or retained on Sutra Studio servers.
      </p>
    ),
  },
  {
    title: "4. Data Erasure & Vault Export",
    content: (
      <p>
        Clients retain full ownership of finalized deliverables. You may request permanent archival deletion or instant Google Drive zip export of your studio vault at any time through our verified Client Inquiry Desk.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocumentLayout
      badgeIcon={<Shield className="w-3.5 h-3.5 text-[#2E7D4F]" />}
      badgeLabel="Studio Data Protection"
      title="Privacy Directive & Vault Isolation"
      lastUpdated="Last updated: October 2026 • Official Privacy Policy"
      noticeTitle="[REVIEW REQUIRED: Legal draft for Sutra Studio]"
      noticeContent="This policy describes current production engineering and data handling practices. Formal legal counsel review is recommended prior to commercial public distribution."
      sections={PRIVACY_SECTIONS}
      backHref="/"
      backLabel="Back to Studio"
    />
  );
}
