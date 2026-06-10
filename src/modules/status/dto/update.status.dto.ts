import { PartialType } from '@nestjs/mapped-types';
import { CreateStatusDto } from './create.status.dto';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateStatusDto extends PartialType(CreateStatusDto) {

    @IsInt()
    @IsOptional()
    updated_by?: number;
}
