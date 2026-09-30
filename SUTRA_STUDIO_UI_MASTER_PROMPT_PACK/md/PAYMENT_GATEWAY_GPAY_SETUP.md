# SYNAPSE KINETIC — GPay & Dynamic UPI QR Payment Gateway Manual
**Complete Guide for Client Checkout, Dynamic QR Code Generation, GPay Deep-Linking, and 12-Digit UTR Verification**

---

## 1. Executive Summary

SYNAPSE KINETIC features an autonomous **Zero-Gateway-Fee Direct UPI/GPay Payment Engine**. Clients can instantly pay in Indian Rupees (₹ INR) for any service plan using Google Pay, PhonePe, Paytm, BHIM, or any UPI banking app directly to your merchant VPA.

---

## 2. How the Payment Flow Works (Step-by-Step)

```
[Client Selects Plan on Order Wizard] ──► [Click 'Pay with GPay / Instant UPI QR']
                                                              │
                                                              ▼
[Dynamic QR Generated for Exact Amount (e.g., ₹49,999)] ◄───┘
                                                              │
   ┌──────────────────────────────────────────────────────────┴──────────────────────────┐
   ▼ (Mobile Device)                                                                     ▼ (Desktop / Tablet)
[1-Click Deep Link opens Google Pay]                                      [Client scans Dynamic QR via Phone]
   │                                                                                     │
   └──────────────────────────────────────────────────────────┬──────────────────────────┘
                                                              │
                                                              ▼
[Client Completes Payment in GPay & Enters 12-Digit Bank UTR Number]
                                                              │
                                                              ▼
[System Verifies Transaction ──► Triggers n8n Master Workflow ──► Provision Dashboard Workspace]
```

---

## 3. What You Need to Configure (2 Simple Settings)

You only need to configure two variables to receive money directly into your bank account:

| Setting | What It Is | Example Value | Where to Add |
|---|---|---|---|
| **`NEXT_PUBLIC_DEFAULT_UPI_VPA`** | Your Google Pay / Bank UPI ID | `synapsekinetic@oksbi` or `yourbusiness@upi` | `.env.local` OR [Admin API Keys Manager](file:///d:/home/website/src/app/admin/api-keys/page.tsx) |
| **`NEXT_PUBLIC_DEFAULT_UPI_PAYEE`** | Your Business / Payee Name | `Synapse Kinetic AI Studio` | `.env.local` OR [Admin API Keys Manager](file:///d:/home/website/src/app/admin/api-keys/page.tsx) |
| **`NEXT_PUBLIC_RAZORPAY_URL`** | Razorpay Instant Payment Handle | `https://razorpay.me/@79144506` | `.env.local` OR [Admin API Keys Manager](file:///d:/home/website/src/app/admin/api-keys/page.tsx) |

---

## 4. Key Capabilities & Benefits

1. **₹0 Gateway Transaction Fees**:
   - Unlike Razorpay/Stripe (which charge 2% to 3% + 18% GST), UPI peer-to-merchant transfers have **0% fees**. 100% of the client's money reaches your bank account instantly.
2. **Dynamic Exact Amount Locking**:
   - The QR code dynamically encodes the exact package price (e.g. `₹19,999`, `₹49,999`, `₹89,999`). Clients cannot underpay or make typing mistakes.
3. **1-Click Mobile App Deep-Linking**:
   - On mobile phones, clicking **"Open Google Pay"** launches the native GPay app with the payee name and amount pre-filled.
4. **12-Digit UTR Bank Verification**:
   - Clients enter their 12-digit UPI Transaction Reference (UTR) number, stored securely in the database (`orders` & `payments` tables) with automated receipt generation.
5. **Autonomous n8n Workflow Trigger**:
   - Upon UTR submission, the system triggers `N8nService.triggerWorkflow('wf-master-orchestrator', ...)` to start generative asset synthesis immediately.
