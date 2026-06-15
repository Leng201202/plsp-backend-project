import { Injectable, Logger } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditAction, AuditModule, AuditStatus } from './entity/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

export interface AuditLogFields {
  employeeId: number;
  action: AuditAction;
  module: AuditModule;
  recordId?: string;
  details?: Record<string, any>;
}

@Injectable()
export class AuditHelper {
  private readonly logger = new Logger(AuditHelper.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  /** Safe wrapper – never throws. Logs a SUCCESS audit entry. */
  async logSuccess(fields: AuditLogFields): Promise<void> {
    await this.log({ ...fields, status: AuditStatus.SUCCESS });
  }

  /**
   * Safe wrapper – never throws. Logs a FAILED audit entry.
   * Appends error message to details when provided.
   */
  async logFailure(fields: AuditLogFields, error?: unknown): Promise<void> {
    const errorMessage =
      error instanceof Error ? error.message : error ? String(error) : undefined;
    const details = errorMessage
      ? { ...(fields.details ?? {}), error: errorMessage }
      : fields.details;
    await this.log({ ...fields, details, status: AuditStatus.FAILED });
  }

  /** Core log method – safe, never throws. */
  async log(fields: AuditLogFields & { status: AuditStatus }): Promise<void> {
    const dto: CreateAuditLogDto = {
      employee_id: fields.employeeId,
      action: fields.action,
      module: fields.module,
      record_id: fields.recordId,
      details: fields.details,
      status: fields.status,
    };
    try {
      await this.auditLogService.create(dto);
    } catch (e) {
      this.logger.error(
        `Failed to persist audit log [${fields.module}:${fields.action}]: ${e instanceof Error ? e.message : e}`,
      );
    }
  }
}
