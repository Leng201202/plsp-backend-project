import { NotFoundException } from "@nestjs/common";

export class SubmissionNotFoundException extends NotFoundException {
  constructor() {
    super('Submission not found');
  }
}
