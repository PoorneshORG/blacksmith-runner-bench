import { z } from "zod";
import { newId } from "../utils/id";

export const AddressSchema = z.object({
  line1: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(3),
  country: z.string().length(2),
});

export type AddressInput = z.infer<typeof AddressSchema>;

export interface Address extends AddressInput {
  id: string;
  userId: string;
  isDefault: boolean;
}

export class AddressBook {
  private addresses = new Map<string, Address[]>();

  add(userId: string, input: AddressInput, makeDefault = false): Address {
    const parsed = AddressSchema.parse(input);
    const existing = this.addresses.get(userId) ?? [];
    if (makeDefault) {
      existing.forEach((a) => (a.isDefault = false));
    }
    const address: Address = {
      id: newId("addr"),
      userId,
      ...parsed,
      isDefault: makeDefault || existing.length === 0,
    };
    existing.push(address);
    this.addresses.set(userId, existing);
    return address;
  }

  list(userId: string): Address[] {
    return this.addresses.get(userId) ?? [];
  }

  defaultAddress(userId: string): Address | undefined {
    return this.list(userId).find((a) => a.isDefault);
  }

  remove(userId: string, addressId: string): void {
    const existing = this.addresses.get(userId) ?? [];
    this.addresses.set(
      userId,
      existing.filter((a) => a.id !== addressId)
    );
  }
}
