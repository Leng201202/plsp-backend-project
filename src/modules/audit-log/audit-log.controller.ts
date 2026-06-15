import { Controller, Get } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { ResponseAuditLogDto } from './dto/response-audit-log.dto';

@Controller('audit-log')
export class AuditLogController {
    constructor(
        private readonly auditLogService:AuditLogService
    ){}

    @Get()
    async findAll():Promise<ResponseAuditLogDto[]>{
        return this.auditLogService.findAll();
    }
}
