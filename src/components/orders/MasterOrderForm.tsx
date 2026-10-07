"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { PaymentModal } from "@/components/checkout/PaymentModal";
import {
  PER_PROJECT_TIERS,
  MONTHLY_RETAINER_TIERS,
  STUDIO_PAYMENT_CONFIG,
  formatCurrencyINR,
} from "@/config/pricing";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  FileText,
  Upload,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  CreditCard,
  QrCode,
  ShieldCheck,
  Check,
  HelpCircle,
  Link as LinkIcon,
  Video,
  Box,
  Compass,
  Monitor,
  ShoppingBag,
  Palette,
  Camera,
  Share2,
} from "lucide-react";

export interface MasterOrderFormProps {
  initialServiceId?: string;
  initialTierId?: string;
  onOrderSuccess?: (order: any) => void;
  className?: string;
}

export interface IntakeServiceOption {
  id: string;
  title: string;
  category: "3D & Spatial" | "Video & Motion" | "Social & Ads" | "Creative & Brand" | "Digital" | "Retainer";
  basePrice: number | "custom";
  turnaround: string;
  description: string;
  iconName: string;
}

export const INTAKE_SERVICES: IntakeServiceOption[] = [
  {
    id: "arch-3d",
    title: "Architecture 3D Visualization",
    category: "3D & Spatial",
    basePrice: 3499,
    turnaround: "48h Turnaround",
    description: "Photorealistic architectural exteriors, elevations, and lighting studies.",
    iconName: "building",
  },
  {
    id: "interior-staging",
    title: "Interior Design & Spatial Staging",
    category: "3D & Spatial",
    basePrice: 3499,
    turnaround: "48h Turnaround",
    description: "Luxury interior staging, furniture layouts, material finishes, and ambient lighting.",
    iconName: "box",
  },
  {
    id: "virtual-tour-360",
    title: "360° Virtual Tours & VR",
    category: "3D & Spatial",
    basePrice: 7999,
    turnaround: "72h Turnaround",
    description: "Immersive equirectangular virtual walkthroughs with interactive spatial hotspots.",
    iconName: "compass",
  },
  {
    id: "product-3d-cgi",
    title: "Product 3D Modeling & CGI",
    category: "3D & Spatial",
    basePrice: 3499,
    turnaround: "48h Turnaround",
    description: "High-precision CAD modeling, studio product lighting, and explosive CGI views.",
    iconName: "box",
  },
  {
    id: "commercial-video-ads",
    title: "Commercial Video Ads",
    category: "Video & Motion",
    basePrice: 7999,
    turnaround: "72h Turnaround",
    description: "Cinematic commercial reels, product launch videos, and broadcast-ready grading.",
    iconName: "video",
  },
  {
    id: "social-micro-reels",
    title: "Social Media Micro-Content & Reels",
    category: "Social & Ads",
    basePrice: 3499,
    turnaround: "48h Turnaround",
    description: "High-engagement 9:16 vertical motion assets engineered for virality and conversion.",
    iconName: "share",
  },
  {
    id: "meta-ad-bundles",
    title: "Meta & Instagram Ad Creative Bundles",
    category: "Social & Ads",
    basePrice: 7999,
    turnaround: "72h Turnaround",
    description: "Multi-ratio creative packs (9:16, 1:1, 16:9) optimized for high CTR and ROAS.",
    iconName: "share",
  },
  {
    id: "editorial-fashion",
    title: "High-Fashion & Editorial Visuals",
    category: "Creative & Brand",
    basePrice: 3499,
    turnaround: "48h Turnaround",
    description: "Vogue-grade editorial compositions, virtual wardrobe staging, and high-fashion aesthetics.",
    iconName: "camera",
  },
  {
    id: "ai-concept-art",
    title: "AI Image Generation & Creative Concepts",
    category: "Creative & Brand",
    basePrice: 3499,
    turnaround: "24h Turnaround",
    description: "Ultra-fast generative ideation, high-concept moodboards, and master art direction.",
    iconName: "sparkles",
  },
  {
    id: "brand-identity-system",
    title: "Brand Identity & Design Systems",
    category: "Creative & Brand",
    basePrice: 7999,
    turnaround: "72h Turnaround",
    description: "Complete visual identities, typography guidelines, vector tokens, and design books.",
    iconName: "palette",
  },
  {
    id: "custom-web-digital",
    title: "Custom Web & Digital Experiences",
    category: "Digital",
    basePrice: 7999,
    turnaround: "5-7 Days",
    description: "Next.js performance websites, luxury bespoke landing pages, and interactive WebGL experiences.",
    iconName: "monitor",
  },
  {
    id: "monthly-retainer",
    title: "Monthly Creative Direction & Content Retainer",
    category: "Retainer",
    basePrice: 14999,
    turnaround: "Daily Active Queue",
    description: "Dedicated ongoing creative partner with daily delivery queue, private channel, and unlimited requests.",
    iconName: "layers",
  },
];

