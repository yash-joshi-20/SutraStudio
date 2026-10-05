/**
 * SUTRA STUDIO — Administrative Audit Trail Ledger Service
 * Records every administrative lifecycle action with before/after state snapshots.
 */

export interface AuditLogEntry {
  id: string;
  who: {
    uid: string;
    email: string;
    name: string;
    role: string;
    ip?: string;
  };
  what:
    | "ORDER_DELIVERED"
    | "STATUS_UPDATED"
    | "CLIENT_STATUS_TOGGLED"
    | "CLIENT_VERIFICATION_RESENT"
    | "CLIENT_NOTE_ADDED"
    | "PLAN_EXTENDED"
    | "PAYMENT_REFUNDED"
    | "SYSTEM_CONFIG_UPDATED"
    | "WORKFLOW_DISPATCH"
    | "KNOWLEDGE_BASE_UPDATED";
  when: string; // ISO 8601 string
  targetType: "order" | "client" | "subscription" | "workflow" | "system";
  targetId: string;
  targetTitle?: string;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  note?: string;
  type: "info" | "success" | "warning" | "error";
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

const globalAny = globalThis as any;

if (!globalAny.__SUTRA_AUDIT_LOGS__) {
  globalAny.__SUTRA_AUDIT_LOGS__ = [...INITIAL_AUDIT_LOGS];
}

export class AuditLogService {
  public static getAll(): AuditLogEntry[] {
    return globalAny.__SUTRA_AUDIT_LOGS__ as AuditLogEntry[];
  }

  public static record(entry: Omit<AuditLogEntry, "id" | "when">): AuditLogEntry {
    const record: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      when: new Date().toISOString(),
      ...entry,
    };

    globalAny.__SUTRA_AUDIT_LOGS__.unshift(record);
    return record;
  }

  public static filter(params: {
    targetType?: string;
    targetId?: string;
    actorEmail?: string;
    action?: string;
    query?: string;
  }): AuditLogEntry[] {
    let list = this.getAll();

    if (params.targetType) {
      list = list.filter((l) => l.targetType === params.targetType);
    }
    if (params.targetId) {
      list = list.filter((l) => l.targetId === params.targetId);
    }
    if (params.actorEmail) {
      list = list.filter((l) => l.who.email.toLowerCase().includes(params.actorEmail!.toLowerCase()));
    }
    if (params.action) {
      list = list.filter((l) => l.what === params.action);
    }
    if (params.query) {
      const q = params.query.toLowerCase();
      list = list.filter(
        (l) =>
          l.what.toLowerCase().includes(q) ||
          l.targetId.toLowerCase().includes(q) ||
          (l.targetTitle && l.targetTitle.toLowerCase().includes(q)) ||
          (l.note && l.note.toLowerCase().includes(q)) ||
          l.who.email.toLowerCase().includes(q)
      );
    }

    return list;
  }
}
