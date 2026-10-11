/**
 * SUTRA STUDIO MOBILE — Central Site Configuration
 * Only TWO live URLs exist project-wide:
 * 1) https://sutrastudios.in (Main site & API)
 * 2) https://n8n.sutrastudios.in (Internal webhook & automation engine)
 */

export const SITE_BASE_URL = "https://sutrastudios.in";

export function getFileUrl(fileId: string, download: boolean = false): string {
  const cleanId = encodeURIComponent(fileId.trim());
  return `${SITE_BASE_URL}/api/files/${cleanId}${download ? "?download=true" : ""}`;
}

export function getSiteUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_BASE_URL}${cleanPath}`;
}
