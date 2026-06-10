import { Expose, Transform } from 'class-transformer';
import { Employee } from 'src/modules/employee/entity/employee.entity';

export class ResponseClassificationRuleDto {
  @Expose()
  id!: string;

  @Expose()
  @Transform(({ obj }) => obj.category?.id)
  category_id!: string;

  @Expose()
  label!: string;

  @Expose()
  min_score!: number;

  @Expose()
  max_score!: number;

  @Expose()
  is_active!: boolean;

  @Expose()
  created_at!: Date;

  @Expose()
  @Transform(({ obj }) => obj.created_by?.id)
  created_by?: Employee;

  @Expose()
  updated_at?: Date;

  @Expose()
  @Transform(({ obj }) => obj.updated_by?.id)
  updated_by?: Employee;
}