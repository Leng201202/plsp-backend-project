import { Module } from '@nestjs/common';
import { Result } from './entity/result.entity';
import { Submission } from '../submission/entity/submission.entity';
import { ClassificationRule } from '../classification/entity/classification-rule.entity';
import { Answer } from '../submission/entity/answer.entity';
import { TypeOrmModule } from 'node_modules/@nestjs/typeorm';
import { ResultService } from './result.service';

@Module({
    imports: [TypeOrmModule.forFeature([
        Result,
        Submission,
        Answer,
        ClassificationRule,
    ])],
    providers: [ResultService],
    exports: [ResultService],
})
export class ResultModule {}
