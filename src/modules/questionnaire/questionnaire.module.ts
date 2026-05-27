import { Module } from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import { QuestionnaireController } from './questionnaire.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Questionnaire } from './entity/questionnaire.entity';
import { Status } from '../status/entity/status.entity';
import { Employee } from '../employee/entity/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Questionnaire, Status, Employee])],
  providers: [QuestionnaireService],
  controllers: [QuestionnaireController],
})
export class QuestionnaireModule {}
