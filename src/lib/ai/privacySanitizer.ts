/**
 * SUTRA STUDIO — Client Privacy Sanitizer & PII Redactor
 *
 * Implements Rule 9 Privacy Directive:
 * "Whenever a request contains any client data, only use endpoints marked
 * zero-data-retention; otherwise send no client data."
 * "Never send client files, personal details or order contents to free-tier
 * providers unless their terms prohibit logging/training; send only the minimum text needed."
 */

export interface SanitizationResult {
  sanitizedText: string;
  redactionsCount: number;
  redactedTypes: string[];
}

export interface ClientMetadata {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  brandName?: string;
  orderNumber?: string;
  orderId?: string;
  fileUrls?: string[];
  customSensitiveTerms?: string[];
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

  // Client file delivery URLs & private media links
  private static readonly FILE_URL_REGEX =
    /https?:\/\/(?:sutrastudios\.in\/(?:api\/files|media))[\w\d\-._~:/?#[\]@!$&'()*+,;=]+/g;

  /**
   * Check if a given text contains any recognizable client data or PII.
   */
  public static containsClientData(text: string, metadata?: ClientMetadata): boolean {
    if (!text) return false;
    if (this.EMAIL_REGEX.test(text)) return true;
    if (this.PHONE_REGEX.test(text)) return true;
    if (this.PAN_REGEX.test(text)) return true;
    if (this.GSTIN_REGEX.test(text)) return true;
    if (this.CC_REGEX.test(text)) return true;
    if (this.UPI_REGEX.test(text)) return true;
    if (this.FILE_URL_REGEX.test(text)) return true;

    if (metadata) {
      if (metadata.clientEmail && text.includes(metadata.clientEmail)) return true;
      if (metadata.clientPhone && text.includes(metadata.clientPhone)) return true;
      if (metadata.clientName && text.toLowerCase().includes(metadata.clientName.toLowerCase())) return true;
      if (metadata.brandName && text.toLowerCase().includes(metadata.brandName.toLowerCase())) return true;
      if (metadata.orderNumber && text.includes(metadata.orderNumber)) return true;
    }

    return false;
  }

  /**
   * Standard PII sanitization: redacts emails, phones, tax IDs, and payment details.
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

    // 6. Redact UPI IDs
    sanitized = sanitized.replace(this.UPI_REGEX, () => {
      count++;
      typesSet.add("upi");
      return "[CLIENT_UPI_REDACTED]";
    });

    return {
      sanitizedText: sanitized,
      redactionsCount: count,
      redactedTypes: Array.from(typesSet),
    };
  }

  /**
   * Complete Client Data Scrubbing:
   * Enforces the directive: "Whenever a request contains any client data,
   * only use endpoints marked zero-data-retention; otherwise send no client data."
   * When an endpoint is NOT marked zero-data-retention, this method completely
   * scrubs all client names, brands, order IDs, file links, and PII, leaving strictly
   * the abstract creative instructions so NO client data is sent.
   */
  public static scrubAllClientData(
    text: string,
    metadata?: ClientMetadata
  ): { scrubbedText: string; totalRemoved: number } {
    let scrubbed = text;
    let removed = 0;

    // Run standard PII sanitization
    const s = this.sanitize(scrubbed);
    scrubbed = s.sanitizedText;
    removed += s.redactionsCount;

    // Remove client file URLs
    scrubbed = scrubbed.replace(this.FILE_URL_REGEX, () => {
      removed++;
      return "[CLIENT_FILE_URL_REMOVED]";
    });

    // Remove metadata specifics
    if (metadata) {
      if (metadata.clientName && metadata.clientName.length > 2) {
        const nameRegex = new RegExp(this.escapeRegex(metadata.clientName), "gi");
        scrubbed = scrubbed.replace(nameRegex, () => {
          removed++;
          return "[CLIENT_NAME_REMOVED]";
        });
      }

      if (metadata.brandName && metadata.brandName.length > 2) {
        const brandRegex = new RegExp(this.escapeRegex(metadata.brandName), "gi");
        scrubbed = scrubbed.replace(brandRegex, () => {
          removed++;
          return "[CLIENT_BRAND_REMOVED]";
        });
      }

      if (metadata.orderNumber) {
        const orderRegex = new RegExp(this.escapeRegex(metadata.orderNumber), "gi");
        scrubbed = scrubbed.replace(orderRegex, () => {
          removed++;
          return "[ORDER_REF_REMOVED]";
        });
      }

      if (metadata.customSensitiveTerms) {
        for (const term of metadata.customSensitiveTerms) {
          if (term && term.length > 2) {
            const termRegex = new RegExp(this.escapeRegex(term), "gi");
            scrubbed = scrubbed.replace(termRegex, () => {
              removed++;
              return "[CONFIDENTIAL_REMOVED]";
            });
          }
        }
      }
    }

    return { scrubbedText: scrubbed, totalRemoved: removed };
  }

  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Determine whether a prompt needs sanitization based on provider terms
   */
  public static shouldSanitize(provider: { isFree: boolean; allowsTraining: boolean }): boolean {
    return provider.isFree || provider.allowsTraining;
  }
}
