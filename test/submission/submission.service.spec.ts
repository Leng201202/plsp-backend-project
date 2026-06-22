import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SubmissionService } from '../../src/modules/submission/service/submission.service';
import { AnswerService } from '../../src/modules/submission/service/answer.service';
import { ResultService } from '../../src/modules/result/result.service';
import { AuditHelper } from '../../src/modules/audit-log/audit-helper.service';
import { Submission } from '../../src/modules/submission/entity/submission.entity';
import { Questionnaire } from '../../src/modules/questionnaire/entity/questionnaire.entity';
import { Answer } from '../../src/modules/submission/entity/answer.entity';
import { CreateSubmissionDto, AnswerItemDto } from '../../src/modules/submission/dto/create-submission.dto';
import { QuestionnaireNotFoundException } from '../../src/common/exceptions/questionnaire.exception';
import { SubmissionNotFoundException } from '../../src/common/exceptions/submission.exception';
import { generateSessionID } from '../../src/modules/submission/utils/generateSessionID';
import { RedisService } from '../../src/common/redis/redis';

describe('SubmissionService', () => {
  let service: SubmissionService;

  const mockSubmissionRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockQuestionnaireRepository = {
    findOneBy: jest.fn(),
  };

  const mockAnswerService = {
    saveAnswers: jest.fn().mockResolvedValue([]),
  };

  const mockResultService = {
    calculate: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  const mockAuditHelper = {
    logSuccess: jest.fn().mockResolvedValue(undefined),
    logFailure: jest.fn().mockResolvedValue(undefined),
  };

  const mockRedisService = {
    exists: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
    del: jest.fn().mockResolvedValue(undefined),
    getOrSet: jest.fn(),
  };

  const mockQuestionnaireId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const mockSubmissionId = 'f1e2d3c4-b5a6-7890-abcd-ef1234567890';
  const mockFingerprint = 'browser-fingerprint-abc123';
  const mockUserAgent = 'Mozilla/5.0 Test Agent';
  const mockSessionId = generateSessionID(mockQuestionnaireId, mockFingerprint, mockUserAgent);
  const mockEmployeeId = 0;

  const mockQuestionnaire: Questionnaire = {
    id: mockQuestionnaireId,
    title: 'Sample Questionnaire',
    description: 'A test questionnaire',
    questions: [],
    submissions: [],
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: undefined,
  } as unknown as Questionnaire;

  const mockCreateSubmissionDto: CreateSubmissionDto = {
    questionnaire_id: mockQuestionnaireId,
    fingerprint: mockFingerprint,
    answers: [
      { question_id: 'q1', selected_value: 4 },
      { question_id: 'q2', selected_value: 3 },
    ] as AnswerItemDto[],
  };

  const mockSubmission: Submission = {
    id: mockSubmissionId,
    questionnaire: mockQuestionnaire,
    anonymousSessionId: mockSessionId,
    answers: [],
    submitted_at: new Date(),
    deleted_at: undefined,
    deleted_by: undefined,
  } as unknown as Submission;

  const mockResults = [
    {
      id: 'r1',
      submission: mockSubmission,
      category: { id: 'c1', name: 'Category A' },
      rawTotalScore: 7,
      percentage: 70,
      classification: 'Medium',
      classificationRule: { id: 'rule1', label: 'Medium' },
      calculated_at: new Date(),
    },
    {
      id: 'r2',
      submission: mockSubmission,
      category: { id: 'c2', name: 'Category B' },
      rawTotalScore: 3,
      percentage: 30,
      classification: 'Low',
      classificationRule: { id: 'rule2', label: 'Low' },
      calculated_at: new Date(),
    },
  ];

  const mockCreateSuccessResponse = {
    success: true,
    message: 'Submission saved successfully',
    submission_id: mockSubmissionId,
    results: mockResults,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionService,
        {
          provide: AnswerService,
          useValue: mockAnswerService,
        },
        {
          provide: ResultService,
          useValue: mockResultService,
        },
        {
          provide: getRepositoryToken(Submission),
          useValue: mockSubmissionRepository,
        },
        {
          provide: getRepositoryToken(Questionnaire),
          useValue: mockQuestionnaireRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: require('../../src/modules/audit-log/audit-helper.service').AuditHelper,
          useValue: mockAuditHelper,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<SubmissionService>(SubmissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create submission successfully', async () => {
    mockRedisService.exists.mockResolvedValue(false);
    mockQuestionnaireRepository.findOneBy.mockResolvedValue(mockQuestionnaire);
    mockSubmissionRepository.findOne.mockResolvedValue(null);

    mockResultService.calculate.mockResolvedValue(mockResults);

    mockDataSource.transaction.mockImplementation(async (callbackOrIsolation: any) => {
      if (typeof callbackOrIsolation === 'function') {
        return callbackOrIsolation({
          create: jest.fn().mockReturnValue(mockSubmission),
          save: jest.fn().mockResolvedValue(mockSubmission),
        });
      }
      return callbackOrIsolation;
    });

    const result = await service.create(mockCreateSubmissionDto, mockUserAgent);

    expect(mockRedisService.exists).toHaveBeenCalledWith(expect.any(String));
    expect(mockQuestionnaireRepository.findOneBy).toHaveBeenCalledWith({
      id: mockQuestionnaireId,
    });
    expect(mockSubmissionRepository.findOne).toHaveBeenCalledWith({
      where: {
        questionnaire: { id: mockQuestionnaireId },
        anonymousSessionId: mockSessionId,
      },
    });
    expect(mockRedisService.set).toHaveBeenCalledWith(
      expect.any(String),
      mockSubmissionId,
      expect.any(Number),
    );
    expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
    expect(mockAnswerService.saveAnswers).toHaveBeenCalledWith(
      expect.any(Object),
      mockSubmissionId,
      mockCreateSubmissionDto.answers,
    );
    expect(mockResultService.calculate).toHaveBeenCalledWith(
      mockSubmissionId,
      expect.any(Object),
    );
    expect(mockAuditHelper.logSuccess).toHaveBeenCalledWith({
      employeeId: 0,
      action: 'CREATE',
      module: 'SUBMISSION',
      recordId: mockSubmissionId,
      details: { questionnaire_id: mockQuestionnaireId },
    });
    expect(mockAuditHelper.logSuccess).toHaveBeenCalledWith({
      employeeId: 0,
      action: 'GENERATE',
      module: 'RESULT',
      recordId: mockSubmissionId,
      details: {
        questionnaire_id: mockQuestionnaireId,
        result_count: mockResults.length,
      },
    });
    expect(result).toEqual(mockCreateSuccessResponse);
  });

  it('should throw QuestionnaireNotFoundException when questionnaire does not exist', async () => {
    mockRedisService.exists.mockResolvedValue(false);
    mockQuestionnaireRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.create(mockCreateSubmissionDto, mockUserAgent),
    ).rejects.toThrow(QuestionnaireNotFoundException);

    expect(mockQuestionnaireRepository.findOneBy).toHaveBeenCalledWith({
      id: mockQuestionnaireId,
    });
    expect(mockRedisService.exists).not.toHaveBeenCalled();
    expect(mockDataSource.transaction).not.toHaveBeenCalled();
    expect(mockAuditHelper.logFailure).toHaveBeenCalledTimes(1);
  });

  it('should throw BadRequestException when duplicate submission exists', async () => {
    mockRedisService.exists.mockResolvedValue(false);
    mockQuestionnaireRepository.findOneBy.mockResolvedValue(mockQuestionnaire);
    mockSubmissionRepository.findOne.mockResolvedValue(mockSubmission);

    await expect(
      service.create(mockCreateSubmissionDto, mockUserAgent),
    ).rejects.toThrow('Submission already exists for this session and questionnaire');

    expect(mockRedisService.exists).toHaveBeenCalledWith(expect.any(String));
    expect(mockRedisService.set).toHaveBeenCalledWith(
      expect.any(String),
      mockSubmissionId,
      expect.any(Number),
    );
    expect(mockQuestionnaireRepository.findOneBy).toHaveBeenCalledWith({
      id: mockQuestionnaireId,
    });
    expect(mockSubmissionRepository.findOne).toHaveBeenCalledWith({
      where: {
        questionnaire: { id: mockQuestionnaireId },
        anonymousSessionId: mockSessionId,
      },
    });
    expect(mockDataSource.transaction).not.toHaveBeenCalled();
    expect(mockAuditHelper.logFailure).toHaveBeenCalledTimes(1);
  });

  it('should log audit failure and rethrow when transaction fails', async () => {
    mockRedisService.exists.mockResolvedValue(false);
    mockQuestionnaireRepository.findOneBy.mockResolvedValue(mockQuestionnaire);
    mockSubmissionRepository.findOne.mockResolvedValue(null);
    const dbError = new Error('Database connection lost');
    mockDataSource.transaction.mockRejectedValue(dbError);

    await expect(
      service.create(mockCreateSubmissionDto, mockUserAgent),
    ).rejects.toThrow(dbError);

    expect(mockRedisService.exists).toHaveBeenCalledWith(expect.any(String));
    expect(mockAuditHelper.logFailure).toHaveBeenCalledWith(
      {
        employeeId: 0,
        action: 'CREATE',
        module: 'SUBMISSION',
        details: { questionnaire_id: mockQuestionnaireId },
      },
      dbError,
    );
  });

  it('should return all non-deleted submissions', async () => {
    const mockSubmissions = [mockSubmission];
    mockSubmissionRepository.find.mockResolvedValue(mockSubmissions);

    const result = await service.findAll();

    expect(mockSubmissionRepository.find).toHaveBeenCalledWith({
      where: { deleted_at: expect.any(Object) },
      relations: {
        questionnaire: true,
        answers: { question: true },
      },
    });
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(1);
    expect(result[0]).toHaveProperty('id', mockSubmissionId);
  });

  it('should return an empty array when no submissions exist', async () => {
    mockSubmissionRepository.find.mockResolvedValue([]);

    const result = await service.findAll();

    expect(result).toEqual([]);
  });

  it('should return a submission by ID', async () => {
    const submissionWithRelations = {
      ...mockSubmission,
      questionnaire: mockQuestionnaire,
      answers: [],
    };
    mockSubmissionRepository.findOne.mockResolvedValue(submissionWithRelations);

    const result = await service.findOne(mockSubmissionId);

    expect(mockSubmissionRepository.findOne).toHaveBeenCalledWith({
      where: { id: mockSubmissionId },
      relations: {
        questionnaire: true,
        answers: { question: true },
      },
    });
    expect(result).toEqual({
      success: true,
      data: expect.objectContaining({ id: mockSubmissionId }),
    });
  });

  it('should throw SubmissionNotFoundException when submission does not exist', async () => {
    mockSubmissionRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(mockSubmissionId)).rejects.toThrow(
      SubmissionNotFoundException,
    );

    expect(mockSubmissionRepository.findOne).toHaveBeenCalledWith({
      where: { id: mockSubmissionId },
      relations: {
        questionnaire: true,
        answers: { question: true },
      },
    });
  });

  it('should soft-delete a submission successfully', async () => {
    mockSubmissionRepository.findOneBy.mockResolvedValue(mockSubmission);
    mockSubmissionRepository.update.mockResolvedValue({ affected: 1 } as any);
    mockSubmissionRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

    const result = await service.delete(mockSubmissionId, mockEmployeeId);

    expect(mockSubmissionRepository.findOneBy).toHaveBeenCalledWith({
      id: mockSubmissionId,
    });
    expect(mockSubmissionRepository.update).toHaveBeenCalledWith(
      mockSubmissionId,
      {
        deleted_by: { id: mockEmployeeId } as any,
      },
    );
    expect(mockSubmissionRepository.softDelete).toHaveBeenCalledWith(
      mockSubmissionId,
    );
    expect(mockAuditHelper.logSuccess).toHaveBeenCalledWith({
      employeeId: mockEmployeeId,
      action: 'DELETE',
      module: 'SUBMISSION',
      recordId: mockSubmissionId,
      details: { questionnaire_id: mockSubmission.questionnaire?.id },
    });
    expect(result).toEqual({
      success: true,
      message: 'Submission deleted successfully',
    });
  });

  it('should throw SubmissionNotFoundException when submission to delete does not exist', async () => {
    mockSubmissionRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.delete(mockSubmissionId, mockEmployeeId),
    ).rejects.toThrow(SubmissionNotFoundException);

    expect(mockSubmissionRepository.update).not.toHaveBeenCalled();
    expect(mockSubmissionRepository.softDelete).not.toHaveBeenCalled();
    expect(mockAuditHelper.logFailure).toHaveBeenCalledTimes(1);
  });

  it('should log audit failure when delete fails', async () => {
    mockSubmissionRepository.findOneBy.mockResolvedValue(mockSubmission);
    const deleteError = new Error('Delete operation failed');
    mockSubmissionRepository.update.mockRejectedValue(deleteError);

    await expect(
      service.delete(mockSubmissionId, mockEmployeeId),
    ).rejects.toThrow(deleteError);

    expect(mockAuditHelper.logFailure).toHaveBeenCalledWith(
      {
        employeeId: mockEmployeeId,
        action: 'DELETE',
        module: 'SUBMISSION',
        recordId: mockSubmissionId,
      },
      deleteError,
    );
  });

  it('should return submissions filtered by questionnaire ID', async () => {
    mockQuestionnaireRepository.findOneBy.mockResolvedValue(mockQuestionnaire);
    const mockSubmissions = [
      {
        ...mockSubmission,
        submitted_at: new Date('2026-06-15T10:00:00Z'),
      },
      {
        id: 'other-id',
        questionnaire: mockQuestionnaire,
        anonymousSessionId: 'other-session',
        answers: [],
        submitted_at: new Date('2026-06-14T10:00:00Z'),
        deleted_at: undefined,
      },
    ];
    mockSubmissionRepository.find.mockResolvedValue(mockSubmissions);

    const result = await service.findByQuestionnaire(mockQuestionnaireId);

    expect(mockQuestionnaireRepository.findOneBy).toHaveBeenCalledWith({
      id: mockQuestionnaireId,
    });
    expect(mockSubmissionRepository.find).toHaveBeenCalledWith({
      where: {
        questionnaire: { id: mockQuestionnaireId },
      },
      order: { submitted_at: 'DESC' },
    });
    expect(result).toEqual({
      success: true,
      count: mockSubmissions.length,
      data: expect.any(Array),
    });
    expect(result.data).toHaveLength(2);
  });

  it('should return empty data when no submissions for questionnaire', async () => {
    mockQuestionnaireRepository.findOneBy.mockResolvedValue(mockQuestionnaire);
    mockSubmissionRepository.find.mockResolvedValue([]);

    const result = await service.findByQuestionnaire(mockQuestionnaireId);

    expect(result).toEqual({
      success: true,
      count: 0,
      data: [],
    });
  });

  it('should throw QuestionnaireNotFoundException when questionnaire does not exist', async () => {
    mockQuestionnaireRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.findByQuestionnaire(mockQuestionnaireId),
    ).rejects.toThrow(QuestionnaireNotFoundException);

    expect(mockSubmissionRepository.find).not.toHaveBeenCalled();
  });
});