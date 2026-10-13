/**
 * SUTRA STUDIO — Professional Cinematic Shot Presets (Step 04)
 * 
 * Reusable creative planning library of 18 cinematic camera movement,
 * lighting, and composition presets engineered for commercial video,
 * architectural renders, and product advertising pipelines.
 * 
 * NOTE: These are creative planning presets defining ideal cinematographic
 * parameters and prompt syntax, adhering to studio art direction.
 */

import { ShotPreset } from "./types";

export const CINEMATIC_SHOT_PRESETS: ShotPreset[] = [
  // 1. Aerial establishing shot
  {
    id: "shot-aerial-establishing",
    name: "Aerial Establishing Shot",
    purpose: "Establish geographical scale, environment luxury, and spatial context of the project.",
    promptTemplate: "Ultra-wide cinematic aerial establishing shot overlooking {{subject}}, soaring high above the landscape, expansive horizon, photorealistic 8k, golden hour illumination.",
    cameraMovement: "High-altitude slow forward drifting drone movement with subtle 3-degree downward tilt.",
    subjectMovement: "Stationary subject with ambient environmental elements (flowing water, swaying foliage, distant city traffic).",
    lightingAtmosphere: "Golden hour warm sunbeams breaking through subtle morning haze, long atmospheric shadows.",
    composition: "Rule of thirds placement with horizon on upper third; leading architectural vectors directing eye to subject.",
    lensStyleGuidance: "24mm ultra-wide anamorphic cinema lens, deep depth of field (f/8), edge-to-edge sharpness.",
    durationTargetSeconds: 4,
    aspectRatio: "16/9",
    transitionRecommendation: "Slow cross-dissolve to medium entrance shot or match-cut on architectural ridge.",
    continuityRequirements: "Sun position and cloud density must align with subsequent exterior sequence.",
    providerRequirements: ["video_generation", "image_generation"],
    negativePrompt: "low-resolution, jerky camera, fisheye distortion, blown out sky, digital noise, pixelated horizon.",
    tags: ["architecture", "real_estate", "commercial", "establishing", "drone"],
  },

  // 2. Drone-style forward reveal
  {
    id: "shot-drone-forward-reveal",
    name: "Drone-Style Forward Reveal",
    purpose: "Build anticipation by beginning behind a natural or architectural obstruction and gliding forward.",
    promptTemplate: "Cinematic forward reveal gliding past {{foreground_element}} to unveil majestic view of {{subject}}, smooth dynamic motion, volumetric god rays, premium atelier aesthetic.",
    cameraMovement: "Low-to-high ascending push-in gliding over foreground crest to reveal subject in full glory.",
    subjectMovement: "Subject gradually enters clear field of view as foreground obstacle tracks out of frame.",
    lightingAtmosphere: "Dramatic rim lighting highlighting foreground silhouettes, revealing warm radiant subject lighting.",
    composition: "Layered foreground-midground-background depth layering with dynamic center vanishing point.",
    lensStyleGuidance: "35mm prime cinema lens, shallow foreground falloff transitioning to crisp subject focus (f/4).",
    durationTargetSeconds: 3.5,
    aspectRatio: "16/9",
    transitionRecommendation: "Whip pan or match-cut forward velocity to interior push-in.",
    continuityRequirements: "Momentum vector must match the entry speed of the subsequent shot.",
    providerRequirements: ["video_generation"],
    negativePrompt: "stuttering frame rate, unnatural acceleration, blur, over-sharpened edges, glitch.",
    tags: ["drone", "reveal", "cinematic", "dynamic", "exterior"],
  },

  // 3. Drone orbit around a subject or building
  {
    id: "shot-drone-orbit",
    name: "Drone Orbit Around Subject",
    purpose: "Showcase complete 360 volumetric depth, architectural façade craftsmanship, and sculpted geometries.",
    promptTemplate: "Smooth continuous circular orbital pan 180-degrees around {{subject}}, cinematic parallax against backdrop, warm soft illumination, cinematic color grade.",
    cameraMovement: "Constant-radius clockwise orbital tracking at 15-degree down-pitch angle, perfectly centered parallax.",
    subjectMovement: "Subject stays anchored in center-frame while background perspectives shift fluidly.",
    lightingAtmosphere: "Multi-point cinematic key light shifting across surfaces as the angle traverses the quadrant.",
    composition: "Strong central framing with dynamic changing horizon vector and architectural depth lines.",
    lensStyleGuidance: "50mm cinema prime, medium depth of field with creamy natural bokeh on distant horizon.",
    durationTargetSeconds: 5,
    aspectRatio: "16/9",
    transitionRecommendation: "Rotational whip-cut into product close-up or matched arc motion cut.",
    continuityRequirements: "Light reflection vectors must evolve consistently as viewing angle rotates.",
    providerRequirements: ["video_generation", "3d_model_generation"],
    negativePrompt: "wobbling orbit, inconsistent distance, warping geometries, jittery gimbal movements.",
    tags: ["orbit", "3d_spatial", "architectural", "parallax", "showcase"],
  },

  // 4. High-angle and bird's-eye view
  {
    id: "shot-high-angle-birds-eye",
    name: "High-Angle & Bird's-Eye View",
    purpose: "Provide a top-down orthogonal overview of layouts, spatial arrangements, and master site plans.",
    promptTemplate: "Top-down 90-degree orthogonal bird's-eye view directly above {{subject}}, geometric symmetry, architectural precision, soft ambient shadows, 8k render quality.",
    cameraMovement: "Slow descending vertical crane movement (Z-axis plunge) or subtle slow clockwise rotation.",
    subjectMovement: "Static architectural composition with subtle dynamic micro-elements (light reflections, foliage).",
    lightingAtmosphere: "Diffuse softbox style ambient daylight, clean controlled ground shadows defining heights.",
    composition: "Geometric radial or grid symmetry, pure top-down planar alignment with zero parallax distortion.",
    lensStyleGuidance: "50mm distortion-free architectural prime, f/11 aperture for flat-field planar sharpness.",
    durationTargetSeconds: 3,
    aspectRatio: "16/9",
    transitionRecommendation: "Speed-ramp dive into a detailed ground-level macro or push-in.",
    continuityRequirements: "Orientation (North/South alignment) matches master site floorplans.",
    providerRequirements: ["image_generation", "video_generation"],
    negativePrompt: "tilted angle, perspective distortion, fisheye barrel, perspective keystoning, murky shadows.",
    tags: ["top_down", "master_plan", "layout", "symmetry", "architectural"],
  },

  // 5. Architectural fly-through
  {
    id: "shot-architectural-fly-through",
    name: "Architectural Interior Fly-Through",
    purpose: "Provide an immersive fluid transition moving from grand exterior entrance into bespoke interior rooms.",
    promptTemplate: "Fluid continuous architectural fly-through entering through {{entrance}} into {{interior_space}}, warm ivory tones, brass accents, marble floors with mirror reflections, ultra-luxury.",
    cameraMovement: "Steadycam-style forward tracking glide at eye level (1.6m), banking smoothly through doorways.",
    subjectMovement: "Architectural interior static geometry; curtains swaying gently, fireplace flames flickering softly.",
    lightingAtmosphere: "Transition from bright outdoor daylight to intimate indoor ambient cove lighting and warm scones.",
    composition: "One-point interior perspective leading directly down hallway centerline into open pavilion.",
    lensStyleGuidance: "28mm wide cinema lens, carefully controlled chromatic aberration and rectilinear projection.",
    durationTargetSeconds: 6,
    aspectRatio: "16/9",
    transitionRecommendation: "Threshold door frame wipe or light bloom transition upon entering sunlit atrium.",
    continuityRequirements: "Interior design style, wall finishes, and millwork must match previous room teasers.",
    providerRequirements: ["video_generation", "visualization_360"],
    negativePrompt: "clipping through walls, camera stutter, inconsistent lighting, distorted doorframes.",
    tags: ["interior", "fly_through", "walkthrough", "luxury", "spatial"],
  },

  // 6. Smooth push-in and pull-out
  {
    id: "shot-smooth-push-in-pull-out",
    name: "Smooth Push-In & Pull-Out",
    purpose: "Focus viewer emotion onto a specific hero focal point (push-in) or reveal context/scale (pull-out).",
    promptTemplate: "Slow dignified cinematic push-in towards {{hero_element}}, dramatic gradual focus pull, intimate mood, soft volumetric glow, high fashion atelier lighting.",
    cameraMovement: "Smooth motorized dolly push-in on horizontal track, accelerating slightly toward dramatic climax.",
    subjectMovement: "Subject remains stationary or performs micro-movement, commanding absolute visual authority.",
    lightingAtmosphere: "Spotlight key lighting with deep velvety shadows in background, highlighting texture finish.",
    composition: "Golden ratio spiral focal point converging on subject's key emblem or feature.",
    lensStyleGuidance: "85mm portrait telephoto lens, wide aperture (f/1.8), creamy buttery background compression.",
    durationTargetSeconds: 3.5,
    aspectRatio: "9/16",
    transitionRecommendation: "Hard punch-in cut to macro detail or snap-zoom transition into next scene.",
    continuityRequirements: "Focal plane tracking must never jitter off primary subject focal point.",
    providerRequirements: ["video_generation", "image_generation"],
    negativePrompt: "jerky dolly step, lost focus, wandering tracking point, chromatic aberration artifacts.",
    tags: ["dolly", "push_in", "emotional", "hero_focus", "reels"],
  },

  // 7. Tracking and follow shot
  {
    id: "shot-tracking-follow",
    name: "Tracking & Follow Shot",
    purpose: "Guide viewer alongside a moving product, vehicle, or human talent through a dynamic environment.",
    promptTemplate: "Dynamic lateral tracking shot pacing alongside {{subject}} moving through {{environment}}, cinematic motion blur on background, tack-sharp subject lock, anamorphic flares.",
    cameraMovement: "Parallel lateral tracking on high-speed dolly or pursuit vehicle, matching subject velocity precisely.",
    subjectMovement: "Subject moves with deliberate purposeful elegance through the frame.",
    lightingAtmosphere: "Intermittent environmental light slashes (streetlamps, sunlight filtering through colonnade).",
    composition: "Lead-room framing: subject placed in trailing third with travel path occupying front two-thirds.",
    lensStyleGuidance: "50mm anamorphic lens with horizontal streak flares, shallow depth of field (f/2.8).",
    durationTargetSeconds: 4,
    aspectRatio: "16/9",
    transitionRecommendation: "Subject passes behind pillar for natural whip wipe cut to next location.",
    continuityRequirements: "Movement direction (left-to-right vs right-to-left) must obey the 180-degree rule.",
    providerRequirements: ["video_generation"],
    negativePrompt: "frame rate lag, subject slipping out of frame, stuttering motion blur, warped background.",
    tags: ["tracking", "follow", "automotive", "lifestyle", "kinetic"],
  },

  // 8. Pan, tilt, and controlled camera movement
  {
    id: "shot-pan-tilt-controlled",
    name: "Pan, Tilt & Controlled Motion",
    purpose: "Reveal vertical grandeur (tilt-up) or horizontal breadth (pan) of large monuments or tall buildings.",
    promptTemplate: "Majestic cinematic tilt-up starting from architectural foundation ascending to pinnacle roofline of {{subject}}, striking sky backdrop, golden hour clouds, crystal sharp detail.",
    cameraMovement: "Fluid 60-degree vertical tilt upward on heavy geared tripod head with gentle feathering at stop.",
    subjectMovement: "Monolithic stationary architecture; clouds drifting slowly across top frame.",
    lightingAtmosphere: "Low-angle morning sun grazing across fluted columns and textured façade panels.",
    composition: "Strong vertical leading lines pulling eye upwards from ground anchor to skyward apex.",
    lensStyleGuidance: "24mm tilt-shift architectural lens, vertical perspective correction preventing keystoning.",
    durationTargetSeconds: 3.5,
    aspectRatio: "9/16",
    transitionRecommendation: "Vertical speed blur cut into interior ceiling fresco or aerial plunge.",
    continuityRequirements: "Foundation details match ground level shots previously established.",
    providerRequirements: ["video_generation", "image_generation"],
    negativePrompt: "keystone converging verticals, handheld shake, abrupt pan stop, jagged edge aliasing.",
    tags: ["tilt", "pan", "vertical", "architecture", "skyscrapers"],
  },

  // 9. Wide establishing shot
  {
    id: "shot-wide-establishing",
    name: "Wide Panoramic Establishing Shot",
    purpose: "Ground the entire narrative in a grand scenic tableau with complete environmental atmosphere.",
    promptTemplate: "Cinematic ultra-wide landscape establishing tableau of {{subject}} situated in {{setting}}, serene atmosphere, balanced color palette of warm ivory and charcoal, commercial studio SLA.",
    cameraMovement: "Static lock-off or ultra-slow 1% creep-in, emphasizing meditative poise and grand permanence.",
    subjectMovement: "Subtle organic life (gentle breeze, flowing water, shifting sunbeams).",
    lightingAtmosphere: "Soft twilight or crisp overcast diffusion with high dynamic range retention.",
    composition: "Symmetrical classical framing with formal balance reminiscent of traditional Indian spatial layouts.",
    lensStyleGuidance: "35mm prime, stopped down to f/8 for tack-sharp foreground foliage and distant horizons.",
    durationTargetSeconds: 4,
    aspectRatio: "16/9",
    transitionRecommendation: "Dissolve to medium establishing shot exploring entry courtyard.",
    continuityRequirements: "Weather conditions and time-of-day match the campaign scene storyboard.",
    providerRequirements: ["image_generation", "video_generation"],
    negativePrompt: "oversaturated colors, cartoonish rendering, digital noise, crooked horizon line.",
    tags: ["wide", "establishing", "tableau", "landscape", "serene"],
  },

  // 10. Medium shot and close-up
  {
    id: "shot-medium-close-up",
    name: "Medium Shot & Portrait Close-Up",
    purpose: "Connect on a personal human or tactile level with the artisan, model, or product interface.",
    promptTemplate: "Intimate medium close-up of {{subject}}, authentic focused expression, cinematic Rembrandt lighting, warm studio rim, authentic skin texture and fine details, 8k portrait.",
    cameraMovement: "Subtle handheld breathing motion on gimbal, organic and emotionally resonant.",
    subjectMovement: "Subtle genuine human gesture or deliberate product interaction (touching material, adjusting dial).",
    lightingAtmosphere: "Classic 3-point studio lighting with key, soft fill, and subtle warm hair/rim separation.",
    composition: "Eye line on the upper third grid; clean negative space allowing kinetic typography placement.",
    lensStyleGuidance: "85mm f/1.4 prime, razor-thin focal plane on the subject's nearest eye or emblem.",
    durationTargetSeconds: 3,
    aspectRatio: "9/16",
    transitionRecommendation: "Match-cut on subject gesture to extreme macro detail.",
    continuityRequirements: "Wardrobe, jewelry, and hair styling match preceding lifestyle sequences.",
    providerRequirements: ["video_generation", "image_generation"],
    negativePrompt: "plastic waxy skin, uncanny valley expression, distorted eyes, extra fingers, poor lighting.",
    tags: ["portrait", "close_up", "rembrandt", "lifestyle", "human"],
  },

  // 11. Macro product detail
  {
    id: "shot-macro-product-detail",
    name: "Macro Product & Material Detail",
    purpose: "Highlight exquisite manufacturing tolerances, bespoke textures, and luxury materiality.",
    promptTemplate: "Extreme macro 4k close-up focusing on {{material_or_part}}, laser-engraved details, brushed brass reflections, polished marble veining, luxury atelier craft, microscopic depth.",
    cameraMovement: "Slow motorized slider crawl with precision motorized focus pull skimming across the surface ridges.",
    subjectMovement: "Stationary product with grazing light beam sweeping slowly across engraved typography.",
    lightingAtmosphere: "Grazing rim light at 15-degree acute angle to highlight micro-textures and surface relief.",
    composition: "Diagonal abstract textural composition, transforming product anatomy into fine art.",
    lensStyleGuidance: "100mm f/2.8 Macro lens at 1:1 reproduction ratio, extreme shallow focus with laser-sharp apex.",
    durationTargetSeconds: 3,
    aspectRatio: "1/1",
    transitionRecommendation: "Flash-frame light bloom cut to full product hero presentation.",
    continuityRequirements: "Material finishes and engravings match official CAD / 3D design files.",
    providerRequirements: ["image_generation", "video_generation"],
    negativePrompt: "blurry textures, flat lighting, digital compression banding, low poly jagged edges.",
    tags: ["macro", "textures", "jewelry", "craftsmanship", "materials"],
  },

  // 12. Slow-motion-style sequence where supported
  {
    id: "shot-slow-motion-sequence",
    name: "Slow-Motion High-Speed Sequence",
    purpose: "Dramatize fluid dynamics, fabric movement, droplet splashes, or explosive action with high elegance.",
    promptTemplate: "120fps high-speed cinematic slow motion capturing {{dynamic_action}}, suspended droplets, fluttering luxury silk, crystal clear frozen physics, photorealistic studio render.",
    cameraMovement: "Static high-speed lockoff or slow counter-tracking glide opposite the primary action vector.",
    subjectMovement: "Ultra-fast fluid or material dynamic slowed down to 20% speed, revealing hypnotic physics.",
    lightingAtmosphere: "High-intensity continuous flicker-free studio strobes creating crisp specular highlights.",
    composition: "Balanced centered burst composition with radial dispersion toward frame edges.",
    lensStyleGuidance: "50mm high-speed cinema prime, f/2.8, 1/1000s shutter equivalent motion sharpness.",
    durationTargetSeconds: 3.5,
    aspectRatio: "9/16",
    transitionRecommendation: "Speed-ramp acceleration snap into real-time product lock.",
    continuityRequirements: "Fluid colors and viscosities correspond to brand product properties.",
    providerRequirements: ["video_generation"],
    negativePrompt: "motion stutter, frame ghosting, temporal flickering, warped fluid boundaries.",
    tags: ["slow_motion", "fluid", "high_speed", "elegance", "physics"],
  },

  // 13. Cinematic reveal
  {
    id: "shot-cinematic-reveal",
    name: "Cinematic Lighting Silhouette Reveal",
    purpose: "Introduce a flagship product or architectural space from deep shadow into brilliant clarity.",
    promptTemplate: "Dramatically lit reveal of {{subject}}, starting in deep chiaroscuro silhouette as warm brass studio lights fade up to illuminate metallic contours, high luxury commercial.",
    cameraMovement: "Slow deliberate push-in synchronized with the gradual light fade-up.",
    subjectMovement: "Stationary hero pose; specular light blooms glide smoothly across edges.",
    lightingAtmosphere: "Chiaroscuro shadow gradually blooming into warm amber and brass key lighting.",
    composition: "Heroic center-dominant framing, commanding attention and veneration.",
    lensStyleGuidance: "50mm anamorphic prime with subtle horizontal oval flare streaks and rich blacks.",
    durationTargetSeconds: 4,
    aspectRatio: "16/9",
    transitionRecommendation: "Peak brilliance cut into full functional product showcase.",
    continuityRequirements: "Subject orientation matches the opening shot of the product breakdown.",
    providerRequirements: ["video_generation", "image_generation"],
    negativePrompt: "clipping blacks, muddy grey shadows, sudden exposure jump, noisy dark regions.",
    tags: ["reveal", "silhouette", "chiaroscuro", "flagship", "lighting"],
  },

  // 14. Seamless transition and match-cut plan
  {
    id: "shot-seamless-match-cut",
    name: "Seamless Match-Cut Transition Shot",
    purpose: "Bridge two distinct scenes or eras through identical compositional shapes and velocity vectors.",
    promptTemplate: "Seamless match-cut composition of {{element_A}} morphing in identical position to {{element_B}}, continuous motion vector, fluid transformation, immaculate visual symmetry.",
    cameraMovement: "Fast continuous whip-pan or circular rotational snap centered exactly on the morph anchor point.",
    subjectMovement: "Element A completes action; Element B continues with identical inertia.",
    lightingAtmosphere: "Matched color temperature across the cut point to maintain psychological continuity.",
    composition: "Identical geometric placement of key anchor element in both preceding and trailing frame.",
    lensStyleGuidance: "35mm prime, matched focal length and depth of field across both setups.",
    durationTargetSeconds: 2.5,
    aspectRatio: "9/16",
    transitionRecommendation: "Zero-frame match-cut or 2-frame optical motion blur blend.",
    continuityRequirements: "Screen position coordinates (X, Y) of the anchor element must align within 2% tolerance.",
    providerRequirements: ["video_generation", "motion_graphics"],
    negativePrompt: "misaligned focal point, jarring color jump, velocity mismatch, distracting eye dart.",
    tags: ["match_cut", "seamless", "transition", "kinetic", "editing"],
  },

  // 15. Parallax and depth movement
  {
    id: "shot-parallax-depth",
    name: "Multi-Layer Parallax & Depth Drift",
    purpose: "Emphasize spatial three-dimensionality through dramatic differential speeds of foreground, mid, and background.",
    promptTemplate: "Pronounced 3D parallax tracking shot across {{environment}}, lush foreground arches passing quickly, midground {{subject}} in sharp focus, distant mountains drifting slowly.",
    cameraMovement: "Horizontal tracking slide on 3-meter track passing close behind decorative foreground lattices.",
    subjectMovement: "Subject remains stationary as the camera's translation creates intense 3-layer parallax.",
    lightingAtmosphere: "Backlit foreground silhouette, warmly illuminated midground, hazy atmospheric distant background.",
    composition: "Three distinct visual planes: 15% foreground veil, 50% sharp subject plane, 35% deep vista.",
    lensStyleGuidance: "35mm cinema lens, f/2.8, creating distinct optical depth separation between planes.",
    durationTargetSeconds: 4,
    aspectRatio: "16/9",
    transitionRecommendation: "Foreground element completely wipes across frame to reveal next room.",
    continuityRequirements: "Lattice style and spatial scale match brand design tokens.",
    providerRequirements: ["video_generation", "3d_model_generation"],
    negativePrompt: "flat 2d cardboard cutout appearance, warping foreground pillars, stuttering slide.",
    tags: ["parallax", "depth", "spatial", "architectural", "3d"],
  },

  // 16. Day-to-night or lighting transformation
  {
    id: "shot-day-to-night-transformation",
    name: "Day-to-Night Time-Lapse Transformation",
    purpose: "Demonstrate architectural lighting versatility and mood transformation across a 24-hour cycle.",
    promptTemplate: "Seamless time-lapse transformation of {{subject}} transitioning from bright noon sunlight through golden sunset into starry dusk with architectural facade illumination glowing warm amber.",
    cameraMovement: "Locked tripod shot or slow steady motorized 1mm/sec tracking crawl across entire timeline.",
    subjectMovement: "Stationary architecture; sun arcs overhead, shadows lengthen, stars emerge in indigo sky.",
    lightingAtmosphere: "Dynamic transition from 5600K daylight to 2200K golden sunset to 3200K interior warm lighting.",
    composition: "Balanced landscape orientation ensuring sky and ground illumination balance equally.",
    lensStyleGuidance: "24mm architectural prime with automated aperture compensation, f/8 consistency.",
    durationTargetSeconds: 5,
    aspectRatio: "16/9",
    transitionRecommendation: "Settle into night scene before pushing into warmly lit interior lounge.",
    continuityRequirements: "Facade fixture placements must correspond exactly with electrical blueprints.",
    providerRequirements: ["video_generation", "image_generation"],
    negativePrompt: "exposure strobing, jerky shadow jumps, unnatural sudden darkness, flickering sky.",
    tags: ["timelapse", "day_to_night", "lighting", "transformation", "facade"],
  },

  // 17. Lifestyle and brand storytelling
  {
    id: "shot-lifestyle-brand-story",
    name: "Lifestyle & Brand Narrative Sequence",
    purpose: "Imbue the creative deliverable with aspirational human emotion, brand values, and studio heritage.",
    promptTemplate: "Cinematic lifestyle narrative scene featuring {{talent_or_artisan}} interacting with {{brand_product}}, warm authentic morning light, contemplative serene mood, premium brand storytelling.",
    cameraMovement: "Gentle handheld slider drift with natural organic micro-repositioning.",
    subjectMovement: "Natural unforced human interaction: reviewing architectural plans, holding luxury finished piece.",
    lightingAtmosphere: "Natural window light pouring through linen drapes with subtle dust motes dancing in sunbeams.",
    composition: "Environmental portrait composition: subject occupies right third, atelier surroundings tell the story.",
    lensStyleGuidance: "50mm f/1.8 prime lens, painterly background rendering and soft contrast.",
    durationTargetSeconds: 4,
    aspectRatio: "9/16",
    transitionRecommendation: "Gentle cross-fade into closing product hero climax.",
    continuityRequirements: "Props, color palette, and atelier materials match brand profile guidelines.",
    providerRequirements: ["video_generation", "image_generation"],
    negativePrompt: "stiff posed look, cheesy corporate expressions, harsh fluorescent lighting, chaotic background.",
    tags: ["lifestyle", "storytelling", "brand_heritage", "human", "reels"],
  },

  // 18. Final hero shot and end-card sequence
  {
    id: "shot-final-hero-end-card",
    name: "Final Hero Presentation & End-Card",
    purpose: "Deliver the definitive memorable brand impression with master typography, CTA, and studio seal.",
    promptTemplate: "Definitive hero master shot of {{brand_product}} resting on warm ivory pedestal, gold lotus emblem gleaming, kinetic typography overlay: '{{cta_text}}', immaculate studio art direction.",
    cameraMovement: "Very slow micro-recede (0.5% pull-out) settling into perfectly stable locked-off hero lock.",
    subjectMovement: "Product rests majestically stationary; specular light glints across metal chamfered edges.",
    lightingAtmosphere: "Sutra Studio master atelier lighting: subtle top rim, warm ivory base, soft muted brass accents.",
    composition: "Centrally weighted classical hierarchy with ample lower and upper thirds for logo and CTA text.",
    lensStyleGuidance: "85mm prime cinema lens, f/4, perfectly flat field with crisp product edge resolution.",
    durationTargetSeconds: 4,
    aspectRatio: "9/16",
    transitionRecommendation: "Hold for 2 seconds on final typography lock before fade to black.",
    continuityRequirements: "Brand typography fonts, logo lockup, and official disclaimer match Brand Kit exactly.",
    providerRequirements: ["video_generation", "image_generation", "motion_graphics"],
    negativePrompt: "misspelled typography, off-center logo, low-res textures, muddy background.",
    tags: ["hero", "end_card", "cta", "branding", "master_lock"],
  },
];

