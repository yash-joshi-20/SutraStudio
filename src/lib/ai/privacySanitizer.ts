/**
 * SUTRA STUDIO — Client Privacy Sanitizer & PII Redactor
 *
 * Implements Rule 9 Privacy Directive:
 * "Never send client files, personal details or order contents to free-tier
 * providers unless their terms prohibit logging/training; send only the minimum text needed."
 */

export interface SanitizationResult {
  sanitizedText: string;
  redactionsCount: number;
  redactedTypes: string[];
}

export class PrivacySanitizer {
  // Regex patterns for sensitive identifiers
  private static readonly EMAIL_REGEX =
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

  // Indian and international phone numbers (10 digits, +91, with/without spaces/hyphens)
  private static readonly PHONE_REGEX =
    /(?:\+91[\-\s]?)?[6-9]\d{9}\b|\b(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}\b/g;

  // PAN Card (Indian tax identifier: 5 letters, 4 digits, 1 letter)
  private static readonly PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g;

  // GSTIN (15 characters)
  private static readonly GSTIN_REGEX =
    /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/g;

  // Credit Card Numbers (13-19 digits with optional spaces or dashes)
  private static readonly CC_REGEX =
    /\b(?:\d{4}[-\s]?){3}\d{4}\b|\b\d{15,16}\b/g;

  // UPI IDs (e.g. user@okaxis, user@okhdfcbank)
  private static readonly UPI_REGEX = /\b[\w.\-_]{2,256}@[a-zA-Z]{2,64}\b/g;

  /**
   * Sanitize text by redacting personal details and returning only minimal prompt needed.
   */
  public static sanitize(text: string): SanitizationResult {
    if (!text) {
      return { sanitizedText: "", redactionsCount: 0, redactedTypes: [] };
    }

    let sanitized = text;
    let count = 0;
    const typesSet = new Set<string>();

    // 1. Redact Emails
    sanitized = sanitized.replace(this.EMAIL_REGEX, () => {
      count++;
      typesSet.add("email");
      return "[CLIENT_EMAIL_REDACTED]";
    });

    // 2. Redact Phone Numbers
    sanitized = sanitized.replace(this.PHONE_REGEX, () => {
      count++;
      typesSet.add("phone");
      return "[CLIENT_PHONE_REDACTED]";
    });

    // 3. Redact PAN
    sanitized = sanitized.replace(this.PAN_REGEX, () => {
      count++;
      typesSet.add("tax_id");
      return "[CLIENT_PAN_REDACTED]";
    });

    // 4. Redact GSTIN
    sanitized = sanitized.replace(this.GSTIN_REGEX, () => {
      count++;
      typesSet.add("gstin");
      return "[CLIENT_GST_REDACTED]";
    });

    // 5. Redact Credit Cards
    sanitized = sanitized.replace(this.CC_REGEX, () => {
      count++;
      typesSet.add("financial");
      return "[CLIENT_PAYMENT_REDACTED]";
    });

    return {
      sanitizedText: sanitized,
      redactionsCount: count,
      redactedTypes: Array.from(typesSet),
    };
  }

  /**
   * Determine whether a prompt needs sanitization based on provider terms
   */
  public static shouldSanitize(provider: { isFree: boolean; allowsTraining: boolean }): boolean {
    return provider.isFree || provider.allowsTraining;
  }
}
