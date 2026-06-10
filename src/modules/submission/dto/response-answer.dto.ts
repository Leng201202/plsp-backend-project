import { Expose, Transform } from "class-transformer";

export class ResponseAnswerDto {

    @Expose()
    @Transform(({ obj }) => obj.question.id)
    question_id!: string;

    @Expose()
    @Transform(({ obj }) => obj.question.question_text)
    question_text!: string;

    @Expose()
    selected_value!: number;

}