export type CinematicShotPreset = ShotPreset;

/**
 * Get shot preset by ID
 */
export function getShotPresetById(id: string): ShotPreset | undefined {
  return CINEMATIC_SHOT_PRESETS.find((p) => p.id === id);
}

/**
 * Filter shot presets by tag or capability
 */
export function filterShotPresets(options: {
  tag?: string;
  aspectRatio?: string;
  capability?: string;
}): ShotPreset[] {
  return CINEMATIC_SHOT_PRESETS.filter((preset) => {
    if (options.tag && !preset.tags.includes(options.tag)) return false;
    if (options.aspectRatio && preset.aspectRatio !== options.aspectRatio) return false;
    if (options.capability && !preset.providerRequirements.includes(options.capability)) return false;
    return true;
  });
}

/**
 * Filter shot presets by category
 */
export function getShotPresetsByCategory(category: string): ShotPreset[] {
  if (category === "all") return CINEMATIC_SHOT_PRESETS;
  return CINEMATIC_SHOT_PRESETS.filter((preset) => {
    if (preset.category === category) return true;
    if (category === "architectural" && (preset.tags.includes("architecture") || preset.tags.includes("real_estate"))) return true;
    if (category === "product" && (preset.tags.includes("product") || preset.tags.includes("macro"))) return true;
    if (category === "brand_film" && (preset.tags.includes("storytelling") || preset.tags.includes("cinematic") || preset.tags.includes("brand_heritage"))) return true;
    if (category === "aerial" && (preset.tags.includes("drone") || preset.tags.includes("aerial"))) return true;
    if (category === "social_motion" && (preset.tags.includes("dynamic") || preset.tags.includes("social") || preset.tags.includes("reels"))) return true;
    return false;
  });
}

