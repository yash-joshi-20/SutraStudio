# સિનેપ્સ કાઇનેટિક — માસ્ટર n8n વર્કફ્લો બ્લુપ્રિન્ટ અને માસ્ટર પ્રોમ્પ્ટ્સ (ગુજરાતી)

## ૧. સમગ્ર n8n ઓટોમેશન આર્કિટેક્ચર (Overview)

**SYNAPSE KINETIC** પ્લેટફોર્મ સેલ્ફ-હોસ્ટેડ n8n (Docker) પર ચાલે છે. તેમાં **૧ માસ્ટર ઓર્કેસ્ટ્રેટર વર્કફ્લો** અને તેના આધારે ચાલતા **૫ સ્પેશિયલાઇઝ્ડ સબ-વર્કફ્લો** છે. દરેક વર્કફ્લો આપમેળે ક્લાયન્ટ પાસેથી માહિતી લેશે, રિસર્ચ કરશે, ઈમેજ/વિડિયો બનાવશે, Meta Ads માં એડ લાઈવ કરશે અને ક્લાયન્ટને WhatsApp/ઇમેઇલ દ્વારા અપડેટ મોકલશે.

```
+-------------------------------------------------------------------------------------------------------------+
|                                    SYNAPSE MASTER n8n વર્કફ્લો આર્કિટેક્ચર                                    |
+-------------------------------------------------------------------------------------------------------------+
|                                                                                                             |
|                    [ ક્લાયન્ટ ઓર્ડર ઇન્ટેક / ચેટબોટ વેબહૂક ]                                                 |
|                                       |                                                                     |
|                                       v                                                                     |
|                 +---------------------------------------------+                                             |
|                 | ૦૧. માસ્ટર એજન્સી ઓર્કેસ્ટ્રેટર વર્કફ્લો     |                                             |
|                 |  * ક્લાયન્ટનો બિઝનેસ અને બ્રાન્ડ તપાસશે     |                                             |
|                 |  * PostgreSQL ડેટાબેઝમાં ઓર્ડર નોંધશે        |                                             |
|                 |  * નીચેના તમામ સબ-વર્કફ્લો ટ્રિગર કરશે       |                                             |
|                 +---------------------+-----------------------+                                             |
|                                       |                                                                     |
|       +-------------------------------+-------------------------------+---------------------+               |
|       |                               |                               |                     |               |
|       v                               v                               v                     v               |
| +------------+                +---------------+               +---------------+     +---------------+       |
| | ૦૨. ક્લાયન્ટ|                | ૦૩. ટ્રેન્ડ   |               | ૦૪. બ્રાન્ડ   |     | ૦૫. AI વિડિયો  |       |
| | ઇન્ટેક ચેટ |                | રિસર્ચ એન્જિન |               | બેનર જનરેટર   |     | અને રીલ્સ     |       |
| | LLM એજન્ટ  |                | (Insta/FB)    |               | (FLUX/SDXL)   |     | પાઇપલાઇન      |       |
| +-----+------+                +-------+-------+               +-------+-------+     +-------+-------+       |
|       |                               |                               |                     |               |
|       +-------------------------------+-------------------------------+---------------------+               |
|                                       |                                                                     |
|                                       v                                                                     |
|                 +---------------------------------------------+                                             |
|                 | ૦૬. META ADS ઓટોમેશન & કેમ્પેઇન લોન્ચર      |                                             |
|                 |  * Facebook Page લિંક / નવું પેજ બનાવશે     |                                             |
|                 |  * ટાર્ગેટ ઓડિયન્સ & બજેટ સેટ કરશે          |                                             |
|                 |  * ક્રિએટિવ અપલોડ કરી લાઈવ એડ કરશે         |                                             |
|                 +---------------------------------------------+                                             |
+-------------------------------------------------------------------------------------------------------------+
```

---

## ૨. તમામ ૬ વર્કફ્લોની સ્ટેપ-બાય-સ્ટેપ વિગત (Detailed Workflows)

