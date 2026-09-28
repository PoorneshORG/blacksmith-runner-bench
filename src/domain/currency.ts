import { Cents } from "../utils/money";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "INR" | "JPY";

const STATIC_RATES_PER_USD: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.1,
  JPY: 149.5,
};

export class CurrencyError extends Error {}

export function convertCents(amountCents: Cents, from: CurrencyCode, to: CurrencyCode): Cents {
  if (!(from in STATIC_RATES_PER_USD) || !(to in STATIC_RATES_PER_USD)) {
    throw new CurrencyError("unsupported currency");
  }
  const usdCents = amountCents / STATIC_RATES_PER_USD[from];
  return Math.round(usdCents * STATIC_RATES_PER_USD[to]);
}

export function rateBetween(from: CurrencyCode, to: CurrencyCode): number {
  return STATIC_RATES_PER_USD[to] / STATIC_RATES_PER_USD[from];
}

export function supportedCurrencies(): CurrencyCode[] {
  return Object.keys(STATIC_RATES_PER_USD) as CurrencyCode[];
}
