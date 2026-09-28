import { shippingCostCents, estimatedDeliveryDays } from "../src/domain/shipping";

describe("shipping", () => {
  test("computes domestic shipping cost", () => {
    const cost = shippingCostCents({ weightGrams: 1000, zone: "domestic", expedited: false });
    expect(cost).toBe(549);
  });

  test("applies expedited multiplier", () => {
    const normal = shippingCostCents({ weightGrams: 1000, zone: "domestic", expedited: false });
    const expedited = shippingCostCents({ weightGrams: 1000, zone: "domestic", expedited: true });
    expect(expedited).toBeGreaterThan(normal);
  });

  test("international costs more than domestic", () => {
    const domestic = shippingCostCents({ weightGrams: 2000, zone: "domestic", expedited: false });
    const intl = shippingCostCents({ weightGrams: 2000, zone: "international", expedited: false });
    expect(intl).toBeGreaterThan(domestic);
  });

  test("estimatedDeliveryDays halves for expedited", () => {
    expect(estimatedDeliveryDays("continental", false)).toBe(6);
    expect(estimatedDeliveryDays("continental", true)).toBe(3);
  });

  test("estimatedDeliveryDays never drops below 1", () => {
    expect(estimatedDeliveryDays("domestic", true)).toBeGreaterThanOrEqual(1);
  });
});
