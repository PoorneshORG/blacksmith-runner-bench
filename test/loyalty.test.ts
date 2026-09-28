import { LoyaltyLedger, LoyaltyError } from "../src/domain/loyalty";

describe("LoyaltyLedger", () => {
  let ledger: LoyaltyLedger;

  beforeEach(() => {
    ledger = new LoyaltyLedger();
  });

  test("earns points", () => {
    const balance = ledger.earn("user_1", 100, "purchase");
    expect(balance).toBe(100);
  });

  test("redeems points against balance", () => {
    ledger.earn("user_1", 100, "purchase");
    const balance = ledger.redeem("user_1", 40, "reward");
    expect(balance).toBe(60);
  });

  test("rejects redeeming more than balance", () => {
    ledger.earn("user_1", 10, "purchase");
    expect(() => ledger.redeem("user_1", 20, "reward")).toThrow(LoyaltyError);
  });

  test("rejects non-positive point operations", () => {
    expect(() => ledger.earn("user_1", 0, "x")).toThrow(LoyaltyError);
  });

  test("history records all entries", () => {
    ledger.earn("user_1", 100, "purchase");
    ledger.redeem("user_1", 30, "reward");
    expect(ledger.history("user_1")).toHaveLength(2);
  });

  test("tierFor reflects balance thresholds", () => {
    expect(ledger.tierFor("user_2")).toBe("bronze");
    ledger.earn("user_2", 1200, "purchase");
    expect(ledger.tierFor("user_2")).toBe("silver");
    ledger.earn("user_2", 4000, "purchase");
    expect(ledger.tierFor("user_2")).toBe("gold");
  });
});
