import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employee')
export class EmployeeController {
    constructor(
        private readonly employeeService: EmployeeService
    ) {}

    @Post()
    create(@Body() dto: CreateEmployeeDto) {
        return this.employeeService.create(dto);
    }
    @Get()
    findAll() {
        return this.employeeService.findAll();
    }
    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.employeeService.findOne(id);
    }
    @Patch(':id')
    update(@Param('id') id: number, @Body() dto: UpdateEmployeeDto) {
        return this.employeeService.update(id, dto);
    }
    @Delete(':id')
    delete(@Param('id') id: number) {
        return this.employeeService.delete(id);
    }



}
