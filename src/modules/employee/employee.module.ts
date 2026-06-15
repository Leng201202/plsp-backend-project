import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entity/employee.entity';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    AuditLogModule,
  ],
  providers: [EmployeeService],
  controllers: [EmployeeController],
  exports: [TypeOrmModule],
})
export class EmployeeModule {}
