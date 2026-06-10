import { NotFoundException } from '@nestjs/common';

export class ClassificationRuleNotFoundException extends NotFoundException {
  constructor() {
    super('Classification rule not found');
  }
}
