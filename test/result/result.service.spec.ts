import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResultService } from '../../src/modules/result/result.service';
import { Result } from '../../src/modules/result/entity/result.entity';
import { Submission } from '../../src/modules/submission/entity/submission.entity';
import { Answer } from '../../src/modules/submission/entity/answer.entity';
import { ClassificationRule } from '../../src/modules/classification/entity/classification-rule.entity';
import { SubmissionNotFoundException } from '../../src/common/exceptions/submission.exception';
import { AnswerNotFoundException } from '../../src/common/exceptions/answer.exception';
import { In } from 'typeorm';
import { ResultSelectionMode } from '../../src/modules/result/dto/result-bulk-action.dto';
import { ResultExportMode } from '../../src/modules/result/dto/result-export.dto';
import { RedisService } from '../../src/common/redis/redis';

describe('ResultService', () => {
  let service: ResultService;

  const mockResultExportService = {
    export: jest.fn(),
  };

  const mockResultRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockSubmissionRepository = {
    findOne: jest.fn(),
  };

  const mockAnswerRepository = {
    find: jest.fn(),
  };

  const mockClassificationRuleRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
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

  const mockClassificationRules = [
    { id: 'rule1', label: 'Medium', min_score: 10, max_score: 30, is_active: true },
    { id: 'rule2', label: 'High', min_score: 31, max_score: 50, is_active: true },
    { id: 'rule3', label: 'Low', min_score: 0, max_score: 9, is_active: true },
  ];

  const mockSubmissionId = 'f1e2d3c4-b5a6-7890-abcd-ef1234567890';
  const mockCategoryId1 = 'c1';
  const mockCategoryId2 = 'c2';

  const mockSubmission = {
    id: mockSubmissionId,
    questionnaire: { id: 'q-id', title: 'Sample Questionnaire' },
    anonymousSessionId: 'session-abc',
    submitted_at: new Date('2026-06-15T10:00:00Z'),
  } as unknown as Submission;

  const mockAnswers = [
    {
      id: 'a1',
      selected_value: 4,
      question: {
        id: 'q1',
        weight: 1,
        category: { id: mockCategoryId1, name: 'Category A' },
      },
      submission: { id: mockSubmissionId },
    },
    {
      id: 'a2',
      selected_value: 3,
      question: {
        id: 'q2',
        weight: 1,
        category: { id: mockCategoryId1, name: 'Category A' },
      },
      submission: { id: mockSubmissionId },
    },
    {
      id: 'a3',
      selected_value: 2,
      question: {
        id: 'q3',
        weight: 1,
        category: { id: mockCategoryId2, name: 'Category B' },
      },
      submission: { id: mockSubmissionId },
    },
  ] as unknown as Answer[];

  const mockClassificationRule = {
    id: 'rule1',
    label: 'Medium',
    min_score: 10,
    max_score: 30,
    is_active: true,
  } as unknown as ClassificationRule;

  const mockCreatedResult1 = {
    id: 'r1',
    submission: mockSubmission,
    category: mockAnswers[0].question.category,
    rawTotalScore: 7,
    percentage: 70,
    classificationRule: mockClassificationRule,
    classification: 'Medium',
    calculated_at: new Date(),
  };

  const mockCreatedResult2 = {
    id: 'r2',
    submission: mockSubmission,
    category: mockAnswers[2].question.category,
    rawTotalScore: 2,
    percentage: 40,
    classificationRule: null,
    classification: 'Unclassified',
    calculated_at: new Date(),
  };

  const mockSavedResults = [mockCreatedResult1, mockCreatedResult2];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResultService,
        {
          provide: require('../../src/modules/result/export/result-export.service').ResultExportService,
          useValue: mockResultExportService,
        },
        {
          provide: getRepositoryToken(Result),
          useValue: mockResultRepository,
        },
        {
          provide: getRepositoryToken(Submission),
          useValue: mockSubmissionRepository,
        },
        {
          provide: getRepositoryToken(Answer),
          useValue: mockAnswerRepository,
        },
        {
          provide: getRepositoryToken(ClassificationRule),
          useValue: mockClassificationRuleRepository,
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

    service = module.get<ResultService>(ResultService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculate', () => {
    it('should calculate results for a submission successfully', async () => {
      mockSubmissionRepository.findOne.mockResolvedValue(mockSubmission);
      mockAnswerRepository.find.mockResolvedValue(mockAnswers);
      mockRedisService.getOrSet.mockImplementation(async (key, factory) => factory());
      mockClassificationRuleRepository.find.mockResolvedValue(mockClassificationRules);
      mockResultRepository.create
        .mockReturnValueOnce(mockCreatedResult1)
        .mockReturnValueOnce(mockCreatedResult2);
      mockResultRepository.save.mockResolvedValue(mockSavedResults);

      const results = await service.calculate(mockSubmissionId);

      expect(mockSubmissionRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockSubmissionId },
      });
      expect(mockAnswerRepository.find).toHaveBeenCalledWith({
        where: { submission: { id: mockSubmissionId } },
        relations: { question: { category: true } },
      });
      expect(mockClassificationRuleRepository.find).toHaveBeenCalledTimes(2);
      expect(mockResultRepository.create).toHaveBeenCalledTimes(2);
      expect(mockResultRepository.save).toHaveBeenCalledWith(mockSavedResults);
      expect(results).toEqual(mockSavedResults);
    });

    it('should throw SubmissionNotFoundException when submission does not exist', async () => {
      mockSubmissionRepository.findOne.mockResolvedValue(null);

      await expect(service.calculate(mockSubmissionId)).rejects.toThrow(
        SubmissionNotFoundException,
      );
    });

    it('should throw AnswerNotFoundException when no answers found', async () => {
      mockSubmissionRepository.findOne.mockResolvedValue(mockSubmission);
      mockAnswerRepository.find.mockResolvedValue(null);

      await expect(service.calculate(mockSubmissionId)).rejects.toThrow(
        AnswerNotFoundException,
      );
    });

    it('should use entity manager when provided', async () => {
      const mockResultCreate = jest
        .fn()
        .mockReturnValueOnce(mockCreatedResult1)
        .mockReturnValueOnce(mockCreatedResult2);

      const mockClassificationRuleRepo = {
        findOne: jest.fn().mockResolvedValue(mockClassificationRule),
      };

      const mockManager = {
        getRepository: jest.fn().mockImplementation((entity: any) => {
          if (entity === Submission) {
            return { findOne: jest.fn().mockResolvedValue(mockSubmission) };
          }
          if (entity === Answer) {
            return { find: jest.fn().mockResolvedValue(mockAnswers) };
          }
          if (entity === ClassificationRule) {
            return mockClassificationRuleRepo;
          }
          if (entity === Result) {
            return { create: mockResultCreate };
          }
          return {};
        }),
        save: jest.fn().mockResolvedValue(mockSavedResults),
      } as any;

      const results = await service.calculate(mockSubmissionId, mockManager);

      expect(mockManager.getRepository).toHaveBeenCalledTimes(5);
      expect(mockResultCreate).toHaveBeenCalledTimes(2);
      expect(mockManager.save).toHaveBeenCalledWith(Result, mockSavedResults);
      expect(results).toEqual(mockSavedResults);
    });
  });

  describe('search', () => {
    it('should search results with default pagination', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockCreatedResult1], 1]),
      };

      mockResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const dto = {};
      const result = await service.search(dto as any);

      expect(mockResultRepository.createQueryBuilder).toHaveBeenCalledWith('result');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(4);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('result.calculate_at', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        success: true,
        total: 1,
        page: 1,
        limit: 10,
        data: [mockCreatedResult1],
      });
    });

    it('should apply filter criteria when provided', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockCreatedResult1], 1]),
      };

      mockResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const dto = {
        filter: {
          questionnaireId: ['q-id'],
          categoryId: ['c1'],
          classificationId: ['rule1'],
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        },
        pagination: { page: 2, limit: 5 },
        sort: { field: 'percentage', order: 'ASC' },
      };

      const result = await service.search(dto as any);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'questionnaire.id IN (:...questionnaireIds)',
        { questionnaireIds: ['q-id'] },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('result.percentage', 'ASC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
    });

    it('should return empty results when no matches', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.search({} as any);

      expect(result).toEqual({
        success: true,
        total: 0,
        page: 1,
        limit: 10,
        data: [],
      });
    });
  });

  describe('deleteMany', () => {
    it('should delete selected results by IDs', async () => {
      mockResultRepository.softDelete.mockResolvedValue({ affected: 2 });

      const dto = {
        mode: ResultSelectionMode.SELECTED,
        resultIds: ['r1', 'r2'],
        deletedBy: 1,
      };

      const result = await service.deleteMany(dto as any);

      expect(mockResultRepository.update).toHaveBeenCalledWith(
        { id: expect.any(Object) },
        { deleted_by: { id: 1 } },
      );
      expect(mockResultRepository.softDelete).toHaveBeenCalledWith(['r1', 'r2']);
      expect(mockAuditHelper.logSuccess).toHaveBeenCalledWith({
        employeeId: 1,
        action: 'DELETE',
        module: 'RESULT',
        details: { deletedCount: 2, resultIds: ['r1', 'r2'] },
      });
      expect(result).toEqual({
        success: true,
        message: 'Results deleted successfully.',
        deletedCount: 2,
      });
    });

    it('should delete results by filter mode', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { id: 'r1' },
          { id: 'r2' },
          { id: 'r3' },
        ]),
      };

      mockResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockResultRepository.softDelete.mockResolvedValue({ affected: 3 });

      const dto = {
        mode: ResultSelectionMode.FILTER,
        filter: { categoryId: ['c1'] },
        excludeIds: ['r4'],
      };

      const result = await service.deleteMany(dto as any);

      expect(mockQueryBuilder.select).toHaveBeenCalledWith('result.id', 'id');
      expect(mockResultRepository.softDelete).toHaveBeenCalledWith(['r1', 'r2', 'r3']);
      expect(result.deletedCount).toBe(3);
    });

    it('should throw error when no results to delete', async () => {
      const dto = {
        mode: ResultSelectionMode.SELECTED,
        resultIds: [],
      };

      await expect(service.deleteMany(dto as any)).rejects.toThrow(
        'No results to delete.',
      );

      expect(mockAuditHelper.logFailure).toHaveBeenCalledTimes(1);
    });

    it('should log audit failure when delete fails', async () => {
      mockResultRepository.softDelete.mockRejectedValue(
        new Error('Database error'),
      );

      const dto = {
        mode: ResultSelectionMode.SELECTED,
        resultIds: ['r1'],
      };

      await expect(service.deleteMany(dto as any)).rejects.toThrow(
        'Database error',
      );

      expect(mockAuditHelper.logFailure).toHaveBeenCalledTimes(1);
    });
  });

  describe('exportResult', () => {
    const mockExportFile = {
      file: Buffer.from('data'),
      fileName: 'report.csv',
      mimeType: 'text/csv',
    };

    it('should export selected results', async () => {
      mockResultRepository.find.mockResolvedValue([mockCreatedResult1, mockCreatedResult2]);
      mockResultExportService.export.mockResolvedValue(mockExportFile);

      const dto = {
        mode: ResultExportMode.SELECTED,
        format: 'csv',
        resultIds: ['r1', 'r2'],
      };

      const result = await service.exportResult(dto as any);

      expect(mockResultRepository.find).toHaveBeenCalledWith({
        where: { id: In(['r1', 'r2']) },
        relations: {
          submission: { questionnaire: true },
          category: true,
          classificationRule: true,
        },
      });
      expect(mockResultExportService.export).toHaveBeenCalledWith(
        'csv',
        expect.any(Array),
      );
      expect(mockAuditHelper.logSuccess).toHaveBeenCalledWith({
        employeeId: 0,
        action: 'EXPORT',
        module: 'RESULT',
        details: { format: 'csv', rowCount: 2 },
      });
      expect(result).toEqual(mockExportFile);
    });

    it('should export results by filter mode', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockCreatedResult1]),
      };

      mockResultRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockResultExportService.export.mockResolvedValue(mockExportFile);

      const dto = {
        mode: ResultExportMode.FILTER,
        format: 'pdf',
        filters: { categoryId: ['c1'] },
        excludedIds: ['r2'],
      };

      const result = await service.exportResult(dto as any);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'result.id NOT IN (:...excludedIds)',
        { excludedIds: ['r2'] },
      );
      expect(mockResultExportService.export).toHaveBeenCalledWith(
        'pdf',
        expect.any(Array),
      );
      expect(result).toEqual(mockExportFile);
    });

    it('should log audit failure when export fails', async () => {
      const dbError = new Error('Export failed');
      mockResultExportService.export.mockRejectedValue(dbError);

      const dto = {
        mode: ResultExportMode.SELECTED,
        format: 'excel',
        resultIds: ['r1'],
      };

      mockResultRepository.find.mockResolvedValue([mockCreatedResult1]);

      await expect(service.exportResult(dto as any)).rejects.toThrow(
        'Export failed',
      );

      expect(mockAuditHelper.logFailure).toHaveBeenCalledWith(
        {
          employeeId: 0,
          action: 'EXPORT',
          module: 'RESULT',
          details: { format: 'excel' },
        },
        dbError,
      );
    });
  });
});