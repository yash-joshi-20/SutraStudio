# SUTRA STUDIO — Complete Order System QA & Technical Architecture Guide

This master technical document provides an end-to-end architectural explanation of the **SutraStudio Order Processing, Deliverable Generation, Storage, and Fulfillment Pipeline**.

> [!IMPORTANT]
> **Canonical Domain & Environment Rules**:
> - **Primary Production Domain**: `https://sutrastudios.in`
> - **Local Development**: `http://localhost:3000`
> - **White-Label Deliverable Policy**: Clients **never** see `drive.google.com` links. All media assets stream through first-party URLs originating from the studio domain: `https://sutrastudios.in/api/drive/file/{fileId}?download=true`.

---

## 1. High-Level Architecture Overview

```mermaid
flowchart TD
    subgraph Frontend["Client & Public Portal (https://sutrastudios.in)"]
        A1["/pricing or /packages"] -->|Select Deliverable / Plan| B["MasterOrderForm (/new-order)"]
        A2["(client)/orders"] -->|Click 'Order Again'| B
        A3["Chat / WhatsApp Inbound"] -->|Deep Link Intent| B
        B -->|Submits Order JSON| C["POST /api/orders"]
    end

    subgraph Server["Next.js Backend & Security Engine"]
        C --> D["Authoritative Price Validation"]
        D -->|Validates Against Catalog| E["Dual-Storage Engine"]
        E --> F1["Atomic Disk Vault: data/sutra_orders_store.json"]
        E --> F2["Cloud Vault: Firebase Firestore 'orders'"]
        E --> F3["Client Dossier: ClientsStore / 'clients'"]
        E --> G["Google Drive Provisioning Engine"]
        G --> H["Drive Storage Vault (Client / Order / Package / Date)"]
    end

    subgraph AdminFulfillment["Admin Queue & Supervised Automation"]
        E --> I["/admin/orders Dispatch Queue"]
        I -->|Admin clicks 'Open in Drive'| DriveDirect["Direct Admin Google Drive Vault"]
        I -->|Admin clicks 'Dispatch n8n'| J["POST /api/n8n/dispatch"]
        J --> K["Autonomous Engine (n8n Webhook / Local Fallback)"]
        K -->|Logo Order| L1["Vector Logo Master (SVG) + 4K PNG + Guidelines PDF"]
        K -->|Video Order| L2["Commercial Video Reel (MP4, 9:16)"]
        K -->|3D Order| L3["Spatial 3D Mesh (.glb)"]
        K -->|Website Order| L4["Next.js Architecture Bundle (.zip)"]
        K -->|Retainer Order| L5["Complete Multi-Asset Suite + Editorial Matrix"]
        L1 & L2 & L3 & L4 & L5 --> M["Vaulted into Drive '02 Drafts' & Firestore"]
    end

    subgraph ClientDelivery["White-Labeled Client Delivery Loop"]
        M --> N["Notification Alert: Draft Ready"]
        N --> O["Client Portal: /orders -> Vaulted Files"]
        O -->|Stream / Download| Proxy["GET https://sutrastudios.in/api/drive/file/{fileId}"]
        Proxy -->|Streams Bytes (No Google URLs)| Client["Client Browser / Device"]
        O -->|Approve Deliverables| P["Status: Completed (100%) -> Final Delivery Vault"]
        O -->|Request Changes| Q["Status: Revision Requested -> '04 Revisions'"]
        O -->|Click Notification| R["Notification Auto-Dismissed / Removed"]
    end
```

---

## 2. Where & How Data Is Stored (Firebase + Google Drive Synergy)

SutraStudio utilizes a hybrid infrastructure where **Firebase** handles user identity, role-based access, and relational order metadata, while **Google Drive (5 TB Vault)** serves as the high-capacity, private binary object store.

### A. Order Records & Metadata (Firestore + Disk Vault)
1. **Primary Database (Cloud Firestore)**:
   - **Collection**: `orders`
   - **Document ID**: `ord_<timestamp>` (e.g. `ord_1772654321000`)
   - **Fields**: Order Number (`#ORD-XXXX`), code, client identity (`clientUid`, `clientId`, `clientEmail`, `clientName`, `clientPhone`), service details, verified items array, canonical numeric pricing, status (`pending_verification`, `in_production`, `draft_delivered`, `completed`), revision counters, payment details, and complete status transition history.
