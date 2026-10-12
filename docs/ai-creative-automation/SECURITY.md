# Security & Governance Architecture
**Document:** `docs/ai-creative-automation/SECURITY.md`  
**Version:** 2.4.0

---

## 1. Authentication & Role-Based Authorization

1. **Server-Side Session Verification:**
   - Every administrative route requires `requireAdmin()` from `@/lib/auth/session`.
   - The session cookie is verified against Firebase Admin SDK, ensuring token forgery is blocked.
2. **CSRF & Same-Origin Defense:**
   - All mutating `POST` endpoints enforce `sameOrigin(req)`, preventing cross-site request forgery attacks.
3. **Sensitive Key Encapsulation:**
   - External provider API keys (`GEMINI_API_KEY`, `BFL_API_KEY`, `KLING_API_KEY`, `RUNWAY_API_KEY`, `TRIPO3D_API_KEY`) are read strictly via server-side readers in `src/lib/config/env.ts`.
   - Keys are never serialized or sent down to browser client components.
4. **Tenant Isolation:**
   - Firestore security rules restrict client queries to `resource.data.clientUid == request.auth.uid`.
   - Cross-client data exposure is structurally prevented.
5. **Rate Limiting & Cost Caps:**
   - Administrative spend caps configured in `src/lib/ai/providerRouter.ts` enforce daily ceilings to prevent budget overruns.
