import { NotFoundException } from '@nestjs/common';

export class ClassificationRuleNotFoundException extends NotFoundException {
  constructor() {
    super('Classification rule not found');
  }
}

export class ClassificationScoreOutOfRangeException extends NotFoundException {
  constructor() {
    super('Classification score is out of range');
  }
}

export class ClassificationScoreOverlapException extends NotFoundException {
  constructor() {
    super('Classification score range overlaps with existing rules in the category');
  }
}