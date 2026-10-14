import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  Layers,
  Sparkles,
  Target,
  Package,
} from "lucide-react";
import {
  CANONICAL_SERVICES,
  SUTRA_SERVICES_CONFIG,
  SERVICE_SLUG_ALIASES,
  findServiceBySlug,
  getServiceDetailSpec,
} from "@/config/services";
import { findMainServiceBySlug, getMainServices } from "@/config/mainServices";
import {
  findServiceCatalogEntry,
  findServiceGroupBySlug,
  getPriceBadge,
} from "@/config/serviceGroups";
import { ServicePurchasePanel } from "@/components/services/ServicePurchasePanel";
import { Interactive3DViewer } from "@/components/spatial/Interactive3DViewer";
import { PanoramicTourViewer } from "@/components/spatial/PanoramicTourViewer";
import { DeviceMockupShowcase } from "@/components/showcase/DeviceMockupShowcase";
import { VideoCard } from "@/components/media/VideoCard";

/**
 * Dynamic service detail page (STEP 6).
 *
 * One reusable implementation for every service, driven entirely by the
 * central catalog (`@/config/services` + `@/config/serviceGroups`). Invalid or
 * inactive slugs render the 404 via `notFound()` — no duplicated page
 * implementations, no hard-coded prices.
 */

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const slugs = new Set<string>();
  for (const service of [...SUTRA_SERVICES_CONFIG, ...CANONICAL_SERVICES]) {
    if (service.active !== false && service.slug) {
      slugs.add(service.slug.toLowerCase());
    }
  }
  return Array.from(slugs).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = findServiceBySlug(slug);
  if (!service || service.active === false) {
    return { title: "Service Not Found — SUTRA STUDIO" };
  }
  return {
    title: `${service.name} — SUTRA STUDIO`,
    description: service.tagline || service.description,
  };
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { slug } = await params;
  const requested = slug.toLowerCase().trim();

  // Legacy aliases (e.g. /services/img-creation) redirect to the canonical slug.
  const aliasTarget = SERVICE_SLUG_ALIASES[requested];
  if (aliasTarget) {
    redirect(`/services/${aliasTarget}`);
  }

  const service = findServiceBySlug(requested);
  if (!service || service.active === false) {
    notFound();
  }

  const spec = getServiceDetailSpec(service);
  const entry = findServiceCatalogEntry(requested);
  const group = findServiceGroupBySlug(service.slug);
  const orderHref = service.ctaHref || `/orders?service=${service.slug}`;

  /**
   * The eight main services render a price-free experience (scope, samples,
   * use cases, packages pointer and a Start Order CTA). Every other catalog
   * route keeps its existing purchasable detail layout unchanged.
   */
  const mainService = findMainServiceBySlug(requested);
  const usesWebShowcase =
    requested === "website-development" ||
    requested === "mobile-app-setup" ||
    requested === "web-app-development" ||
    requested === "web-mobile-development";

  const relatedEntries = group
    ? group.entries.filter((e) => e.slug !== service.slug).slice(0, 3)
    : [];

  // Related main services (price-free) shown instead of priced group entries.
  const relatedMainServices = mainService
    ? getMainServices()
        .filter((s) => s.slug !== mainService.slug)
        .slice(0, 4)
    : [];

  return (
    <main className="flex-1 bg-[#FAF9F5]">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-[#EADFCB] bg-[#FFFDF9]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-1.5 text-xs text-[#64748B] overflow-x-auto">
          <Link href="/services" className="hover:text-[#5C3A1E] shrink-0">
            Services
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          {group && (
            <>
              <span className="shrink-0 text-[#5C3A1E] font-medium">
                {group.index}. {group.title}
              </span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </>
          )}
          <span className="shrink-0 text-[#0F172A] font-semibold">
            {service.name}
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#FFFDF9] border-b border-[#EADFCB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#F4EFE6] border border-[#EADFCB] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#5C3A1E]">
                {service.category}
              </span>
              <span className="rounded-full bg-[#D4A35A] px-3 py-1 text-[11px] font-bold text-[#0F172A] shadow-sm">
                {service.badge}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#0F172A] leading-tight">
              {service.name}
            </h1>
            <p className="text-base lg:text-lg text-[#64748B] leading-relaxed max-w-2xl">
              {service.tagline || service.description}
            </p>

            {/* Commercial summary strip — main services show scope, never pricing */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] text-xs">
              {mainService ? (
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                    Category
                  </span>
                  <span className="font-serif text-lg font-bold text-[#5C3A1E] block">
                    {service.category}
                  </span>
                  <span className="text-[10px] text-[#64748B] block">
                    Core studio discipline
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                    {getPriceBadge(service)}
                  </span>
                  <span className="font-serif text-lg font-bold text-[#5C3A1E] block">
                    {service.startingPrice}
                  </span>
                  <span className="text-[10px] text-[#64748B] block">
                    {spec.pricingUnit}
                  </span>
                </div>
              )}
              <div>
                <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                  Turnaround SLA
                </span>
                <span className="font-medium text-[#0F172A] block mt-0.5">
                  {service.turnaround}
                </span>
                <span className="text-[10px] text-[#64748B] block">
                  Accelerated review
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                  Revision Rounds
                </span>
                <span className="font-medium text-[#0F172A] block mt-0.5">
                  {service.revisionPolicy || "1 to 2 revision rounds"}
                </span>
                <span className="text-[10px] text-[#64748B] block">
                  Consolidated feedback
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                  Studio Department
                </span>
                <span
                  className="font-medium text-[#5C3A1E] truncate block mt-0.5"
                  title={service.pipelineEngine}
                >
                  {service.pipelineEngine.split("+")[0].trim()}
                </span>
                <span className="text-[10px] text-[#64748B] block">
                  Art-director led
                </span>
              </div>
            </div>
          </div>

          {/* Purchase column */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-[#F4EFE6] border border-[#EADFCB]">
                <Image
                  src={service.thumbnail}
                  alt={`${service.name} studio sample`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
                <span className="absolute top-3 left-3 rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[9px] font-mono font-medium text-white/90 tracking-wider uppercase border border-white/10">
                  Studio Sample
                </span>
              </div>

              {mainService ? (
                /* Price-free quick-scope card for the eight main services */
                <div className="p-5 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#A98B57] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#2E7D4F]" />
                      What This Service Includes
                    </h2>
                    <ul className="space-y-1.5 text-sm text-[#475569]">
                      {service.deliverables.slice(0, 4).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#2E7D4F] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-[#EADFCB]/60 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                        Turnaround
                      </span>
                      <span className="font-medium text-[#0F172A] block mt-0.5">
                        {service.turnaround}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">
                        Revisions
                      </span>
                      <span className="font-medium text-[#0F172A] block mt-0.5">
                        {service.revisionPolicy || "1 to 2 revision rounds"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 space-y-2">
                    <Link
                      href={orderHref}
                      className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#171717] px-5 py-3 text-sm font-semibold text-[#FAF9F5] transition-colors hover:bg-[#2C2C2C]"
                    >
                      Start Order
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/packages"
                      className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-[#EADFCB] bg-[#FFFDF9] px-5 py-3 text-sm font-semibold text-[#4A3B22] transition-colors hover:border-[#D4A35A]"
                    >
                      <Package className="w-4 h-4 text-[#A98B57]" />
                      View Packages
                    </Link>
                  </div>

                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    Scoped pricing for this service is confirmed in the order
                    flow — see our{" "}
                    <Link href="/pricing" className="underline text-[#5C3A1E] hover:text-[#4A2E17]">
                      pricing page
                    </Link>{" "}
                    for full rate tables.
                  </p>
                </div>
              ) : (
                <ServicePurchasePanel
                  item={service}
                  options={entry?.options ?? []}
                  turnaround={service.turnaround}
                  revisionPolicy={service.revisionPolicy}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Studio Samples & Use Cases — main services only (clearly labeled samples) */}
      {mainService && (
        <section className="py-12 border-b border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#A98B57] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4A35A]" />
                Studio Samples &amp; Typical Use Cases
              </h2>
              <p className="text-sm text-[#64748B] max-w-3xl leading-relaxed">
                The previews below are clearly labeled studio samples that
                demonstrate our production quality for{" "}
                <strong className="text-[#5C3A1E]">{mainService.title}</strong> —
                they are illustrative demonstrations, not client project claims.
              </p>
            </div>

            {/* Interactive / media sample showcase */}
            <div className="rounded-3xl overflow-hidden border border-[#EADFCB] bg-[#F4EFE6]">
              {service.mediaType === "3d" ? (
                <Interactive3DViewer
                  height="380px"
                  title={`${service.name} • 3D Mesh`}
                  subtitle="Interactive WebGL 2.0 PBR Orbit — Studio Sample"
                  allowPresetSwitch={true}
                />
              ) : service.mediaType === "360" ? (
                <PanoramicTourViewer
                  height="380px"
                  title={`${service.name} • 360° VR`}
                  subtitle="Interactive Equirectangular Spatial Tour — Studio Sample"
                />
              ) : usesWebShowcase ? (
                <DeviceMockupShowcase initialMode="laptop" />
              ) : service.mediaType === "video" ? (
                <VideoCard
                  video="service-ai-video"
                  badgeText={`${service.category.toUpperCase()} REEL SAMPLE`}
                  allowExpand
                />
              ) : (
                <div className="relative aspect-video w-full">
                  <Image
                    src={service.thumbnail}
                    alt={`${service.name} studio sample`}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-4 left-4 rounded-md bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[10px] font-mono font-medium text-white/90 tracking-wider uppercase border border-white/10">
                    Studio Sample
                  </span>
                </div>
              )}
            </div>

            {/* Typical use cases */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C3A1E] flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#A98B57]" />
                Typical Use Cases
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {mainService.examples.map((example) => (
                  <li
                    key={example}
                    className="flex items-center gap-2.5 p-4 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-sm text-[#0F172A]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D4F] shrink-0" />
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-[#94A3B8] pt-1">
                Looking for verified client work?{" "}
                <Link
                  href="/projects"
                  className="underline text-[#5C3A1E] hover:text-[#4A2E17] font-medium"
                >
                  Explore our project showcases
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Purpose & audience */}
      <section className="py-12 border-b border-[#EADFCB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#A98B57] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#D4A35A]" />
              Service Purpose &amp; Intended Clients
            </h2>
            <p className="text-sm text-[#0F172A] leading-relaxed">
              {service.description}
            </p>
            <div className="pt-3 border-t border-[#EADFCB]/60 text-sm text-[#64748B]">
              <strong className="text-[#5C3A1E] font-semibold">Ideal For: </strong>
              <span>{spec.intendedAudience}</span>
            </div>
            <div className="text-sm text-[#64748B]">
              <strong className="text-[#5C3A1E] font-semibold">
                Custom Scope:{" "}
              </strong>
              <span>{spec.customQuoteConditions}</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#F8F5EF] border border-[#EADFCB] space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#A98B57] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#D4A35A]" />
              Required Client Inputs
            </h2>
            <ul className="space-y-2 text-sm text-[#475569]">
              {spec.clientInputs.map((inputItem, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#D4A35A] font-bold mt-0.5">•</span>
                  <span>{inputItem}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Deliverables + formats */}
      <section className="py-12 bg-[#FFFDF9] border-b border-[#EADFCB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#A98B57] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D4F]" />
              Exact Included Deliverables &amp; Quantities
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {service.deliverables.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2.5 text-sm text-[#0F172A] p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB]/70"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D4F] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-3xl bg-[#F8F5EF] border border-[#EADFCB] space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#A98B57] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#D4A35A]" />
              Master Deliverable Formats &amp; Dimensions
            </h2>
            <p className="text-sm text-[#0F172A] font-mono leading-relaxed">
              {spec.dimensionsSpecs}
            </p>
          </div>

          {service.exclusions.length > 0 && (
            <div className="p-5 rounded-3xl bg-[#FAF9F5] border border-[#EADFCB] space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#C2761A] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C2761A]" />
                Exclusions
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#475569]">
                {service.exclusions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#C2761A] mt-0.5">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* 5-step production process */}
      <section className="py-12 border-b border-[#EADFCB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#5C3A1E] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#D4A35A]" />
            5-Step Production Process (Research → Creative Direction →
            Production → Studio QA → Delivery Vault)
          </h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {spec.productionSteps.map((step) => (
              <li
                key={step.step}
                className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] flex flex-col"
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#5C3A1E] text-white text-[11px] font-bold mb-2">
                  {step.step}
                </span>
                <h3 className="font-serif text-sm font-semibold text-[#0F172A] leading-snug mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
          <p className="text-xs text-[#8A8A8A] italic">{spec.sampleDisclaimer}</p>
        </div>
      </section>

      {/* Related services — main services link to sibling disciplines (price-free) */}
      {mainService && relatedMainServices.length > 0 && (
        <section className="py-12 bg-[#FFFDF9] border-b border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-serif text-xl font-semibold text-[#0F172A]">
                Explore More Studio Services
              </h2>
              <Link
                href="/services"
                className="text-sm font-medium text-[#5C3A1E] hover:underline inline-flex items-center gap-1"
              >
                View all services
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedMainServices.map((related) => (
                <li key={related.slug}>
                  <Link
                    href={related.detailHref}
                    className="group flex h-full flex-col justify-between rounded-2xl border border-[#EADFCB] bg-[#FAF9F5] p-5 transition-colors hover:border-[#D4A35A]"
                  >
                    <div>
                      <h3 className="font-serif text-base font-semibold text-[#0F172A] group-hover:text-[#5C3A1E]">
                        {related.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#64748B] line-clamp-2">
                        {related.shortDescription}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#5C3A1E]">
                        View Service
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-[#A98B57]" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Related services in the same buying group (non-main catalog routes) */}
      {!mainService && relatedEntries.length > 0 && group && (
        <section className="py-12 bg-[#FFFDF9] border-b border-[#EADFCB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-serif text-xl font-semibold text-[#0F172A]">
                More in {group.index}. {group.title}
              </h2>
              <Link
                href="/services"
                className="text-sm font-medium text-[#5C3A1E] hover:underline inline-flex items-center gap-1"
              >
                View all services
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedEntries.map((related) => (
                <li key={related.slug}>
                  <Link
                    href={`/services/${related.slug}`}
                    className="group flex h-full flex-col justify-between rounded-2xl border border-[#EADFCB] bg-[#FAF9F5] p-5 transition-colors hover:border-[#D4A35A]"
                  >
                    <div>
                      <h3 className="font-serif text-base font-semibold text-[#0F172A] group-hover:text-[#5C3A1E]">
                        {related.item.name}
                      </h3>
                      <p className="mt-1 text-xs text-[#64748B] line-clamp-2">
                        {related.item.tagline}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#5C3A1E]">
                        {related.item.priceDisplay}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-[#A98B57]" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Bottom CTA — main services never reference pricing on this page */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          {mainService ? (
            <>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
                Ready to start with {mainService.title}?
              </h2>
              <p className="text-sm text-[#64748B] max-w-xl mx-auto leading-relaxed">
                Start an order with your brief and requirements — every scope
                is confirmed with you before production begins, and your work
                is delivered through your private client vault.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={orderHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#171717] px-6 py-3.5 text-sm font-semibold text-[#FAF9F5] transition-colors hover:bg-[#2C2C2C]"
                >
                  Start Order
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/packages"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] px-6 py-3.5 text-sm font-semibold text-[#4A3B22] transition-colors hover:border-[#D4A35A]"
                >
                  <Package className="w-4 h-4 text-[#A98B57]" />
                  View Packages
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] px-6 py-3.5 text-sm font-semibold text-[#4A3B22] transition-colors hover:border-[#D4A35A]"
                >
                  Explore Pricing
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F172A]">
                Ready to order {service.name}?
              </h2>
              <p className="text-sm text-[#64748B] max-w-xl mx-auto leading-relaxed">
                The price you see is the price you pay — it is re-validated on our
                servers before checkout, and your order is stored securely in your
                account.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={orderHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#171717] px-6 py-3.5 text-sm font-semibold text-[#FAF9F5] transition-colors hover:bg-[#2C2C2C]"
                >
                  {service.ctaText || "Order now"}
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] px-6 py-3.5 text-sm font-semibold text-[#4A3B22] transition-colors hover:border-[#D4A35A]"
                >
                  Request a custom proposal
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
