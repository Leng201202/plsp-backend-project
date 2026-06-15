import { Expose, Type } from 'class-transformer';
import {
  AuditAction,
  AuditModule,
  AuditStatus,
} from '../entity/audit-log.entity';

class AuditEmployeeDto {
  @Expose()
  id: number;

  @Expose()
  fullName: string;

  @Expose()
  email: string;
}

export class ResponseAuditLogDto {
  @Expose()
  id: string;

  @Expose()
  action: AuditAction;

  @Expose()
  module: AuditModule;

  @Expose()
  record_id: string;

  @Expose()
  details: Record<string, any>;

  @Expose()
  status: AuditStatus;

  @Expose()
  ip_address: string;

  @Expose()
  user_agent: string;

  @Expose()
  timestamp: Date;

  @Expose()
  @Type(() => AuditEmployeeDto)
  employee: AuditEmployeeDto;
}