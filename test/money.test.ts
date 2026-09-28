import { toCents, fromCents, formatCurrency, sumCents, applyPercentage } from "../src/utils/money";

describe("money utils", () => {
  test("toCents converts dollars to integer cents", () => {
    expect(toCents(9.99)).toBe(999);
    expect(toCents(0)).toBe(0);
    expect(toCents(100)).toBe(10000);
  });

  test("fromCents rounds to 2 decimals", () => {
    expect(fromCents(999)).toBe(9.99);
    expect(fromCents(100)).toBe(1);
  });

  test("formatCurrency formats USD", () => {
    expect(formatCurrency(999)).toBe("$9.99");
  });

  test("sumCents adds an array", () => {
    expect(sumCents([100, 200, 300])).toBe(600);
    expect(sumCents([])).toBe(0);
  });

  test("applyPercentage computes discount amount", () => {
    expect(applyPercentage(1000, 10)).toBe(100);
    expect(applyPercentage(1000, 0)).toBe(0);
    expect(applyPercentage(1000, 100)).toBe(1000);
  });

  test("applyPercentage rejects invalid percentages", () => {
    expect(() => applyPercentage(1000, -1)).toThrow();
    expect(() => applyPercentage(1000, 101)).toThrow();
  });
});
