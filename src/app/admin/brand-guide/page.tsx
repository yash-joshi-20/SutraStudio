"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Layers,
  MessageSquare,
  Clock,
  ExternalLink,
  Info,
  CheckCircle2,
  FileText,
  Smartphone,
  Eye,
  Grid3X3,
  ListOrdered,
  Share2,
} from "lucide-react";

// Platform Type
type ActiveSection = "facebook" | "instagram" | "whatsapp" | "benchmarks";

export default function AdminBrandGuidePage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("facebook");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  // Download entire guide as Markdown / Text file
  const handleDownloadFullGuide = () => {
    const content = `# SUTRA STUDIOS — BRAND PROFILE SPECIFICATION GUIDE
Official Social & Messaging Channel Reference (Manual Transfer Only)

===================================================================
1. FACEBOOK PAGE SPECIFICATIONS & COPY
===================================================================
• Page Name: Sutra Studios
• Vanity URL: @sutrastudios.in
• Primary Category: Marketing Agency
• Secondary Categories: Design & Fashion, Software Company
• DP Specs: 1080 x 1080 px (1:1), 25% outer safe margin. Charcoal (#171717) crest on warm ivory (#FAF9F5).
• Cover Banner Specs: 820 x 312 px (Desktop), central safe area 640 x 312 px.
• Short Bio (93 chars):
Creative & digital atelier delivering visual production, software engineering & brand growth.

• Long About / Story (712 chars):
Sutra Studios is a full-spectrum creative technology and digital production atelier. We partner with emerging and established brands to build distinctive visual identities, high-impact digital marketing campaigns, and bespoke software solutions.
Our 12 integrated creative disciplines include Image Creation, Video Production, 3D Architectural Modeling, 360 Interactive Views, Window & Spatial Design, Digital Marketing, Meta Ads Management, Website Development, Web Applications, and Mobile App Setups.
We offer transparent single-deliverable pricing starting from ₹499 alongside our flagship 30-Day Growth Plan for brands requiring daily production momentum. Connect with our studio team to discuss your next project.

• Instant Reply (263 chars):
Hello and welcome to Sutra Studios. Thank you for contacting our creative atelier. We have received your message and our studio team will review your inquiry within two business hours. You can also explore our full service catalog and pricing at sutrastudios.in.

• Away Message (222 chars):
Thank you for reaching out to Sutra Studios. Our atelier is currently closed. Studio hours are Monday to Saturday, 9:30 AM to 7:00 PM IST. We will respond promptly as soon as our production team resumes tomorrow morning.

===================================================================
2. INSTAGRAM PROFILE SPECIFICATIONS & COPY
===================================================================
• Name Field (32 chars): Sutra Studios | Creative Atelier
• Username: sutrastudios.in
• Category: Marketing Agency
• Profile Photo: 1080 x 1080 px vector emblem on warm ivory.
• Bio (Strictly 144 chars / 150 max):
Creative & digital studio atelier.
Visual production, custom software & brand growth.
✦ 12 disciplines in one studio
Explore catalog & work ↓

• Link in Bio: https://sutrastudios.in
• Action Buttons: Email (concierge@sutrastudios.in), Message

• Highlights Structure:
1. Disciplines — 12-dot minimal icon. Story cards of the 12 services.
2. Projects — Architectural frame icon. High-res client deliverables.
3. Retainers — Calendar icon. 30-Day Growth Plan (₹9,999/mo).
4. Process — 4-step circle icon. Brief > Production > Review > High-res Delivery.
5. Inquiries — Chat bubble icon. Concierge contact and order placement.

===================================================================
3. WHATSAPP BUSINESS PROFILE SPECIFICATIONS & COPY
===================================================================
• Business Name: Sutra Studios
• Category: Professional Services / Advertising & Marketing
• Profile Photo: 1080 x 1080 px vector emblem.
• Cover Banner: 1024 x 576 px warm ivory canvas.
• Description (204 chars):
Sutra Studios is a creative and software-services atelier. We provide visual production, 3D modeling, web engineering, digital marketing, and dedicated monthly growth retainers for forward-thinking brands.

• Operating Hours: Mon-Sat: 09:30 AM - 07:00 PM IST. Sunday: Closed.
• Business Email: concierge@sutrastudios.in
• Website: https://sutrastudios.in

• Greeting Message (307 chars):
Welcome to Sutra Studios. Thank you for reaching out to our creative atelier. Whether you are seeking standalone visual deliverables or a dedicated monthly growth retainer, our executive team is here to assist you. Please share your project details or service of interest, and we will respond within two business hours.

• Away Message (263 chars):
Thank you for contacting Sutra Studios. Our studio atelier is currently closed. Our standard business hours are Monday to Saturday, 9:30 AM to 7:00 PM IST. We have received your inquiry and will review your project details first thing tomorrow morning.

• Quick Reply 1 (/services):
We offer 12 core creative and digital disciplines: Image Creation (from ₹499), Video Creation (from ₹1,499), 3D Modeling (from ₹2,499), 360 Views, Interior & Window Design, Digital Marketing, Meta Ads, and Custom Web & App Development. View our full catalog at: https://sutrastudios.in/services

• Quick Reply 2 (/retainer):
Our flagship 30-Day Growth Plan provides 1 image + 1 video delivered every day for ₹9,999/month, offering continuous production momentum for your brand. Review package details at: https://sutrastudios.in/pricing

• Quick Reply 3 (/quote):
To request a custom quote for web applications, enterprise branding, or multi-deliverable campaigns, please share: 1) Project Scope, 2) Target Timeline, and 3) Reference links. Our team will review and provide a detailed quotation.
`;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sutra-studios-brand-profile-guide.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#FAF9F5] text-[#171717] font-sans">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[#E5E1D8] px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/admin"
                className="p-2 rounded-xl bg-white border border-[#E5E1D8] text-[#5C3A1E] hover:bg-[#F3EFE6] transition-colors shadow-xs"
                title="Back to Admin Control Hub"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#171717] flex items-center justify-center text-[#EADFCB] shadow-sm">
                  <BookOpen className="w-5 h-5 text-[#A98B57]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#171717]">
                      Brand Profile Guide
                    </h1>
                    <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#EADFCB]/40 text-[#5C3A1E] rounded-md border border-[#D4C3A3]/50">
                      Stage 7 Standard
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#78716C]">
                    Standardized visual specs, verified bios, 9-post launch plans & messaging for Sutra Studios
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadFullGuide}
                className="text-xs font-semibold gap-1.5 border-[#E5E1D8] bg-white hover:bg-[#F3EFE6] text-[#171717]"
              >
                <Download className="w-3.5 h-3.5 text-[#A98B57]" />
                <span className="hidden sm:inline">Export Guide (.md)</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Sub-Header Policy & Guardrails Notice */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#EADFCB]/40 text-[#5C3A1E] shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-[#A98B57]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#171717] flex items-center gap-2">
                  <span>Manual Copy & Transfer Directives</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 bg-[#F3EFE6] text-[#78716C] rounded-full border border-[#E5E1D8]">
                    Zero API Overwrite
                  </span>
                </h4>
                <p className="text-xs text-[#78716C] mt-0.5 max-w-3xl leading-relaxed">
                  In accordance with studio governance and Meta Platform rules, profile bios, cover banners, and service catalogs must be updated manually via Meta Business Suite and WhatsApp Business Manager. No automated or third-party API mutations are dispatched without explicit admin approval.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <span className="text-xs font-semibold text-[#5C3A1E] px-3 py-1.5 rounded-xl bg-[#EADFCB]/30 border border-[#D4C3A3]/40 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F]" />
                <span>True Claims Only (No AI/Tech Terms)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5E1D8] no-scrollbar">
            <button
              onClick={() => setActiveSection("facebook")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                activeSection === "facebook"
                  ? "bg-[#171717] text-white shadow-xs"
                  : "bg-white text-[#78716C] border border-[#E5E1D8] hover:bg-[#F3EFE6] hover:text-[#171717]"
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook Page</span>
            </button>

            <button
              onClick={() => setActiveSection("instagram")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                activeSection === "instagram"
                  ? "bg-[#171717] text-white shadow-xs"
                  : "bg-white text-[#78716C] border border-[#E5E1D8] hover:bg-[#F3EFE6] hover:text-[#171717]"
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Instagram Profile</span>
            </button>

            <button
              onClick={() => setActiveSection("whatsapp")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                activeSection === "whatsapp"
                  ? "bg-[#171717] text-white shadow-xs"
                  : "bg-white text-[#78716C] border border-[#E5E1D8] hover:bg-[#F3EFE6] hover:text-[#171717]"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Business</span>
            </button>

            <button
              onClick={() => setActiveSection("benchmarks")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                activeSection === "benchmarks"
                  ? "bg-[#171717] text-white shadow-xs"
                  : "bg-white text-[#78716C] border border-[#E5E1D8] hover:bg-[#F3EFE6] hover:text-[#171717]"
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#A98B57]" />
              <span>Top 10 Benchmark Research</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* ========================================================================= */}
          {/* 1. FACEBOOK PAGE SECTION */}
          {/* ========================================================================= */}
          {activeSection === "facebook" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Overview & Quick Spec Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#171717]">
                        Facebook Page Metadata & Structure
                      </h3>
                      <p className="text-xs text-[#78716C]">
                        Configuration for Meta Business Suite & Facebook Professional Dashboard
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EADFCB]/30 text-[#5C3A1E] border border-[#D4C3A3]/40">
                      Standard Identity
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldDisplay
                      label="Page Name"
                      value="Sutra Studios"
                      helper="Official studio legal & brand name"
                      id="fb-name"
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                    />
                    <FieldDisplay
                      label="Vanity Username"
                      value="@sutrastudios.in"
                      helper="Facebook custom URL handle"
                      id="fb-username"
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                    />
                    <FieldDisplay
                      label="Primary Category"
                      value="Marketing Agency"
                      helper="High-relevance Meta search category"
                      id="fb-cat1"
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                    />
                    <FieldDisplay
                      label="Secondary Categories"
                      value="Design & Fashion, Software Company"
                      helper="Multi-discipline discovery tags"
                      id="fb-cat2"
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                    />
                  </div>

                  {/* Short Bio Block */}
                  <div className="space-y-1.5 pt-2 border-t border-[#E5E1D8]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#171717]">
                        Short Bio (Page Header Intro)
                      </label>
                      <span className="text-[11px] font-mono text-[#2E7D4F] font-medium bg-[#E8F5E9] px-2 py-0.5 rounded-md">
                        93 / 101 chars
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] flex items-center justify-between gap-4">
                      <p className="text-xs text-[#171717] font-medium leading-relaxed">
                        Creative & digital atelier delivering visual production, software engineering & brand growth.
                      </p>
                      <CopyButton
                        text="Creative & digital atelier delivering visual production, software engineering & brand growth."
                        id="fb-short-bio"
                        copiedId={copiedId}
                        onCopy={copyToClipboard}
                      />
                    </div>
                  </div>

                  {/* Long About Description Block */}
                  <div className="space-y-1.5 pt-2 border-t border-[#E5E1D8]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#171717]">
                        About / Studio Story (Long Description)
                      </label>
                      <span className="text-[11px] font-mono text-[#2E7D4F] font-medium bg-[#E8F5E9] px-2 py-0.5 rounded-md">
                        712 chars (True claims only)
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-3">
                      <p className="text-xs text-[#171717] leading-relaxed whitespace-pre-line">
                        {`Sutra Studios is a full-spectrum creative technology and digital production atelier. We partner with emerging and established brands to build distinctive visual identities, high-impact digital marketing campaigns, and bespoke software solutions.\n\nOur 12 integrated creative disciplines include Image Creation, Video Production, 3D Architectural Modeling, 360 Interactive Views, Window & Spatial Design, Digital Marketing, Meta Ads Management, Website Development, Web Applications, and Mobile App Setups.\n\nWe offer transparent single-deliverable pricing starting from ₹499 alongside our flagship 30-Day Growth Plan for brands requiring daily production momentum. Connect with our studio team to discuss your next project.`}
                      </p>
                      <div className="flex justify-end pt-1">
                        <CopyButton
                          text={`Sutra Studios is a full-spectrum creative technology and digital production atelier. We partner with emerging and established brands to build distinctive visual identities, high-impact digital marketing campaigns, and bespoke software solutions.\n\nOur 12 integrated creative disciplines include Image Creation, Video Production, 3D Architectural Modeling, 360 Interactive Views, Window & Spatial Design, Digital Marketing, Meta Ads Management, Website Development, Web Applications, and Mobile App Setups.\n\nWe offer transparent single-deliverable pricing starting from ₹499 alongside our flagship 30-Day Growth Plan for brands requiring daily production momentum. Connect with our studio team to discuss your next project.`}
                          id="fb-long-about"
                          copiedId={copiedId}
                          onCopy={copyToClipboard}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Asset Specifications & CTA Setup */}
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-4">
                    <h4 className="font-serif text-base font-bold text-[#171717] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#A98B57]" />
                      <span>Visual Asset Specs</span>
                    </h4>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8]">
                        <span className="font-semibold text-[#5C3A1E] block mb-1">
                          Profile Photo (DP)
                        </span>
                        <ul className="space-y-1 text-[#78716C] list-disc list-inside">
                          <li>Dimensions: 1080 × 1080 px (1:1)</li>
                          <li>Safe Area: 800 × 800 px circular crop</li>
                          <li>Style: Dark charcoal emblem on ivory</li>
                          <li>Format: PNG (high contrast, crisp edges)</li>
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8]">
                        <span className="font-semibold text-[#5C3A1E] block mb-1">
                          Cover Photo Banner
                        </span>
                        <ul className="space-y-1 text-[#78716C] list-disc list-inside">
                          <li>Desktop Display: 820 × 312 px</li>
                          <li>Mobile Display: 640 × 360 px</li>
                          <li>Upload Size: 1640 × 624 px (Retina 2x)</li>
                          <li>Central Safe Zone: Keep text within central 640 × 312 px</li>
                          <li>Style: Warm ivory atelier aesthetic with headline</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-4">
                    <h4 className="font-serif text-base font-bold text-[#171717] flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-[#A98B57]" />
                      <span>Links & Action Button</span>
                    </h4>

                    <div className="space-y-3 text-xs">
                      <FieldDisplay
                        label="Action Button (CTA)"
                        value="Contact Us (or Send WhatsApp Message)"
                        helper="Action button configured on Page header"
                        id="fb-cta-btn"
                        copiedId={copiedId}
                        onCopy={copyToClipboard}
                      />
                      <FieldDisplay
                        label="Website Destination"
                        value="https://sutrastudios.in"
                        helper="Official canonical website"
                        id="fb-web-dest"
                        copiedId={copiedId}
                        onCopy={copyToClipboard}
                      />
                      <FieldDisplay
                        label="Studio Concierge Email"
                        value="concierge@sutrastudios.in"
                        helper="Direct inbox for client briefs"
                        id="fb-email-dest"
                        copiedId={copiedId}
                        onCopy={copyToClipboard}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Automated Customer Messaging (Instant Reply & Away) */}
              <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#171717]">
                      Facebook Messenger Automated Greetings
                    </h3>
                    <p className="text-xs text-[#78716C]">
                      Meta Business Suite automated response scripts for client inquiries
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EADFCB]/30 text-[#5C3A1E] border border-[#D4C3A3]/40">
                    2-Hour SLA Tone
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Instant Reply */}
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#171717] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#A98B57]" />
                        <span>Instant Reply (First Contact)</span>
                      </span>
                      <span className="text-[11px] font-mono text-[#2E7D4F] bg-[#E8F5E9] px-2 py-0.5 rounded-md">
                        263 chars
                      </span>
                    </div>
                    <p className="text-xs text-[#171717] leading-relaxed">
                      Hello and welcome to Sutra Studios. Thank you for contacting our creative atelier. We have received your message and our studio team will review your inquiry within two business hours. You can also explore our full service catalog and pricing at sutrastudios.in.
                    </p>
                    <div className="flex justify-end pt-1">
                      <CopyButton
                        text="Hello and welcome to Sutra Studios. Thank you for contacting our creative atelier. We have received your message and our studio team will review your inquiry within two business hours. You can also explore our full service catalog and pricing at sutrastudios.in."
                        id="fb-instant-reply"
                        copiedId={copiedId}
                        onCopy={copyToClipboard}
                      />
                    </div>
                  </div>

                  {/* Away Message */}
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#171717] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#5C3A1E]" />
                        <span>Away Message (Outside Hours)</span>
                      </span>
                      <span className="text-[11px] font-mono text-[#2E7D4F] bg-[#E8F5E9] px-2 py-0.5 rounded-md">
                        222 chars
                      </span>
                    </div>
                    <p className="text-xs text-[#171717] leading-relaxed">
                      Thank you for reaching out to Sutra Studios. Our atelier is currently closed. Studio hours are Monday to Saturday, 9:30 AM to 7:00 PM IST. We will respond promptly as soon as our production team resumes tomorrow morning.
                    </p>
                    <div className="flex justify-end pt-1">
                      <CopyButton
                        text="Thank you for reaching out to Sutra Studios. Our atelier is currently closed. Studio hours are Monday to Saturday, 9:30 AM to 7:00 PM IST. We will respond promptly as soon as our production team resumes tomorrow morning."
                        id="fb-away-msg"
                        copiedId={copiedId}
                        onCopy={copyToClipboard}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* First 9 Posts Plan for Facebook */}
              <PostsPlanSection
                platform="Facebook"
                posts={FACEBOOK_LAUNCH_POSTS}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. INSTAGRAM PROFILE SECTION */}
          {/* ========================================================================= */}
          {activeSection === "instagram" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Instagram Profile Settings Card */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#171717]">
                        Instagram Bio & Profile Configuration
                      </h3>
                      <p className="text-xs text-[#78716C]">
                        Strict 150-character limit compliance with high-conversion aesthetic layout
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EADFCB]/30 text-[#5C3A1E] border border-[#D4C3A3]/40">
                      150-Char Validated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldDisplay
                      label="Name Field"
                      value="Sutra Studios | Creative Atelier"
                      helper="Max 64 characters (Searchable title)"
                      id="ig-name"
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                    />
                    <FieldDisplay
                      label="Username Handle"
                      value="sutrastudios.in"
                      helper="Official verified handle"
                      id="ig-username"
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                    />
                    <FieldDisplay
                      label="Category Selection"
                      value="Marketing Agency"
                      helper="Displays under name banner"
                      id="ig-category"
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                    />
                    <FieldDisplay
                      label="Link in Bio"
                      value="https://sutrastudios.in"
                      helper="Direct canonical website link"
                      id="ig-link"
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                    />
                  </div>

                  {/* Ready-to-Copy Bio Block with Live Character Counter */}
                  <div className="space-y-2 pt-2 border-t border-[#E5E1D8]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#171717] flex items-center gap-2">
                        <span>Optimized Instagram Bio Text</span>
                        <span className="text-[10px] text-[#78716C] font-normal">
                          (Clean 4-line layout, zero AI jargon)
                        </span>
                      </label>
                      <span className="text-[11px] font-mono text-[#2E7D4F] font-semibold bg-[#E8F5E9] px-2.5 py-0.5 rounded-md border border-[#C8E6C9]">
                        144 / 150 characters (Exact fit)
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-3">
                      <pre className="font-sans text-xs text-[#171717] leading-relaxed whitespace-pre font-medium">
{`Creative & digital studio atelier.
Visual production, custom software & brand growth.
✦ 12 disciplines in one studio
Explore catalog & work ↓`}
                      </pre>
                      <div className="flex items-center justify-between pt-2 border-t border-[#E5E1D8]">
                        <span className="text-[11px] text-[#78716C]">
                          Line breaks accounted for in character count
                        </span>
                        <CopyButton
                          text={`Creative & digital studio atelier.\nVisual production, custom software & brand growth.\n✦ 12 disciplines in one studio\nExplore catalog & work ↓`}
                          id="ig-bio-text"
                          copiedId={copiedId}
                          onCopy={copyToClipboard}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Native Action Buttons */}
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-2">
                    <span className="text-xs font-semibold text-[#171717] block">
                      Native Action Buttons Setup
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-[#E5E1D8]">
                        <span className="text-[#5C3A1E] font-medium block">Button 1: Email</span>
                        <span className="text-[#78716C]">concierge@sutrastudios.in</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-[#E5E1D8]">
                        <span className="text-[#5C3A1E] font-medium block">Button 2: Message</span>
                        <span className="text-[#78716C]">Direct Instagram Messaging</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Mockup Preview Card */}
                <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-3">
                    <span className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#A98B57]" />
                      <span>Live Profile Mockup</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#78716C]">
                      Mobile 375px
                    </span>
                  </div>

                  {/* Simulated Instagram Header */}
                  <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] space-y-3 font-sans text-xs">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#171717] border-2 border-[#D4A35A] flex items-center justify-center text-[#EADFCB] shrink-0 shadow-xs">
                        <LotusSymbol className="w-9 h-9" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="font-bold text-[#171717] text-sm">sutrastudios.in</div>
                        <div className="flex gap-4 text-[11px] text-[#78716C]">
                          <div><span className="font-bold text-[#171717]">9</span> posts</div>
                          <div><span className="font-bold text-[#171717]">1.2k</span> followers</div>
                          <div><span className="font-bold text-[#171717]">48</span> following</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-0.5 text-xs text-[#171717] pt-1">
                      <div className="font-bold">Sutra Studios | Creative Atelier</div>
                      <div className="text-[11px] text-[#78716C]">Marketing Agency</div>
                      <div className="text-xs leading-relaxed pt-1">
                        Creative & digital studio atelier.<br />
                        Visual production, custom software & brand growth.<br />
                        ✦ 12 disciplines in one studio<br />
                        Explore catalog & work ↓
                      </div>
                      <div className="text-xs text-[#5C3A1E] font-semibold pt-1 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 text-[#A98B57]" />
                        <span>sutrastudios.in</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="py-1.5 rounded-lg bg-[#EADFCB]/40 text-center font-semibold text-[11px] text-[#171717]">
                        Contact
                      </div>
                      <div className="py-1.5 rounded-lg bg-[#FAF9F5] border border-[#E5E1D8] text-center font-semibold text-[11px] text-[#171717]">
                        Message
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5 Curated Story Highlights Structure */}
              <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#171717]">
                      5 Curated Story Highlights Structure
                    </h3>
                    <p className="text-xs text-[#78716C]">
                      Permanent story reels establishing credibility, catalog scope, and frictionless client onboarding
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EADFCB]/30 text-[#5C3A1E] border border-[#D4C3A3]/40">
                    5 Story Categories
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {INSTAGRAM_HIGHLIGHTS.map((hl) => (
                    <div
                      key={hl.title}
                      className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-full bg-white border border-[#E5E1D8] flex items-center justify-center text-[#5C3A1E] shadow-2xs mx-auto">
                          {hl.icon}
                        </div>
                        <h4 className="text-center font-serif text-xs font-bold text-[#171717]">
                          {hl.title}
                        </h4>
                        <p className="text-[11px] text-[#78716C] leading-relaxed text-center">
                          {hl.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#E5E1D8]/60 text-[10px] text-[#5C3A1E] font-medium space-y-1">
                        <div><span className="font-bold">Cover:</span> {hl.coverBrief}</div>
                        <div><span className="font-bold">Frames:</span> {hl.frameCount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* First 9 Posts Plan for Instagram */}
              <PostsPlanSection
                platform="Instagram"
                posts={INSTAGRAM_LAUNCH_POSTS}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. WHATSAPP BUSINESS SECTION */}
          {/* ========================================================================= */}
          {activeSection === "whatsapp" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Specs Card */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#171717]">
                        WhatsApp Business Profile Settings
                      </h3>
                      <p className="text-xs text-[#78716C]">
                        Direct client concierge profile text, verified operating hours & descriptions
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#2E7D4F] border border-[#C8E6C9]">
                      Concierge Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldDisplay
                      label="Business Name"
                      value="Sutra Studios"
                      helper="Official display name"
                      id="wa-name"
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                    />
                    <FieldDisplay
                      label="Category"
                      value="Professional Services"
                      helper="Alternate: Advertising & Marketing"
                      id="wa-cat"
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                    />
                    <FieldDisplay
                      label="Studio Operating Hours"
                      value="Mon - Sat: 09:30 AM - 07:00 PM IST"
                      helper="Sunday: Closed (Inquiries queued)"
                      id="wa-hours"
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                    />
                    <FieldDisplay
                      label="Official Email"
                      value="concierge@sutrastudios.in"
                      helper="Business contact email"
                      id="wa-email"
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                    />
                    <FieldDisplay
                      label="Website Link"
                      value="https://sutrastudios.in"
                      helper="Catalog & order portal"
                      id="wa-link"
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                    />
                    <FieldDisplay
                      label="WhatsApp Click-to-Chat Link"
                      value="https://wa.me/918200192781?text=Hello%20Sutra%20Studios%2C%20I%20would%20like%20to%20discuss%20a%20project."
                      helper="Embed on website and email signatures"
                      id="wa-chat-link"
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                    />
                  </div>

                  {/* Ready Description Block */}
                  <div className="space-y-1.5 pt-2 border-t border-[#E5E1D8]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#171717]">
                        Business Description (Max 512 chars)
                      </label>
                      <span className="text-[11px] font-mono text-[#2E7D4F] font-semibold bg-[#E8F5E9] px-2 py-0.5 rounded-md">
                        204 / 512 chars
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-3">
                      <p className="text-xs text-[#171717] leading-relaxed">
                        Sutra Studios is a creative and software-services atelier. We provide visual production, 3D modeling, web engineering, digital marketing, and dedicated monthly growth retainers for forward-thinking brands.
                      </p>
                      <div className="flex justify-end pt-1">
                        <CopyButton
                          text="Sutra Studios is a creative and software-services atelier. We provide visual production, 3D modeling, web engineering, digital marketing, and dedicated monthly growth retainers for forward-thinking brands."
                          id="wa-desc"
                          copiedId={copiedId}
                          onCopy={copyToClipboard}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* DP & Cover Banner Specs */}
                <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-4">
                  <h4 className="font-serif text-base font-bold text-[#171717] flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#25D366]" />
                    <span>WhatsApp Visual Specs</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8]">
                      <span className="font-semibold text-[#5C3A1E] block mb-1">
                        Profile Image (DP)
                      </span>
                      <ul className="space-y-1 text-[#78716C] list-disc list-inside">
                        <li>Size: 1080 × 1080 px (1:1)</li>
                        <li>Safe Margin: 25% outer padding</li>
                        <li>Style: High contrast Sutra emblem</li>
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8]">
                      <span className="font-semibold text-[#5C3A1E] block mb-1">
                        Cover Photo Banner
                      </span>
                      <ul className="space-y-1 text-[#78716C] list-disc list-inside">
                        <li>Aspect Ratio: 16:9</li>
                        <li>Dimensions: 1024 × 576 px</li>
                        <li>Upload: PNG / JPG, max 5 MB</li>
                        <li>Style: Warm ivory atelier aesthetic</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Automated Greeting & Away Messages */}
              <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#171717]">
                      WhatsApp Business Auto-Responses
                    </h3>
                    <p className="text-xs text-[#78716C]">
                      Automated greeting, away notices & quick reply templates ready for WhatsApp Business app
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#2E7D4F] border border-[#C8E6C9]">
                    Auto-Responder Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Greeting Message */}
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#171717] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>Greeting Message (New Conversations)</span>
                      </span>
                      <span className="text-[11px] font-mono text-[#2E7D4F] bg-[#E8F5E9] px-2 py-0.5 rounded-md">
                        307 chars
                      </span>
                    </div>
                    <p className="text-xs text-[#171717] leading-relaxed">
                      Welcome to Sutra Studios. Thank you for reaching out to our creative atelier. Whether you are seeking standalone visual deliverables or a dedicated monthly growth retainer, our executive team is here to assist you. Please share your project details or service of interest, and we will respond within two business hours.
                    </p>
                    <div className="flex justify-end pt-1">
                      <CopyButton
                        text="Welcome to Sutra Studios. Thank you for reaching out to our creative atelier. Whether you are seeking standalone visual deliverables or a dedicated monthly growth retainer, our executive team is here to assist you. Please share your project details or service of interest, and we will respond within two business hours."
                        id="wa-greeting"
                        copiedId={copiedId}
                        onCopy={copyToClipboard}
                      />
                    </div>
                  </div>

                  {/* Away Message */}
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#171717] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#5C3A1E]" />
                        <span>Away Message (After Studio Hours)</span>
                      </span>
                      <span className="text-[11px] font-mono text-[#2E7D4F] bg-[#E8F5E9] px-2 py-0.5 rounded-md">
                        263 chars
                      </span>
                    </div>
                    <p className="text-xs text-[#171717] leading-relaxed">
                      Thank you for contacting Sutra Studios. Our studio atelier is currently closed. Our standard business hours are Monday to Saturday, 9:30 AM to 7:00 PM IST. We have received your inquiry and will review your project details first thing tomorrow morning.
                    </p>
                    <div className="flex justify-end pt-1">
                      <CopyButton
                        text="Thank you for contacting Sutra Studios. Our studio atelier is currently closed. Our standard business hours are Monday to Saturday, 9:30 AM to 7:00 PM IST. We have received your inquiry and will review your project details first thing tomorrow morning."
                        id="wa-away"
                        copiedId={copiedId}
                        onCopy={copyToClipboard}
                      />
                    </div>
                  </div>
                </div>

                {/* 3 WhatsApp Quick Replies */}
                <div className="space-y-3 pt-3 border-t border-[#E5E1D8]">
                  <h4 className="text-xs font-semibold text-[#171717]">
                    WhatsApp Quick Replies (Keyboard Shortcuts)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {WHATSAPP_QUICK_REPLIES.map((qr) => (
                      <div
                        key={qr.shortcut}
                        className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded-md bg-[#171717] text-[#FAF9F5] font-mono text-[11px] font-bold inline-block">
                            {qr.shortcut}
                          </span>
                          <p className="text-xs text-[#171717] leading-relaxed pt-1">
                            {qr.text}
                          </p>
                        </div>
                        <div className="flex justify-end pt-1">
                          <CopyButton
                            text={qr.text}
                            id={`wa-qr-${qr.shortcut}`}
                            copiedId={copiedId}
                            onCopy={copyToClipboard}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* WhatsApp Catalog of 12 Services */}
              <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#171717]">
                      WhatsApp Business Catalog (All 12 Disciplines)
                    </h3>
                    <p className="text-xs text-[#78716C]">
                      Pre-written items ready to copy into WhatsApp Business Catalog manager
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EADFCB]/30 text-[#5C3A1E] border border-[#D4C3A3]/40">
                    12 Items + Retainer
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {WHATSAPP_CATALOG_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-serif text-xs font-bold text-[#171717]">
                            {item.name}
                          </h4>
                          <span className="text-xs font-semibold text-[#5C3A1E] shrink-0 font-mono">
                            {item.price}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#78716C] leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#E5E1D8] flex items-center justify-between gap-2">
                        <span className="text-[10px] text-[#A98B57] font-mono truncate">
                          {item.link}
                        </span>
                        <CopyButton
                          text={`Item: ${item.name}\nPrice: ${item.price}\nDescription: ${item.description}\nLink: ${item.link}`}
                          id={`cat-${item.id}`}
                          copiedId={copiedId}
                          onCopy={copyToClipboard}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. BENCHMARK RESEARCH & BEST PRACTICES */}
          {/* ========================================================================= */}
          {activeSection === "benchmarks" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#171717]">
                      Top 10 Global Creative & Software Agencies — Public Audit
                    </h3>
                    <p className="text-xs text-[#78716C]">
                      Competitive analysis of industry leaders across Meta, Instagram & Web channels
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EADFCB]/30 text-[#5C3A1E] border border-[#D4C3A3]/40">
                    10 Leading Studios Audited
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {TOP_10_AGENCIES.map((agency) => (
                    <div
                      key={agency.name}
                      className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-2">
                        <div>
                          <h4 className="font-serif text-sm font-bold text-[#171717]">
                            {agency.name}
                          </h4>
                          <span className="text-[11px] text-[#A98B57] font-medium">
                            {agency.category} • {agency.website}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#78716C] block">DP Style:</span>
                          <span className="text-[#171717] text-[11px]">{agency.dpStyle}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#78716C] block">Bio Length:</span>
                          <span className="text-[#171717] text-[11px]">{agency.bioLength}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] uppercase font-bold text-[#78716C] block">Highlights / Menus:</span>
                          <span className="text-[#171717] text-[11px]">{agency.highlights}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] uppercase font-bold text-[#78716C] block">Posting Style:</span>
                          <span className="text-[#171717] text-[11px]">{agency.postingStyle}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Practice Takeaways Card */}
              <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-xs space-y-4">
                <h4 className="font-serif text-base font-bold text-[#171717] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#A98B57]" />
                  <span>Synthesized Best Practices Adopted for Sutra Studios</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#171717]">
                  <div className="p-4 rounded-2xl bg-white border border-[#E5E1D8] space-y-1.5">
                    <span className="font-bold text-[#5C3A1E] block">1. Minimal Vector Anchor</span>
                    <p className="text-[#78716C] leading-relaxed">
                      Zero clutter or photography in the avatar. High-contrast geometric emblem centered with 25% outer padding for flawless circular cropping.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-[#E5E1D8] space-y-1.5">
                    <span className="font-bold text-[#5C3A1E] block">2. 140-148 Char Bio Discipline</span>
                    <p className="text-[#78716C] leading-relaxed">
                      Strict 3-4 line structure: (1) Purpose, (2) Core capabilities, (3) Scope proof point, (4) Direct arrow CTA. Zero keyword stuffing or spam emojis.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-[#E5E1D8] space-y-1.5">
                    <span className="font-bold text-[#5C3A1E] block">3. 3-Post Grid Anchor</span>
                    <p className="text-[#78716C] leading-relaxed">
                      Pinned posts establish (1) Studio Manifesto, (2) 12 Disciplines Catalog, and (3) 30-Day Growth Retainer with instant inquiry pathways.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </RouteGuard>
  );
}

// -----------------------------------------------------------------------------
// HELPER UI COMPONENTS
// -----------------------------------------------------------------------------

function CopyButton({
  text,
  id,
  copiedId,
  onCopy,
}: {
  text: string;
  id: string;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  const isCopied = copiedId === id;
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onCopy(text, id)}
      className={`h-8 px-2.5 text-xs font-semibold gap-1.5 transition-all shadow-2xs ${
        isCopied
          ? "bg-[#2E7D4F] text-white border-[#2E7D4F]"
          : "bg-white text-[#171717] border-[#E5E1D8] hover:bg-[#F3EFE6]"
      }`}
    >
      {isCopied ? (
        <>
          <Check className="w-3.5 h-3.5 text-white" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-[#A98B57]" />
          <span>Copy</span>
        </>
      )}
    </Button>
  );
}

function FieldDisplay({
  label,
  value,
  helper,
  id,
  copiedId,
  onCopy,
}: {
  label: string;
  value: string;
  helper?: string;
  id: string;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  return (
    <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] flex items-center justify-between gap-3">
      <div className="space-y-0.5 overflow-hidden">
        <span className="text-[11px] font-semibold text-[#78716C] block uppercase tracking-wider">
          {label}
        </span>
        <span className="text-xs font-bold text-[#171717] block truncate">
          {value}
        </span>
        {helper && (
          <span className="text-[10px] text-[#A98B57] block truncate">
            {helper}
          </span>
        )}
      </div>
      <CopyButton text={value} id={id} copiedId={copiedId} onCopy={onCopy} />
    </div>
  );
}

function PostsPlanSection({
  platform,
  posts,
  copiedId,
  onCopy,
}: {
  platform: string;
  posts: Array<{
    position: number;
    title: string;
    format: string;
    visualBrief: string;
    caption: string;
    hashtags: string;
  }>;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  return (
    <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#171717]">
            First 9 Posts Plan ({platform} Launch Grid)
          </h3>
          <p className="text-xs text-[#78716C]">
            Foundational 3×3 profile launch cadence establishing authority, discipline scope & retainers
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EADFCB]/30 text-[#5C3A1E] border border-[#D4C3A3]/40">
          3×3 Grid Complete
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {posts.map((post) => {
          const fullText = `${post.caption}\n\n${post.hashtags}`;
          return (
            <div
              key={post.position}
              className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-[#171717] text-[#FAF9F5] text-[11px] font-bold flex items-center justify-center font-mono">
                    #{post.position}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#5C3A1E] bg-[#EADFCB]/40 px-2 py-0.5 rounded-md border border-[#D4C3A3]/40">
                    {post.format}
                  </span>
                </div>

                <h4 className="font-serif text-xs font-bold text-[#171717]">
                  {post.title}
                </h4>

                <div className="p-2.5 rounded-xl bg-white border border-[#E5E1D8] text-[11px] text-[#78716C] space-y-1">
                  <span className="font-semibold text-[#5C3A1E] block text-[10px] uppercase">
                    Visual Brief:
                  </span>
                  <p className="leading-relaxed">{post.visualBrief}</p>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="font-semibold text-[#171717] block text-[10px] uppercase tracking-wider">
                    Ready Caption:
                  </span>
                  <p className="text-xs text-[#171717] leading-relaxed line-clamp-4">
                    {post.caption}
                  </p>
                  <p className="text-[10px] text-[#A98B57] font-mono truncate">
                    {post.hashtags}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5E1D8] flex items-center justify-between">
                <span className="text-[10px] text-[#78716C]">
                  Includes hashtags
                </span>
                <CopyButton
                  text={fullText}
                  id={`post-${platform}-${post.position}`}
                  copiedId={copiedId}
                  onCopy={onCopy}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// CONSTANTS & READY TEXT DATA
// -----------------------------------------------------------------------------

const INSTAGRAM_HIGHLIGHTS = [
  {
    title: "01 Disciplines",
    icon: <Grid3X3 className="w-5 h-5" />,
    description: "Visual breakdown of all 12 creative & software disciplines with starting rates.",
    coverBrief: "Minimalist 12-dot geometric grid in dark charcoal on warm ivory.",
    frameCount: "12 Story Frames",
  },
  {
    title: "02 Projects",
    icon: <Layers className="w-5 h-5" />,
    description: "Featured client deliverables across perfume, architectural 3D & web apps.",
    coverBrief: "Architectural frame icon in muted brass on warm ivory.",
    frameCount: "8 Story Frames",
  },
  {
    title: "03 Retainers",
    icon: <Clock className="w-5 h-5" />,
    description: "Details on the 30-Day Growth Plan (1 image + 1 video daily for ₹9,999/mo).",
    coverBrief: "Calendar ring icon with daily pulse marker.",
    frameCount: "5 Story Frames",
  },
  {
    title: "04 Process",
    icon: <ListOrdered className="w-5 h-5" />,
    description: "Our transparent 4-stage studio lifecycle: Brief > Production > Review > Delivery.",
    coverBrief: "Sequential 4-circle flow diagram.",
    frameCount: "4 Story Frames",
  },
  {
    title: "05 Inquiries",
    icon: <MessageSquare className="w-5 h-5" />,
    description: "How to connect with our concierge team and start an order on sutrastudios.in.",
    coverBrief: "Clean studio lotus glyph on ivory background.",
    frameCount: "3 Story Frames",
  },
];

const INSTAGRAM_LAUNCH_POSTS = [
  {
    position: 1,
    title: "The Studio Manifesto",
    format: "Carousel (4 Slides)",
    visualBrief: "Slide 1: Ivory typographic cover 'Where Creative Vision Meets Digital Craft'. Slides 2-4: The Sutra design philosophy and production standards.",
    caption: "At Sutra Studios, we believe exceptional brands deserve uncompromising craft. From brand identity and cinematic video to enterprise web software, we unify 12 disciplines under one dedicated atelier roof.\n\nExplore our service catalog and collaborative retainers via the link in bio.",
    hashtags: "#SutraStudios #CreativeStudio #BrandDesign #DigitalAgency #DesignAtelier",
  },
  {
    position: 2,
    title: "The 12 Core Disciplines",
    format: "Single Image (Infographic)",
    visualBrief: "Pristine ivory grid displaying the 12 core disciplines with transparent starting rates from ₹499 up to custom enterprise quotes.",
    caption: "Twelve disciplines. One cohesive production studio. Whether you require a single high-resolution product visual from ₹499 or end-to-end custom web engineering, Sutra Studios provides transparent pricing and dedicated delivery timelines.\n\nSwipe through our catalog on sutrastudios.in.",
    hashtags: "#DesignCatalog #CreativeServices #DigitalProduction #BrandIdentity #WebEngineering",
  },
  {
    position: 3,
    title: "Product & Commercial Visuals",
    format: "Carousel (5 Slides)",
    visualBrief: "High-end luxury perfume and commercial product photography showcasing light, material texture, and intentional framing.",
    caption: "Light, texture, and deliberate framing. Our image creation discipline crafts editorial product visuals designed to command attention across print, social, and digital campaigns.\n\nAvailable standalone from ₹499 or as part of our monthly creative retainers.",
    hashtags: "#ProductDesign #CommercialVisuals #StudioPhotography #BrandAesthetics #VisualDirection",
  },
  {
    position: 4,
    title: "Cinematic Video Creation",
    format: "Reel (9:16 Video)",
    visualBrief: "Dynamic 15-second montage of motion design, product reveals, and campaign teasers with bespoke ambient sound design.",
    caption: "Cinematic motion engineered for modern attention spans. From social campaign reels to architectural walk-throughs, we produce broadcast-ready video tailored to your brand voice.\n\nDiscover video production solutions starting at ₹1,499 on our website.",
    hashtags: "#VideoProduction #MotionDesign #CinematicVideo #SocialReels #CreativeDirection",
  },
  {
    position: 5,
    title: "Spatial & 3D Modeling",
    format: "Carousel (3 Slides)",
    visualBrief: "Precision 3D models and 360 interactive space captures for luxury interiors, villas, and architectural retail environments.",
    caption: "Transforming physical spaces into immersive digital experiences. Our 3D modeling and 360 virtual tour disciplines enable architectural firms and luxury brands to showcase spatial environments with unmatched clarity.\n\nExplore spatial design services at sutrastudios.in.",
    hashtags: "#3DModeling #ArchitecturalDesign #SpatialDesign #VirtualTour #InteriorArchitecture",
  },
  {
    position: 6,
    title: "Custom Web & Software Craft",
    format: "Carousel (4 Slides)",
    visualBrief: "Responsive interface mockups showing full-stack web applications, client dashboards, and e-commerce setups with smooth transitions.",
    caption: "Software designed for performance and scale. We build bespoke websites, responsive web apps, and mobile setups that deliver seamless user experiences and measurable business outcomes.\n\nWebsite development starting at ₹7,999. Inquire today via link in bio.",
    hashtags: "#WebDevelopment #SoftwareEngineering #UIUXDesign #FrontendDevelopment #FullStack",
  },
  {
    position: 7,
    title: "The 30-Day Growth Plan",
    format: "Carousel (3 Slides)",
    visualBrief: "Minimalist breakdown of the 30-Day Growth Retainer: 1 image + 1 video delivered every day, ₹9,999/month, dedicated production queue.",
    caption: "Consistent brand momentum without the overhead of multiple agencies. The Sutra Studios 30-Day Growth Plan delivers 1 high-resolution image and 1 video asset every single day for ₹9,999/month.\n\nSecure your studio production slot at sutrastudios.in/pricing.",
    hashtags: "#GrowthPlan #CreativeRetainer #MarketingStrategy #BrandMomentum #ContentProduction",
  },
  {
    position: 8,
    title: "Meta Ads & Digital Growth",
    format: "Single Image",
    visualBrief: "High-impact ad layout breakdown showing 1:1, 4:5, and 9:16 creative variations alongside clear CTA structures.",
    caption: "Creative that performs. Our Meta Ads Launcher and digital marketing disciplines pair high-converting visual assets with structured audience frameworks to maximize campaign return.\n\nInquire about our marketing management packages via the link in bio.",
    hashtags: "#MetaAds #PerformanceMarketing #DigitalAdvertising #CreativeStrategy #CampaignManagement",
  },
  {
    position: 9,
    title: "Starting Your Project",
    format: "Carousel (3 Slides)",
    visualBrief: "The 4-step onboarding flow: Select discipline > Submit brief > Studio production > Direct delivery.",
    caption: "Ready to elevate your digital presence? Starting a project with Sutra Studios is effortless. Select from our 12 standalone disciplines or join a monthly retainer with zero hidden fees and transparent milestones.\n\nVisit sutrastudios.in to connect with our concierge team.",
    hashtags: "#SutraStudios #CreativeAgency #DigitalAtelier #ClientExperience #StartAProject",
  },
];

const FACEBOOK_LAUNCH_POSTS = [
  {
    position: 1,
    title: "Welcome to Sutra Studios",
    format: "Image & Brand Narrative",
    visualBrief: "Editorial studio branding banner on warm ivory texture with Sutra geometric emblem.",
    caption: "Welcome to Sutra Studios. We are a creative and software-services atelier dedicated to crafting distinctive visual identities, commercial digital marketing, and bespoke software solutions.\n\nExplore our service catalog at sutrastudios.in.",
    hashtags: "#SutraStudios #CreativeAtelier #DigitalAgency #BrandDevelopment",
  },
  {
    position: 2,
    title: "Comprehensive 12-Service Catalog",
    format: "Multi-Image Carousel",
    visualBrief: "Cards displaying the 12 core disciplines: Image, Video, 3D, 360, Interiors, Windows, Digital Marketing, Meta Ads, Web, Web Apps, Mobile, and Automation.",
    caption: "From single high-resolution visuals to complete software platforms, discover our 12 creative and digital disciplines with fixed starting prices and dedicated turnaround times.\n\nReview services at sutrastudios.in/services.",
    hashtags: "#CreativeCatalog #DesignServices #WebDevelopment #CommercialVisuals",
  },
  {
    position: 3,
    title: "The 30-Day Growth Retainer",
    format: "Infographic Card",
    visualBrief: "Retainer tier breakdown: 1 image + 1 video daily, ₹9,999/month, direct revision queue.",
    caption: "Fuel your brand's daily content cadence. Our 30-Day Growth Plan delivers 1 high-resolution image and 1 video asset every single day for ₹9,999/month.\n\nInquire today via Messenger or visit sutrastudios.in/pricing.",
    hashtags: "#MarketingRetainer #BrandGrowth #DailyDeliverables #SutraStudios",
  },
  {
    position: 4,
    title: "Architectural 3D & 360 Virtual Views",
    format: "Photo Carousel",
    visualBrief: "Photorealistic 3D interior renderings and interactive 360 spatial previews.",
    caption: "Bringing architectural spaces to life with precision 3D modeling and immersive 360 virtual views. Perfect for real estate developers, interior designers, and luxury retail.\n\nExplore our spatial design portfolio on sutrastudios.in.",
    hashtags: "#3DVisualization #InteriorDesign #VirtualTours #ArchitecturalRendering",
  },
  {
    position: 5,
    title: "Performance Meta Ads Management",
    format: "Single Image Card",
    visualBrief: "Ad creative layout across 1:1, 4:5 and 9:16 aspect ratios.",
    caption: "Drive measurable engagement with targeted Meta advertising campaigns. We create compelling ad copy, high-impact visuals, and audience structures tailored to your growth goals.\n\nMessage our team to start your campaign.",
    hashtags: "#MetaAds #DigitalMarketing #PerformanceCampaigns #Advertising",
  },
  {
    position: 6,
    title: "Custom Web & Web App Engineering",
    format: "Interface Showcase",
    visualBrief: "Clean interface layouts of responsive web applications and e-commerce platforms.",
    caption: "Full-stack software engineering crafted for speed, reliability, and modern user experience. We build custom websites, client dashboards, and interactive web apps.\n\nStarting from ₹7,999. Inquire at sutrastudios.in.",
    hashtags: "#WebDevelopment #SoftwareEngineering #CustomWebsites #AppDevelopment",
  },
  {
    position: 7,
    title: "Transparent Project Lifecycle",
    format: "Step-by-Step Graphic",
    visualBrief: "Clear visual graphic detailing: Brief > Production > Review > Delivery.",
    caption: "Experience a seamless creative partnership. From initial discovery to final asset handoff, our structured 4-step workflow ensures transparency and timely delivery on every project.",
    hashtags: "#StudioWorkflow #ClientExperience #ProfessionalServices #SutraStudios",
  },
  {
    position: 8,
    title: "Commercial Product Direction",
    format: "Visual Showcase",
    visualBrief: "Editorial luxury product compositions highlighting lighting and composition.",
    caption: "Command attention in crowded marketplaces. Our commercial visual production discipline delivers editorial-quality product imagery ready for e-commerce, print, and social campaigns.",
    hashtags: "#ProductPhotography #CommercialVisuals #BrandImagery #DesignStudio",
  },
  {
    position: 9,
    title: "Partner with Sutra Studios",
    format: "Brand Call-to-Action",
    visualBrief: "Studio contact card with website link, WhatsApp concierge, and email.",
    caption: "Ready to elevate your brand's digital presence? Connect with Sutra Studios today. Visit sutrastudios.in or click 'Contact Us' to schedule your project discovery.",
    hashtags: "#SutraStudios #CreativePartner #DigitalProduction #BrandSuccess",
  },
];

const WHATSAPP_QUICK_REPLIES = [
  {
    shortcut: "/services",
    text: "We offer 12 core creative and digital disciplines: Image Creation (from ₹499), Video Creation (from ₹1,499), 3D Modeling (from ₹2,499), 360 Views, Interior & Window Design, Digital Marketing, Meta Ads, and Custom Web & App Development. View our full catalog at: https://sutrastudios.in/services",
  },
  {
    shortcut: "/retainer",
    text: "Our flagship 30-Day Growth Plan provides 1 image + 1 video delivered every day for ₹9,999/month, offering continuous production momentum for your brand. Review package details at: https://sutrastudios.in/pricing",
  },
  {
    shortcut: "/quote",
    text: "To request a custom quote for web applications, enterprise branding, or multi-deliverable campaigns, please share: 1) Project Scope, 2) Target Timeline, and 3) Reference links. Our team will review and provide a detailed quotation.",
  },
];

const WHATSAPP_CATALOG_ITEMS = [
  {
    id: "img",
    name: "Image Creation",
    price: "From ₹499",
    description: "High-resolution commercial product imagery, editorial visuals, and brand assets.",
    link: "https://sutrastudios.in/services#image-creation",
  },
  {
    id: "vid",
    name: "Video Creation",
    price: "From ₹1,499",
    description: "Short-form reels, motion graphics, and cinematic promotional videos for digital channels.",
    link: "https://sutrastudios.in/services#video-creation",
  },
  {
    id: "3d",
    name: "3D Modeling",
    price: "From ₹2,499",
    description: "Photorealistic 3D product models, architectural exterior renders, and asset packaging.",
    link: "https://sutrastudios.in/services#3d-modeling",
  },
  {
    id: "360",
    name: "360 Interactive View",
    price: "From ₹1,999",
    description: "Immersive 360-degree spatial previews and virtual room tours for real estate and retail.",
    link: "https://sutrastudios.in/services#360-view",
  },
  {
    id: "int",
    name: "Interior Design",
    price: "From ₹3,499",
    description: "Spatial interior layout planning, mood board curation, and architectural renderings.",
    link: "https://sutrastudios.in/services#interior-design",
  },
  {
    id: "win",
    name: "Window Design",
    price: "From ₹2,999",
    description: "Retail storefront window displays, festive merchandising concepts, and visual staging.",
    link: "https://sutrastudios.in/services#window-design",
  },
  {
    id: "mkt",
    name: "Digital Marketing",
    price: "From ₹4,999",
    description: "Strategic campaign planning, multi-channel distribution, and content scheduling.",
    link: "https://sutrastudios.in/services#digital-marketing",
  },
  {
    id: "ads",
    name: "Meta Ads Launcher",
    price: "From ₹3,999",
    description: "Performance ad copywriting, creative variations in 1:1, 4:5 and 9:16, and setup.",
    link: "https://sutrastudios.in/services#meta-ads-launcher",
  },
  {
    id: "web",
    name: "Website Development",
    price: "From ₹7,999",
    description: "Responsive, high-speed custom marketing websites with SEO and mobile optimization.",
    link: "https://sutrastudios.in/services#website-development",
  },
  {
    id: "app",
    name: "Web App Development",
    price: "From ₹14,999",
    description: "Bespoke full-stack web applications, authenticated portals, and interactive tools.",
    link: "https://sutrastudios.in/services#web-app-development",
  },
  {
    id: "mob",
    name: "Mobile App Setup",
    price: "From ₹9,999",
    description: "Progressive Web App configurations, cross-platform app wrappers, and mobile deployment.",
    link: "https://sutrastudios.in/services#mobile-app-setup",
  },
  {
    id: "aut",
    name: "Workflow Automation",
    price: "From ₹5,999",
    description: "Automated business notifications, inquiry routing, and custom CRM integrations.",
    link: "https://sutrastudios.in/services#workflow-automation",
  },
  {
    id: "ret",
    name: "30-Day Growth Plan",
    price: "₹9,999 / mo",
    description: "Dedicated studio retainer providing 1 image + 1 video delivered every day for 30 days.",
    link: "https://sutrastudios.in/pricing",
  },
];

const TOP_10_AGENCIES = [
  {
    name: "Pentagram Design",
    category: "Design Studio",
    website: "pentagram.com",
    dpStyle: "Minimalist black typographic 'P' on white field (1:1 circular crop)",
    bioLength: "118 characters. Independent ownership ethos + core disciplines",
    highlights: "Organized by discipline: Identities, Publications, Architecture",
    postingStyle: "Editorial 4:5 carousels, architectural case studies, serif typography quotes",
  },
  {
    name: "Ogilvy",
    category: "Advertising Agency",
    website: "ogilvy.com",
    dpStyle: "Iconic white signature cursive wordmark on red background",
    bioLength: "124 characters. Heritage, global impact ethos, key practice areas",
    highlights: "Global Work, Cannes Lions, Culture, Impact Reports",
    postingStyle: "High-tempo video reels, cultural commentary, major client campaign debuts",
  },
  {
    name: "Wieden+Kennedy",
    category: "Creative Agency",
    website: "wk.com",
    dpStyle: "Stark black & white serif ampersand monogram",
    bioLength: "92 characters. Radical simplicity. Independent creative agency statement",
    highlights: "Curated by global hubs: Portland, NY, London, Tokyo, Delhi",
    postingStyle: "Provocative, authentic documentary video and cultural photography",
  },
  {
    name: "Landor",
    category: "Brand Consulting & Design",
    website: "landor.com",
    dpStyle: "Minimalist stark geometric L-motif on high-contrast field",
    bioLength: "136 characters. Brand transformation proposition + capability list",
    highlights: "Identity, Sonic, Spaces, Insights, Culture",
    postingStyle: "Sophisticated brand identity breakdowns, color palettes, typographic systems",
  },
  {
    name: "R/GA",
    category: "Design & Technology Agency",
    website: "rga.com",
    dpStyle: "Bold lowercase typographic wordmark / red slash motif",
    bioLength: "128 characters. Design meets technology for a more human future",
    highlights: "Work, Ventures, Lab, News",
    postingStyle: "Digital product teasers, UI interaction screencasts, tech culture commentary",
  },
  {
    name: "Huge Inc",
    category: "Digital Experience Agency",
    website: "hugeinc.com",
    dpStyle: "Iconic magenta block 'H' on deep background",
    bioLength: "114 characters. Creative growth company proposition + user experience",
    highlights: "Products, Commerce, Strategy, Culture",
    postingStyle: "Bold interface animations, user interaction design screencasts, product showcases",
  },
  {
    name: "Media.Monks",
    category: "Digital Production & Content",
    website: "mediamonks.com",
    dpStyle: "Stark geometric aperture / dot icon with clean lines",
    bioLength: "142 characters. Digital-first operating brand for modern marketers",
    highlights: "Virtual Production, 3D/CGI, Web Experiences, Social Media",
    postingStyle: "Hollywood-grade 3D CGI breakdowns, virtual production reels, tech teasers",
  },
  {
    name: "Thoughtworks",
    category: "Software Consultancy",
    website: "thoughtworks.com",
    dpStyle: "Multi-color geometric tech emblem on dark navy field",
    bioLength: "145 characters. Strategy, design, and software engineering integration",
    highlights: "Tech Radar, Engineering, Architecture, Culture",
    postingStyle: "Editorial engineering carousels, architecture infographics, tech whitepapers",
  },
  {
    name: "Frog (Capgemini Invent)",
    category: "Design & Innovation",
    website: "frog.co",
    dpStyle: "Famous iconic silhouette of the frog mark on white",
    bioLength: "132 characters. Designing meaningful customer experiences across physical & digital",
    highlights: "Industrial Design, Spatial, Digital Products, Thought Leadership",
    postingStyle: "High-aesthetic product design photography, process sketches, ergonomics",
  },
  {
    name: "Wolff Olins",
    category: "Brand Consultancy",
    website: "wolffolins.com",
    dpStyle: "Signature hand-drawn yellow/black typographic initials monogram",
    bioLength: "120 characters. Radical brand transformation since 1965",
    highlights: "Work, Books, People, Opinion",
    postingStyle: "Provocative typographic statements, brand philosophy essays, color studies",
  },
];
