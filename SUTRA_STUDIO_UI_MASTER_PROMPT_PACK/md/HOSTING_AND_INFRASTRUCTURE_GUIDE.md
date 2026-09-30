# SYNAPSE KINETIC — Hosting & Infrastructure Master Guide
**Free Tier vs. Paid Hosting Comparison (Vercel, Cloudflare, Hostinger VPS, AWS & DigitalOcean)**

---

## 1. Hosting Architecture Overview

Synapse Kinetic is architected using **Next.js 15 (App Router)** and modern TypeScript. It can be hosted on 100% Free Tiers or scaled to Dedicated Cloud VPS instances as your client base grows.

```
+---------------------------------------------------------------------------------------+
|                                    GROWTH ROADMAP                                     |
+---------------------------------------------------------------------------------------+
| PHASE 1 (Current): 100% Free Tier (Vercel Edge + Supabase Free DB + Cloudflare CDN)   |
|                 Cost: ₹0 / month  • Capacity: 50,000 monthly active users             |
+---------------------------------------------------------------------------------------+
                                           │
                                           ▼
+---------------------------------------------------------------------------------------+
| PHASE 2 (Scaling): Hostinger Cloud VPS / DigitalOcean (Dockerized n8n + MySQL DB)    |
|                 Cost: ₹499 - ₹899 / month • Capacity: 250,000 monthly active users    |
+---------------------------------------------------------------------------------------+
                                           │
                                           ▼
+---------------------------------------------------------------------------------------+
| PHASE 3 (Enterprise): AWS / GCP Dedicated Cluster (Multi-Region Autoscaling + GPU)   |
|                 Cost: ₹3,500 - ₹12,000 / month • Capacity: 1,000,000+ users          |
+---------------------------------------------------------------------------------------+
```

---

## 2. Free Tier Hosting Options (Zero Cost / ₹0 per month)

| Provider | Best For | Monthly Cost | Included Free Resources | Direct Link |
|---|---|---|---|---|
| **Vercel** *(Recommended)* | Next.js Web App & APIs | **₹0 / mo** | Unlimited global edge deployments, 100GB bandwidth, auto SSL | [vercel.com](https://vercel.com) |
| **Cloudflare Pages** | Static & Serverless Edge | **₹0 / mo** | Unlimited bandwidth, 500 builds/mo, DDoS defense | [pages.cloudflare.com](https://pages.cloudflare.com) |
| **Supabase** | Relational Database & Auth | **₹0 / mo** | 500MB PostgreSQL DB, 50,000 monthly active users, real-time WebSockets | [supabase.com](https://supabase.com) |
| **Render** | Background workers & n8n | **₹0 / mo** | Free web service + PostgreSQL database tier | [render.com](https://render.com) |
| **GitHub Actions** | Automated CI/CD & Tests | **₹0 / mo** | 2,000 free build minutes per month | [github.com](https://github.com) |

---

## 3. Paid Hosting Providers Comparison (When Scaling Up)

When you have paying clients and want self-hosted n8n workers, private GPU video rendering, or custom MySQL databases:

| Provider | Server Type | Monthly Cost (₹ INR) | Key Advantages | Best Use Case |
|---|---|---|---|---|
| **Hostinger Cloud / VPS** *(Best Value Paid)* | KVM 2 / KVM 4 VPS (NVMe SSD) | **₹499 – ₹899 / mo** | 8GB RAM, 2-4 vCPU cores, 100GB NVMe storage, 1-click Docker, India datacenter available | Ideal for running self-hosted n8n, MySQL database, and web app on single low-cost server |
| **DigitalOcean** | Basic Droplet (Ubuntu) | **₹500 – ₹1,200 / mo** | Clean UI, 1-click Docker droplet, snapshot backups, predictable billing | Dedicated n8n queue & automated cron jobs |
| **AWS (Amazon Web Services)** | EC2 t4g / Amplify / RDS | **₹1,500 – ₹5,000+ / mo** | Enterprise compliance, unlimited scalability, IAM access control | Enterprise clients requiring SOC 2 and private VPC isolation |

---

## 4. Final Verdict & Recommendation

1. **For Launch & Initial Clients (Phase 1)**:
   - **Frontend & App**: Host on **Vercel Free Tier** ([vercel.com](https://vercel.com)).
   - **Database & Auth**: Use **Supabase Free Tier** ([supabase.com](https://supabase.com)).
   - **Total Monthly Spend**: **₹0.00 / month (100% Free)**.

2. **When Upgrading to Paid (Phase 2)**:
   - Choose **Hostinger KVM 2 VPS** (~₹599/mo) with Ubuntu + Docker to run your own unlimited n8n instance and local MySQL database.
