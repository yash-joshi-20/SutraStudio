# Multi-Channel Orders & Payment Ledger SOP

**Sutra Studio — Administrative Standard Operating Procedure**  
*Document Version: 2.4 | Classification: Studio Operations Internal*

---

## 1. Overview & Objective

Clients engage with Sutra Studio across multiple channels:
- **Direct Portal Orders** (`/orders`)
- **AI Concierge Chat** (Interactive Chatbot)
- **Official Contact Page** (`/contact`)
- **WhatsApp Business Inquiries & Orders**
- **Email Requests & RFP Proposals**
- **Direct Offline / QR Code UPI Settlements**

This document establishes the official SOP for recording external orders, verifying off-platform payments (UPI QR scan, IMPS/NEFT bank transfers, cash), dispatching automated notifications, and securely executing n8n autonomous pipelines.

---

## 2. Order Sources & Entry Channels

| Channel | Entry Point | Initial State | Action Required |
| :--- | :--- | :--- | :--- |
| **Portal (Self-Serve)** | `/orders` | `confirmed` / `in_progress` | Review brief in Admin Hub -> Dispatch to n8n |
| **AI Concierge Chat** | Floating AI Chatbot | `confirmed` | Chat logs synced -> Dispatch to n8n |
| **Contact Form** | `/contact` | `inquiry` | Review in Leads/Inquiries -> Convert to Order |
| **WhatsApp Order** | Direct WhatsApp chat | Admin Hub (`➕ Record External`) | Enter client details, service, and payment status |
| **Email Proposal** | `concierge@sutrastudio.com` | Admin Hub (`➕ Record External`) | Enter client details, amount, scope brief |
| **UPI QR / Bank Transfer** | Direct QR Scan / IMPS | Admin Hub (`✓ Mark Paid`) | Record UTR / Transaction reference |

---

## 3. Step-by-Step SOP: Recording External Orders (WhatsApp / Email / Phone)

### Step 1: Open Admin Hub
1. Log into the Sutra Studio Admin Hub (`/admin`).
2. Navigate to the **Orders & Approvals** tab.
3. Click the **"➕ Record External Order"** button in the top action bar.

### Step 2: Fill Out Order Information
- **Client Details**: Full Name, Business Email, and Phone Number.
- **Service / Deliverable**: Select standard catalog service or type custom bespoke deliverable.
- **Channel Source**: Select `WhatsApp`, `Email`, `Contact Page`, `Phone / Offline`, or `Direct QR UPI`.
- **Total Amount (INR)**: Enter the agreed contract or catalog value.
- **Payment Status**:
  - `Paid via UPI QR / Direct` (if client already transferred via QR scan).
  - `Paid via Bank Transfer / Cash` (if IMPS/NEFT reference exists).
  - `Pending Invoice / Unpaid` (if work starts before invoice clearance).
  - `Partially Paid` (if advance was received).
- **Payment Reference / UTR**: Enter UPI reference number or transaction ID.
- **Project Brief & Drive Link**: Paste client specifications or raw asset Google Drive links.

### Step 3: Submission & Automatic Provisioning
- When you click **"Save & Create Commission"**:
  1. A unique order record (e.g. `#ORD-WHT-4821`) is committed to Firestore & `OrdersStore`.
  2. A dedicated 4-tier Google Drive Vault hierarchy is automatically provisioned:
     `Sutra Studio Vault > Clients > {ClientName} > {OrderNumber}`
  3. Real-time in-app notifications and email alerts are dispatched to the client and studio administrator.

---

## 4. Payment Settlement & Unpaid Reminders SOP

### When Client Pays via UPI QR / Direct Transfer:
1. Locate the order in the **Orders & Approvals** table.
2. Click the green **"✓ Mark Paid"** button (or click **Inspect** -> **Payment Settlement Box** -> **Mark Payment as Received**).
3. Confirm payment method (`UPI QR` or `Bank Transfer`) and enter the UTR/Transaction Reference.
4. The system updates status to `in_progress`, marks `paymentStatus: "paid"`, records the audit log, and immediately sends a **"Payment Received & Confirmed"** notification to the client.

### When an Order is Pending Payment (Unpaid):
1. The order displays an amber **"Unpaid"** badge.
2. Click the **"🔔 Remind"** button.
3. An automated reminder notification is dispatched to the client with invoice details, QR payment instructions, and direct payment links.

---

## 5. Admin-Gated n8n Autonomous Workflow Execution

Direct client submissions and external orders **do not auto-dispatch to external render engines**. This ensures studio quality control and resource safety.

1. Open the order in the Admin Hub Inspector.
2. Review the brief and client-uploaded assets in Google Drive.
3. Select the appropriate AI workflow engine:
   - `W1: 4K Master Render Engine (Order Fulfillment Router)`
   - `W2: Cinematic Video Ads & Motion Pipeline`
   - `W3: 3D CAD Mesh & Spatial Asset Builder`
   - `W5: Agency Daily Social Auto-Post Engine`
4. Click **"⚡ Dispatch to n8n Execution Engine"**.
5. Once complete, deliverables are uploaded to `03_FINAL_DELIVERABLES` in Google Drive and notifications are dispatched for client approval.

---

## 6. Audit Trail & Compliance

All order creations, payment state changes, and workflow dispatches are permanently recorded in the **Security & Audit Logs** tab (`/admin?tab=audit`), adhering to ISO-27001 multi-tenant data isolation standards.
