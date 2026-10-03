/**
 * SUTRA STUDIO — Email Dispatcher & Provider Interface
 * Supports Console Mock Provider, SMTP (Nodemailer), and Resend API.
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  tags?: Record<string, string>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  provider: "console" | "resend" | "smtp";
  error?: string;
}

export interface IEmailProvider {
  sendEmail(options: EmailOptions): Promise<EmailResult>;
}

/**
 * Standard Console Email Logger (Used in local dev, staging, or when no API key configured)
 */
export class ConsoleEmailProvider implements IEmailProvider {
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const toStr = Array.isArray(options.to) ? options.to.join(", ") : options.to;
    console.log(`\n========================================================`);
    console.log(`✉️ [SUTRA EMAIL DISPATCH] Provider: Console`);
    console.log(`To: ${toStr}`);
    console.log(`From: ${options.from || "notifications@sutrastudio.com"}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`--------------------------------------------------------`);
    console.log(options.text || options.html.replace(/<[^>]+>/g, " ").trim());
    console.log(`========================================================\n`);

    return {
      success: true,
      messageId: `msg_${Date.now()}_mock`,
      provider: "console",
    };
  }
}

/**
 * Resend Email API Provider (Activated when RESEND_API_KEY is configured)
 */
export class ResendEmailProvider implements IEmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: options.from || "Sutra Studio <concierge@sutrastudio.com>",
          to: Array.isArray(options.to) ? options.to : [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Resend API error:", errorText);
        return { success: false, provider: "resend", error: errorText };
      }

      const data = await response.json();
      return { success: true, messageId: data.id, provider: "resend" };
    } catch (err: any) {
      console.error("Resend delivery failed:", err.message);
      return { success: false, provider: "resend", error: err.message };
    }
  }
}

/**
 * Factory and Singleton Email Manager
 */
export class EmailService {
  private static provider: IEmailProvider | null = null;

  public static getProvider(): IEmailProvider {
    if (!this.provider) {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey && !resendKey.startsWith("mock_")) {
        this.provider = new ResendEmailProvider(resendKey);
      } else {
        this.provider = new ConsoleEmailProvider();
      }
    }
    return this.provider;
  }

  public static async dispatchNotificationEmail(options: {
    to: string;
    type: string;
    title: string;
    message: string;
    orderNumber?: string;
    actionUrl?: string;
    actionLabel?: string;
  }): Promise<EmailResult> {
    const provider = this.getProvider();
    const actionUrl = options.actionUrl || "https://sutrastudio.com/dashboard";
    const actionLabel = options.actionLabel || "Open Studio Portal";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${options.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF9F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #171717;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF9F5; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFDF9; border: 1px solid #E5E1D8; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; background-color: #5C3A1E; color: #FFFFFF; text-align: left;">
              <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #D4A35A; font-weight: 600; display: block; margin-bottom: 4px;">SUTRA STUDIO NOTIFICATION</span>
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #FFFFFF; font-family: Georgia, serif;">${options.title}</h1>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              ${options.orderNumber ? `<div style="display: inline-block; padding: 4px 10px; background-color: #F8F5EF; border: 1px solid #E5E1D8; border-radius: 6px; font-family: monospace; font-size: 12px; font-weight: bold; color: #5C3A1E; margin-bottom: 16px;">#${options.orderNumber}</div>` : ""}
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">
                ${options.message}
              </p>
              
              <!-- CTA Button -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px; margin-bottom: 24px;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #5C3A1E;">
                    <a href="${actionUrl}" target="_blank" style="font-size: 14px; font-weight: 600; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block;">
                      ${actionLabel} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              
              <hr style="border: 0; border-top: 1px solid #E5E1D8; margin: 28px 0 20px 0;" />
              <p style="font-size: 12px; color: #94A3B8; margin: 0; line-height: 1.5;">
                This automated update was generated by Sutra Studio Creative Concierge. For real-time chat, visit your dashboard.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; background-color: #F8F5EF; border-top: 1px solid #E5E1D8; text-align: center; font-size: 11px; color: #64748B;">
              © ${new Date().getFullYear()} Sutra Studio • Indian Creative Intelligence
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return provider.sendEmail({
      to: options.to,
      subject: `[Sutra Studio] ${options.title}`,
      html,
      text: `${options.title}\n\n${options.message}\n\nAction: ${actionUrl}`,
    });
  }
}
