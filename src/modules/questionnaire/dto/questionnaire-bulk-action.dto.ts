import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export enum QuestionnaireSelectionMode{
    SELECTED='selected',
    FILTER='filter',
}

export class QuestionnaireBulkActionDto{
    @IsEnum(QuestionnaireSelectionMode)
    mode!: QuestionnaireSelectionMode;

    @IsOptional()
    @IsArray()
    @IsString({each:true})
    questionnaireIds?: string[];

    @IsOptional()
    @IsArray()
    @IsString({each:true})
    excludeIds?: string[];

    @IsOptional()
    @IsNumber()
    deletedBy?: number;
}