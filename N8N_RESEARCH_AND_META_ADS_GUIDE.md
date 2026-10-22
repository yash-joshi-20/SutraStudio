# SUTRA STUDIO — Master Dual-Engine n8n Automation Guide
## સુત્ર સ્ટુડિયો — માસ્ટર ડ્યુઅલ-એન્જિન n8n વર્કફ્લો અને Render API Key ગાઇડ (ગુજરાતી & English)

---

### 1. Direct Answer to Your Critical Question / સૌથી મહત્વનો પ્રશ્ન અને જવાબ

> **User Question (પ્રશ્ન)**:  
> *"શું બંનેમાં API Key એડ કરવી પડશે? Render માં જઈને બંને અલગ અલગ જગ્યાએથી રન થાય છે... તો બંનેમાં લોકલ/રેન્ડર કી એડ કરવી પડશે? અને લાઈવ URL `sutrastudios.in` અને આગળ `n8n.sutrastudios.in` છે તો કઈ રીતે ચાલશે?"*

#### **જવાબ: હા (YES, 100% BOTH Services Require the Keys)**

**શા માટે? (Why?):**  
Next.js વેબસાઇટ (`https://sutrastudios.in`) અને n8n એન્જિન (`https://n8n.sutrastudios.in`) એ બે **સંપૂર્ણપણે અલગ-અલગ સર્વર / સર્વિસ** છે. જ્યારે Next.js ચાલતું હોય ત્યારે તે પોતાના એન્વાયરમેન્ટ વેરિયેબલ્સ વાંચે છે, અને જ્યારે n8n ના નોડ્સ રન થાય છે ત્યારે n8n પોતાના એન્વાયરમેન્ટ વેરિયેબલ્સમાંથી `GEMINI_API_KEY` અને સિક્રેટ વાંચે છે.

તેથી બંને જગ્યાએ કી સેટ કરવી અનિવાર્ય છે. નીચેનું ટેબલ જોઈને બંને જગ્યાએ કી ઉમેરો:

---

### 2. Environment Variables Configuration Matrix / Render અને Local સેટઅપ

#### A. Render Web Service 1: Sutra Studio Next.js Web App (`https://sutrastudios.in`)
*(તમારા Render ડેશબોર્ડમાં મુખ્ય Next.js એપ્લિકેશનના **Environment** ટેબમાં અથવા લોકલ `.env.local` માં ઉમેરો)*:

```bash
# 1. Google Gemini AI Key (Next.js ના ડાયરેક્ટ AI કોલ્સ માટે)
GEMINI_API_KEY=AIzaSy...

# 2. n8n સર્વરનું URL (Next.js જેને ડિસ્પેચ રિક્વેસ્ટ મોકલશે)
N8N_BASE_URL=https://n8n.sutrastudios.in

# 3. શેર કરેલ સિક્રેટ કી (Next.js અને n8n વચ્ચે ઓથોરાઈઝેશન માટે)
N8N_WEBHOOK_SECRET=sutra_secret_shared_token_2026

# 4. મુખ્ય એપ URL
APP_BASE_URL=https://sutrastudios.in
NEXT_PUBLIC_APP_URL=https://sutrastudios.in
```

#### B. Render Web Service 2: n8n Automation Engine (`https://n8n.sutrastudios.in`)
*(તમારા n8n Render સર્વિસ / Docker Container ના **Environment** ટેબમાં ઉમેરો)*:

