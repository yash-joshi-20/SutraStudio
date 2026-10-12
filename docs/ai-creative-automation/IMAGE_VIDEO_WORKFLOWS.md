# Image & Video Generation Workflows
**Document:** `docs/ai-creative-automation/IMAGE_VIDEO_WORKFLOWS.md`  
**Version:** 2.4.0

---

## 1. Visual Generation Safeguards

1. **Brand Palette Conformance:**
   - Base images must anchor to `#FAF9F5` (Warm Ivory), `#5C3A1E` (Deep Teak), and `#A98B57` (Muted Brass).
   - No cold neon blues or pure pitch black (#000000) solid backgrounds unless explicitly required for studio cycloramas.
2. **Video Trajectory Planning:**
   - All video prompts must specify physical camera vector (e.g., "slow 90-degree aerial orbit at 24fps", "smooth dolly-in along wooden joinery").
   - Random erratic camera movements are filtered out.
3. **Programmatic Remotion Assembly:**
   - Where AI video generators produce raw 5-second b-roll clips, Remotion compiles the final sequence, burning in subtitles, progress bars, and studio branding.
4. **Current Phase Status:**
   - Architecture, prompt compiling, and job registration are fully functional.
   - **External image/video generative API calls remain uninvoked during setup to protect costs and system integrity.**
