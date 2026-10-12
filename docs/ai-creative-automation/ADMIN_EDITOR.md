# Admin Creative Automation Studio Editor
**Document:** `docs/ai-creative-automation/ADMIN_EDITOR.md`  
**Version:** 2.4.0

---

## 1. Interface & Navigation

The **AI Creative Automation Studio** is integrated directly into the Admin Portal at `/admin/creative-automation`.

### Key Interface Sections:
1. **Header & Tenant Switcher:**
   - Multi-client dropdown allowing instant switching between Sutra Studio (Master) and client brand profiles.
   - "Test Pipeline" quick-action button initiating a simulated job without triggering paid rendering.
2. **Sub-Navigation Tabs:**
   - **Workflow Builder:** 14 interactive step cards with toggle switches, adapter labels, and approval indicators.
   - **Master Prompts:** Categorized prompt library with copy-to-clipboard actions and parameter chips.
   - **Keyword Library:** Searchable and filterable keyword tag matrix with instant enable/disable controls.
   - **Style Presets:** Visual breakdown of duration, camera motion, and typography rules.
   - **Trend Research:** Interactive market query form and real-time observation cards.
   - **Capabilities & APIs:** Live health, estimated cost, and rate limits for all integrated tools.
   - **Brand Profiles:** Multi-tenant brand kit inspector showing color swatches and tone rules.
   - **Job Queue:** Real-time job timeline cards with step progress bars and "Approve Step" action modal.
3. **Collapsible Responsive Design:**
   - Embeds `PortalSidebar` with width toggle (64px to 256px), 1024px tablet protection, and mobile drawer support.
