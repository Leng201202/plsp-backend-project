import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  IsEnum,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsUUID()
  employee_uuid!: string;

  @IsInt()
  employee_id!: number;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  employee_code?: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  title_th?: string;

  @IsString()
  firstname!: string;

  @IsOptional()
  @IsString()
  middlename?: string;

  @IsString()
  lastname!: string;

  @IsOptional()
  @IsString()
  title_en?: string;

  @IsOptional()
  @IsString()
  firstname_en?: string;

  @IsOptional()
  @IsString()
  middlename_en?: string;

  @IsOptional()
  @IsString()
  lastname_en?: string;

  @IsOptional()
  @IsInt()
  institute_id?: number;

  @IsOptional()
  @IsInt()
  department_id?: number;

  @IsOptional()
  @IsInt()
  position_type?: number;

  @IsOptional()
  @IsInt()
  position_special?: number;

  @IsOptional()
  @IsInt()
  education_level?: number;

  @IsOptional()
  @IsString()
  @Length(10, 10)
  mobile?: string;

  @IsOptional()
  @IsString()
  @Length(10, 10)
  work_phone?: string;

  @IsOptional()
  @IsEnum([0, 1])
  is_active?: number;
}
