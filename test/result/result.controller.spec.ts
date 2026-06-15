import { Test, TestingModule } from '@nestjs/testing';
import { ResultController } from '../../src/modules/result/result.controller';
import { ResultService } from '../../src/modules/result/result.service';

describe('ResultController', () => {
  let controller: ResultController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResultController],
      providers: [
        {
          provide: ResultService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ResultController>(ResultController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
