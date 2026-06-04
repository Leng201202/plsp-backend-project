import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StatusService } from '../../src/modules/status/status.service';
import { Status } from '../../src/modules/status/entity/status.entity';
import { StatusNotFoundException } from '../../src/common/exceptions/status.exception';
import { IsNull } from 'typeorm';

describe('StatusService', () => {
  let service: StatusService;

  const mockStatusRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    softDelete: jest.fn(),
  };

  const statusMock = {
    id: 'status-uuid-1',
    name: 'Draft',
    description: 'Initial state of questionnaire',
    created_by: { id: 1 },
    updated_by: { id: 1 },
    deleted_at: null,
    deleted_by: null,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusService,
        {
          provide: getRepositoryToken(Status),
          useValue: mockStatusRepository,
        },
      ],
    }).compile();

    service = module.get<StatusService>(StatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create status', async () => {
    const dto = {
      name: 'Draft',
      description: 'Initial state of questionnaire',
      created_by: 1,
      updated_by: 1,
    };

    mockStatusRepository.create.mockReturnValue(statusMock);
    mockStatusRepository.save.mockResolvedValue(statusMock);

    const result = await service.create(dto);

    expect(mockStatusRepository.create).toHaveBeenCalledWith({
      name: dto.name,
      description: dto.description,
      created_by: { id: dto.created_by },
      updated_by: { id: dto.updated_by },
    });
    expect(mockStatusRepository.save).toHaveBeenCalledWith(statusMock);
    expect(result).toMatchObject({
      id: statusMock.id,
      name: statusMock.name,
      description: statusMock.description,
    });
  });

  it('should find all statuses (excluding soft-deleted)', async () => {
    mockStatusRepository.find.mockResolvedValue([statusMock]);

    const result = await service.findAll();

    expect(mockStatusRepository.find).toHaveBeenCalledWith({
      where: {
        deleted_at: IsNull(),
      },
      relations: {
        created_by: true,
        updated_by: true,
      },
    });
    expect(result).toMatchObject([{ id: statusMock.id }]);
  });

  it('should find one status (excluding soft-deleted)', async () => {
    mockStatusRepository.findOne.mockResolvedValue(statusMock);

    const result = await service.findOne('status-uuid-1');

    expect(mockStatusRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'status-uuid-1', deleted_at: IsNull() },
      relations: {
        created_by: true,
        updated_by: true,
      },
    });
    expect(result).toMatchObject({ id: statusMock.id });
  });

  it('should throw StatusNotFoundException when status not found (or soft-deleted)', async () => {
    mockStatusRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('status-uuid-1')).rejects.toThrow(StatusNotFoundException);
  });

  it('should update status', async () => {
    const dto = { name: 'Updated status' };
    const updatedStatus = { ...statusMock, name: 'Updated status' };

    mockStatusRepository.findOne.mockResolvedValue(statusMock);
    mockStatusRepository.merge.mockReturnValue(updatedStatus);
    mockStatusRepository.save.mockResolvedValue(updatedStatus);

    const result = await service.update('status-uuid-1', dto);

    expect(mockStatusRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'status-uuid-1', deleted_at: IsNull() },
    });
    expect(mockStatusRepository.merge).toHaveBeenCalledWith(statusMock, { name: 'Updated status' });
    expect(mockStatusRepository.save).toHaveBeenCalledWith(updatedStatus);
    expect(result).toMatchObject({ id: statusMock.id, name: 'Updated status' });
  });

  it('should throw StatusNotFoundException when updating missing/soft-deleted status', async () => {
    mockStatusRepository.findOne.mockResolvedValue(null);

    await expect(service.update('status-uuid-1', { name: 'test' })).rejects.toThrow(StatusNotFoundException);
  });

  it('should soft-delete status', async () => {
    mockStatusRepository.findOne.mockResolvedValue(statusMock);
    mockStatusRepository.softDelete.mockResolvedValue({ affected: 1 });

    const result = await service.delete('status-uuid-1');

    expect(mockStatusRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'status-uuid-1', deleted_at: IsNull() },
    });
    expect(mockStatusRepository.softDelete).toHaveBeenCalledWith('status-uuid-1');
    expect(result).toEqual({
      message: 'Status deleted successfully',
      success: true,
    });
  });

  it('should throw StatusNotFoundException when deleting missing/soft-deleted status', async () => {
    mockStatusRepository.findOne.mockResolvedValue(null);

    await expect(service.delete('status-uuid-1')).rejects.toThrow(StatusNotFoundException);
  });
});
