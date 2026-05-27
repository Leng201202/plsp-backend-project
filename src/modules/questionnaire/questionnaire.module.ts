import { Module } from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';

@Module({
  providers: [QuestionnaireService]
})
export class QuestionnaireModule {}
