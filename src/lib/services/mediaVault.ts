/**
 * SUTRA STUDIO — Media Vault Service
 * Central hub for all generated/uploaded files.
 * Search, filter, favorites, folders, download (original + resized + zip),
 * share via expiring links and WhatsApp, social posting (Meta).
 */

import { adminDb } from "@/lib/firebase/admin";
import { readEnv, readPublicEnv } from "@/lib/config/env";
import { safeGetEnv } from "@/lib/services/missingKeyRegistry";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MediaFile {
  id: string;
  clientUid: string;
  orderId?: string;
  brandKitId?: string;
  outputId?: string;

  // File info
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number; // bytes
  fileExtension: string;

  // Storage
  driveFileId?: string;
  driveUrl?: string;
  storageUrl?: string;
  thumbnailUrl?: string;

  // Metadata
  mediaType: "image" | "video" | "3d_model" | "panorama" | "audio" | "document" | "archive";
  width?: number;
  height?: number;
  duration?: number; // seconds for video/audio
  format?: string;

  // Organization
  folder: string; // client-defined folder or auto "orders/{orderId}"
  tags: string[];
  isFavorite: boolean;
  isPublic: boolean;

  // Variants (resized versions)
  variants?: MediaVariant[];

  // Sharing
  shareLinks?: ShareLink[];

  // Lifecycle
  status: "active" | "archived" | "scheduled_delete";
  retentionDays?: number;
  scheduledDeleteAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface MediaVariant {
  id: string;
  label: string; // "Instagram Square", "Story", "Landscape HD"
  width: number;
  height: number;
  ratio: string;
  url: string;
  fileSize: number;
}

export interface ShareLink {
  id: string;
  url: string;
  expiresAt: string;
  accessCount: number;
  maxAccess?: number;
  platform?: "whatsapp" | "email" | "direct" | "facebook" | "instagram";
  createdAt: string;
}

export interface MediaFolder {
  id: string;
  clientUid: string;
  name: string;
  parentId?: string;
  fileCount: number;
  createdAt: string;
}

export interface MediaSearchParams {
  clientUid: string;
  query?: string;
  mediaType?: MediaFile["mediaType"];
  folder?: string;
  tags?: string[];
  isFavorite?: boolean;
  orderId?: string;
  brandKitId?: string;
  sortBy?: "createdAt" | "fileName" | "fileSize";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// Download format options
export const DOWNLOAD_FORMATS = {
  image: [
    { id: "original", label: "Original", description: "Full resolution as generated" },
    { id: "4k", label: "4K (3840×2160)", width: 3840, height: 2160 },
    { id: "1080p", label: "Full HD (1920×1080)", width: 1920, height: 1080 },
    { id: "instagram_square", label: "Instagram Square (1080×1080)", width: 1080, height: 1080 },
    { id: "instagram_story", label: "Instagram Story (1080×1920)", width: 1080, height: 1920 },
    { id: "facebook_cover", label: "Facebook Cover (820×312)", width: 820, height: 312 },
    { id: "twitter_header", label: "Twitter Header (1500×500)", width: 1500, height: 500 },
    { id: "linkedin_banner", label: "LinkedIn Banner (1584×396)", width: 1584, height: 396 },
    { id: "thumbnail", label: "Thumbnail (400×400)", width: 400, height: 400 },
  ],
  video: [
    { id: "original", label: "Original Quality" },
    { id: "1080p", label: "1080p MP4" },
    { id: "720p", label: "720p MP4" },
    { id: "gif", label: "GIF Preview" },
  ],
  "3d_model": [
    { id: "glb", label: "GLB (Web-ready)" },
    { id: "usdz", label: "USDZ (Apple AR)" },
    { id: "obj", label: "OBJ (Universal)" },
    { id: "fbx", label: "FBX (Animation)" },
  ],
} as const;

// Storage quotas per plan
export const STORAGE_QUOTAS = {
  free: { maxFiles: 50, maxStorageMB: 500, retentionDays: 30 },
  starter: { maxFiles: 500, maxStorageMB: 5000, retentionDays: 90 },
  growth: { maxFiles: 2000, maxStorageMB: 20000, retentionDays: 180 },
  enterprise: { maxFiles: 10000, maxStorageMB: 100000, retentionDays: 365 },
} as const;

// ---------------------------------------------------------------------------
// Media Vault Store
// ---------------------------------------------------------------------------

const FILES_COLLECTION = "media_files";
const FOLDERS_COLLECTION = "media_folders";

export class MediaVaultStore {
  /**
   * Add a file to the vault
   */
  static async addFile(file: MediaFile): Promise<MediaFile> {
    const db = adminDb();
    await db.collection(FILES_COLLECTION).doc(file.id).set(file);
    return file;
  }

  /**
   * Get a single file by ID, with ownership check
   */
  static async getFile(fileId: string, clientUid: string): Promise<MediaFile | null> {
    const db = adminDb();
    const doc = await db.collection(FILES_COLLECTION).doc(fileId).get();
    if (!doc.exists) return null;
    const data = doc.data() as MediaFile;
    if (data.clientUid !== clientUid) return null;
    return data;
  }

  /**
   * Search and filter files
   */
  static async search(params: MediaSearchParams): Promise<{ files: MediaFile[]; total: number }> {
    const db = adminDb();
    let query: any = db.collection(FILES_COLLECTION);

    // Client isolation is mandatory
    query = query.where("clientUid", "==", params.clientUid);

    if (params.mediaType) {
      query = query.where("mediaType", "==", params.mediaType);
    }

    if (params.folder) {
      query = query.where("folder", "==", params.folder);
    }

    if (params.isFavorite !== undefined) {
      query = query.where("isFavorite", "==", params.isFavorite);
    }

    if (params.orderId) {
      query = query.where("orderId", "==", params.orderId);
    }

    query = query.orderBy(params.sortBy || "createdAt", params.sortOrder || "desc");
    query = query.limit(params.limit || 50);

    const snap = await query.get();
    if (!snap || !snap.docs) return { files: [], total: 0 };

    let files = snap.docs.map((d: any) => d.data() as MediaFile);

    // Client-side text search (Firestore doesn't support full-text)
    if (params.query) {
      const q = params.query.toLowerCase();
      files = files.filter(
        (f: MediaFile) =>
          f.fileName.toLowerCase().includes(q) ||
          f.originalName.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return { files, total: files.length };
  }

  /**
   * Toggle favorite
   */
  static async toggleFavorite(fileId: string, clientUid: string): Promise<boolean> {
    const file = await MediaVaultStore.getFile(fileId, clientUid);
    if (!file) return false;

    const db = adminDb();
    await db.collection(FILES_COLLECTION).doc(fileId).update({
      isFavorite: !file.isFavorite,
      updatedAt: new Date().toISOString(),
    });
    return !file.isFavorite;
  }

  /**
   * Move file to folder
   */
  static async moveToFolder(fileId: string, clientUid: string, folder: string): Promise<boolean> {
    const file = await MediaVaultStore.getFile(fileId, clientUid);
    if (!file) return false;

    const db = adminDb();
    await db.collection(FILES_COLLECTION).doc(fileId).update({
      folder,
      updatedAt: new Date().toISOString(),
    });
    return true;
  }

  /**
   * Add tags to a file
   */
  static async updateTags(fileId: string, clientUid: string, tags: string[]): Promise<boolean> {
    const file = await MediaVaultStore.getFile(fileId, clientUid);
    if (!file) return false;

    const db = adminDb();
    await db.collection(FILES_COLLECTION).doc(fileId).update({
      tags,
      updatedAt: new Date().toISOString(),
    });
    return true;
  }

  /**
   * Create an expiring share link
   */
  static async createShareLink(
    fileId: string,
    clientUid: string,
    expiresInHours: number = 72,
    platform?: ShareLink["platform"],
    maxAccess?: number
  ): Promise<ShareLink | null> {
    const file = await MediaVaultStore.getFile(fileId, clientUid);
    if (!file) return null;

    const appUrl = readPublicEnv("NEXT_PUBLIC_APP_URL") || "https://sutrastudio.com";
    const shareLink: ShareLink = {
      id: `share_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      url: `${appUrl}/share/${fileId}/${Date.now().toString(36)}`,
      expiresAt: new Date(Date.now() + expiresInHours * 3600000).toISOString(),
      accessCount: 0,
      maxAccess,
      platform,
      createdAt: new Date().toISOString(),
    };

    const db = adminDb();
    const existingLinks = file.shareLinks || [];
    await db.collection(FILES_COLLECTION).doc(fileId).update({
      shareLinks: [...existingLinks, shareLink],
      updatedAt: new Date().toISOString(),
    });

    return shareLink;
  }

  /**
   * Generate WhatsApp share URL
   */
  static generateWhatsAppShareUrl(shareUrl: string, fileName: string): string {
    const text = encodeURIComponent(`Check out "${fileName}" from Sutra Studio: ${shareUrl}`);
    return `https://wa.me/?text=${text}`;
  }

  /**
   * Get storage usage for a client
   */
  static async getStorageUsage(clientUid: string): Promise<{
    fileCount: number;
    totalSizeMB: number;
    byType: Record<string, { count: number; sizeMB: number }>;
  }> {
    const { files } = await MediaVaultStore.search({
      clientUid,
      limit: 10000,
    });

    const byType: Record<string, { count: number; sizeMB: number }> = {};
    let totalSize = 0;

    for (const file of files) {
      totalSize += file.fileSize;
      if (!byType[file.mediaType]) {
        byType[file.mediaType] = { count: 0, sizeMB: 0 };
      }
      byType[file.mediaType].count++;
      byType[file.mediaType].sizeMB += file.fileSize / (1024 * 1024);
    }

    return {
      fileCount: files.length,
      totalSizeMB: totalSize / (1024 * 1024),
      byType,
    };
  }

  /**
   * Schedule files for deletion (retention policy)
   */
  static async scheduleRetentionCleanup(clientUid: string, retentionDays: number): Promise<number> {
    const cutoffDate = new Date(Date.now() - retentionDays * 86400000).toISOString();
    const db = adminDb();

    const snap = await db
      .collection(FILES_COLLECTION)
      .where("clientUid", "==", clientUid)
      .where("status", "==", "active")
      .where("createdAt", "<", cutoffDate)
      .get();

    if (!snap || !snap.docs) return 0;

    let count = 0;
    for (const doc of snap.docs) {
      await db.collection(FILES_COLLECTION).doc(doc.id).update({
        status: "scheduled_delete",
        scheduledDeleteAt: new Date(Date.now() + 7 * 86400000).toISOString(), // 7-day grace period
        updatedAt: new Date().toISOString(),
      });
      count++;
    }
    return count;
  }

  /**
   * Create a folder
   */
  static async createFolder(clientUid: string, name: string, parentId?: string): Promise<MediaFolder> {
    const folder: MediaFolder = {
      id: `folder_${Date.now()}`,
      clientUid,
      name,
      parentId,
      fileCount: 0,
      createdAt: new Date().toISOString(),
    };

    const db = adminDb();
    await db.collection(FOLDERS_COLLECTION).doc(folder.id).set(folder);
    return folder;
  }

  /**
   * List folders for a client
   */
  static async listFolders(clientUid: string): Promise<MediaFolder[]> {
    const db = adminDb();
    const snap = await db
      .collection(FOLDERS_COLLECTION)
      .where("clientUid", "==", clientUid)
      .orderBy("name")
      .get();
    if (!snap || !snap.docs) return [];
    return snap.docs.map((d: any) => d.data() as MediaFolder);
  }

  /**
   * Admin: get all files (no client filter)
   */
  static async adminListAll(limit = 100): Promise<MediaFile[]> {
    const db = adminDb();
    const snap = await db
      .collection(FILES_COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    if (!snap || !snap.docs) return [];
    return snap.docs.map((d: any) => d.data() as MediaFile);
  }
}

// ---------------------------------------------------------------------------
// Social Posting (Meta)
// ---------------------------------------------------------------------------

export interface SocialPostRequest {
  fileId: string;
  clientUid: string;
  platform: "facebook" | "instagram";
  caption: string;
  scheduledAt?: string; // ISO timestamp for scheduled posting
  accessToken: string; // Client's OAuth token (stored server-side after consent)
}

export async function postToSocial(request: SocialPostRequest): Promise<{
  success: boolean;
  postId?: string;
  error?: string;
}> {
  // Verify Meta credentials
  const appId = safeGetEnv("META_APP_ID", {
    feature: "Social Media Publishing",
    priority: "MEDIUM",
  });
  const appSecret = safeGetEnv("META_APP_SECRET", {
    feature: "Social Media Publishing",
    priority: "MEDIUM",
  });

  if (!appId || !appSecret) {
    return {
      success: false,
      error: "Meta/Facebook integration is not configured. Contact admin to set up META_APP_ID and META_APP_SECRET.",
    };
  }

  if (!request.accessToken) {
    return {
      success: false,
      error: "Social media account not connected. Please authorize Facebook/Instagram in your profile settings.",
    };
  }

  // This would call the Meta Graph API
  // For Facebook: POST /{page-id}/photos or /{page-id}/videos
  // For Instagram: POST /{ig-user-id}/media then /{ig-user-id}/media_publish
  // Requires Meta App Review approval for pages_manage_posts, instagram_content_publish

  return {
    success: false,
    error: "Meta App Review approval required. See documentation for setup steps.",
  };
}

/**
 * Note for Meta App Review:
 * Required permissions: pages_manage_posts, pages_read_engagement,
 * instagram_basic, instagram_content_publish
 * Must submit for review with screen recordings and data handling policies.
 * See: https://developers.facebook.com/docs/app-review
 */
