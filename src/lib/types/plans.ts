/**
 * SUTRA STUDIO — Monthly Plans & Package Types
 * Data contracts for client subscription tiers, allowances, and usage tracking.
 */

export interface ServiceQuota {
  serviceId: string;
  serviceName: string;
  monthlyAllowance: number; // e.g. 10 (images), 4 (videos) - TO BE CONFIRMED
  unitLabel: string; // e.g. "Renders", "Reels", "Models"
}

export interface MonthlyPlan {
  id: string;
  name: string;
  tagline: string;
  priceMonthlyINR: number;
  priceFormattedINR: string;
  isPopular?: boolean;
  quotas: ServiceQuota[];
  features: string[];
  ctaLabel: string;
}

export interface ClientSubscription {
  planId: string;
  planName: string;
  status: 'active' | 'past_due' | 'canceled' | 'trial';
  renewalDate: string; // ISO format or formatted string
  currentPeriodStart: string;
  currentPeriodEnd: string;
  usage: Record<string, { used: number; total: number }>;
}

export const SEEDED_MONTHLY_PLANS: MonthlyPlan[] = [
  {
    id: 'starter',
    name: 'Starter Creative Pack',
    tagline: 'Ideal for emerging boutique brands requiring foundational 4K creative assets',
    priceMonthlyINR: 9999,
    priceFormattedINR: '₹9,999',
    quotas: [
      { serviceId: 'image', serviceName: 'Image Creation', monthlyAllowance: 5, unitLabel: '4K Renders' },
      { serviceId: 'marketing', serviceName: 'Digital Marketing Creatives', monthlyAllowance: 5, unitLabel: 'Ad Visuals' },
      { serviceId: 'video', serviceName: 'Video Creation', monthlyAllowance: 1, unitLabel: 'Motion Reel' },
    ],
    features: [
      '5 Master 4K Key Visuals / Month',
      '1 Motion Graphic Reel with Audio',
      'Private Google Drive Vault Archive',
      'Expiring Revocable Deliverable Links',
      'Standard 48-Hour Turnaround SLA',
      'Sutra AI 24/7 Creative Assistant',
    ],
    ctaLabel: 'Subscribe to Starter',
  },
  {
    id: 'growth',
    name: 'Growth Creative Studio',
    tagline: 'Comprehensive omni-channel production for scaling digital businesses',
    priceMonthlyINR: 24999,
    priceFormattedINR: '₹24,999',
    isPopular: true,
    quotas: [
      { serviceId: 'image', serviceName: 'Image Creation', monthlyAllowance: 15, unitLabel: '4K Renders' },
      { serviceId: 'video', serviceName: 'Video Creation', monthlyAllowance: 4, unitLabel: 'Reels / Ads' },
      { serviceId: 'three-d', serviceName: '3D Spatial Modeling', monthlyAllowance: 2, unitLabel: 'GLTF Assets' },
      { serviceId: 'meta-ads', serviceName: 'Meta Ads Launcher', monthlyAllowance: 2, unitLabel: 'Campaigns' },
    ],
    features: [
      '15 Master 4K Key Visuals / Month',
      '4 Motion Commercial Reels with Audio',
      '2 Interactive 3D Spatial Renders',
      'Meta Ads Campaign Launcher Integration',
      'Dedicated Art Director Supervision',
      'Priority 24-Hour Production SLA',
    ],
    ctaLabel: 'Subscribe to Growth',
  },
  {
    id: 'enterprise',
    name: 'Atelier Enterprise Retainer',
    tagline: 'Full-service bespoke digital atelier and custom technology development',
    priceMonthlyINR: 59999,
    priceFormattedINR: '₹59,999',
    quotas: [
      { serviceId: 'image', serviceName: 'Image Creation', monthlyAllowance: 40, unitLabel: '4K Renders' },
      { serviceId: 'video', serviceName: 'Video Creation', monthlyAllowance: 12, unitLabel: 'Reels' },
      { serviceId: 'three-sixty', serviceName: '360 Virtual Tour', monthlyAllowance: 2, unitLabel: 'VR Tours' },
      { serviceId: 'website', serviceName: 'Website / App Setup', monthlyAllowance: 1, unitLabel: 'Project' },
    ],
    features: [
      'Unlimited High-Res Creative Revisions',
      'Bespoke 360 Virtual Interactive Tours',
      'Custom Web App Platform Development',
      'Full Meta Ads Suite & Audience Sync',
      'Executive Producer 1-on-1 Direct Access',
      'Immediate Priority Turnaround SLA',
    ],
    ctaLabel: 'Commission Atelier Retainer',
  },
];
