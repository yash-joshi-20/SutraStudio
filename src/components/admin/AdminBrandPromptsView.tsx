"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Search,
  Filter,
  Layers,
  Image as ImageIcon,
  Video,
  Box,
  Compass,
  Home,
  Layout,
  Megaphone,
  Globe,
  Smartphone,
  Cpu,
  Download,
  ExternalLink,
  BookOpen,
  Share2,
  FileText,
  Code2,
  Sliders,
  CheckCircle2,
  Terminal,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface PromptItem {
  id: string;
  title: string;
  category: "brand_style" | "social_feed" | "services" | "prompt_builders" | "video_motion" | "voiceover" | "meta_ads";
  serviceName?: string;
  format: string;
  engine: "FLUX.1 / SDXL" | "Kling AI Video" | "ElevenLabs / Gemini" | "Meta Ads JSON" | "Any Diffusion" | "LLM System Prompt / Agent";
  aspectRatio?: string;
  promptText: string;
  negativePrompt?: string;
  instructions?: string;
  tags: string[];
}

export const MASTER_PROMPTS_DATA: PromptItem[] = [
  // =========================================================================
  // 1. BRAND STYLE & NEGATIVE TOKENS
  // =========================================================================
  {
    id: "prompt-brand-style-core",
    title: "Master Brand Style & Palette Suffix Block",
    category: "brand_style",
    format: "Universal Suffix",
    engine: "Any Diffusion",
    promptText: `BRAND STYLE: premium warm minimal studio aesthetic. Palette: deep chocolate brown #5C3A1E, antique gold #D4A35A, ink navy #0F172A, soft cream background #F8F5EF, warm white #FFFDF9. Soft natural light, subtle gold highlights, generous negative space, rounded-corner cards, clean sans-serif look, calm and professional.`,
    negativePrompt: `neon colors, purple or cyan glow, cartoon style, low resolution, distorted or fake text, watermark, clutter, extra fingers, other brands logos, stock-photo cliche.`,
    instructions: "Attach this brand style block to the end of every creative prompt for 100% brand consistency across Midjourney, FLUX, and SDXL.",
    tags: ["Core", "Brand", "Palette", "Tokens"],
  },

  // =========================================================================
  // 2. SOCIAL MEDIA POSTS & TEMPLATES
  // =========================================================================
  {
    id: "prompt-feed-square",
    title: "Instagram Feed Post (1:1 / 4:5 Master Template)",
    category: "social_feed",
    format: "1:1 / 4:5 Static",
    engine: "FLUX.1 / SDXL",
    aspectRatio: "1:1 or 4:5",
    promptText: `Square Instagram post visual for Sutra Studio, a premium creative and digital studio. Subject: {SUBJECT}. Composition: large calm negative space at the top-left reserved for a headline (do not render any text), subject on the lower-right third, soft natural window light, subtle gold rim highlights. Photorealistic, high detail, premium editorial look. BRAND STYLE: premium warm minimal studio aesthetic. Palette: deep chocolate brown #5C3A1E, antique gold #D4A35A, ink navy #0F172A, soft cream background #F8F5EF, warm white #FFFDF9. Soft natural light, subtle gold highlights, generous negative space, rounded-corner cards, clean sans-serif look, calm and professional.`,
    negativePrompt: `neon colors, purple or cyan glow, cartoon style, low resolution, distorted or fake text, watermark, clutter, extra fingers, other brands logos, stock-photo cliche.`,
    instructions: "Leave top-left clear for headline overlay in Canva/Compositor.",
    tags: ["Instagram", "Facebook", "Feed", "Square"],
  },
  {
    id: "prompt-carousel-5slide",
    title: "5-Slide Educational Carousel (4:5 Portrait)",
    category: "social_feed",
    format: "4:5 Multi-Slide",
    engine: "FLUX.1 / SDXL",
    aspectRatio: "4:5",
    promptText: `Create 5 matching 4:5 carousel background images for Sutra Studio about {SERVICE}. Same palette and lighting on all slides. Slide 1: bold hook scene with large empty area for a title. Slides 2-4: one clear visual idea each (problem, process, result) with space for a short caption. Slide 5: calm cream background with a centered empty area for the logo and call to action. No text inside the images. BRAND STYLE: premium warm minimal studio aesthetic. Palette: deep chocolate brown #5C3A1E, antique gold #D4A35A, ink navy #0F172A, soft cream background #F8F5EF, warm white #FFFDF9. Soft natural light, subtle gold highlights, generous negative space, rounded-corner cards, clean sans-serif look, calm and professional.`,
    negativePrompt: `neon colors, purple or cyan glow, cartoon style, low resolution, distorted or fake text, watermark, clutter, extra fingers, other brands logos, stock-photo cliche.`,
    instructions: "Export 5 matching slides with consistent warm cream lighting.",
    tags: ["Carousel", "Instagram", "Educational"],
  },
  {
    id: "prompt-story-reel-cover",
    title: "Story & Reel Cover Safe-Zone (9:16 Vertical)",
    category: "social_feed",
    format: "9:16 Vertical",
    engine: "FLUX.1 / SDXL",
    aspectRatio: "9:16",
    promptText: `Vertical 9:16 story background for Sutra Studio: {SUBJECT}, centered in the middle third, keep the top 13% and bottom 18% visually quiet, cream and soft gold gradient, gentle depth of field. No text. BRAND STYLE: premium warm minimal studio aesthetic. Palette: deep chocolate brown #5C3A1E, antique gold #D4A35A, ink navy #0F172A, soft cream background #F8F5EF, warm white #FFFDF9. Soft natural light, subtle gold highlights, generous negative space, rounded-corner cards, clean sans-serif look, calm and professional.`,
    negativePrompt: `neon colors, purple or cyan glow, cartoon style, low resolution, distorted or fake text, watermark, clutter, extra fingers, other brands logos, stock-photo cliche.`,
    instructions: "Safe zone compliant: top 13% and bottom 18% quiet for Instagram UI overlay.",
    tags: ["Reel Cover", "Story", "Vertical"],
  },
  {
    id: "prompt-fb-cover-wide",
    title: "Facebook Page Header / Panoramic Cover",
    category: "social_feed",
    format: "16:9 Banner",
    engine: "FLUX.1 / SDXL",
    aspectRatio: "16:9",
    promptText: `Wide banner (16:9) for Sutra Studio Facebook page: calm modern studio workspace with soft warm lighting, a subtle gold lotus emblem embossed on a warm white wall, minimalist design desk on the right third with architectural plans and clean laptop, left two-thirds open cream background with soft shadows for profile picture clearance. Ultra-clean, premium, welcoming. BRAND STYLE: premium warm minimal studio aesthetic. Palette: deep chocolate brown #5C3A1E, antique gold #D4A35A, ink navy #0F172A, soft cream background #F8F5EF, warm white #FFFDF9.`,
    negativePrompt: `neon colors, purple or cyan glow, cartoon style, low resolution, distorted or fake text, watermark, clutter.`,
    instructions: "Designed with profile picture clearance on the left third.",
    tags: ["Facebook", "Header", "Cover"],
  },

  // =========================================================================
  // 3. 12 STUDIO SERVICES PROMPTS (READY TO COPY & GENERATE)
  // =========================================================================
  {
    id: "srv-01-image",
    title: "01. AI Image Creation Showcase",
    serviceName: "AI Image Creation",
    category: "services",
    format: "1:1 & 4:5",
    engine: "FLUX.1 / SDXL",
    promptText: `Hero visual for Sutra Studio AI Image Creation service: a luxury perfume bottle resting on a warm travertine stone slab, surrounded by floating golden specks and soft cream linen draping, warm side lighting, soft depth of field, ultra-photorealistic, 8k resolution. BRAND STYLE: deep chocolate brown #5C3A1E, antique gold #D4A35A, ink navy #0F172A, soft cream background #F8F5EF, warm white #FFFDF9.`,
    negativePrompt: `neon colors, purple or cyan glow, cartoon style, low resolution, distorted text, watermark, clutter.`,
    tags: ["Image Creation", "Commercial", "Photorealism"],
  },
  {
    id: "srv-02-video",
    title: "02. AI Video Creation & Cinematic Reel",
    serviceName: "AI Video Creation",
    category: "services",
    format: "9:16 Vertical",
    engine: "Kling AI Video",
    promptText: `Smooth cinematic slow-motion pan across an ultra-premium Indian atelier studio workspace, warm golden hour sunlight streaming through arched windows onto warm cream surfaces, polished brass detailing, cinematic 4K camera glide. BRAND STYLE: deep chocolate brown #5C3A1E, antique gold #D4A35A, soft cream background #F8F5EF.`,
    negativePrompt: `fast cuts, shaky cam, cyberpunk, neon lighting, low quality.`,
    tags: ["Video Production", "Cinematic", "4K"],
  },
  {
    id: "srv-03-3d",
    title: "03. 3D Modeling & Product Visualization",
    serviceName: "3D Modeling",
    category: "services",
    format: "1:1 Square",
    engine: "FLUX.1 / SDXL",
    promptText: `Clean 3D architectural model visualization: modern luxury armchair sculpted with rich warm brown boucle fabric and brushed brass legs, resting on an elevated warm white podium with soft studio lighting, soft cream background, studio lighting. BRAND STYLE: deep chocolate brown #5C3A1E, antique gold #D4A35A, soft cream #F8F5EF.`,
    negativePrompt: `low poly artifacts, harsh neon shadows, distorted geometry.`,
    tags: ["3D Modeling", "Product Shot", "WebGL"],
  },
  {
    id: "srv-04-360",
    title: "04. 360 Virtual Tour & Spatial Architecture",
    serviceName: "360 Virtual Tour",
    category: "services",
    format: "16:9 Panoramic",
    engine: "FLUX.1 / SDXL",
    promptText: `Equirectangular panoramic architectural interior of a luxury penthouse lounge, polished marble flooring, warm teak wood paneling, floor-to-ceiling glass windows overlooking a serene courtyard, soft gold accent lighting, ultra-wide angle, 8k render. BRAND STYLE: deep chocolate brown #5C3A1E, antique gold #D4A35A, cream #F8F5EF.`,
    negativePrompt: `stitched seam errors, distorted furniture proportions, overexposure.`,
    tags: ["360 Tour", "Spatial", "Architecture"],
  },
  {
    id: "srv-05-interior",
    title: "05. Interior Architectural Rendering",
    serviceName: "Interior Design",
    category: "services",
    format: "4:5 Portrait",
    engine: "FLUX.1 / SDXL",
    promptText: `Architectural interior photograph of a warm minimalist living room, bespoke beige sofa with chocolate brown throw pillows, brass fluted coffee table, cream lime-wash walls, soft ambient light, architectural digest aesthetic. BRAND STYLE: deep chocolate brown #5C3A1E, antique gold #D4A35A, soft cream #F8F5EF.`,
    negativePrompt: `cluttered room, cheap furniture, harsh flash lighting, distorted perspective.`,
    tags: ["Interior Design", "Living Room", "Architectural"],
  },
  {
    id: "srv-06-window",
    title: "06. Window & Facade Elevation Design",
    serviceName: "Window Design",
    category: "services",
    format: "1:1 Square",
    engine: "FLUX.1 / SDXL",
    promptText: `Clean architectural elevation drawing and photorealistic render of a contemporary villa facade with warm bronze aluminium slimline sliding windows, textured cream sandstone cladding, subtle exterior warm uplighting. BRAND STYLE: deep chocolate brown #5C3A1E, antique gold #D4A35A, cream background #F8F5EF.`,
    negativePrompt: `crooked lines, cartoon blueprints, plastic frames, distorted reflections.`,
    tags: ["Window Design", "Facade", "Elevation"],
  },
  {
    id: "srv-07-digital",
    title: "07. Digital Marketing & Growth Strategy",
    serviceName: "Digital Marketing",
    category: "services",
    format: "1:1 Square",
    engine: "FLUX.1 / SDXL",
    promptText: `Clean analytical workspace showing growth charts on an iPad tablet, brass pen, premium warm coffee mug, cream notebook with neat handwriting, soft morning sun, high-end agency vibe. BRAND STYLE: deep chocolate brown #5C3A1E, antique gold #D4A35A, soft cream #F8F5EF.`,
    negativePrompt: `messy desk, fake stock model smiling at camera, loud colorful charts.`,
    tags: ["Marketing", "Analytics", "Growth"],
  },
  {
    id: "srv-08-meta-ads",
    title: "08. Meta Ads Campaign Launcher",
    serviceName: "Meta Ads Launcher",
    category: "services",
    format: "4:5 Portrait",
    engine: "FLUX.1 / SDXL",
    promptText: `High-converting luxury ad creative mock-up with generous negative space, a sleek floating glass card showing 3.8x ROAS metric in muted gold font, warm cream background, subtle drop shadows, refined studio aesthetic. BRAND STYLE: deep chocolate brown #5C3A1E, antique gold #D4A35A, soft cream #F8F5EF.`,
    negativePrompt: `neon red arrows, clickbait badges, loud colors, low resolution.`,
    tags: ["Meta Ads", "Creative Ad", "Conversion"],
  },
  {
    id: "srv-09-website",
    title: "09. Website Development & Next.js Architecture",
    serviceName: "Website Development",
    category: "services",
    format: "16:9 Desktop UI",
    engine: "FLUX.1 / SDXL",
    promptText: `Perspective mockup of a luxury studio website displayed on a sleek matte silver laptop screen, warm ivory background, refined serif typography, crisp modern grid layout, soft shadow beneath device, studio setting. BRAND STYLE: deep chocolate brown #5C3A1E, antique gold #D4A35A, soft cream #F8F5EF.`,
    negativePrompt: `generic stock tech illustrations, blue neon wires, pixelated screens.`,
    tags: ["Web Design", "Next.js", "Portfolio"],
  },
  {
    id: "srv-10-webapp",
    title: "10. Web App Development & Cloud Portal",
    serviceName: "Web App Development",
    category: "services",
    format: "16:9 SaaS Dashboard",
    engine: "FLUX.1 / SDXL",
    promptText: `Clean minimal SaaS dashboard interface mockup on an ultra-thin monitor, displaying analytics, pipeline stages, and client vault status in warm cream and slate tones with brass badges, modern clean software atelier. BRAND STYLE: deep chocolate brown #5C3A1E, antique gold #D4A35A, soft cream #F8F5EF.`,
    negativePrompt: `dark hacker interface, terminal matrix green, crowded widgets.`,
    tags: ["Web App", "Dashboard", "SaaS"],
  },
  {
    id: "srv-11-mobile",
    title: "11. Mobile App Setup & Cross-Platform UI",
    serviceName: "Mobile App Setup",
    category: "services",
    format: "9:16 Mobile UI",
    engine: "FLUX.1 / SDXL",
    promptText: `Two floating iPhone mockups displaying a luxury creative atelier app, warm ivory UI cards, elegant typography, smooth micro-interactions, soft cream backdrop, subtle depth of field. BRAND STYLE: deep chocolate brown #5C3A1E, antique gold #D4A35A, soft cream #F8F5EF.`,
    negativePrompt: `bulky phone cases, bright primary colors, distorted screen bezels.`,
    tags: ["Mobile App", "iOS", "Android"],
  },
  {
    id: "srv-12-ai-auto",
    title: "12. AI Automation & Intelligent Workflows",
    serviceName: "AI Automation",
    category: "services",
    format: "1:1 Square",
    engine: "FLUX.1 / SDXL",
    promptText: `Visual representation of seamless automation: golden interconnected nodal threads flowing through warm frosted glass nodes on a warm cream surface, elegant, sophisticated, intelligent studio technology. BRAND STYLE: deep chocolate brown #5C3A1E, antique gold #D4A35A, soft cream #F8F5EF.`,
    negativePrompt: `neon cyberpunk circuits, robot hands, cheesy AI brains, blue laser glows.`,
    tags: ["AI Automation", "n8n", "Smart Workflows"],
  },

  // =========================================================================
  // 4. 12 MASTER SYSTEM PROMPT BUILDERS (FROM SYSTEM PROMPT PACK)
  // =========================================================================
  {
    id: "builder-01-image",
    title: "Master Builder: AI Image Creation System Prompt",
    category: "prompt_builders",
    format: "System Prompt",
    engine: "LLM System Prompt / Agent",
    promptText: `# IMAGE CREATION MASTER PROMPT BUILDER

Paste everything below the line into any AI as a system prompt. Then give a one-line idea.

---

## ROLE
You are an expert AI Image Prompt Engineer and Art Director.
Your job is to take a user's simple image idea and convert it into ONE detailed, production-ready prompt that a specialist AI tool can execute with minimal back-and-forth.

## CONVERSATION FLOW
1. Start every new project by asking: "What image would you like to create? Describe your idea in simple words."
2. Wait for the answer. If the idea is already given, do not ask again.
3. If the user shares a reference (URL, screenshot, photo, mockup, existing file or code), study it first and follow it unless told otherwise.
4. Do not interrogate the user for details that can reasonably be inferred.
5. Ask ONE follow-up question only when a missing detail would materially change the result: image type (ad, product, mockup), aspect ratio, or exact text to show on the image.
6. Otherwise make sensible decisions yourself and state your assumptions in one line at the top of the prompt.

## BUILD THE PROMPT USING THESE COMPONENTS
### 1. IMAGE TYPE: Product shot, lifestyle, ad creative, mockup, banner, social post, thumbnail, packaging, poster.
### 2. SUBJECT: Every important product, person or object, clearly identified. Distinguish multiple subjects.
### 3. APPEARANCE: Shape, material, finish, color, key design details, orientation.
### 4. SCENE + BACKGROUND: Surface, props, background, depth, atmosphere, time of day.
### 5. LIGHTING: Direction, softness, reflections, shadows, contrast, rim light.
### 6. CAMERA + COMPOSITION: Angle (eye level, top-down, low angle), lens feel (35mm, 85mm, macro), framing, depth of field.
### 7. STYLE + COLOR: Mood (luxury, minimal, playful), color palette with hex values, finish (photoreal, 3D render).
### 8. TEXT ON IMAGE: Exact copy, font style, placement, hierarchy. If none, state "no text".
### 9. OUTPUT SPEC: Aspect ratio (1:1, 4:5, 9:16, 16:9), resolution, transparent or solid background.

## NEGATIVES + CONSTRAINTS
- Warped or wrong product shape, wrong logo
- Garbled or misspelled text
- Extra objects, duplicate subjects
- Plastic skin, distorted hands, extra fingers
- Inconsistent lighting or shadows
- Watermarks, unintended logos

## OUTPUT FORMAT
**IMAGE GENERATION PROMPT**
Write ONE detailed, production-ready prompt that naturally follows this order:
Image Type, Subject, Appearance, Scene, Lighting, Camera, Style + Color, Text, Output Spec, Negatives.`,
    instructions: "Paste this as a System Prompt in ChatGPT, Gemini, or Claude. Then provide a 1-line idea to receive a master image generation prompt.",
    tags: ["Builder", "Image Prompt", "System Instruction"],
  },
  {
    id: "builder-02-video",
    title: "Master Builder: Video Creation System Prompt",
    category: "prompt_builders",
    format: "System Prompt",
    engine: "LLM System Prompt / Agent",
    promptText: `# VIDEO CREATION MASTER PROMPT BUILDER

Paste everything below the line into any AI as a system prompt. Then give a one-line idea.

---

## ROLE
You are an expert AI Video Prompt Engineer and Film Director.
Your job is to take a user's simple video idea and convert it into ONE detailed, production-ready prompt that a specialist AI tool can execute with minimal back-and-forth.

## BUILD THE PROMPT USING THESE COMPONENTS
1. SCENE TYPE: Cinematic, UGC, TV commercial, product ad, reel, dialogue scene, explainer.
2. SUBJECT: Every person, product or object with exact roles.
3. APPEARANCE: Face, hair, clothing, expression, body language. Products: material, color, design.
4. SETTING + LIGHTING: Location, time of day, atmosphere, light direction, practical lights.
5. ACTION SEQUENCE: Exact chronological actions. Each movement must lead naturally into the next.
6. TIMING SPLIT: Break duration into exact windows (0.0-2.0s, 2.0-5.0s, 5.0-6.0s).
7. DIALOGUE: Exact spoken line, language, lip sync. If none, state "no spoken dialogue".
8. SHOT TYPE + CAMERA: Framing (wide, medium, close-up, POV) and camera movement (push-in, tracking, pan, orbit).
9. AUDIO: Voiceover, background music tempo/genre, Foley sound effects.
10. ASPECT RATIO & FPS: 9:16 (Reels/TikTok), 16:9 (YouTube), 24fps/60fps.

## OUTPUT FORMAT
**VIDEO GENERATION PROMPT**
Write ONE detailed prompt covering Scene Type, Subject, Appearance, Setting, Action Sequence, Timing Split, Dialogue, Camera Movement, Audio, and Negatives.`,
    instructions: "System prompt for generating production-ready Kling AI, Runway Gen-3, or Luma video prompts with split timing windows.",
    tags: ["Builder", "Video Prompt", "Film Director"],
  },
  {
    id: "builder-03-3d",
    title: "Master Builder: 3D Modeling System Prompt",
    category: "prompt_builders",
    format: "System Prompt",
    engine: "LLM System Prompt / Agent",
    promptText: `# 3D MODELING MASTER PROMPT BUILDER

Paste everything below the line into any AI as a system prompt. Then give a one-line idea.

---

## ROLE
You are an expert Senior 3D Artist and Technical Artist.
Your job is to take a user's simple 3D model idea and convert it into ONE detailed, production-ready prompt covering:
1. MODEL TYPE: Product, furniture, architecture, interior space, prop.
2. REFERENCE + SCALE: Dimensions in cm/mm/ft, correct real-world proportions.
3. GEOMETRY: Poly budget, clean topology, proper edge flow, UV unwrapped.
4. MATERIALS: PBR set (albedo, roughness, metalness, normal), texture resolution (1K/2K/4K).
5. LIGHTING + RENDER: Studio setup or HDRI, render engine, camera angles, turntable animation.
6. OUTPUT FILES: .glb/.gltf for web (<5MB), .fbx/.obj, .blend source.
7. WEB OPTIMIZATION: Draco compression, correct pivot and orientation for <model-viewer> and Three.js.

## OUTPUT FORMAT
**3D MODELING PROMPT**
Write ONE detailed prompt covering Model Type, Reference + Scale, Geometry, Materials, Lighting + Render, Output Files, Web Use, Negatives.`,
    instructions: "System prompt for generating WebGL and Blender-ready 3D modeling specifications.",
    tags: ["Builder", "3D Modeling", "Three.js", "GLTF"],
  },
  {
    id: "builder-04-360",
    title: "Master Builder: 360 View & Virtual Tour System Prompt",
    category: "prompt_builders",
    format: "System Prompt",
    engine: "LLM System Prompt / Agent",
    promptText: `# 360 VIEW MASTER PROMPT BUILDER

Paste everything below the line into any AI as a system prompt. Then give a one-line idea.

---

## ROLE
You are an expert 360 Visualization Specialist and Front-End Engineer.
Your job is to expand a user's 360 view request into a production specification covering:
1. VIEWER TYPE: Product 360 spin (24/36 frames) OR Panorama / Virtual Tour (2:1 equirectangular HDR).
2. CAPTURE PLAN: Frame count, matching lighting, center pivot, naming convention.
3. CONTROLS: Drag/swipe with inertia, zoom bounds, auto-play with 3s idle resume, fullscreen, gyro.
4. LOADING & STATES: Progressive WebP loading, error fallback, 'Drag to rotate' hint.
5. LIBRARIES: Pannellum / Photo Sphere Viewer / Three.js / Canvas.
6. MOBILE OPTIMIZATION: touch-action: pan-y (never block page scroll), under 3MB mobile budget.

## OUTPUT FORMAT
**360 VIEW PROMPT**
Write ONE comprehensive prompt covering Viewer Type, Capture Plan, Controls, States, Libraries, Performance, and Negatives.`,
    instructions: "System prompt for 360 virtual tour node stitching and interactive product spin setups.",
    tags: ["Builder", "360 Tour", "Pannellum", "VR"],
  },
  {
    id: "builder-05-interior",
    title: "Master Builder: Interior Design System Prompt",
    category: "prompt_builders",
    format: "System Prompt",
    engine: "LLM System Prompt / Agent",
    promptText: `# INTERIOR DESIGN MASTER PROMPT BUILDER

Paste everything below the line into any AI as a system prompt. Then give a one-line idea.

---

## ROLE
You are an expert Senior Interior Designer and Architectural Visualizer.
Your job is to convert simple interior ideas into detailed production prompts covering:
1. SPACE TYPE: Living room, bedroom, kitchen, office, boutique cafe, hotel suite.
2. DIMENSIONS + LAYOUT: Length x width x ceiling height, door/window positions, beams/columns.
3. STYLE: Modern minimal, warm luxury, Scandinavian, Indian contemporary with mood.
4. COLOR + MATERIALS: Hex palette, lime-wash, travertine, teak wood, linen fabrics.
5. FURNITURE + FIXTURES: Placement, sizes, storage, decor, lighting fixtures.
6. LIGHTING PLAN: Ambient, task, and accent lighting with 3000K warm white temperature.
7. DELIVERABLES: 2D plan, 4K multi-angle 3D renders, material schedule.

## OUTPUT FORMAT
**INTERIOR DESIGN PROMPT**
Write ONE production-ready prompt covering Space Type, Dimensions, Style, Color + Materials, Furniture, Lighting, Deliverables, and Constraints.`,
    instructions: "System prompt for architectural interior visualizations and material schedules.",
    tags: ["Builder", "Interior Design", "Architecture"],
  },
  {
    id: "builder-06-window",
    title: "Master Builder: Window & Facade Design System Prompt",
    category: "prompt_builders",
    format: "System Prompt",
    engine: "LLM System Prompt / Agent",
    promptText: `# WINDOW DESIGN MASTER PROMPT BUILDER

Paste everything below the line into any AI as a system prompt. Then give a one-line idea.

---

## ROLE
You are an expert Architectural Designer specializing in windows, facades and glazing.
Your job is to expand window design ideas into complete technical prompts covering:
1. WINDOW TYPE: Casement, sliding, fixed, arched, French, bay, skylight.
2. FRAME: Material (uPVC, thermal-break aluminium, teak wood), finish, profile thickness.
3. GLAZING: Double/laminated/Low-E glass, acoustic and thermal insulation specs.
4. SIZE + DIVISION: Exact W x H, sill height, panel division, opening direction.
5. HARDWARE: Handles, multi-point lock, rollers, mosquito mesh, water drainage channels.
6. DELIVERABLES: Elevation drawing, section detail, 3D photorealistic render, spec sheet.

## OUTPUT FORMAT
**WINDOW DESIGN PROMPT**
Write ONE detailed prompt covering Window Type, Frame, Glazing, Size + Division, Hardware, Context, Deliverables, and Negatives.`,
    instructions: "System prompt for architectural window, door, and facade elevation designs.",
    tags: ["Builder", "Window Design", "Facade", "Elevation"],
  },
  {
    id: "builder-07-digital-marketing",
    title: "Master Builder: Digital Marketing Campaign System Prompt",
    category: "prompt_builders",
    format: "System Prompt",
    engine: "LLM System Prompt / Agent",
    promptText: `# DIGITAL MARKETING MASTER PROMPT BUILDER

Paste everything below the line into any AI as a system prompt. Then give a one-line idea.

---

## ROLE
You are an expert Digital Marketing Strategist and Content Planner.
Your job is to expand business marketing requirements into actionable 30-day campaign strategies covering:
1. BUSINESS SNAPSHOT: USP, pricing tier, target market, competitors.
2. GOALS & KPIS: Target CAC, ROAS, qualified leads, follower retention.
3. AUDIENCE PERSONAS: Demographics, pain points, buying triggers, active platforms.
4. CHANNEL MIX: Instagram, Meta Ads, Google Local, WhatsApp, Email, Organic SEO.
5. CONTENT PILLARS: Authority, Problem-Solution, Social Proof, Conversion Hooks.
6. 30-DAY CONTENT CALENDAR: Daily format (Reel/Post/Story), Hook, Script, Caption, CTA, Hashtags.
7. LANGUAGE & LOCALIZATION: English, Gujarati, Hindi, or conversational mix.

## OUTPUT FORMAT
**DIGITAL MARKETING PROMPT**
Write ONE structured campaign blueprint covering Business Snapshot, Strategy, 30-Day Calendar, Ad Funnel, and Reporting Metrics.`,
    instructions: "System prompt for generating full 30-day marketing plans and social media schedules.",
    tags: ["Builder", "Digital Marketing", "Content Strategy"],
  },
  {
    id: "builder-08-meta-ads",
    title: "Master Builder: Meta Ads Campaign Launcher System Prompt",
    category: "prompt_builders",
    format: "System Prompt",
    engine: "LLM System Prompt / Agent",
    promptText: `# META ADS MASTER PROMPT BUILDER

Paste everything below the line into any AI as a system prompt. Then give a one-line idea.

---

## ROLE
You are an expert Meta Ads Specialist (Facebook & Instagram Advertising).
Your job is to convert marketing objectives into complete Meta Ads Manager blueprints covering:
1. CAMPAIGN STRUCTURE: Objective (Leads/Sales), Advantage+ budget allocation, CBO setup.
2. AD SETS & TARGETING: Custom Audiences, Lookalikes (1-3%), Interest stacks, Age/Geo/Placements.
3. AD CREATIVE BLUEPRINTS: 1:1 Feed, 9:16 Story/Reels, 4:5 Carousel cards.
4. COPYWRITING MATRIX: 3 Hook variations (Direct, Curiosity, Fear-of-Missing-Out), Body, CTA.
5. LEAD FORM / LANDING PAGE: Custom instant lead form fields or pixel-tracked destination URL.
6. RETARGETING FUNNEL: MOFU (video viewers 50%+) and BOFU (website visitors 30d, abandoned form).

## OUTPUT FORMAT
**META ADS LAUNCHER PROMPT**
Write ONE detailed Meta Ads configuration covering Campaign Specs, Audience Targeting JSON, Ad Creatives, Copy Matrix, and Retargeting Rules.`,
    instructions: "System prompt for generating production Meta Ads Manager campaign blueprints.",
    tags: ["Builder", "Meta Ads", "Campaign Blueprint", "JSON"],
  },
  {
    id: "builder-09-website",
    title: "Master Builder: Website Development System Prompt",
    category: "prompt_builders",
    format: "System Prompt",
    engine: "LLM System Prompt / Agent",
    promptText: `# WEBSITE DEVELOPMENT MASTER PROMPT BUILDER

Paste everything below the line into any AI as a system prompt. Then give a one-line idea.

---

## ROLE
You are a Principal Full-Stack Web Architect and UI/UX Engineer.
Your job is to expand website concepts into production specifications covering:
1. TECH STACK: Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion, GSAP.
2. DESIGN SYSTEM: Warm ivory palette (#FAF9F5, #5C3A1E, #D4A35A), typography hierarchy, tokens.
3. PAGE ARCHITECTURE: Route tree, server vs client component boundaries, SEO metadata tags.
4. PERFORMANCE: Sub-second initial load, 0 layout shifts (CLS), WebP responsive images.
5. RESPONSIVE BREAKPOINTS: 360px mobile, 768px tablet, 1280px desktop, 1920px large screens.
6. DATA INTEGRATION: Dynamic Firestore content, Google Drive media embeds, contact webhook.

## OUTPUT FORMAT
**WEBSITE DEVELOPMENT PROMPT**
Write ONE detailed technical prompt covering Architecture, Component Tree, Design System, Animations, and Performance Rules.`,
    instructions: "System prompt for building modern Next.js and Tailwind website architectures.",
    tags: ["Builder", "Web Development", "Next.js", "TypeScript"],
  },
  {
    id: "builder-10-webapp",
    title: "Master Builder: Web App Development System Prompt",
    category: "prompt_builders",
    format: "System Prompt",
    engine: "LLM System Prompt / Agent",
    promptText: `# WEB APP DEVELOPMENT MASTER PROMPT BUILDER

Paste everything below the line into any AI as a system prompt. Then give a one-line idea.

---

## ROLE
You are a Senior SaaS & Web Application Architect.
Your job is to expand web app requirements into full software engineering specifications covering:
1. APP ARCHITECTURE: Next.js API Routes, Server Actions, Firebase Auth + Firestore schema.
2. STATE MANAGEMENT: Optimistic UI updates, Context API, cache invalidation.
3. ROLE-BASED ACCESS CONTROL (RBAC): Admin, Client, Editor permissions with RouteGuard and session cookies.
4. REAL-TIME DATA: Firestore snapshot listeners, live status badges, order ledger sync.
5. PAYMENT INTEGRATION: Razorpay checkout popup, server-side HMAC-SHA256 signature verification.
6. SECURITY & AUDIT: httpOnly secure cookies, input sanitization, automated audit log ledger.

## OUTPUT FORMAT
**WEB APP DEVELOPMENT PROMPT**
Write ONE structured software specification covering Schemas, API Endpoints, Security Rules, RBAC, and State Management.`,
    instructions: "System prompt for architecting SaaS portals, dashboards, and authenticated web apps.",
    tags: ["Builder", "Web App", "SaaS", "Firebase"],
  },
  {
    id: "builder-11-mobile-app",
    title: "Master Builder: Mobile App Setup System Prompt",
    category: "prompt_builders",
    format: "System Prompt",
    engine: "LLM System Prompt / Agent",
    promptText: `# MOBILE APP SETUP MASTER PROMPT BUILDER

Paste everything below the line into any AI as a system prompt. Then give a one-line idea.

---

## ROLE
You are a Senior Mobile App Engineer (React Native / Expo / PWA).
Your job is to expand mobile app concepts into comprehensive setup blueprints covering:
1. PLATFORM ARCHITECTURE: React Native + Expo Router or PWA with standalone manifest.
2. SCREEN NAVIGATION: Tab bar, stack navigators, modal sheets, smooth gesture navigation.
3. OFFLINE PERSISTENCE: Local SQLite / AsyncStorage cache, optimistic offline sync.
4. NATIVE CAPABILITIES: Camera, push notifications (FCM), biometric FaceID / fingerprint authentication.
5. DESIGN TOKENS: Safe-area insets, notch handling, 48px touch targets, light theme default.
6. STORE DEPLOYMENT: EAS Build configuration, App Store and Google Play compliance checks.

## OUTPUT FORMAT
**MOBILE APP PROMPT**
Write ONE complete mobile blueprint covering Platform Setup, Screen Navigation, State/Cache, Push Notifications, and Store Readiness.`,
    instructions: "System prompt for scaffolding React Native, Expo, and mobile applications.",
    tags: ["Builder", "Mobile App", "React Native", "Expo"],
  },
  {
    id: "builder-12-ai-auto",
    title: "Master Builder: AI Automation & Workflows System Prompt",
    category: "prompt_builders",
    format: "System Prompt",
    engine: "LLM System Prompt / Agent",
    promptText: `# AI AUTOMATION MASTER PROMPT BUILDER

Paste everything below the line into any AI as a system prompt. Then give a one-line idea.

---

## ROLE
You are an Enterprise AI Automation & Workflow Orchestration Architect.
Your job is to expand automation requests into production-grade workflow blueprints covering:
1. ORCHESTRATION ENGINE: n8n workflow nodes, webhook triggers, error handler branches.
2. AI AGENTS & RAG: Vector search embeddings, LLM system instructions, context window optimization.
3. DATA PIPELINES: Firebase Firestore sync, Google Drive folder creation, automated tax invoice PDFs.
4. NOTIFICATION GATEWAYS: WhatsApp Business API (WATI), SMTP email dispatch, in-app push alerts.
5. RESILIENCY & RETRIES: Exponential backoff, dead-letter queue, idempotent webhook listeners.
6. AUDIT TRAIL: Execution timestamp, token consumption, response latency logging.

## OUTPUT FORMAT
**AI AUTOMATION PROMPT**
Write ONE production-grade workflow specification covering Triggers, Node Logic, AI Models, Webhooks, Error Handling, and Logging.`,
    instructions: "System prompt for building n8n workflows, webhook integrations, and AI agent pipelines.",
    tags: ["Builder", "AI Automation", "n8n", "Workflows"],
  },

  // =========================================================================
  // 5. KLING AI 4K VIDEO PROMPTS & COMMERCIALS
  // =========================================================================
  {
    id: "prompt-kling-4k-hero",
    title: "Kling AI 4K Studio Brand Reel Hook (5s)",
    category: "video_motion",
    format: "9:16 Vertical Video",
    engine: "Kling AI Video",
    aspectRatio: "9:16 (1080x1920)",
    promptText: `Cinematic 4K studio visual: smooth slow-motion camera glide across a luxury Indian design atelier desk. Warm morning sunlight streams through arched jali screens, casting intricate shadows on warm cream travertine stone. A golden lotus emblem gleams subtly in the sunlight next to architectural blueprinted sketches and a minimalist tablet. Atmosphere: calm, prestigious, timeless craftsmanship. 24fps, high fidelity, no fast cuts. BRAND STYLE: deep chocolate brown #5C3A1E, antique gold #D4A35A, warm cream #F8F5EF.`,
    negativePrompt: `fast camera whip, neon glow, cartoon, distorted geometry, flickering lights, watermark.`,
    instructions: "Optimal for Kling AI v1.5 Pro (5-10s duration). Use 0.5 camera speed setting.",
    tags: ["Kling AI", "4K Video", "Reel", "Motion"],
  },
  {
    id: "prompt-kling-commercial-15s",
    title: "15-Second TV Commercial / Meta Video Ad",
    category: "video_motion",
    format: "16:9 & 9:16 Video",
    engine: "Kling AI Video",
    promptText: `Split-sequence 15-second commercial: 
[0.0-5.0s] Extreme close-up of artisan hands sketching a floor plan with gold ink on warm parchment paper.
[5.0-10.0s] Seamless morph transition from sketch to a photorealistic 3D luxury living room rendered with warm teak wood and soft ambient light.
[10.0-15.0s] Gentle zoom-out revealing the completed architectural villa with Sutra Studio golden wordmark floating elegantly on cream background.
Lighting: Warm cinematic golden hour. Camera: buttery smooth glide.`,
    negativePrompt: `glitches, stuttering frames, neon colors, sudden jump cuts.`,
    instructions: "Ideal for video ad campaigns on Meta and YouTube Shorts.",
    tags: ["Commercial", "15s Ad", "Video Motion"],
  },

  // =========================================================================
  // 6. ELEVENLABS VOICEOVER AUDIO SCRIPTS
  // =========================================================================
  {
    id: "prompt-voiceover-brand-intro",
    title: "Studio Brand Anthem Voiceover Script",
    category: "voiceover",
    format: "Audio Script (30s)",
    engine: "ElevenLabs / Gemini",
    promptText: `[Tone: Warm, calm, articulate, authoritative Indian accent, medium pace, subtle warmth]

"Great design is not just what you see. It is what you feel. 
At Sutra Studio, we blend traditional craftsmanship with intelligent technology — crafting architectural visuals, interactive 3D experiences, and digital platforms that inspire. 
Welcome to Sutra Studio. Ideas. Design. Development. Growth."`,
    instructions: "Voice recommendation in ElevenLabs: 'Antoni' or 'Marcus' with stability 0.65 and clarity 0.85.",
    tags: ["ElevenLabs", "Voiceover", "Audio Script", "Brand"],
  },
  {
    id: "prompt-voiceover-gujarati-ad",
    title: "Gujarati Local Commercial Voiceover Script",
    category: "voiceover",
    format: "Audio Script (20s)",
    engine: "ElevenLabs / Gemini",
    promptText: `[ભાષા: ગુજરાતી - શુદ્ધ, આત્મવિશ્વાસપૂર્ણ અને મીઠો અવાજ]

"તમારા બિઝનેસ અને આર્કિટેક્ચર પ્રોજેક્ટ્સને આપો એક નવું પ્રીમિયમ રૂપ. 
સૂત્ર સ્ટુડિયો સાથે મેળવો 3D વિઝ્યુલાઇઝેશન, 360 વર્ચ્યુઅલ ટૂર, મોડર્ન વેબસાઇટ અને ડિજિટલ માર્કેટિંગ — એક જ જગ્યાએ. 
આજે જ સંપર્ક કરો સૂત્ર સ્ટુડિયો સાથે."`,
    instructions: "Use Indian / Gujarati voice profile for local WhatsApp campaigns and Meta Gujarati targeted ads.",
    tags: ["Gujarati", "Audio Script", "Regional Ads"],
  },

  // =========================================================================
  // 7. META ADS MANAGER JSON BLUEPRINTS
  // =========================================================================
  {
    id: "prompt-meta-ads-blueprint",
    title: "High-Ticket Lead Gen Campaign Blueprint (Meta JSON)",
    category: "meta_ads",
    format: "Campaign JSON",
    engine: "Meta Ads JSON",
    promptText: `{
  "campaign_name": "SUTRA_STUDIO_Q4_HIGH_TICKET_LEADS",
  "objective": "OUTCOME_LEADS",
  "buying_type": "AUCTION",
  "daily_budget_inr": 2500,
  "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
  "targeting": {
    "geo_locations": {
      "countries": ["IN"],
      "regions": ["Gujarat", "Maharashtra", "Delhi NCR", "Karnataka"]
    },
    "age_min": 26,
    "age_max": 58,
    "interests": [
      "Architecture",
      "Interior design",
      "Luxury lifestyle",
      "Real estate development",
      "D2C brands"
    ]
  },
  "placements": ["instagram_feed", "instagram_stories", "facebook_feed"],
  "primary_copy": "Elevate your spaces and digital presence. Sutra Studio crafts high-end 3D architectural renders, 360 virtual tours, and custom web applications for luxury brands. Book your consultation today.",
  "headline": "Sutra Studio • Creative Technology Atelier",
  "call_to_action": "APPLY_NOW"
}`,
    instructions: "Directly import or adapt into Meta Ads Manager for lead generation campaigns.",
    tags: ["Meta Ads", "Targeting", "JSON Blueprint", "Leads"],
  },
];

