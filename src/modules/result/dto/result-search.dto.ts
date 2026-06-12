import { Type } from "class-transformer";
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, Min, ValidateNested, IsString } from "class-validator";


export class ResultFilterDto{
    @IsOptional()
    @IsArray()
    @IsString({each: true})
    questionnaireId?: string[];

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    categoryId?: string[];

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    classificationId?: string[];

    @IsOptional()
    @IsString()
    startDate?: string;
    
    @IsOptional()
    @IsString()
    endDate?: string;
    
}

export class ResultPaginationDto{
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page=1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit=10;

}

export class ResultSortDto{
    @IsOptional()
    @IsIn(['calculate_at','percentage','rawTotalScore'])
    field: 'calculate_at'|'percentage'|'rawTotalScore' ='calculate_at';

    @IsOptional()
    @IsIn(['ASC','DESC'])
    order: 'ASC'|'DESC' ='DESC';
}

export class ResultSearchDto{
    @IsOptional()
    @ValidateNested()
    @Type(() => ResultFilterDto)
    filter?: ResultFilterDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => ResultPaginationDto)
    pagination?: ResultPaginationDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => ResultSortDto)
    sort?: ResultSortDto;
}