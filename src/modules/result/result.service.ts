import { Injectable } from '@nestjs/common';
import { Submission } from '../submission/entity/submission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Result } from './entity/result.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository, EntityManager, In } from 'typeorm';
import { Answer } from '../submission/entity/answer.entity';
import { ClassificationRule } from '../classification/entity/classification-rule.entity';
import { SubmissionNotFoundException } from 'src/common/exceptions/submission.exception';
import { AnswerNotFoundException } from 'src/common/exceptions/answer.exception';
import { calculateCategoryScore } from './utils/result-calculation.util';
import { ResultFilterDto, ResultSearchDto } from './dto/result-search.dto';
import { ResultBulkActionDto, ResultSelectionMode } from './dto/result-bulk-action.dto';
import { Employee } from '../employee/entity/employee.entity';
import { ResultExportDto, ResultExportMode } from './dto/result-export.dto';
import { ResultExportService } from './export/result-export.service';
import { ExportResultRow } from './export/interfaces/result-exporter.interface';
import { AuditHelper } from '../audit-log/audit-helper.service';
import { AuditAction, AuditModule } from '../audit-log/entity/audit-log.entity';
import { CacheKeys, RedisService } from 'src/common/redis/redis';

@Injectable()
export class ResultService {

    constructor(
        private readonly resultExportService: ResultExportService,
        @InjectRepository(Result)
        private readonly resultRepository: Repository<Result>,
        @InjectRepository(Submission)
        private readonly submissionRepository: Repository<Submission>,
        @InjectRepository(Answer)
        private readonly answerRepository: Repository<Answer>,
        @InjectRepository(ClassificationRule)
        private readonly classificationRuleRepository: Repository<ClassificationRule>,
        private readonly audit: AuditHelper,
        private readonly redis: RedisService,
    ) {}

    //Result-Service for Result Controller

    async search(dto: ResultSearchDto) {
        const page=dto.pagination?.page??1;
        const limit=dto.pagination?.limit??10;
        const skip=(page-1)*limit;

        const sortField=dto.sort?.field??'calculate_at';
        const sortDirection=dto.sort?.order??'DESC';

        const qb= this.createResultFilterQuery(dto.filter);
        const [data,total]=await qb
            .orderBy(`result.${sortField}`, sortDirection)
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            success: true,
            total,
            page,
            limit,
            data
        };
    }
    // helper function for createResultFilterQuery in Search Method
    private createResultFilterQuery(filter?: ResultFilterDto) {
        const qb=this.resultRepository
            .createQueryBuilder('result')
            .leftJoinAndSelect('result.submission','submission')
            .leftJoinAndSelect('submission.questionnaire','questionnaire')
            .leftJoinAndSelect('result.category','category')
            .leftJoinAndSelect('result.classificationRule','classificationRule');
        
        if(filter?.questionnaireId?.length){
            qb.where('questionnaire.id IN (:...questionnaireIds)',{
                questionnaireIds: filter.questionnaireId,
            });
        }
        if(filter?.categoryId?.length){
            qb.where('category.id IN (:...categoryIds)',{
                categoryIds: filter.categoryId,
            });
        }
        if(filter?.classificationId?.length){
            qb.andWhere('classificationRule.id IN (:...classificationIds)',{
                classificationIds: filter.classificationId,
            });
        }
        if(filter?.startDate){
            qb.andWhere('result.calculate_at >= :startDate',{
                startDate: new Date(filter.startDate),
            });
        }
        if(filter?.endDate){
            qb.andWhere('result.calculate_at <= :endDate',{
                endDate: new Date(filter.endDate),
            });
        }
        return qb;
    }


    async deleteMany(dto: ResultBulkActionDto,currentUser: number) {
        const employeeId = dto.deletedBy ?? currentUser;
        const base = { employeeId, action: AuditAction.DELETE, module: AuditModule.RESULT };
        try {
            const resultsIds= await this.resolveSelectedResultsIds(dto);
            
            if(!resultsIds.length){
                throw new Error('No results to delete.');
            }
            if(dto.deletedBy){
                await this.resultRepository.update(
                    {id: In(resultsIds)},
                    {
                        deleted_by: {
                            id: dto.deletedBy,
                        }as Employee
                    }
                );
            }
            await this.resultRepository.softDelete(resultsIds);
            await this.audit.logSuccess({
                ...base,
                details: { deletedCount: resultsIds.length, resultIds: resultsIds },
            });
            return {
                success: true,
                message: 'Results deleted successfully.',
                deletedCount: resultsIds.length,
            };
        } catch (error) {
            await this.audit.logFailure({ ...base, details: { mode: dto.mode } }, error);
            throw error;
        }
    }

    // helper function for deleteMany Method
    // resolve the selected results ids from dto
    private async resolveSelectedResultsIds(dto: ResultBulkActionDto): Promise<string[]> {
        if(dto.mode===ResultSelectionMode.SELECTED){
            return dto.resultIds??[];
        }
        const qb= this.createResultFilterQuery(dto.filter)
            .select('result.id','id');
        if(dto.excludeIds?.length){
            qb.where('result.id NOT IN (:...excludeIds)',{
                excludeIds: dto.excludeIds,
            });
        }
        const rows= await qb.getRawMany<{id:string}>();
        return rows.map((row)=>row.id);
    }

    async exportResult(dto: ResultExportDto) {
        const employeeId = 0; // no auth context — system
        const base = { employeeId, action: AuditAction.EXPORT, module: AuditModule.RESULT };
        try {
            const rows = await this.resolveExportRows(dto);
            const file = await this.resultExportService.export(dto.format, rows);
            await this.audit.logSuccess({
                ...base,
                details: { format: dto.format, rowCount: rows.length },
            });
            return file;
        } catch (error) {
            await this.audit.logFailure({ ...base, details: { format: dto.format } }, error);
            throw error;
        }
    }
    
    private async resolveExportRows(
        dto: ResultExportDto,
        ): Promise<ExportResultRow[]> {
        let results: Result[];

        if (dto.mode === ResultExportMode.SELECTED) {
            results = await this.resultRepository.find({
            where: {
                id: In(dto.resultIds ?? []),
            },
            relations: {
                submission: {
                questionnaire: true,
                },
                category: true,
                classificationRule: true,
            },
            });
        } else {
            const qb = this.createResultFilterQuery(dto.filters);

            if (dto.excludedIds?.length) {
            qb.andWhere(
                'result.id NOT IN (:...excludedIds)',
                {
                excludedIds: dto.excludedIds,
                },
            );
            }

            results = await qb.getMany();
        }

        return results.map((result) => ({
            questionnaireTitle: result.submission.questionnaire.title,
            submissionId: result.submission.id,
            anonymousSessionId: result.submission.anonymousSessionId,
            submittedAt: result.submission.submitted_at,
            categoryName: result.category.name,
            rawTotalScore: Number(result.rawTotalScore),
            percentage: Number(result.percentage),
            classification: result.classification,
            calculatedAt: result.calculated_at,
        }));
    }
    


    //Result-Calculation That use in Submission Service
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

       if (manager) {
         return repo.findOne({
           where: {
             category: { id: categoryId },
             is_active: true,
             min_score: LessThanOrEqual(score),
             max_score: MoreThanOrEqual(score),
           },
         });
       }

       const rules = await this.redis.getOrSet(
         CacheKeys.classificationRulesByCategory(categoryId),
         () =>
           repo.find({
             where: {
               category: { id: categoryId },
               is_active: true,
             },
           }),
       );

       return (
         rules.find(
           (rule) => score >= Number(rule.min_score) && score <= Number(rule.max_score),
         ) ?? null
       );
    }
}
