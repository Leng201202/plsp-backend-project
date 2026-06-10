import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateQuestionDto {
  @IsUUID()
  questionnaire_id!: string;

  @IsUUID()
  category_id!: string;

  @IsString()
  question_text!: string;

  @IsInt()
  order_no!: number;

  @IsBoolean()
  is_required!: boolean;

  @IsInt()
  weight!: number;

  @IsInt()
  created_by!: number;

}
