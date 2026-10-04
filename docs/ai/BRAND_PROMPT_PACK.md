# Sutra Studio: Master Brand Prompt Pack
**Official Social Media, Creative Ads & Autonomous Workflow Prompt Engineering Guide**  
*Tailored for Instagram, Facebook, Meta Ads, FLUX.1, Kling Video, and ElevenLabs*

---

## 1. Brand Style Block (Mandatory on Every Generation)

### Studio Color Tokens
* **Primary Brown**: `#5C3A1E` (Warm Atelier Teak / Coffee)
* **Gold Accent**: `#D4A35A` / `#A98B57` (Antique Brass & Gold Leaf)
* **Ink (Headings)**: `#0F172A` / `#171717` (Deep Obsidian Ink)
* **Slate (Secondary Text)**: `#64748B` (Muted Editorial Charcoal)
* **Cream Background**: `#F8F5EF` / `#FAF9F5` (Warm Ivory & Pure Canvas)
* **Warm White (Cards)**: `#FFFDF9`
* **Soft Gold Tint**: `#FDF9F0`

### Brand Mood & Directives
* **Mood**: Warm, premium, calm, crafted luxury, architectural precision.
* **Tagline**: `IDEAS • DESIGN • DEVELOPMENT • GROWTH`
* **Emblem**: Gold-brown lotus monogram with serif wordmark `SUTRA STUDIO`.
* **Typography**: Clean sans-serif (Inter / Modern Grotesk). Serif reserved for logo/titles.

```text
BRAND STYLE: premium warm minimal studio aesthetic. Palette: deep chocolate brown #5C3A1E, antique gold #D4A35A, ink navy #0F172A, soft cream background #F8F5EF, warm white #FFFDF9. Soft natural light, subtle gold highlights, generous negative space, rounded-corner cards, clean sans-serif look, calm and professional.
NEGATIVE: neon colors, purple or cyan glow, cartoon style, low resolution, distorted or fake text, watermark, clutter, extra fingers, other brands' logos, stock-photo cliche.
```

---

## 2. Image Prompts (FLUX.1 / Pollinations / HuggingFace)

> **Variable**: `{SUBJECT}` = Choose from Section 2.7 based on discipline.

### 2.1 Instagram Feed Post (1:1 or 4:5)
```text
Square Instagram post visual for Sutra Studio, a premium creative and digital studio. Subject: {SUBJECT}. Composition: large calm negative space at the top-left reserved for a headline (do not render any text), subject on the lower-right third, soft natural window light, subtle gold rim highlights. Photorealistic, high detail, premium editorial look. BRAND STYLE: premium warm minimal studio aesthetic. Palette: deep chocolate brown #5C3A1E, antique gold #D4A35A, ink navy #0F172A, soft cream background #F8F5EF, warm white #FFFDF9. Soft natural light, subtle gold highlights, generous negative space, rounded-corner cards, clean sans-serif look, calm and professional. NEGATIVE: neon colors, purple or cyan glow, cartoon style, low resolution, distorted or fake text, watermark, clutter, extra fingers, other brands' logos, stock-photo cliche.
```

### 2.2 Carousel (5 Slides, 4:5)
```text
Create 5 matching 4:5 carousel background images for Sutra Studio about {SERVICE}. Same palette and lighting on all slides. Slide 1: bold hook scene with large empty area for a title. Slides 2-4: one clear visual idea each (problem, process, result) with space for a short caption. Slide 5: calm cream background with a centered empty area for the logo and call to action. No text inside the images. BRAND STYLE: premium warm minimal studio aesthetic. Palette: deep chocolate brown #5C3A1E, antique gold #D4A35A, ink navy #0F172A, soft cream background #F8F5EF, warm white #FFFDF9. Soft natural light, subtle gold highlights, generous negative space, rounded-corner cards, clean sans-serif look, calm and professional. NEGATIVE: neon colors, purple or cyan glow, cartoon style, low resolution, distorted or fake text, watermark, clutter, extra fingers, other brands' logos, stock-photo cliche.
```

### 2.3 Story / Reel Cover (9:16 Vertical)
```text
Vertical 9:16 story background for Sutra Studio: {SUBJECT}, centered in the middle third, keep the top 13% and bottom 18% visually quiet, cream and soft gold gradient, gentle depth of field. No text. BRAND STYLE: premium warm minimal studio aesthetic. Palette: deep chocolate brown #5C3A1E, antique gold #D4A35A, ink navy #0F172A, soft cream background #F8F5EF, warm white #FFFDF9. Soft natural light, subtle gold highlights, generous negative space, rounded-corner cards, clean sans-serif look, calm and professional. NEGATIVE: neon colors, purple or cyan glow, cartoon style, low resolution, distorted or fake text, watermark, clutter, extra fingers, other brands' logos, stock-photo cliche.
```

