import { BaseModel } from './BaseModel';

export class AuditEvent extends BaseModel {
  static tableName = 'audit_events';

  id!: string;
  actorUserId?: string | null;
  actorRole?: string | null;
  action!: string;
  resource!: string;
  resourceId?: string | null;
  outcome!: 'success' | 'failure' | 'denied';
  requestId!: string;
  ipHash?: string | null;
  metadata!: Record<string, unknown>;
}
