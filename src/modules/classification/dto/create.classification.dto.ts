import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateClassificationRuleDto {
  @IsUUID()
  category_id!: string;

  @IsString()
  label!: string;

  @IsInt()
  @Min(0)
  min_score!: number;

  @IsInt()
  @Min(0)
  max_score!: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

}