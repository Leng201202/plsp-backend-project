import { BadRequestException } from "@nestjs/common";
import { Repository, IsNull, Not } from 'typeorm';
import { ClassificationRule } from "../entity/classification-rule.entity";

export const validateScoreRange= (min: number, max: number): boolean => {
    if(min>max){
        throw new BadRequestException('min_score must be less than or equal to max_score');
    }
    return true;
};

export const validateOverlap=async (repository: Repository<ClassificationRule>,categoryId: string,min: number,max:number,currRuleId?: string)=>{
    const rules = await repository.find({
        where: {
            category: { id: categoryId },
            deleted_at: IsNull(),
            ...(currRuleId ? { id: Not(currRuleId) } : {}),
        },
    });
    const overlap=rules.find(
        (rule) =>
            min <=rule.max_score && 
            max >= rule.min_score,
    );
        
    if(overlap){
        throw new BadRequestException(`Score range overlaps with existing rule: ${overlap.label} (${overlap.min_score}-${overlap.max_score})`);
    }
}