2. **Local Atomic Persistence Vault (Server)**:
   - **File Location**: `data/sutra_orders_store.json`
   - **Engine**: `OrdersStore` (`src/lib/services/ordersStore.ts`)
   - **Write Mechanism**: Memory map backed by atomic file-system writes (`fs.writeFileSync`).
   - **Retention**: Real client orders are permanently retained and indexed by both `id` and `clientUid`.

### B. Client Profiles & Dossiers
- **Service**: `ClientsStore` (`src/lib/services/clientsStore.ts`) & Firestore collection `clients`.
- Automatically synchronized during order submission. Indexes lifetime orders, brand names, phone numbers, and company affiliation per authenticated `uid`.

### C. Multi-Tier Google Drive Storage Architecture

All media deliverables (images, video reels, 3D meshes, web bundles, PDF brand guides) are organized strictly in **Google Drive**:

1. **Folder Hierarchy**:
   - **Root Folder**: `SUTRA_STUDIO_VAULT` (Provisioned server-side under `drive.file` scope)
   - **Client Level**: `Clients/{ClientName}_{ClientId}/`
     - Isolated for each client so files never cross-mingle.
   - **Order Level**: `{OrderNumber}_{ServiceName}/`
     - Subfolders:
       - `01 Client Assets`: Client brief uploads, logos, and references.
       - `02 Drafts`: Intermediate AI renders, motion concepts, review files.
       - `03 Final Delivery`: Approved vector master files (`.svg`), 4K PNGs, 60fps MP4s.
       - `04 Revisions`: Historical iterations and revision requests.
   - **Date & Package Level**:
     - Retainer and recurring packages are organized by month and date: `Monthly/{YYYY-MM}/{Date}/`.

2. **Admin Google Drive Storage Visibility**:
   - In `/admin/orders`, clicking **"Inspect"** on any order displays the **"Google Drive Storage Vault"** card.
   - The admin can click **"Open in Drive"** to immediately open the Google Drive folder in a new tab.
   - Subfolder quick links allow one-click inspection of `01 Client Assets`, `02 Drafts`, `03 Final Delivery`, and `04 Revisions`.

3. **White-Label Client Media Delivery (Zero Google Drive Leaks)**:
   - When clients view or download deliverables, they **never see a Google Drive URL**.
   - Instead, the URL is reverse-proxied through:
     `https://sutrastudios.in/api/drive/file/{fileId}?download=true`
   - The server verifies authenticated account ownership (`clientId === user.uid`), fetches the bytes from Drive server-to-server, and streams them with proper RFC 5987 headers (`Content-Disposition: attachment; filename="..."`, `Content-Type`, `Accept-Ranges: bytes`).
   - To the client, the files appear as native downloads hosted directly on SutraStudio's cloud infrastructure.

---

## 3. The 8 Studio Disciplines & Deliverable Fidelity

When an order is dispatched to automation or studio production, the deliverable engine detects the discipline and strictly outputs the correct asset format:

| # | Service Discipline | Typical Price Range | Delivered Asset Format | Storage Destination |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Logo & Brand Identity** | ₹999 – ₹2,999 | `.svg` (Vector Master), `.png` (Transparent 4K), `.pdf` (Brand Guidelines) | `02 Drafts` $\rightarrow$ `03 Final Delivery` |
| **2** | **Image Creation & Visuals** | ₹299 – ₹2,499 | `.png` / `.jpg` (4K Ultra-HD Master Renders, 8K Studio Lighting) | `02 Drafts` $\rightarrow$ `03 Final Delivery` |
| **3** | **Video Creation & Reels** | ₹999 – ₹7,499 | `.mp4` (Commercial 9:16 Vertical Reel, Sound FX, Kinetic Motion) | `02 Drafts` $\rightarrow$ `03 Final Delivery` |
| **4** | **3D Modeling & Spatial** | ₹999 – ₹4,999 | `.glb` / `.gltf` (Optimized 3D Mesh) & 4K Staging Renders | `02 Drafts` $\rightarrow$ `03 Final Delivery` |
| **5** | **Interior & Architecture Viz** | ₹1,499 – ₹4,999 | 4K Photorealistic Renderings, Lighting Passes, 3D Floorplans | `02 Drafts` $\rightarrow$ `03 Final Delivery` |
| **6** | **Meta Ads & Digital Growth** | ₹4,999 – ₹9,999 | Ad Set Bundles (1:1 & 9:16 formats), Ad Copy Matrices, Audience Targeting Briefs | `02 Drafts` $\rightarrow$ `03 Final Delivery` |
| **7** | **Website & Web Apps** | ₹4,999 – ₹19,999 | `.zip` (Next.js TypeScript App Architecture), Live Preview URLs, Figma Links | `02 Drafts` $\rightarrow$ `03 Final Delivery` |
| **8** | **30-Day Retainer Engines** | ₹9,999 – ₹19,999/mo | Continuous Daily/Weekly Drops (Images + Videos + Editorial Matrix PDF) | `02 Drafts` $\rightarrow$ Media Vault |