### 2.4 Facebook Cover / Page Header (Wide Panoramic)
```text
Wide panoramic header for the Sutra Studio Facebook page: a calm premium studio scene with brown and gold tones, subject centered, left and right edges simple and uncluttered because Facebook crops differently on desktop and mobile. No text. BRAND STYLE: premium warm minimal studio aesthetic. Palette: deep chocolate brown #5C3A1E, antique gold #D4A35A, ink navy #0F172A, soft cream background #F8F5EF, warm white #FFFDF9. Soft natural light, subtle gold highlights, generous negative space, rounded-corner cards, clean sans-serif look, calm and professional. NEGATIVE: neon colors, purple or cyan glow, cartoon style, low resolution, distorted or fake text, watermark, clutter, extra fingers, other brands' logos, stock-photo cliche.
```

### 2.5 Profile Picture & Highlight Covers
* **Flat Emblem**:
  ```text
  Flat minimal emblem background: soft cream circle with a subtle warm gradient and a thin gold ring, empty center for the logo. BRAND STYLE: premium warm minimal studio aesthetic. Palette: deep chocolate brown #5C3A1E, antique gold #D4A35A, ink navy #0F172A, soft cream background #F8F5EF, warm white #FFFDF9. Soft natural light, subtle gold highlights. NEGATIVE: neon colors, purple or cyan glow, cartoon style, distorted text.
  ```
* **Icon Set**:
  ```text
  Set of simple gold line icons on a deep brown #5C3A1E square, one icon each for Image, Video, 3D, 360, Interior, Marketing, Web, App, AI. Clean, consistent stroke, no text.
  ```

### 2.6 Ad Creative (Static, 1:1 and 9:16)
```text
Advertising visual for Sutra Studio promoting {SERVICE}: clear single focal subject ({SUBJECT}), strong contrast between the subject and a cream background, a clean empty area on one side for the offer text and button, premium and trustworthy feel. No text inside the image. BRAND STYLE: premium warm minimal studio aesthetic. Palette: deep chocolate brown #5C3A1E, antique gold #D4A35A, ink navy #0F172A, soft cream background #F8F5EF, warm white #FFFDF9. Soft natural light, subtle gold highlights, generous negative space, rounded-corner cards, clean sans-serif look, calm and professional. NEGATIVE: neon colors, purple or cyan glow, cartoon style, low resolution, distorted or fake text, watermark, clutter, extra fingers, other brands' logos, stock-photo cliche.
```

### 2.7 Service-Specific Subjects (`{SUBJECT}`)
1. **Image Creation**: `a styled product still life on a cream surface with warm gold reflections`
2. **Video Creation**: `a minimalist film set with a camera and soft key light in brown and gold tones`
3. **3D Modeling**: `a clean matte 3D object on a cream pedestal with gold edge light`
4. **360 View**: `a bright modern interior seen through a gently curved panoramic frame, warm wood and brass`
5. **Interior Design**: `a calm luxury living room with walnut wood, brass accents and cream walls`
6. **Window Design**: `elegant window frames in morning light with a warm wood sill`
7. **Digital Marketing**: `a tidy desk with a content calendar, phone and notebook in brown and gold`
8. **Meta Ads Launcher**: `abstract rising bars in gold on a cream background, no brand logos`
9. **Website Development**: `a laptop showing a warm cream and brown website layout, no readable text`
10. **Web App Development**: `a tablet dashboard with soft cream cards and brown accents`
11. **Mobile App Setup**: `a hand holding a phone with a clean brown and gold app screen`
12. **AI Automation**: `abstract connected gold nodes on a cream background, calm and minimal`

---

## 3. Video Prompts (Kling AI / Runway)

### 3.1 Reel Hook (9:16 Vertical, 6 Seconds)
```text
9:16 vertical, 6 seconds. Slow cinematic push-in on {SUBJECT} in a warm cream studio, soft natural light, gold highlights gently shifting across the surfaces, shallow depth of field, smooth stabilized camera, premium editorial feel. Palette: #5C3A1E brown, #D4A35A gold, #F8F5EF cream. No text, no logos, no flicker, no faces.
```

