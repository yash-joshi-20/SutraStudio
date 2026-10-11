/**
 * SUTRA STUDIO — Short-Lived Viewer Token Utility
 *
 * Generates and validates cryptographic HMAC tokens for subresource viewers
 * (Three.js 3D GLTF loaders, Pannellum 360 panorama canvas, video player elements).
 *
 * Allows authenticated client data delivery strictly through https://sutrastudios.in/api/files/[id]
 * while keeping Google Drive files private and credentials confidential.
 */

import crypto from "node:crypto";
import { readEnv } from "@/lib/config/env";

function getSecretKey(): string {
  return (
    readEnv("TOKEN_ENCRYPTION_KEY") ||
    readEnv("CRON_SECRET") ||
    "sutra_studio_secure_origin_token_key_2026"
  );
}

export interface ViewerTokenPayload {
  fileId: string;
  clientId: string;
  orderId?: string;
  exp: number; // epoch ms
}

/**
 * Generate a short-lived viewer token (default TTL: 2 hours).
 */
export function generateFileViewerToken(
  fileId: string,
  clientId: string,
  orderId?: string,
  ttlSeconds = 7200
): string {
  const exp = Date.now() + ttlSeconds * 1000;
  const payloadData = `${fileId}:${clientId}:${orderId || ""}:${exp}`;
  const hmac = crypto
    .createHmac("sha256", getSecretKey())
    .update(payloadData)
    .digest("hex");

  // Format: base64(payloadData):signature
  const encodedPayload = Buffer.from(payloadData).toString("base64url");
  return `${encodedPayload}.${hmac}`;
}

/**
 * Verify a short-lived viewer token.
 */
export function verifyFileViewerToken(
  token: string,
  expectedFileId: string
): { valid: boolean; clientId?: string; orderId?: string } {
  if (!token || !expectedFileId) return { valid: false };

  try {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return { valid: false };

    const payloadData = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const [fileId, clientId, orderId, expStr] = payloadData.split(":");

    if (fileId !== expectedFileId) return { valid: false };

    const exp = parseInt(expStr, 10);
    if (isNaN(exp) || Date.now() > exp) return { valid: false };

    const expectedSignature = crypto
      .createHmac("sha256", getSecretKey())
      .update(payloadData)
      .digest("hex");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expectedSignature, "hex")
      )
    ) {
      return { valid: false };
    }

    return { valid: true, clientId, orderId };
  } catch {
    return { valid: false };
  }
}
