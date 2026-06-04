import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../../src/modules/category/category.controller';
import { CategoryService } from '../../src/modules/category/category.service';

describe('CategoryController', () => {
  let controller: CategoryController;

  const mockCategoryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create category', async () => {
    const dto: any = { name: 'Visual', description: 'desc' };
    mockCategoryService.create.mockResolvedValue(dto);

    expect(await controller.create(dto)).toEqual(dto);
    expect(mockCategoryService.create).toHaveBeenCalledWith(dto);
  });

  it('should find all categories', async () => {
    mockCategoryService.findAll.mockResolvedValue([]);

    expect(await controller.findAll()).toEqual([]);
    expect(mockCategoryService.findAll).toHaveBeenCalled();
  });

  it('should find one category', async () => {
    const category = { id: 'uuid-1', name: 'Visual' };
    mockCategoryService.findOne.mockResolvedValue(category);

    expect(await controller.findOne('uuid-1')).toEqual(category);
    expect(mockCategoryService.findOne).toHaveBeenCalledWith('uuid-1');
  });

  it('should update category', async () => {
    const dto: any = { name: 'Updated' };
    const category = { id: 'uuid-1', name: 'Updated' };
    mockCategoryService.update.mockResolvedValue(category);

    expect(await controller.update('uuid-1', dto)).toEqual(category);
    expect(mockCategoryService.update).toHaveBeenCalledWith('uuid-1', dto);
  });

  it('should remove category', async () => {
    const response = {
      success: true,
      message: 'Category deleted successfully',
    };
    mockCategoryService.delete.mockResolvedValue(response);

    expect(await controller.remove('uuid-1')).toEqual(response);
    expect(mockCategoryService.delete).toHaveBeenCalledWith('uuid-1');
  });
});
