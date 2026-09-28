export interface StockEntry {
  productId: string;
  available: number;
  reserved: number;
}

export class InventoryError extends Error {}

export class Inventory {
  private stock = new Map<string, StockEntry>();

  stockIn(productId: string, quantity: number): StockEntry {
    if (quantity <= 0) throw new InventoryError("quantity must be positive");
    const entry = this.stock.get(productId) ?? { productId, available: 0, reserved: 0 };
    entry.available += quantity;
    this.stock.set(productId, entry);
    return entry;
  }

  reserve(productId: string, quantity: number): StockEntry {
    const entry = this.stock.get(productId);
    if (!entry || entry.available < quantity) {
      throw new InventoryError(`insufficient stock for ${productId}`);
    }
    entry.available -= quantity;
    entry.reserved += quantity;
    return entry;
  }

  release(productId: string, quantity: number): StockEntry {
    const entry = this.stock.get(productId);
    if (!entry || entry.reserved < quantity) {
      throw new InventoryError(`cannot release more than reserved for ${productId}`);
    }
    entry.reserved -= quantity;
    entry.available += quantity;
    return entry;
  }

  commit(productId: string, quantity: number): StockEntry {
    const entry = this.stock.get(productId);
    if (!entry || entry.reserved < quantity) {
      throw new InventoryError(`cannot commit more than reserved for ${productId}`);
    }
    entry.reserved -= quantity;
    return entry;
  }

  get(productId: string): StockEntry | undefined {
    return this.stock.get(productId);
  }

  isLowStock(productId: string, threshold: number): boolean {
    const entry = this.stock.get(productId);
    if (!entry) return true;
    return entry.available <= threshold;
  }
}
