
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ResultFilterDto } from '../dto/result-search.dto';



export enum ResultExportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
}

export enum ResultExportMode {
  SELECTED = 'selected',
  FILTER = 'filter',
}

export class ResultExportDto {
  @IsEnum(ResultExportMode)
  mode!: ResultExportMode;

  @IsEnum(ResultExportFormat)
  format!: ResultExportFormat;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resultIds?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ResultFilterDto)
  filters?: ResultFilterDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedIds?: string[];
}