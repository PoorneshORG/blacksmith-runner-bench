import { Cart } from "../src/domain/cart";
import { ProductCatalog } from "../src/domain/products";
import { Inventory } from "../src/domain/inventory";
import { CouponBook } from "../src/domain/discounts";
import { OrderService, OrderError } from "../src/domain/orders";

describe("OrderService", () => {
  let catalog: ProductCatalog;
  let inventory: Inventory;
  let coupons: CouponBook;
  let orders: OrderService;
  let cart: Cart;
  let productId: string;

  beforeEach(() => {
    catalog = new ProductCatalog();
    inventory = new Inventory();
    coupons = new CouponBook();
    orders = new OrderService(inventory, coupons);
    const product = catalog.create({
      name: "Gadget",
      priceUsd: 50,
      category: "electronics",
      weightGrams: 800,
    });
    productId = product.id;
    inventory.stockIn(productId, 10);
    cart = new Cart(catalog, inventory);
  });

  test("rejects placing an order with an empty cart", () => {
    expect(() =>
      orders.placeOrder({
        userId: "user_1",
        cart,
        region: "US-CA",
        zone: "domestic",
        expedited: false,
        totalWeightGrams: 0,
      })
    ).toThrow(OrderError);
  });

  test("places an order and computes totals", () => {
    cart.addItem(productId, 2);
    const order = orders.placeOrder({
      userId: "user_1",
      cart,
      region: "US-OR",
      zone: "domestic",
      expedited: false,
      totalWeightGrams: 1600,
    });
    expect(order.subtotalCents).toBe(10000);
    expect(order.taxCents).toBe(0);
    expect(order.status).toBe("pending");
  });

  test("applies coupon discount when placing order", () => {
    coupons.register({
      code: "SAVE10",
      kind: "percentage",
      value: 10,
      expiresAt: new Date(Date.now() + 86400000),
    });
    cart.addItem(productId, 2);
    const order = orders.placeOrder({
      userId: "user_1",
      cart,
      region: "US-OR",
      zone: "domestic",
      expedited: false,
      totalWeightGrams: 1600,
      couponCodes: ["SAVE10"],
    });
    expect(order.discountCents).toBe(1000);
  });

  test("valid status transitions succeed", () => {
    cart.addItem(productId, 1);
    const order = orders.placeOrder({
      userId: "user_1",
      cart,
      region: "US-OR",
      zone: "domestic",
      expedited: false,
      totalWeightGrams: 800,
    });
    orders.transition(order.id, "paid");
    orders.transition(order.id, "shipped");
    const shipped = orders.transition(order.id, "delivered");
    expect(shipped.status).toBe("delivered");
    expect(shipped.history).toHaveLength(4);
  });

  test("invalid status transitions throw", () => {
    cart.addItem(productId, 1);
    const order = orders.placeOrder({
      userId: "user_1",
      cart,
      region: "US-OR",
      zone: "domestic",
      expedited: false,
      totalWeightGrams: 800,
    });
    expect(() => orders.transition(order.id, "delivered")).toThrow(OrderError);
  });

  test("listByUser filters orders by user id", () => {
    cart.addItem(productId, 1);
    orders.placeOrder({
      userId: "user_1",
      cart,
      region: "US-OR",
      zone: "domestic",
      expedited: false,
      totalWeightGrams: 800,
    });
    expect(orders.listByUser("user_1")).toHaveLength(1);
    expect(orders.listByUser("user_2")).toHaveLength(0);
  });
});
