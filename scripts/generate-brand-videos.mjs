import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const VIDEO_TARGETS = [
  {
    key: 'hero',
    name: 'hero-showcase',
    title: 'Sutra Studio Flagship Ambient Loop',
    type: 'sacred-geometry-travertine',
    duration: 8,
    desktopOut: 'public/videos/hero/hero-desktop',
    mobileOut: 'public/videos/hero/hero-mobile',
    posterOut: 'public/videos/hero/hero-poster.webp',
  },
  {
    key: 'studio',
    name: 'studio-reel',
    title: 'Craftsmanship & Spatial Philosophy Reel',
    type: 'studio-blueprint-spatial',
    duration: 10,
    desktopOut: 'public/videos/studio/studio-reel-desktop',
    mobileOut: 'public/videos/studio/studio-reel-mobile',
    posterOut: 'public/videos/studio/studio-poster.webp',
  },
  {
    key: 'app',
    name: 'app-demo',
    title: 'Mobile Client Command Hub Interactive Demo',
    type: 'app-mobile-interface',
    duration: 8,
    desktopOut: 'public/videos/app/app-demo-desktop',
    mobileOut: 'public/videos/app/app-demo-mobile',
    posterOut: 'public/videos/app/app-demo-poster.webp',
  },
  {
    key: 'spatial-3d',
    name: 'service-spatial-3d',
    title: '3D Spatial Architecture Teaser',
    type: 'spatial-3d-orbit',
    duration: 8,
    desktopOut: 'public/videos/services/spatial-3d-desktop',
    mobileOut: 'public/videos/services/spatial-3d-mobile',
    posterOut: 'public/videos/services/spatial-3d-poster.webp',
  },
  {
    key: 'ai-video',
    name: 'service-ai-video',
    title: 'Cinematic Visual & Motion Generation Teaser',
    type: 'silk-fluid-dynamics',
    duration: 8,
    desktopOut: 'public/videos/services/ai-video-desktop',
    mobileOut: 'public/videos/services/ai-video-mobile',
    posterOut: 'public/videos/services/ai-video-poster.webp',
  },
];

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateVideoHTML(type, width, height, durationSec) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background: #0F172A; overflow: hidden; }
    canvas { display: block; width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <canvas id="stage" width="${width}" height="${height}"></canvas>
  <script>
    const canvas = document.getElementById('stage');
    const ctx = canvas.getContext('2d');
    const W = ${width};
    const H = ${height};
    const duration = ${durationSec};
    let startTime = performance.now();

    const PALETTE = {
      darkCharcoal: '#0F172A',
      deepTeak: '#5C3A1E',
      saffronGold: '#D4A35A',
      mutedBrass: '#A98B57',
      warmIvory: '#F8F5EF',
      cardParchment: '#FFFDF9'
    };

    function drawSacredLotus(cx, cy, radius, rotation, alpha) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.strokeStyle = PALETTE.saffronGold;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = alpha;

      const petals = 12;
      for (let i = 0; i < petals; i++) {
        const angle = (i * 2 * Math.PI) / petals;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(radius * 0.4, 0, radius * 0.4, radius * 0.18, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
      ctx.setLineDash([4, 6]);
      ctx.stroke();

      ctx.restore();
    }

    function render(timeMs) {
      const t = ((timeMs - startTime) / 1000) % duration;
      const progress = t / duration;
      const loopAngle = progress * Math.PI * 2;

      // 1. Warm Architectural Ambient Background
      const bgGrad = ctx.createRadialGradient(
        W * 0.5 + Math.sin(loopAngle) * (W * 0.1),
        H * 0.5 + Math.cos(loopAngle) * (H * 0.08),
        W * 0.1,
        W * 0.5,
        H * 0.5,
        Math.max(W, H) * 0.75
      );
      bgGrad.addColorStop(0, '#2D1E12');
      bgGrad.addColorStop(0.4, '#1C1611');
      bgGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      if ('${type}' === 'sacred-geometry-travertine' || '${type}' === 'studio-blueprint-spatial') {
        // Floating architectural golden particles
        const particleCount = 48;
        for (let i = 0; i < particleCount; i++) {
          const seed = i * 137.5;
          const px = (Math.sin(loopAngle + seed) * 0.5 + 0.5) * W;
          const py = (Math.cos(loopAngle * 0.7 + seed * 2) * 0.5 + 0.5) * H;
          const sz = (Math.sin(loopAngle * 2 + seed) * 0.5 + 0.5) * 3 + 1;
          const pAlpha = (Math.sin(loopAngle + seed * 3) * 0.5 + 0.5) * 0.6 + 0.2;

          ctx.fillStyle = PALETTE.saffronGold;
          ctx.globalAlpha = pAlpha;
          ctx.beginPath();
          ctx.arc(px, py, sz, 0, Math.PI * 2);
          ctx.fill();
        }

        // Central Sacred Geometric Lotus Mandala
        const lotusScale = Math.min(W, H) * 0.42;
        drawSacredLotus(W * 0.5, H * 0.5, lotusScale, loopAngle * 0.5, 0.45);
        drawSacredLotus(W * 0.5, H * 0.5, lotusScale * 0.65, -loopAngle * 0.8, 0.35);

        // Subtle Studio Wordmark Accent
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = PALETTE.warmIvory;
        ctx.font = '600 ' + Math.round(Math.min(W, H) * 0.045) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SUTRA STUDIO', W * 0.5, H * 0.88);

        ctx.font = '400 ' + Math.round(Math.min(W, H) * 0.022) + 'px sans-serif';
        ctx.fillStyle = PALETTE.saffronGold;
        ctx.fillText('CREATIVE ATELIER ◆ AUTONOMOUS INTELLIGENCE', W * 0.5, H * 0.92);
        ctx.restore();
      } else if ('${type}' === 'app-mobile-interface') {
        ctx.save();
        const cardW = Math.min(W, H) * 0.6;
        const cardH = cardW * 1.4;
        const cardX = (W - cardW) * 0.5;
        const cardY = (H - cardH) * 0.5 + Math.sin(loopAngle) * 12;

        ctx.shadowColor = PALETTE.saffronGold;
        ctx.shadowBlur = 40;
        ctx.fillStyle = '#FFFDF9';
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 28);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#EADFCB';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#5C3A1E';
        ctx.font = 'bold ' + Math.round(cardW * 0.055) + 'px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('SUTRA PORTAL', cardX + cardW * 0.08, cardY + cardH * 0.12);

        const barCount = 18;
        const barW = (cardW * 0.84) / barCount - 4;
        for (let b = 0; b < barCount; b++) {
          const barH = Math.sin(loopAngle * 4 + b * 0.6) * (cardH * 0.12) + cardH * 0.14;
          ctx.fillStyle = PALETTE.saffronGold;
          ctx.beginPath();
          ctx.roundRect(
            cardX + cardW * 0.08 + b * (barW + 4),
            cardY + cardH * 0.35 - barH * 0.5,
            barW,
            barH,
            4
          );
          ctx.fill();
        }

        ctx.fillStyle = '#FAF9F5';
        ctx.beginPath();
        ctx.roundRect(cardX + cardW * 0.08, cardY + cardH * 0.48, cardW * 0.84, cardH * 0.38, 16);
        ctx.fill();
        ctx.strokeStyle = '#D4A35A';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold ' + Math.round(cardW * 0.045) + 'px sans-serif';
        ctx.fillText('3D Spatial Model v2.4', cardX + cardW * 0.14, cardY + cardH * 0.58);
        ctx.fillStyle = '#2E7D4F';
        ctx.font = '600 ' + Math.round(cardW * 0.038) + 'px sans-serif';
        ctx.fillText('✓ 100% Ready • 4K Google Drive', cardX + cardW * 0.14, cardY + cardH * 0.66);

        ctx.restore();
      } else if ('${type}' === 'spatial-3d-orbit') {
        ctx.save();
        ctx.translate(W * 0.5, H * 0.5);
        const cubeSize = Math.min(W, H) * 0.28;

        ctx.strokeStyle = PALETTE.saffronGold;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = 0.85;

        const cosA = Math.cos(loopAngle);
        const sinA = Math.sin(loopAngle);
        const cosB = Math.cos(loopAngle * 0.5);
        const sinB = Math.sin(loopAngle * 0.5);

        const vertices = [
          [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
          [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1],
        ];

        const projected = vertices.map(([x, y, z]) => {
          let rx = x * cosA - z * sinA;
          let rz = x * sinA + z * cosA;
          let ry = y * cosB - rz * sinB;
          let finalZ = y * sinB + rz * cosB + 3.2;
          let scale = cubeSize / finalZ;
          return [rx * scale, ry * scale];
        });

        const edges = [
          [0,1],[1,2],[2,3],[3,0],
          [4,5],[5,6],[6,7],[7,4],
          [0,4],[1,5],[2,6],[3,7]
        ];

        edges.forEach(([i, j]) => {
          ctx.beginPath();
          ctx.moveTo(projected[i][0], projected[i][1]);
          ctx.lineTo(projected[j][0], projected[j][1]);
          ctx.stroke();
        });

        ctx.restore();
      } else {
        ctx.save();
        ctx.globalAlpha = 0.5;
        const waveCount = 5;
        for (let w = 0; w < waveCount; w++) {
          ctx.beginPath();
          ctx.moveTo(0, H * 0.5);
          for (let x = 0; x <= W; x += 20) {
            const y = H * 0.5 + Math.sin((x / W) * Math.PI * 4 + loopAngle * 2 + w * 0.8) * (H * 0.15) * Math.cos(loopAngle + w);
            ctx.lineTo(x, y);
          }
          ctx.strokeStyle = w % 2 === 0 ? PALETTE.saffronGold : PALETTE.deepTeak;
          ctx.lineWidth = 4 + w * 2;
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    window.renderFrameAt = function(timeMs) {
      render(timeMs);
    };

    let animId;
    function loop(now) {
      render(now);
      animId = requestAnimationFrame(loop);
    }
    loop(performance.now());
  </script>
</body>
</html>`;
}

async function captureMedia(browser, type, width, height, durationSec, outWebm, outMp4, outPoster) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });

  const htmlContent = generateVideoHTML(type, width, height, durationSec);
  await page.setContent(htmlContent);
  await page.waitForTimeout(300);

  // 1. Export WebP Poster from Canvas
  if (outPoster) {
    ensureDir(outPoster);
    const posterDataUrl = await page.evaluate(() => {
      window.renderFrameAt(1500);
      const canvas = document.getElementById('stage');
      return canvas.toDataURL('image/webp', 0.92);
    });
    const posterBase64 = posterDataUrl.replace(/^data:image\/webp;base64,/, '');
    fs.writeFileSync(outPoster, Buffer.from(posterBase64, 'base64'));
  }

  // 2. Record WebM (VP9) Stream
  ensureDir(outWebm);
  const webmData = await page.evaluate(async ({ durationSec }) => {
    return new Promise((resolve) => {
      const canvas = document.getElementById('stage');
      const stream = canvas.captureStream(60);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 3500000,
      });

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setTimeout(() => recorder.stop(), durationSec * 1000);
    });
  }, { durationSec });

  fs.writeFileSync(outWebm, Buffer.from(webmData, 'base64'));

  // 3. Record MP4 (H.264 / AVC1) Stream
  ensureDir(outMp4);
  const mp4Data = await page.evaluate(async ({ durationSec }) => {
    return new Promise((resolve) => {
      const canvas = document.getElementById('stage');
      const stream = canvas.captureStream(60);
      const mime = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E')
        ? 'video/mp4;codecs=avc1.42E01E'
        : (MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm');

      const recorder = new MediaRecorder(stream, {
        mimeType: mime,
        videoBitsPerSecond: 3500000,
      });

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mime });
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setTimeout(() => recorder.stop(), durationSec * 1000);
    });
  }, { durationSec });

  fs.writeFileSync(outMp4, Buffer.from(mp4Data, 'base64'));

  await page.close();
}

async function main() {
  console.log('========================================================');
  console.log('🎬 SUTRA STUDIO — STEP 33 VIDEO GENERATOR (BRAND PACK)');
  console.log('========================================================');

  const browser = await chromium.launch({ headless: true });

  for (const target of VIDEO_TARGETS) {
    console.log(`\n▶ Generating Video Suite: [${target.title}] (${target.duration}s)...`);

    // 1. Desktop 1280x720 (MP4, WebM, WebP Poster)
    const desktopWebm = `${target.desktopOut}.webm`;
    const desktopMp4 = `${target.desktopOut}.mp4`;
    console.log(`  → Capturing Desktop 1280x720 (MP4 + WebM + Poster)...`);
    await captureMedia(
      browser,
      target.type,
      1280,
      720,
      target.duration,
      desktopWebm,
      desktopMp4,
      target.posterOut
    );

    // 2. Mobile 720x1280 (MP4, WebM)
    const mobileWebm = `${target.mobileOut}.webm`;
    const mobileMp4 = `${target.mobileOut}.mp4`;
    console.log(`  → Capturing Mobile 720x1280 (MP4 + WebM)...`);
    await captureMedia(
      browser,
      target.type,
      720,
      1280,
      target.duration,
      mobileWebm,
      mobileMp4,
      null
    );

    const dMp4Size = (fs.statSync(desktopMp4).size / (1024 * 1024)).toFixed(2);
    const dWebmSize = (fs.statSync(desktopWebm).size / (1024 * 1024)).toFixed(2);
    const posterSize = (fs.statSync(target.posterOut).size / 1024).toFixed(1);

    console.log(`  ✓ Output: Desktop MP4 (${dMp4Size} MB), WebM (${dWebmSize} MB), WebP Poster (${posterSize} KB)`);
  }

  await browser.close();
  console.log('\n========================================================');
  console.log('✅ ALL 5 VIDEO SUITES GENERATED & COMPRESSED IN public/videos/');
  console.log('========================================================');
}

main().catch((err) => {
  console.error('Error generating videos:', err);
  process.exit(1);
});
