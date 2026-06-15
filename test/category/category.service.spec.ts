import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryService } from '../../src/modules/category/category.service';
import { Category } from '../../src/modules/category/entity/category.entity';
import { CategoryNotFoundException } from '../../src/common/exceptions/category.exception';
import { IsNull } from 'typeorm';

describe('CategoryService', () => {
  let service: CategoryService;

  const mockCategoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    softDelete: jest.fn(),
  };

  const categoryMock = {
    id: 'category-uuid-1',
    name: 'Visual',
    description: 'Visual learning style category',
    created_by: { id: 1 },
    updated_by: { id: 1 },
    deleted_at: null,
    deleted_by: null,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
        {
          provide: require('../../src/modules/audit-log/audit-helper.service').AuditHelper,
          useValue: {
            logSuccess: jest.fn(),
            logFailure: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create category', async () => {
    const dto = {
      name: 'Visual',
      description: 'Visual learning style category',
      created_by: 1,
      updated_by: 1,
    };

    mockCategoryRepository.create.mockReturnValue(categoryMock);
    mockCategoryRepository.save.mockResolvedValue(categoryMock);

    const result = await service.create(dto, 1);

    expect(mockCategoryRepository.create).toHaveBeenCalledWith({
      name: dto.name,
      description: dto.description,
      created_by: { id: dto.created_by },
      updated_by: dto.updated_by,
    });
    expect(mockCategoryRepository.save).toHaveBeenCalledWith(categoryMock);
    expect(result).toMatchObject({
      id: categoryMock.id,
      name: categoryMock.name,
      description: categoryMock.description,
    });
  });

  it('should find all categories (excluding soft-deleted)', async () => {
    mockCategoryRepository.find.mockResolvedValue([categoryMock]);

    const result = await service.findAll();

    expect(mockCategoryRepository.find).toHaveBeenCalledWith({
      where: {
        deleted_at: IsNull(),
      },
      relations: {
        created_by: true,
        updated_by: true,
      },
    });
    expect(result).toMatchObject([{ id: categoryMock.id }]);
  });

  it('should find one category (excluding soft-deleted)', async () => {
    mockCategoryRepository.findOne.mockResolvedValue(categoryMock);

    const result = await service.findOne('category-uuid-1');

    expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'category-uuid-1', deleted_at: IsNull() },
      relations: {
        created_by: true,
        updated_by: true,
      },
    });
    expect(result).toMatchObject({ id: categoryMock.id });
  });

  it('should throw CategoryNotFoundException when category not found (or soft-deleted)', async () => {
    mockCategoryRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('category-uuid-1')).rejects.toThrow(
      CategoryNotFoundException,
    );
  });

  it('should update category', async () => {
    const dto = { name: 'Updated category' };
    const updatedCategory = { ...categoryMock, name: 'Updated category' };

    mockCategoryRepository.findOne.mockResolvedValue(categoryMock);
    mockCategoryRepository.merge.mockReturnValue(updatedCategory);
    mockCategoryRepository.save.mockResolvedValue(updatedCategory);

    const result = await service.update('category-uuid-1', dto, 1);

    expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'category-uuid-1', deleted_at: IsNull() },
    });
    expect(mockCategoryRepository.merge).toHaveBeenCalledWith(categoryMock, {
      name: 'Updated category',
      description: categoryMock.description,
      updated_by: { id: 1 },
    });
    expect(mockCategoryRepository.save).toHaveBeenCalledWith(updatedCategory);
    expect(result).toMatchObject({
      id: categoryMock.id,
      name: 'Updated category',
    });
  });

  it('should throw CategoryNotFoundException when updating missing/soft-deleted category', async () => {
    mockCategoryRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update('category-uuid-1', { name: 'test' }, 1),
    ).rejects.toThrow(CategoryNotFoundException);
  });

  it('should soft-delete category', async () => {
    mockCategoryRepository.findOne.mockResolvedValue(categoryMock);
    mockCategoryRepository.softDelete.mockResolvedValue({ affected: 1 });

    const result = await service.delete('category-uuid-1', 1);

    expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'category-uuid-1', deleted_at: IsNull() },
    });
    expect(mockCategoryRepository.softDelete).toHaveBeenCalledWith(
      'category-uuid-1',
    );
    expect(result).toEqual({
      message: 'Category deleted successfully',
      success: true,
    });
  });

  it('should throw CategoryNotFoundException when deleting missing/soft-deleted category', async () => {
    mockCategoryRepository.findOne.mockResolvedValue(null);

    await expect(service.delete('category-uuid-1', 1)).rejects.toThrow(
      CategoryNotFoundException,
    );
  });
});