### વર્કફ્લો ૦૧: માસ્ટર એજન્સી ઓર્કેસ્ટ્રેટર (Master Orchestrator)
- **વેબહૂક URL**: `POST /webhook/synapse-master-orchestrator`
- **ક્યારે ચાલશે**: જ્યારે ક્લાયન્ટ વેબસાઇટ પર ઓર્ડર આપે અથવા ચેટબોટમાં બધી માહિતી કન્ફર્મ કરે.
- **નોડ પ્રોસેસ (Steps)**:
  1. **Webhook Ingestion**: ક્લાયન્ટ આઈડી, બિઝનેસ પ્રકાર, પ્લાન (સાપ્તાહિક/માસિક), લોગો URL અને બ્રાન્ડ કલર્સ મેળવશે.
  2. **Code Logic Node**: સર્વિસિસ ચેક કરશે (બેનર, વિડિયો, વેબસાઇટ, Meta Ads).
  3. **PostgreSQL Insert**: ઓર્ડર ડેટાબેઝમાં નોંધશે અને SLA ટાઇમલાઇન શરૂ કરશે.
  4. **Sub-Workflows Trigger**: સમાંતરે ટ્રેન્ડ રિસર્ચ, બેનર જનરેટર અને વિડિયો પાઇપલાઇનને આંતરિક વેબહૂક મોકલશે.
  5. **WhatsApp & Resend Email**: ક્લાયન્ટને ઓર્ડર કન્ફર્મેશન અને લાઇવ ટ્રેકિંગ લિંક મોકલશે.

---

### વર્કફ્લો ૦૨: AI ક્લાયન્ટ ચેટ અને રિક્વાયરમેન્ટ ઇન્ટેક (Client Intake Chat)
- **વેબહૂક URL**: `POST /webhook/synapse-client-intake-chat`
- **ક્યારે ચાલશે**: ક્લાયન્ટ જ્યારે ચેટમાં મેસેજ મોકલે કે ફાઇલ અપલોડ કરે.
- **નોડ પ્રોસેસ (Steps)**:
  1. **Chat Ingestion**: મેસેજ અને અપલોડ કરેલ લોગો/ફોટા સ્વીકારે છે.
  2. **LLM Reasoning (Gemini 2.0 / Groq Llama 3.3)**:
     - બિઝનેસનો પ્રકાર અને યુનિક સેલિંગ પોઈન્ટ પૂછશે.
     - લોગો અને બ્રાન્ડ કલર Hex કોડ્સ કન્ફર્મ કરશે.
     - ટાર્ગેટ ઓડિયન્સ અને પ્લાન (અઠવાડિયું કે મહિનો) પસંદ કરાવશે.
  3. **File & Color Validator**: લોગો SVG/PNG ફોર્મેટ અને હેક્સ કલર કોડ્સ ચેક કરશે.
  4. **CRM Sync**: ક્લાયન્ટ પ્રોફાઇલમાં ડેટા સેવ કરશે.

---

### વર્કફ્લો ૦૩: ઇન્સ્ટાગ્રામ & ફેસબુક ટ્રેન્ડ રિસર્ચ એન્જિન (Trend Research)
- **વેબહૂક URL**: `POST /webhook/synapse-trend-research-engine`
- **ક્યારે ચાલશે**: માસ્ટર વર્કફ્લો દ્વારા અથવા સાપ્તાહિક ઓટોમેટિક શેડ્યૂલ દ્વારા.
- **નોડ પ્રોસેસ (Steps)**:
  1. **Input Parser**: ક્લાયન્ટની ઇન્ડસ્ટ્રી (દા.ત. ઇન્ટિરિયર ડિઝાઇન, રિયલ એસ્ટેટ, ઇ-કોમર્સ) અને શહેર/દેશ સ્વીકારશે.
  2. **SerpAPI / Meta Scraper**: ઇન્સ્ટાગ્રામ અને ફેસબુક પર તે ઇન્ડસ્ટ્રીમાં વાયરલ થઈ રહેલી રીલ્સ, હેશટેગ્સ અને હાઇ-કન્વર્ઝન એડ્સ શોધશે.
  3. **DeepSeek V3 / Llama 3.3 AI**:
     - વાયરલ પોસ્ટ્સનું વિશ્લેષણ કરી ૫ વાયરલ હૂક્સ બનાવશે.
     - ૩ હાઇ-કન્વર્ટિંગ સેલિંગ એંગલ્સ (Problem-Solve, FOMO, Benefits) તૈયાર કરશે.
  4. **JSON Export**: આગળના ક્રિએટિવ વર્કફ્લો માટે સ્ટ્રક્ચર્ડ ડેટાબેઝમાં સેવ કરશે.

---

