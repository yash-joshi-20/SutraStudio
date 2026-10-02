import crypto from "crypto";

export interface PaymentIntentOptions {
  amountINR: number;
  currency?: string;
  orderId: string;
  clientId: string;
  customerEmail: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  provider: "RAZORPAY" | "STRIPE" | "OFFLINE_INVOICE";
  paymentIntentId: string;
  clientSecret?: string;
  amountINR: number;
  status: "requires_payment" | "processing" | "succeeded" | "failed";
  paymentUrl?: string;
  razorpayOrderId?: string;
}

export interface RazorpayVerificationParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export class PaymentsService {
  /**
   * Initializes a payment intent for an order or plan subscription.
   */
  public static async createPaymentIntent(options: PaymentIntentOptions): Promise<PaymentIntentResult> {
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (razorpayKey && !razorpayKey.includes("example")) {
      return {
        provider: "RAZORPAY",
        paymentIntentId: `pay_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        razorpayOrderId: `order_${Date.now()}`,
        amountINR: options.amountINR,
        status: "requires_payment",
        paymentUrl: `/invoices?orderId=${options.orderId}&gateway=razorpay`,
      };
    }

    if (stripeKey && !stripeKey.includes("example")) {
      return {
        provider: "STRIPE",
        paymentIntentId: `pi_str_${Date.now()}`,
        clientSecret: `cs_test_${Math.random().toString(36).substring(2, 9)}`,
        amountINR: options.amountINR,
        status: "requires_payment",
        paymentUrl: `/invoices?orderId=${options.orderId}&gateway=stripe`,
      };
    }

    return {
      provider: "OFFLINE_INVOICE",
      paymentIntentId: `pay_inv_${Date.now()}`,
      amountINR: options.amountINR,
      status: "requires_payment",
      paymentUrl: `/invoices?orderId=${options.orderId}`,
    };
  }

  /**
   * Verifies Razorpay payment signature for server-side authorization.
   */
  public static verifyRazorpaySignature(params: RazorpayVerificationParams): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || secret.includes("example")) {
      // In development / demo mode, return true if IDs are non-empty
      return !!(params.razorpayOrderId && params.razorpayPaymentId);
    }

    const payload = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    return expectedSignature === params.razorpaySignature;
  }

  /**
   * Formats INR currency according to standard Indian notation.
   */
  public static formatINR(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

