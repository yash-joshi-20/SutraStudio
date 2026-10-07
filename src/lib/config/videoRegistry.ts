/**
 * SUTRA STUDIO — Master Video Registry & Configuration
 * 
 * Central registry for all public website and PWA video assets.
 * Following Brand Prompt Pack:
 * - Palette: #5C3A1E (Deep Teak), #D4A35A (Warm Saffron / Muted Gold), #0F172A (Charcoal Slate), #F8F5EF (Warm Ivory Base), #FFFDF9 (Parchment Card)
 * - Vibe: Warm, premium, calm, sacred Indian-inspired creative technology.
 * - Format: MP4 (H.264) + WebM (VP9/VP8) + WebP Poster.
 * - Storage: Local / Free CDN in `public/videos/` (never Google Drive hotlinks).
 */

export interface VideoAssetConfig {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'hero' | 'studio' | 'app' | 'service';
  aspectRatio: '16/9' | '9/16' | '4/5' | '1/1';
  durationSeconds: number;
  isSilentLoop: boolean;
  promptUsed: string;
  desktop: {
    mp4: string;
    webm: string;
    width: number;
    height: number;
  };
  mobile: {
    mp4: string;
    webm: string;
    width: number;
    height: number;
  };
  poster: {
    webp: string;
    width: number;
    height: number;
  };
  transcript?: string;
  captions?: Array<{ start: number; end: number; text: string }>;
  tags: string[];
}