### વર્કફ્લો ૦૪: ઓટોમેટેડ બ્રાન્ડ બેનર જનરેશન (Brand Banner Synthesis)
- **વેબહૂક URL**: `POST /webhook/synapse-brand-banner-generator`
- **ક્યારે ચાલશે**: ટ્રેન્ડ રિસર્ચ પૂર્ણ થતાં તરત જ.
- **નોડ પ્રોસેસ (Steps)**:
  1. **Prompt Generator**: ટ્રેન્ડ હૂક્સ અને ક્લાયન્ટના બ્રાન્ડ કલર્સ ભેગા કરી 8K પ્રોમ્પ્ટ બનાવશે.
  2. **FLUX.1 / SDXL Engine**: ૩ સાઈઝમાં ફોટા જનરેટ કરશે:
     - `1:1` (સ્ક્વેર ઇન્સ્ટાગ્રામ / ફેસબુક ફીડ)
     - `9:16` (ઇન્સ્ટાગ્રામ સ્ટોરી અને રીલ્સ એડ)
     - `16:9` (વેબસાઇટ બેનર / લેન્ડસ્કેપ એડ)
  3. **Node.js Sharp Compositor**:
     - ક્લાયન્ટનો લોગો ઉપર ડાબી બાજુ કે વચ્ચે મૂકશે.
     - હેડલાઇન ટેક્સ્ટ અને બટન ("Book Now", "Shop Today") ઓવરલે કરશે.
  4. **Watermark & Storage Upload**: ક્લાયન્ટ પ્રીવ્યૂ માટે વોટરમાર્કવાળી ફાઈલ અને ફાઈનલ માટે 4K HD ફાઈલ S3 પર અપલોડ કરશે.
  5. **WhatsApp Notification**: ક્લાયન્ટને સૂચના મોકલશે કે નવા બેનર્સ પ્રીવ્યૂ માટે તૈયાર છે.

---

### વર્કફ્લો ૦૫: AI વિડિયો રીલ્સ અને કમર્શિયલ પાઇપલાઇન (Video Pipeline)
- **વેબહૂક URL**: `POST /webhook/synapse-video-reels-pipeline`
- **ક્યારે ચાલશે**: સ્ક્રિપ્ટ મંજૂર થતાં કે વિડિયો ઓર્ડર પર.
- **નોડ પ્રોસેસ (Steps)**:
  1. **Scriptwriter AI (GPT-4o / Claude 3.5)**: ૧૫ થી ૩૦ સેકન્ડની હાઈ-રીટેન્શન વિડિયો સ્ક્રિપ્ટ લખશે.
  2. **ElevenLabs / Piper Neural Voiceover**: સ્ટુડિયો ક્વોલિટી નેચરલ અવાજમાં વોઇસઓવર બનાવશે.
  3. **Runway Gen-3 / Kling AI / HeyGen**:
     - ઇન્ટિરિયર માટે: સિનેમેટિક ડ્રોન શોટ અને 3D પેનોરમા વિડિયો.
     - પ્રોડક્ટ/ઇકોમર્સ માટે: 3D પ્રોડક્ટ રોટેશન વિડિયો.
     - B2B/સર્વિસ માટે: AI સ્પોક્સપર્સન ટોકિંગ હેડ.
  4. **FFmpeg Cloud Compositor**:
     - વિડિયો ક્લિપ્સ સાથે વોઇસઓવર સિંક કરશે.
     - ઓટોમેટિક એનિમેટેડ સબટાઇટલ્સ (કેપ્શન્સ) ઉમેરશે.
     - બેકગ્રાઉન્ડ મ્યુઝિક અને ક્લાયન્ટ લોગો બર્ન કરશે.
  5. **Cloudinary CDN Upload**: 1080p/4K વિડિયો ડેશબોર્ડમાં પ્લે કરવા અને ડાઉનલોડ કરવા ઉપલબ્ધ કરશે.

---

### વર્કફ્લો ૦૬: Meta Ads Manager ઓટોમેશન અને કેમ્પેઇન લોન્ચર
- **વેબહૂક URL**: `POST /webhook/synapse-meta-ads-automation`
- **ક્યારે ચાલશે**: જ્યારે ક્લાયન્ટ કે એડમિન ક્રિએટિવ્સ મંજૂર કરી "Launch Ads" પર ક્લિક કરે.
- **નોડ પ્રોસેસ (Steps)**:
  1. **Facebook Page Linker**:
     - વિકલ્પ ૧: ક્લાયન્ટનું પોતાનું Facebook Page અને Ad Account OAuth2 થી કનેક્ટ કરશે.
     - વિકલ્પ ૨: એજન્સી દ્વારા ક્લાયન્ટ માટે નવું બ્રાન્ડેડ ફેસબુક પેજ ઓટો-ક્રિએટ કરી વાપરશે.
  2. **AdSet & Audience Configuration**:
     - ક્લાયન્ટના પ્લાન મુજબ દૈનિક બજેટ (Daily Budget) સેટ કરશે.
     - લોકેશન, ઉંમર, ભાષા અને ટાર્ગેટ ઇન્ટરેસ્ટ્સ સેટ કરશે.
  3. **Creative Upload (Meta Graph API)**:
     - મંજૂર થયેલા વિડિયો/બેનર્સ સીધા Meta Ads Manager માં અપલોડ કરશે.
     - પ્રાઇમરી ટેક્સ્ટ, હેડલાઇન, અને UTM ટ્રેકિંગ લિંક જોડશે.
  4. **Campaign Launch**: કેમ્પેઇનનું સ્ટેટસ `ACTIVE` (લાઈવ) કરી દેશે.
  5. **Hourly Telemetry**: દર કલાકે Impressions, Clicks, CPC, અને ROAS નો ડેટા એડમિન ડેશબોર્ડ પર લાવશે.

