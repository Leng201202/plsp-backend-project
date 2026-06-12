import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { ResultFilterDto } from "./result-search.dto";

export enum ResultSelectionMode{
    SELECTED='selected',
    FILTER='filter',
}

export class ResultBulkActionDto{
    @IsEnum(ResultSelectionMode)
    mode!: ResultSelectionMode;

    @IsOptional()
    @IsArray()
    @IsString({each:true})
    resultIds?: string[];

    @IsOptional()
    @ValidateNested()
    @Type(() => ResultFilterDto)
    filter?: ResultFilterDto;

    @IsOptional()
    @IsArray()
    @IsString({each:true})
    excludeIds?: string[];

    @IsOptional()
    @IsNumber()
    deletedBy?: number;
}