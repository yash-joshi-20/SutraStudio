import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  Layers,
  ShieldCheck,
  Sparkles,
  Calendar,
  Box,
  Video,
  Camera,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  findPackageById,
  getAllApprovedPackages,
  APPROVED_MONTHLY_PACKAGES,
  APPROVED_COMMISSION_PACKAGES,
  APPROVED_STANDALONE_PACKAGES,
  type RetainerPackage,
  type CommissionPackage,
  type StandaloneDeliverablePackage,
} from "@/config/packages";
import { formatCurrencyINR } from "@/config/services";
import { LotusSymbol } from "@/components/brand/SutraLogo";

interface PackageDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const pkgs = getAllApprovedPackages();
  return pkgs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PackageDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = findPackageById(slug);
  if (!pkg || pkg.active === false) {
    return { title: "Package Not Found — SUTRA STUDIO" };
  }
  return {
    title: `${pkg.name} — SUTRA STUDIO Production Packages`,
    description: pkg.description,
  };
}

export default async function PackageDetailPage({
  params,
}: PackageDetailPageProps) {
  const { slug } = await params;
  const requested = slug.toLowerCase().trim();

  const pkg = findPackageById(requested);
  if (!pkg || pkg.active === false) {
    notFound();
  }

  // Determine package family
  const isRetainer = "billingCycle" in pkg && pkg.billingCycle === "monthly";
  const isStandalone = "serviceId" in pkg;
  const isCommission = !isRetainer && !isStandalone;

  const retainer = isRetainer ? (pkg as RetainerPackage) : null;
  const standalone = isStandalone ? (pkg as StandaloneDeliverablePackage) : null;
  const commission = isCommission ? (pkg as CommissionPackage) : null;

  const deliverables: string[] =
    pkg.deliverables && pkg.deliverables.length > 0
      ? pkg.deliverables
      : (pkg as any).features || [];

  const features: string[] = (pkg as any).features || (standalone?.subBullets || []);
  const exclusions = pkg.exclusions || [
    "Paid third-party media ad spend not included",
    "Raw native 3D project working files excluded unless commissioned",
  ];

  const orderHref = `/new-order?package=${pkg.slug}`;
  const whatsappHref = `https://wa.me/919999999999?text=${encodeURIComponent(
    `Hello Sutra Studio, I would like to inquire about the ${pkg.name} package (${pkg.formattedPrice}).`
  )}`;

  // Find related packages
  const relatedPackages = getAllApprovedPackages()
    .filter((p) => p.slug !== pkg.slug && p.active !== false)
    .slice(0, 3);

  return (
    <main className="flex-1 bg-[#FAF9F5]">
      {/* 1. Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-[#EADFCB] bg-[#FFFDF9]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-1.5 text-xs text-[#64748B] overflow-x-auto">
          <Link href="/" className="hover:text-[#5C3A1E] shrink-0">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link href="/packages" className="hover:text-[#5C3A1E] shrink-0">
            Packages
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="shrink-0 text-[#0F172A] font-semibold truncate">
            {pkg.name}
          </span>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-[#FFFDF9] border-b border-[#EADFCB]">
        <div className="absolute top-10 right-10 -z-10 opacity-[0.03] pointer-events-none">
          <LotusSymbol className="w-[500px] h-[500px]" color="gold" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Package Description */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#F4EFE6] border border-[#EADFCB] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5C3A1E]">
                {isRetainer
                  ? "30-Day Active Retainer"
                  : isStandalone
                  ? "Deliverable Pack"
                  : "Curated Solution Bundle"}
              </span>
              <span className="rounded-full bg-[#D4A35A] px-3 py-1 text-[11px] font-bold text-[#0F172A] shadow-xs">
                {pkg.turnaround || "Project Milestone"}
              </span>
              {retainer?.popular && (
                <span className="rounded-full bg-[#2E7D4F] text-white px-3 py-1 text-[11px] font-semibold">
                  Most Popular
                </span>
              )}
            </div>

            <div className="space-y-3">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#0F172A]">
                {pkg.name}
              </h1>
              <p className="text-base sm:text-lg text-[#5C3A1E] font-medium">
                {(pkg as any).tagline ||
                  (retainer
                    ? retainer.monthlyQuotaDescription
                    : "Curated multi-asset studio production bundle")}
              </p>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                {pkg.description}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-2xl border border-[#EADFCB] bg-[#FAF9F5] p-3.5 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#D4A35A]" />
                  Turnaround SLA
                </span>
                <span className="text-sm font-semibold text-[#0F172A] block">
                  {pkg.turnaround}
                </span>
              </div>
              <div className="rounded-2xl border border-[#EADFCB] bg-[#FAF9F5] p-3.5 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] flex items-center gap-1">
                  <Box className="w-3 h-3 text-[#D4A35A]" />
                  Asset Volume
                </span>
                <span className="text-sm font-semibold text-[#0F172A] block">
                  {pkg.quantity
                    ? `${pkg.quantity} Deliverables`
                    : "Multi-Format Assets"}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[#EADFCB] bg-[#FAF9F5] p-3.5 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#2E7D4F]" />
                  Revisions
                </span>
                <span className="text-sm font-semibold text-[#0F172A] block truncate">
                  {pkg.revisionPolicy || "1 Round per Drop"}
                </span>
              </div>
            </div>

            {/* Retainer Daily Pipeline Highlights */}
            {retainer && (
              <div className="rounded-2xl border border-[#D4A35A]/40 bg-[#FFFDF9] p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4A35A]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5C3A1E]">
                    30-Day Daily Creative Cadence
                  </span>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Includes <strong>{retainer.includedServices.images} high-resolution visual graphics</strong> and{" "}
                  <strong>{retainer.includedServices.videos} short-form commercial video reels</strong>.
                  Assets are staged and reviewed in your private Google Drive vault continuously.
                </p>
              </div>
            )}
          </div>

          {/* Sticky Pricing / Order Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-3xl border border-[#EADFCB] bg-[#FFFDF9] p-6 sm:p-7 shadow-warm-lg space-y-6">
              <div className="space-y-2 border-b border-[#EADFCB] pb-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
                    Package Investment
                  </span>
                  <span className="text-xs font-semibold text-[#2E7D4F] bg-[#2E7D4F]/10 px-2.5 py-0.5 rounded-full">
                    Transparent Pricing
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-4xl sm:text-5xl font-bold text-[#5C3A1E]">
                    {pkg.formattedPrice}
                  </span>
                  {isRetainer && (
                    <span className="text-xs font-medium text-[#64748B]">
                      / 30 days
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B]">
                  {isRetainer
                    ? "Full 30-day production retainer with daily topic research & Drive staging."
                    : "All deliverables included. No hidden studio platform or setup fees."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href={orderHref}
                  className="w-full inline-flex items-center justify-center min-h-[46px] px-6 py-3 rounded-xl bg-[#5C3A1E] text-white hover:bg-[#4A2E17] text-sm font-semibold gap-2 transition-all shadow-md active:scale-[0.99]"
                >
                  <span>Order This Package</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center min-h-[42px] px-4 py-2.5 rounded-xl border border-[#EADFCB] bg-[#FAF9F5] text-[#5C3A1E] hover:bg-[#F4EFE6] text-xs font-semibold gap-2 transition-all"
                >
                  <span>Discuss via WhatsApp Concierge</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                </a>
              </div>

              {/* Key Assurance Badges */}
              <div className="space-y-2.5 pt-4 border-t border-[#EADFCB] text-xs text-[#475569]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D4F] shrink-0" />
                  <span>Private Google Drive Vault Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D4F] shrink-0" />
                  <span>Commercial &amp; Ad Rights Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D4F] shrink-0" />
                  <span>Zero Payment Gateway Processing Surcharges</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Included Deliverables & Features */}
      <section className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Deliverables List */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A98B57] font-semibold">
                Comprehensive Breakdown
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1">
                What&apos;s Included in {pkg.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                Every component is executed under Sutra Studio quality benchmarks and delivered directly to your shared vault.
              </p>
            </div>

            <div className="space-y-3">
              {deliverables.map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-[#F4EFE6] border border-[#D4A35A]/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#5C3A1E]" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-[#0F172A] block">
                      {item}
                    </span>
                    <span className="text-[11px] text-[#64748B] block mt-0.5">
                      Production QA verified • High-resolution commercial export
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Features & Strategy points */}
            {features.length > 0 && (
              <div className="pt-4 space-y-3">
                <h3 className="font-serif text-lg font-bold text-[#0F172A]">
                  Operational Standards &amp; Deliverable Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((f: string, i: number) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#475569] flex items-start gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D4A35A] shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Workflow & Limitations */}
          <div className="lg:col-span-5 space-y-6">
            {/* 4-Step Production Workflow */}
            <div className="rounded-3xl border border-[#EADFCB] bg-[#FFFDF9] p-6 space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4A35A]" />
                How the Package Works
              </h3>
              <ol className="space-y-4 text-xs">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="text-[#0F172A] block font-semibold">
                      Brief &amp; Asset Ingestion
                    </strong>
                    <span className="text-[#64748B]">
                      Submit your brand guidelines, product references, and creative goals.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="text-[#0F172A] block font-semibold">
                      Concept &amp; Pipeline Setup
                    </strong>
                    <span className="text-[#64748B]">
                      Our team creates the prompts, storyboard hooks, and scheduled delivery roadmap.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="text-[#0F172A] block font-semibold">
                      Continuous Google Drive Drops
                    </strong>
                    <span className="text-[#64748B]">
                      Deliverables land directly in your private cloud vault on schedule.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                    4
                  </span>
                  <div>
                    <strong className="text-[#0F172A] block font-semibold">
                      Consolidated Revisions
                    </strong>
                    <span className="text-[#64748B]">
                      Request edits within your SLA window for finalized master deployments.
                    </span>
                  </div>
                </li>
              </ol>
            </div>

            {/* Clear Exclusions & Guardrails */}
            <div className="rounded-3xl border border-[#EADFCB] bg-[#FFFDF9] p-6 space-y-3">
              <h3 className="font-serif text-base font-bold text-[#0F172A] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#A98B57]" />
                Package Scope &amp; Exclusions
              </h3>
              <p className="text-xs text-[#64748B]">
                To maintain studio velocity and predictable delivery timelines:
              </p>
              <ul className="space-y-2 text-xs text-[#64748B]">
                {exclusions.map((ex, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#94A3B8]">•</span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 4. Related Packages */}
        {relatedPackages.length > 0 && (
          <div className="pt-10 border-t border-[#EADFCB] space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#A98B57] font-semibold">
                  Explore Alternatives
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#0F172A]">
                  Other Production Packages
                </h3>
              </div>
              <Link
                href="/packages"
                className="text-xs font-semibold text-[#5C3A1E] hover:underline flex items-center gap-1"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPackages.map((rel) => (
                <div
                  key={rel.id}
                  className="rounded-2xl border border-[#EADFCB] bg-[#FFFDF9] p-5 flex flex-col justify-between hover:border-[#D4A35A] transition-all shadow-xs"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase text-[#A98B57] font-semibold block">
                      {rel.turnaround}
                    </span>
                    <h4 className="font-serif text-lg font-bold text-[#0F172A]">
                      {rel.name}
                    </h4>
                    <p className="text-xs text-[#64748B] line-clamp-2">
                      {rel.description}
                    </p>
                    <div className="pt-2">
                      <span className="font-serif text-xl font-bold text-[#5C3A1E]">
                        {rel.formattedPrice}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#EADFCB] mt-4 flex items-center justify-between">
                    <Link
                      href={`/packages/${rel.slug}`}
                      className="text-xs font-semibold text-[#5C3A1E] hover:underline"
                    >
                      Details
                    </Link>
                    <Link
                      href={`/new-order?package=${rel.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#5C3A1E] text-white text-xs font-semibold hover:bg-[#4A2E17]"
                    >
                      <span>Order</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
