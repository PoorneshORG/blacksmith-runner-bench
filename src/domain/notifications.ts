export type NotificationChannel = "email" | "sms" | "push";

export interface Notification {
  id: string;
  channel: NotificationChannel;
  recipient: string;
  template: string;
  data: Record<string, string | number>;
  sentAt?: Date;
}

const TEMPLATES: Record<string, string> = {
  order_confirmed: "Hi {name}, your order {orderId} for {total} is confirmed.",
  order_shipped: "Hi {name}, your order {orderId} has shipped, arriving in {days} days.",
  low_stock: "Alert: product {productId} is low on stock ({available} left).",
};

export function render(template: string, data: Record<string, string | number>): string {
  const raw = TEMPLATES[template];
  if (!raw) throw new Error(`unknown template: ${template}`);
  return Object.entries(data).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    raw
  );
}

export class NotificationQueue {
  private queue: Notification[] = [];
  private sent: Notification[] = [];
  private counter = 0;

  enqueue(
    channel: NotificationChannel,
    recipient: string,
    template: string,
    data: Record<string, string | number>
  ): Notification {
    this.counter += 1;
    const notification: Notification = {
      id: `notif_${this.counter}`,
      channel,
      recipient,
      template,
      data,
    };
    this.queue.push(notification);
    return notification;
  }

  flush(): Notification[] {
    const flushed = this.queue.map((n) => ({ ...n, sentAt: new Date() }));
    this.sent.push(...flushed);
    this.queue = [];
    return flushed;
  }

  pending(): number {
    return this.queue.length;
  }

  sentCount(): number {
    return this.sent.length;
  }
}
