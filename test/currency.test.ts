import { convertCents, rateBetween, supportedCurrencies, CurrencyError } from "../src/domain/currency";

describe("currency", () => {
  test("converts between currencies using static rates", () => {
    const eurCents = convertCents(10000, "USD", "EUR");
    expect(eurCents).toBe(9200);
  });

  test("round-trip conversion returns to original (within rounding)", () => {
    const eurCents = convertCents(10000, "USD", "EUR");
    const backToUsd = convertCents(eurCents, "EUR", "USD");
    expect(backToUsd).toBeCloseTo(10000, -1);
  });

  test("rejects unsupported currency", () => {
    // @ts-expect-error intentionally invalid currency for runtime check
    expect(() => convertCents(1000, "USD", "XYZ")).toThrow(CurrencyError);
  });

  test("rateBetween returns relative exchange rate", () => {
    expect(rateBetween("USD", "USD")).toBe(1);
    expect(rateBetween("USD", "EUR")).toBeCloseTo(0.92);
  });

  test("supportedCurrencies lists all known codes", () => {
    expect(supportedCurrencies()).toContain("INR");
    expect(supportedCurrencies()).toContain("JPY");
  });
});
