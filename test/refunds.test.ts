import { RefundService, RefundError } from "../src/domain/refunds";

describe("RefundService", () => {
  let refunds: RefundService;

  beforeEach(() => {
    refunds = new RefundService();
  });

  test("requests a refund within order total", () => {
    const refund = refunds.request("order_1", 10000, 5000, "damaged");
    expect(refund.status).toBe("requested");
  });

  test("rejects refund exceeding order total", () => {
    expect(() => refunds.request("order_1", 1000, 5000, "damaged")).toThrow(RefundError);
  });

  test("approves then settles a refund", () => {
    const refund = refunds.request("order_1", 10000, 5000, "damaged");
    refunds.approve(refund.id);
    const settled = refunds.settle(refund.id);
    expect(settled.status).toBe("settled");
  });

  test("rejects settling before approval", () => {
    const refund = refunds.request("order_1", 10000, 5000, "damaged");
    expect(() => refunds.settle(refund.id)).toThrow(RefundError);
  });

  test("totalRefundedFor sums settled refunds for an order", () => {
    const r1 = refunds.request("order_1", 10000, 3000, "a");
    refunds.approve(r1.id);
    refunds.settle(r1.id);
    const r2 = refunds.request("order_1", 10000, 2000, "b");
    refunds.reject(r2.id);
    expect(refunds.totalRefundedFor("order_1")).toBe(3000);
  });
});
