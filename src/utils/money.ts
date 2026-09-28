import { round } from "lodash";

export type Cents = number;

export function toCents(amount: number): Cents {
  return Math.round(amount * 100);
}

export function fromCents(cents: Cents): number {
  return round(cents / 100, 2);
}

export function formatCurrency(cents: Cents, currency = "USD"): string {
  const value = fromCents(cents);
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export function sumCents(values: Cents[]): Cents {
  return values.reduce((acc, v) => acc + v, 0);
}

export function applyPercentage(cents: Cents, percent: number): Cents {
  if (percent < 0 || percent > 100) {
    throw new Error(`Invalid percentage: ${percent}`);
  }
  return Math.round(cents * (percent / 100));
}
