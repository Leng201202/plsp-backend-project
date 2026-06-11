import { Injectable } from '@nestjs/common';
import { Submission } from '../submission/entity/submission.entity';
import { InjectRepository } from 'node_modules/@nestjs/typeorm';
import { Result } from './entity/result.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository, EntityManager } from 'typeorm';
import { Answer } from '../submission/entity/answer.entity';
import { ClassificationRule } from '../classification/entity/classification-rule.entity';
import { SubmissionNotFoundException } from 'src/common/exceptions/submission.exception';
import { AnswerNotFoundException } from 'src/common/exceptions/answer.exception';
import { calculateCategoryScore } from './utils/result-calculation.util';

@Injectable()
export class ResultService {
    constructor(
        @InjectRepository(Result)
        private readonly resultRepository: Repository<Result>,
        @InjectRepository(Submission)
        private readonly submissionRepository: Repository<Submission>,
        @InjectRepository(Answer)
        private readonly answerRepository: Repository<Answer>,
        @InjectRepository(ClassificationRule)
        private readonly classificationRuleRepository: Repository<ClassificationRule>,
    ) {} 
    
    //calculate by submission 
    async calculate(submissionID: string, manager?: EntityManager):Promise<Result[]>{
        const submission=await this.findSubmission(submissionID, manager);
        const answers=await this.loadAnswer(submissionID, manager);
        const groupedAnswers=this.groupAnswersByCategory(answers);
        const results=await this.buildResults(submission, groupedAnswers, manager);
        return manager ? manager.save(Result, results) : this.resultRepository.save(results);
    }
    private async findSubmission(submissionID: string, manager?: EntityManager):Promise<Submission>{
        const repo = manager ? manager.getRepository(Submission) : this.submissionRepository;
        const submission=await repo.findOne({
            where: {
                id: submissionID,
            },
        });
        if(!submission){
            throw new SubmissionNotFoundException();
        }
        return submission;
    }

    private async loadAnswer(submissionID: string, manager?: EntityManager):Promise<Answer[]>{
        const repo = manager ? manager.getRepository(Answer) : this.answerRepository;
        const answers=await repo.find({
            where: {
                submission: {
                    id: submissionID,
                },
            },
            relations: {
                question:{
                    category: true,
                }
            }
        });
        if(!answers){
            throw new AnswerNotFoundException();
        }
        return answers;
    }

    private groupAnswersByCategory(
        answers:Answer[],
    ):Map<string,Answer[]>{
        const group=new Map<string,Answer[]>();

        for(const answer of answers){
            const categoryId=answer.question.category.id;
            if(!group.has(categoryId)){
                group.set(categoryId,[]);
            }
            group.get(categoryId)!.push(answer);
        }

        return group;
    }

    private async buildResults(
        submission: Submission,
        groupedAnswers: Map<string,Answer[]>,
        manager?: EntityManager,
    ):Promise<Result[]>{
        const repo = manager ? manager.getRepository(Result) : this.resultRepository;
        const results:Result[]=[];
        
        for(const [categoryId,answers] of groupedAnswers){
            const calculation=calculateCategoryScore(
                answers.map((answer)=> ({
                    selectedValue:answer.selected_value,
                    weight:answer.question.weight,
                })),
            );
            
            const rule = await this.findClassificationRule(
                categoryId,
                calculation.finalScore,
                manager
            );
            const result = repo.create({
                submission,
                category:answers[0].question.category,
                rawTotalScore:calculation.rawTotalScore,
                percentage:calculation.percentage,
                classificationRule:rule ?? undefined,
                classification: rule?.label ?? 'Unclassified',
            });
            
            results.push(result);            
        }
        return results;
    }

    private async findClassificationRule(
        categoryId: string,
        score: number,
        manager?: EntityManager,
    ):Promise<ClassificationRule | null>{
       const repo = manager ? manager.getRepository(ClassificationRule) : this.classificationRuleRepository;
       return repo.findOne({
            where: {
                category:{
                    id: categoryId,
                },
                is_active: true,
                min_score: LessThanOrEqual(score),
                max_score: MoreThanOrEqual(score),
            },
        });
    }
}
