import { Module } from '@nestjs/common';
import { ClassificationRuleService } from './classification-rule.service';
import { ClassificationRuleController } from './classification-rule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassificationRule } from './entity/classification-rule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassificationRule])
  ],
  providers: [ClassificationRuleService],
  controllers: [ClassificationRuleController]
})
export class ClassificationRuleModule {}