/**
 * Compile production prompt template with variables and parameters
 */
export function compileShotPrompt(
  preset: ShotPreset,
  variables: {
    subject: string;
    environment?: string;
    lighting?: string;
    details?: string;
    foreground_element?: string;
    brand_product?: string;
    cta_text?: string;
  }
): string {
  let prompt = preset.promptTemplate;
  prompt = prompt.replace(/\{\{subject\}\}/g, variables.subject);
  prompt = prompt.replace(/\{\{environment\}\}/g, variables.environment || "luxurious architectural space");
  prompt = prompt.replace(/\{\{foreground_element\}\}/g, variables.foreground_element || "sculpted ivory archway");
  prompt = prompt.replace(/\{\{brand_product\}\}/g, variables.brand_product || variables.subject);
  prompt = prompt.replace(/\{\{cta_text\}\}/g, variables.cta_text || "Discover the collection at sutrastudio.com");

  if (variables.lighting) {
    prompt += ` Lighting: ${variables.lighting}.`;
  } else {
    prompt += ` Lighting: ${preset.lightingAtmosphere || preset.lightingAndAtmosphere}.`;
  }

  if (variables.details) {
    prompt += ` Details: ${variables.details}.`;
  }

  prompt += ` Camera Movement: ${preset.cameraMovement}.`;
  prompt += ` Lens Guidance: ${preset.lensStyleGuidance}.`;

  return prompt;
}

