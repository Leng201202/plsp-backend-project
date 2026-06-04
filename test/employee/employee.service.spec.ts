import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull } from 'typeorm';

import { EmployeeService } from '../../src/modules/employee/employee.service';
import { Employee } from '../../src/modules/employee/entity/employee.entity';
import { EmployeeNotFoundException } from '../../src/common/exceptions/employee.exception';

describe('EmployeeService', () => {
  let service: EmployeeService;

  const mockEmployeeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  const employee = {
    id: 1,
    employee_uuid: '550e8400-e29b-41d4-a716-446655440000',
    employee_id: 1001,
    email: 'john@example.com',
    firstname: 'John',
    lastname: 'Doe',
    is_active: 1,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockEmployeeRepository,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create employee', async () => {
    const dto: any = {
      employee_uuid: employee.employee_uuid,
      employee_id: employee.employee_id,
      email: employee.email,
      firstname: employee.firstname,
      lastname: employee.lastname,
    };

    mockEmployeeRepository.create.mockReturnValue(dto);
    mockEmployeeRepository.save.mockResolvedValue(employee);

    const result = await service.create(dto);

    expect(mockEmployeeRepository.create).toHaveBeenCalledWith(dto);
    expect(mockEmployeeRepository.save).toHaveBeenCalledWith(dto);
    expect(result).toMatchObject(employee);
  });

  it('should find all employees', async () => {
    mockEmployeeRepository.find.mockResolvedValue([employee]);

    const result = await service.findAll();

    expect(mockEmployeeRepository.find).toHaveBeenCalledWith({
      where: {
        deleted_at: IsNull(),
      },
      order: {
        id: 'ASC',
      },
    });

    expect(result).toMatchObject([employee]);
  });

  it('should find one employee', async () => {
    mockEmployeeRepository.findOne.mockResolvedValue(employee);

    const result = await service.findOne(1);

    expect(mockEmployeeRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 1,
        deleted_at: IsNull(),
      },
    });

    expect(result).toMatchObject(employee);
  });

  it('should throw EmployeeNotFoundException when employee not found', async () => {
    mockEmployeeRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(EmployeeNotFoundException);
  });

  it('should update employee', async () => {
    const dto: any = { firstname: 'Updated' };
    const updatedEmployee = { ...employee, firstname: 'Updated' };

    mockEmployeeRepository.findOne.mockResolvedValue(employee);
    mockEmployeeRepository.merge.mockReturnValue(updatedEmployee);
    mockEmployeeRepository.save.mockResolvedValue(updatedEmployee);

    const result = await service.update(1, dto);

    expect(mockEmployeeRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: 1,
        deleted_at: IsNull(),
      },
    });

    expect(mockEmployeeRepository.merge).toHaveBeenCalledWith(employee, dto);
    expect(mockEmployeeRepository.save).toHaveBeenCalledWith(updatedEmployee);
    expect(result).toMatchObject(updatedEmployee);
  });

  it('should throw EmployeeNotFoundException when updating missing employee', async () => {
    mockEmployeeRepository.findOne.mockResolvedValue(null);

    await expect(service.update(1, {} as any)).rejects.toThrow(
      EmployeeNotFoundException,
    );
  });

  it('should soft delete employee', async () => {
    mockEmployeeRepository.findOne.mockResolvedValue(employee);
    mockEmployeeRepository.softDelete.mockResolvedValue({ affected: 1 });

    const result = await service.delete(1);

    expect(mockEmployeeRepository.softDelete).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      success: true,
      message: 'Employee deleted successfully',
    });
  });

  it('should throw EmployeeNotFoundException when deleting missing employee', async () => {
    mockEmployeeRepository.findOne.mockResolvedValue(null);

    await expect(service.delete(1)).rejects.toThrow(EmployeeNotFoundException);
  });
});
