export interface AuditEntry {
  id: number;
  actor: string;
  action: string;
  targetId: string;
  at: Date;
  metadata?: Record<string, unknown>;
}

export class AuditLog {
  private entries: AuditEntry[] = [];
  private counter = 0;

  record(actor: string, action: string, targetId: string, metadata?: Record<string, unknown>): AuditEntry {
    this.counter += 1;
    const entry: AuditEntry = { id: this.counter, actor, action, targetId, at: new Date(), metadata };
    this.entries.push(entry);
    return entry;
  }

  forTarget(targetId: string): AuditEntry[] {
    return this.entries.filter((e) => e.targetId === targetId);
  }

  forActor(actor: string): AuditEntry[] {
    return this.entries.filter((e) => e.actor === actor);
  }

  between(start: Date, end: Date): AuditEntry[] {
    return this.entries.filter((e) => e.at.getTime() >= start.getTime() && e.at.getTime() <= end.getTime());
  }

  count(): number {
    return this.entries.length;
  }
}
