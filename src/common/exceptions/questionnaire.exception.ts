import { NotFoundException } from "@nestjs/common";

export class QuestionnaireNotFoundException extends NotFoundException {
    constructor() {
        super('Questionnaire not found');
    }
}