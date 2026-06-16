import { Transform, Type } from 'class-transformer';
import { StatusResponseDto } from 'src/modules/status/dto/response-status.dto';

export class QuestionnaireResponseDto {
  id!: string;

  title!: string;

  description?: string;

  @Type(() => StatusResponseDto)
  status!: StatusResponseDto;

  open_date?: Date;

  close_date?: Date;

  @Transform(({ value }) => value?.id)
  created_by!: any;

  created_at!: Date;

  @Transform(({ value }) => value?.id)
  updated_by?: any;

  updated_at?: Date;
}