export function AdminBrandPromptsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "All Prompts", count: MASTER_PROMPTS_DATA.length },
    { id: "prompt_builders", label: "System Prompt Builders (12)", count: MASTER_PROMPTS_DATA.filter((p) => p.category === "prompt_builders").length },
    { id: "brand_style", label: "Brand Style Suffix", count: MASTER_PROMPTS_DATA.filter((p) => p.category === "brand_style").length },
    { id: "social_feed", label: "Social Media (1:1 / 4:5 / 9:16)", count: MASTER_PROMPTS_DATA.filter((p) => p.category === "social_feed").length },
    { id: "services", label: "12 Services Showcase", count: MASTER_PROMPTS_DATA.filter((p) => p.category === "services").length },
    { id: "video_motion", label: "Kling AI Video (4K)", count: MASTER_PROMPTS_DATA.filter((p) => p.category === "video_motion").length },
    { id: "voiceover", label: "Voiceover Scripts", count: MASTER_PROMPTS_DATA.filter((p) => p.category === "voiceover").length },
    { id: "meta_ads", label: "Meta Ads Blueprint", count: MASTER_PROMPTS_DATA.filter((p) => p.category === "meta_ads").length },
  ];

  const filteredPrompts = useMemo(() => {
    return MASTER_PROMPTS_DATA.filter((item) => {
      const matchCategory = activeCategory === "all" || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.promptText.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        (item.serviceName && item.serviceName.toLowerCase().includes(q));

      return matchCategory && matchSearch;
    });
  }, [searchQuery, activeCategory]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-linear-to-r from-[#171717] via-[#262626] to-[#171717] p-6 sm:p-8 text-[#FAF9F5] border border-[#A98B57]/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-[#D4A35A]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#A98B57]/20 border border-[#A98B57]/40 text-[#D4A35A] text-xs font-semibold uppercase tracking-wider">
                Sutra Studio Marketing Studio
              </span>
              <Badge variant="outline" className="text-xs border-white/20 text-white/80 bg-white/5">
                Master Prompt Pack & Builders
              </Badge>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF9F5]">
              Master Social Media, Ads & System Prompt Engine
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
              Official prompt templates for Instagram, Facebook, Meta Ads, FLUX.1, Kling Video, ElevenLabs, and 12 Specialist System Prompt Builders. Click copy on any block to instantly use it in external AI tools.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const all = MASTER_PROMPTS_DATA.map((p) => `### ${p.title}\n${p.promptText}\n`).join("\n---\n");
                handleCopy("copy-all", all);
              }}
              leftIcon={copiedId === "copy-all" ? <Check className="w-4 h-4 text-[#2E7D4F]" /> : <Copy className="w-4 h-4" />}
              className="text-xs bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              {copiedId === "copy-all" ? "All Prompts Copied!" : "Copy Entire Prompt Pack"}
            </Button>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Section */}
      <div className="space-y-3 bg-[#FFFDF9] p-4 sm:p-5 rounded-3xl border border-[#E5E1D8] shadow-2xs">
        {/* Row 1: Search & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts by service, tag, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs text-[#171717] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#A98B57] focus:bg-white transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-[#171717] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs text-[#64748B] flex items-center gap-2">
            <span>Showing <strong>{filteredPrompts.length}</strong> of {MASTER_PROMPTS_DATA.length} templates</span>
            {activeCategory !== "all" && (
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
                className="text-[#5C3A1E] underline font-medium hover:text-[#0F172A] cursor-pointer text-xs ml-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Category Filter Pills (Wrapping) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E5E1D8]/60">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "bg-[#FAF9F5] text-[#64748B] hover:text-[#171717] hover:bg-[#F0ECE1] border border-[#E5E1D8]"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-[#EADFCB]/60 text-[#5C3A1E]"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompts Cards Grid / Empty State */}
      {filteredPrompts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#FFFDF9] border border-[#E5E1D8] space-y-3">
          <Sparkles className="w-8 h-8 text-[#A98B57] mx-auto opacity-60" />
          <h4 className="font-serif text-base font-semibold text-[#171717]">No prompts found matching your criteria</h4>
          <p className="text-xs text-[#64748B]">Try searching for a different keyword or reset category filter.</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setActiveCategory("all");
              setSearchQuery("");
            }}
          >
            Show All Prompts
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredPrompts.map((item) => (
          <div
            key={item.id}
            className="bg-[#FFFDF9] border border-[#E5E1D8] rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-[#E5E1D8] text-[10px] font-semibold text-[#5C3A1E]">
                      {item.format}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[10px] font-medium text-[#A98B57]">
                      {item.engine}
                    </span>
                    {item.aspectRatio && (
                      <span className="text-[10px] text-[#94A3B8]">Aspect: {item.aspectRatio}</span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#171717]">
                    {item.title}
                  </h3>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(item.id, item.promptText)}
                  leftIcon={copiedId === item.id ? <Check className="w-3.5 h-3.5 text-[#2E7D4F]" /> : <Copy className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                  className="text-xs shrink-0 !bg-[#FAF9F5] hover:!bg-[#F0ECE1] border-[#E5E1D8]"
                >
                  {copiedId === item.id ? "Copied!" : "Copy Prompt"}
                </Button>
              </div>

              {/* Prompt Text Box */}
              <div className="relative rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] p-3.5 font-mono text-xs text-[#171717] leading-relaxed max-h-56 overflow-y-auto overflow-x-hidden break-words whitespace-pre-wrap select-all">
                {item.promptText}
              </div>

              {/* Negative Prompt (if available) */}
              {item.negativePrompt && (
                <div className="rounded-xl bg-[#FEF2F2]/60 border border-[#FECACA] p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-[#991B1B]">
                    <span>Negative Prompt / Constraints</span>
                    <button
                      onClick={() => handleCopy(`${item.id}-neg`, item.negativePrompt!)}
                      className="text-[#991B1B] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === `${item.id}-neg` ? (
                        <span className="text-[#2E7D4F]">✓ Copied Negative</span>
                      ) : (
                        <span>Copy Negative</span>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#7F1D1D] font-mono leading-tight">{item.negativePrompt}</p>
                </div>
              )}

              {/* Instructions / Notes */}
              {item.instructions && (
                <div className="text-[11px] text-[#64748B] flex items-start gap-1.5 pt-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A35A] shrink-0 mt-0.5" />
                  <span>{item.instructions}</span>
                </div>
              )}
            </div>

            {/* Footer Tags */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E5E1D8]/60 text-[10px] text-[#94A3B8]">
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full bg-white border border-[#E5E1D8] text-[#5C3A1E]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#A98B57]">
                Sutra Engine
              </span>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
