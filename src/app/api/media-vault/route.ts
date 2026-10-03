/**
 * SUTRA STUDIO — Media Vault API
 * File management, search, favorites, sharing, downloads.
 */

import { NextResponse } from "next/server";
import { MediaVaultStore, type MediaSearchParams } from "@/lib/services/mediaVault";
import { requestUid } from "@/lib/auth/requestRole";

// GET /api/media-vault — Search/list files
export async function GET(req: Request) {
  try {
    const clientUid = await requestUid(req);
    if (!clientUid) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");

    if (fileId) {
      const file = await MediaVaultStore.getFile(fileId, clientUid);
      if (!file) {
        return NextResponse.json({ error: "File not found." }, { status: 404 });
      }
      return NextResponse.json({ file });
    }

    const params: MediaSearchParams = {
      clientUid,
      query: searchParams.get("q") || undefined,
      mediaType: (searchParams.get("type") as any) || undefined,
      folder: searchParams.get("folder") || undefined,
      isFavorite: searchParams.get("favorites") === "true" ? true : undefined,
      orderId: searchParams.get("orderId") || undefined,
      brandKitId: searchParams.get("brandKitId") || undefined,
      sortBy: (searchParams.get("sortBy") as any) || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as any) || "desc",
      limit: parseInt(searchParams.get("limit") || "50"),
    };

    const result = await MediaVaultStore.search(params);
    const folders = await MediaVaultStore.listFolders(clientUid);
    const usage = await MediaVaultStore.getStorageUsage(clientUid);

    return NextResponse.json({
      files: result.files,
      total: result.total,
      folders,
      storageUsage: usage,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch files." }, { status: 500 });
  }
}

// POST /api/media-vault — Actions on files
export async function POST(req: Request) {
  try {
    const clientUid = await requestUid(req);
    if (!clientUid) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "toggle_favorite": {
        const newState = await MediaVaultStore.toggleFavorite(body.fileId, clientUid);
        return NextResponse.json({ success: true, isFavorite: newState });
      }

      case "move_to_folder": {
        const moved = await MediaVaultStore.moveToFolder(body.fileId, clientUid, body.folder);
        return NextResponse.json({ success: moved });
      }

      case "update_tags": {
        const updated = await MediaVaultStore.updateTags(body.fileId, clientUid, body.tags);
        return NextResponse.json({ success: updated });
      }

      case "create_share_link": {
        const link = await MediaVaultStore.createShareLink(
          body.fileId,
          clientUid,
          body.expiresInHours || 72,
          body.platform,
          body.maxAccess
        );
        if (!link) {
          return NextResponse.json({ error: "File not found." }, { status: 404 });
        }

        const response: any = { success: true, shareLink: link };

        // Generate WhatsApp share URL if requested
        if (body.platform === "whatsapp") {
          response.whatsappUrl = MediaVaultStore.generateWhatsAppShareUrl(link.url, body.fileName || "Sutra Studio File");
        }

        return NextResponse.json(response);
      }

      case "create_folder": {
        const folder = await MediaVaultStore.createFolder(clientUid, body.name, body.parentId);
        return NextResponse.json({ success: true, folder });
      }

      case "get_storage_usage": {
        const usage = await MediaVaultStore.getStorageUsage(clientUid);
        return NextResponse.json({ usage });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Media vault error." }, { status: 500 });
  }
}
