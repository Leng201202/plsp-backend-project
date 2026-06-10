import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entity/question.entity';
import { Answer } from '../submission/entity/answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question,Answer])],
  controllers: [QuestionController],
  providers: [QuestionService],
})
export class QuestionModule {}
