export interface LoyaltyEntry {
  points: number;
  reason: string;
  at: Date;
}

export class LoyaltyError extends Error {}

export class LoyaltyLedger {
  private ledgers = new Map<string, LoyaltyEntry[]>();

  earn(userId: string, points: number, reason: string): number {
    if (points <= 0) throw new LoyaltyError("points must be positive");
    const entries = this.ledgers.get(userId) ?? [];
    entries.push({ points, reason, at: new Date() });
    this.ledgers.set(userId, entries);
    return this.balance(userId);
  }

  redeem(userId: string, points: number, reason: string): number {
    if (points <= 0) throw new LoyaltyError("points must be positive");
    const balance = this.balance(userId);
    if (points > balance) throw new LoyaltyError(`insufficient points for ${userId}`);
    const entries = this.ledgers.get(userId) ?? [];
    entries.push({ points: -points, reason, at: new Date() });
    this.ledgers.set(userId, entries);
    return this.balance(userId);
  }

  balance(userId: string): number {
    const entries = this.ledgers.get(userId) ?? [];
    return entries.reduce((acc, e) => acc + e.points, 0);
  }

  history(userId: string): LoyaltyEntry[] {
    return [...(this.ledgers.get(userId) ?? [])];
  }

  tierFor(userId: string): "bronze" | "silver" | "gold" {
    const balance = this.balance(userId);
    if (balance >= 5000) return "gold";
    if (balance >= 1000) return "silver";
    return "bronze";
  }
}
