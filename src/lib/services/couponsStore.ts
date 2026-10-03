import { StudioSettingsStore } from "./studioSettingsStore";

/**
 * SUTRA STUDIO — Master Coupon & Discount Engine
 * Server-side validated coupon registry with usage caps, expiry dates, and minimum order values.
 */

export interface CouponRecord {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed_inr";
  discountValue: number; // e.g. 15 for 15%, or 1500 for ₹1,500
  minOrderINR?: number;
  maxDiscountINR?: number;
  active: boolean;
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
  allowedServices?: string[];
  createdAt: string;
}

const INITIAL_COUPONS: CouponRecord[] = [
  {
    id: "coup_sutra_launch",
    code: "SUTRA15",
    description: "Inaugural Studio Launch: 15% off all creative services",
    discountType: "percentage",
    discountValue: 15,
    minOrderINR: 5000,
    maxDiscountINR: 3000,
    active: true,
    maxUses: 100,
    currentUses: 12,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "coup_spatial_1000",
    code: "SPATIAL1000",
    description: "Flat ₹1,000 off on 3D Architecture and Spatial CGI",
    discountType: "fixed_inr",
    discountValue: 1000,
    minOrderINR: 8000,
    active: true,
    maxUses: 50,
    currentUses: 8,
    allowedServices: ["3D Visualization", "3d-modeling", "360 Spatial Tour"],
    createdAt: "2026-09-15T00:00:00.000Z",
  },
  {
    id: "coup_festive_vip",
    code: "AURA20",
    description: "20% VIP Commercial Retainer Discount",
    discountType: "percentage",
    discountValue: 20,
    minOrderINR: 10000,
    maxDiscountINR: 5000,
    active: true,
    maxUses: 25,
    currentUses: 5,
    createdAt: "2026-09-20T00:00:00.000Z",
  },
];

const globalAny = globalThis as any;

if (!globalAny.__SUTRA_COUPONS__) {
  globalAny.__SUTRA_COUPONS__ = [...INITIAL_COUPONS];
}

export class CouponsStore {
  public static getAll(): CouponRecord[] {
    return globalAny.__SUTRA_COUPONS__;
  }

  public static findByCode(code: string): CouponRecord | undefined {
    return globalAny.__SUTRA_COUPONS__.find(
      (c: CouponRecord) => c.code.toUpperCase() === code.trim().toUpperCase()
    );
  }

  public static add(coupon: Omit<CouponRecord, "id" | "currentUses" | "createdAt">): CouponRecord {
    const newCoupon: CouponRecord = {
      ...coupon,
      id: `coup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: coupon.code.toUpperCase().trim(),
      currentUses: 0,
      createdAt: new Date().toISOString(),
    };
    globalAny.__SUTRA_COUPONS__.unshift(newCoupon);
    return newCoupon;
  }

  public static toggleActive(id: string): CouponRecord | undefined {
    const coupon = globalAny.__SUTRA_COUPONS__.find((c: CouponRecord) => c.id === id);
    if (coupon) {
      coupon.active = !coupon.active;
    }
    return coupon;
  }

  public static delete(id: string): boolean {
    const index = globalAny.__SUTRA_COUPONS__.findIndex((c: CouponRecord) => c.id === id);
    if (index !== -1) {
      globalAny.__SUTRA_COUPONS__.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Validates and applies discount calculation strictly on the server.
   */
  public static validateAndApply(
    code: string,
    orderAmountINR: number,
    serviceIdOrName?: string
  ): {
    valid: boolean;
    discountAmountINR: number;
    finalAmountINR: number;
    coupon?: CouponRecord;
    error?: string;
  } {
    const settings = StudioSettingsStore.getSettings();
    if (!settings.couponsEnabled) {
      return {
        valid: false,
        discountAmountINR: 0,
        finalAmountINR: orderAmountINR,
        error: "Discounts and coupon codes are temporarily disabled by the studio.",
      };
    }

    const coupon = this.findByCode(code);
    if (!coupon) {
      return {
        valid: false,
        discountAmountINR: 0,
        finalAmountINR: orderAmountINR,
        error: "Invalid promo code. Please check the code and try again.",
      };
    }

    if (!coupon.active) {
      return {
        valid: false,
        discountAmountINR: 0,
        finalAmountINR: orderAmountINR,
        error: "This coupon code is currently inactive.",
      };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
      return {
        valid: false,
        discountAmountINR: 0,
        finalAmountINR: orderAmountINR,
        error: "This coupon code has expired.",
      };
    }

    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return {
        valid: false,
        discountAmountINR: 0,
        finalAmountINR: orderAmountINR,
        error: "This coupon code has reached its maximum redemptions limit.",
      };
    }

    if (coupon.minOrderINR && orderAmountINR < coupon.minOrderINR) {
      return {
        valid: false,
        discountAmountINR: 0,
        finalAmountINR: orderAmountINR,
        error: `Coupon requires a minimum order value of ₹${coupon.minOrderINR.toLocaleString("en-IN")}.`,
      };
    }

    let calculatedDiscount = 0;
    if (coupon.discountType === "percentage") {
      calculatedDiscount = Math.round((orderAmountINR * coupon.discountValue) / 100);
      if (coupon.maxDiscountINR && calculatedDiscount > coupon.maxDiscountINR) {
        calculatedDiscount = coupon.maxDiscountINR;
      }
    } else {
      calculatedDiscount = Math.min(orderAmountINR, coupon.discountValue);
    }

    const finalAmount = Math.max(0, orderAmountINR - calculatedDiscount);

    return {
      valid: true,
      discountAmountINR: calculatedDiscount,
      finalAmountINR: finalAmount,
      coupon,
    };
  }

  public static recordUsage(code: string): void {
    const coupon = this.findByCode(code);
    if (coupon) {
      coupon.currentUses += 1;
    }
  }
}
