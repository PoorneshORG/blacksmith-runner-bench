import { Cents } from "../utils/money";
import { newId } from "../utils/id";

export interface GiftCard {
  id: string;
  code: string;
  balanceCents: Cents;
  issuedAt: Date;
  redeemedHistory: { amountCents: Cents; at: Date }[];
}

export class GiftCardError extends Error {}

export class GiftCardService {
  private cards = new Map<string, GiftCard>();

  issue(balanceUsd: number): GiftCard {
    if (balanceUsd <= 0) throw new GiftCardError("balance must be positive");
    const code = Math.random().toString(36).slice(2, 10).toUpperCase();
    const card: GiftCard = {
      id: newId("gift"),
      code,
      balanceCents: Math.round(balanceUsd * 100),
      issuedAt: new Date(),
      redeemedHistory: [],
    };
    this.cards.set(card.code, card);
    return card;
  }

  redeem(code: string, amountCents: Cents): GiftCard {
    const card = this.cards.get(code.toUpperCase());
    if (!card) throw new GiftCardError(`unknown gift card: ${code}`);
    if (amountCents > card.balanceCents) throw new GiftCardError("insufficient gift card balance");
    card.balanceCents -= amountCents;
    card.redeemedHistory.push({ amountCents, at: new Date() });
    return card;
  }

  balance(code: string): Cents {
    const card = this.cards.get(code.toUpperCase());
    if (!card) throw new GiftCardError(`unknown gift card: ${code}`);
    return card.balanceCents;
  }
}
