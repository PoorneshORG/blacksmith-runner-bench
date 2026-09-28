import { assess } from "../src/domain/fraud";

describe("fraud assess", () => {
  test("allows a clean low-risk order", () => {
    const result = assess({
      orderTotalCents: 2000,
      accountAgeDays: 400,
      billingShippingMismatch: false,
      distinctCardsUsed24h: 1,
      velocityOrdersLastHour: 1,
    });
    expect(result.recommendation).toBe("allow");
    expect(result.score).toBe(0);
  });

  test("flags high value new-account order for review", () => {
    const result = assess({
      orderTotalCents: 60000,
      accountAgeDays: 1,
      billingShippingMismatch: false,
      distinctCardsUsed24h: 1,
      velocityOrdersLastHour: 1,
    });
    expect(result.recommendation).toBe("review");
    expect(result.reasons).toContain("high value order");
    expect(result.reasons).toContain("new account");
  });

  test("blocks combination of severe signals", () => {
    const result = assess({
      orderTotalCents: 60000,
      accountAgeDays: 1,
      billingShippingMismatch: true,
      distinctCardsUsed24h: 4,
      velocityOrdersLastHour: 6,
    });
    expect(result.recommendation).toBe("block");
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  test("mismatch alone contributes expected score", () => {
    const result = assess({
      orderTotalCents: 1000,
      accountAgeDays: 400,
      billingShippingMismatch: true,
      distinctCardsUsed24h: 1,
      velocityOrdersLastHour: 1,
    });
    expect(result.score).toBe(20);
  });
});
