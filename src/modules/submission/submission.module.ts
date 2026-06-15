import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './entity/submission.entity';
import { Answer } from './entity/answer.entity';
import { Questionnaire } from '../questionnaire/entity/questionnaire.entity';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './service/submission.service';
import { AnswerService } from './service/answer.service';
import { ResultModule } from '../result/result.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Submission, Answer, Questionnaire]),
        ResultModule,
        AuditLogModule,
    ],
    controllers: [SubmissionController],
    providers: [SubmissionService, AnswerService],
})
export class SubmissionModule {}
