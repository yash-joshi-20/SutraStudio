# SUTRA STUDIO — Master Order Testing Playbook & Step-by-Step Manual

This document provides complete, copy-paste ready test datasets and a step-by-step walkthrough for manually verifying all ordering channels, services, packages, and admin automations in **SutraStudio**.

> [!NOTE]
> All sample assets mentioned below have been generated for you in the local directory:
> `d:/SutraStudio/local-testing-assets/`
> You can drag and drop these exact `.svg` files into the file upload inputs while placing your test orders.

---

## Quick Navigation: Test Scenarios

- [Scenario 1: Logo & Brand Identity (Vector Logo Master)](#scenario-1-logo--brand-identity)
- [Scenario 2: E-Commerce Product Visual (Luxury Leather Bag)](#scenario-2-e-commerce-product-visual)
- [Scenario 3: Website & App Development (Optics & Eyewear Storefront)](#scenario-3-website--app-development)
- [Scenario 4: Cafe Franchise Package (Roast & Lotus Atelier)](#scenario-4-cafe-franchise-package)
- [Scenario 5: 3D Spatial & Architecture Viz (The Imperial Penthouse)](#scenario-5-3d-spatial--interior-architecture-viz)
- [Scenario 6: 30-Day Monthly Retainer (Daily Trend Creator Flagship)](#scenario-6-30-day-monthly-retainer-flagship)
- [Scenario 7: Commercial Motion Video / AI Reel](#scenario-7-commercial-motion-video--ai-reel)
- [Scenario 8: How to Test Repeat Order ("Order Again")](#scenario-8-how-to-test-repeat-order-order-again)
- [Scenario 9: Admin Verification, n8n Dispatch & Notification Clearance](#scenario-9-admin-verification-n8n-dispatch--notification-clearance)

---

## Scenario 1: Logo & Brand Identity

### A. Test Objective
Verify that commissioning a Logo Concept delivers **Bespoke Vector Logo Assets (`.svg` and transparent `.png`)** and charges exactly **₹999**.

### B. Step-by-Step Instructions
1. Navigate to `http://localhost:3000/pricing` or `http://localhost:3000/new-order?service=image-creation&deliverable=image-logo-concept`.
2. In **Step 1 (Select Service)**:
   - Mode: **8 Studio Services**
   - Click on **Image Creation** or select **Logo concept** (shows ₹999 per concept).
   - Quantity: `1` (Subtotal displays ₹999).
   - Click **Continue to Brand Information**.
3. In **Step 2 (Client & Brand Info)**:
   - **Full Name**: `Aarav Mehta`
   - **Business / Brand Name**: `Roast & Lotus Coffee Atelier`
   - **Email Address**: `aarav@roastandlotus.in`
   - **WhatsApp Number**: `+91 98200 12345`
   - **Industry**: `F&B / Hospitality`
   - **Brand Website / Social**: `https://roastandlotus.in`
   - **Logo / Reference Upload**: Select `local-testing-assets/01_luxury_cafe_starbucks_logo.svg`
   - **Target Deadline**: `3 Days SLA`
   - **Creative Brief**:
     ```text
     We are launching an artisanal coffee atelier blending Indian heritage with Scandinavian minimalism. We need a vector emblem featuring a subtle coffee cup silhouette crowned with delicate lotus petals. Color palette: Warm ivory (#FAF9F5), deep charcoal (#171717), and brushed brass (#D4A35A). Deliver vector SVG masters, transparent 4K PNGs, and typography guide.
     ```
   - Click **Continue to Service Parameters**.
4. In **Step 3 (Parameters)**:
   - Leave standard studio settings and click **Proceed to Review & Payment**.
5. In **Step 4 (Review & Payment)**:
   - Select **Pay by UPI QR / GPay (0% Fee)**.
   - Scan the QR code or enter mock UTR: `123456789012`
   - Click **Confirm Commission & Launch Production**.
6. **Result**: Order is registered with status `pending_verification` and assigned an Order Number (e.g. `#ORD-742`).

---

## Scenario 2: E-Commerce Product Visual

### A. Test Objective
Verify an individual service commission for an e-commerce handbag brand charging **₹499**.

### B. Step-by-Step Instructions
1. Navigate to `http://localhost:3000/new-order?service=image-creation&deliverable=image-ai-product-visual`.
2. In **Step 1**:
   - Deliverable: **AI product visual** (₹499 per image).
   - Quantity: `2` (Subtotal updates live to ₹998).
   - Click **Continue**.
3. In **Step 2**:
   - **Full Name**: `Sanya Malhotra`
   - **Brand Name**: `Valenti & Co. Leather`
   - **Email Address**: `sanya@valentileather.com`
   - **WhatsApp**: `+91 98765 43210`
   - **Industry**: `Fashion & Luxury Goods`
   - **Upload File**: Select `local-testing-assets/02_artisan_leather_bag_product.svg`
   - **Creative Brief**:
     ```text
     High-end commercial hero visual for our Tuscan artisan leather tote bag. The bag should be positioned on a warm ivory travertine pedestal with soft golden hour studio rim lighting, highlighting fine edge stitching and gold buckle hardware.
     ```
4. Complete Step 3 & 4 with UTR `889900112233`.

---

## Scenario 3: Website & App Development

### A. Test Objective
Verify a digital web architecture commission charging canonical rate **₹4,999**.

### B. Step-by-Step Instructions
1. Open `http://localhost:3000/new-order?service=website-development`.
2. In **Step 1**:
   - Service: **Website & Web App Development** (₹4,999).
   - Quantity: `1`. Click **Continue**.
3. In **Step 2**:
   - **Full Name**: `Devendra Joshi`
   - **Brand Name**: `Lumen Optics Haute Lunetterie`
   - **Email**: `dev@lumenoptics.com`
   - **WhatsApp**: `+91 98111 22334`
   - **Industry**: `Luxury Eyewear`
   - **Upload Reference**: Select `local-testing-assets/03_optics_eyewear_brand_logo.svg`
   - **Creative Brief**:
     ```text
     Next.js 14 App Router storefront for handcrafted Japanese titanium eyeglasses. Clean luxury typography (Cinzel + Inter), headless Shopify catalog integration, virtual try-on staging, and zero-jank micro-interactions.
     ```
4. In **Step 3 (Web Parameters Accordion)**:
   - **Domain Status**: `Own Domain (Configured)`
   - **Tech Stack**: `Next.js + Tailwind CSS`
   - **Page Count**: `1-3 Landing Pages`
   - **Benchmark URLs**: `https://lindberg.com`
5. Proceed to Step 4 and submit with UTR `445566778899`.

---

## Scenario 4: Cafe Franchise Package

### A. Test Objective
Verify multi-discipline package commission for a franchise retail chain.

### B. Step-by-Step Instructions
1. Navigate to `http://localhost:3000/new-order?package=pkg-branding-logo-bundle` (or switch to **Creative Packages & Retainers** in Step 1).
2. Select **Branding & Logo Identity Bundle** (₹4,999).
3. In **Step 2**:
   - **Full Name**: `Kabir Singhania`
   - **Brand Name**: `Roast & Lotus Franchise Network`
   - **Email**: `kabir@roastandlotus.in`
   - **WhatsApp**: `+91 97234 56789`
   - **Industry**: `Franchise & Retail`
   - **Reference File**: Select `local-testing-assets/01_luxury_cafe_starbucks_logo.svg`
   - **Brief**:
     ```text
     Complete franchise visual pack: primary vector logo, franchise signage guidelines, packaging stamp for takeaway coffee cups, menu board typography specs, and social launch flyers.
     ```
4. Submit checkout with UTR `778899001122`.

---

## Scenario 5: 3D Spatial & Interior Architecture Viz

### A. Test Objective
Verify spatial mesh and 3D interior design pipeline charging **₹1,499**.

### B. Step-by-Step Instructions
1. Navigate to `http://localhost:3000/new-order?service=interior-design`.
2. In **Step 1**:
   - Service: **Interior Design & Arch Viz** (₹1,499).
   - Quantity: `1`.
3. In **Step 2**:
   - **Full Name**: `Rhea Kapoor`
   - **Brand Name**: `The Imperial Penthouse Worli`
   - **Email**: `rhea@imperialworli.com`
   - **WhatsApp**: `+91 99887 76655`
   - **Industry**: `Real Estate & High-Rise Living`
   - **Upload File**: Select `local-testing-assets/04_luxury_penthouse_interior_reference.svg`
   - **Brief**:
     ```text
     3D photorealistic architectural visualization of sea-facing master living salon. Double-height ceilings, warm herringbone Italian oak flooring, curved boucle sofa, and floor-to-ceiling recessed brass lighting. Output in 4K resolution.
     ```
4. In **Step 3 (3D & Spatial Parameters)**:
   - **Lighting Preference**: `Warm Daylight Golden Hour`
   - **Resolution**: `4K UHD (3840x2160)`
   - **Dimensions**: `1,800 sq.ft living pavilion`
5. Submit checkout with UTR `334455667788`.

---

## Scenario 6: 30-Day Monthly Retainer (Flagship)

### A. Test Objective
Verify continuous 30-day creative engine subscription with 30 images + 30 short videos for **₹19,999/mo**.

### B. Step-by-Step Instructions
1. Navigate to `http://localhost:3000/new-order?package=daily-trend-creator`.
2. Note that Step 1 renders:
   - Package: **Daily Trend Creator (Flagship)**
   - Price: **₹19,999 / month**
   - Quotas: `30 images + 30 videos per 30-day cycle`
   - Notice: `Billed every 30 days • Cancel auto-renew anytime`
3. In **Step 2**:
   - Enter your client details and upload `local-testing-assets/01_luxury_cafe_starbucks_logo.svg`.
   - **Brief**:
     ```text
     Omnichannel 30-day continuous creative drop. Deliver 1 branded product graphic and 1 commercial vertical reel daily covering cafe ambiance, brewing rituals, coffee bean origins, and customer reviews.
     ```
4. In **Step 3 (Monthly Retainer Accordion)**:
   - **Goals**: `Direct Footfall & Brand Awareness`
   - **Focus**: `Omnichannel Growth (Social Reels + 3D Renders)`
5. Submit order.
6. Verify in `/orders` that the progress bar displays **30 days remaining in cycle** and the active subscription badge is rendered.

---

## Scenario 7: Commercial Motion Video / AI Reel

### A. Test Objective
Verify commercial video generation with vertical 9:16 aspect ratio charging **₹999**.

### B. Step-by-Step Instructions
1. Navigate to `http://localhost:3000/new-order?service=video-creation&deliverable=video-10-15s-ai-reel`.
2. Note that price is exactly **₹999**.
3. In **Step 2**:
   - **Brand Name**: `Lumen Optics Eyewear`
   - **Upload**: `local-testing-assets/03_optics_eyewear_brand_logo.svg`
   - **Brief**:
     ```text
     10-15s kinetic vertical reel showing titanium eyewear frames floating in zero-gravity with macro closeups of laser-engraved hinges, accompanied by crisp audio sound effects.
     ```
4. Submit order.

---

## Scenario 8: How to Test Repeat Order ("Order Again")

1. Log into the client portal at `http://localhost:3000/login`.
2. Visit `http://localhost:3000/orders`.
3. Locate any past order card (e.g. your Logo Concept or Leather Bag order).
4. **Action A (Card Button)**:
   - Click the **"Order Again"** button directly on the order card.
5. **Action B (Modal Button)**:
   - Click **"Details"** on the order card $\rightarrow$ In the inspection modal footer, click **"Repeat Order"**.
6. **Expected Behavior**:
   - The Commission Modal opens with `MasterOrderForm`.
   - The service discipline, quantity, creative brief, and brand name from the past order are **pre-filled automatically**.
7. Click Next $\rightarrow$ Submit: A brand-new order ID is generated and immediately added to your active orders table without touching the original completed order.

---

## Scenario 9: Admin Verification, n8n Dispatch & Notification Clearance

### A. Admin Ledger & Dispatch Test
1. Log in with an administrator account (`admin@sutrastudio.com` or via `/admin`).
2. Visit `http://localhost:3000/admin/orders`.
3. Locate the order placed in Scenario 1 (`Roast & Lotus Coffee Atelier`).
4. In the order row:
   - Click **"Inspect"** to view client brief, UTR reference, and uploaded assets.
   - Click **"Run n8n Automation"** (or **"Verify Payment & Start Work"**).
5. Watch the live dispatch status:
   - The status updates to `✓ Dispatched to n8n autonomous workflow pipeline! Assets vaulted.`
   - Status changes to `in_production` and deliverables are vaulted in Google Drive `02 Drafts`.
6. Inspect the generated deliverables:
   - Because this was a **Logo order**, the deliverables list specifically contains:
     - `Roast_Lotus_Coffee_Atelier_Vector_Brand_Logo_Master.svg`
     - `Roast_Lotus_Coffee_Atelier_Logo_Transparent_4K.png`
     - `Roast_Lotus_Coffee_Atelier_Brand_Identity_Guidelines.pdf`

### B. Client Approval Test
1. Return to `http://localhost:3000/orders` as the client.
2. Click **"Review Draft"** or **"Details"** on the order card.
3. Switch to the **Vaulted Files** tab.
4. Preview the vector logo concepts and click **"✓ Approve Deliverables"**.
5. Order progress immediately moves to **100% Complete** with status **Approved**.

### C. Notification Dismissal Test
1. Look at the top-right header: The **Notification Bell** icon pulses with an unread badge counter.
2. Click the bell to open the notification drawer/dropdown.
3. Observe the alert: e.g. `Payment Verified` or `Draft Deliverables Ready`.
4. **Click the notification item or its "View Action" link**:
   - The notification is **automatically removed/cleared** from active alerts on both server and client.
5. Alternatively, click the **"Clear All"** header button or click the `X` icon on any notification item to instantly delete it.
