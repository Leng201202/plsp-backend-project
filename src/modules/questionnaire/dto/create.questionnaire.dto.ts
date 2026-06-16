import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID
} from 'class-validator';
import { Status } from 'src/modules/status/entity/status.entity';

export class CreateQuestionnaireDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  status_id?: string;

  @IsDateString()
  @IsOptional()
  open_date?: Date;

  @IsDateString()
  @IsOptional()
  close_date?: Date;

  @IsBoolean()
  @IsOptional()
  is_allow_multi_submit?: boolean;

  @IsInt()
  @IsOptional()
  created_by?: number;

  @IsInt()
  @IsOptional()
  updated_by?: number;
}