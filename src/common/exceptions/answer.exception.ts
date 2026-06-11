import { NotFoundException } from '@nestjs/common';

export class AnswerNotFoundException extends NotFoundException {
  constructor() {
    super('Answer not found');
  }
}
