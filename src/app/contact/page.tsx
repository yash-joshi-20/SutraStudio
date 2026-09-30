"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Card";
import { Bot, Mail, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    serviceType: "Image Creation",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Fallback submission acknowledgement
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Contact Info & AI Entry */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4A35A]">
                START A CONVERSATION
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#0F172A] mt-2 leading-tight">
                Let&apos;s Build Something Extraordinary
              </h1>
              <p className="text-sm text-[#64748B] mt-4 leading-relaxed">
                Have a project brief, custom architectural render requirement, or
                growth marketing goal? Share your vision with our creative team.
              </p>
            </div>

            {/* AI Assistant Quick Card */}
            <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#5C3A1E]" />
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-[#0F172A]">
                    Talk to Sutra AI Assistant
                  </h4>
                  <p className="text-xs text-[#64748B]">Instant brief intake & guidance</p>
                </div>
              </div>
              <p className="text-xs text-[#525252] leading-relaxed">
                Need an immediate estimate or workflow routing? Our AI assistant
                classifies requirements and prepares your order draft in minutes.
              </p>
              <Link href="/chat" className="inline-block w-full">
                <Button variant="secondary" size="sm" className="w-full">
                  Open AI Chat
                </Button>
              </Link>
            </div>

            {/* Direct Studio Details */}
            <div className="space-y-4 text-sm text-[#475569]">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#5C3A1E]" />
                <span>concierge@sutrastudio.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#5C3A1E]" />
                <span>Sutra Digital Studio • Mumbai / Global</span>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-8 sm:p-10 shadow-sm">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#EDF7F0] text-[#2E7D4F] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                    Inquiry Received
                  </h3>
                  <p className="text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
                    Thank you, {formData.name || "Client"}. Our creative lead will
                    review your brief and respond within 24 hours.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        company: "",
                        serviceType: "Image Creation",
                        message: "",
                      });
                    }}
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
                    Client Inquiry Form
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Name *"
                      required
                      placeholder="e.g. Yash Joshi"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    <Input
                      label="Work Email *"
                      type="email"
                      required
                      placeholder="yash@company.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Company / Brand"
                      placeholder="e.g. Studio Living"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                    />
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
                        Service Needed *
                      </label>
                      <select
                        value={formData.serviceType}
                        onChange={(e) =>
                          setFormData({ ...formData, serviceType: e.target.value })
                        }
                        className="w-full rounded-xl bg-[#FFFDF9] border border-[#EADFCB] px-4 py-2.5 text-sm text-[#0F172A] focus:border-[#D4A35A] focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/30"
                      >
                        <option value="Image Creation">Image Creation</option>
                        <option value="Video Creation">Video Creation</option>
                        <option value="3D Modeling">3D Modeling</option>
                        <option value="360 View">360 View</option>
                        <option value="Interior Design">Interior Design</option>
                        <option value="Window Design">Window Design</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                        <option value="Meta Ads Launcher">Meta Ads Launcher</option>
                        <option value="Website Development">Website Development</option>
                        <option value="Web App Development">Web App Development</option>
                        <option value="Mobile App Setup">Mobile App Setup</option>
                        <option value="AI Automation">AI Automation</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
                      Project Scope & Goals *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Tell us about your brand, timeline, references, and deliverables..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full rounded-xl bg-[#FFFDF9] border border-[#EADFCB] px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#D4A35A] focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/30"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-2"
                    isLoading={loading}
                    withArrow
                  >
                    Send Inquiry
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
