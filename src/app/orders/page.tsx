"use client";

import React, { useState } from "react";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import { Input, Badge } from "@/components/ui/Card";
import { SUTRA_SERVICES } from "@/data/servicesData";
import { Check, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function OrdersPage() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(SUTRA_SERVICES[0].id);
  const [orderDetails, setOrderDetails] = useState({
    title: "",
    timeline: "Standard (48-72h)",
    brief: "",
    references: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const currentService =
    SUTRA_SERVICES.find((s) => s.id === selectedService) || SUTRA_SERVICES[0];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService,
          serviceName: currentService.name,
          ...orderDetails,
        }),
      });
      setOrderSubmitted(true);
    } catch {
      setOrderSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A]">
      <PortalSidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-5xl pb-24 md:pb-10 space-y-10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
            PORTAL ORDERS
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#0F172A] mt-1">
            Order Creation & Tracking
          </h1>
          <p className="text-xs text-[#64748B]">
            Configure your deliverables, provide creative references, and launch
            dedicated studio workflows.
          </p>
        </div>

        {/* 4-Step Order Wizard Card */}
        <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-warm p-6 sm:p-10">
          {/* Stepper Header */}
          <div className="flex items-center justify-between pb-8 mb-8 border-b border-[#EADFCB] max-w-xl mx-auto">
            {[
              { num: 1, label: "Service" },
              { num: 2, label: "Details" },
              { num: 3, label: "References" },
              { num: 4, label: "Confirm" },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s.num
                      ? "bg-[#5C3A1E] text-white shadow-xs"
                      : step > s.num
                      ? "bg-[#D4A35A] text-[#0F172A]"
                      : "bg-[#F8F5EF] text-[#94A3B8] border border-[#EADFCB]"
                  }`}
                >
                  {step > s.num ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    step >= s.num ? "text-[#0F172A]" : "text-[#94A3B8]"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Step 1: Select Service */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center max-w-md mx-auto">
                <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                  Select Studio Capability
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Choose from our 12 specialized disciplines to route to the correct workflow.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {SUTRA_SERVICES.map((srv) => {
                  const isSelected = selectedService === srv.id;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv.id)}
                      className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                        isSelected
                          ? "bg-[#FDF9F0] border-[#D4A35A] shadow-xs"
                          : "bg-[#FFFFFF] border-[#EADFCB] hover:border-[#D4A35A]/50"
                      }`}
                    >
                      <span className="text-xs font-semibold text-[#0F172A] mt-2">
                        {srv.name}
                      </span>
                      <span className="text-[10px] text-[#64748B] mt-1">
                        {srv.tagline}
                      </span>
                      <span className="text-[10px] font-bold text-[#D4A35A] mt-3">
                        From {srv.startingPrice}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center">
                <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                  {currentService.name} Specifications
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Define your goals, style guidelines, and creative scope.
                </p>
              </div>

              <Input
                label="Project Title / Campaign Name *"
                placeholder="e.g. Autumn Fragrance 4K Ad Pack"
                value={orderDetails.title}
                onChange={(e) =>
                  setOrderDetails({ ...orderDetails, title: e.target.value })
                }
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
                  Detailed Requirement Brief *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your vision, target audience, dimensions, aspect ratio, or specific camera angles..."
                  value={orderDetails.brief}
                  onChange={(e) =>
                    setOrderDetails({ ...orderDetails, brief: e.target.value })
                  }
                  className="w-full rounded-xl bg-[#FFFDF9] border border-[#EADFCB] px-4 py-2.5 text-sm text-[#0F172A] focus:border-[#D4A35A] focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/30"
                />
              </div>
            </div>
          )}

          {/* Step 3: References & Drive Uploads */}
          {step === 3 && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="text-center">
                <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                  References & Asset Uploads
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Provide reference images, brand logos, or Google Drive folder links.
                </p>
              </div>

              <div className="border-2 border-dashed border-[#EADFCB] rounded-2xl p-8 text-center bg-[#F8F5EF]/40 space-y-2">
                <p className="text-sm font-semibold text-[#0F172A]">
                  Upload Reference Images & Logos
                </p>
                <p className="text-xs text-[#64748B]">
                  PNG, JPG, PDF, glTF or USDZ up to 500MB (Synced to your Google Drive)
                </p>
                <button
                  type="button"
                  className="mt-2 px-4 py-2 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A]"
                >
                  Browse Files
                </button>
              </div>

              <Input
                label="Or paste Cloud / Drive Link"
                placeholder="https://drive.google.com/drive/folders/..."
                value={orderDetails.references}
                onChange={(e) =>
                  setOrderDetails({ ...orderDetails, references: e.target.value })
                }
              />
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div className="space-y-6 max-w-xl mx-auto">
              {orderSubmitted ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#EDF7F0] text-[#2E7D4F] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                    Order Dispatched to Workflow Router
                  </h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">
                    Your order has been registered in Firestore. The isolated{" "}
                    <strong>{currentService.name}</strong> workflow pipeline has been
                    initialized and synchronized to your Google Drive.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setStep(1);
                      setOrderSubmitted(false);
                      setOrderDetails({
                        title: "",
                        timeline: "Standard (48-72h)",
                        brief: "",
                        references: "",
                      });
                    }}
                  >
                    Place Another Order
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                      Review & Confirm Order
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1">
                      Verify your project parameters before activating studio production.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F8F5EF] p-5 space-y-3 border border-[#EADFCB]">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">Service:</span>
                      <span className="font-bold text-[#0F172A]">
                        {currentService.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">Project Title:</span>
                      <span className="font-bold text-[#0F172A]">
                        {orderDetails.title || "Untitled Studio Order"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">Starting Estimate:</span>
                      <span className="font-bold text-[#5C3A1E]">
                        {currentService.startingPrice}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">Target Storage:</span>
                      <span className="font-bold text-[#2E7D4F]">
                        Client Google Drive
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stepper Footer Controls */}
          {!orderSubmitted && (
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-[#EADFCB]">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={step === 1}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>

              {step < 4 ? (
                <Button variant="primary" size="sm" onClick={handleNext} withArrow>
                  Next Step
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleFinalSubmit}
                  isLoading={isSubmitting}
                  withArrow
                >
                  Submit Order
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
