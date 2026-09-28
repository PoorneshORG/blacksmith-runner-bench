import { Cents } from "../utils/money";
import { newId } from "../utils/id";

export type RefundStatus = "requested" | "approved" | "rejected" | "settled";

export interface Refund {
  id: string;
  orderId: string;
  amountCents: Cents;
  reason: string;
  status: RefundStatus;
  createdAt: Date;
}

export class RefundError extends Error {}

export class RefundService {
  private refunds = new Map<string, Refund>();

  request(orderId: string, orderTotalCents: Cents, amountCents: Cents, reason: string): Refund {
    if (amountCents <= 0) throw new RefundError("refund amount must be positive");
    if (amountCents > orderTotalCents) throw new RefundError("refund exceeds order total");
    const refund: Refund = {
      id: newId("refund"),
      orderId,
      amountCents,
      reason,
      status: "requested",
      createdAt: new Date(),
    };
    this.refunds.set(refund.id, refund);
    return refund;
  }

  approve(id: string): Refund {
    return this.setStatus(id, "requested", "approved");
  }

  reject(id: string): Refund {
    return this.setStatus(id, "requested", "rejected");
  }

  settle(id: string): Refund {
    return this.setStatus(id, "approved", "settled");
  }

  private setStatus(id: string, expected: RefundStatus, next: RefundStatus): Refund {
    const refund = this.refunds.get(id);
    if (!refund) throw new RefundError(`unknown refund: ${id}`);
    if (refund.status !== expected) {
      throw new RefundError(`refund ${id} must be ${expected} to become ${next}`);
    }
    refund.status = next;
    return refund;
  }

  totalRefundedFor(orderId: string): Cents {
    return Array.from(this.refunds.values())
      .filter((r) => r.orderId === orderId && r.status === "settled")
      .reduce((acc, r) => acc + r.amountCents, 0);
  }
}
