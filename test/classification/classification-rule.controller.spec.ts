import { Test, TestingModule } from '@nestjs/testing';
import { ClassificationRuleController } from '../../src/modules/classification/classification-rule.controller';

describe('ClassificationRuleController', () => {
  let controller: ClassificationRuleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassificationRuleController],
    }).compile();

    controller = module.get<ClassificationRuleController>(ClassificationRuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
