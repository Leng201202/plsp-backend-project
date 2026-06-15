import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResultService } from '../../src/modules/result/result.service';

describe('ResultService', () => {
  let service: ResultService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResultService,
        {
          provide: require('../../src/modules/result/export/result-export.service').ResultExportService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(require('../../src/modules/result/entity/result.entity').Result),
          useValue: {},
        },
        {
          provide: getRepositoryToken(require('../../src/modules/submission/entity/submission.entity').Submission),
          useValue: {},
        },
        {
          provide: getRepositoryToken(require('../../src/modules/submission/entity/answer.entity').Answer),
          useValue: {},
        },
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

    service = module.get<ResultService>(ResultService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
