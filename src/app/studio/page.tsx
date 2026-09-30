import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Sparkles, Compass, Cpu, Palette } from "lucide-react";

export default function StudioPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-16">
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4A35A]">
            STUDIO PHILOSOPHY
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#0F172A]">
            Where Vedic Craft Meets Digital Intelligence
          </h1>
          <p className="text-base text-[#64748B] leading-relaxed">
            Sutra Studio was founded on a simple conviction: modern generative
            technology achieves its highest expression when guided by centuries of
            disciplined design wisdom, sacred geometry, and artisanal human craft.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mb-6">
              <Compass className="w-6 h-6 text-[#5C3A1E]" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
              1. Cultural Depth & Proportion
            </h3>
            <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
              We draw inspiration from classical architectural proportion, natural
              materials (sandstone, teak, brass), and restrained ornamentation.
            </p>
          </div>

          <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mb-6">
              <Cpu className="w-6 h-6 text-[#5C3A1E]" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
              2. Isolated AI Workflows
            </h3>
            <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
              Every creative discipline (image, video, 3D, interior) operates inside
              dedicated AI models and n8n pipelines, ensuring precision outputs
              without generic artifacts.
            </p>
          </div>

          <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mb-6">
              <Palette className="w-6 h-6 text-[#5C3A1E]" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
              3. Human Art Direction
            </h3>
            <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
              AI generates speed and scale; our senior art directors and 3D
              supervisors curate, polish, and ensure commercial-grade fidelity.
            </p>
          </div>

          <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-[#5C3A1E]" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
              4. Client Ownership & Cloud Media
            </h3>
            <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
              All master assets, renders, and models are organized directly into
              your private Google Drive workspace with permanent ownership.
            </p>
          </div>
        </div>

        {/* Process Flow */}
        <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-8 md:p-12 text-center space-y-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
            THE SUTRA METHOD
          </span>
          <h2 className="font-serif text-3xl font-semibold text-[#0F172A]">
            How We Deliver in Days, Not Months
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pt-6">
            <div className="space-y-2">
              <p className="font-serif text-2xl font-bold text-[#5C3A1E]">01</p>
              <h4 className="font-semibold text-sm text-[#0F172A]">Intake & AI Routing</h4>
              <p className="text-xs text-[#64748B]">Automated brief analysis and classification</p>
            </div>
            <div className="space-y-2">
              <p className="font-serif text-2xl font-bold text-[#5C3A1E]">02</p>
              <h4 className="font-semibold text-sm text-[#0F172A]">Model Generation</h4>
              <p className="text-xs text-[#64748B]">Rapid iterative drafts produced in hours</p>
            </div>
            <div className="space-y-2">
              <p className="font-serif text-2xl font-bold text-[#5C3A1E]">03</p>
              <h4 className="font-semibold text-sm text-[#0F172A]">Studio Polish</h4>
              <p className="text-xs text-[#64748B]">Human retouching, typography, and grading</p>
            </div>
            <div className="space-y-2">
              <p className="font-serif text-2xl font-bold text-[#5C3A1E]">04</p>
              <h4 className="font-semibold text-sm text-[#0F172A]">Drive Delivery</h4>
              <p className="text-xs text-[#64748B]">Organized cloud storage and instant access</p>
            </div>
          </div>
          <div className="pt-6">
            <Link href="/orders">
              <Button variant="primary" size="md" withArrow>
                Start Your Project
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
