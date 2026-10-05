import { StudioSettingsStore } from "./studioSettingsStore";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";

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

const CANONICAL_COUPONS: CouponRecord[] = [
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
    currentUses: 0,
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
    currentUses: 0,
    allowedServices: ["3D Visualization", "3d-modeling", "360 Spatial Tour"],
    createdAt: "2026-09-15T00:00:00.000Z",
  },
];

const globalAny = globalThis as any;

if (!globalAny.__SUTRA_COUPONS__) {
  globalAny.__SUTRA_COUPONS__ = [...CANONICAL_COUPONS];
}

if (!globalAny.__SUTRA_COUPONS_LAST_SYNC__) {
  globalAny.__SUTRA_COUPONS_LAST_SYNC__ = 0;
}

async function persistCouponToFirestore(coupon: CouponRecord): Promise<void> {
  if (!isFirebaseAdminReady()) return;
  try {
    const db = adminDb();
    await db.collection("coupons").doc(coupon.id).set(coupon, { merge: true });
  } catch (err) {
    console.warn(`[CouponsStore] Failed to persist coupon ${coupon.id} to Firestore:`, err);
  }
}

export class CouponsStore {
  public static async syncFromFirestore(force = false): Promise<CouponRecord[]> {
    if (!isFirebaseAdminReady()) {
      return globalAny.__SUTRA_COUPONS__;
    }

    const now = Date.now();
    if (!force && now - globalAny.__SUTRA_COUPONS_LAST_SYNC__ < 5000) {
      return globalAny.__SUTRA_COUPONS__;
    }

    try {
      const db = adminDb();
      const snapshot = await db.collection("coupons").get();
      if (!snapshot.empty) {
        const loaded: CouponRecord[] = [];
        snapshot.forEach((doc) => {
          loaded.push(doc.data() as CouponRecord);
        });
        globalAny.__SUTRA_COUPONS__ = loaded;
      }
      globalAny.__SUTRA_COUPONS_LAST_SYNC__ = now;
      return globalAny.__SUTRA_COUPONS__;
    } catch (err) {
      console.warn("[CouponsStore] syncFromFirestore warning:", err);
      return globalAny.__SUTRA_COUPONS__;
    }
  }

  public static getAll(): CouponRecord[] {
    if (Date.now() - globalAny.__SUTRA_COUPONS_LAST_SYNC__ > 20000) {
      this.syncFromFirestore().catch(() => {});
    }
    return globalAny.__SUTRA_COUPONS__;
  }

  public static findByCode(code: string): CouponRecord | undefined {
    if (!code) return undefined;
    const clean = code.trim().toUpperCase();
    return globalAny.__SUTRA_COUPONS__.find(
      (c: CouponRecord) => c.code.toUpperCase() === clean
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
    persistCouponToFirestore(newCoupon).catch(() => {});
    return newCoupon;
  }

  public static toggleActive(id: string): CouponRecord | undefined {
    const coupon = globalAny.__SUTRA_COUPONS__.find((c: CouponRecord) => c.id === id);
    if (coupon) {
      coupon.active = !coupon.active;
      persistCouponToFirestore(coupon).catch(() => {});
    }
    return coupon;
  }

  public static delete(id: string): boolean {
    const index = globalAny.__SUTRA_COUPONS__.findIndex((c: CouponRecord) => c.id === id);
    if (index !== -1) {
      const removed = globalAny.__SUTRA_COUPONS__.splice(index, 1)[0];
      if (isFirebaseAdminReady() && removed) {
        adminDb().collection("coupons").doc(removed.id).delete().catch(() => {});
      }
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
      persistCouponToFirestore(coupon).catch(() => {});
    }
  }
}
