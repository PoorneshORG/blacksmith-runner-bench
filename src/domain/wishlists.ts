export class WishlistError extends Error {}

export class WishlistService {
  private lists = new Map<string, Set<string>>();

  add(userId: string, productId: string): void {
    const set = this.lists.get(userId) ?? new Set<string>();
    set.add(productId);
    this.lists.set(userId, set);
  }

  remove(userId: string, productId: string): void {
    const set = this.lists.get(userId);
    if (!set || !set.has(productId)) {
      throw new WishlistError(`product ${productId} not in wishlist for ${userId}`);
    }
    set.delete(productId);
  }

  contains(userId: string, productId: string): boolean {
    return this.lists.get(userId)?.has(productId) ?? false;
  }

  list(userId: string): string[] {
    return Array.from(this.lists.get(userId) ?? []);
  }

  count(userId: string): number {
    return this.lists.get(userId)?.size ?? 0;
  }

  mostWishlisted(allProductIds: string[]): { productId: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const set of this.lists.values()) {
      for (const productId of set) {
        counts.set(productId, (counts.get(productId) ?? 0) + 1);
      }
    }
    return allProductIds
      .map((productId) => ({ productId, count: counts.get(productId) ?? 0 }))
      .sort((a, b) => b.count - a.count);
  }
}
