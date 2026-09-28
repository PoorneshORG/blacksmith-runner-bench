import { Cart, CartError } from "../src/domain/cart";
import { ProductCatalog } from "../src/domain/products";
import { Inventory } from "../src/domain/inventory";

describe("Cart", () => {
  let catalog: ProductCatalog;
  let inventory: Inventory;
  let cart: Cart;
  let productId: string;

  beforeEach(() => {
    catalog = new ProductCatalog();
    inventory = new Inventory();
    const product = catalog.create({
      name: "Widget",
      priceUsd: 10,
      category: "home",
      weightGrams: 200,
    });
    productId = product.id;
    inventory.stockIn(productId, 20);
    cart = new Cart(catalog, inventory);
  });

  test("adds an item and reserves stock", () => {
    cart.addItem(productId, 3);
    expect(cart.itemCount()).toBe(3);
    expect(inventory.get(productId)?.reserved).toBe(3);
  });

  test("rejects unknown product", () => {
    expect(() => cart.addItem("nope", 1)).toThrow(CartError);
  });

  test("removes an item and releases stock", () => {
    cart.addItem(productId, 5);
    cart.removeItem(productId, 2);
    expect(cart.itemCount()).toBe(3);
    expect(inventory.get(productId)?.available).toBe(17);
  });

  test("computes subtotal with bulk discount", () => {
    cart.addItem(productId, 10);
    expect(cart.subtotalCents()).toBe(9000);
  });

  test("clear releases all reservations", () => {
    cart.addItem(productId, 4);
    cart.clear();
    expect(cart.isEmpty()).toBe(true);
    expect(inventory.get(productId)?.available).toBe(20);
  });
});
