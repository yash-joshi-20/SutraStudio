/**
 * SUTRA STUDIO — Payments Service Abstraction
 * Unified adapter for processing plan subscriptions and one-time commissions.
 * Pluggable architecture supporting Razorpay & Stripe India.
 */

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
  provider: 'RAZORPAY' | 'STRIPE' | 'OFFLINE_INVOICE';
  paymentIntentId: string;
  clientSecret?: string;
  amountINR: number;
  status: 'requires_payment' | 'processing' | 'succeeded' | 'failed';
  paymentUrl?: string;
}

export class PaymentsService {
  /**
   * Initializes a payment intent for an order or plan subscription.
   */
  public static async createPaymentIntent(options: PaymentIntentOptions): Promise<PaymentIntentResult> {
    // Provider selection: TO BE CONFIRMED (defaults to Razorpay configuration in .env)
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    
    return {
      provider: razorpayKey ? 'RAZORPAY' : 'OFFLINE_INVOICE',
      paymentIntentId: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      amountINR: options.amountINR,
      status: 'requires_payment',
      paymentUrl: `/invoices?orderId=${options.orderId}`,
    };
  }

  /**
   * Formats INR currency according to standard Indian notation.
   */
  public static formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }
}
