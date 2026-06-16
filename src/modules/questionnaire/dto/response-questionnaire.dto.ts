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

  @Transform(({ value }) => {
    if (!value) return 'Unknown';
    if (typeof value === 'string') return value;
    const parts: string[] = [];
    if (value.firstname) parts.push(value.firstname);
    if (value.lastname) parts.push(value.lastname);
    return parts.length > 0 ? parts.join(' ') : value?.id ?? 'Unknown';
  })
  created_by!: string;

  created_at!: Date;

  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    const parts: string[] = [];
    if (value.firstname) parts.push(value.firstname);
    if (value.lastname) parts.push(value.lastname);
    return parts.length > 0 ? parts.join(' ') : value?.id ?? 'Unknown';
  })
  updated_by?: string;

  updated_at?: Date;
}
