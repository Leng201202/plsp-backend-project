import { BadRequestException } from "@nestjs/common";
import { Repository, IsNull, Not } from 'typeorm';
import { ClassificationRule } from "../entity/classification-rule.entity";
import { ClassificationScoreOutOfRangeException, ClassificationScoreOverlapException } from "src/common/exceptions/classification.exception";

export const validateScoreRange= (min: number, max: number): boolean => {
    if(min>max){
        throw new ClassificationScoreOutOfRangeException();
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
        throw new ClassificationScoreOverlapException();
    }
}