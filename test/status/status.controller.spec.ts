import { Test, TestingModule } from '@nestjs/testing';
import { StatusController } from '../../src/modules/status/status.controller';
import { StatusService } from '../../src/modules/status/status.service';

describe('StatusController', () => {
  let controller: StatusController;

  const mockStatusService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusController],
      providers: [
        {
          provide: StatusService,
          useValue: mockStatusService,
        },
      ],
    }).compile();

    controller = module.get<StatusController>(StatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create status', async () => {
    const dto: any = { name: 'Draft', description: 'desc' };
    mockStatusService.create.mockResolvedValue(dto);

    expect(await controller.create(dto)).toEqual(dto);
    expect(mockStatusService.create).toHaveBeenCalledWith(dto, 1);
  });

  it('should find all statuses', async () => {
    mockStatusService.findAll.mockResolvedValue([]);

    expect(await controller.findAll()).toEqual([]);
    expect(mockStatusService.findAll).toHaveBeenCalled();
  });

  it('should find one status', async () => {
    const status = { id: 'uuid-1', name: 'Draft' };
    mockStatusService.findOne.mockResolvedValue(status);

    expect(await controller.findOne('uuid-1')).toEqual(status);
    expect(mockStatusService.findOne).toHaveBeenCalledWith('uuid-1');
  });

  it('should update status', async () => {
    const dto: any = { name: 'Updated' };
    const status = { id: 'uuid-1', name: 'Updated' };
    mockStatusService.update.mockResolvedValue(status);

    expect(await controller.update('uuid-1', dto)).toEqual(status);
    expect(mockStatusService.update).toHaveBeenCalledWith('uuid-1', dto, 1);
  });

  it('should remove status', async () => {
    const response = { success: true, message: 'Status deleted successfully' };
    mockStatusService.delete.mockResolvedValue(response);

    expect(await controller.remove('uuid-1')).toEqual(response);
    expect(mockStatusService.delete).toHaveBeenCalledWith('uuid-1', 1);
  });
});
