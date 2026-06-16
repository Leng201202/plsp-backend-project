import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { EmployeeModule } from './modules/employee/employee.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { QuestionnaireModule } from './modules/questionnaire/questionnaire.module';
import { QuestionModule } from './modules/question/question.module';
import { StatusModule } from './modules/status/status.module';
import { CategoryModule } from './modules/category/category.module';
import { Employee } from './modules/employee/entity/employee.entity';
import { Status } from './modules/status/entity/status.entity';
import { Category } from './modules/category/entity/category.entity';
import { Questionnaire } from './modules/questionnaire/entity/questionnaire.entity';
import { Question } from './modules/question/entity/question.entity';
import { SubmissionModule } from './modules/submission/submission.module';
import { Submission } from './modules/submission/entity/submission.entity';
import { Answer } from './modules/submission/entity/answer.entity';
import { ClassificationRuleModule } from './modules/classification/classification-rule.module';
import { ClassificationRule } from './modules/classification/entity/classification-rule.entity';
import { ResultModule } from './modules/result/result.module';
import { Result } from './modules/result/entity/result.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([
      Employee,
      Status,
      Category,
      Questionnaire,
      Question,
      Submission,
      Answer,
      ClassificationRule,
      Result,
    ]),
    EmployeeModule,
    QuestionnaireModule,
    QuestionModule,
    StatusModule,
    CategoryModule,
    SubmissionModule,
    ClassificationRuleModule,
    ResultModule,
  ],
  providers: [
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
