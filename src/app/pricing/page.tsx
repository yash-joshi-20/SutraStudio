import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Check } from "lucide-react";

const TIERS = [
  {
    name: "Starter Creative",
    price: "₹750",
    period: "/ project",
    description: "Ideal for boutique brands and founders needing immediate high-impact visuals.",
    features: [
      "Up to 5 Photorealistic 4K Renders",
      "1x 10-Second Commercial Video Ad",
      "Full Commercial Copyright License",
      "48-Hour Turnaround Time",
      "Google Drive Organized Delivery",
    ],
    popular: false,
    cta: "Start with Starter",
  },
  {
    name: "Studio Growth",
    price: "₹1,850",
    period: "/ project",
    description: "Comprehensive creative suite across 3D, video, and digital marketing assets.",
    features: [
      "15x High-Resolution 3D & Product Renders",
      "3x 15-Second Video Ads with Voiceover",
      "Interactive 360° Space or Product Tour",
      "Meta Ads Creative Variation Pack (5x)",
      "Dedicated Creative Lead & Slack Sync",
      "Unlimited Minor Revisions (7 Days)",
    ],
    popular: true,
    cta: "Choose Growth",
  },
  {
    name: "Bespoke Enterprise",
    price: "₹3,800+",
    period: "/ monthly or milestone",
    description: "Complete digital ecosystem: custom Next.js web application, 3D pipelines, and AI automation.",
    features: [
      "Bespoke Next.js / Web Application Build",
      "Custom n8n Automated Creative Pipelines",
      "Unlimited 3D Modeling & Space Renders",
      "Cross-Platform Mobile App Setup",
      "Custom AI Classifier & Real-Time Sync",
      "Priority Same-Day Turnaround",
    ],
    popular: false,
    cta: "Inquire for Enterprise",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4A35A]">
            TRANSPARENT VALUE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#0F172A]">
            Studio Packages & Pricing
          </h1>
          <p className="text-base text-[#64748B]">
            Clear, honest pricing with zero hidden fees. All assets delivered in 4K
            directly to your private Google Drive.
          </p>
        </div>

        {/* 3 Tier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${tier.popular
                ? "bg-[#FFFDF9] border-2 border-[#D4A35A] shadow-warm-hover relative"
                : "bg-[#FFFDF9] border border-[#EADFCB] shadow-sm hover:border-[#D4A35A]/60"
                }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#5C3A1E] text-white px-4 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                  {tier.name}
                </h3>
                <p className="text-xs text-[#64748B] mt-1 mb-6 leading-relaxed">
                  {tier.description}
                </p>

                <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-[#EADFCB]/60">
                  <span className="font-serif text-4xl font-bold text-[#5C3A1E]">
                    {tier.price}
                  </span>
                  <span className="text-xs text-[#64748B]">{tier.period}</span>
                </div>

                <ul className="space-y-3.5 text-sm text-[#475569] mb-8">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#EDF7F0] text-[#2E7D4F] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/orders">
                <Button
                  variant={tier.popular ? "primary" : "secondary"}
                  size="md"
                  className="w-full"
                  withArrow
                >
                  {tier.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
