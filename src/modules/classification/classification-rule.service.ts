import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassificationRule } from './entity/classification-rule.entity';
import { CreateClassificationRuleDto } from './dto/create.classification.dto';
import { validateOverlap, validateScoreRange } from './utils/validate';
import { IsNull, Repository } from 'typeorm';
import { ResponseClassificationRuleDto } from './dto/response-classification-rule.dto';
import { plainToInstance } from 'class-transformer';
import { ClassificationRuleNotFoundException } from 'src/common/exceptions/classification.exception';
import { UpdateClassificationRuleDto } from './dto/update.classification.dto';
import { Employee } from '../employee/entity/employee.entity';
import { Category } from '../category/entity/category.entity';
import { AuditHelper } from '../audit-log/audit-helper.service';
import { AuditAction, AuditModule } from '../audit-log/entity/audit-log.entity';
import { CacheKeys, RedisService } from 'src/common/redis/redis';

@Injectable()
export class ClassificationRuleService {
    constructor(
        @InjectRepository(ClassificationRule)
        private readonly classificationRuleRepository: Repository<ClassificationRule>,
        private readonly audit: AuditHelper,
        private readonly redis: RedisService,
    ) {}

    async create(dto: CreateClassificationRuleDto, employeeId: number) {
        const base = { employeeId, action: AuditAction.CREATE, module: AuditModule.CLASSIFICATION_RULE };
        try {
            validateScoreRange(dto.min_score, dto.max_score);
            await validateOverlap(
                this.classificationRuleRepository,
                dto.category_id,
                dto.min_score,
                dto.max_score,
            );
            const rule = this.classificationRuleRepository.create({
                category: { id: dto.category_id },
                label: dto.label,
                min_score: dto.min_score,
                max_score: dto.max_score,
                is_active: dto.is_active ?? true,
                created_by: { id: employeeId },
            });
            const saved = await this.classificationRuleRepository.save(rule);
            await this.invalidateCategoryCache(dto.category_id);
            await this.audit.logSuccess({
                ...base,
                recordId: saved.id,
                details: { label: saved.label, min_score: saved.min_score, max_score: saved.max_score },
            });
            return plainToInstance(ResponseClassificationRuleDto, saved, { excludeExtraneousValues: true });
        } catch (error) {
            await this.audit.logFailure({ ...base, details: { label: dto.label } }, error);
            throw error;
        }
    }

    async findAll() {
        const rules = await this.classificationRuleRepository.find({
            where: { deleted_at: IsNull() },
            relations: {
                category: true,
                created_by: true,
                updated_by: true,
            },
            order: { created_at: 'DESC' },
        });
        return rules.map(rule =>
            plainToInstance(ResponseClassificationRuleDto, rule, { excludeExtraneousValues: true }),
        );
    }

    async findOne(id: string) {
        const rule = await this.classificationRuleRepository.findOne({
            where: { id, deleted_at: IsNull() },
            relations: {
                category: true,
                created_by: true,
                updated_by: true,
            },
        });
        if (!rule) throw new ClassificationRuleNotFoundException();
        return plainToInstance(ResponseClassificationRuleDto, rule, { excludeExtraneousValues: true });
    }

    async update(id: string, dto: UpdateClassificationRuleDto, employeeId: number) {
        const base = { employeeId, action: AuditAction.UPDATE, module: AuditModule.CLASSIFICATION_RULE, recordId: id };
        let previous: ClassificationRule | undefined;
        try {
            const rule = await this.classificationRuleRepository.findOne({
                where: { id, deleted_at: IsNull() },
                relations: { category: true },
            });
            if (!rule) throw new ClassificationRuleNotFoundException();
            previous = { ...rule };

            const categoryId = dto.category_id ?? rule.category.id;
            const minScore = dto.min_score ?? rule.min_score;
            const maxScore = dto.max_score ?? rule.max_score;
            validateScoreRange(minScore, maxScore);
            await validateOverlap(this.classificationRuleRepository, categoryId, minScore, maxScore, id);

            rule.category = { id: categoryId } as Category;
            rule.min_score = minScore;
            rule.max_score = maxScore;
            rule.label = dto.label ?? rule.label;
            rule.is_active = dto.is_active ?? rule.is_active;
            rule.updated_by = { id: employeeId } as Employee;

            const saved = await this.classificationRuleRepository.save(rule);
            await this.invalidateCategoryCache(categoryId);
            if (previous.category?.id && previous.category.id !== categoryId) {
                await this.invalidateCategoryCache(previous.category.id);
            }
            await this.audit.logSuccess({ ...base, details: { old: previous, new: saved } });
            return plainToInstance(ResponseClassificationRuleDto, saved, { excludeExtraneousValues: true });
        } catch (error) {
            await this.audit.logFailure({ ...base, details: { old: previous, new: dto } }, error);
            throw error;
        }
    }

    async delete(id: string, employeeId: number) {
        const base = { employeeId, action: AuditAction.DELETE, module: AuditModule.CLASSIFICATION_RULE, recordId: id };
        let ruleLabel = '';
        try {
            const rule = await this.classificationRuleRepository.findOne({
                where: { id, deleted_at: IsNull() },
                relations: { category: true },
            });
            if (!rule) throw new ClassificationRuleNotFoundException();
            ruleLabel = rule.label;
            rule.deleted_by = { id: employeeId } as Employee;
            await this.classificationRuleRepository.save(rule);
            await this.classificationRuleRepository.softDelete(id);
            await this.invalidateCategoryCache(rule.category?.id);
            await this.audit.logSuccess({ ...base, details: { label: ruleLabel } });
            return { success: true, message: 'Classification rule deleted successfully' };
        } catch (error) {
            await this.audit.logFailure({ ...base, details: ruleLabel ? { label: ruleLabel } : {} }, error);
            throw error;
        }
    }

    private async invalidateCategoryCache(categoryId?: string): Promise<void> {
        if (!categoryId) {
            return;
        }
        await this.redis.del(CacheKeys.classificationRulesByCategory(categoryId));
    }
}