import { render, NotificationQueue } from "../src/domain/notifications";

describe("notifications", () => {
  test("render substitutes template placeholders", () => {
    const text = render("order_confirmed", { name: "Alice", orderId: "order_1", total: "$9.99" });
    expect(text).toBe("Hi Alice, your order order_1 for $9.99 is confirmed.");
  });

  test("render throws for unknown template", () => {
    expect(() => render("nope", {})).toThrow();
  });

  test("NotificationQueue enqueues and flushes", () => {
    const queue = new NotificationQueue();
    queue.enqueue("email", "a@b.com", "order_confirmed", {
      name: "A",
      orderId: "1",
      total: "$1",
    });
    expect(queue.pending()).toBe(1);
    const flushed = queue.flush();
    expect(flushed).toHaveLength(1);
    expect(flushed[0].sentAt).toBeDefined();
    expect(queue.pending()).toBe(0);
    expect(queue.sentCount()).toBe(1);
  });

  test("NotificationQueue tracks multiple channels", () => {
    const queue = new NotificationQueue();
    queue.enqueue("sms", "1234567890", "low_stock", { productId: "p1", available: 2 });
    queue.enqueue("push", "device-1", "order_shipped", { name: "A", orderId: "1", days: 3 });
    expect(queue.pending()).toBe(2);
  });
});
