import { Injectable, NotFoundException } from '@nestjs/common';
import { In, IsNull, Repository } from 'typeorm';
import { Employee } from './entity/employee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { plainToInstance } from 'class-transformer';
import { EmployeeResponseDto } from './dto/response-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeNotFoundException } from '../../common/exceptions/employee.exception';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectRepository(Employee)
        private readonly employeeRepository: Repository<Employee>
    ) {}

    async create(dto: CreateEmployeeDto) {
        return plainToInstance(
            EmployeeResponseDto,
            await this.employeeRepository.save(
                this.employeeRepository.create(dto)
            )
        );
    }
    async findAll(){
        return plainToInstance(
            EmployeeResponseDto,
            await this.employeeRepository.find({
                where: {
                    deleted_at: IsNull(),
                },
                order: {
                    id: 'ASC',
                }
            })
        );
    }
    async findOne(id: number) {
        const employee= await this.employeeRepository.findOne({
                where: {
                    id,
                    deleted_at: IsNull(),
                }
            });
        if (!employee) throw new EmployeeNotFoundException();
        return plainToInstance(
            EmployeeResponseDto,
            employee
        );
    }
    async update(id: number, dto: UpdateEmployeeDto) {
        const employee = await this.employeeRepository.findOne({
            where: {
                id,
                deleted_at: IsNull(),
            }
        });
        if (!employee) throw new EmployeeNotFoundException();
        const updatedEmployee = this.employeeRepository.merge(employee, dto);
        return plainToInstance(
            EmployeeResponseDto,
            await this.employeeRepository.save(updatedEmployee)
        );
    }
    async delete(id: number) {
        const employee = await this.employeeRepository.findOne({
            where: {
                id,
                deleted_at: IsNull(),
            }
        });
        if (!employee) throw new EmployeeNotFoundException();
        await this.employeeRepository.softDelete(id);
        return {
            message: 'Employee deleted successfully',
            success: true
        }
    }

}