export const SUTRA_VIDEO_REGISTRY: Record<string, VideoAssetConfig> = {
  // 1. Home Hero Ambient Loop
  'hero-showcase': {
    id: 'hero-showcase',
    title: 'Sutra Studio Flagship Ambient Loop',
    subtitle: 'Tradition Meets Autonomous Technology',
    description: 'Seamless silent ambient loop showcasing sacred geometric particle kinetics, warm travertine architecture, and gentle golden light diffusion.',
    category: 'hero',
    aspectRatio: '16/9',
    durationSeconds: 8,
    isSilentLoop: true,
    promptUsed: 'Cinematic 4K architectural interior, warm travertine stone, muted brass accents (#D4A35A), sacred geometric lotus light projections (#5C3A1E), ambient dust motes in soft golden sunlight, calm luxury atelier aesthetic, seamless loop, 60fps, no camera shake.',
    desktop: {
      mp4: '/videos/hero/hero-desktop.mp4',
      webm: '/videos/hero/hero-desktop.webm',
      width: 1280,
      height: 720,
    },
    mobile: {
      mp4: '/videos/hero/hero-mobile.mp4',
      webm: '/videos/hero/hero-mobile.webm',
      width: 720,
      height: 1280,
    },
    poster: {
      webp: '/videos/hero/hero-poster.webp',
      width: 1280,
      height: 720,
    },
    tags: ['hero', 'ambient', 'sacred-geometry', 'luxury-architecture'],
  },

  // 2. Studio & Craftsmanship Reel
  'studio-reel': {
    id: 'studio-reel',
    title: 'Craftsmanship & Spatial Philosophy Reel',
    subtitle: 'Bridging Indian Aesthetic Doctrines with AI Engineering',
    description: 'Cinematic tour through our creative synthesis laboratory, exploring proportion (Pramana), emotional resonance (Rasa), and algorithmic precision (Yantra).',
    category: 'studio',
    aspectRatio: '16/9',
    durationSeconds: 10,
    isSilentLoop: false,
    promptUsed: 'Sutra Studio craftsmanship documentary reel, golden ratio proportions, architectural blueprints merging into photorealistic 3D spatial renders, warm teak wood, calm refined editorial lighting, sacred geometry overlays.',
    desktop: {
      mp4: '/videos/studio/studio-reel-desktop.mp4',
      webm: '/videos/studio/studio-reel-desktop.webm',
      width: 1280,
      height: 720,
    },
    mobile: {
      mp4: '/videos/studio/studio-reel-mobile.mp4',
      webm: '/videos/studio/studio-reel-mobile.webm',
      width: 720,
      height: 1280,
    },
    poster: {
      webp: '/videos/studio/studio-poster.webp',
      width: 1280,
      height: 720,
    },
    transcript: 'Sutra connects classical Indian artistic heritage with state-of-the-art generative intelligence. Every frame is balanced with mathematical symmetry and tactile warmth.',
    captions: [
      { start: 0, end: 3.5, text: 'Sutra: The thread connecting classical artistic heritage...' },
      { start: 3.5, end: 7.0, text: '...with state-of-the-art generative intelligence.' },
      { start: 7.0, end: 10.0, text: 'Harmonizing sacred proportions with computational precision.' },
    ],
    tags: ['showreel', 'craftsmanship', 'philosophy', 'spatial-design'],
  },

  // 3. Mobile App & PWA Interactive Demo
  'app-demo': {
    id: 'app-demo',
    title: 'Mobile Client Command Hub Interactive Demo',
    subtitle: 'Bespoke Studio in Your Pocket',
    description: 'Interactive walkthrough demonstrating 1-click deliverable approvals, real-time AI studio chat, and secure Sutra Cloud Vault media streaming on iOS and Android.',
    category: 'app',
    aspectRatio: '16/9',
    durationSeconds: 8,
    isSilentLoop: true,
    promptUsed: 'Sutra Studio mobile app on iPhone 15 Pro titanium frame, warm ivory UI (#FAF9F5), instant 1-click deliverable approval animation, audio soundwave AI assistant visualizer, clean touch gestures, 60fps.',
    desktop: {
      mp4: '/videos/app/app-demo-desktop.mp4',
      webm: '/videos/app/app-demo-desktop.webm',
      width: 1280,
      height: 720,
    },
    mobile: {
      mp4: '/videos/app/app-demo-mobile.mp4',
      webm: '/videos/app/app-demo-mobile.webm',
      width: 720,
      height: 1280,
    },
    poster: {
      webp: '/videos/app/app-demo-poster.webp',
      width: 1280,
      height: 720,
    },
    tags: ['pwa', 'mobile-app', 'client-portal', 'approvals'],
  },

  // 4. 3D Spatial Architecture Teaser (Services Highlight)
  'service-spatial-3d': {
    id: 'service-spatial-3d',
    title: '3D Spatial Modeling & Interactive Environments',
    subtitle: 'Photorealistic Architectural Visualizations',
    description: 'Real-time spatial visualization showcasing luxury residential travertine pavilions, warm interior lighting, and interactive 360-degree orbit passes.',
    category: 'service',
    aspectRatio: '16/9',
    durationSeconds: 8,
    isSilentLoop: true,
    promptUsed: 'Photorealistic 3D architectural render of a luxury courtyard with lotus reflecting pool, teak wood pergolas, brass floor lamps, warm afternoon sunlight, smooth camera orbit.',
    desktop: {
      mp4: '/videos/services/spatial-3d-desktop.mp4',
      webm: '/videos/services/spatial-3d-desktop.webm',
      width: 1280,
      height: 720,
    },
    mobile: {
      mp4: '/videos/services/spatial-3d-mobile.mp4',
      webm: '/videos/services/spatial-3d-mobile.webm',
      width: 720,
      height: 1280,
    },
    poster: {
      webp: '/videos/services/spatial-3d-poster.webp',
      width: 1280,
      height: 720,
    },
    tags: ['services', '3d-modeling', 'spatial-architecture', 'vr-360'],
  },

  // 5. Generative AI Video Production Teaser (Services Highlight)
  'service-ai-video': {
    id: 'service-ai-video',
    title: 'Cinematic Visual & Motion Generation',
    subtitle: 'Diffusion Pipelines & High-Impact Brand Reels',
    description: 'High-definition 4K brand reel featuring generative fluid dynamics, silk textile motion, and saffron gold radiance for luxury marketing campaigns.',
    category: 'service',
    aspectRatio: '16/9',
    durationSeconds: 8,
    isSilentLoop: true,
    promptUsed: 'Flowing silk fabric in deep brown (#5C3A1E) and radiant gold (#D4A35A), floating weightlessly in slow motion, soft golden particle illumination, macro cinematography.',
    desktop: {
      mp4: '/videos/services/ai-video-desktop.mp4',
      webm: '/videos/services/ai-video-desktop.webm',
      width: 1280,
      height: 720,
    },
    mobile: {
      mp4: '/videos/services/ai-video-mobile.mp4',
      webm: '/videos/services/ai-video-mobile.webm',
      width: 720,
      height: 1280,
    },
    poster: {
      webp: '/videos/services/ai-video-poster.webp',
      width: 1280,
      height: 720,
    },
    tags: ['services', 'video-creation', 'generative-ai', 'motion-design'],
  },
};

/**
 * Helper to get a video config by ID with fallback
 */
export function getVideoConfig(id: string): VideoAssetConfig {
  return SUTRA_VIDEO_REGISTRY[id] || SUTRA_VIDEO_REGISTRY['hero-showcase'];
}