---

## ૩. માસ્ટર પ્રોડક્શન પ્રોમ્પ્ટ્સ (Master Prompts Library)

### પ્રોમ્પ્ટ ૧: સોશિયલ મીડિયા ટ્રેન્ડ અને વાયરલ હૂક રિસર્ચ
```text
System: You are an Elite Autonomous Growth Marketer and Social Media Trend Analyst.
Niche: {CLIENT_NICHE}
Target Audience: {TARGET_AUDIENCE}
Region: {TARGET_GEO}

Objective:
Real-time trend analysis on Instagram Reels & Facebook Ads.

Strict JSON Output:
{
  "trending_hashtags": ["#tag1", "#tag2", "#tag3"],
  "top_5_viral_hooks": [
    "Hook 1 (Curiosity gap)",
    "Hook 2 (Contrarian viewpoint)",
    "Hook 3 (Direct problem callout)",
    "Hook 4 (Social proof metric)",
    "Hook 5 (Instant transformation)"
  ],
  "copywriting_angles": [
    {
      "type": "Problem-Agitate-Solve",
      "headline": "...",
      "body_copy": "...",
      "cta": "..."
    }
  ],
  "visual_direction": {
    "lighting": "Studio contrast / Golden hour / Clean tech neon",
    "color_mood": "...",
    "pacing": "Fast-cut dynamic (0.8s cuts) / Smooth slow pan (2.5s cuts)"
  }
}
```

### પ્રોમ્પ્ટ ૨: હાઇ-કન્વર્ઝન બ્રાન્ડ એડ બેનર વિઝ્યુઅલ
```text
Commercial advertising photography for {CLIENT_BRAND_NAME} in the {CLIENT_NICHE} sector.
Visual Scene: Modern luxury aesthetic, {VISUAL_SUBJECT_DESCRIPTION}.
Color Theme: Dominant palette using {PRIMARY_HEX} with accents of {SECONDARY_HEX} and {ACCENT_HEX}.
Composition: Clean negative space in top-center for typography overlay, main subject in lower-third with sharp focus.
Lighting: Professional commercial studio lighting, soft volumetric shadows, 8K resolution, photorealistic Hasselblad camera quality, zero distortion.
Negative: text, watermark, blurry elements, noisy artifacts, cartoon, low resolution.
```

### પ્રોમ્પ્ટ ૩: ૩૦-સેકન્ડ વાયરલ વિડિયો રીલ સ્ક્રિપ્ટ & સ્ટોરીબોર્ડ
```text
Write a high-converting 30-second video script for an Instagram Reel & Meta Video Ad for {CLIENT_BRAND_NAME}.
Niche: {CLIENT_NICHE}
Goal: {CONVERSION_GOAL: Lead Gen / Direct Sales / Bookings}

Structure:
- [00:00 - 00:03] The 3-Second Hook: Explosive visual + pattern-interrupt voiceover line.
- [00:03 - 00:12] The Agitation: Visualizing the customer's biggest frustration.
- [00:12 - 00:22] The Solution: Introducing {CLIENT_BRAND_NAME} with 3 key benefits.
- [00:22 - 00:30] Call to Action: Urgency trigger + clear link click instructions.

Output format table:
Scene | Time | Visual Cue (Runway/Kling prompt) | Audio Voiceover | On-Screen Caption
```

### પ્રોમ્પ્ટ ૪: ઇન્ટિરિયર ડિઝાઇન 3D, 360° પેનોરમા અને ડ્રોન શોટ
```text
Photorealistic 8K architectural interior rendering of {ROOM_TYPE: Contemporary Villa Living Space / Executive Office / Luxury Kitchen}.
Interior Architecture: Clean geometric lines, natural daylight pouring through floor-to-ceiling glass panoramic windows overlooking {SURROUNDING_VIEW: City Skyline / Forest / Ocean}.
Materials: Handcrafted white oak cabinetry, Calacatta gold marble island, matte black hardware, recessed warm LED cove strips (3000K).
View Perspective: {VIEW_MODE: 2D Isometric Plan / 3D Wide-Angle Perspective (24mm) / 360-Degree Equirectangular Panoramic Sphere / Orbiting Aerial Drone Shot}.
Camera & Render Engine: Hasselblad H6D-100c, f/8, Octane Render style, hyper-realistic reflections, ray-traced ambient occlusion.
```
