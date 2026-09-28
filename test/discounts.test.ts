import { CouponBook, DiscountError } from "../src/domain/discounts";

describe("CouponBook", () => {
  let coupons: CouponBook;
  const future = new Date(Date.now() + 1000 * 60 * 60 * 24);
  const past = new Date(Date.now() - 1000 * 60 * 60 * 24);

  beforeEach(() => {
    coupons = new CouponBook();
  });

  test("applies percentage coupon", () => {
    coupons.register({ code: "SAVE10", kind: "percentage", value: 10, expiresAt: future });
    expect(coupons.apply("save10", 1000)).toBe(100);
  });

  test("applies flat coupon capped at subtotal", () => {
    coupons.register({ code: "FLAT5", kind: "flat", value: 5, expiresAt: future });
    expect(coupons.apply("FLAT5", 1000)).toBe(500);
    expect(coupons.apply("FLAT5", 100)).toBe(100);
  });

  test("rejects expired coupon", () => {
    coupons.register({ code: "OLD", kind: "flat", value: 1, expiresAt: past });
    expect(() => coupons.apply("OLD", 1000)).toThrow(DiscountError);
  });

  test("rejects coupon below minimum subtotal", () => {
    coupons.register({
      code: "BIGORDER",
      kind: "percentage",
      value: 20,
      expiresAt: future,
      minSubtotalCents: 5000,
    });
    expect(() => coupons.apply("BIGORDER", 1000)).toThrow(DiscountError);
    expect(coupons.apply("BIGORDER", 5000)).toBe(1000);
  });

  test("stacks multiple coupons sequentially", () => {
    coupons.register({ code: "A", kind: "percentage", value: 10, expiresAt: future });
    coupons.register({ code: "B", kind: "percentage", value: 10, expiresAt: future });
    const discount = coupons.stack(["A", "B"], 1000);
    expect(discount).toBe(100 + 90);
  });

  test("throws for unknown coupon", () => {
    expect(() => coupons.apply("NOPE", 1000)).toThrow(DiscountError);
  });
});
