import { Cents, applyPercentage, sumCents } from "../utils/money";

export interface LineItem {
  unitPriceCents: Cents;
  quantity: number;
}

export interface BulkTier {
  minQuantity: number;
  discountPercent: number;
}

const DEFAULT_BULK_TIERS: BulkTier[] = [
  { minQuantity: 5, discountPercent: 5 },
  { minQuantity: 10, discountPercent: 10 },
  { minQuantity: 25, discountPercent: 15 },
];

export function lineTotal(item: LineItem): Cents {
  return item.unitPriceCents * item.quantity;
}

export function bulkDiscountFor(quantity: number, tiers: BulkTier[] = DEFAULT_BULK_TIERS): number {
  const applicable = tiers
    .filter((t) => quantity >= t.minQuantity)
    .sort((a, b) => b.discountPercent - a.discountPercent);
  return applicable.length > 0 ? applicable[0].discountPercent : 0;
}

export function priceLineItem(item: LineItem, tiers?: BulkTier[]): Cents {
  const gross = lineTotal(item);
  const discountPercent = bulkDiscountFor(item.quantity, tiers);
  const discount = applyPercentage(gross, discountPercent);
  return gross - discount;
}

export function subtotal(items: LineItem[]): Cents {
  return sumCents(items.map((item) => priceLineItem(item)));
}
