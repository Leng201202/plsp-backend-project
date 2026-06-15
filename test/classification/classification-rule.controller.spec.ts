import { Test, TestingModule } from '@nestjs/testing';
import { ClassificationRuleController } from '../../src/modules/classification/classification-rule.controller';
import { ClassificationRuleService } from '../../src/modules/classification/classification-rule.service';
import { CreateClassificationRuleDto } from '../../src/modules/classification/dto/create.classification.dto';
import { UpdateClassificationRuleDto } from '../../src/modules/classification/dto/update.classification.dto';
import { getCurrentUser } from '../../src/common/middleware/curr_user';

describe('ClassificationRuleController', () => {
  let controller: ClassificationRuleController;

  const mockClassificationRuleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockCategoryId =
    '550e8400-e29b-41d4-a716-446655440000';

  const mockRuleId =
    '550e8400-e29b-41d4-a716-446655440001';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassificationRuleController],
      providers: [
        {
          provide: ClassificationRuleService,
          useValue: mockClassificationRuleService,
        },
      ],
    }).compile();

    controller = module.get<ClassificationRuleController>(
      ClassificationRuleController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create classification rule', async () => {
      const dto: CreateClassificationRuleDto = {
        category_id: mockCategoryId,
        label: 'Major',
        min_score: 38,
        max_score: 50,
        is_active: true,
      };

      mockClassificationRuleService.create.mockResolvedValue(dto);

      const result = await controller.create(dto);

      expect(
        mockClassificationRuleService.create,
      ).toHaveBeenCalledWith(
        dto,
        getCurrentUser,
      );

      expect(result).toEqual(dto);
    });
  });

  describe('findAll', () => {
    it('should return all classification rules', async () => {
      const rules = [
        {
          id: mockRuleId,
          label: 'Major',
          min_score: 38,
          max_score: 50,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          label: 'Minor',
          min_score: 25,
          max_score: 37,
        },
      ];

      mockClassificationRuleService.findAll.mockResolvedValue(
        rules,
      );

      const result = await controller.findAll();

      expect(
        mockClassificationRuleService.findAll,
      ).toHaveBeenCalled();

      expect(result).toEqual(rules);
    });
  });

  describe('findOne', () => {
    it('should return classification rule by id', async () => {
      const rule = {
        id: mockRuleId,
        category_id: mockCategoryId,
        label: 'Major',
        min_score: 38,
        max_score: 50,
      };

      mockClassificationRuleService.findOne.mockResolvedValue(
        rule,
      );

      const result = await controller.findOne(
        mockRuleId,
      );

      expect(
        mockClassificationRuleService.findOne,
      ).toHaveBeenCalledWith(
        mockRuleId,
      );

      expect(result).toEqual(rule);
    });
  });

  describe('update', () => {
    it('should update classification rule', async () => {
      const dto: UpdateClassificationRuleDto = {
        label: 'Updated Major',
      };

      const updatedRule = {
        id: mockRuleId,
        category_id: mockCategoryId,
        label: 'Updated Major',
        min_score: 38,
        max_score: 50,
      };

      mockClassificationRuleService.update.mockResolvedValue(
        updatedRule,
      );

      const result = await controller.update(
        mockRuleId,
        dto,
      );

      expect(
        mockClassificationRuleService.update,
      ).toHaveBeenCalledWith(
        mockRuleId,
        dto,
        getCurrentUser,
      );

      expect(result).toEqual(updatedRule);
    });
  });

  describe('delete', () => {
    it('should delete classification rule', async () => {
      const response = {
        success: true,
        message:
          'Classification rule deleted successfully',
      };

      mockClassificationRuleService.delete.mockResolvedValue(
        response,
      );

      const result = await controller.delete(
        mockRuleId,
      );

      expect(
        mockClassificationRuleService.delete,
      ).toHaveBeenCalledWith(
        mockRuleId,
        getCurrentUser,
      );

      expect(result).toEqual(response);
    });
  });
});