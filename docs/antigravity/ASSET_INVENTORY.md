# SUTRA STUDIO — ASSET INVENTORY & MEDIA AUDIT

**Date**: 2026-10-13  
**Stage**: Phase 0 — Comprehensive Audit  
**Branch**: `feature/master-website-transformation`  
**Auditor**: Senior Full-Stack Engineer, Design Systems Architect & Asset Curator  

---

## 1. Brand Identity & Vector Assets

| Asset Path | Type | Dimensions / Format | Status & Usage | Fidelity / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `public/brand/sutra-symbol.png` | Symbol Emblem | 2102 KB, Transparent PNG | **Active Brand Mark** | High-resolution gold lotus & geometric emblem used in 3D medallion and hero watermarks. |
| `public/brand/sutra-monogram.png` | Monogram Mark | 1904 KB, Transparent PNG | **Active Monogram** | Interlocking geometric 'S' monogram used on the back face of 3D medallion and avatar badges. |
| `public/brand/LOGO/sutra-logo-primary.png` | Full Lockup | 1330 KB, PNG | **Official Horizontal Lockup** | Primary horizontal brand lockup (emblem + Sutra Studio wordmark). |
| `public/brand/sutra-favicon.png` | Favicon | 1904 KB, Square PNG | **Active Favicon** | Referenced in Next.js metadata and app icon link tags. |
| `public/brand/sutra-app-icon.png` | App Icon | 8039 KB, Square PNG | **Mobile PWA Icon** | High-res 512×512 PWA app icon. |
| `public/brand/sutra-watermark-light.png` | Watermark | 2147 KB, PNG | **Background Accent** | Warm ivory ambient watermark used on public marketing pages. |
| `public/brand/sutra-watermark-dark.png` | Watermark | 1272 KB, PNG | **Background Accent** | Dark ambient watermark for dark modal viewports. |
| `src/components/brand/SutraLogo.tsx` | Inline SVG | Scalable Vector | **Primary Navbar & Header** | High-precision vector component supporting `lotus`, `monogram`, and `full` brand lockups with gold gradient. |

---

## 2. Portfolio Project Assets

| Project | Category | Classification | File Location | Live URL / Source | Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sutra Studio Atelier** | `Website` | `Studio Flagship` | `/assets/showcase/live-home-desktop.png` | `https://sutrastudios.in` | **Verified Live Atelier** |
| **Viva Live Better** | `Website` | `Client Work` | `/images/projects/viva-lifestyle.png` | User-provided screenshot | **Verified Client Deliverable** (E-Commerce Storefront) |
| **Shri Ram Tech** | `Design` | `Client Work` | `/images/projects/shri-ram-tech.png` | User-provided screenshot | **Verified Client Deliverable** (Tech Agency Platform) |
| **Yash Joshi QA** | `Website` | `Client Work` | `/images/projects/yash-joshi-qa.png` | User-provided screenshot | **Verified Portfolio Deliverable** (Quality Engineering) |
| **Crème d'Or** | `Design` | `Client Work` | `/images/projects/creme-dor.png` | User-provided screenshot | **Verified Client Deliverable** (Artisanal Gelateria) |
| **Koenigsegg Apex Velocity** | `3D` | `Client Work` | `/images/projects/koenigsegg-velocity.png` | User-provided screenshot | **Verified Client Deliverable** (3D Automotive Twin) |
| **Vitrine Salon & Spa** | `Website` | `Client Work` | `/images/projects/vitrine-salon.png` | User-provided screenshot | **Verified Client Deliverable** (Luxury Beauty Atelier) |
| **The Banyan Pavilion** | `Interior` | `Studio Concept` | `/images/projects/proj-interior.webp` | Internal 3D Concept | **Studio Concept (Explicitly Labeled)** |
| **Amrutam Botanicals** | `Image` | `Studio Concept` | `/images/projects/proj-ayurveda.webp` | Internal CGI Concept | **Studio Concept (Explicitly Labeled)** |
| **Noir Atelier** | `Image` | `Studio Concept` | `/images/projects/proj-perfume.webp` | Internal CGI Concept | **Studio Concept (Explicitly Labeled)** |

