import { z } from "zod";
import { newId } from "../utils/id";
import { Cents, toCents } from "../utils/money";

export const ProductSchema = z.object({
  name: z.string().min(1).max(200),
  priceUsd: z.number().positive(),
  category: z.enum(["electronics", "grocery", "apparel", "books", "home"]),
  weightGrams: z.number().positive(),
});

export type ProductInput = z.infer<typeof ProductSchema>;

export interface Product {
  id: string;
  name: string;
  priceCents: Cents;
  category: ProductInput["category"];
  weightGrams: number;
  createdAt: Date;
}

export class ProductCatalog {
  private products = new Map<string, Product>();

  create(input: ProductInput): Product {
    const parsed = ProductSchema.parse(input);
    const product: Product = {
      id: newId("prod"),
      name: parsed.name,
      priceCents: toCents(parsed.priceUsd),
      category: parsed.category,
      weightGrams: parsed.weightGrams,
      createdAt: new Date(),
    };
    this.products.set(product.id, product);
    return product;
  }

  get(id: string): Product | undefined {
    return this.products.get(id);
  }

  list(category?: ProductInput["category"]): Product[] {
    const all = Array.from(this.products.values());
    if (!category) return all;
    return all.filter((p) => p.category === category);
  }

  remove(id: string): boolean {
    return this.products.delete(id);
  }

  count(): number {
    return this.products.size;
  }
}
