/**
 * Utility to extract clean, human-readable display names from user profiles,
 * Google authentication objects, and email handles.
 *
 * Guarantees that raw emails (e.g. index.yashjoshi@gmail.com) or technical prefixes
 * (e.g. index.yashjoshi) are never displayed to clients as their name.
 */

export function resolveClientDisplayName(
  displayName?: string | null,
  email?: string | null,
  profileName?: string | null
): string {
  // 1. Check profileName (from Firestore user profile)
  if (profileName && typeof profileName === "string") {
    const cleaned = formatRawName(profileName);
    if (cleaned) return cleaned;
  }

  // 2. Check displayName (from Google OAuth or Firebase Auth)
  if (displayName && typeof displayName === "string") {
    const cleaned = formatRawName(displayName);
    if (cleaned) return cleaned;
  }

  // 3. Fallback: Parse cleanly from email handle without technical prefix
  if (email && typeof email === "string" && email.includes("@")) {
    const handle = email.split("@")[0];
    const cleaned = formatRawName(handle);
    if (cleaned) return cleaned;
  }

  return "Studio Client";
}

export function formatRawName(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // If it's an email address, extract handle first
  if (trimmed.includes("@")) {
    const handle = trimmed.split("@")[0];
    return formatRawName(handle);
  }

  // Reject literal placeholders
  const lower = trimmed.toLowerCase();
  if (lower === "null" || lower === "undefined" || lower === "client" || lower === "admin") {
    return null;
  }

  // Handle dot, underscore, or hyphen separated handles (e.g. "index.yashjoshi", "yash.joshi", "john_doe")
  if (trimmed.includes(".") || trimmed.includes("_") || trimmed.includes("-")) {
    const ignoredPrefixes = new Set([
      "index",
      "user",
      "contact",
      "info",
      "admin",
      "client",
      "test",
      "demo",
      "mail",
    ]);
    const parts = trimmed
      .split(/[._-]+/)
      .filter((p) => p && !ignoredPrefixes.has(p.toLowerCase()) && !/^\d+$/.test(p));

    if (parts.length > 0) {
      return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
    }
  }

  // Handle simple handle without punctuation
  const withoutDigits = trimmed.replace(/\d+/g, "").trim();
  if (withoutDigits.length >= 2) {
    if (withoutDigits.includes(" ")) {
      return withoutDigits
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
    return withoutDigits.charAt(0).toUpperCase() + withoutDigits.slice(1);
  }

  return trimmed;
}
