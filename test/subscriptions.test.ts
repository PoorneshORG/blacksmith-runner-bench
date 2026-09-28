import { SubscriptionService } from "../src/domain/subscriptions";

describe("SubscriptionService", () => {
  let service: SubscriptionService;
  const start = new Date("2026-01-01T00:00:00Z");

  beforeEach(() => {
    service = new SubscriptionService();
  });

  test("creates a subscription with correct next billing date", () => {
    const sub = service.create("user_1", 999, "monthly", start);
    expect(sub.nextBillingAt.toISOString()).toBe("2026-01-31T00:00:00.000Z");
  });

  test("cancel deactivates subscription", () => {
    const sub = service.create("user_1", 999, "monthly", start);
    const cancelled = service.cancel(sub.id);
    expect(cancelled.active).toBe(false);
  });

  test("advanceBillingCycle moves next billing date forward", () => {
    const sub = service.create("user_1", 999, "quarterly", start);
    const advanced = service.advanceBillingCycle(sub.id);
    expect(advanced.nextBillingAt.getTime()).toBeGreaterThan(sub.startedAt.getTime());
  });

  test("rejects advancing a cancelled subscription", () => {
    const sub = service.create("user_1", 999, "monthly", start);
    service.cancel(sub.id);
    expect(() => service.advanceBillingCycle(sub.id)).toThrow();
  });

  test("dueForBilling returns subscriptions past due", () => {
    service.create("user_1", 999, "monthly", start);
    const due = service.dueForBilling(new Date("2026-02-01T00:00:00Z"));
    expect(due).toHaveLength(1);
  });

  test("annualizedRevenueCents sums active subscriptions", () => {
    service.create("user_1", 1200, "monthly", start);
    const annual = service.annualizedRevenueCents();
    expect(annual).toBeCloseTo((1200 * 365) / 30, 0);
  });
});
