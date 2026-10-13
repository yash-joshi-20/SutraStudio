# 06 — Professional Cinematic Shot Presets (18 Master Presets)

To elevate AI-generated visual media into luxury commercial-grade storytelling, Sutra Studio provides **18 Professional Cinematic Shot Presets** in `src/lib/creative-automation/shotPresets.ts`. These presets define precise cinematographic camera movement, lens styles, lighting setups, and negative constraints.

---

## 🎬 Master Presets Directory

| # | Preset Name | Category | Aspect Ratio | Target Duration | Primary Camera Movement |
|---|---|---|---|---|---|
| **01** | Aerial Establishing Shot | `architectural` | 16/9 | 4.0s | High-altitude slow forward drone glide |
| **02** | Drone-Style Forward Reveal | `aerial` | 16/9 | 3.5s | Low-to-high ascending push-in over foreground |
| **03** | Drone Orbit Around Subject | `aerial` | 16/9 | 5.0s | Continuous circular 180° orbital pan |
| **04** | High-Angle & Bird's-Eye View | `architectural` | 1/1, 16/9 | 3.5s | Perpendicular 90° top-down slow descend |
| **05** | Architectural Fly-Through | `architectural` | 16/9 | 4.5s | Smooth steady interior trajectory through arches |
| **06** | Smooth Push-In & Pull-Out | `product` | 9/16, 16/9 | 3.5s | Controlled dolly push-in directly toward focal core |
| **07** | Tracking & Follow Shot | `brand_film` | 16/9 | 4.0s | Lateral tracking dolly parallel to moving subject |
| **08** | Pan, Tilt & Controlled Move | `architectural` | 9/16, 16/9 | 3.5s | Precision vertical tilt from foundation to pinnacle |
| **09** | Wide Establishing Shot | `brand_film` | 16/9 | 4.0s | Static locked-off wide panoramic composition |
| **10** | Medium Shot & Close-Up | `brand_film` | 9/16 | 3.0s | Intimate medium portrait with creamy bokeh |
| **11** | Macro Product Detail | `product` | 1/1, 9/16 | 3.0s | Extreme optical magnification on material craft |
| **12** | Slow-Motion Sequence | `social_motion` | 9/16, 16/9 | 4.0s | Ultra-high frame rate 120fps fluid deceleration |
| **13** | Cinematic Reveal | `brand_film` | 16/9 | 3.5s | Controlled light flare sweep unveiling subject |
| **14** | Seamless Match-Cut Transition | `social_motion` | 9/16, 16/9 | 2.5s | High-velocity rotational whip pan matching axis |
| **15** | Parallax & Depth Movement | `architectural` | 16/9 | 4.0s | Lateral slider track creating 3-plane parallax |
| **16** | Day-to-Night Transformation | `architectural` | 16/9 | 5.0s | Time-slice timelapse transitioning golden hour to twilight |
| **17** | Lifestyle & Storytelling | `brand_film` | 9/16 | 4.0s | Handheld naturalistic documentary micro-sway |
| **18** | Final Hero Presentation | `product` | 9/16 | 4.0s | Micro-recede settling into locked-off master logo lockup |

---

## 🔍 Selected Preset Breakdowns

### Preset 01: Aerial Establishing Shot
- **Purpose**: Establish geographical scale, environmental context, and master architectural footprint.
- **Prompt Blueprint**: `"Ultra-wide cinematic aerial establishing shot overlooking {{subject}}, soaring high above landscape, expansive horizon, photorealistic 8k, golden hour illumination."`
- **Camera Movement**: High-altitude slow forward drifting drone with subtle 3° downward tilt.
- **Lens Guidance**: 24mm ultra-wide anamorphic cinema lens, deep depth of field (f/8), edge-to-edge sharpness.
- **Lighting Atmosphere**: Golden hour warm sunbeams breaking through morning haze, long atmospheric shadows.
- **Negative Prompt**: `"low-resolution, jerky camera, fisheye distortion, blown out sky, digital noise, pixelated horizon."`

### Preset 11: Macro Product Detail
- **Purpose**: Showcase artisan craftsmanship, bespoke tactile textures, chamfered brass edges, and micro-precision.
- **Prompt Blueprint**: `"Extreme macro cinematic probe lens shot gliding across micro-textures of {{subject}}, glistening specular reflections, warm ivory tone, breathtaking tactile depth."`
- **Camera Movement**: Precision motorized micro-slider tracking across surface with minute focal pull.
- **Lens Guidance**: 100mm macro f/2.8 lens, razor-thin depth of field with buttery falloff.
- **Negative Prompt**: `"blurry, fingerprint smudges, harsh glare, washed out color, flat lighting."`

### Preset 16: Day-to-Night Transformation
- **Purpose**: Illustrate atmospheric versatility and lighting design transitioning from sunlight to illuminated night elegance.
- **Prompt Blueprint**: `"Seamless time-slice timelapse of {{subject}} transitioning from golden hour sunlight into warm twilight, architectural accent illumination igniting softly."`
- **Camera Movement**: 100% locked-off tripod mount with zero positional drift during lighting ramp.
- **Lens Guidance**: 35mm prime cinema lens (f/5.6) maintaining consistent focal planes across lighting shifts.

---

## 🛠️ The Prompt Compiler: `compileShotPrompt`

`compileShotPrompt` dynamically blends creative variables (subject, environment, lighting, details) into production-ready prompts:

```typescript
const prompt = compileShotPrompt(preset, {
  subject: "Sutra Studio Luxury Architectural Pavilion",
  environment: "sunset travertine desert courtyard",
  lighting: "golden hour warm rim lighting",
  details: "brushed brass lotus details, hand-carved ivory stone",
});
```
