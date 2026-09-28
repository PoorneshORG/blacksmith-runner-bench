import { SupplierDirectory } from "../src/domain/suppliers";

describe("SupplierDirectory", () => {
  let directory: SupplierDirectory;

  beforeEach(() => {
    directory = new SupplierDirectory();
  });

  test("onboards a supplier", () => {
    const supplier = directory.onboard({ name: "Acme", leadTimeDays: 5, rating: 4 });
    expect(supplier.id.startsWith("sup_")).toBe(true);
  });

  test("rejects invalid rating on onboard", () => {
    expect(() => directory.onboard({ name: "Bad", leadTimeDays: 5, rating: 6 })).toThrow();
  });

  test("rates an existing supplier", () => {
    const supplier = directory.onboard({ name: "Acme", leadTimeDays: 5, rating: 4 });
    directory.rate(supplier.id, 5);
    expect(directory.get(supplier.id)?.rating).toBe(5);
  });

  test("returns fastest suppliers sorted by lead time", () => {
    directory.onboard({ name: "Slow", leadTimeDays: 20, rating: 3 });
    directory.onboard({ name: "Fast", leadTimeDays: 2, rating: 3 });
    const [fastest] = directory.fastest(1);
    expect(fastest.name).toBe("Fast");
  });

  test("filters best rated suppliers", () => {
    directory.onboard({ name: "A", leadTimeDays: 5, rating: 2 });
    directory.onboard({ name: "B", leadTimeDays: 5, rating: 4.5 });
    expect(directory.bestRated(4)).toHaveLength(1);
  });
});
