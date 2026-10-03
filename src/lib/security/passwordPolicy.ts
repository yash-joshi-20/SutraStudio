/**
 * SUTRA STUDIO — Password policy for administrative credentials (Step 1.4)
 *
 * No `server-only` import: this is used by scripts/bootstrap-super-admin.ts
 * (Node) and by the test suite. It never returns, stores or echoes the
 * password itself — only a reason for rejection or null.
 *
 * The password typed in chat earlier must not be reused; it was short and is
 * now written down. Minimum length is deliberately 14.
 */

export const MIN_ADMIN_PASSWORD_LENGTH = 14;

/**
 * Deliberately small but high-signal: the usual suspects plus structural
 * weaknesses. Extend as needed.
 */
export const COMMON_PASSWORDS: ReadonlySet<string> = new Set([
  "password",
  "password1",
  "password123",
  "passw0rd",
  "administrator",
  "adminadmin",
  "admin1234567",
  "letmein123456",
  "iloveyou12345",
  "qwertyuiop123",
  "1234567890123",
  "welcome123456",
  "changeme12345",
  "sutrastudio123",
  "sutrastudio1234",
  "superman123456",
  "trustno1trustno1",
  "dragon12345678",
  "monkey12345678",
  "football123456",
]);

/** Returns a rejection reason, or null when the password is acceptable. */
export function validatePassword(password: string): string | null {
  if (typeof password !== "string" || password.length === 0) {
    return "A password is required.";
  }
  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters (received ${password.length}).`;
  }
  const lowered = password.toLowerCase();
  const stripped = lowered.replace(/[^a-z0-9]/g, "");

  if (COMMON_PASSWORDS.has(lowered) || COMMON_PASSWORDS.has(stripped)) {
    return "That password is on the rejected common-password list.";
  }
  if (/^(.)\1+$/.test(password)) {
    return "Password cannot be a single repeated character.";
  }
  if (/^(?:0123456789|abcdefghij|qwertyuiop)/i.test(password)) {
    return "Password cannot be a keyboard or digit sequence.";
  }
  return null;
}
