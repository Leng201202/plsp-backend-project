import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClassificationRuleService } from '../../src/modules/classification/classification-rule.service';

describe('ClassificationRuleService', () => {
  let service: ClassificationRuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassificationRuleService,
        {
          provide: getRepositoryToken(require('../../src/modules/classification/entity/classification-rule.entity').ClassificationRule),
          useValue: {},
        },
        {
          provide: require('../../src/modules/audit-log/audit-helper.service').AuditHelper,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ClassificationRuleService>(ClassificationRuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
