import { AuditAction, AuditModule, AuditStatus } from '../entity/audit-log.entity';

export class CreateAuditLogDto {
  employee_id?: number;
  action: AuditAction;
  module: AuditModule;
  record_id?: string;
  details?: Record<string, any>;
  status?: AuditStatus;
  ip_address?: string;
  user_agent?: string;
}