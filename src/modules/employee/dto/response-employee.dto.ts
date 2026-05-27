export class EmployeeResponseDto {
  id!: number;

  employee_uuid!: string;

  employee_id!: number;

  employee_code?: string;

  email!: string;

  title_th?: string;

  firstname!: string;

  middlename?: string;

  lastname!: string;

  title_en?: string;

  firstname_en?: string;

  middlename_en?: string;

  lastname_en?: string;

  institute_id?: number;

  department_id?: number;

  position_type?: number;

  position_special?: number;

  last_login_at?: Date;

  last_seen_at?: Date;

  education_level?: number;

  mobile?: string;

  work_phone?: string;

  synced_at?: Date;

  created_at?: Date;

  updated_at?: Date;

  is_active!: number;
}