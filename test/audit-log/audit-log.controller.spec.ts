import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogController } from '../../src/modules/audit-log/audit-log.controller';
import { AuditLogService } from '../../src/modules/audit-log/audit-log.service';
import { AuditAction, AuditModule, AuditStatus } from '../../src/modules/audit-log/entity/audit-log.entity';

describe('AuditLogController', () => {
  let controller: AuditLogController;
  let auditLogService: jest.Mocked<AuditLogService>;

  const mockAuditLogService = {
    findAll: jest.fn(),
  };

  const mockAuditLogs = [
    {
      id: 'audit-uuid-1',
      action: AuditAction.CREATE,
      module: AuditModule.EMPLOYEE,
      record_id: 'record-uuid-1',
      status: AuditStatus.SUCCESS,
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0',
      timestamp: new Date(),
      employee: { id: 1, fullName: 'John Doe', email: 'john@example.com' },
    },
    {
      id: 'audit-uuid-2',
      action: AuditAction.DELETE,
      module: AuditModule.SUBMISSION,
      record_id: 'record-uuid-2',
      status: AuditStatus.FAILED,
      ip_address: '192.168.1.1',
      user_agent: 'TestAgent',
      timestamp: new Date(),
      employee: null,
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogController],
      providers: [
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
      ],
    }).compile();

    controller = module.get<AuditLogController>(AuditLogController);
    auditLogService = module.get(AuditLogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all audit logs', async () => {
      mockAuditLogService.findAll.mockResolvedValue(mockAuditLogs);

      const result = await controller.findAll();

      expect(auditLogService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAuditLogs);
      expect(result).toHaveLength(2);
    });

    it('should return an empty array when no audit logs exist', async () => {
      mockAuditLogService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(auditLogService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should return ResponseAuditLogDto[] type shape', async () => {
      mockAuditLogService.findAll.mockResolvedValue(mockAuditLogs);

      const result = await controller.findAll();

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('action');
      expect(result[0]).toHaveProperty('module');
      expect(result[0]).toHaveProperty('status');
      expect(result[0]).toHaveProperty('employee');
      expect(result[0]).not.toHaveProperty('employee_id');
    });
  });
});