import { IsDateString, IsInt, IsOptional, IsString, IsUUID, isUUID } from "class-validator";
import { Status } from "src/modules/status/entity/status.entity";


export class CreateQuestionnaireDto {
    @IsString()
    title!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsUUID()
    status_id!:string;

    @IsDateString()
    @IsOptional()
    open_date?: Date;

    @IsDateString()
    @IsOptional()
    close_date?: Date;

    @IsInt()
    created_by!: number;

    @IsInt()
    @IsOptional()
    updated_by!: number;
    
}