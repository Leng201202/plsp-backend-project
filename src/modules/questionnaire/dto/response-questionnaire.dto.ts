
import { Transform } from 'class-transformer';

export class QuestionnaireResponseDto {
  id!: string;
  
  title!: string;

  description?: string;

  @Transform(({ value }) => value?.id)
  status!: any;

  open_date?: Date;

  close_date?: Date;

  @Transform(({ value }) => value?.id)
  created_by!: any;

  created_at!: Date;

  @Transform(({ value }) => value?.id)
  updated_by?: any;

  updated_at?: Date; 
}