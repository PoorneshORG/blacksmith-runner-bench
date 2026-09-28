import { Inventory } from "./inventory";
import { ProductCatalog } from "./products";
import { Cents } from "../utils/money";
import { priceLineItem, LineItem } from "./pricing";

export interface CartEntry {
  productId: string;
  quantity: number;
}

export class CartError extends Error {}

export class Cart {
  private entries = new Map<string, number>();

  constructor(private catalog: ProductCatalog, private inventory: Inventory) {}

  addItem(productId: string, quantity: number): void {
    if (quantity <= 0) throw new CartError("quantity must be positive");
    const product = this.catalog.get(productId);
    if (!product) throw new CartError(`unknown product: ${productId}`);

    const existing = this.entries.get(productId) ?? 0;
    const nextQuantity = existing + quantity;
    this.inventory.reserve(productId, quantity);
    this.entries.set(productId, nextQuantity);
  }

  removeItem(productId: string, quantity: number): void {
    const existing = this.entries.get(productId) ?? 0;
    if (quantity > existing) throw new CartError("cannot remove more than in cart");
    this.inventory.release(productId, quantity);
    const next = existing - quantity;
    if (next === 0) this.entries.delete(productId);
    else this.entries.set(productId, next);
  }

  lineItems(): LineItem[] {
    return Array.from(this.entries.entries()).map(([productId, quantity]) => {
      const product = this.catalog.get(productId)!;
      return { unitPriceCents: product.priceCents, quantity };
    });
  }

  subtotalCents(): Cents {
    return this.lineItems().reduce((acc, item) => acc + priceLineItem(item), 0);
  }

  itemCount(): number {
    return Array.from(this.entries.values()).reduce((acc, q) => acc + q, 0);
  }

  isEmpty(): boolean {
    return this.entries.size === 0;
  }

  clear(): void {
    for (const [productId, quantity] of this.entries.entries()) {
      this.inventory.release(productId, quantity);
    }
    this.entries.clear();
  }
}
