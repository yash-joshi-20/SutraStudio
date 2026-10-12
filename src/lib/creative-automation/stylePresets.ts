/**
 * SUTRA STUDIO — Creative Style Presets (Step 02)
 * 
 * Formulated from deep audit of studio showreels, UI demonstrations,
 * motion graphic patterns, and architectural 3D workflows.
 */

import { CreativeStylePreset } from "./types";

export const CREATIVE_STYLE_PRESETS: CreativeStylePreset[] = [
  // 1. Trending Educational Reels — AI & Tech Explainer
  {
    id: "preset-edu-kinetic-explainer",
    name: "Kinetic Tech Explainer Reel",
    category: "educational_reels",
    visualStyle: "High-contrast minimalist canvas (#FAF9F5 base), charcoal typography with warm brass accent highlights, clean card callouts, subtle grid background.",
    sceneStructure: [
      "0-3s: Scroll-stopping problem hook with animated bold headline",
      "3-10s: Breakdown of conventional pain point vs modern AI solution",
      "10-22s: Step-by-step 3-part walkthrough with kinetic icons and cursor focus",
      "22-30s: Metric outcome showcase and clear profile bio CTA",
    ],
    cameraMovement: "Static framed camera with simulated dynamic punch-in (1.15x scale) on key takeaway statements; zero camera shake.",
    editingTechniques: [
      "Fast-paced jump cuts on natural phrase boundaries",
      "Word-by-word synchronized animated subtitles",
      "Split-screen comparison layout (Before vs After)",
      "Highlighter effect across key technical keywords",
    ],
    typographyOverlays: {
      fontStyle: "Inter Bold / Outfit Display uppercase with tight letter-spacing",
      placement: "Upper-center for hook; lower-third for continuous subtitles (240px from bottom)",
      kineticEffects: "Pop-in scale spring (0.8 -> 1.05 -> 1.0) with gold highlight box (#A98B57)",
      colors: ["#171717", "#FFFFFF", "#A98B57", "#2E7D32"],
    },
    transitions: ["Hard cuts on audio beats", "Clean whip-pan between problem and solution", "Smooth fade-to-cream on CTA"],
    motionGraphics: [
      "Animated progress indicator bar at top of screen",
      "Floating UI badge pill with subtle pulse",
      "Animated checkmark and comparison X icons",
      "Sound design sync pops on bullet point reveals",
    ],
    hookStrategy: "Provocative contrarian question or 'Stop doing X manually in 2026' hook within first 1.8 seconds.",
    closingCta: "Save this reel for your next campaign | Comment 'SUTRA' to receive the workflow blueprint.",
    durationSecondsRange: [20, 35],
    aspectRatio: "9/16",
    audioNarrationStyle: "Clear, authoritative, confident human cadence; 155-165 words per minute; no filler words.",
    recommendedWorkflow: "Trend Research -> Script Hook Gen -> Screen Capture Asset -> Kinetic Subtitle Pass -> Audio Mastering",
    tags: ["educational", "reels", "ai-tools", "kinetic-typography", "tutorial"],
  },

  // 2. Screen Recording & UI Demonstrations
  {
    id: "preset-screen-ui-walkthrough",
    name: "Precision UI / Product Walkthrough",
    category: "screen_ui_demo",
    visualStyle: "Authentic Next.js / Figma screen capture inside a premium 16:9 or 9:16 browser bezel with subtle 3D tilt and frosted glass backdrop.",
    sceneStructure: [
      "0-4s: Wide perspective showing complete interface dashboard",
      "4-15s: Smooth camera zoom focusing on primary workflow trigger button",
      "15-30s: Real-time execution demonstration with live state transitions",
      "30-40s: Output delivery view with zoom-out to studio watermark",
    ],
    cameraMovement: "Keyframed pan and zoom (Focal-length 35mm equivalent) following cursor coordinates; 60fps smooth easing.",
    editingTechniques: [
      "Cursor magnetic path smoothing with golden radial halo (#A98B5733)",
      "Background blur (16px) during feature-specific zoom-in",
      "Step callout numbering badges pinned to UI coordinates",
      "Side-by-side terminal log and rendered result view",
    ],
    typographyOverlays: {
      fontStyle: "JetBrains Mono for code/logs; Inter Medium for tutorial instructions",
      placement: "Floating contextual tooltips anchored 24px above clicked elements",
      kineticEffects: "Gentle fade-and-rise (12px translation over 250ms)",
      colors: ["#171717", "#FAF9F5", "#D4A35A"],
    },
    transitions: ["Smart coordinate morphing", "Subtle blur dissolve (150ms)", "Slide-over panel reveal"],
    motionGraphics: [
      "Ripple wave on mouse click",
      "Keystroke preview badges for shortcut triggers",
      "Dynamic magnifying glass loupe over micro-details",
      "Green success verification check badge",
    ],
    hookStrategy: "Instant demonstration of final output in first 3 seconds followed by 'Here is how to automate this in 3 clicks.'",
    closingCta: "Try this workflow in your Sutra Studio workspace today.",
    durationSecondsRange: [30, 60],
    aspectRatio: "16/9",
    audioNarrationStyle: "Technical studio guide, calm pacing, deliberate articulation of UI terms.",
    recommendedWorkflow: "Screen Recording Capture -> Coordinate Metadata -> Zoom Framing -> Captions & Pointers",
    tags: ["ui-walkthrough", "screen-demo", "saas", "dashboard", "features"],
  },

  // 3. Marketing and Advertising — Luxury Creative Agency Commercial
  {
    id: "preset-marketing-luxury-atelier",
    name: "Luxury Creative Atelier Commercial",
    category: "marketing_commercial",
    visualStyle: "Warm ivory minimalism, soft golden hour lighting, tactile materials (travertine, hand-crafted paper, muted brass), cinematic 2.39:1 letterbox.",
    sceneStructure: [
      "0-4s: Atmospheric macro shot of design craftsmanship / architectural texture",
      "4-12s: Dynamic juxtaposition of sacred geometric art and advanced autonomous code",
      "12-22s: Client transformation showcase with real delivered interfaces",
      "22-30s: Sutra Studio emblem signature reveal and consultation CTA",
    ],
    cameraMovement: "Slow deliberate dolly-in and lateral slider movement; 48fps slow-motion feel; steady gimbal motion.",
    editingTechniques: [
      "Rhythmic match cuts between artisanal materials and digital canvases",
      "Subtle film grain (35mm fine grain emulation)",
      "Warm tonal grading (preserving #FAF9F5 whites without digital blow-out)",
      "Uncluttered editorial frame composition",
    ],
    typographyOverlays: {
      fontStyle: "Playfair Display / Cormorant Garamond serif with wide tracking (0.15em)",
      placement: "Centered cinematic titles, lower third studio badge",
      kineticEffects: "Subtle optical blur-in (blur 8px -> 0px over 600ms)",
      colors: ["#171717", "#5C3A1E", "#D4A35A"],
    },
    transitions: ["Deep cross-dissolve (800ms)", "Luma fade on highlights", "Seamless match cut on architectural line"],
    motionGraphics: [
      "Fine hairline gold geometric frames",
      "Subtle particle dust motes catching golden light",
      "Minimalist bespoke pricing tier badge",
    ],
    hookStrategy: "Striking visual elegance and quiet confidence: 'Most creative studios build for tomorrow. We craft for the enduring.'",
    closingCta: "Commission your studio engagement. Verified fixed pricing starting at ₹99.",
    durationSecondsRange: [25, 45],
    aspectRatio: "16/9",
    audioNarrationStyle: "Deep, warm, contemplative voiceover accompanied by acoustic sitar/bansuri ambient drone and low-frequency cello.",
    recommendedWorkflow: "Creative Brief -> Tonal Script -> Cinematic Storyboard -> AI Video Gen -> Color Grading -> Audio Master",
    tags: ["commercial", "luxury", "brand-identity", "cinematic", "studio-intro"],
  },

  // 4. Cinematic Video — Drone & Architectural Fly-Through
  {
    id: "preset-cinematic-architectural",
    name: "Cinematic Drone & Architectural Fly-Through",
    category: "cinematic_video",
    visualStyle: "Volumetric daylight diffusion, warm travertine stone facades, seamless indoor-outdoor transition, photorealistic reflections.",
    sceneStructure: [
      "0-5s: High-altitude aerial establishing shot with slow descending orbit",
      "5-14s: Seamless tracking shot gliding through double-height courtyard",
      "14-22s: Push-in to hero focal point (sacred geometry installation)",
      "22-28s: Time-lapse transition from golden daylight to twilight dusk with interior warm illumination",
    ],
    cameraMovement: "Continuous FPV drone path with frictionless curved bezier easing; zero abrupt yaw rotations.",
    editingTechniques: [
      "Speed ramping (100% -> 40% slow-mo -> 100%) at pivotal architectural thresholds",
      "Parallax depth separation between foreground colonnades and background atrium",
      "Natural daylight color temperature transition (5500K noon to 2800K dusk)",
    ],
    typographyOverlays: {
      fontStyle: "Modern architectural sans-serif (Inter Light) with all-caps coordinate captions",
      placement: "Lower-right corner with geographical/project metadata (e.g. SUTRA STUDIO · 28°38'N)",
      kineticEffects: "Single-line typewriter reveal with blinking cursor",
      colors: ["#FAF9F5", "#D4A35A"],
    },
    transitions: ["Invisible architectural column wipe", "Light leak dissolve", "Straight continuity cut"],
    motionGraphics: [
      "Architectural dimension wireline overlay with subtle 30% opacity",
      "Compass bearing indicator in header corner",
    ],
    hookStrategy: "Immediate visual immersion in breathtaking architectural proportion.",
    closingCta: "Experience spatial design in full 360° virtual studio.",
    durationSecondsRange: [20, 40],
    aspectRatio: "16/9",
    audioNarrationStyle: "Ambient soundscape with wind, distant chime, and subtle binaural room acoustic reverb.",
    recommendedWorkflow: "3D CAD / Reference Mesh -> Trajectory Pathing -> Neural Video Render -> Interpolation -> Sound Design",
    tags: ["cinematic", "drone", "architecture", "fly-through", "volumetric"],
  },

  // 5. 3D, Interior and 360° — Photorealistic Spatial Turntable
  {
    id: "preset-interior-3d-turntable",
    name: "Photorealistic 3D Spatial & Product Turntable",
    category: "interior_3d_360",
    visualStyle: "Studio cyclorama lighting, physically-based materials (PBR) with genuine roughness and metallic maps, warm saffron rim lighting.",
    sceneStructure: [
      "0-6s: 360-degree continuous turntable rotation of hero product/spatial model",
      "6-15s: Macro focus on material textures (wood grain, brushed brass, glass dispersion)",
      "15-25s: Interactive exploded view / room layout transformation",
      "25-30s: Full room equirectangular 360° panorama snapshot",
    ],
    cameraMovement: "Orbital turntable camera maintaining fixed distance with subtle elevation shift from 15° to 35°.",
    editingTechniques: [
      "Physical depth of field (f/1.8 equivalent) shifting focus from foreground to background",
      "Material transformation dissolves (clay render -> wireframe -> photorealistic textured)",
      "Interactive 360 viewer hot-spot annotation indicators",
    ],
    typographyOverlays: {
      fontStyle: "Clean technical sans-serif with callout leader lines",
      placement: "Leader line points anchored directly to 3D mesh vertices",
      kineticEffects: "Expanding circular radar ping on material callout points",
      colors: ["#171717", "#D4A35A", "#4B5563"],
    },
    transitions: ["Radial material wipe", "Orbit coordinate cut", "Seamless 360 pano loop"],
    motionGraphics: [
      "3D coordinate crosshairs and measurement indicators",
      "Material specification chips (e.g., 'Natural Teak · Muted Brass · Linen')",
      "360° interactive touch drag indicator icon",
    ],
    hookStrategy: "3D object emerges from darkness with dramatic edge rim lighting reveal.",
    closingCta: "Explore the interactive 360° walkthrough on Sutra Studio.",
    durationSecondsRange: [15, 30],
    aspectRatio: "1/1",
    audioNarrationStyle: "Subtle mechanical haptic clicks, smooth ambient synth sweep, minimal voiceover.",
    recommendedWorkflow: "3D Mesh Ingestion -> PBR Material Setup -> Lighting Bake -> Multi-Angle Render -> Interactive Export",
    tags: ["3d", "interior", "360-degree", "turntable", "photorealistic", "materials"],
  },
];
