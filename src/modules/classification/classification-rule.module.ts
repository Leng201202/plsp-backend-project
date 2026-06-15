import { Module } from '@nestjs/common';
import { ClassificationRuleService } from './classification-rule.service';
import { ClassificationRuleController } from './classification-rule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassificationRule } from './entity/classification-rule.entity';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassificationRule]),
    AuditLogModule,
  ],
  providers: [ClassificationRuleService],
  controllers: [ClassificationRuleController]
})
export class ClassificationRuleModule {}