export function MasterOrderForm({
  initialServiceId,
  initialTierId,
  onOrderSuccess,
  className = "",
}: MasterOrderFormProps) {
  // Navigation Steps: 1: Service & Tier, 2: Client & Brand Info, 3: Service Parameters, 4: Review & Payment
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Selected Service & Tier
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || "arch-3d"
  );
  const [selectedTierId, setSelectedTierId] = useState<string>(
    initialTierId || "starter"
  );

  // Step 2: Universal Base Inputs
  const [fullName, setFullName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("+91 ");
  const [industry, setIndustry] = useState("Real Estate");
  const [brandUrl, setBrandUrl] = useState("");
  const [brandAssetUrl, setBrandAssetUrl] = useState("");
  const [targetDeadline, setTargetDeadline] = useState("");
  const [creativeBrief, setCreativeBrief] = useState("");

  // Step 3: Conditional Sub-Form Inputs
  // 3a. Meta Ads Config
  const [metaAspectRatios, setMetaAspectRatios] = useState<string[]>([
    "9:16 (Stories/Reels)",
    "1:1 (Feed)",
  ]);
  const [metaCta, setMetaCta] = useState("Shop Now");
  const [metaTargetRoas, setMetaTargetRoas] = useState("");
  const [metaOfferCopy, setMetaOfferCopy] = useState("");

  // 3b. 3D / 360 / Interior Spatial Config
  const [cadFileUrl, setCadFileUrl] = useState("");
  const [squareFootage, setSquareFootage] = useState("");
  const [lightingPref, setLightingPref] = useState("Warm Daylight Golden Hour");
  const [outputResolution, setOutputResolution] = useState("4K UHD (3840x2160)");

  // 3c. Web / App Dev Config
  const [techStack, setTechStack] = useState("Next.js + Tailwind CSS");
  const [pageCount, setPageCount] = useState("1-3 Landing Pages");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [domainStatus, setDomainStatus] = useState("Already purchased & ready");

  // 3d. Monthly Retainer Config
  const [retainerFocus, setRetainerFocus] = useState(
    "Omnichannel Growth (Social Reels + 3D Renders)"
  );
  const [retainerStartDate, setRetainerStartDate] = useState("");
  const [dedicatedSlackChannel, setDedicatedSlackChannel] = useState(true);

  // Step 4: Submission & Payment States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [formError, setFormError] = useState("");

  // Active Service Details
  const activeService =
    INTAKE_SERVICES.find((s) => s.id === selectedServiceId) || INTAKE_SERVICES[0];

  const isMonthlyRetainer = activeService.id === "monthly-retainer";
  const isMetaAds =
    activeService.id === "meta-ad-bundles" ||
    activeService.id === "social-micro-reels";
  const isSpatialOr3D =
    activeService.id === "arch-3d" ||
    activeService.id === "interior-staging" ||
    activeService.id === "virtual-tour-360" ||
    activeService.id === "product-3d-cgi";
  const isWebDev = activeService.id === "custom-web-digital";

  // Calculate Order Amount
  const orderAmount = React.useMemo(() => {
    if (isMonthlyRetainer) return 14999;
    if (selectedTierId === "starter") return 3499;
    if (selectedTierId === "growth") return 7999;
    return 7999; // Default studio growth
  }, [isMonthlyRetainer, selectedTierId]);

  // Validation before proceeding
  const handleNextStep = () => {
    setFormError("");
    if (currentStep === 2) {
      if (!fullName.trim()) {
        setFormError("Full Name is required");
        return;
      }
      if (!brandName.trim()) {
        setFormError("Business / Brand Name is required");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setFormError("Valid Email Address is required");
        return;
      }
      if (!whatsapp.trim() || whatsapp.length < 8) {
        setFormError("WhatsApp contact number is required");
        return;
      }
      if (!creativeBrief.trim()) {
        setFormError("Please enter creative notes or brief requirements");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  // Submit Order & Launch Checkout
  const handleFinalSubmit = async (paymentChoice: "upi_qr" | "online") => {
    setIsSubmitting(true);
    setFormError("");

    const orderPayload = {
      source: "direct_order",
      clientName: fullName.trim(),
      clientEmail: email.trim(),
      clientPhone: whatsapp.trim(),
      brandName: brandName.trim(),
      industry,
      brandUrl: brandUrl.trim(),
      serviceId: activeService.id,
      serviceTitle: activeService.title,
      tierId: isMonthlyRetainer ? "retainer" : selectedTierId,
      amount: orderAmount,
      billingType: isMonthlyRetainer ? "monthly_retainer" : "per_project",
      targetDeadline,
      creativeBrief: creativeBrief.trim(),
      brandAssetUrl: brandAssetUrl.trim(),
      paymentMethod: paymentChoice,
      // Conditional sub-form data
      serviceDetails: {
        ...(isMetaAds && {
          metaAspectRatios,
          metaCta,
          metaTargetRoas,
          metaOfferCopy,
        }),
        ...(isSpatialOr3D && {
          cadFileUrl,
          squareFootage,
          lightingPref,
          outputResolution,
        }),
        ...(isWebDev && {
          techStack,
          pageCount,
          figmaUrl,
          domainStatus,
        }),
        ...(isMonthlyRetainer && {
          retainerFocus,
          retainerStartDate,
          dedicatedSlackChannel,
        }),
      },
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      const generatedOrder = data.order || {
        id: `ord_${Date.now()}`,
        code: `STR-${Math.floor(1000 + Math.random() * 9000)}`,
        title: activeService.title,
        totalAmount: orderAmount,
      };

      setCreatedOrder(generatedOrder);

      if (onOrderSuccess) {
        onOrderSuccess(generatedOrder);
      }

      if (paymentChoice === "upi_qr") {
        setPaymentModalOpen(true);
      }
    } catch (err: any) {
      setFormError("Could not submit order: " + (err.message || "Network issue"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-sm overflow-hidden ${className}`}>
      {/* Top Stepper Header */}
      <div className="p-6 sm:p-8 bg-[#FAF9F5] border-b border-[#EADFCB]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-[10px] font-bold text-[#5C3A1E] uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
              <span>Studio Commission Intake</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A]">
              Commission a Creative Project
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Select your service, configure creative parameters, and initiate production.
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  currentStep === stepNum
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : currentStep > stepNum
                    ? "bg-[#2E7D4F] text-white"
                    : "bg-[#F4EFE6] text-[#94A3B8]"
                }`}
              >
                {currentStep > stepNum ? <Check className="w-4 h-4 stroke-[2.5]" /> : stepNum}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {formError && (
          <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* =========================================================
            STEP 1: SELECT SERVICE & TIER
            ========================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#0F172A] mb-1">
                1. Select Creative Service (12 Disciplines)
              </h3>
              <p className="text-xs text-[#64748B]">
                Choose the primary service or ongoing monthly creative partnership.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {INTAKE_SERVICES.map((srv) => {
                const isSelected = selectedServiceId === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? "bg-[#5C3A1E] text-white border-[#5C3A1E] shadow-sm"
                        : "bg-[#FFFFFF] text-[#0F172A] border-[#EADFCB] hover:border-[#D4A35A] hover:bg-[#FAF9F5]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-[#F8F5EF] text-[#64748B]"
                          }`}
                        >
                          {srv.category}
                        </span>
                        <span
                          className={`text-[11px] font-mono font-bold ${
                            isSelected ? "text-[#D4A35A]" : "text-[#5C3A1E]"
                          }`}
                        >
                          {typeof srv.basePrice === "number"
                            ? `₹${srv.basePrice.toLocaleString("en-IN")}`
                            : "Custom"}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-sm leading-snug">
                        {srv.title}
                      </h4>
                      <p
                        className={`text-xs mt-1 line-clamp-2 ${
                          isSelected ? "text-white/80" : "text-[#64748B]"
                        }`}
                      >
                        {srv.description}
                      </p>
                    </div>

                    <div
                      className={`text-[10px] font-mono pt-2 border-t ${
                        isSelected ? "border-white/20 text-white/70" : "border-[#EADFCB]/60 text-[#94A3B8]"
                      }`}
                    >
                      {srv.turnaround}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tier Selection (for Per-Project Services) */}
            {!isMonthlyRetainer && (
              <div className="pt-4 border-t border-[#EADFCB] space-y-3">
                <h4 className="font-serif text-sm font-semibold text-[#0F172A]">
                  Select Delivery Tier
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setSelectedTierId("starter")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedTierId === "starter"
                        ? "bg-[#FAF9F5] border-[#5C3A1E] ring-1 ring-[#5C3A1E]"
                        : "bg-[#FFFFFF] border-[#EADFCB] hover:border-[#D4A35A]"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-serif font-bold text-sm text-[#0F172A]">
                        Starter Creative
                      </span>
                      <span className="font-serif font-bold text-base text-[#5C3A1E]">
                        ₹3,499
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B]">
                      48h Turnaround • 5x 4K UHD Renders or 1x 10s Video Ad • 2 Revision Passes
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedTierId("growth")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                      selectedTierId === "growth"
                        ? "bg-[#FAF9F5] border-[#5C3A1E] ring-1 ring-[#5C3A1E]"
                        : "bg-[#FFFFFF] border-[#EADFCB] hover:border-[#D4A35A]"
                    }`}
                  >
                    <div className="absolute top-2 right-2">
                      <span className="bg-[#D4A35A] text-[#0F172A] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Most Popular
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-1 pr-20">
                      <span className="font-serif font-bold text-sm text-[#0F172A]">
                        Studio Growth
                      </span>
                      <span className="font-serif font-bold text-base text-[#5C3A1E]">
                        ₹7,999
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B]">
                      24-72h • 15x 3D Assets or 3x 15s Ads • 360° Tour • 3x Meta Variations
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isMonthlyRetainer && (
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#D4A35A]/50 flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-sm text-[#0F172A] block">
                    Autonomous Growth Retainer
                  </span>
                  <span className="text-xs text-[#64748B]">
                    Daily Active Queue • Dedicated Creative Lead • Private Slack Channel
                  </span>
                </div>
                <span className="font-serif font-bold text-lg text-[#5C3A1E]">
                  ₹14,999 / mo
                </span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleNextStep}
                withArrow
              >
                Continue to Brand Info
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 2: UNIVERSAL BASE FIELDS
            ========================================================= */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#0F172A] mb-1">
                2. Brand & Contact Information
              </h3>
              <p className="text-xs text-[#64748B]">
                Tell us about your brand so our creative directors can tailor the visual language.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Full Name / Point of Contact <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yash Joshi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Business / Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aura Noir Living"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. director@auranoir.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  WhatsApp Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 94280 00000"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Industry / Vertical
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                >
                  <option value="Real Estate">Real Estate & Architecture</option>
                  <option value="Luxury Retail">Luxury Retail & Jewelry</option>
                  <option value="Hospitality">Hospitality & Resorts</option>
                  <option value="Fashion">Fashion & Apparel</option>
                  <option value="Tech/SaaS">Tech & Modern SaaS</option>
                  <option value="E-Commerce">D2C & E-Commerce</option>
                  <option value="Other">Other Creative Discipline</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Website / Instagram Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. @auranoirliving or auranoir.com"
                  value={brandUrl}
                  onChange={(e) => setBrandUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Brand Guidelines / Logo Cloud URL
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://drive.google.com/... or Figma link"
                  value={brandAssetUrl}
                  onChange={(e) => setBrandAssetUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Target Launch / Delivery Date
                </label>
                <input
                  type="date"
                  value={targetDeadline}
                  onChange={(e) => setTargetDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Creative Brief & Requirements <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe project vision, desired mood, lighting, color palettes, key references, or special deliverables needed..."
                value={creativeBrief}
                onChange={(e) => setCreativeBrief(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleNextStep}
                withArrow
              >
                Service Parameters
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 3: CONDITIONAL SERVICE PARAMETERS
            ========================================================= */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#0F172A] mb-1">
                3. Technical & Creative Specifications
              </h3>
              <p className="text-xs text-[#64748B]">
                Configure parameters tailored specifically to <strong>{activeService.title}</strong>.
              </p>
            </div>

            {/* Meta & Instagram Ads Accordion */}
            {isMetaAds && (
              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-4">
                <span className="text-xs font-bold text-[#5C3A1E] uppercase font-mono tracking-wider block">
                  Meta Ads Creative Specifications
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Target Ratios (Multi-select)
                    </label>
                    <div className="space-y-1.5">
                      {["9:16 (Stories/Reels)", "1:1 (Feed/Square)", "16:9 (Landscape)"].map((ratio) => {
                        const checked = metaAspectRatios.includes(ratio);
                        return (
                          <label
                            key={ratio}
                            className="flex items-center gap-2 text-xs text-[#0F172A] cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) {
                                  setMetaAspectRatios(metaAspectRatios.filter((r) => r !== ratio));
                                } else {
                                  setMetaAspectRatios([...metaAspectRatios, ratio]);
                                }
                              }}
                              className="rounded border-[#EADFCB] text-[#5C3A1E] focus:ring-[#D4A35A]"
                            />
                            <span>{ratio}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Call-to-Action (CTA) Style
                    </label>
                    <select
                      value={metaCta}
                      onChange={(e) => setMetaCta(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    >
                      <option value="Shop Now">Shop Now</option>
                      <option value="Book Consultation">Book Consultation</option>
                      <option value="Learn More">Learn More</option>
                      <option value="Get Exclusive Quote">Get Exclusive Quote</option>
                      <option value="Sign Up">Sign Up / Reserve</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Target ROAS / Campaign Goal
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 4.5x ROAS or Brand Awareness High-Touch"
                      value={metaTargetRoas}
                      onChange={(e) => setMetaTargetRoas(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Core Offer / Hook Copy
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 20% Launch Privilege or Architectural Excellence"
                      value={metaOfferCopy}
                      onChange={(e) => setMetaOfferCopy(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3D / 360 / Spatial Accordion */}
            {isSpatialOr3D && (
              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-4">
                <span className="text-xs font-bold text-[#5C3A1E] uppercase font-mono tracking-wider block">
                  3D Spatial & Render Parameters
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Floor Plan / CAD File Cloud Link
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. Dropbox / Drive link to .dwg / .dxf / .pdf"
                      value={cadFileUrl}
                      onChange={(e) => setCadFileUrl(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Estimated Area / Square Footage
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2,400 sq. ft. Penthouse"
                      value={squareFootage}
                      onChange={(e) => setSquareFootage(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Lighting Atmosphere Preference
                    </label>
                    <select
                      value={lightingPref}
                      onChange={(e) => setLightingPref(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    >
                      <option value="Warm Daylight Golden Hour">Warm Daylight Golden Hour</option>
                      <option value="Moody Dusk / Twilight">Moody Dusk / Twilight</option>
                      <option value="Bright Architectural Clean">Bright Architectural Clean</option>
                      <option value="Dramatic Night Glow">Dramatic Night Luxury Glow</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Master Render Resolution
                    </label>
                    <select
                      value={outputResolution}
                      onChange={(e) => setOutputResolution(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    >
                      <option value="4K UHD (3840x2160)">4K UHD (3840 x 2160)</option>
                      <option value="8K Master (7680x4320)">8K Master Ultra-High Res</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Web / App Dev Accordion */}
            {isWebDev && (
              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-4">
                <span className="text-xs font-bold text-[#5C3A1E] uppercase font-mono tracking-wider block">
                  Digital Experience Specifications
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Tech Stack Direction
                    </label>
                    <select
                      value={techStack}
                      onChange={(e) => setTechStack(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    >
                      <option value="Next.js + Tailwind CSS">Next.js App Router + Tailwind CSS</option>
                      <option value="React + Vite">React + Vite High-Speed SPA</option>
                      <option value="Webflow / Framer">Webflow / Framer Luxury CMS</option>
                      <option value="Bespoke Custom">Bespoke Custom WebGL Experience</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Target Page Scope
                    </label>
                    <select
                      value={pageCount}
                      onChange={(e) => setPageCount(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    >
                      <option value="1-3 Landing Pages">1-3 High-Impact Landing Pages</option>
                      <option value="4-7 Pages Full Site">4-7 Pages Complete Studio Website</option>
                      <option value="8+ Pages Web App">8+ Pages Full Custom Application</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Figma UI / Design File Link
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://www.figma.com/design/..."
                      value={figmaUrl}
                      onChange={(e) => setFigmaUrl(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Domain & Hosting
                    </label>
                    <select
                      value={domainStatus}
                      onChange={(e) => setDomainStatus(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    >
                      <option value="Already purchased & ready">Already purchased & DNS ready</option>
                      <option value="Need setup assistance">Need studio assistance with setup</option>
                      <option value="Domain not required yet">Staging domain only</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Retainer Accordion */}
            {isMonthlyRetainer && (
              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-4">
                <span className="text-xs font-bold text-[#5C3A1E] uppercase font-mono tracking-wider block">
                  Monthly Retainer Structure
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Primary Retainer Focus
                    </label>
                    <select
                      value={retainerFocus}
                      onChange={(e) => setRetainerFocus(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    >
                      <option value="Omnichannel Growth">Omnichannel Growth (Social + 3D Visuals)</option>
                      <option value="High-Frequency Reels">High-Frequency Commercial Reels & Ads</option>
                      <option value="Architecture 3D Pipeline">Ongoing Architectural 3D Rendering Queue</option>
                      <option value="Full-Stack Brand & Web">Full-Stack Digital & Brand Evolution</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                      Preferred Retainer Start Date
                    </label>
                    <input
                      type="date"
                      value={retainerStartDate}
                      onChange={(e) => setRetainerStartDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2.5 text-xs text-[#0F172A] pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dedicatedSlackChannel}
                    onChange={(e) => setDedicatedSlackChannel(e.target.checked)}
                    className="rounded border-[#EADFCB] text-[#5C3A1E] focus:ring-[#D4A35A]"
                  />
                  <span>Provision Dedicated VIP Slack / WhatsApp Concierge Channel</span>
                </label>
              </div>
            )}

            {!isMetaAds && !isSpatialOr3D && !isWebDev && !isMonthlyRetainer && (
              <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#64748B]">
                Standard parameters configured for <strong>{activeService.title}</strong>. Output deliverables will be calibrated to 4K resolution and studio master grading.
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setCurrentStep(2)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleNextStep}
                withArrow
              >
                Review & Checkout
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 4: REVIEW & CHECKOUT
            ========================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#0F172A] mb-1">
                4. Scope Review & Checkout Selection
              </h3>
              <p className="text-xs text-[#64748B]">
                Verify your commission summary and choose payment method. Zero transaction fees via direct UPI QR.
              </p>
            </div>

            {/* Scope Summary Box */}
            <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#EADFCB]">
                <span className="text-[#64748B]">Commission Service:</span>
                <span className="font-serif font-bold text-sm text-[#0F172A]">
                  {activeService.title}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Delivery Tier:</span>
                <span className="font-semibold text-[#5C3A1E]">
                  {isMonthlyRetainer
                    ? "Autonomous Growth Retainer"
                    : selectedTierId === "starter"
                    ? "Starter Creative"
                    : "Studio Growth"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Client & Brand:</span>
                <span className="font-semibold text-[#0F172A]">
                  {fullName} ({brandName})
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">WhatsApp / Contact:</span>
                <span className="font-mono text-[#0F172A]">{whatsapp}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#EADFCB]">
                <span className="font-semibold text-[#0F172A]">Total Investment:</span>
                <span className="font-serif font-bold text-xl text-[#5C3A1E]">
                  ₹{orderAmount.toLocaleString("en-IN")}
                  {isMonthlyRetainer && <span className="text-xs font-normal text-[#64748B]"> / month</span>}
                </span>
              </div>
            </div>

            {/* Payment Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Option 1: Zero-Fee UPI & GPay QR (Recommended) */}
              <div
                onClick={() => handleFinalSubmit("upi_qr")}
                className="p-5 rounded-2xl bg-[#FFFDF9] border-2 border-[#D4A35A] hover:bg-[#FAF9F5] cursor-pointer transition-all space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[#5C3A1E]" />
                    <span className="font-serif font-bold text-sm text-[#0F172A]">
                      Direct UPI & GPay QR
                    </span>
                  </div>
                  <span className="bg-[#2E7D4F] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    0% Gateway Fee
                  </span>
                </div>
                <p className="text-xs text-[#64748B]">
                  Instant scan & pay via Google Pay, PhonePe, Paytm, or BHIM. Enter UTR for rapid autonomous dispatch.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#5C3A1E] group-hover:text-[#462B16]">
                  <span>Launch UPI Payment Modal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Option 2: Online Card / NetBanking */}
              <div
                onClick={() => handleFinalSubmit("online")}
                className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] hover:border-[#D4A35A] hover:bg-[#FAF9F5] cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#5C3A1E]" />
                    <span className="font-serif font-bold text-sm text-[#0F172A]">
                      Online Cards & Corporate NetBanking
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#64748B]">
                  Pay via Corporate Cards, Visa/Mastercard, or NetBanking with automated tax invoice generation.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#5C3A1E] group-hover:text-[#462B16]">
                  <span>Proceed with Online Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setCurrentStep(3)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Zero-Fee UPI & GPay Payment Modal */}
      {paymentModalOpen && createdOrder && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          orderId={createdOrder.id}
          orderCode={createdOrder.code}
          clientName={fullName}
          clientEmail={email}
          clientPhone={whatsapp}
          serviceTitle={activeService.title}
          amount={orderAmount}
          onPaymentSuccess={() => {
            // Keep modal open on its success screen
          }}
        />
      )}
    </div>
  );
}
