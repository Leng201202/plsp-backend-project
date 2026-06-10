import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class AnswerItemDto {
  @IsUUID()
  question_id!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  selected_value!: number;
}

export class CreateSubmissionDto {
  @IsUUID()
  questionnaire_id!: string;

  @IsString()
  fingerprint!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers!: AnswerItemDto[];
}