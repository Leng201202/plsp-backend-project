import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';

import { ClassificationRuleService } from '../../src/modules/classification/classification-rule.service';
import { ClassificationRule } from '../../src/modules/classification/entity/classification-rule.entity';
import { AuditHelper } from '../../src/modules/audit-log/audit-helper.service';
import { ClassificationRuleNotFoundException, ClassificationScoreOutOfRangeException, ClassificationScoreOverlapException } from '../../src/common/exceptions/classification.exception';

describe('ClassificationRuleService', () => {
  let service: ClassificationRuleService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockAuditHelper = {
    logSuccess: jest.fn(),
    logFailure: jest.fn(),
  };

  const mockRuleId =
    '550e8400-e29b-41d4-a716-446655440001';

  const mockCategoryId =
    '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassificationRuleService,
        {
          provide: getRepositoryToken(ClassificationRule),
          useValue: mockRepository,
        },
        {
          provide: AuditHelper,
          useValue: mockAuditHelper,
        },
      ],
    }).compile();

    service = module.get<ClassificationRuleService>(
      ClassificationRuleService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all classification rules', async () => {
      const rules = [
        {
          id: mockRuleId,
          label: 'Major',
        },
      ];

      mockRepository.find.mockResolvedValue(rules);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return classification rule', async () => {
      const rule = {
        id: mockRuleId,
        label: 'Major',
        category: {
          id: mockCategoryId,
        },
      };

      mockRepository.findOne.mockResolvedValue(rule);

      const result = await service.findOne(mockRuleId);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw when rule not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(mockRuleId),
      ).rejects.toThrow(
        ClassificationRuleNotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create classification rule', async () => {
      const dto = {
        category_id: mockCategoryId,
        label: 'Major',
        min_score: 38,
        max_score: 50,
        is_active: true,
      };

      const savedRule = {
        id: mockRuleId,
        category: {
          id: mockCategoryId,
        },
        label: dto.label,
        min_score: dto.min_score,
        max_score: dto.max_score,
        is_active: dto.is_active,
      };

      mockRepository.find.mockResolvedValue([]);
      mockRepository.create.mockReturnValue(savedRule);
      mockRepository.save.mockResolvedValue(savedRule);

      const result = await service.create(dto, 1);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockAuditHelper.logSuccess).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw when score range is invalid', async () => {
      const dto = {
        category_id: mockCategoryId,
        label: 'Major',
        min_score: 60,
        max_score: 50,
      };

      await expect(
        service.create(dto as any, 1),
      ).rejects.toThrow(ClassificationScoreOutOfRangeException);

      expect(mockAuditHelper.logFailure).toHaveBeenCalled();
    });

    it('should throw when score range overlaps', async () => {
      const dto = {
        category_id: mockCategoryId,
        label: 'Major',
        min_score: 30,
        max_score: 45,
      };

      mockRepository.find.mockResolvedValue([
        {
          id: 'rule-2',
          label: 'Minor',
          min_score: 25,
          max_score: 40,
        },
      ]);

      await expect(
        service.create(dto as any, 1),
      ).rejects.toThrow(ClassificationScoreOverlapException);

      expect(mockAuditHelper.logFailure).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update classification rule', async () => {
      const existingRule = {
        id: mockRuleId,
        label: 'Major',
        min_score: 38,
        max_score: 50,
        is_active: true,
        category: {
          id: mockCategoryId,
        },
      };

      mockRepository.findOne.mockResolvedValue(
        existingRule,
      );

      mockRepository.find.mockResolvedValue([]);

      mockRepository.save.mockResolvedValue({
        ...existingRule,
        label: 'Updated Major',
      });

      const result = await service.update(
        mockRuleId,
        {
          label: 'Updated Major',
        },
        1,
      );

      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockAuditHelper.logSuccess).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw when update rule not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(
          mockRuleId,
          {},
          1,
        ),
      ).rejects.toThrow(
        ClassificationRuleNotFoundException,
      );
    });

    it('should throw when update creates overlap', async () => {
      const existingRule = {
        id: mockRuleId,
        label: 'Major',
        min_score: 38,
        max_score: 50,
        category: {
          id: mockCategoryId,
        },
      };

      mockRepository.findOne.mockResolvedValue(
        existingRule,
      );

      mockRepository.find.mockResolvedValue([
        {
          id: 'rule-2',
          label: 'Minor',
          min_score: 20,
          max_score: 35,
        },
      ]);

      await expect(
        service.update(
          mockRuleId,
          {
            min_score: 30,
            max_score: 40,
          },
          1,
        ),
      ).rejects.toThrow(ClassificationScoreOverlapException);

      expect(mockAuditHelper.logFailure).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete classification rule', async () => {
      const rule = {
        id: mockRuleId,
        label: 'Major',
      };

      mockRepository.findOne.mockResolvedValue(rule);
      mockRepository.save.mockResolvedValue(rule);
      mockRepository.softDelete.mockResolvedValue({
        affected: 1,
      });

      const result = await service.delete(
        mockRuleId,
        1,
      );

      expect(mockRepository.softDelete)
        .toHaveBeenCalledWith(mockRuleId);

      expect(mockAuditHelper.logSuccess)
        .toHaveBeenCalled();

      expect(result).toEqual({
        success: true,
        message:
          'Classification rule deleted successfully',
      });
    });

    it('should throw when delete rule not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.delete(
          mockRuleId,
          1,
        ),
      ).rejects.toThrow(
        ClassificationRuleNotFoundException,
      );

      expect(mockAuditHelper.logFailure)
        .toHaveBeenCalled();
    });
  });
});