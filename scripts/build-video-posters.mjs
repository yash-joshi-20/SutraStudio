import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const BRAIN_DIR = 'C:/Users/yashj/.gemini/antigravity-ide/brain/507ce3d3-c576-4eab-8907-cfeef07b5724';
const W = 1200;
const H = 750;

async function buildVideoPosters() {
  console.log('Building cinematic video posters...');

  // 1. Studio Reel Poster (sutra-atelier-hero.jpg base with cinematic letterbox & film typography)
  const studioBase = 'd:/SutraStudio/public/images/studio/sutra-atelier-hero.jpg';

  const studioCrop = await sharp(studioBase)
    .resize(W, H, { fit: 'cover', position: 'center' })
    .toBuffer();

  const studioOverlaySvg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="vig" cx="50%" cy="50%" r="70%">
      <stop offset="40%" stop-color="#000000" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.75"/>
    </radialGradient>
    <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4A35A"/>
      <stop offset="100%" stop-color="#FFDF9E"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#vig)"/>

  <!-- Top Cinema Metadata -->
  <g transform="translate(50, 50)">
    <rect x="0" y="0" width="130" height="28" rx="14" fill="#171717" fill-opacity="0.85" stroke="#D4A35A" stroke-width="1"/>
    <text x="65" y="18" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#D4A35A" text-anchor="middle" letter-spacing="1.5">CINEMATIC 4K</text>
  </g>

  <!-- Center Luxury Play Reticle -->
  <g transform="translate(600, 360)">
    <circle cx="0" cy="0" r="48" fill="#171717" fill-opacity="0.75" stroke="#D4A35A" stroke-width="2"/>
    <circle cx="0" cy="0" r="56" fill="none" stroke="#FFFDF9" stroke-width="1" stroke-opacity="0.4" stroke-dasharray="6,4"/>
    <polygon points="-8,-16 16,0 -8,16" fill="url(#goldG)"/>
  </g>

  <!-- Bottom Cinema Title Card -->
  <g transform="translate(50, 640)">
    <text x="0" y="0" font-family="'Cinzel', 'Playfair Display', serif" font-size="32" font-weight="700" fill="#FFFFFF" letter-spacing="3">SUTRA ATELIER SHOWREEL</text>
    <text x="0" y="26" font-family="'Inter', sans-serif" font-size="13" font-weight="600" fill="#D4A35A" letter-spacing="1.5">TRADITION MEETS DIGITAL PRECISION • 4K UHD MASTER</text>
  </g>
</svg>
`;

  await sharp(studioCrop)
    .composite([{ input: Buffer.from(studioOverlaySvg), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile('d:/SutraStudio/public/videos/studio/studio-poster.webp');
  console.log('✓ studio-poster.webp successfully upgraded to cinematic studio showreel poster!');

  // 2. Commercial Reel Poster (ai-video-poster.webp)
  const perfumeImgPath = path.join(BRAIN_DIR, 'noir_fragrance_render_1792565150024.jpg');

  const perfumeCrop = await sharp(perfumeImgPath)
    .resize(W, H, { fit: 'cover', position: 'center' })
    .toBuffer();

  const reelOverlaySvg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="vig2" cx="50%" cy="50%" r="75%">
      <stop offset="30%" stop-color="#000000" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.8"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#vig2)"/>

  <!-- Top Badges -->
  <g transform="translate(50, 50)">
    <rect x="0" y="0" width="140" height="28" rx="14" fill="#171717" fill-opacity="0.85" stroke="#D4A35A" stroke-width="1"/>
    <text x="70" y="18" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#D4A35A" text-anchor="middle" letter-spacing="1.5">COMMERCIAL REEL</text>
  </g>

  <!-- Center Play Reticle -->
  <g transform="translate(600, 360)">
    <circle cx="0" cy="0" r="48" fill="#171717" fill-opacity="0.75" stroke="#D4A35A" stroke-width="2"/>
    <polygon points="-8,-16 16,0 -8,16" fill="#D4A35A"/>
  </g>

  <!-- Bottom Title Card -->
  <g transform="translate(50, 640)">
    <text x="0" y="0" font-family="'Cinzel', 'Playfair Display', serif" font-size="32" font-weight="700" fill="#FFFFFF" letter-spacing="3">AETHELGARD SPATIAL</text>
    <text x="0" y="26" font-family="'Inter', sans-serif" font-size="13" font-weight="600" fill="#D4A35A" letter-spacing="1.5">MOTION TYPOGRAPHY &amp; 3D COMMERCIAL SUITE • 60 FPS</text>
  </g>
</svg>
`;

  await sharp(perfumeCrop)
    .composite([{ input: Buffer.from(reelOverlaySvg), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile('d:/SutraStudio/public/videos/services/ai-video-poster.webp');
  console.log('✓ ai-video-poster.webp successfully upgraded to luxury commercial reel poster!');
}

buildVideoPosters().catch(console.error);
