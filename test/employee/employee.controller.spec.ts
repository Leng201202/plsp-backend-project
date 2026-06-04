import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from '../../src/modules/employee/employee.controller';
import { EmployeeService } from '../../src/modules/employee/employee.service';

describe('EmployeeController', () => {
  let controller: EmployeeController;

  const mockEmployeeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
      ],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create employee', async () => {
    const dto: any = {
      employee_uuid: '550e8400-e29b-41d4-a716-446655440000',
      employee_id: 1001,
      email: 'john@example.com',
      firstname: 'John',
      lastname: 'Doe',
    };

    mockEmployeeService.create.mockResolvedValue(dto);

    expect(await controller.create(dto)).toEqual(dto);
    expect(mockEmployeeService.create).toHaveBeenCalledWith(dto);
  });

  it('should find all employees', async () => {
    mockEmployeeService.findAll.mockResolvedValue([]);

    expect(await controller.findAll()).toEqual([]);
    expect(mockEmployeeService.findAll).toHaveBeenCalled();
  });

  it('should find one employee', async () => {
    const employee = { id: 1, firstname: 'John' };

    mockEmployeeService.findOne.mockResolvedValue(employee);

    expect(await controller.findOne(1)).toEqual(employee);
    expect(mockEmployeeService.findOne).toHaveBeenCalledWith(1);
  });

  it('should update employee', async () => {
    const dto: any = { firstname: 'Updated' };
    const employee = { id: 1, firstname: 'Updated' };

    mockEmployeeService.update.mockResolvedValue(employee);

    expect(await controller.update(1, dto)).toEqual(employee);
    expect(mockEmployeeService.update).toHaveBeenCalledWith(1, dto);
  });

  it('should remove employee', async () => {
    const response = {
      success: true,
      message: 'Employee deleted successfully',
    };

    mockEmployeeService.delete.mockResolvedValue(response);

    expect(await controller.delete(1)).toEqual(response);
    expect(mockEmployeeService.delete).toHaveBeenCalledWith(1);
  });
});