```bash
# 1. Google Gemini AI Key (n8n ના Gemini 2.0 Flash નોડ્સ માટે)
GEMINI_API_KEY=AIzaSy...

# 2. Sutra Studio વેબસાઇટનું URL (n8n જે લિંક પર ડ્રાફ્ટ ડિલિવરેબલ્સ પાછા મોકલશે)
SUTRA_STUDIO_URL=https://sutrastudios.in
APP_BASE_URL=https://sutrastudios.in

# 3. શેર કરેલ સિક્રેટ કી (Next.js માં રાખેલ કી સાથે 100% મેચ થવી જોઈએ)
N8N_WEBHOOK_SECRET=sutra_secret_shared_token_2026

# 4. n8n ના એક્સપ્રેશન્સમાં $env વાંચવાની પરવાનગી આપો
N8N_BLOCK_ENV_ACCESS_IN_NODE=false

# 5. (વૈકલ્પિક: સોશિયલ મીડિયા લાઈવ ઓટો-પોસ્ટિંગ માટે)
FACEBOOK_PAGE_ID=61594200943169
INSTAGRAM_ACCOUNT_ID=1784140...
META_GRAPH_ACCESS_TOKEN=EAAB...
```

> [!TIP]
> **લોકલ ટેસ્ટિંગ વખતે (Local Dev)**:  
> જો તમે તમારા લોકલ લેપટોપ પર ટેસ્ટ કરતા હોવ:
> - Next.js `.env.local` માં: `N8N_BASE_URL=http://localhost:5678`
> - Local n8n માં: `SUTRA_STUDIO_URL=http://localhost:3000`  
> જ્યારે તમે Render પર લાઈવ કરો ત્યારે બંને જગ્યાએ `https://sutrastudios.in` અને `https://n8n.sutrastudios.in` વાપરો.

---

### 3. Master Dual-Engine Architecture / માસ્ટર ડ્યુઅલ એન્જિન કેવી રીતે કામ કરે છે

અમે એક જ માસ્ટર વર્કફ્લો બનાવ્યો છે જે બે અલગ-અલગ મોડમાં આપમેળે સ્વિચ થઈને સંપૂર્ણ ઓટોમેશન કરે છે:

```text
                               ┌────────────────────────────────────────────────────────┐
                               │           Master Dispatch Webhook / Daily 9AM Cron     │
                               │           POST /webhook/sutra-master-dispatch          │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
                                                           ▼
                                           ┌───────────────────────────────┐
                                           │  Mode Detector & Normalizer   │
                                           └───────────────┬───────────────┘
                                                           │
                       ┌───────────────────────────────────┴───────────────────────────────────┐
                       │                                                                       │
                       ▼                                                                       ▼
   ┌────────────────────────────────────────┐                              ┌────────────────────────────────────────┐
   │    MODE A: Agency Self-Promotion       │                              │  MODE B: Client Order Fulfillment      │
   │    (Sutra Studio Meta Promotion)       │                              │  (Click-to-Automate on Packages)       │
   ├────────────────────────────────────────┤                              ├────────────────────────────────────────┤
   │ 1. Gemini 2.0 Market Research          │                              │ 1. Parses Client Brief & Package       │
   │ 2. Synthesizes in Professional English │                              │ 2. Gemini 2.0 Creative Director        │
   │ 3. Generates Multi-Format Assets:      │                              │ 3. Assembles Exact Deliverables:       │
   │    • 4K Master Render (Image)          │                              │    • Retainers: 30-Day Matrix + Reels  │
   │    • 9:16 Commercial Reel (Video)      │                              │    • 3D Modeling: Spatial GLB Mesh     │
   │    • 3D CAD Spatial Model (3D)         │                              │    • 360 View: Virtual Space Tour      │
   │    • 360° Virtual Space Walkthrough    │                              │    • Branding: Vector SVG Suite + PDF  │
   │    • Meta Ad Copy & 3s Hook            │                              │ 4. Vaults to Google Drive '02 Drafts'  │
   │ 4. Vaults to Studio Deliverables API   │                              │ 5. Reports 'draft_ready' to App        │
   │ 5. Deploys to Meta Ads Manager         │                              │ 6. Admin Review Gate (Zero Client Leak)│
   └────────────────────────────────────────┘                              └────────────────────────────────────────┘
```

---

