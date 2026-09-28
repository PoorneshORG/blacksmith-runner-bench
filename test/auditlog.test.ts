import { AuditLog } from "../src/domain/auditlog";

describe("AuditLog", () => {
  let log: AuditLog;

  beforeEach(() => {
    log = new AuditLog();
  });

  test("records an entry with incrementing ids", () => {
    const a = log.record("admin_1", "create", "order_1");
    const b = log.record("admin_1", "update", "order_1");
    expect(a.id).toBe(1);
    expect(b.id).toBe(2);
  });

  test("forTarget filters by target id", () => {
    log.record("admin_1", "create", "order_1");
    log.record("admin_1", "create", "order_2");
    expect(log.forTarget("order_1")).toHaveLength(1);
  });

  test("forActor filters by actor", () => {
    log.record("admin_1", "create", "order_1");
    log.record("admin_2", "create", "order_2");
    expect(log.forActor("admin_1")).toHaveLength(1);
  });

  test("between filters by time range", () => {
    log.record("admin_1", "create", "order_1");
    const now = new Date();
    const past = new Date(now.getTime() - 10000);
    const future = new Date(now.getTime() + 10000);
    expect(log.between(past, future)).toHaveLength(1);
    expect(log.between(future, future)).toHaveLength(0);
  });

  test("count reflects total entries recorded", () => {
    log.record("admin_1", "create", "order_1");
    log.record("admin_1", "create", "order_2");
    expect(log.count()).toBe(2);
  });
});
