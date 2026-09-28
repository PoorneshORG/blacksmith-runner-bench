import { Cents, applyPercentage } from "../utils/money";

export type DiscountKind = "percentage" | "flat";

export interface Coupon {
  code: string;
  kind: DiscountKind;
  value: number;
  expiresAt: Date;
  minSubtotalCents?: Cents;
}

export class DiscountError extends Error {}

export class CouponBook {
  private coupons = new Map<string, Coupon>();

  register(coupon: Coupon): void {
    this.coupons.set(coupon.code.toUpperCase(), coupon);
  }

  find(code: string): Coupon | undefined {
    return this.coupons.get(code.toUpperCase());
  }

  apply(code: string, subtotalCents: Cents, now: Date = new Date()): Cents {
    const coupon = this.find(code);
    if (!coupon) throw new DiscountError(`unknown coupon: ${code}`);
    if (coupon.expiresAt.getTime() < now.getTime()) {
      throw new DiscountError(`coupon expired: ${code}`);
    }
    if (coupon.minSubtotalCents && subtotalCents < coupon.minSubtotalCents) {
      throw new DiscountError(`subtotal too low for coupon: ${code}`);
    }

    if (coupon.kind === "percentage") {
      return applyPercentage(subtotalCents, coupon.value);
    }
    const flatCents = Math.round(coupon.value * 100);
    return Math.min(flatCents, subtotalCents);
  }

  stack(codes: string[], subtotalCents: Cents, now: Date = new Date()): Cents {
    let remaining = subtotalCents;
    let totalDiscount = 0;
    for (const code of codes) {
      const discount = this.apply(code, remaining, now);
      totalDiscount += discount;
      remaining -= discount;
      if (remaining < 0) remaining = 0;
    }
    return totalDiscount;
  }
}
