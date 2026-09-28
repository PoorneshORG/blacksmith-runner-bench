import { WarehouseRegistry, WarehouseError } from "../src/domain/warehouses";

describe("WarehouseRegistry", () => {
  let registry: WarehouseRegistry;

  beforeEach(() => {
    registry = new WarehouseRegistry();
  });

  test("registers a warehouse", () => {
    const wh = registry.register("Main", "us-west", 1000);
    expect(wh.usedUnits).toBe(0);
    expect(wh.id.startsWith("wh_")).toBe(true);
  });

  test("rejects non-positive capacity", () => {
    expect(() => registry.register("Bad", "us-east", 0)).toThrow(WarehouseError);
  });

  test("allocates and releases units", () => {
    const wh = registry.register("Main", "us-west", 100);
    registry.allocate(wh.id, 40);
    expect(registry.utilization(wh.id)).toBeCloseTo(0.4);
    registry.release(wh.id, 10);
    expect(registry.utilization(wh.id)).toBeCloseTo(0.3);
  });

  test("rejects over-capacity allocation", () => {
    const wh = registry.register("Main", "us-west", 10);
    expect(() => registry.allocate(wh.id, 20)).toThrow(WarehouseError);
  });

  test("lists warehouses by zone", () => {
    registry.register("A", "us-west", 10);
    registry.register("B", "us-east", 10);
    expect(registry.listByZone("us-west")).toHaveLength(1);
  });
});
