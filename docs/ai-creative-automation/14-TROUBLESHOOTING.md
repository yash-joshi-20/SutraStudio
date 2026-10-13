# 14 — Troubleshooting & Diagnostics

This reference provides resolutions for common runtime notices, validation blocks, and environment setup issues in the Sutra Studio AI Creative Automation Engine.

---

## 🛠️ Common Scenarios & Solutions

### 1. "Step execution stopped or requires key" / Missing Key Notice
- **Symptom**: Triggering Step 4 or Step 5 results in a notice stating that `BFL_API_KEY` or `KLING_API_KEY` is not configured.
- **Cause**: Commercial image or video engine credentials have not been configured in your environment.
- **Remedy**:
  - The engine has executed safely according to the **Zero Fake Outputs Policy** without crashing or generating fake placeholders.
  - To enable high-resolution rendering, add the key to `.env.local` or hosting environment secrets:
    ```bash
    BFL_API_KEY="your_bfl_key_here"
    KLING_API_KEY="your_kling_key_here"
    ```
  - For image generation, the system automatically uses Pollinations FLUX Free Tier when `BFL_API_KEY` is absent.

---

### 2. "Cross-origin request blocked"
- **Symptom**: An API call to `/api/admin/creative-automation/*` returns HTTP 400 with message `"Cross-origin request blocked."`.
- **Cause**: The request's `Origin` or `Referer` header does not match the server's `Host` header.
- **Remedy**: Ensure requests originate from the same application origin. If testing via curl or Postman, include the `Origin: http://localhost:3000` header.

---

### 3. "Step X requires Step Y to be completed before execution"
- **Symptom**: An attempt to run Step 4 (Image Generation) or Step 6 (Editing) returns a dependency validation error.
- **Cause**: Upstream prerequisite steps (such as Step 3 Shot Planning) have not completed.
- **Remedy**: The workflow engine strictly enforces input/output continuity. Execute or approve the upstream prerequisite steps first, or use the Admin Studio to run steps in order.

---

### 4. Firestore Admin Permission Denied
- **Symptom**: Firestore throws permission or credentials initialization error.
- **Cause**: `FIREBASE_PRIVATE_KEY` formatting issue or missing service account credentials.
- **Remedy**:
  - In `.env.local`, ensure escaped newlines (`\n`) in `FIREBASE_PRIVATE_KEY` are parsed correctly with `.replace(/\\n/g, '\n')`.
  - The engine automatically engages its in-memory cache resilience layer (`MEMORY_JOB_CACHE`) so the UI remains 100% interactive even while resolving Firebase permissions.
