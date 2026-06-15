import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditLogService } from '../../src/modules/audit-log/audit-log.service';
import { AuditLog, AuditStatus, AuditAction, AuditModule } from '../../src/modules/audit-log/entity/audit-log.entity';

describe('AuditLogService', () => {
  let service: AuditLogService;

  const mockAuditLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockAuditLog = {
    id: 'audit-uuid-1',
    employee_id: 1,
    action: AuditAction.CREATE,
    module: AuditModule.EMPLOYEE,
    record_id: 'record-uuid-1',
    details: { key: 'value' },
    status: AuditStatus.SUCCESS,
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0',
    timestamp: new Date(),
    employee: {
      id: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
    },
  } as unknown as AuditLog;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditLogRepository,
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an audit log with default FAILED status', async () => {
      const dto = {
        employee_id: 1,
        action: AuditAction.CREATE,
        module: AuditModule.EMPLOYEE,
        record_id: 'record-uuid-1',
        details: { key: 'value' },
      };

      mockAuditLogRepository.create.mockReturnValue(mockAuditLog);
      mockAuditLogRepository.save.mockResolvedValue(mockAuditLog);

      await service.create(dto as any);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith({
        ...dto,
        status: AuditStatus.FAILED,
      });
      expect(mockAuditLogRepository.save).toHaveBeenCalledWith(mockAuditLog);
    });

    it('should create an audit log with provided status', async () => {
      const dto = {
        employee_id: 1,
        action: AuditAction.CREATE,
        module: AuditModule.EMPLOYEE,
        status: AuditStatus.SUCCESS,
      };

      mockAuditLogRepository.create.mockReturnValue(mockAuditLog);
      mockAuditLogRepository.save.mockResolvedValue(mockAuditLog);

      await service.create(dto as any);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith({
        ...dto,
        status: AuditStatus.SUCCESS,
      });
    });

    it('should include optional fields like ip_address and user_agent', async () => {
      const dto = {
        employee_id: 0,
        action: AuditAction.DELETE,
        module: AuditModule.SUBMISSION,
        status: AuditStatus.SUCCESS,
        ip_address: '192.168.1.1',
        user_agent: 'TestAgent',
      };

      const auditLogWithIp = { ...mockAuditLog, ip_address: '192.168.1.1', user_agent: 'TestAgent' };
      mockAuditLogRepository.create.mockReturnValue(auditLogWithIp);
      mockAuditLogRepository.save.mockResolvedValue(auditLogWithIp);

      await service.create(dto as any);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(dto);
      expect(mockAuditLogRepository.save).toHaveBeenCalledWith(auditLogWithIp);
    });
  });

  describe('findAll', () => {
    it('should return all audit logs with employee relation ordered by timestamp DESC', async () => {
      const mockAuditLogs = [mockAuditLog];
      mockAuditLogRepository.find.mockResolvedValue(mockAuditLogs);

      const result = await service.findAll();

      expect(mockAuditLogRepository.find).toHaveBeenCalledWith({
        relations: { employee: true },
        order: { timestamp: 'DESC' },
      });
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
    });

    it('should return transformed DTOs with exposed fields only', async () => {
      mockAuditLogRepository.find.mockResolvedValue([mockAuditLog]);

      const result = await service.findAll();

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('action');
      expect(result[0]).toHaveProperty('module');
      expect(result[0]).toHaveProperty('status');
      expect(result[0]).toHaveProperty('employee');
    });

    it('should return an empty array when no audit logs exist', async () => {
      mockAuditLogRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });
});