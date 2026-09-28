import { newId } from "../utils/id";

export interface Warehouse {
  id: string;
  name: string;
  zone: string;
  capacityUnits: number;
  usedUnits: number;
}

export class WarehouseError extends Error {}

export class WarehouseRegistry {
  private warehouses = new Map<string, Warehouse>();

  register(name: string, zone: string, capacityUnits: number): Warehouse {
    if (capacityUnits <= 0) throw new WarehouseError("capacity must be positive");
    const warehouse: Warehouse = {
      id: newId("wh"),
      name,
      zone,
      capacityUnits,
      usedUnits: 0,
    };
    this.warehouses.set(warehouse.id, warehouse);
    return warehouse;
  }

  allocate(id: string, units: number): Warehouse {
    const warehouse = this.warehouses.get(id);
    if (!warehouse) throw new WarehouseError(`unknown warehouse: ${id}`);
    if (warehouse.usedUnits + units > warehouse.capacityUnits) {
      throw new WarehouseError(`warehouse ${id} over capacity`);
    }
    warehouse.usedUnits += units;
    return warehouse;
  }

  release(id: string, units: number): Warehouse {
    const warehouse = this.warehouses.get(id);
    if (!warehouse) throw new WarehouseError(`unknown warehouse: ${id}`);
    warehouse.usedUnits = Math.max(0, warehouse.usedUnits - units);
    return warehouse;
  }

  utilization(id: string): number {
    const warehouse = this.warehouses.get(id);
    if (!warehouse) throw new WarehouseError(`unknown warehouse: ${id}`);
    return warehouse.usedUnits / warehouse.capacityUnits;
  }

  listByZone(zone: string): Warehouse[] {
    return Array.from(this.warehouses.values()).filter((w) => w.zone === zone);
  }
}
