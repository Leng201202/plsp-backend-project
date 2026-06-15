import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entity/audit-log.entity';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { AuditHelper } from './audit-helper.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([AuditLog]),
    ],
    providers: [AuditLogService, AuditHelper],
    controllers: [AuditLogController],
    exports: [AuditLogService, AuditHelper],
})
export class AuditLogModule {}
