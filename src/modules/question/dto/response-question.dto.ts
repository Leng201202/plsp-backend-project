import { Transform } from 'class-transformer';

export class QuestionResponseDto {
  id!: string;

  question_text!: string;

  order_no!: number;

  is_required!: boolean;

  weight!: number;

  @Transform(({ value }) => value?.id)
  questionnaire!: any;

  @Transform(({ value }) => value?.id)
  category!: any;

  @Transform(({ value }) => value?.id)
  created_by!: any;

  created_at!: Date;

  @Transform(({ value }) => value?.id)
  updated_by!: any;

  updated_at!: Date;
}