### 3.2 15-Second Commercial (3-Shot Sequence)
* **Shot 1 (0–3s)**: Close-up hook on `{SUBJECT}`, quick gentle push-in.
* **Shot 2 (3–10s)**: Two or three clean showcase angles of the result with soft parallax.
* **Shot 3 (10–15s)**: Calm cream end frame with an empty center for the logo and call to action.
* **Directives**: Warm natural light, brown and gold palette (`#5C3A1E` / `#D4A35A` / `#F8F5EF`), smooth camera, zero text, zero flicker.

### 3.3 Website Hero Loop (16:9 Seamless, 8 Seconds)
```text
16:9, 8 seconds, seamless loop. Very slow drift across a calm premium studio desk in cream and warm wood, soft morning light moving gently, subtle gold highlights, minimal motion, no people, no text. The first and last frames match so the loop is invisible. Palette #5C3A1E, #D4A35A, #F8F5EF.
```

### 3.4 Studio Voiceover Script Generator (ElevenLabs + Gemini)
```text
Write a 15-second voiceover script for Sutra Studio (ideas, design, development, growth) about {SERVICE}. Warm, confident, simple words. Hook in the first 3 seconds, one clear benefit, one call to action to start an order on the website. Language: {Gujarati|Hindi|English}. Give 2 versions. No exaggerated claims or guarantees.
```

---

## 4. Copywriting & Content Frameworks (Gemini 3.x / Groq)

### 4.1 Post Caption Prompt
```text
You are the social media copywriter for Sutra Studio (ideas, design, development, growth). Write 3 caption options for an Instagram and Facebook post about {SERVICE}. Tone: warm, confident, premium, simple words. Structure: one-line hook, two or three short value lines, a clear call to action to start an order on the website, then 8-12 relevant hashtags (mix of broad and niche, nothing spammy). Language: {Gujarati|Hindi|English}. Under 150 words. No false claims.
```

### 4.2 30-Day Content Calendar Prompt
```text
Create a 30-day Instagram and Facebook content calendar for Sutra Studio covering our 12 services (image, video, 3D, 360, interior, window design, digital marketing, Meta ads, website, web app, mobile app, AI automation). Mix: 40% educational, 30% showcase or behind-the-scenes, 20% offers or monthly package promotion, 10% client results (only real ones). For each day give: format (post, carousel, reel, story), topic, image or video idea, caption hook, best posting time for India.
```

### 4.3 Page Bio & About
```text
Write an Instagram bio (max 150 characters) and a Facebook page About text (max 400 characters) for Sutra Studio: ideas, design, development and growth. Mention image, video, 3D, 360 view, interior design, websites, apps and AI automation. Warm premium tone, one call to action to order on our website. Language: {Gujarati|Hindi|English}.
```

---

## 5. Meta Ads Setup Blueprint (Mandatory PAUSED Guard)

```text
You are a Meta Ads strategist. Create a campaign blueprint for Sutra Studio to promote {SERVICE} to {TARGET_CLIENTS} in {LOCATIONS}. Output strict JSON with: objective (Leads, Traffic or Messages), audience (age range, locations, language, 8 interest ideas, exclusions), daily budget cap and duration as a suggestion, placements, 3 ad variants each with primary text (short), headline (short), description, call-to-action button, image or video brief that uses the brand palette #5C3A1E, #D4A35A, #F8F5EF, UTM parameters (utm_source=meta_ads, utm_medium=paid, utm_campaign={SERVICE}), and a tracking and testing plan (what to compare after 3-5 days). Status must be PAUSED. List assumptions and anything that needs my approval. No guaranteed-results claims.
```

---

## 6. Pre-Publish Quality Gate Checklist (QA-7)

- [ ] **Palette Consistency**: Matches `#5C3A1E`, `#D4A35A`, `#F8F5EF` — zero neon/cyan glow.
- [ ] **Mobile Safe Zone**: Top 13% and bottom 18% kept quiet on Reels/Stories.
- [ ] **Typography & Legibility**: No AI-hallucinated distorted text in raw images; text overlay added via Canvas/Compositor.
- [ ] **No Brand Infringements**: No third-party logos or real face depictions.
- [ ] **Campaign Status**: Ads generated strictly in `PAUSED` status.
- [ ] **Clean UTM Routing**: Campaign links appended with `utm_source=meta_ads&utm_medium=social`.
