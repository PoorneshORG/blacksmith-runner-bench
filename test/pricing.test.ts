import { lineTotal, bulkDiscountFor, priceLineItem, subtotal } from "../src/domain/pricing";

describe("pricing", () => {
  test("lineTotal multiplies unit price by quantity", () => {
    expect(lineTotal({ unitPriceCents: 500, quantity: 3 })).toBe(1500);
  });

  test("bulkDiscountFor picks highest applicable tier", () => {
    expect(bulkDiscountFor(1)).toBe(0);
    expect(bulkDiscountFor(5)).toBe(5);
    expect(bulkDiscountFor(10)).toBe(10);
    expect(bulkDiscountFor(25)).toBe(15);
    expect(bulkDiscountFor(100)).toBe(15);
  });

  test("priceLineItem applies bulk discount", () => {
    const total = priceLineItem({ unitPriceCents: 1000, quantity: 10 });
    expect(total).toBe(9000);
  });

  test("subtotal sums discounted line items", () => {
    const total = subtotal([
      { unitPriceCents: 1000, quantity: 1 },
      { unitPriceCents: 1000, quantity: 10 },
    ]);
    expect(total).toBe(1000 + 9000);
  });
});
