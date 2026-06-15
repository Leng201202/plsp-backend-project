import { Injectable } from '@nestjs/common';
import { In, IsNull, Repository } from 'typeorm';
import { Employee } from './entity/employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { plainToInstance } from 'class-transformer';
import { EmployeeResponseDto } from './dto/response-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeNotFoundException } from '../../common/exceptions/employee.exception';
import { AuditHelper } from '../audit-log/audit-helper.service';
import { AuditAction, AuditModule } from '../audit-log/entity/audit-log.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly audit: AuditHelper,
  ) {}

  async create(dto: CreateEmployeeDto, employeeId: number) {
    const base = { employeeId, action: AuditAction.CREATE, module: AuditModule.EMPLOYEE };
    try {
      const saved = await this.employeeRepository.save(
        this.employeeRepository.create(dto),
      );
      await this.audit.logSuccess({
        ...base,
        recordId: String(saved.id),
        details: { firstname: saved.firstname, lastname: saved.lastname, email: saved.email },
      });
      return plainToInstance(EmployeeResponseDto, saved);
    } catch (error) {
      await this.audit.logFailure(
        { ...base, details: { firstname: dto.firstname, lastname: dto.lastname, email: dto.email } },
        error,
      );
      throw error;
    }
  }

  async findAll() {
    return plainToInstance(
      EmployeeResponseDto,
      await this.employeeRepository.find({
        where: { deleted_at: IsNull() },
        order: { id: 'ASC' },
      }),
    );
  }

  async findOne(id: number) {
    const employee = await this.employeeRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!employee) throw new EmployeeNotFoundException();
    return plainToInstance(EmployeeResponseDto, employee);
  }

  async update(id: number, dto: UpdateEmployeeDto, employeeId: number) {
    const base = { employeeId, action: AuditAction.UPDATE, module: AuditModule.EMPLOYEE, recordId: String(id) };
    let previous: Employee | undefined;
    try {
      const employee = await this.employeeRepository.findOne({
        where: { id, deleted_at: IsNull() },
      });
      if (!employee) throw new EmployeeNotFoundException();
      previous = { ...employee };
      const saved = await this.employeeRepository.save(
        this.employeeRepository.merge(employee, dto),
      );
      await this.audit.logSuccess({ ...base, details: { old: previous, new: saved } });
      return plainToInstance(EmployeeResponseDto, saved);
    } catch (error) {
      await this.audit.logFailure({ ...base, details: { old: previous, new: dto } }, error);
      throw error;
    }
  }

  async delete(id: number, employeeId: number) {
    const base = { employeeId, action: AuditAction.DELETE, module: AuditModule.EMPLOYEE, recordId: String(id) };
    let employeeName = '';
    try {
      const employee = await this.employeeRepository.findOne({
        where: { id, deleted_at: IsNull() },
      });
      if (!employee) throw new EmployeeNotFoundException();
      employeeName = `${employee.firstname} ${employee.lastname}`;
      await this.employeeRepository.softDelete(id);
      await this.audit.logSuccess({ ...base, details: { name: employeeName } });
      return { message: 'Employee deleted successfully', success: true };
    } catch (error) {
      await this.audit.logFailure({ ...base, details: employeeName ? { name: employeeName } : {} }, error);
      throw error;
    }
  }
}
