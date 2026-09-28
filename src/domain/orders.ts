import { Cart } from "./cart";
import { Inventory } from "./inventory";
import { CouponBook } from "./discounts";
import { Region, totalWithTax } from "./tax";
import { Parcel, shippingCostCents, estimatedDeliveryDays, ShippingZone } from "./shipping";
import { Cents } from "../utils/money";
import { newId } from "../utils/id";

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotalCents: Cents;
  discountCents: Cents;
  taxCents: Cents;
  shippingCents: Cents;
  totalCents: Cents;
  estimatedDeliveryDays: number;
  createdAt: Date;
  history: { status: OrderStatus; at: Date }[];
}

export class OrderError extends Error {}

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export class OrderService {
  private orders = new Map<string, Order>();

  constructor(private inventory: Inventory, private coupons: CouponBook) {}

  placeOrder(params: {
    userId: string;
    cart: Cart;
    region: Region;
    zone: ShippingZone;
    expedited: boolean;
    totalWeightGrams: number;
    couponCodes?: string[];
  }): Order {
    if (params.cart.isEmpty()) throw new OrderError("cart is empty");

    const subtotal = params.cart.subtotalCents();
    const discount = params.couponCodes?.length
      ? this.coupons.stack(params.couponCodes, subtotal)
      : 0;

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const parcel: Parcel = {
      weightGrams: params.totalWeightGrams,
      zone: params.zone,
      expedited: params.expedited,
    };
    const shipping = shippingCostCents(parcel);
    const taxable = discountedSubtotal + shipping;
    const total = totalWithTax(taxable, params.region);
    const taxCents = total - taxable;

    const order: Order = {
      id: newId("order"),
      userId: params.userId,
      status: "pending",
      subtotalCents: subtotal,
      discountCents: discount,
      taxCents,
      shippingCents: shipping,
      totalCents: total,
      estimatedDeliveryDays: estimatedDeliveryDays(params.zone, params.expedited),
      createdAt: new Date(),
      history: [{ status: "pending", at: new Date() }],
    };

    this.orders.set(order.id, order);
    return order;
  }

  transition(orderId: string, next: OrderStatus): Order {
    const order = this.orders.get(orderId);
    if (!order) throw new OrderError(`unknown order: ${orderId}`);
    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed.includes(next)) {
      throw new OrderError(`cannot transition from ${order.status} to ${next}`);
    }
    order.status = next;
    order.history.push({ status: next, at: new Date() });
    return order;
  }

  get(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  listByUser(userId: string): Order[] {
    return Array.from(this.orders.values()).filter((o) => o.userId === userId);
  }
}
