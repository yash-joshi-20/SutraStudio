/**
 * SUTRA STUDIO — Text & Input Sanitization
 * Strips dangerous HTML, script tags, javascript: URIs, and control characters from user briefs and comments.
 */

export function sanitizeInputText(input?: string): string {
  if (!input) return "";

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove <script> tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove <iframe> tags
    .replace(/javascript:/gi, "") // Remove javascript: pseudo-protocols
    .replace(/onload=/gi, "")
    .replace(/onerror=/gi, "")
    .replace(/onclick=/gi, "")
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, "") // Remove non-printable ASCII
    .trim();
}

export function validateGstin(gstin?: string): boolean {
  if (!gstin) return false;
  // Official Indian GSTIN format: 2 digits (state code), 5 alpha (PAN), 4 numeric (PAN), 1 alpha (PAN), 1 entity, 1 'Z', 1 checksum
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gstin.trim().toUpperCase());
}
