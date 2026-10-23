import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface LegalDocumentSection {
  title: string;
  content: React.ReactNode;
}

export interface LegalDocumentLink {
  label: string;
  href: string;
}

export interface LegalDocumentLayoutProps {
  badgeIcon: React.ReactNode;
  badgeLabel: string;
  title: string;
  lastUpdated: string;
  noticeTitle?: string;
  noticeContent?: string;
  sections: LegalDocumentSection[];
  relatedLinks?: LegalDocumentLink[];
  backHref?: string;
  backLabel?: string;
}

export function LegalDocumentLayout({
  badgeIcon,
  badgeLabel,
  title,
  lastUpdated,
  noticeTitle = "Studio Policy Notice",
  noticeContent,
  sections,
  relatedLinks = [
    { label: "Terms of Engagement", href: "/terms" },
    { label: "Privacy Directive", href: "/privacy" },
    { label: "Cancellation & Refunds", href: "/cancellation-refund" },
  ],
  backHref = "/",
  backLabel = "Return to Atelier Home",
}: LegalDocumentLayoutProps) {
  return (
    <div className="flex-1 flex flex-col bg-[#FAF9F5] text-[#171717] selection:bg-[#A98B57]/20 selection:text-[#171717]">
      <main id="main-content" className="flex-1 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-3 pb-6 border-b border-[#E5E1D8]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E5E1D8] text-xs font-semibold text-[#A98B57] uppercase tracking-wider">
              {badgeIcon}
              <span>{badgeLabel}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#171717]">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-[#737373]">
              {lastUpdated}
            </p>
          </div>

          {/* Legal / Policy Notice Box */}
          {noticeContent && (
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border-l-4 border-[#A98B57] border border-[#E5E1D8] space-y-1">
              <span className="text-[11px] font-mono uppercase font-bold text-[#A98B57]">
                {noticeTitle}
              </span>
              <p className="text-xs text-[#737373]">
                {noticeContent}
              </p>
            </div>
          )}

          {/* Dynamic Sections */}
          <div className="space-y-6 text-sm text-[#334155] leading-relaxed">
            {sections.map((sec, idx) => (
              <section key={idx} className="space-y-3">
                <h2 className="font-serif text-xl font-semibold text-[#171717]">
                  {sec.title}
                </h2>
                <div className="space-y-3">{sec.content}</div>
              </section>
            ))}
          </div>

          {/* Footer Actions & Related Links */}
          <div className="pt-8 border-t border-[#E5E1D8] flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href={backHref}>
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
              </Button>
            </Link>

            {relatedLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#737373]">
                {relatedLinks.map((link, i) => (
                  <React.Fragment key={link.href}>
                    {i > 0 && <span>•</span>}
                    <Link
                      href={link.href}
                      className="hover:text-[#A98B57] transition-colors font-medium underline underline-offset-4"
                    >
                      {link.label}
                    </Link>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