---

## 3. Video & Motion Showreel Assets

| Video Asset | Resolution & Format | File Size | Location | Role & Fallback |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Background Video** | 1080p MP4 + WebM | 1.1 MB / 1.5 MB | `public/videos/hero/hero-desktop.mp4` | Ambient hero video background with poster fallback `hero-poster.webp`. |
| **Studio Atelier Showreel** | 1080p MP4 + WebM | 1.3 MB / 2.1 MB | `public/videos/studio/studio-reel-desktop.mp4` | Main atelier showreel with modal playback and poster fallback `studio-poster.webp`. |
| **Spatial 3D Preview Video** | 1080p MP4 + WebM | 1.3 MB / 1.6 MB | `public/videos/services/spatial-3d-desktop.mp4` | High-fidelity spatial 3D showcase video with `spatial-3d-poster.webp`. |
| **AI Video Production Reel** | 1080p MP4 + WebM | 1.0 MB / 1.2 MB | `public/videos/services/ai-video-desktop.mp4` | Commercial short-form motion reel showcase with `ai-video-poster.webp`. |
| **Mobile App Walkthrough** | 1080p MP4 + WebM | 0.7 MB / 1.1 MB | `public/videos/app/app-demo-desktop.mp4` | Interactive mobile app feature demonstration with `app-demo-poster.webp`. |

---

## 4. 3D & Spatial Interactive Components

| Component | Technology | Asset Dependencies | Accessibility & Fallbacks |
| :--- | :--- | :--- | :--- |
| `Sutra3DLogoShowcase` | Three.js WebGL PBR | `sutra-symbol.png`, `sutra-monogram.png` | 360° orbital controls, auto-rotate toggle, `prefers-reduced-motion` compliance, and automatic 2D static fallback. |
| `Interactive3DViewer` | WebGL 2.0 PBR Shader | Procedural geometry & lighting | Full drag-to-orbit, zoom, preset material switcher, and mobile canvas bounds protection. |
| `PanoramicTourViewer` | Equirectangular 360° | `public/images/services/360-view.webp` | Gyroscope / touch drag controls, VR tour simulation, and fallback image. |
| `SutraParticleWings` | Canvas 2D Vector Field | Mathematical parametric curves | Low-cost CPU/GPU particle field with toggleable interactivity. |

---

## 5. Service Discipline Thumbnails

All 12 core disciplines maintain dedicated web-optimized WebP thumbnails:
- `360-view.webp` (18 KB)
- `3d-modeling.webp` (23 KB)
- `digital-marketing.webp` (26 KB)
- `image-creation.webp` (22 KB)
- `interior-design.webp` (58 KB)
- `meta-ads-launcher.webp` (54 KB)
- `mobile-app-setup.webp` (21 KB)
- `video-creation.webp` (35 KB)
- `web-app-development.webp` (23 KB)
- `website-development.webp` (24 KB)
- `window-design.webp` (38 KB)
- `workflow-automation.webp` (26 KB - Internal only)

---

## 6. Real Client Asset Checklist & Missing Materials

In strict accordance with **Rule §1 & §7** (*Never present AI-generated work as a completed client project; request missing materials rather than fabricating*):

| Required Asset | Purpose | Current State | Action Item |
| :--- | :--- | :--- | :--- |
| **Official Client Case Study Video Files** | High-res client testimonial or video walkthroughs | Local demo reels active | Founder to provide raw video files if dedicated client video case studies are desired. |
| **Live Project External Domains** | Clickable client website links | Verified for live projects (`sutrastudios.in`) | Additional external client URLs to be added as live deployments are confirmed. |
| **Client Testimonial Signed Approvals** | Real client reviews with names and company logos | All fabricated reviews removed | Real testimonials will remain hidden until client-signed feedback forms are received. |
| **Meta WhatsApp Business API Credentials** | Production WhatsApp Cloud Messaging | Mock fallback active | Requires `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN` for live WhatsApp delivery. |
