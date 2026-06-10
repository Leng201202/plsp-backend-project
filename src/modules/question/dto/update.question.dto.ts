import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionDto } from './create.question.dto';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {

    @IsInt()
    @IsOptional()
    updated_by?: number;
}
