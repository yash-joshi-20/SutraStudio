import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SERVICES_DIR = 'd:/SutraStudio/public/images/services';
const STUDIO_IMG = 'd:/SutraStudio/public/images/studio/sutra-atelier-hero.jpg';
const PROJECTS_DIR = 'd:/SutraStudio/public/images/projects';

const WIDTH = 1200;
const HEIGHT = 750;

async function run() {
  console.log('Generating high-fidelity service imagery...');

  // -------------------------------------------------------------
  // 1. INTERIOR DESIGN: Full Office Top-View Floor Plan
  // -------------------------------------------------------------
  const topViewSvg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#E8E1D5" stroke-width="0.6" stroke-opacity="0.6"/>
    </pattern>
    <pattern id="wood" width="14" height="40" patternUnits="userSpaceOnUse">
      <rect width="14" height="40" fill="#F4EFE6"/>
      <line x1="0" y1="0" x2="14" y2="0" stroke="#DFD5C3" stroke-width="0.8"/>
      <line x1="7" y1="0" x2="7" y2="40" stroke="#E5DBCB" stroke-width="0.5" stroke-dasharray="15,5"/>
    </pattern>
    <pattern id="tile" width="30" height="30" patternUnits="userSpaceOnUse">
      <rect width="30" height="30" fill="#FAF8F5"/>
      <rect width="30" height="30" fill="none" stroke="#E5DCCE" stroke-width="0.8"/>
    </pattern>
    <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4A35A"/>
      <stop offset="50%" stop-color="#F0D194"/>
      <stop offset="100%" stop-color="#A87933"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#3D2814" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- Canvas Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#F8F5EF"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)"/>

  <!-- Outer Architectural Enclosure with Shadow -->
  <g filter="url(#shadow)">
    <rect x="90" y="70" width="1020" height="600" rx="14" fill="#FFFFFF" stroke="#3D2814" stroke-width="8"/>
  </g>

  <!-- Zones -->
  <!-- Left Wing: Executive Creative Suite (Yash Joshi) -->
  <rect x="98" y="78" width="330" height="300" fill="url(#wood)" stroke="#5C3A1E" stroke-width="3"/>
  <!-- Lower Left: Materials Vault -->
  <rect x="98" y="378" width="330" height="284" fill="url(#tile)" stroke="#5C3A1E" stroke-width="3"/>

  <!-- Center Wing: Lotus Foyer -->
  <rect x="428" y="78" width="350" height="250" fill="#FFFDF9" stroke="#5C3A1E" stroke-width="3"/>
  <!-- Center Lower: Client Presentation Lounge -->
  <rect x="428" y="328" width="350" height="334" fill="url(#wood)" stroke="#5C3A1E" stroke-width="3"/>

  <!-- Right Wing: 3D Spatial & Engineering Lab -->
  <rect x="778" y="78" width="324" height="584" fill="url(#tile)" stroke="#5C3A1E" stroke-width="3"/>

  <!-- Executive Suite Furniture -->
  <rect x="150" y="150" width="190" height="85" rx="6" fill="#5C3A1E" stroke="url(#brassGrad)" stroke-width="2.5"/>
  <rect x="180" y="165" width="130" height="22" rx="2" fill="#FAF9F5" opacity="0.9"/>
  <circle cx="245" cy="120" r="24" fill="#3D2814" stroke="#D4A35A" stroke-width="2"/>
  <circle cx="195" cy="265" r="18" fill="#FFFDF9" stroke="#5C3A1E" stroke-width="2"/>
  <circle cx="295" cy="265" r="18" fill="#FFFDF9" stroke="#5C3A1E" stroke-width="2"/>
  <rect x="110" y="88" width="300" height="24" fill="#8B6846" stroke="#3D2814" stroke-width="1.5"/>

  <!-- Central Lotus Emblem Inlay -->
  <circle cx="603" cy="200" r="55" fill="#FBF3E4" stroke="url(#brassGrad)" stroke-width="2.5"/>
  <g transform="translate(603, 200)">
    <ellipse cx="0" cy="-26" rx="10" ry="20" fill="none" stroke="#A87933" stroke-width="2"/>
    <ellipse cx="0" cy="26" rx="10" ry="20" fill="none" stroke="#A87933" stroke-width="2"/>
    <ellipse cx="-26" cy="0" rx="20" ry="10" fill="none" stroke="#A87933" stroke-width="2"/>
    <ellipse cx="26" cy="0" rx="20" ry="10" fill="none" stroke="#A87933" stroke-width="2"/>
    <circle cx="0" cy="0" r="9" fill="url(#brassGrad)"/>
  </g>
  <!-- Main Entrance Pivot Door -->
  <line x1="545" y1="78" x2="665" y2="78" stroke="#3D2814" stroke-width="8" stroke-dasharray="24,10"/>
  <path d="M 545 78 A 60 60 0 0 1 605 138" fill="none" stroke="#D4A35A" stroke-width="2" stroke-dasharray="4,4"/>

  <!-- Presentation Lounge Furniture -->
  <rect x="495" y="440" width="215" height="115" rx="22" fill="#5C3A1E" stroke="url(#brassGrad)" stroke-width="2.5"/>
  <circle cx="455" cy="497" r="20" fill="#FFFDF9" stroke="#5C3A1E" stroke-width="2"/>
  <circle cx="750" cy="497" r="20" fill="#FFFDF9" stroke="#5C3A1E" stroke-width="2"/>
  <circle cx="550" cy="400" r="20" fill="#FFFDF9" stroke="#5C3A1E" stroke-width="2"/>
  <circle cx="655" cy="400" r="20" fill="#FFFDF9" stroke="#5C3A1E" stroke-width="2"/>
  <circle cx="550" cy="595" r="20" fill="#FFFDF9" stroke="#5C3A1E" stroke-width="2"/>
  <circle cx="655" cy="595" r="20" fill="#FFFDF9" stroke="#5C3A1E" stroke-width="2"/>
  <rect x="525" y="650" width="160" height="8" fill="#0F172A"/>

  <!-- 3D Spatial & Engineering Workstations -->
  <rect x="835" y="140" width="215" height="75" rx="4" fill="#FAF9F5" stroke="#5C3A1E" stroke-width="2"/>
  <rect x="865" y="152" width="70" height="8" rx="1" fill="#0F172A"/>
  <rect x="955" y="152" width="70" height="8" rx="1" fill="#0F172A"/>
  <circle cx="942" cy="245" r="18" fill="#5C3A1E" stroke="#D4A35A" stroke-width="1.5"/>

  <rect x="835" y="325" width="215" height="75" rx="4" fill="#FAF9F5" stroke="#5C3A1E" stroke-width="2"/>
  <rect x="865" y="337" width="70" height="8" rx="1" fill="#0F172A"/>
  <rect x="955" y="337" width="70" height="8" rx="1" fill="#0F172A"/>
  <circle cx="942" cy="430" r="18" fill="#5C3A1E" stroke="#D4A35A" stroke-width="1.5"/>

  <rect x="835" y="510" width="215" height="75" rx="4" fill="#FAF9F5" stroke="#5C3A1E" stroke-width="2"/>
  <rect x="865" y="522" width="70" height="8" rx="1" fill="#0F172A"/>
  <rect x="955" y="522" width="70" height="8" rx="1" fill="#0F172A"/>
  <circle cx="942" cy="615" r="18" fill="#5C3A1E" stroke="#D4A35A" stroke-width="1.5"/>

  <!-- Zone Typography -->
  <text x="260" y="325" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#5C3A1E" text-anchor="middle" letter-spacing="1">EXECUTIVE CREATIVE SUITE</text>
  <text x="260" y="342" font-family="'Inter', sans-serif" font-size="10" fill="#786450" text-anchor="middle">Yash Joshi • Principal Technologist</text>

  <text x="260" y="590" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#5C3A1E" text-anchor="middle" letter-spacing="1">MATERIAL VAULT &amp; ARCHIVE</text>
  <text x="260" y="606" font-family="'Inter', sans-serif" font-size="10" fill="#786450" text-anchor="middle">Physical Swatches, Walnut &amp; Metals</text>

  <text x="603" y="280" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#5C3A1E" text-anchor="middle" letter-spacing="1.5">MAIN LOTUS FOYER</text>
  <text x="603" y="296" font-family="'Inter', sans-serif" font-size="10" fill="#8C6D32" text-anchor="middle">Geometric Architectural Welcome</text>

  <text x="603" y="625" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#5C3A1E" text-anchor="middle" letter-spacing="1">PRESENTATION LOUNGE</text>
  <text x="603" y="640" font-family="'Inter', sans-serif" font-size="10" fill="#786450" text-anchor="middle">Client Strategy &amp; 4K Screening</text>

  <text x="940" y="115" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#5C3A1E" text-anchor="middle" letter-spacing="1">SPATIAL &amp; 3D LAB</text>
  <text x="940" y="295" font-family="'Inter', sans-serif" font-size="10" fill="#786450" text-anchor="middle">Photorealistic CGI Pod</text>
  <text x="940" y="480" font-family="'Inter', sans-serif" font-size="10" fill="#786450" text-anchor="middle">Full-Stack Dev Pod</text>

  <!-- Dimension Indicator -->
  <line x1="90" y1="46" x2="1110" y2="46" stroke="#5C3A1E" stroke-width="1.2"/>
  <line x1="90" y1="38" x2="90" y2="54" stroke="#5C3A1E" stroke-width="1.5"/>
  <line x1="1110" y1="38" x2="1110" y2="54" stroke="#5C3A1E" stroke-width="1.5"/>
  <text x="600" y="42" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#5C3A1E" text-anchor="middle">18.50 METERS (STUDIO WIDTH)</text>

  <!-- Left Dimension -->
  <line x1="60" y1="70" x2="60" y2="670" stroke="#5C3A1E" stroke-width="1.2"/>
  <line x1="52" y1="70" x2="68" y2="70" stroke="#5C3A1E" stroke-width="1.5"/>
  <line x1="52" y1="670" x2="68" y2="670" stroke="#5C3A1E" stroke-width="1.5"/>
  <text x="50" y="375" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#5C3A1E" text-anchor="middle" transform="rotate(-90 50 375)">11.20 METERS</text>

  <!-- Title Block Banner -->
  <g transform="translate(720, 680)">
    <rect x="0" y="0" width="380" height="52" rx="8" fill="#FFFDF9" stroke="#D4A35A" stroke-width="1.5"/>
    <text x="16" y="22" font-family="'Inter', sans-serif" font-size="12" font-weight="800" fill="#0F172A" letter-spacing="1">SUTRA STUDIO — ATELIER ARCHITECTURAL PLAN</text>
    <text x="16" y="38" font-family="'Inter', sans-serif" font-size="9" font-weight="600" fill="#8C6D32">3D SPATIAL INTERIOR TOP-VIEW FLOORPLAN</text>
    <text x="16" y="48" font-family="'Inter', sans-serif" font-size="8" fill="#64748B">SCALE 1:50 • WARM IVORY &amp; WALNUT ATELIER • VERIFIED 2026</text>
  </g>

  <!-- North Arrow -->
  <g transform="translate(1140, 115)">
    <circle cx="0" cy="0" r="22" fill="#FFFDF9" stroke="#D4A35A" stroke-width="1.2"/>
    <polygon points="0,-17 5,0 0,5 -5,0" fill="#5C3A1E"/>
    <polygon points="0,17 5,0 0,-5 -5,0" fill="#D4A35A"/>
    <text x="0" y="-22" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="#5C3A1E" text-anchor="middle">N</text>
  </g>
</svg>
`;

  await sharp(Buffer.from(topViewSvg))
    .webp({ quality: 95 })
    .toFile(path.join(SERVICES_DIR, 'interior-design.webp'));
  console.log('✓ interior-design.webp (Office Top-View Floorplan) generated');

  // -------------------------------------------------------------
  // 2. 3D MODELING: Sutra Studio Office 3D Spatial Digital Twin
  // -------------------------------------------------------------
  // We composite the real physical atelier photograph with high-end 3D CAD viewport UI & wireframe
  const cadOverlaySvg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="topBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0F172A" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#1E293B" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#D4A35A" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#D4A35A" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Top 3D Viewport Header -->
  <rect x="0" y="0" width="${WIDTH}" height="48" fill="url(#topBarGrad)"/>
  <line x1="0" y1="48" x2="${WIDTH}" y2="48" stroke="#D4A35A" stroke-width="1.5" stroke-opacity="0.8"/>

  <text x="24" y="30" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#FFFFFF" letter-spacing="1.5">SUTRA 3D ENGINE // SPATIAL ATELIER TWIN</text>
  <text x="350" y="30" font-family="'JetBrains Mono', monospace" font-size="11" fill="#D4A35A">SCENE: sutra_atelier_office.gltf</text>

  <!-- Viewport mode pills -->
  <g transform="translate(760, 12)">
    <rect x="0" y="0" width="85" height="24" rx="12" fill="#5C3A1E" stroke="#D4A35A" stroke-width="1"/>
    <text x="42" y="16" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">PBR SHADED</text>

    <rect x="95" y="0" width="90" height="24" rx="12" fill="#1E293B" stroke="#64748B" stroke-width="1"/>
    <text x="140" y="16" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="#CBD5E1" text-anchor="middle">WIREFRAME</text>

    <rect x="195" y="0" width="85" height="24" rx="12" fill="#1E293B" stroke="#64748B" stroke-width="1"/>
    <text x="237" y="16" font-family="'Inter', sans-serif" font-size="10" font-weight="600" fill="#CBD5E1" text-anchor="middle">4K TEXTURES</text>

    <rect x="290" y="0" width="130" height="24" rx="12" fill="#2E7D4F" stroke="#4ADE80" stroke-width="1"/>
    <text x="355" y="16" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">EXPORT: USDZ / GLTF</text>
  </g>

  <!-- 3D Perspective Ground Grid (Cyan/Gold subtle overlay) -->
  <g opacity="0.35">
    <!-- Perspective horizontal lines -->
    <line x1="100" y1="620" x2="1100" y2="620" stroke="#D4A35A" stroke-width="1.2"/>
    <line x1="200" y1="560" x2="1000" y2="560" stroke="#D4A35A" stroke-width="1"/>
    <line x1="300" y1="510" x2="900" y2="510" stroke="#D4A35A" stroke-width="0.8"/>
    <line x1="380" y1="470" x2="820" y2="470" stroke="#D4A35A" stroke-width="0.6"/>
    <!-- Perspective convergence lines -->
    <line x1="600" y1="440" x2="150" y2="700" stroke="#D4A35A" stroke-width="1"/>
    <line x1="600" y1="440" x2="350" y2="700" stroke="#D4A35A" stroke-width="0.8"/>
    <line x1="600" y1="440" x2="600" y2="700" stroke="#D4A35A" stroke-width="1"/>
    <line x1="600" y1="440" x2="850" y2="700" stroke="#D4A35A" stroke-width="0.8"/>
    <line x1="600" y1="440" x2="1050" y2="700" stroke="#D4A35A" stroke-width="1"/>
  </g>

  <!-- 3D Spatial Callout Pins -->
  <g transform="translate(320, 280)">
    <circle cx="0" cy="0" r="14" fill="#5C3A1E" stroke="#D4A35A" stroke-width="2"/>
    <circle cx="0" cy="0" r="4" fill="#FFFFFF"/>
    <line x1="0" y1="14" x2="0" y2="40" stroke="#D4A35A" stroke-width="1.5"/>
    <rect x="-85" y="40" width="170" height="26" rx="6" fill="#0F172A" stroke="#D4A35A" stroke-width="1"/>
    <text x="0" y="57" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FAF9F5" text-anchor="middle">ATELIER WORKSTATIONS</text>
  </g>

  <g transform="translate(820, 240)">
    <circle cx="0" cy="0" r="14" fill="#5C3A1E" stroke="#D4A35A" stroke-width="2"/>
    <circle cx="0" cy="0" r="4" fill="#FFFFFF"/>
    <line x1="0" y1="14" x2="0" y2="40" stroke="#D4A35A" stroke-width="1.5"/>
    <rect x="-75" y="40" width="150" height="26" rx="6" fill="#0F172A" stroke="#D4A35A" stroke-width="1"/>
    <text x="0" y="57" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FAF9F5" text-anchor="middle">PRESENTATION SUITE</text>
  </g>

  <!-- 3D Transform Gizmo (Lower Left) -->
  <g transform="translate(85, 660)">
    <circle cx="0" cy="0" r="44" fill="#0F172A" opacity="0.85" stroke="#475569" stroke-width="1"/>
    <!-- X Axis (Red) -->
    <line x1="0" y1="0" x2="30" y2="0" stroke="#EF4444" stroke-width="3"/>
    <text x="35" y="4" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#EF4444">X</text>
    <!-- Y Axis (Green) -->
    <line x1="0" y1="0" x2="0" y2="-30" stroke="#22C55E" stroke-width="3"/>
    <text x="-4" y="-35" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#22C55E">Y</text>
    <!-- Z Axis (Blue - Isometric) -->
    <line x1="0" y1="0" x2="-20" y2="20" stroke="#3B82F6" stroke-width="3"/>
    <text x="-28" y="30" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#3B82F6">Z</text>
    <circle cx="0" cy="0" r="4" fill="#FFFFFF"/>
  </g>

  <!-- Bottom Viewport Status Bar -->
  <rect x="0" y="715" width="${WIDTH}" height="35" fill="#0F172A" opacity="0.95"/>
  <line x1="0" y1="715" x2="${WIDTH}" y2="715" stroke="#334155" stroke-width="1"/>
  <text x="24" y="737" font-family="'JetBrains Mono', monospace" font-size="11" fill="#94A3B8">POLYS: 428,910 | VERTICES: 312,400 | MATERIALS: 18 PBR | FPS: 60.0 | ENGINE: WebGL / Three.js</text>
  <text x="1176" y="737" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#D4A35A" text-anchor="end">SUTRA STUDIO 3D ASSET</text>
</svg>
`;

  const studioBase = await sharp(STUDIO_IMG)
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .toBuffer();

  await sharp(studioBase)
    .composite([{ input: Buffer.from(cadOverlaySvg), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile(path.join(SERVICES_DIR, '3d-modeling.webp'));
  console.log('✓ 3d-modeling.webp (Studio Office 3D Spatial Digital Twin) generated');

  // -------------------------------------------------------------
  // 3. 360 VIEW: Sutra Studio Office 360° Virtual Tour
  // -------------------------------------------------------------
  const tourOverlaySvg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
      <stop offset="60%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.45"/>
    </radialGradient>
    <linearGradient id="vrBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0F172A" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#3D2814" stop-opacity="0.95"/>
    </linearGradient>
  </defs>

  <!-- Vignette -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette)"/>

  <!-- Top 360 Navigation Bar -->
  <rect x="0" y="0" width="${WIDTH}" height="56" fill="url(#vrBar)"/>
  <line x1="0" y1="56" x2="${WIDTH}" y2="56" stroke="#D4A35A" stroke-width="1.5"/>

  <g transform="translate(24, 16)">
    <circle cx="12" cy="12" r="12" fill="#5C3A1E" stroke="#D4A35A" stroke-width="1.5"/>
    <text x="12" y="16" font-family="'Inter', sans-serif" font-size="10" font-weight="800" fill="#FFFFFF" text-anchor="middle">360°</text>
    <text x="36" y="16" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#FFFFFF" letter-spacing="1">SUTRA STUDIO ATELIER // 360° VIRTUAL TOUR</text>
  </g>

  <!-- VR & Gyro Controls -->
  <g transform="translate(860, 14)">
    <rect x="0" y="0" width="105" height="28" rx="14" fill="#5C3A1E" stroke="#D4A35A" stroke-width="1"/>
    <text x="52" y="18" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle">GYRO ACTIVE</text>

    <rect x="115" y="0" width="100" height="28" rx="14" fill="#1E293B" stroke="#64748B" stroke-width="1"/>
    <text x="165" y="18" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#FAF9F5" text-anchor="middle">VR HEADSET</text>

    <rect x="225" y="0" width="90" height="28" rx="14" fill="#2E7D4F" stroke="#4ADE80" stroke-width="1"/>
    <text x="270" y="18" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle">8K HDR</text>
  </g>

  <!-- Center Floating 360 Compass Reticle -->
  <g transform="translate(600, 375)">
    <!-- Outer radar rings -->
    <circle cx="0" cy="0" r="50" fill="none" stroke="#D4A35A" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.8"/>
    <circle cx="0" cy="0" r="32" fill="#FFFDF9" fill-opacity="0.25" stroke="#FFFFFF" stroke-width="1.5"/>
    <!-- Center reticle dot -->
    <circle cx="0" cy="0" r="5" fill="#D4A35A"/>
    <!-- Crosshairs -->
    <line x1="-20" y1="0" x2="-8" y2="0" stroke="#FFFFFF" stroke-width="2"/>
    <line x1="8" y1="0" x2="20" y2="0" stroke="#FFFFFF" stroke-width="2"/>
    <line x1="0" y1="-20" x2="0" y2="-8" stroke="#FFFFFF" stroke-width="2"/>
    <line x1="0" y1="8" x2="0" y2="20" stroke="#FFFFFF" stroke-width="2"/>

    <!-- Reticle badge -->
    <rect x="-110" y="65" width="220" height="30" rx="15" fill="#0F172A" fill-opacity="0.9" stroke="#D4A35A" stroke-width="1.2"/>
    <text x="0" y="84" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#FAF9F5" text-anchor="middle">DRAG TO EXPLORE 360°</text>
  </g>

  <!-- Hotspot Pin 1: Lotus Welcome Foyer -->
  <g transform="translate(250, 430)">
    <circle cx="0" cy="0" r="18" fill="#5C3A1E" fill-opacity="0.9" stroke="#D4A35A" stroke-width="2"/>
    <text x="0" y="5" font-family="'Inter', sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">1</text>
    <rect x="25" y="-14" width="160" height="28" rx="6" fill="#0F172A" fill-opacity="0.9" stroke="#EADFCB" stroke-width="1"/>
    <text x="105" y="4" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#FAF9F5" text-anchor="middle">Lotus Welcome Foyer</text>
  </g>

  <!-- Hotspot Pin 2: Creative Director Desk -->
  <g transform="translate(920, 390)">
    <circle cx="0" cy="0" r="18" fill="#5C3A1E" fill-opacity="0.9" stroke="#D4A35A" stroke-width="2"/>
    <text x="0" y="5" font-family="'Inter', sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">2</text>
    <rect x="-185" y="-14" width="175" height="28" rx="6" fill="#0F172A" fill-opacity="0.9" stroke="#EADFCB" stroke-width="1"/>
    <text x="-97" y="4" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#FAF9F5" text-anchor="middle">Executive Studio Suite</text>
  </g>

  <!-- Bottom Navigation HUD -->
  <g transform="translate(0, 680)">
    <rect x="0" y="0" width="${WIDTH}" height="70" fill="#0F172A" fill-opacity="0.9"/>
    <line x1="0" y1="0" x2="${WIDTH}" y2="0" stroke="#334155" stroke-width="1"/>
    <text x="24" y="40" font-family="'Inter', sans-serif" font-size="12" font-weight="600" fill="#94A3B8">SCENE: Main Atelier Workspace (Panorama 1/4) • 8K Equirectangular Master</text>
    <text x="1176" y="40" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#D4A35A" text-anchor="end">WEBXR &amp; MOBILE COMPATIBLE</text>
  </g>
</svg>
`;

  await sharp(studioBase)
    .composite([{ input: Buffer.from(tourOverlaySvg), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile(path.join(SERVICES_DIR, '360-view.webp'));
  console.log('✓ 360-view.webp (Studio Office 360° Virtual Tour) generated');

  // -------------------------------------------------------------
  // 4. META ADS LAUNCHER: Real Brand Promotion Ad Campaign Visual
  // -------------------------------------------------------------
  // High-converting Meta Ad campaign showcase with real brand creative
  const metaAdsSvg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="metaBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#181512"/>
      <stop offset="100%" stop-color="#2D2117"/>
    </linearGradient>
    <linearGradient id="adAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4A35A"/>
      <stop offset="100%" stop-color="#B8863A"/>
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#metaBg)"/>

  <!-- Subtle Lotus Brand Watermark -->
  <g opacity="0.04" transform="translate(600, 375)">
    <circle cx="0" cy="0" r="280" fill="none" stroke="#D4A35A" stroke-width="4"/>
  </g>

  <!-- Left: Campaign Performance Analytics Panel -->
  <g transform="translate(60, 90)">
    <rect x="0" y="0" width="460" height="570" rx="20" fill="#FAF9F5" filter="url(#cardShadow)"/>
    <rect x="0" y="0" width="460" height="570" rx="20" fill="#FFFFFF" stroke="#EADFCB" stroke-width="1.5"/>

    <!-- Header -->
    <g transform="translate(30, 35)">
      <rect x="0" y="0" width="70" height="24" rx="12" fill="#EBF7EE"/>
      <text x="35" y="16" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#2E7D4F" text-anchor="middle">ACTIVE CAMPAIGN</text>
      <text x="0" y="55" font-family="'Inter', sans-serif" font-size="20" font-weight="800" fill="#0F172A">Meta Ads Campaign Architecture</text>
      <text x="0" y="78" font-family="'Inter', sans-serif" font-size="12" fill="#64748B">Luxury Brand Direct-Response Creative Engine</text>
    </g>

    <!-- Metrics Cards Grid -->
    <g transform="translate(30, 140)">
      <rect x="0" y="0" width="185" height="95" rx="14" fill="#F8F5EF" stroke="#EADFCB" stroke-width="1"/>
      <text x="18" y="30" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#8C6D32">RETURN ON AD SPEND</text>
      <text x="18" y="68" font-family="'Inter', sans-serif" font-size="28" font-weight="800" fill="#5C3A1E">5.82x</text>
      <text x="110" y="66" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#2E7D4F">▲ +48%</text>

      <rect x="210" y="0" width="185" height="95" rx="14" fill="#F8F5EF" stroke="#EADFCB" stroke-width="1"/>
      <text x="228" y="30" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#8C6D32">CLICK-THROUGH RATE</text>
      <text x="228" y="68" font-family="'Inter', sans-serif" font-size="28" font-weight="800" fill="#5C3A1E">4.65%</text>
      <text x="320" y="66" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#2E7D4F">▲ Top 1%</text>
    </g>

    <!-- Ad Creative Checklist -->
    <g transform="translate(30, 265)">
      <text x="0" y="20" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#0F172A">Included Creative Deliverables:</text>
      
      <g transform="translate(0, 40)">
        <circle cx="8" cy="8" r="8" fill="#5C3A1E"/>
        <text x="26" y="12" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="#334155">10× High-Hook 9:16 Video Reels (Motion Cuts)</text>
      </g>
      <g transform="translate(0, 75)">
        <circle cx="8" cy="8" r="8" fill="#5C3A1E"/>
        <text x="26" y="12" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="#334155">15× Photorealistic 1:1 &amp; 4:5 Static Visual Carousels</text>
      </g>
      <g transform="translate(0, 110)">
        <circle cx="8" cy="8" r="8" fill="#5C3A1E"/>
        <text x="26" y="12" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="#334155">A/B Headline Hooks, Angles &amp; Copy Architecture</text>
      </g>
      <g transform="translate(0, 145)">
        <circle cx="8" cy="8" r="8" fill="#5C3A1E"/>
        <text x="26" y="12" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="#334155">Pixel Integration, Custom Audiences &amp; Retargeting</text>
      </g>
    </g>

    <!-- Bottom Badge -->
    <g transform="translate(30, 485)">
      <rect x="0" y="0" width="400" height="48" rx="24" fill="#5C3A1E"/>
      <text x="200" y="30" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#FFFFFF" text-anchor="middle">SUTRA CAMPAIGN ARCHITECTURE</text>
    </g>
  </g>

  <!-- Right: Real High-Fashion / Luxury Brand Ad Mockup on Smartphone Frame -->
  <g transform="translate(620, 50)" filter="url(#cardShadow)">
    <!-- Smartphone Bezel -->
    <rect x="0" y="0" width="480" height="650" rx="42" fill="#1E1E1E" stroke="#5C3A1E" stroke-width="4"/>
    <rect x="15" y="15" width="450" height="620" rx="32" fill="#FFFDF9"/>

    <!-- Instagram / Meta Ad Header -->
    <g transform="translate(35, 40)">
      <circle cx="20" cy="20" r="20" fill="#5C3A1E" stroke="#D4A35A" stroke-width="1.5"/>
      <text x="20" y="26" font-family="'Inter', sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">S</text>
      <text x="52" y="18" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#0F172A">sutrastudio.luxury</text>
      <text x="52" y="34" font-family="'Inter', sans-serif" font-size="11" fill="#64748B">Sponsored • Brand Campaign</text>
    </g>

    <!-- Ad Image Visual Container -->
    <g transform="translate(35, 95)">
      <rect x="0" y="0" width="410" height="360" rx="16" fill="#F8F5EF" stroke="#EADFCB" stroke-width="1"/>
      <!-- Inner luxury visual presentation -->
      <rect x="15" y="15" width="380" height="330" rx="12" fill="#171717"/>
      <!-- Gold Frame -->
      <rect x="30" y="30" width="350" height="300" fill="none" stroke="url(#adAccent)" stroke-width="1.5"/>
      <text x="205" y="150" font-family="'Cinzel', serif" font-size="24" font-weight="700" fill="#FAF9F5" text-anchor="middle" letter-spacing="4">SUTRA ATELIER</text>
      <text x="205" y="185" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#D4A35A" text-anchor="middle" letter-spacing="2">LUXURY COLLECTION 2026</text>
      <text x="205" y="225" font-family="'Inter', sans-serif" font-size="10" fill="#CBD5E1" text-anchor="middle">Tradition Meets Modern Creative Technology</text>
      <rect x="130" y="250" width="150" height="32" rx="16" fill="#D4A35A"/>
      <text x="205" y="271" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#0F172A" text-anchor="middle">DISCOVER NOW</text>
    </g>

    <!-- Ad Action Bar & CTA -->
    <g transform="translate(35, 475)">
      <rect x="0" y="0" width="410" height="44" rx="22" fill="#5C3A1E"/>
      <text x="205" y="27" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="#FFFFFF" text-anchor="middle">Shop Collection — Limited Edition →</text>

      <text x="0" y="70" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#0F172A">4,892 likes</text>
      <text x="0" y="90" font-family="'Inter', sans-serif" font-size="11" fill="#475569"><tspan font-weight="700">sutrastudio.luxury</tspan> Elevate your brand perception with bespoke 4K creative direction.</text>
    </g>
  </g>
</svg>
`;

  await sharp(Buffer.from(metaAdsSvg))
    .webp({ quality: 95 })
    .toFile(path.join(SERVICES_DIR, 'meta-ads-launcher.webp'));
  console.log('✓ meta-ads-launcher.webp (Real Brand Promotion Meta Ad Campaign) generated');

  // -------------------------------------------------------------
  // 5. DIGITAL MARKETING: Brand Growth Strategy & Editorial Dossier
  // -------------------------------------------------------------
  const marketingSvg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mktBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF9F5"/>
      <stop offset="100%" stop-color="#F3ECE0"/>
    </linearGradient>
    <linearGradient id="goldBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#5C3A1E"/>
      <stop offset="100%" stop-color="#D4A35A"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#mktBg)"/>

  <!-- Top Editorial Header -->
  <g transform="translate(80, 60)">
    <rect x="0" y="0" width="1040" height="70" rx="16" fill="#FFFDF9" stroke="#EADFCB" stroke-width="1.5"/>
    <text x="30" y="42" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#0F172A" letter-spacing="1">BRAND MARKETING &amp; CONTENT STRATEGY DOSSIER</text>
    <text x="1010" y="42" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#8C6D32" text-anchor="end">30-DAY EDITORIAL CALENDAR</text>
  </g>

  <!-- 3 Strategic Deliverable Panels -->
  <!-- Panel 1: Viral Hooks & Trending Topics -->
  <g transform="translate(80, 160)">
    <rect x="0" y="0" width="325" height="520" rx="18" fill="#FFFDF9" stroke="#EADFCB" stroke-width="1.5"/>
    <rect x="0" y="0" width="325" height="8" rx="4" fill="#5C3A1E"/>
    
    <text x="25" y="45" font-family="'Inter', sans-serif" font-size="14" font-weight="800" fill="#5C3A1E">1. TREND DISCOVERY</text>
    <text x="25" y="65" font-family="'Inter', sans-serif" font-size="11" fill="#64748B">Algorithmic velocity &amp; viral angles</text>

    <g transform="translate(25, 100)">
      <rect x="0" y="0" width="275" height="75" rx="10" fill="#F8F5EF" stroke="#EADFCB" stroke-width="1"/>
      <text x="15" y="28" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#0F172A">Viral Hook Matrix (30 Angles)</text>
      <text x="15" y="48" font-family="'Inter', sans-serif" font-size="10" fill="#64748B">Platform-specific hooks for IG &amp; LinkedIn</text>
    </g>

    <g transform="translate(25, 195)">
      <rect x="0" y="0" width="275" height="75" rx="10" fill="#F8F5EF" stroke="#EADFCB" stroke-width="1"/>
      <text x="15" y="28" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#0F172A">Competitor Gap Intelligence</text>
      <text x="15" y="48" font-family="'Inter', sans-serif" font-size="10" fill="#64748B">Unanswered queries &amp; market blindspots</text>
    </g>

    <g transform="translate(25, 290)">
      <rect x="0" y="0" width="275" height="75" rx="10" fill="#F8F5EF" stroke="#EADFCB" stroke-width="1"/>
      <text x="15" y="28" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#0F172A">Trending Audio &amp; Sound Stacks</text>
      <text x="15" y="48" font-family="'Inter', sans-serif" font-size="10" fill="#64748B">Pre-cleared high-momentum audio</text>
    </g>

    <g transform="translate(25, 410)">
      <rect x="0" y="0" width="275" height="65" rx="12" fill="#FAF8F5" stroke="#D4A35A" stroke-width="1"/>
      <text x="137" y="38" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#5C3A1E" text-anchor="middle">DAILY RESEARCH SPRINT</text>
    </g>
  </g>

  <!-- Panel 2: 30-Day Editorial Content Calendar -->
  <g transform="translate(438, 160)">
    <rect x="0" y="0" width="325" height="520" rx="18" fill="#FFFDF9" stroke="#EADFCB" stroke-width="1.5"/>
    <rect x="0" y="0" width="325" height="8" rx="4" fill="#D4A35A"/>
    
    <text x="25" y="45" font-family="'Inter', sans-serif" font-size="14" font-weight="800" fill="#5C3A1E">2. EDITORIAL CALENDAR</text>
    <text x="25" y="65" font-family="'Inter', sans-serif" font-size="11" fill="#64748B">Structured 30-day publishing matrix</text>

    <!-- Mini Calendar Mockup -->
    <g transform="translate(25, 95)">
      <rect x="0" y="0" width="275" height="270" rx="10" fill="#F8F5EF" stroke="#EADFCB" stroke-width="1"/>
      <!-- Days header -->
      <text x="25" y="30" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#8C6D32">M</text>
      <text x="65" y="30" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#8C6D32">T</text>
      <text x="105" y="30" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#8C6D32">W</text>
      <text x="145" y="30" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#8C6D32">T</text>
      <text x="185" y="30" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#8C6D32">F</text>
      <text x="225" y="30" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#8C6D32">S</text>
      <line x1="15" y1="42" x2="260" y2="42" stroke="#EADFCB" stroke-width="1"/>
      
      <!-- Highlighted Days -->
      <circle cx="25" cy="70" r="14" fill="#5C3A1E"/>
      <text x="25" y="74" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">01</text>
      
      <circle cx="65" cy="70" r="14" fill="#D4A35A"/>
      <text x="65" y="74" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#0F172A" text-anchor="middle">02</text>

      <circle cx="105" cy="70" r="14" fill="#5C3A1E"/>
      <text x="105" y="74" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">03</text>

      <text x="20" y="130" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#0F172A">Daily Frequency: 1 Image + 1 Reel</text>
      <text x="20" y="155" font-family="'Inter', sans-serif" font-size="10" fill="#64748B">30 Unique Commercial Posts Scoped</text>
      <text x="20" y="180" font-family="'Inter', sans-serif" font-size="10" fill="#64748B">Full Copyright &amp; Audio Licenses</text>
      <text x="20" y="205" font-family="'Inter', sans-serif" font-size="10" fill="#64748B">Private Vault Delivery Daily</text>
    </g>

    <g transform="translate(25, 410)">
      <rect x="0" y="0" width="275" height="65" rx="12" fill="#FAF8F5" stroke="#D4A35A" stroke-width="1"/>
      <text x="137" y="38" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#5C3A1E" text-anchor="middle">NOTION &amp; SHEETS MATRIX</text>
    </g>
  </g>

  <!-- Panel 3: Creative Copy & Captions -->
  <g transform="translate(795, 160)">
    <rect x="0" y="0" width="325" height="520" rx="18" fill="#FFFDF9" stroke="#EADFCB" stroke-width="1.5"/>
    <rect x="0" y="0" width="325" height="8" rx="4" fill="#5C3A1E"/>
    
    <text x="25" y="45" font-family="'Inter', sans-serif" font-size="14" font-weight="800" fill="#5C3A1E">3. COPY &amp; HASHTAGS</text>
    <text x="25" y="65" font-family="'Inter', sans-serif" font-size="11" fill="#64748B">High-retention captions &amp; SEO tags</text>

    <g transform="translate(25, 100)">
      <rect x="0" y="0" width="275" height="75" rx="10" fill="#F8F5EF" stroke="#EADFCB" stroke-width="1"/>
      <text x="15" y="28" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#0F172A">Storytelling Captions (Long-Form)</text>
      <text x="15" y="48" font-family="'Inter', sans-serif" font-size="10" fill="#64748B">Bespoke luxury brand voice</text>
    </g>

    <g transform="translate(25, 195)">
      <rect x="0" y="0" width="275" height="75" rx="10" fill="#F8F5EF" stroke="#EADFCB" stroke-width="1"/>
      <text x="15" y="28" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#0F172A">Hashtag Clustering (3 Tiers)</text>
      <text x="15" y="48" font-family="'Inter', sans-serif" font-size="10" fill="#64748B">High, medium &amp; niche volume tags</text>
    </g>

    <g transform="translate(25, 290)">
      <rect x="0" y="0" width="275" height="75" rx="10" fill="#F8F5EF" stroke="#EADFCB" stroke-width="1"/>
      <text x="15" y="28" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#0F172A">Call-to-Action Variations</text>
      <text x="15" y="48" font-family="'Inter', sans-serif" font-size="10" fill="#64748B">Direct inquiry, save &amp; share triggers</text>
    </g>

    <g transform="translate(25, 410)">
      <rect x="0" y="0" width="275" height="65" rx="12" fill="#FAF8F5" stroke="#D4A35A" stroke-width="1"/>
      <text x="137" y="38" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#5C3A1E" text-anchor="middle">COMPLETE BRAND DOSSIER</text>
    </g>
  </g>
</svg>
`;

  await sharp(Buffer.from(marketingSvg))
    .webp({ quality: 95 })
    .toFile(path.join(SERVICES_DIR, 'digital-marketing.webp'));
  console.log('✓ digital-marketing.webp (Brand Growth Strategy Dossier) generated');

  // -------------------------------------------------------------
  // 6. WEBSITE DEVELOPMENT: High-End Web Platform Showcase
  // -------------------------------------------------------------
  const webDevSvg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="deskBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14110E"/>
      <stop offset="100%" stop-color="#241B13"/>
    </linearGradient>
    <filter id="monitorGlow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#deskBg)"/>

  <!-- Desktop Monitor Frame -->
  <g transform="translate(100, 60)" filter="url(#monitorGlow)">
    <!-- Monitor Outer Body -->
    <rect x="0" y="0" width="1000" height="580" rx="18" fill="#1C1917" stroke="#5C3A1E" stroke-width="3"/>
    <!-- Screen Glass -->
    <rect x="14" y="14" width="972" height="552" rx="10" fill="#FAF9F5"/>

    <!-- Browser Chrome Bar -->
    <rect x="14" y="14" width="972" height="38" rx="10" fill="#F4EFE6"/>
    <circle cx="36" cy="33" r="5" fill="#EF4444"/>
    <circle cx="52" cy="33" r="5" fill="#F59E0B"/>
    <circle cx="68" cy="33" r="5" fill="#10B981"/>
    
    <!-- Browser URL Bar -->
    <rect x="250" y="21" width="500" height="24" rx="12" fill="#FFFFFF" stroke="#E5DCCE" stroke-width="1"/>
    <text x="500" y="37" font-family="'Inter', sans-serif" font-size="11" font-weight="500" fill="#5C3A1E" text-anchor="middle">https://sutrastudios.in — Next.js 16 High-Performance Web Platform</text>

    <!-- Website Header Navigation -->
    <rect x="14" y="52" width="972" height="60" fill="#FFFDF9" stroke="#EADFCB" stroke-width="1"/>
    <g transform="translate(45, 67)">
      <circle cx="15" cy="15" r="14" fill="#5C3A1E"/>
      <text x="15" y="20" font-family="'Inter', sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">S</text>
      <text x="40" y="20" font-family="'Inter', sans-serif" font-size="14" font-weight="800" fill="#0F172A" letter-spacing="1.5">SUTRA STUDIO</text>
    </g>

    <g transform="translate(620, 67)">
      <text x="0" y="20" font-family="'Inter', sans-serif" font-size="12" font-weight="600" fill="#5C3A1E">Services</text>
      <text x="75" y="20" font-family="'Inter', sans-serif" font-size="12" font-weight="600" fill="#64748B">Portfolio</text>
      <text x="155" y="20" font-family="'Inter', sans-serif" font-size="12" font-weight="600" fill="#64748B">Pricing</text>
      <rect x="230" y="2" width="115" height="30" rx="15" fill="#5C3A1E"/>
      <text x="287" y="21" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle">Commission</text>
    </g>

    <!-- Website Hero Section Inside Screen -->
    <g transform="translate(60, 160)">
      <rect x="0" y="0" width="190" height="24" rx="12" fill="#F8F5EF" stroke="#EADFCB" stroke-width="1"/>
      <text x="95" y="16" font-family="'Inter', sans-serif" font-size="9" font-weight="700" fill="#5C3A1E" text-anchor="middle">IDEAS ◆ DESIGN ◆ TECH</text>

      <text x="0" y="65" font-family="'Cinzel', serif" font-size="34" font-weight="700" fill="#0F172A">Tradition Meets Modern</text>
      <text x="0" y="105" font-family="'Cinzel', serif" font-size="34" font-weight="700" fill="#5C3A1E">Creative Technology</text>
      
      <text x="0" y="135" font-family="'Inter', sans-serif" font-size="12" fill="#64748B">Bespoke 3D Spatial Design, Full-Stack Engineering &amp; Commercial Production.</text>

      <rect x="0" y="165" width="170" height="42" rx="21" fill="#5C3A1E"/>
      <text x="85" y="191" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#FFFFFF" text-anchor="middle">Start Your Project →</text>
    </g>

    <!-- Visual Card on Right of Screen -->
    <g transform="translate(560, 150)">
      <rect x="0" y="0" width="380" height="250" rx="18" fill="#F3ECE0" stroke="#D4A35A" stroke-width="1.5"/>
      <rect x="20" y="20" width="340" height="210" rx="12" fill="#171717"/>
      <circle cx="190" cy="125" r="50" fill="none" stroke="#D4A35A" stroke-width="2"/>
      <text x="190" y="130" font-family="'Inter', sans-serif" font-size="14" font-weight="700" fill="#FAF9F5" text-anchor="middle">4K LIVE ATELIER</text>
    </g>

    <!-- Bottom Metrics Strip -->
    <g transform="translate(60, 445)">
      <rect x="0" y="0" width="880" height="75" rx="14" fill="#FFFFFF" stroke="#EADFCB" stroke-width="1"/>
      <text x="35" y="32" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#8C6D32">LIGHTHOUSE SCORE</text>
      <text x="35" y="58" font-family="'Inter', sans-serif" font-size="20" font-weight="800" fill="#2E7D4F">100 / 100 PERFORMANCE</text>

      <text x="330" y="32" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#8C6D32">FRAMEWORK</text>
      <text x="330" y="58" font-family="'Inter', sans-serif" font-size="20" font-weight="800" fill="#0F172A">Next.js 16 + Tailwind</text>

      <text x="630" y="32" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#8C6D32">RESPONSIVE VIEWPORT</text>
      <text x="630" y="58" font-family="'Inter', sans-serif" font-size="20" font-weight="800" fill="#5C3A1E">Desktop, Tablet &amp; Mobile</text>
    </g>
  </g>

  <!-- Monitor Stand Base -->
  <g transform="translate(520, 640)">
    <rect x="0" y="0" width="160" height="40" rx="4" fill="#2D231A"/>
    <rect x="-40" y="40" width="240" height="15" rx="6" fill="#3D2814" stroke="#D4A35A" stroke-width="1"/>
  </g>
</svg>
`;

  await sharp(Buffer.from(webDevSvg))
    .webp({ quality: 95 })
    .toFile(path.join(SERVICES_DIR, 'website-development.webp'));
  console.log('✓ website-development.webp (High-End Web Platform Showcase) generated');

  // -------------------------------------------------------------
  // 7. WEB APPLICATION: SaaS Dashboard Interface
  // -------------------------------------------------------------
  const webAppSvg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="appBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#appBg)"/>

  <!-- Top App Navigation -->
  <rect x="0" y="0" width="${WIDTH}" height="55" fill="#0B1120" stroke="#334155" stroke-width="1"/>
  <g transform="translate(30, 16)">
    <circle cx="12" cy="12" r="12" fill="#D4A35A"/>
    <text x="12" y="16" font-family="'Inter', sans-serif" font-size="11" font-weight="900" fill="#0F172A" text-anchor="middle">S</text>
    <text x="36" y="16" font-family="'Inter', sans-serif" font-size="14" font-weight="800" fill="#FFFFFF" letter-spacing="1">SUTRA CLOUD PLATFORM // CLIENT VAULT</text>
  </g>

  <!-- Left Sidebar -->
  <g transform="translate(0, 55)">
    <rect x="0" y="0" width="230" height="695" fill="#0B1120" stroke="#1E293B" stroke-width="1"/>
    
    <g transform="translate(20, 30)">
      <rect x="0" y="0" width="190" height="36" rx="8" fill="#5C3A1E"/>
      <text x="15" y="23" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">◆ Project Dashboard</text>
    </g>
    <g transform="translate(20, 80)">
      <text x="15" y="23" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="#94A3B8">✦ 3D Spatial Renders</text>
    </g>
    <g transform="translate(20, 125)">
      <text x="15" y="23" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="#94A3B8">✦ 4K Media Deliverables</text>
    </g>
    <g transform="translate(20, 170)">
      <text x="15" y="23" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="#94A3B8">✦ Real-Time Analytics</text>
    </g>
    <g transform="translate(20, 215)">
      <text x="15" y="23" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="#94A3B8">✦ Google Drive Vault</text>
    </g>
  </g>

  <!-- Main Dashboard Content -->
  <!-- 3 Summary Stat Cards -->
  <g transform="translate(260, 85)">
    <rect x="0" y="0" width="280" height="110" rx="14" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <text x="20" y="32" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#D4A35A">ACTIVE COMMISSIONS</text>
    <text x="20" y="72" font-family="'Inter', sans-serif" font-size="32" font-weight="800" fill="#FFFFFF">12 Projects</text>
    <text x="20" y="94" font-family="'Inter', sans-serif" font-size="10" fill="#22C55E">● 100% On-Time Milestone SLA</text>
  </g>

  <g transform="translate(565, 85)">
    <rect x="0" y="0" width="280" height="110" rx="14" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <text x="20" y="32" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#D4A35A">DELIVERABLE ASSETS</text>
    <text x="20" y="72" font-family="'Inter', sans-serif" font-size="32" font-weight="800" fill="#FFFFFF">184 Files</text>
    <text x="20" y="94" font-family="'Inter', sans-serif" font-size="10" fill="#38BDF8">4K ProRes, TIFF &amp; glTF CAD</text>
  </g>

  <g transform="translate(870, 85)">
    <rect x="0" y="0" width="290" height="110" rx="14" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <text x="20" y="32" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#D4A35A">STORAGE PIPELINE</text>
    <text x="20" y="72" font-family="'Inter', sans-serif" font-size="32" font-weight="800" fill="#FFFFFF">1.42 TB</text>
    <text x="20" y="94" font-family="'Inter', sans-serif" font-size="10" fill="#A855F7">Encrypted Private Cloud</text>
  </g>

  <!-- Big Graph & Pipeline Card -->
  <g transform="translate(260, 220)">
    <rect x="0" y="0" width="900" height="490" rx="16" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <text x="30" y="40" font-family="'Inter', sans-serif" font-size="16" font-weight="700" fill="#FFFFFF">Creative Production Velocity &amp; Daily Rendertimes</text>

    <!-- Grid lines -->
    <line x1="30" y1="120" x2="870" y2="120" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
    <line x1="30" y1="200" x2="870" y2="200" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
    <line x1="30" y1="280" x2="870" y2="280" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
    <line x1="30" y1="360" x2="870" y2="360" stroke="#334155" stroke-width="1"/>

    <!-- Gold Analytics Curve -->
    <path d="M 50 340 Q 150 290 250 240 T 450 180 T 650 120 T 850 80" fill="none" stroke="#D4A35A" stroke-width="4"/>
    <path d="M 50 340 Q 150 290 250 240 T 450 180 T 650 120 T 850 80 L 850 360 L 50 360 Z" fill="#D4A35A" fill-opacity="0.12"/>

    <!-- Data points -->
    <circle cx="250" cy="240" r="6" fill="#5C3A1E" stroke="#D4A35A" stroke-width="2"/>
    <circle cx="450" cy="180" r="6" fill="#5C3A1E" stroke="#D4A35A" stroke-width="2"/>
    <circle cx="650" cy="120" r="6" fill="#5C3A1E" stroke="#D4A35A" stroke-width="2"/>
    <circle cx="850" cy="80" r="6" fill="#5C3A1E" stroke="#D4A35A" stroke-width="2"/>

    <text x="50" y="420" font-family="'Inter', sans-serif" font-size="12" fill="#94A3B8">Live WebSocket Stream • Firebase Firestore Synchronization • Zero Latency</text>
  </g>
</svg>
`;

  await sharp(Buffer.from(webAppSvg))
    .webp({ quality: 95 })
    .toFile(path.join(SERVICES_DIR, 'web-app-development.webp'));
  console.log('✓ web-app-development.webp (SaaS Dashboard Platform) generated');

  // -------------------------------------------------------------
  // 8. MOBILE APP SETUP: Luxury Mobile Experience
  // -------------------------------------------------------------
  const mobileAppSvg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mobBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#191512"/>
      <stop offset="100%" stop-color="#281E15"/>
    </linearGradient>
    <filter id="phoneShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#mobBg)"/>

  <!-- Left Side: Architectural App Features -->
  <g transform="translate(80, 100)">
    <rect x="0" y="0" width="130" height="26" rx="13" fill="#5C3A1E" stroke="#D4A35A" stroke-width="1"/>
    <text x="65" y="17" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">CROSS-PLATFORM</text>
    
    <text x="0" y="70" font-family="'Cinzel', serif" font-size="34" font-weight="700" fill="#FFFFFF">Mobile App Prototypes &amp;</text>
    <text x="0" y="115" font-family="'Cinzel', serif" font-size="34" font-weight="700" fill="#D4A35A">Engineering Architecture</text>
    
    <text x="0" y="160" font-family="'Inter', sans-serif" font-size="14" fill="#94A3B8" max-width="450">
      React Native &amp; Expo mobile platform engineering. Designed for ultra-smooth 60fps animations, native iOS gestures, and luxury commerce.
    </text>

    <g transform="translate(0, 220)">
      <rect x="0" y="0" width="200" height="70" rx="12" fill="#241B13" stroke="#5C3A1E" stroke-width="1"/>
      <text x="20" y="28" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#D4A35A">TOUCH QA</text>
      <text x="20" y="52" font-family="'Inter', sans-serif" font-size="16" font-weight="800" fill="#FFFFFF">44×44px Min Targets</text>

      <rect x="220" y="0" width="200" height="70" rx="12" fill="#241B13" stroke="#5C3A1E" stroke-width="1"/>
      <text x="240" y="28" font-family="'Inter', sans-serif" font-size="11" font-weight="600" fill="#D4A35A">FRAMEWORK</text>
      <text x="240" y="52" font-family="'Inter', sans-serif" font-size="16" font-weight="800" fill="#FFFFFF">React Native Expo</text>
    </g>
  </g>

  <!-- Right Side: Dual Sleek Smartphone Screens -->
  <g transform="translate(680, 70)" filter="url(#phoneShadow)">
    <!-- Main Center Phone -->
    <rect x="0" y="0" width="300" height="600" rx="40" fill="#171717" stroke="#5C3A1E" stroke-width="3"/>
    <rect x="10" y="10" width="280" height="580" rx="30" fill="#FAF9F5"/>

    <!-- Dynamic Island -->
    <rect x="95" y="20" width="90" height="24" rx="12" fill="#000000"/>

    <!-- App Screen Header -->
    <g transform="translate(25, 65)">
      <circle cx="14" cy="14" r="14" fill="#5C3A1E"/>
      <text x="14" y="19" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">S</text>
      <text x="36" y="19" font-family="'Inter', sans-serif" font-size="13" font-weight="800" fill="#0F172A">SUTRA ATELIER</text>
    </g>

    <!-- App Product Card -->
    <g transform="translate(25, 110)">
      <rect x="0" y="0" width="250" height="260" rx="16" fill="#F4EFE6" stroke="#EADFCB" stroke-width="1"/>
      <rect x="15" y="15" width="220" height="170" rx="10" fill="#1C1917"/>
      <circle cx="125" cy="100" r="35" fill="none" stroke="#D4A35A" stroke-width="2"/>
      <text x="125" y="105" font-family="'Inter', sans-serif" font-size="10" font-weight="700" fill="#FAF9F5" text-anchor="middle">3D SPATIAL</text>
      
      <text x="15" y="215" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#0F172A">Maison Elara Collection</text>
      <text x="15" y="235" font-family="'Inter', sans-serif" font-size="11" font-weight="800" fill="#5C3A1E">₹19,999</text>
    </g>

    <!-- Action Button -->
    <g transform="translate(25, 400)">
      <rect x="0" y="0" width="250" height="46" rx="23" fill="#5C3A1E"/>
      <text x="125" y="28" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#FFFFFF" text-anchor="middle">Commission Asset →</text>
    </g>

    <!-- Bottom Nav -->
    <g transform="translate(25, 520)">
      <rect x="0" y="0" width="250" height="45" rx="22" fill="#FFFDF9" stroke="#EADFCB" stroke-width="1"/>
      <circle cx="45" cy="22" r="6" fill="#5C3A1E"/>
      <circle cx="125" cy="22" r="6" fill="#D4A35A"/>
      <circle cx="205" cy="22" r="6" fill="#64748B"/>
    </g>
  </g>
</svg>
`;

  await sharp(Buffer.from(mobileAppSvg))
    .webp({ quality: 95 })
    .toFile(path.join(SERVICES_DIR, 'mobile-app-setup.webp'));
  console.log('✓ mobile-app-setup.webp (Mobile App Platform) generated');

  // -------------------------------------------------------------
  // 9. WINDOW DESIGN: Exterior Architectural Facade
  // -------------------------------------------------------------
  // Composite with proj-exterior.webp if available or create sleek facade
  const exteriorBase = await sharp(path.join(PROJECTS_DIR, 'proj-exterior.webp'))
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .toBuffer();

  const facadeOverlaySvg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="facadeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" stop-opacity="0.8"/>
      <stop offset="40%" stop-color="#0F172A" stop-opacity="0"/>
      <stop offset="100%" stop-color="#0F172A" stop-opacity="0.9"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#facadeGrad)"/>

  <!-- Top Architectural Badge -->
  <g transform="translate(40, 35)">
    <rect x="0" y="0" width="280" height="34" rx="17" fill="#0F172A" fill-opacity="0.9" stroke="#D4A35A" stroke-width="1"/>
    <text x="140" y="22" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#FAF9F5" text-anchor="middle">✦ ARCHITECTURAL FACADE 3D CGI</text>
  </g>

  <!-- Bottom Architectural Elevation Specs -->
  <g transform="translate(40, 620)">
    <rect x="0" y="0" width="1120" height="90" rx="16" fill="#0F172A" fill-opacity="0.9" stroke="#EADFCB" stroke-width="1"/>
    <text x="35" y="38" font-family="'Inter', sans-serif" font-size="18" font-weight="800" fill="#FFFFFF">Sutra Studio Atelier — Exterior Elevation &amp; Daylight Simulation</text>
    <text x="35" y="65" font-family="'Inter', sans-serif" font-size="12" fill="#D4A35A">Photorealistic Sandstone Facade, Brass Louvers &amp; Warm Twilight Illumination</text>
    <text x="1085" y="52" font-family="'Inter', sans-serif" font-size="12" font-weight="700" fill="#4ADE80" text-anchor="end">4K UHD CGI PASS</text>
  </g>
</svg>
`;

  await sharp(exteriorBase)
    .composite([{ input: Buffer.from(facadeOverlaySvg), top: 0, left: 0 }])
    .webp({ quality: 95 })
    .toFile(path.join(SERVICES_DIR, 'window-design.webp'));
  console.log('✓ window-design.webp (Architectural Exterior Facade) generated');

  // -------------------------------------------------------------
  // 10. WORKFLOW AUTOMATION: Automated Creative Pipeline
  // -------------------------------------------------------------
  const automationSvg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="autoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
    <linearGradient id="goldConn" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#D4A35A"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#autoBg)"/>

  <!-- Top Title -->
  <g transform="translate(60, 50)">
    <text x="0" y="30" font-family="'Inter', sans-serif" font-size="22" font-weight="800" fill="#FFFFFF" letter-spacing="1">INTERNAL STUDIO CREATIVE PIPELINE ENGINE</text>
    <text x="0" y="55" font-family="'Inter', sans-serif" font-size="13" fill="#94A3B8">Automated Ingestion, Prompt Architecture, PBR Material Pass &amp; Vault Sync</text>
  </g>

  <!-- Node Workflow Graph -->
  <!-- Node 1: Client Intake -->
  <g transform="translate(80, 220)">
    <rect x="0" y="0" width="200" height="120" rx="14" fill="#1E293B" stroke="#D4A35A" stroke-width="2"/>
    <text x="20" y="35" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#D4A35A">NODE 01</text>
    <text x="20" y="65" font-family="'Inter', sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">Client Intake</text>
    <text x="20" y="90" font-family="'Inter', sans-serif" font-size="10" fill="#94A3B8">Brief, Assets &amp; Specs</text>
  </g>

  <!-- Connection 1 -> 2 -->
  <line x1="280" y1="280" x2="360" y2="280" stroke="#D4A35A" stroke-width="3" stroke-dasharray="6,4"/>

  <!-- Node 2: AI Knowledge RAG -->
  <g transform="translate(360, 220)">
    <rect x="0" y="0" width="200" height="120" rx="14" fill="#1E293B" stroke="#D4A35A" stroke-width="2"/>
    <text x="20" y="35" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#D4A35A">NODE 02</text>
    <text x="20" y="65" font-family="'Inter', sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">Knowledge RAG</text>
    <text x="20" y="90" font-family="'Inter', sans-serif" font-size="10" fill="#94A3B8">Brand Guidelines &amp; Voice</text>
  </g>

  <!-- Connection 2 -> 3 -->
  <line x1="560" y1="280" x2="640" y2="280" stroke="#D4A35A" stroke-width="3" stroke-dasharray="6,4"/>

  <!-- Node 3: 4K Master Render Engine -->
  <g transform="translate(640, 220)">
    <rect x="0" y="0" width="200" height="120" rx="14" fill="#5C3A1E" stroke="#F0D194" stroke-width="2.5"/>
    <text x="20" y="35" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#F0D194">NODE 03</text>
    <text x="20" y="65" font-family="'Inter', sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">4K Render Engine</text>
    <text x="20" y="90" font-family="'Inter', sans-serif" font-size="10" fill="#FDE68A">Visuals, Video &amp; 3D</text>
  </g>

  <!-- Connection 3 -> 4 -->
  <line x1="840" y1="280" x2="920" y2="280" stroke="#D4A35A" stroke-width="3" stroke-dasharray="6,4"/>

  <!-- Node 4: Private Drive Vault -->
  <g transform="translate(920, 220)">
    <rect x="0" y="0" width="200" height="120" rx="14" fill="#1E293B" stroke="#4ADE80" stroke-width="2"/>
    <text x="20" y="35" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#4ADE80">NODE 04</text>
    <text x="20" y="65" font-family="'Inter', sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">Google Drive Vault</text>
    <text x="20" y="90" font-family="'Inter', sans-serif" font-size="10" fill="#94A3B8">Structured Client Folders</text>
  </g>

  <!-- Bottom Pipeline Status Card -->
  <g transform="translate(60, 480)">
    <rect x="0" y="0" width="1080" height="180" rx="18" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <text x="35" y="45" font-family="'Inter', sans-serif" font-size="15" font-weight="700" fill="#FFFFFF">Pipeline Architecture Guardrails</text>
    
    <g transform="translate(35, 75)">
      <text x="0" y="15" font-family="'Inter', sans-serif" font-size="12" fill="#94A3B8">✦ Zero Cloud Leaks: Service credentials strictly encapsulated on server</text>
      <text x="0" y="45" font-family="'Inter', sans-serif" font-size="12" fill="#94A3B8">✦ Human Art Director Verification on 100% of generated deliverables</text>
      <text x="0" y="75" font-family="'Inter', sans-serif" font-size="12" fill="#94A3B8">✦ Automated Webhook Notifications sent to client email &amp; dashboard</text>
    </g>
  </g>
</svg>
`;

  await sharp(Buffer.from(automationSvg))
    .webp({ quality: 95 })
    .toFile(path.join(SERVICES_DIR, 'workflow-automation.webp'));
  console.log('✓ workflow-automation.webp (Creative Pipeline Engine) generated');

  console.log('All 12 studio service images generated successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
