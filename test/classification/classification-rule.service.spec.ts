import { Test, TestingModule } from '@nestjs/testing';
import { ClassificationRuleService } from '../../src/modules/classification/classification-rule.service';

describe('ClassificationRuleService', () => {
  let service: ClassificationRuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassificationRuleService],
    }).compile();

    service = module.get<ClassificationRuleService>(ClassificationRuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
