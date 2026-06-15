import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubmissionService } from '../../src/modules/submission/service/submission.service';

describe('SubmissionService', () => {
  let service: SubmissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionService,
        {
          provide: getRepositoryToken(require('../../src/modules/submission/entity/submission.entity').Submission),
          useValue: {},
        },
        {
          provide: getRepositoryToken(require('../../src/modules/questionnaire/entity/questionnaire.entity').Questionnaire),
          useValue: {},
        },
        {
          provide: getRepositoryToken(require('../../src/modules/submission/entity/answer.entity').Answer),
          useValue: {},
        },
        {
          provide: require('../../src/modules/submission/service/answer.service').AnswerService,
          useValue: {},
        },
        {
          provide: require('../../src/modules/result/result.service').ResultService,
          useValue: {},
        },
        {
          provide: require('typeorm').DataSource,
          useValue: {},
        },
        {
          provide: require('../../src/modules/audit-log/audit-helper.service').AuditHelper,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SubmissionService>(SubmissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
