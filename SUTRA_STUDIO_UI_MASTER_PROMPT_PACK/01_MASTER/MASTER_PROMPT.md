# SUTRA STUDIO — MASTER UI + FULL PROJECT PROMPT

## CORE RULE
Redesign the EXISTING website and mobile-app UI without changing the existing page count.
First inspect the repository and enumerate every existing route/page.
Do NOT invent, remove, rename, or add pages unless a required route is already missing and the developer explicitly approves it.

## BRAND
Brand name: SUTRA STUDIO
Positioning: traditional Indian-inspired creative technology / design studio with a modern premium digital experience.
The visual identity must work in:
- horizontal logo
- vertical/stacked logo
- favicon
- app icon
- watermark
- black & white video
- light/dark backgrounds
- small mobile headers
- large desktop hero areas

## UI DIRECTION
- Primary theme: premium white / warm off-white
- Clean, spacious, editorial
- Traditional character expressed through typography, geometry and restrained Indian-inspired detailing
- Modern technology feel without neon/cyberpunk styling
- Thin borders, generous whitespace, precise grid
- Minimal shadows
- Very limited gradients
- Subtle micro-interactions only
- Respect prefers-reduced-motion
- Fully responsive

Suggested palette:
- Ivory: #FAF9F5
- White: #FFFFFF
- Charcoal: #171717
- Soft graphite: #5E5E5E
- Warm sand: #E8E0D2
- Muted brass: #A98B57
- Border: #E5E1D8

Do not blindly use these colors if the existing SUTRA logo establishes a better final palette; derive the final UI tokens from the approved logo.

## LOGO SYSTEM
Create a reusable logo system:
1. Primary horizontal lockup
2. Stacked/vertical lockup
3. Symbol-only mark
4. Favicon
5. Mobile app icon
6. Monochrome black
7. Monochrome white
8. Watermark version

The logo must remain legible at favicon/app-icon size and in monochrome video overlays.

## EXISTING PAGE COUNT RULE
STEP 01 MUST:
- inspect Next.js routes/app directory
- inspect navigation links
- inspect mobile navigation
- inspect protected client/admin routes
- produce an exact route inventory
- preserve that exact page count

Every page must receive:
- desktop UI design prompt
- tablet UI prompt
- mobile UI prompt
- content hierarchy
- component list
- responsive behavior
- interaction/motion specification
- empty/loading/error/success states

## REQUIRED PRODUCT AREAS
Keep the existing pages and adapt them to these existing product capabilities where applicable:
- Home
- About
- Contact
- Services
- Client authentication
- Client dashboard
- Admin dashboard
- Orders/projects
- Client ↔ Admin chat
- Client ↔ AI chat
- AI workflow routing
- Image creation/editing
- Video creation / 10-second ads
- Voiceover
- 3D
- 360
- Interior design
- Window/design visualization
- Digital marketing
- Meta/Facebook/Instagram campaign workflows
- Website
- Web app
- Mobile app
- Automation
- Google Drive media storage
- Firebase user/application data

Do not add a new page merely because a service exists. If the current architecture uses a service catalog, dashboard module or modal, keep that structure.

## CLIENT EXPERIENCE
New client starts from zero:
- zero orders
- zero projects
- zero deliverables
- zero messages
- zero campaign history
- zero generated media

After Firebase login/onboarding, show only that client's data.
Client can:
- provide business information
- upload logo/documents/reference material
- chat with AI
- chat with admin
- order services
- upload requirements
- approve/reject deliverables
- request revisions
- download deliverables

## ADMIN EXPERIENCE
Admin can:
- see new clients
- see client profile/onboarding
- see orders/projects
- chat with clients
- see AI conversations where authorized
- take over an AI conversation
- manage services/packages
- manage deliverables/revisions
- monitor automation
- manage campaign workflows
- inspect audit activity

## AI ROUTER
The AI must classify the client requirement first.
Only send the request to the relevant workflow:
- image → image workflow
- video/ad → video workflow
- 3D → 3D workflow
- 360 → panorama workflow
- interior/window → visualization workflow
- digital marketing → research/content/campaign workflow
- website → website workflow
- app → app workflow

Mixed requests may create multiple linked jobs, but unrelated workflows must not run.

## DATA / STORAGE
- Firebase Authentication
- Firestore for application/client/admin/order/chat/workflow metadata
- Google Drive for large images, videos, audio, 3D and documents
- Never use MySQL/PostgreSQL in the new architecture
- Existing legacy database data must be migrated before legacy database code is removed
- Never expose private API keys in client-side code

## API / WORKFLOW REFERENCES
The supplied project document identifies Spline, Awwwards, Behance, Mobbin, Its Hover/Framer and Pinterest as design references, and maps AI/trend/image/video/3D/360/Drive workflows. Preserve those concepts but do not copy third-party branding or layouts. fileciteturn6file0L28-L38
The supplied workflow map connects trend research, reasoning, image, video, 3D, 360 and Google Drive storage into a routed pipeline. fileciteturn6file0L43-L68

## DEVELOPMENT SAFETY
At every step:
1. inspect
2. implement
3. run typecheck/lint/tests
4. fix errors
5. verify responsive UI
6. report CHANGED / VERIFIED / FAILED / REMAINING

Never overwrite working functionality without first checking its dependency chain.
