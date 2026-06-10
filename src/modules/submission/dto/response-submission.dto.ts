import { Expose, Type } from "class-transformer";
import { ResponseAnswerDto } from "./response-answer.dto";

export class ResponseSubmissionDto {
    @Expose()
    id!: string;

    @Expose()
    questionnaire_id!: string;

    @Expose()
    anonymous_session_id!: string;

    @Expose()
    submitted_at!: Date;

    @Expose()
    @Type(() => ResponseAnswerDto)
    answers!: ResponseAnswerDto[];
}