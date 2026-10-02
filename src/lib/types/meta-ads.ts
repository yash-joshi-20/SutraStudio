/**
 * SUTRA STUDIO — Meta Ads Launcher Types
 * Secure client asset binding, campaign configuration, and spend controls.
 */

export interface MetaClientConnection {
  clientId: string;
  isConnected: boolean;
  pageId?: string;
  pageName?: string;
  adAccountId?: string;
  adAccountName?: string;
  pixelId?: string;
  pixelName?: string;
  partnerAccessGranted: boolean;
  connectedAt?: string;
  lastSyncAt?: string;
}

export interface MetaCampaignLaunchRequest {
  id: string;
  clientId: string;
  clientName: string;
  campaignName: string;
  objective: 'OUTCOME_LEADS' | 'OUTCOME_SALES' | 'OUTCOME_TRAFFIC' | 'OUTCOME_AWARENESS';
  dailyBudgetINR: number;
  totalBudgetCapINR: number;
  targetAudienceSummary: string;
  selectedCreativeDeliverableId: string; // From approved Google Drive deliverables
  creativeAssetUrl: string;
  headline: string;
  primaryText: string;
  destinationUrl: string;
  status: 'DRAFT' | 'PENDING_ADMIN_CONFIRM' | 'LAUNCHED' | 'PAUSED' | 'COMPLETED';
  launchedByAdminId?: string;
  launchedAt?: string;
  spendToDateINR?: number;
  resultsSummary?: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: string;
  };
}
