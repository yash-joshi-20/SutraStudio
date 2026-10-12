# Multi-Client Creative Automation System
**Document:** `docs/ai-creative-automation/MULTI_CLIENT_SYSTEM.md`  
**Version:** 2.4.0

---

## 1. Multi-Tenant Architecture & Data Segregation

The platform supports multiple distinct brand profiles with strict data isolation.

### 1. Tenant Partitioning:
- Every `BrandProfile`, `CreativeJob`, and `GeneratedOutput` record is indexed by `clientUid` and `brandId`.
- Firebase Security Rules and `requireAdmin()` / `requireAuth()` ensure client users can only access records matching their authenticated UID.
- Studio Administrators have global multi-tenant switching capabilities via the Admin Studio interface.

### 2. Tenant Kit Components:
- **Brand Identity:** Name, tagline, industry, website, region, target audience.
- **Visual Tokens:** Primary, secondary, accent, and background colors.
- **Voice Guidelines:** Luxury Atelier, Minimal Modern, Authoritative Expert, Energetic Bold, or Warm Educational.
- **Negative Style Rules:** Custom brand constraints (e.g. "no neon colors", "no emojis").
- **Reference Assets:** Secure Google Drive vault assets pinned to the brand.
- **Approved Prompt Sets:** Whitelisted prompt templates approved for the tenant.
- **Content Calendar:** Scheduled production slots with topic, format, and status tracking.
