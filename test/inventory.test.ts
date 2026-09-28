import { Inventory, InventoryError } from "../src/domain/inventory";

describe("Inventory", () => {
  let inventory: Inventory;

  beforeEach(() => {
    inventory = new Inventory();
  });

  test("stocks in and reserves", () => {
    inventory.stockIn("p1", 10);
    const entry = inventory.reserve("p1", 4);
    expect(entry.available).toBe(6);
    expect(entry.reserved).toBe(4);
  });

  test("throws on insufficient stock", () => {
    inventory.stockIn("p1", 2);
    expect(() => inventory.reserve("p1", 5)).toThrow(InventoryError);
  });

  test("releases reserved stock", () => {
    inventory.stockIn("p1", 10);
    inventory.reserve("p1", 5);
    const entry = inventory.release("p1", 2);
    expect(entry.available).toBe(7);
    expect(entry.reserved).toBe(3);
  });

  test("commits reserved stock permanently", () => {
    inventory.stockIn("p1", 10);
    inventory.reserve("p1", 5);
    const entry = inventory.commit("p1", 5);
    expect(entry.reserved).toBe(0);
    expect(entry.available).toBe(5);
  });

  test("rejects non-positive stock-in", () => {
    expect(() => inventory.stockIn("p1", 0)).toThrow(InventoryError);
    expect(() => inventory.stockIn("p1", -1)).toThrow(InventoryError);
  });

  test("isLowStock detects threshold breach", () => {
    inventory.stockIn("p1", 3);
    expect(inventory.isLowStock("p1", 5)).toBe(true);
    expect(inventory.isLowStock("p1", 1)).toBe(false);
    expect(inventory.isLowStock("unknown", 5)).toBe(true);
  });
});
