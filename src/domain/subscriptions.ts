import dayjs from "dayjs";
import { Cents } from "../utils/money";
import { newId } from "../utils/id";

export type BillingCycle = "monthly" | "quarterly" | "annual";

export interface Subscription {
  id: string;
  userId: string;
  planCents: Cents;
  cycle: BillingCycle;
  startedAt: Date;
  nextBillingAt: Date;
  active: boolean;
}

const CYCLE_DAYS: Record<BillingCycle, number> = {
  monthly: 30,
  quarterly: 90,
  annual: 365,
};

export class SubscriptionService {
  private subs = new Map<string, Subscription>();

  create(userId: string, planCents: Cents, cycle: BillingCycle, startedAt: Date = new Date()): Subscription {
    const sub: Subscription = {
      id: newId("sub"),
      userId,
      planCents,
      cycle,
      startedAt,
      nextBillingAt: dayjs(startedAt).add(CYCLE_DAYS[cycle], "day").toDate(),
      active: true,
    };
    this.subs.set(sub.id, sub);
    return sub;
  }

  cancel(id: string): Subscription {
    const sub = this.subs.get(id);
    if (!sub) throw new Error(`unknown subscription: ${id}`);
    sub.active = false;
    return sub;
  }

  advanceBillingCycle(id: string): Subscription {
    const sub = this.subs.get(id);
    if (!sub) throw new Error(`unknown subscription: ${id}`);
    if (!sub.active) throw new Error(`subscription ${id} is not active`);
    sub.nextBillingAt = dayjs(sub.nextBillingAt).add(CYCLE_DAYS[sub.cycle], "day").toDate();
    return sub;
  }

  dueForBilling(now: Date = new Date()): Subscription[] {
    return Array.from(this.subs.values()).filter(
      (s) => s.active && s.nextBillingAt.getTime() <= now.getTime()
    );
  }

  annualizedRevenueCents(): Cents {
    return Array.from(this.subs.values())
      .filter((s) => s.active)
      .reduce((acc, s) => acc + (s.planCents * 365) / CYCLE_DAYS[s.cycle], 0);
  }
}
