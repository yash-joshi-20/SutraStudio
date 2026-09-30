import React from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SutraLogo, LotusSymbol } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Award, Shield, Clock, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-16">
        {/* Split Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4A35A]">
              ABOUT SUTRA STUDIO
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight text-[#0F172A]">
              Bridging Millennia of Indian Aesthetic Tradition with Modern AI Engineering
            </h1>
            <p className="text-base text-[#475569] leading-relaxed">
              &quot;Sutra&quot; translates in Sanskrit to an aphorism, a thread, or an
              underlying rule connecting disparate ideas into a coherent whole.
              At Sutra Studio, we are the thread connecting artistic intuition with
              generative intelligence.
            </p>
            <p className="text-sm text-[#64748B] leading-relaxed">
              We engineer commercial visual assets, interactive web architecture,
              and 3D spatial models for forward-thinking brands who seek the warmth
              and depth of traditional craftsmanship without compromising on
              modern digital speed.
            </p>
            <div className="pt-2">
              <Link href="/contact">
                <Button variant="primary" size="md" withArrow>
                  Start a Conversation
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden shadow-xl border-4 border-[#FFFDF9] bg-[#EADFCB]">
              <Image
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80"
                alt="Sutra Studio Craft and Heritage"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Heritage Trust Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-[#EADFCB]">
          <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-center">
            <Award className="w-6 h-6 text-[#5C3A1E] mx-auto mb-2" />
            <p className="font-serif text-3xl font-bold text-[#5C3A1E]">500+</p>
            <p className="text-xs text-[#64748B] mt-1">Projects Delivered Worldwide</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-center">
            <Users className="w-6 h-6 text-[#5C3A1E] mx-auto mb-2" />
            <p className="font-serif text-3xl font-bold text-[#5C3A1E]">200+</p>
            <p className="text-xs text-[#64748B] mt-1">Active Client Partnerships</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-center">
            <Clock className="w-6 h-6 text-[#5C3A1E] mx-auto mb-2" />
            <p className="font-serif text-3xl font-bold text-[#5C3A1E]">48h</p>
            <p className="text-xs text-[#64748B] mt-1">Average Rapid Delivery Time</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] text-center">
            <Shield className="w-6 h-6 text-[#5C3A1E] mx-auto mb-2" />
            <p className="font-serif text-3xl font-bold text-[#5C3A1E]">100%</p>
            <p className="text-xs text-[#64748B] mt-1">IP & Commercial Rights Guaranteed</p>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
