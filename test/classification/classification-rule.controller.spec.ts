import { Test, TestingModule } from '@nestjs/testing';
import { ClassificationRuleController } from '../../src/modules/classification/classification-rule.controller';

describe('ClassificationRuleController', () => {
  let controller: ClassificationRuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassificationRuleController],
      providers: [
        {
          provide: require('../../src/modules/classification/classification-rule.service').ClassificationRuleService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ClassificationRuleController>(ClassificationRuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
