import { NextResponse } from "next/server";
import { CouponsStore } from "@/lib/services/couponsStore";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";

export async function GET(req: Request) {
  const userRole = req.headers.get("x-user-role");
  const all = CouponsStore.getAll();

  if (userRole === "admin") {
    return NextResponse.json({ success: true, coupons: all });
  }

  // Public/client view: return only active non-expired codes without sensitive usage counters
  const publicCoupons = all
    .filter((c) => c.active && (!c.expiresAt || new Date(c.expiresAt).getTime() > Date.now()))
    .map((c) => ({
      code: c.code,
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderINR: c.minOrderINR,
    }));

  return NextResponse.json({ success: true, coupons: publicCoupons });
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`coupon_validate_${ip}`, { maxRequests: 30, windowSeconds: 60 });
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many coupon verification attempts. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { action, code, amountINR, serviceId, newCoupon } = body;

    // Action A: Create new coupon (Admin only)
    if (action === "create") {
      const userRole = req.headers.get("x-user-role");
      if (userRole !== "admin") {
        return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
      }

      if (!newCoupon?.code || !newCoupon?.discountValue) {
        return NextResponse.json({ error: "Code and discount value are required." }, { status: 400 });
      }

      const created = CouponsStore.add(newCoupon);
      return NextResponse.json({ success: true, coupon: created }, { status: 201 });
    }

    // Action B: Validate & Apply coupon during checkout
    if (!code || typeof amountINR !== "number") {
      return NextResponse.json(
        { error: "Missing required parameters: 'code' and 'amountINR'." },
        { status: 400 }
      );
    }

    const validation = CouponsStore.validateAndApply(code, amountINR, serviceId);
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      code: validation.coupon?.code,
      discountAmountINR: validation.discountAmountINR,
      finalAmountINR: validation.finalAmountINR,
      description: validation.coupon?.description,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to process coupon request.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const userRole = req.headers.get("x-user-role");
  if (userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const { id } = await req.json();
  const updated = CouponsStore.toggleActive(id);
  if (!updated) {
    return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, coupon: updated });
}

export async function DELETE(req: Request) {
  const userRole = req.headers.get("x-user-role");
  if (userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing coupon id." }, { status: 400 });
  }

  const deleted = CouponsStore.delete(id);
  return NextResponse.json({ success: deleted });
}
