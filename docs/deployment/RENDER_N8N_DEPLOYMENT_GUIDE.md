# Sutra Studio — Render Cloud n8n Deployment Guide

This guide details how to deploy your dedicated, production-ready **n8n Automation Engine** on **Render** (as a persistent Docker Web Service), seamlessly mapped to **`https://n8n.sutrastudios.in`**.

---

## 1. Architecture Overview

```text
[Render Next.js Atelier] (https://sutrastudios.in)
           │
           │  HTTPS POST with x-sutra-secret
           ▼
[Render n8n Service] (https://n8n.sutrastudios.in)
    ├── Persistent Disk: /home/node/.n8n (Workflows & SQLite/PostgreSQL)
    ├── Webhook Endpoints: /webhook/sutra-master-dispatch
    │                      /webhook/W1_order_fulfillment_router
    │                      /webhook/W3_monthly_plan_content
    └── Upstream AI Engines: Gemini 2.0 Flash / Kling AI / ElevenLabs / Drive
           │
           │  Draft Deliverable Callback
           ▼
[Sutra Admin Review Queue] (/api/admin/deliverables)
```

---

## 2. Render 1-Click / Docker Web Service Setup

### Step A: Create Web Service on Render
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** &rarr; Select **Web Service**.
3. Choose **Deploy an existing image**.
4. Enter the official n8n Docker image:
   ```text
   docker.n8n.io/n8nio/n8n:latest
   ```

### Step B: Service Configuration
- **Name**: `sutra-n8n-engine`
- **Region**: Singapore / Frankfurt (close to your database and audience)
- **Instance Type**: Starter ($7/mo) or standard
- **Health Check Path**: `/healthz`

---

## 3. Environment Variables (Render Dashboard &rarr; Environment)

Add the following environment variables to your Render n8n service:

| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `N8N_HOST` | `n8n.sutrastudios.in` | Custom domain hostname |
| `N8N_PORT` | `5678` | Internal container port |
| `N8N_PROTOCOL` | `https` | Protocol for webhooks |
| `WEBHOOK_URL` | `https://n8n.sutrastudios.in/` | Public URL for webhook callbacks |
| `N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS` | `true` | Security file permission lock |
| `N8N_RUNNERS_ENABLED` | `true` | Task runner isolation |
| `N8N_DEFAULT_BINARY_DATA_MODE` | `filesystem` | Efficient file handling |
| `APP_BASE_URL` | `https://sutrastudios.in` | Main atelier web application |
| `N8N_WEBHOOK_SECRET` | `<your-secure-webhook-secret>` | Shared secret verification |
| `GENERIC_TIMEZONE` | `Asia/Kolkata` | Studio operational timezone |
| `TZ` | `Asia/Kolkata` | Container timezone |

### AI Provider Keys in n8n Container:
| Variable | Purpose |
| :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini 2.0 Flash for creative direction |
| `KLING_API_KEY` | Kling AI commercial motion synthesis |
| `ELEVENLABS_API_KEY` | ElevenLabs text-to-speech voiceovers |
| `SERPAPI_API_KEY` | Google Trends niche intelligence |
| `META_GRAPH_ACCESS_TOKEN` | Meta Graph API for Instagram/Facebook |
| `FACEBOOK_PAGE_ID` | `61594200943169` |

---

## 4. Persistent Disk Mount

To ensure your workflows, execution logs, and credentials survive restarts:
1. In your Render Web Service dashboard, navigate to **Disks**.
2. Click **Add Disk**:
   - **Name**: `sutra-n8n-data`
   - **Mount Path**: `/home/node/.n8n`
   - **Size**: `10 GB` (Standard)

---

## 5. Custom Domain Configuration (`n8n.sutrastudios.in`)

1. In Render Web Service &rarr; **Settings** &rarr; **Custom Domains**.
2. Add custom domain: `n8n.sutrastudios.in`.
3. In your DNS provider (Cloudflare / Hostinger / GoDaddy):
   - Add a `CNAME` record:
     - **Name**: `n8n`
     - **Target**: `<your-render-service>.onrender.com`
     - **Proxy status**: DNS only or Cloudflare Proxied (Full SSL).
4. Once Render verifies the certificate, `https://n8n.sutrastudios.in` is live!

---

## 6. Importing Sutra Workflows

1. Open `https://n8n.sutrastudios.in` in your browser.
2. Complete your studio admin account setup.
3. Import the master workflow from:
   `n8n/SUTRA_MASTER_RENDER_LOCAL_HYBRID.json`
4. Toggle workflow to **Active**.
