import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionController } from '../../src/modules/submission/submission.controller';
import { SubmissionService } from '../../src/modules/submission/service/submission.service';

describe('SubmissionController', () => {
  let controller: SubmissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionController],
      providers: [
        {
          provide: SubmissionService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SubmissionController>(SubmissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
