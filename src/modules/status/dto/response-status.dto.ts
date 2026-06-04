import { Transform } from 'class-transformer';

export class StatusResponseDto {
  id!: string;

  name!: string;

  description!: string;

  @Transform(({ value }) => value?.id)
  created_by!: any;

  created_at!: Date;

  @Transform(({ value }) => value?.id)
  updated_by!: any;

  updated_at!: Date;
}
