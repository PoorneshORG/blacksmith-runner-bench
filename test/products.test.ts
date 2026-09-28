import { ProductCatalog } from "../src/domain/products";

describe("ProductCatalog", () => {
  let catalog: ProductCatalog;

  beforeEach(() => {
    catalog = new ProductCatalog();
  });

  test("creates a product with cents pricing", () => {
    const product = catalog.create({
      name: "Widget",
      priceUsd: 19.99,
      category: "home",
      weightGrams: 500,
    });
    expect(product.priceCents).toBe(1999);
    expect(product.id.startsWith("prod_")).toBe(true);
  });

  test("rejects invalid input", () => {
    expect(() =>
      catalog.create({
        name: "",
        priceUsd: 10,
        category: "home",
        weightGrams: 100,
      })
    ).toThrow();
  });

  test("lists by category", () => {
    catalog.create({ name: "A", priceUsd: 1, category: "books", weightGrams: 100 });
    catalog.create({ name: "B", priceUsd: 1, category: "electronics", weightGrams: 100 });
    expect(catalog.list("books")).toHaveLength(1);
    expect(catalog.list()).toHaveLength(2);
  });

  test("removes a product", () => {
    const p = catalog.create({ name: "C", priceUsd: 1, category: "apparel", weightGrams: 50 });
    expect(catalog.remove(p.id)).toBe(true);
    expect(catalog.get(p.id)).toBeUndefined();
  });

  test("count tracks catalog size", () => {
    expect(catalog.count()).toBe(0);
    catalog.create({ name: "D", priceUsd: 1, category: "grocery", weightGrams: 10 });
    expect(catalog.count()).toBe(1);
  });
});
