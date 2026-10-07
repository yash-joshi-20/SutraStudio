/**
 * SUTRA STUDIO — Monthly Plans & Package Types
 * Data contracts for client subscription tiers, allowances, and usage tracking.
 */

export interface ServiceQuota {
  serviceId: string;
  serviceName: string;
  monthlyAllowance: number;
  unitLabel: string;
}

export interface MonthlyPlan {
  id: string;
  name: string;
  tagline: string;
  priceMonthlyINR: number;
  priceFormattedINR: string;
  turnaround?: string;
  isPopular?: boolean;
  quotas: ServiceQuota[];
  features: string[];
  ctaLabel: string;
}

export interface ClientSubscription {
  planId: string;
  planName: string;
  status: 'active' | 'past_due' | 'canceled' | 'trial';
  renewalDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  usage: Record<string, { used: number; total: number }>;
}

export const SEEDED_MONTHLY_PLANS: MonthlyPlan[] = [
  {
    id: 'autonomous-growth-retainer',
    name: 'Autonomous Growth Retainer',
    tagline: '30-Day Autonomous Campaign Engine with Daily Active Queue',
    priceMonthlyINR: 14999,
    priceFormattedINR: '₹14,999/month',
    turnaround: 'Daily Active Queue',
    isPopular: true,
    quotas: [
      { serviceId: 'image', serviceName: 'Daily 4K Brand Graphics', monthlyAllowance: 30, unitLabel: '4K Graphics' },
      { serviceId: 'video', serviceName: 'Daily Motion Reels / Shorts', monthlyAllowance: 30, unitLabel: 'Commercial Reels' },
      { serviceId: 'three-d', serviceName: '3D Spatial Modeling', monthlyAllowance: 4, unitLabel: 'Spatial Assets' },
      { serviceId: 'three-sixty', serviceName: '360 Virtual Tour', monthlyAllowance: 2, unitLabel: 'VR Tours' },
      { serviceId: 'meta-ads', serviceName: 'Meta Ads Creative Variation Pack', monthlyAllowance: 6, unitLabel: 'Ad Packs' },
    ],
    features: [
      'Daily 1x 4K Brand Image / Graphic (30 Assets/month) powered by trend research',
      'Daily 1x Commercial Video Reel / Short (30 Assets/month) with voiceover and motion typography',
      'Dedicated 3D Asset Modeling & Spatial Renders',
      'Interactive 360° Virtual Panoramic Tour',
      'Interior / Spatial Visualizations',
      'Meta Ads Creative Variation Pack (Multi-Ratio)',
      'Private Sutra Cloud Vault with Auto-Sync & Instant Downloads',
      'Executive Producer Direct Access & Priority Daily Active Queue',
    ],
    ctaLabel: 'Activate Retainer (₹14,999/mo)',
  },
];
