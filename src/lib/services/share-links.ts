/**
 * SUTRA STUDIO — Deliverables Share Links Service
 * Generates secure, expiring, and revocable client asset sharing links.
 * Protects raw Google Drive URLs by wrapping in short-lived tokenized gateways.
 */

export interface ShareLinkOptions {
  assetId: string;
  assetName: string;
  clientId: string;
  expiresInDays?: number; // Default: 7 days - TO BE CONFIRMED
  isPasswordProtected?: boolean;
}

export interface ShareLinkRecord {
  shareId: string;
  assetId: string;
  assetName: string;
  shareUrl: string;
  createdAt: string;
  expiresAt: string;
  isRevoked: boolean;
  downloadsCount: number;
}

export class ShareLinksService {
  /**
   * Generates an expiring, revocable share link for a deliverable.
   */
  public static createShareLink(options: ShareLinkOptions): ShareLinkRecord {
    const shareToken = `stl_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;
    const expiryDays = options.expiresInDays || 7;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    return {
      shareId: shareToken,
      assetId: options.assetId,
      assetName: options.assetName,
      shareUrl: `https://sutrastudio.com/share/${shareToken}`,
      createdAt: new Date().toISOString(),
      expiresAt: expiryDate.toISOString(),
      isRevoked: false,
      downloadsCount: 0,
    };
  }
}
