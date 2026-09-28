import { z } from "zod";
import { newId } from "../utils/id";

export const SupplierSchema = z.object({
  name: z.string().min(1),
  leadTimeDays: z.number().int().positive(),
  rating: z.number().min(0).max(5),
});

export type SupplierInput = z.infer<typeof SupplierSchema>;

export interface Supplier extends SupplierInput {
  id: string;
  createdAt: Date;
}

export class SupplierDirectory {
  private suppliers = new Map<string, Supplier>();

  onboard(input: SupplierInput): Supplier {
    const parsed = SupplierSchema.parse(input);
    const supplier: Supplier = { id: newId("sup"), ...parsed, createdAt: new Date() };
    this.suppliers.set(supplier.id, supplier);
    return supplier;
  }

  rate(id: string, rating: number): Supplier {
    const supplier = this.suppliers.get(id);
    if (!supplier) throw new Error(`unknown supplier: ${id}`);
    supplier.rating = z.number().min(0).max(5).parse(rating);
    return supplier;
  }

  fastest(count: number): Supplier[] {
    return Array.from(this.suppliers.values())
      .sort((a, b) => a.leadTimeDays - b.leadTimeDays)
      .slice(0, count);
  }

  bestRated(minRating: number): Supplier[] {
    return Array.from(this.suppliers.values()).filter((s) => s.rating >= minRating);
  }

  get(id: string): Supplier | undefined {
    return this.suppliers.get(id);
  }
}
