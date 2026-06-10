import { PartialType } from '@nestjs/mapped-types';
import { CreateClassificationRuleDto } from './create.classification.dto';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateClassificationRuleDto extends PartialType(
  CreateClassificationRuleDto,
) {
  @IsInt()
  @IsOptional()
  updated_by?: number;
}