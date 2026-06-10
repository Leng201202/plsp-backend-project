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

@Injectable()
export class ClassificationRuleService {
    constructor(
        @InjectRepository(ClassificationRule) private classificationRuleRepository: Repository<ClassificationRule>,
    ) {}

    async create(dto: CreateClassificationRuleDto) {
        validateScoreRange(dto.min_score, dto.max_score);
        await validateOverlap(
            this.classificationRuleRepository,
            dto.category_id,
            dto.min_score,
            dto.max_score,
        );
        const rule= this.classificationRuleRepository.create({
            category: { id: dto.category_id },
            label: dto.label,
            min_score: dto.min_score,
            max_score: dto.max_score,
            is_active: dto.is_active ?? true,
            created_by: { id: dto.created_by },
        });
        const savedRule = await this.classificationRuleRepository.save(rule);
        return plainToInstance(
            ResponseClassificationRuleDto,
            savedRule,
            { excludeExtraneousValues: true },
        )
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
        return rules.map(rule => plainToInstance(
            ResponseClassificationRuleDto,
            rule,
            { excludeExtraneousValues: true },
        ));
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
        if (!rule) {
            throw new ClassificationRuleNotFoundException();
        }
        return plainToInstance(
            ResponseClassificationRuleDto,
            rule,
            { excludeExtraneousValues: true },
        );
    }
    async update(id: string, dto: UpdateClassificationRuleDto, updatedBy: number) {
        const rule = await this.classificationRuleRepository.findOne({
            where: { id, deleted_at: IsNull() },
            relations:{
                category: true,
            }
        });
        if (!rule) {
            throw new ClassificationRuleNotFoundException();
        }
        const categoryId = dto.category_id ?? rule.category.id;
        const minScore = dto.min_score ?? rule.min_score;
        const maxScore = dto.max_score ?? rule.max_score;
        validateScoreRange(minScore, maxScore);
        await validateOverlap(
            this.classificationRuleRepository,
            categoryId,
            minScore,
            maxScore,
            id,
        );
        rule.category = { id: categoryId } as Category;
        rule.min_score = minScore;
        rule.max_score = maxScore;
        rule.label = dto.label ?? rule.label;
        rule.is_active = dto.is_active ?? rule.is_active;
        rule.updated_by = { id: updatedBy } as Employee;
        const updated=await this.classificationRuleRepository.save(rule);
        return plainToInstance(
            ResponseClassificationRuleDto,
            updated,
            { excludeExtraneousValues: true },
        );
    }
    async delete(id: string, deletedBy: number) {
        const rule = await this.classificationRuleRepository.findOne({
            where: { id, deleted_at: IsNull() },
        });
        if (!rule) {
            throw new ClassificationRuleNotFoundException();
        }
        rule.deleted_by = { id: deletedBy } as Employee;
        await this.classificationRuleRepository.save(rule);
        await this.classificationRuleRepository.softDelete(id);

        return {
            success: true,
            message: 'Classification rule deleted successfully'
        }
    }
}