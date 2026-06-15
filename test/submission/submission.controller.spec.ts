import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionController } from '../../src/modules/submission/submission.controller';
import { SubmissionService } from '../../src/modules/submission/service/submission.service';
import { CreateSubmissionDto, AnswerItemDto } from '../../src/modules/submission/dto/create-submission.dto';

describe('SubmissionController', () => {
  let controller: SubmissionController;
  let submissionService: jest.Mocked<SubmissionService>;

  const mockQuestionnaireId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const mockSubmissionId = 'f1e2d3c4-b5a6-7890-abcd-ef1234567890';

  const mockCreateSubmissionDto: CreateSubmissionDto = {
    questionnaire_id: mockQuestionnaireId,
    fingerprint: 'browser-fingerprint-abc123',
    answers: [
      { question_id: 'q1', selected_value: 4 },
      { question_id: 'q2', selected_value: 3 },
    ] as AnswerItemDto[],
  };

  const mockSubmissionResponse = {
    success: true,
    message: 'Submission saved successfully',
    submission_id: mockSubmissionId,
    results: [
      {
        id: 'r1',
        submission: { id: mockSubmissionId },
        category: { id: 'c1', name: 'Category A' },
        rawTotalScore: '7',
        percentage: '70',
        classification: 'Medium',
        classificationRule: { id: 'rule1', label: 'Medium' },
        calculated_at: new Date(),
      },
    ],
  } as any;

  const mockSubmissionList = [
    {
      id: mockSubmissionId,
      questionnaire_id: mockQuestionnaireId,
      anonymous_session_id: 'session-abc',
      submitted_at: new Date('2026-06-15T10:00:00Z'),
      answers: [],
    },
    {
      id: 'other-id',
      questionnaire_id: mockQuestionnaireId,
      anonymous_session_id: 'session-def',
      submitted_at: new Date('2026-06-14T10:00:00Z'),
      answers: [],
    },
  ];

  const mockFindOneResponse = {
    success: true,
    data: mockSubmissionList[0],
  };

  const mockFindByQuestionnaireResponse = {
    success: true,
    count: 2,
    data: mockSubmissionList,
  };

  const mockDeleteResponse = {
    success: true,
    message: 'Submission deleted successfully',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionController],
      providers: [
        {
          provide: SubmissionService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByQuestionnaire: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SubmissionController>(SubmissionController);
    submissionService = module.get(SubmissionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Module initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('POST /submission', () => {
    it('should create a submission with user-agent from request headers', async () => {
      submissionService.create.mockResolvedValue(mockSubmissionResponse);

      const mockReq = {
        headers: {
          'user-agent': 'Mozilla/5.0 Test Agent',
        },
      };

      const result = await controller.create(mockCreateSubmissionDto, mockReq);

      expect(submissionService.create).toHaveBeenCalledWith(
        mockCreateSubmissionDto,
        'Mozilla/5.0 Test Agent',
      );
      expect(result).toEqual(mockSubmissionResponse);
    });

    it('should create a submission with empty user-agent when header is missing', async () => {
      submissionService.create.mockResolvedValue(mockSubmissionResponse);

      const mockReq = {
        headers: {},
      };

      const result = await controller.create(mockCreateSubmissionDto, mockReq);

      expect(submissionService.create).toHaveBeenCalledWith(
        mockCreateSubmissionDto,
        '',
      );
      expect(result).toEqual(mockSubmissionResponse);
    });
  });

  describe('GET /submission', () => {
    it('should return all submissions', async () => {
      submissionService.findAll.mockResolvedValue(mockSubmissionList);

      const result = await controller.findAll();

      expect(submissionService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSubmissionList);
    });
  });

  describe('GET /submission/:id', () => {
    it('should return a single submission by UUID', async () => {
      submissionService.findOne.mockResolvedValue(mockFindOneResponse);

      const result = await controller.findOne(mockSubmissionId);

      expect(submissionService.findOne).toHaveBeenCalledWith(mockSubmissionId);
      expect(result).toEqual(mockFindOneResponse);
    });
  });

  describe('GET /submission/questionnaire/:questionnaireId', () => {
    it('should return submissions filtered by questionnaire UUID', async () => {
      submissionService.findByQuestionnaire.mockResolvedValue(
        mockFindByQuestionnaireResponse,
      );

      const result = await controller.findByQuestionnaire(mockQuestionnaireId);

      expect(submissionService.findByQuestionnaire).toHaveBeenCalledWith(
        mockQuestionnaireId,
      );
      expect(result).toEqual(mockFindByQuestionnaireResponse);
    });
  });

  describe('DELETE /submission/:id', () => {
    it('should soft-delete a submission by UUID with default deleteBy', async () => {
      submissionService.delete.mockResolvedValue(mockDeleteResponse);

      const result = await controller.delete(mockSubmissionId);

      expect(submissionService.delete).toHaveBeenCalledWith(
        mockSubmissionId,
        1,
      );
      expect(result).toEqual(mockDeleteResponse);
    });
  });
});