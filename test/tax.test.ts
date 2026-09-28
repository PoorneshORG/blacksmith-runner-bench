import { taxRateFor, taxFor, totalWithTax } from "../src/domain/tax";

describe("tax", () => {
  test("taxRateFor returns correct region rate", () => {
    expect(taxRateFor("US-OR")).toBe(0);
    expect(taxRateFor("EU-DE")).toBe(19);
  });

  test("taxFor computes tax amount", () => {
    expect(taxFor(10000, "US-CA")).toBe(725);
  });

  test("totalWithTax adds tax to subtotal", () => {
    expect(totalWithTax(10000, "US-OR")).toBe(10000);
    expect(totalWithTax(10000, "EU-FR")).toBe(12000);
  });
});