> [!IMPORTANT]
> **Strict Deliverable Rule**: As mandated by Studio Art Direction, ordering a **Logo Concept** specifically outputs vector logo deliverables (`.svg` and transparent `.png`), never generic photo renders or random 3D objects.

---

## 4. Client Repeat Order ("Order Again") Architecture

The repeat ordering system allows clients to recommission any historical order with 1 click:
1. **Trigger**:
   - On the Order Card in `/orders` via the **"Order Again"** button.
   - Inside the Order Inspection Modal via the **"Repeat Order"** button.
2. **Pre-fill Bridge**:
   - The original order's parameters (`serviceId`, `package.tierId`, `quantity`, `requirements`, and `brandName`) are pre-populated into `MasterOrderForm`.
3. **Execution**:
   - The client can modify their notes or click next to confirm.
   - A new order ID (`ord_<timestamp>`) and unique order code (`#ORD-XXXX`) are assigned.
   - The new order is linked to the authenticated user's `clientUid` and immediately appears in their active orders queue.

---

## 5. Payment Architecture (Zero-Fee UPI & Online)

SutraStudio supports frictionless checkout across desktop, laptop, tablet, and mobile devices:

1. **Direct Zero-Fee UPI & Google Pay**:
   - **Payee**: `Yash Joshi`
   - **VPA**: `yashjoshi7355-1@okicici`
   - **Dynamic QR Code**: Generates an authoritative `upi://pay` standard URI with the exact order amount and order reference number pre-filled.
   - **Mobile Deep-Link**: On mobile devices, tapping the button directly launches Google Pay, PhonePe, or Paytm with the payee and amount locked.
   - **Verification**: Client inputs their 12-digit UPI reference (UTR number) and/or uploads screenshot proof. Status becomes `pending_verification`.
2. **Admin Ledger Reconciliation**:
   - The administrator views incoming UTRs in `/admin/orders`.
   - Clicking **"Verify Payment & Start Work"** updates the order status to `in_production`, marks payment `paid`, triggers studio notifications, and immediately starts fulfillment.
3. **Pay on Invoice / Direct Mode**:
   - For corporate accounts, orders can be registered directly for invoice billing.

---

## 6. Admin n8n Autonomous Workflow Pipeline

- **Endpoint**: `/api/n8n/dispatch`
- **Security**: Authorized strictly via Admin Session Gate (`assertAdminSession`).
- **Engine**: Dispatches to n8n Webhook or executes the Studio Autonomous Generation Engine.
- **Workflow Selection**:
  - `W1_logo_brand_identity`: Synthesizes Vector Master Logo and transparent PNGs.
  - `W2_short_video_engine`: Synthesizes 9:16 Commercial Video Reels.
  - `W3_monthly_plan_content`: Synthesizes scheduled multi-asset retainer drops.
  - `W4_spatial_3d_render`: Synthesizes 3D spatial models.
  - `W5_web_architecture`: Packages digital web application code.
  - `SUTRA_MASTER_RENDER_LOCAL_HYBRID`: Full 4K master renders.
- **Continuous Execution**: Admin can trigger or re-run automation at any time from both the order table row and the inspection modal.

---

## 7. Dual-Sided Notification Lifecycle

1. **Creation**:
   - Triggers on order placement, payment submission, UTR verification, draft release, revision request, and completion.
   - Sent to both Client (in client portal) and Admin (in admin workspace).
2. **Auto-Dismiss on Open**:
   - Clicking any notification item or action link automatically calls `handleOpenOrDismiss()`, sending a `DELETE` request to `/api/notifications?id=<id>` and purging it from unread alerts.
3. **Quick Clear**:
   - Each notification item has a direct dismiss `X` button.
   - The dropdown header contains a **"Clear All"** button to purge all archived notifications with a single click.
