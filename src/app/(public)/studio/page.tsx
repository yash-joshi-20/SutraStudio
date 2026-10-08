import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { VideoCard } from "@/components/media/VideoCard";
import { SutraParticleWings } from "@/components/canvas/SutraParticleWings";
import { Interactive3DViewer } from "@/components/spatial/Interactive3DViewer";
import { PanoramicTourViewer } from "@/components/spatial/PanoramicTourViewer";
import { DeviceMockupShowcase } from "@/components/showcase/DeviceMockupShowcase";
import { MetaAdCreativeMockup } from "@/components/showcase/MetaAdCreativeMockup";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Sparkles, Compass, Cpu, Palette, Box, Layers, Globe, Smartphone, ArrowRight } from "lucide-react";

export default function StudioPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A]">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full space-y-14 sm:space-y-20">
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] shadow-xs">
            <span className="text-[#D4A35A] text-xs">◆</span>
            <span className="text-[10px] md:text-xs font-semibold tracking-[0.22em] text-[#5C3A1E] uppercase">
              STUDIO PHILOSOPHY &amp; SPATIAL ENGINES
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#0F172A] leading-tight">
            Where Vedic Craft Meets <span className="text-gold-gradient">Digital Intelligence</span>
          </h1>

          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-2xl mx-auto font-sans">
            Sutra Studio was founded on a simple conviction: modern computational
            technology achieves its highest expression when guided by centuries of
            disciplined design wisdom, sacred geometry, and artisanal human craft.
          </p>
        </div>

        {/* Studio Showreel Spotlight Card */}
        <div className="max-w-4xl mx-auto w-full">
          <VideoCard
            video="studio-reel"
            badgeText="ATELIER SHOWREEL"
            showTranscriptToggle
            allowExpand
          />
        </div>

        {/* ===================================================
            1. INTERACTIVE 3D SPATIAL MODEL PIPELINE
            =================================================== */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#EADFCB] pb-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4A35A] flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5" />
                REAL-TIME WEBGL 2.0 PBR ENGINE
              </span>
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold text-[#0F172A] mt-1">
                3D Spatial Model &amp; Interactive Mesh Viewer
              </h2>
            </div>
            <p className="text-xs text-[#64748B] max-w-xs sm:text-right">
              Drag to orbit 360°, scroll to zoom, and toggle materials with real-time physical lighting.
            </p>
          </div>

          <Interactive3DViewer
            height="460px"
            title="3D Spatial Asset Pipeline • WebGL 2.0"
            subtitle="PBR Metallic Sheen &amp; Physical Ray-traced Highlights"
            allowPresetSwitch={true}
          />
        </div>

        {/* ===================================================
            2. INTERACTIVE 360° EQUIRECTANGULAR SPATIAL TOUR
            =================================================== */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#EADFCB] pb-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4A35A] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                VIRTUAL REALITY &amp; SPATIAL TOURS
              </span>
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold text-[#0F172A] mt-1">
                360° Panoramic Equirectangular Villa Tour
              </h2>
            </div>
            <p className="text-xs text-[#64748B] max-w-xs sm:text-right">
              Swipe or drag to look around 360° inside luxury architectural interiors with ambient golden lighting.
            </p>
          </div>

          <PanoramicTourViewer
            height="460px"
            title="The Banyan Pavilion • 360° VR Spatial Tour"
            subtitle="Calacatta Gold Marble &amp; Teakwood Architectural Heritage"
          />
        </div>

        {/* ===================================================
            3. COMPUTATIONAL SACRED GEOMETRY PARTICLE MATRIX
            =================================================== */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#EADFCB] pb-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4A35A] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                MATHEMATICAL SYMMETRY
              </span>
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold text-[#0F172A] mt-1">
                3D Particle Light Matrix &amp; Sacred Geometry
              </h2>
            </div>
            <p className="text-xs text-[#64748B] max-w-xs sm:text-right">
              Interact with the flowing golden particle vector field inspired by Vedic symmetry.
            </p>
          </div>

          <div className="w-full overflow-hidden rounded-3xl border border-[#EADFCB] shadow-warm">
            <SutraParticleWings
              height="420px"
              initialMode="wings"
              showControls={true}
              interactive={true}
            />
          </div>
        </div>

        {/* ===================================================
            4. RESPONSIVE WEB & MOBILE DEVICE SHOWCASE
            =================================================== */}
        <div className="space-y-4">
          <DeviceMockupShowcase initialMode="dual" />
        </div>

        {/* ===================================================
            5. ARCHITECTURAL INTERIOR & META ADS SPOTLIGHT
            =================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Indian Symmetry Architectural Interior Card */}
          <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 space-y-4 shadow-warm">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-semibold text-[#5C3A1E] uppercase">
              <span>◆</span>
              <span>INTERIOR ARCHITECTURE PIPELINE</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#171717]">
              Indian Symmetry &amp; Jali Screen Aesthetics
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Photorealistic architectural rendering balancing natural limestone, intricate brass jali screens, and 3000K recessed lighting.
            </p>

            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-[#EADFCB] shadow-sm group">
              <img
                src="https://image.pollinations.ai/prompt/architectural%20interior%20rendering%2C%20minimalist%20luxury%20living%20space%2C%20intricate%20golden%20jali%20screens%2C%20calacatta%20gold%20marble%20floors%2C%20recessed%203000k%20warm%20led%2C%20hasselblad%20photography%2C%208k?width=1200&height=800&nologo=true"
                alt="Architectural Interior Render"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#171717]/80 backdrop-blur-md text-[9px] font-mono text-[#D4A35A] font-bold border border-white/10">
                8K DIFFUSION PASS
              </div>
            </div>
          </div>

          {/* Meta Ads Growth Engine Mockup */}
          <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 space-y-4 shadow-warm">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-semibold text-[#5C3A1E] uppercase">
              <span>◆</span>
              <span>GROWTH &amp; META ADS PIPELINE</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#171717]">
              Autonomous Meta Ads Campaign Creative
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              High-CTR multi-ratio creative ads engineered with high-conversion hooks and automated campaign deployment.
            </p>

            <MetaAdCreativeMockup
              headline="Transform your creative presence with Vedic spatial craft."
              ctaText="Book Pipeline"
              ctaHref="/orders?service=meta-ads-launcher"
            />
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mb-6">
              <Compass className="w-6 h-6 text-[#5C3A1E]" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
              1. Cultural Depth &amp; Proportion
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
              2. Dedicated Production Pipelines
            </h3>
            <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
              Every creative discipline (image, video, 3D, interior) operates inside
              dedicated high-precision production pipelines, ensuring photorealistic outputs
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
              Computational automation delivers speed and precision; our senior art directors and 3D
              supervisors curate, polish, and ensure commercial-grade fidelity.
            </p>
          </div>

          <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6 text-[#5C3A1E]" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">
              4. Client Ownership &amp; Cloud Media
            </h3>
            <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
              All master assets, renders, and models are organized directly into
              your private Sutra Cloud Vault workspace with permanent ownership.
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
              <h4 className="font-semibold text-sm text-[#0F172A]">Intake &amp; Scope Classification</h4>
              <p className="text-xs text-[#64748B]">Automated brief analysis and production staging</p>
            </div>
            <div className="space-y-2">
              <p className="font-serif text-2xl font-bold text-[#5C3A1E]">02</p>
              <h4 className="font-semibold text-sm text-[#0F172A]">Production Drafting</h4>
              <p className="text-xs text-[#64748B]">Rapid iterative passes rendered in hours</p>
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
