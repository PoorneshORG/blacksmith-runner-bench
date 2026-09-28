import { Cents, applyPercentage } from "../utils/money";

export type Region = "US-CA" | "US-NY" | "US-OR" | "EU-DE" | "EU-FR" | "IN-KA";

const TAX_RATES: Record<Region, number> = {
  "US-CA": 7.25,
  "US-NY": 8.875,
  "US-OR": 0,
  "EU-DE": 19,
  "EU-FR": 20,
  "IN-KA": 18,
};

export function taxRateFor(region: Region): number {
  return TAX_RATES[region];
}

export function taxFor(subtotalCents: Cents, region: Region): Cents {
  return applyPercentage(subtotalCents, taxRateFor(region));
}

export function totalWithTax(subtotalCents: Cents, region: Region): Cents {
  return subtotalCents + taxFor(subtotalCents, region);
}
