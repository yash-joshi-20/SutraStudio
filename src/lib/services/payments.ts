import { readEnv, readPublicEnv } from "@/lib/config/env";
import { PaymentsStore } from "./paymentsStore";

/**
 * SUTRA STUDIO — Payments & Billing Service
 * Pure UPI QR architecture with server-locked pricing and manual admin confirmation.
 * Razorpay integration completely removed per Studio Directives.
 */

export interface PaymentIntentOptions {
  amountINR: number;
  currency?: string;
  orderId: string;
  clientId: string;
  customerEmail: string;
  description: string;
  vpa?: string;
  metadata?: Record<string, string>;
}

export interface DynamicUpiOptions {
  vpa?: string;
  merchantName?: string;
  amountINR: number;
  orderId: string;
  transactionNote?: string;
}

export interface PaymentIntentResult {
  provider: "UPI_DYNAMIC_QR";
  paymentIntentId: string;
  amountINR: number;
  status: "requires_payment" | "payment_submitted" | "verified" | "paid";
  paymentUrl: string;
  upiUri: string;
  vpa: string;
  payeeName: string;
}

export interface UtrVerificationRequest {
  utrNumber: string;
  orderId: string;
  amountINR?: number;
  paymentMode?: "gpay" | "phonepe" | "paytm" | "upi_generic" | "netbanking";
}

export interface UtrVerificationResult {
  success: boolean;
  orderId: string;
  utrNumber: string;
  amountINR: number;
  status: "verified" | "flagged" | "rejected" | "awaiting_confirmation";
  settlementMode: "T+0 Zero-Commission Direct Bank Transfer";
  message: string;
  verifiedAt: string;
}

export interface TaxBreakdown {
  baseAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalGst: number;
  totalPayable: number;
  isInterState: boolean;
  gstRatePercent: number;
}

export class PaymentsService {
  public static get DEFAULT_VPA(): string {
    return PaymentsStore.getMerchantVpa();
  }

  public static get DEFAULT_MERCHANT_NAME(): string {
    return PaymentsStore.getMerchantName();
  }

  /**
   * Generates a standard RFC-compliant UPI Deep-Link URI
   */
  public static generateDynamicUpiUri(options: DynamicUpiOptions): string {
    return PaymentsStore.buildUpiUri({
      vpa: options.vpa,
      merchantName: options.merchantName,
      amountINR: options.amountINR,
      orderNumber: options.orderId,
      note: options.transactionNote,
    });
  }

  /**
   * Initializes a locked UPI QR payment intent.
   */
  public static async createPaymentIntent(options: PaymentIntentOptions): Promise<PaymentIntentResult> {
    const payment = await PaymentsStore.getOrCreatePaymentRecord({
      orderId: options.orderId,
      amountINR: options.amountINR,
      clientId: options.clientId,
      clientEmail: options.customerEmail,
    });

    return {
      provider: "UPI_DYNAMIC_QR",
      paymentIntentId: payment.id,
      amountINR: payment.amountINR,
      status: payment.status === "paid" ? "paid" : "requires_payment",
      upiUri: payment.upiUri,
      vpa: payment.vpa,
      payeeName: payment.payeeName,
      paymentUrl: `/orders?payOrder=${options.orderId}`,
    };
  }

  /**
   * Validates 12-to-16-digit Indian Banking UTR (Unique Transaction Reference) / Ref No.
   */
  public static verifyUtr(params: UtrVerificationRequest): UtrVerificationResult {
    const cleanedUtr = params.utrNumber.trim().toUpperCase();
    const isValidFormat = /^[0-9A-Z]{12,16}$/.test(cleanedUtr);

    if (!isValidFormat) {
      return {
        success: false,
        orderId: params.orderId,
        utrNumber: cleanedUtr,
        amountINR: params.amountINR || 0,
        status: "rejected",
        settlementMode: "T+0 Zero-Commission Direct Bank Transfer",
        message: "Invalid UTR format. Please provide a valid 12-digit bank reference number from your UPI receipt.",
        verifiedAt: new Date().toISOString(),
      };
    }

    return {
      success: true,
      orderId: params.orderId,
      utrNumber: cleanedUtr,
      amountINR: params.amountINR || 0,
      status: "awaiting_confirmation",
      settlementMode: "T+0 Zero-Commission Direct Bank Transfer",
      message: `UTR ${cleanedUtr} submitted. Zero-commission payment is awaiting studio administrator ledger confirmation before production starts.`,
      verifiedAt: new Date().toISOString(),
    };
  }

  /**
   * Computes standard Indian GST tax breakdown (18% default: 9% CGST + 9% SGST intra-state or 18% IGST inter-state)
   */
  public static calculateTaxBreakdown(totalPayable: number, clientState?: string): TaxBreakdown {
    const gstRatePercent = 18;
    const baseAmount = Math.round(totalPayable / (1 + gstRatePercent / 100));
    const totalGst = totalPayable - baseAmount;

    // Gujarat intra-state threshold check (studio home state)
    const isInterState = clientState ? !clientState.toLowerCase().includes("gujarat") : false;

    if (isInterState) {
      return {
        baseAmount,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: totalGst,
        totalGst,
        totalPayable,
        isInterState: true,
        gstRatePercent,
      };
    }

    const halfGst = Math.round(totalGst / 2);
    return {
      baseAmount,
      cgstAmount: halfGst,
      sgstAmount: totalGst - halfGst,
      igstAmount: 0,
      totalGst,
      totalPayable,
      isInterState: false,
      gstRatePercent,
    };
  }

  /**
   * Generates sequential official studio tax invoice identifier
   */
  public static generateInvoiceId(orderNumber: string): string {
    const cleanNumber = orderNumber.replace(/[^0-9A-Za-z]/g, "");
    const year = new Date().getFullYear();
    return `INV-${year}-${cleanNumber.slice(-4) || Math.floor(1000 + Math.random() * 9000)}`;
  }

  /**
   * Formats INR currency according to standard Indian numbering notation (e.g. ₹1,50,000)
   */
  public static formatINR(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

export const formatINR = PaymentsService.formatINR.bind(PaymentsService);
export const calculateTaxBreakdown = PaymentsService.calculateTaxBreakdown.bind(PaymentsService);
export const generateInvoiceId = PaymentsService.generateInvoiceId.bind(PaymentsService);
