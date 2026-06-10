import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AnswerItemDto } from '../dto/create-submission.dto';
import { Answer } from '../entity/answer.entity';

@Injectable()
export class AnswerService {
    async saveAnswers(
        manager:EntityManager,
        submissionId: string,
        answers: AnswerItemDto[],
    ):Promise<Answer[]> {
        const answerEntities = answers.map((item)=>{
            return manager.create(Answer, {
                submission: {
                    id: submissionId,
                },
                question: {
                    id: item.question_id,
                },
                selected_value: item.selected_value,
            });
        });
        return manager.save(Answer, answerEntities);
    }
}
