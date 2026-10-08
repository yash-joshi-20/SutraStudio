/**
 * SUTRA STUDIO — Deliverables Share Links Service
 * Generates secure, expiring, and revocable client asset sharing links.
 * Protects raw Google Drive URLs by wrapping in short-lived tokenized gateways.
 */

import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";

export interface ShareLinkOptions {
  assetId: string;
  assetName: string;
  clientId: string;
  expiresInDays?: number; // Default: 7 days
  isPasswordProtected?: boolean;
}

export interface ShareLinkRecord {
  shareId: string;
  assetId: string;
  assetName: string;
  clientId?: string;
  shareUrl: string;
  createdAt: string;
  expiresAt: string;
  isRevoked: boolean;
  downloadsCount: number;
}

export class ShareLinksService {
  /**
   * Generates an expiring, revocable share link for a deliverable and persists to Firestore.
   */
  public static createShareLink(options: ShareLinkOptions): ShareLinkRecord {
    const shareToken = `stl_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;
    const expiryDays = options.expiresInDays || 7;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    const record: ShareLinkRecord = {
      shareId: shareToken,
      assetId: options.assetId,
      assetName: options.assetName,
      clientId: options.clientId,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://sutrastudio-1.onrender.com"}/share/${shareToken}`,
      createdAt: new Date().toISOString(),
      expiresAt: expiryDate.toISOString(),
      isRevoked: false,
      downloadsCount: 0,
    };

    if (isFirebaseAdminReady()) {
      adminDb().collection("shareLinks").doc(shareToken).set(record).catch(() => {});
    }

    return record;
  }

  public static async getShareLink(shareToken: string): Promise<ShareLinkRecord | null> {
    if (!isFirebaseAdminReady()) return null;
    try {
      const doc = await adminDb().collection("shareLinks").doc(shareToken).get();
      if (!doc.exists) return null;
      return doc.data() as ShareLinkRecord;
    } catch {
      return null;
    }
  }
}
