"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { BackgroundVideo } from "@/components/media/BackgroundVideo";
import { SutraLogo, LotusSymbol } from "@/components/brand/SutraLogo";
import {
  Smartphone,
  Download,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  HardDrive,
  MessageSquare,
  ArrowRight,
  ChevronDown,
  Layers,
  Share,
  PlusSquare,
  Eye,
  Star,
  Check,
  Bell,
  Clock,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileAppLandingPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeScreenTab, setActiveScreenTab] = useState<number>(0);

  // Capture PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // If on iOS Safari or prompt not supported
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIos) {
        setShowIosGuide(true);
      } else {
        alert("To install Sutra Studio on your browser: Tap your browser's menu (⋮ or Share) and select 'Install app' or 'Add to Home screen'.");
      }
    }
  };

  const appScreenshots = [
    {
      title: "Real-Time Approvals",
      subtitle: "1-Click Approvals & 24h Revisions",
      desc: "Review 4K render passes, motion cuts, and brand assets on your phone with zero delay.",
      badge: "Workflows",
    },
    {
      title: "Live Voice & AI Assistant",
      subtitle: "Full-Screen Studio Phone Agent",
      desc: "Speak naturally with our studio AI to draft commissions and check delivery milestones.",
      badge: "AI Agent",
    },
    {
      title: "Sutra Cloud Vault",
      subtitle: "Direct High-Res Sync",
      desc: "Access your encrypted media archive with instant streaming and direct download.",
      badge: "Media Vault",
    },
    {
      title: "GST Billing & Receipts",
      subtitle: "Signed Invoices & Instant Checkout",
      desc: "Clear milestone invoices with 1-click Razorpay UPI and automated tax archiving.",
      badge: "Financials",
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: "Instant 1-Click Deliverable Approvals",
      description: "Approve 4K renders and commercial cuts directly from push notifications or request 24h revisions with pinpoint notes.",
    },
    {
      icon: MessageSquare,
      title: "Bespoke Phone AI Agent & Art Director Chat",
      description: "Seamless handover between autonomous AI generation engines and lead studio supervisors in real-time.",
    },
    {
      icon: HardDrive,
      title: "Isolated Sutra Cloud Vaults",
      description: "Direct mobile streaming of 4K ProRes videos, interactive 3D scene models, and vector packs saved in your private cloud.",
    },
    {
      icon: ShieldCheck,
      title: "Biometric & Firebase Protection",
      description: "Enterprise tenant isolation. Your intellectual property and financial statements remain encrypted at all times.",
    },
    {
      icon: Zap,
      title: "Sub-Second Native Performance",
      description: "Optimized for iOS Safari, Android Chrome, and standalone installed PWA mode with offline caching.",
    },
    {
      icon: Bell,
      title: "Critical Milestone Notifications",
      description: "Get notified the instant your render pass is ready, invoice cleared, or revision completed.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Install or Add to Home Screen",
      desc: "Tap Install or get the app via Google Play / App Store for instant 1-tap workspace access.",
    },
    {
      step: "02",
      title: "Sign In with Client Clearance",
      desc: "Authenticate via Google or Email to unlock your client-isolated Sutra Cloud Vault.",
    },
    {
      step: "03",
      title: "Manage & Approve Commissions",
      desc: "Commission new creative services, chat with the AI studio agent, and inspect 4K assets.",
    },
  ];

  const faqs = [
    {
      q: "Is Sutra Studio Mobile a native app or a Progressive Web App (PWA)?",
      a: "Sutra Studio provides both! You can install our ultra-fast standalone PWA right from your browser without taking up gigabytes of storage, or install our verified iOS & Android packages.",
    },
    {
      q: "Can I inspect full 4K renders and 3D files on my phone?",
      a: "Yes. Our mobile viewport includes responsive media players and 3D preview containers optimized for mobile touch gestures and cellular streaming.",
    },
    {
      q: "Are my Sutra Cloud Vault files safe on mobile?",
      a: "Absolutely. All media access tokens are scoped to your authenticated Firebase session with zero hardcoded credentials and strict tenant isolation.",
    },
    {
      q: "Does the app support offline mode?",
      a: "Yes. When connection drops, our service worker activates an offline preservation view allowing you to review previously loaded deliverables and draft notes.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      <Navbar />

      <main id="main-content" className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24 border-b border-[#EADFCB]">
          <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-[0.04]">
            <LotusSymbol className="w-full h-full" color="gold" />
          </div>

          <div className="app-container-cap px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Messaging & Download Buttons */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs font-semibold uppercase tracking-wider text-[#5C3A1E] shadow-xs">
                  <Smartphone className="w-3.5 h-3.5 text-[#D4A35A]" />
                  <span>SUTRA STUDIO FOR IOS & ANDROID</span>
                </div>

                <div className="space-y-3">
                  <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] tracking-tight leading-tight">
                    Your bespoke creative studio in your pocket.
                  </h1>
                  <p className="text-base sm:text-lg text-[#64748B] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    Approve 4K architectural renders, direct AI workflows, and access your encrypted Sutra Cloud Vault anywhere, anytime.
                  </p>
                </div>

                {/* Download / Install Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                  {/* Smart PWA Install CTA */}
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleInstallClick}
                    leftIcon={<Download className="w-4 h-4" />}
                    className="w-full sm:w-auto min-h-[48px] shadow-md font-semibold"
                  >
                    {isInstalled ? "Open Web App" : "Install App / Open PWA"}
                  </Button>

                  {/* App Store Badge (Coming Soon) */}
                  <button
                    type="button"
                    onClick={() => {
                      alert("Apple App Store release is Coming Soon! You can install and use the full-featured PWA on iOS right now by tapping Share -> 'Add to Home Screen'.");
                    }}
                    className="inline-flex items-center justify-between px-5 py-3 rounded-full bg-[#0F172A] text-white hover:bg-[#1E293B] transition-all text-xs font-medium border border-[#0F172A] w-full sm:w-auto min-h-[48px] touch-target group cursor-pointer relative"
                    title="Apple App Store — Coming Soon"
                  >
                    <div className="text-left flex items-center gap-2">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.89c.65-.8 1.1-1.92.97-3.05-1 .04-2.18.67-2.87 1.48-.6.69-1.12 1.83-.98 2.93 1.12.09 2.23-.56 2.88-1.36z" />
                      </svg>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-slate-400">Download on</span>
                        <span className="font-semibold text-xs text-white">Apple App Store</span>
                      </div>
                    </div>
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-[#D4A35A]/20 text-[#D4A35A] font-bold border border-[#D4A35A]/40">
                      Soon
                    </span>
                  </button>

                  {/* Google Play Badge (Coming Soon) */}
                  <button
                    type="button"
                    onClick={() => {
                      alert("Google Play Store release is Coming Soon! You can install the live PWA immediately on Android via the 'Install App / Open PWA' button.");
                    }}
                    className="inline-flex items-center justify-between px-5 py-3 rounded-full bg-[#0F172A] text-white hover:bg-[#1E293B] transition-all text-xs font-medium border border-[#0F172A] w-full sm:w-auto min-h-[48px] touch-target group cursor-pointer relative"
                    title="Google Play Store — Coming Soon"
                  >
                    <div className="text-left flex items-center gap-2">
                      <svg className="w-4 h-4 fill-current text-[#D4A35A]" viewBox="0 0 24 24">
                        <path d="M3.6 2.2c-.3.3-.4.8-.4 1.4v16.8c0 .6.1 1.1.4 1.4l.1.1 9.4-9.4v-.2L3.7 2.1l-.1.1zM16.8 15.6l-3.7-3.7v-.2l3.7-3.7.1.1 4.4 2.5c1.3.7 1.3 1.9 0 2.6l-4.5 2.4zM13.1 12.1L3.7 21.5c.4.4 1.1.5 1.8.1l10.4-5.9-2.8-3.6zM13.1 11.9l2.8-3.6-10.4-6c-.7-.4-1.4-.3-1.8.1l9.4 9.5z" />
                      </svg>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-slate-400">Get it on</span>
                        <span className="font-semibold text-xs text-white">Google Play</span>
                      </div>
                    </div>
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-[#D4A35A]/20 text-[#D4A35A] font-bold border border-[#D4A35A]/40">
                      Soon
                    </span>
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-xs text-[#64748B]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D4F]" />
                    Zero install delay
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D4F]" />
                    Pure Firebase + Drive
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D4F]" />
                    iOS & Android
                  </span>
                </div>
              </div>

              {/* Right Column: Realistic CSS Mobile Device Frame Mockup with Live Video Demo */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[320px] sm:max-w-[340px]">
                  {/* Subtle golden ambient glow */}
                  <div className="absolute -inset-4 bg-gradient-to-tr from-[#D4A35A]/20 via-[#5C3A1E]/10 to-transparent rounded-[50px] blur-2xl" />

                  {/* Phone Chassis */}
                  <div className="relative rounded-[44px] border-[6px] border-[#0F172A] bg-[#0F172A] shadow-2xl p-2.5 overflow-hidden">
                    {/* Dynamic Island / Notch */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#0F172A] rounded-full z-30 flex items-center justify-end pr-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1E293B]" />
                    </div>

                    {/* Phone Screen Canvas with Video Stream */}
                    <div className="rounded-[34px] bg-[#0F172A] overflow-hidden flex flex-col h-[620px] border border-[#EADFCB] text-[#0F172A] relative">
                      {/* Background Video Stream */}
                      <BackgroundVideo
                        video="app-demo"
                        layout="fill"
                        overlay="none"
                        showPlayPauseToggle={false}
                        priority
                      />

                      {/* Home indicator bar */}
                      <div className="absolute bottom-2 inset-x-0 py-1 flex justify-center z-20">
                        <div className="w-24 h-1 bg-[#FFFDF9] rounded-full opacity-60" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE WORKFLOW SCREENSHOT CAROUSEL */}
        <section className="py-16 sm:py-20 border-b border-[#EADFCB] bg-[#FFFDF9]/60">
          <div className="app-container-cap px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A98B57]">
                Touch-First Creative Management
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0F172A]">
                Every studio capability at your fingertips
              </h2>
              <p className="text-sm text-[#64748B]">
                Swipe through key screens of the Sutra Studio mobile interface.
              </p>
            </div>

            {/* Screen Selector Tabs */}
            <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 px-1 scrollbar-none">
              {appScreenshots.map((item, index) => (
                <button
                  key={item.title}
                  onClick={() => setActiveScreenTab(index)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all touch-target cursor-pointer shrink-0 ${
                    activeScreenTab === index
                      ? "bg-[#5C3A1E] text-white shadow-xs font-bold ring-1 ring-[#D4A35A]"
                      : "bg-[#FFFDF9] text-[#64748B] border border-[#EADFCB] hover:text-[#0F172A]"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>

            {/* Active Screen Showcase Card */}
            <div className="max-w-2xl mx-auto p-5 sm:p-8 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="gold">{appScreenshots[activeScreenTab].badge}</Badge>
                <span className="text-xs font-mono text-[#94A3B8]">Screen {activeScreenTab + 1} of 4</span>
              </div>
              <h3 className="font-serif text-lg sm:text-2xl font-bold text-[#0F172A]">
                {appScreenshots[activeScreenTab].subtitle}
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                {appScreenshots[activeScreenTab].desc}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleInstallClick}
                  leftIcon={<Download className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                  className="w-full sm:w-auto justify-center"
                >
                  Test On Your Device
                </Button>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="ghost" size="sm" withArrow className="w-full sm:w-auto justify-center">
                    Open Live Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* KEY FEATURES GRID */}
        <section className="py-16 sm:py-20 border-b border-[#EADFCB]">
          <div className="app-container-cap px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A98B57]">
                Engineered for Mobile Executives
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0F172A]">
                Native power without App Store friction
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-3 hover:border-[#D4A35A] transition-all"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] text-[#5C3A1E] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#D4A35A]" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-[#0F172A]">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-16 sm:py-20 border-b border-[#EADFCB] bg-[#FFFDF9]/60">
          <div className="app-container-cap px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A98B57]">
                Simple Deployment
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0F172A]">
                Get running in under 30 seconds
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((s) => (
                <div
                  key={s.step}
                  className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] space-y-3 relative"
                >
                  <span className="font-mono text-2xl font-bold text-[#D4A35A] block">
                    {s.step}
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-[#0F172A]">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="py-16 sm:py-20 border-b border-[#EADFCB]">
          <div className="app-container-cap px-4 sm:px-6 lg:px-8 max-w-3xl space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A98B57]">
                Got Questions?
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A]">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={faq.q}
                  className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left min-h-[44px] cursor-pointer"
                  >
                    <span className="font-serif text-sm sm:text-base font-semibold text-[#0F172A] pr-4">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform ${
                        openFaq === idx ? "rotate-180 text-[#5C3A1E]" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-[#EADFCB]/40 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL DOWNLOAD CTA */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-[#FFFDF9] to-[#F8F5EF] text-center">
          <div className="app-container-cap px-4 sm:px-6 lg:px-8 max-w-2xl space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-[#5C3A1E] text-white flex items-center justify-center mx-auto shadow-md">
              <Smartphone className="w-7 h-7 text-[#D4A35A]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A]">
                Experience Sutra Studio on your mobile device today.
              </h2>
              <p className="text-sm text-[#64748B]">
                Free for all clients with active commissions. Instant sync with your Sutra Cloud Vault.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleInstallClick}
                leftIcon={<Download className="w-4 h-4" />}
                className="w-full sm:w-auto min-h-[48px]"
              >
                Install Web App Now
              </Button>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto min-h-[48px]">
                  Book Discovery Call
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* iOS Safari Add to Home Screen Instructions Bottom Sheet */}
      <Modal
        isOpen={showIosGuide}
        onClose={() => setShowIosGuide(false)}
        title="Add Sutra Studio to iOS Home Screen"
        description="Follow these two quick steps on iOS Safari to install Sutra Studio as a native app:"
      >
        <div className="space-y-4 py-2 text-sm text-[#334155]">
          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center font-bold text-xs shrink-0">
              1
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                Tap the Share icon <Share className="w-4 h-4 text-[#D4A35A]" />
              </p>
              <p className="text-xs text-[#64748B]">
                Located in the bottom Safari toolbar (or top right on iPad).
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                Select &ldquo;Add to Home Screen&rdquo; <PlusSquare className="w-4 h-4 text-[#D4A35A]" />
              </p>
              <p className="text-xs text-[#64748B]">
                Scroll down in the share sheet and tap &ldquo;Add to Home Screen&rdquo;, then tap &ldquo;Add&rdquo;.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowIosGuide(false)}
            className="w-full mt-2"
          >
            Got it, I&apos;m ready
          </Button>
        </div>
      </Modal>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
