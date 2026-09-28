import { Cents, toCents } from "../utils/money";

export type ShippingZone = "domestic" | "continental" | "international";

export interface Parcel {
  weightGrams: number;
  zone: ShippingZone;
  expedited: boolean;
}

const BASE_RATE_USD: Record<ShippingZone, number> = {
  domestic: 4.99,
  continental: 9.99,
  international: 19.99,
};

const PER_KG_USD: Record<ShippingZone, number> = {
  domestic: 0.5,
  continental: 1.25,
  international: 3.0,
};

const EXPEDITED_MULTIPLIER = 1.75;

export function shippingCostCents(parcel: Parcel): Cents {
  const weightKg = parcel.weightGrams / 1000;
  const base = BASE_RATE_USD[parcel.zone];
  const perKg = PER_KG_USD[parcel.zone] * weightKg;
  let totalUsd = base + perKg;
  if (parcel.expedited) totalUsd *= EXPEDITED_MULTIPLIER;
  return toCents(totalUsd);
}

export function estimatedDeliveryDays(zone: ShippingZone, expedited: boolean): number {
  const base: Record<ShippingZone, number> = {
    domestic: 3,
    continental: 6,
    international: 12,
  };
  const days = base[zone];
  return expedited ? Math.max(1, Math.round(days / 2)) : days;
}