### 4. Single Master Workflow File / એક માત્ર માસ્ટર વર્કફ્લો ફાઇલ

તમામ જૂના અને વધારાના n8n json દૂર કરીને ફક્ત **એક જ માસ્ટર વર્કફ્લો ફાઇલ** રાખવામાં આવી છે:
* **Master Workflow File**: [`SUTRA_MASTER_AUTOMATION_ENGINE.json`](file:///d:/SutraStudio/SUTRA_MASTER_AUTOMATION_ENGINE.json)

---

### 5. Mode A: Agency Self-Promotion (સુત્ર સ્ટુડિયો બ્રાન્ડ પ્રમોશન)

જ્યારે દરરોજ સવારે **09:00 AM IST** થાય અથવા એડમિન ડેશબોર્ડમાંથી **"⚡ Run Dynamic Research & Reel Pipeline"** પર ક્લિક થાય:
1. **ટ્રેન્ડ રિસર્ચ**: 6 મુખ્ય શાખાઓમાંથી (4K Commercial Reels, 3D Modeling, 360° Virtual Tours, Architectural Villa Design, Vedic-Modern Branding, Meta Ads) લેટેસ્ટ ટ્રેન્ડ રિસર્ચ થાય છે.
2. **પ્રોફેશનલ અંગ્રેજી સ્ક્રિપ્ટ**: શુદ્ધ બિઝનેસ અંગ્રેજીમાં 0-3 સેકન્ડનો વાયરલ હુક, 4-સીન રીલ સ્ક્રિપ્ટ, 120 BPM ઓડિયો અને સુત્ર સ્ટુડિયોના સત્તાવાર પ્લાન્સ (₹9,999 / ₹19,999) સાથેનું કેપ્શન બને છે.
3. **મલ્ટિ-ફોર્મેટ એસેટ્સ**:
   - **4K Image Render**: રેન્ડમ સીડ સાથે 8K ફોટોરિયાલિસ્ટિક આર્કિટેક્ચરલ વિઝ્યુઅલ.
   - **Commercial Video Reel**: 9:16 વર્ટિકલ સિનેમેટિક રીલ.
   - **3D Spatial Model**: ઈન્ટરેક્ટિવ 3D પ્રોડક્ટ / સ્પેસિયલ મોડેલ પ્રિવ્યુ.
   - **360° Virtual Tour**: વર્ચ્યુઅલ સ્પેસ વોકથ્રૂ લિંક (`/services/360-view`).
4. **ઓટો-ડિસ્પેચ**: આ તમામ ડિલિવરેબલ્સ `/api/admin/deliverables` માં સેવ થાય છે અને `/api/admin/marketing/meta-ads` દ્વારા મેટા એડ્સ મેનેજરમાં પ્રપોઝલ તરીકે રજીસ્ટર થાય છે.

---

### 6. Mode B: Client Order Fulfillment (ક્લાયન્ટ ઓર્ડર અને પેકેજ ઓટોમેશન)

ક્લાયન્ટ વેબસાઇટ પરથી ઓર્ડર કરે અથવા એડમિન ઓર્ડર કન્સોલમાંથી **"Run Automation"** પર ક્લિક કરે:
1. **પેકેજ ઓળખ**:
   - **30-Day Retainers**: `daily-trend-creator` (30 Reels + 30 Images), `starter-trend` (15 Reels + 15 Images), `growth-trend` (20 Reels + 20 Images).
   - **Multi-Service Bundles**: `commission-starter-image-video` (5 Images + 1 Reel), `commission-studio-growth` (10 Images + 3 Reels + 1 3D Render), `pkg-branding-logo-bundle` (Vector SVG suite + Guidelines + 5 Images).
   - **સિંગલ સર્વિસીસ**: `3d-modeling`, `360-view`, `visuals-motion`, `interior-design`, `brand-identity`.
2. **Gemini 2.0 Client Director**: ક્લાયન્ટના બ્રાન્ડ નેમ અને બ્રીફ અનુસાર કસ્ટમાઇઝ્ડ સ્ક્રિપ્ટ અને બ્લુપ્રિન્ટ તૈયાર કરે છે.
3. **પેકેજ મુજબ ડિલિવરેબલ્સ**:
   - લોગો હોય તો: `Vector_Brand_Logo_Master.svg`, `Logo_Transparent_4K.png`, `Brand_Identity_Guidelines.pdf`.
   - 3D મોડલ હોય તો: `Spatial_Mesh.glb` અને `4K_Turntable_Render.png`.
   - 360 વ્યૂ હોય તો: `360_Virtual_Space_Walkthrough.html` અને `4K_Panoramic_Render.png`.
   - રીટેઇનર હોય તો: `30Day_Editorial_Matrix.pdf`, `Sprint1_4K_Master_Render.png`, અને `Commercial_Reel.mp4`.
4. **ડ્રાઈવ વોલ્ટિંગ અને એડમિન રિવ્યુ ગેટ**:
   - n8n તરત જ Sutra Studio API `POST /api/n8n/webhook` પર કોલબેક મોકલે છે.
   - ઓર્ડરનું સ્ટેટસ `draft_delivered` ("Draft Vaulted — Awaiting Admin Review") થઈ જાય છે.
   - **કડક નિયમ**: અનવેરિફાઇડ AI આઉટપુટ ક્લાયન્ટને સીધું મોકલાતું નથી. એડમિન ડેશબોર્ડમાં રિવ્યુ અને એપ્રૂવલ આપ્યા પછી જ ક્લાયન્ટના વોલ્ટમાં રીલીઝ થાય છે.

---

### 7. Step-by-Step Import in n8n (`https://n8n.sutrastudios.in`)

1. તમારા n8n ડેશબોર્ડ પર લોગિન કરો: `https://n8n.sutrastudios.in`
2. ડાબી બાજુથી **Workflows** પર ક્લિક કરો.
3. જમણા ખૂણામાં **⋮ (Options)** પર ક્લિક કરીને **Import from File** પસંદ કરો.
4. ફાઇલ સિલેક્ટ કરો: `SUTRA_MASTER_AUTOMATION_ENGINE.json`
5. વર્કફ્લો લોડ થઈ જશે!
6. જમણી બાજુ ઉપર **Active** ટોગલ સ્વિચ ચાલુ કરો.
7. હવે તમારું સિંગલ માસ્ટર એન્જિન લાઈવ છે:
   - દરરોજ 9:00 AM IST વાગ્યે પોતાની એજન્સીનું મેટા પ્રમોશન આપમેળે કરશે.
   - વેબસાઇટ પરથી કોઈ પણ ક્લાયન્ટ ઓર્ડર આવે ત્યારે 1-ક્લિકમાં તે જ વર્કફ્લો ક્લાયન્ટનું પેકેજ પૂરું કરશે!

---

### 8. Testing / ચકાસણી કરવાની રીત

#### 1. Self-Promotion Test (એજન્સી પ્રમોશન ટેસ્ટ):
```bash
curl -X POST https://n8n.sutrastudios.in/webhook/sutra-master-dispatch \
  -H "Content-Type: application/json" \
  -d '{"mode": "agency_self_promo", "disciplineId": "visuals-motion"}'
```

#### 2. Client Order Fulfillment Test (ક્લાયન્ટ ઓર્ડર ટેસ્ટ):
```bash
curl -X POST https://n8n.sutrastudios.in/webhook/sutra-master-dispatch \
  -H "Content-Type: application/json" \
  -d '{"mode": "client_order_fulfillment", "orderId": "ORD-TEST-001", "packageId": "commission-studio-growth", "client": {"brandName": "Aura Luxury Living"}, "brief": "Contemporary luxury villa furniture showcase"}'
```
