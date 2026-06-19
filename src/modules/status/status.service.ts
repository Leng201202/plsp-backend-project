import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from './entity/status.entity';
import { DeepPartial, IsNull, Repository } from 'typeorm';
import { CreateStatusDto } from './dto/create.status.dto';
import { plainToInstance } from 'class-transformer';
import { StatusResponseDto } from './dto/response-status.dto';
import { UpdateStatusDto } from './dto/update.status.dto';
import { StatusNotFoundException } from 'src/common/exceptions/status.exception';
import { Employee } from '../employee/entity/employee.entity';
import { AuditHelper } from '../audit-log/audit-helper.service';
import { AuditAction, AuditModule } from '../audit-log/entity/audit-log.entity';
import { CacheKeys, RedisService } from 'src/common/redis/redis';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
    private readonly audit: AuditHelper,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateStatusDto, employeeId: number) {
    const base = { employeeId, action: AuditAction.CREATE, module: AuditModule.STATUS };
    try {
      const { created_by, ...rest } = dto;
      const status = this.statusRepository.create({
        ...rest,
        created_by: { id: created_by || employeeId },
      } as DeepPartial<Status>);
      const saved = await this.statusRepository.save(status as Status);
      await this.redis.del(CacheKeys.statusMap());
      await this.audit.logSuccess({ ...base, recordId: saved.id, details: { name: saved.name } });
      return plainToInstance(StatusResponseDto, saved);
    } catch (error) {
      await this.audit.logFailure({ ...base, details: { name: dto.name } }, error);
      throw error;
    }
  }

  async findAll() {
    return plainToInstance(
      StatusResponseDto,
      await this.statusRepository.find({
        where: { deleted_at: IsNull() },
        relations: { created_by: true, updated_by: true },
      }),
    );
  }

  async findOne(id: string) {
    const status = await this.statusRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: { created_by: true, updated_by: true },
    });
    if (!status) throw new StatusNotFoundException();
    return plainToInstance(StatusResponseDto, status);
  }

  async update(id: string, dto: UpdateStatusDto, employeeId: number) {
    const base = { employeeId, action: AuditAction.UPDATE, module: AuditModule.STATUS, recordId: id };
    let previous: Status | undefined;
    try {
      const status = await this.statusRepository.findOne({ where: { id, deleted_at: IsNull() } });
      if (!status) throw new StatusNotFoundException();
      previous = { ...status };
      const updateData: any = { ...dto };
      if (employeeId) updateData.updated_by = { id: employeeId };
      const saved = await this.statusRepository.save(this.statusRepository.merge(status, updateData));
      await this.redis.del(CacheKeys.statusMap());
      await this.audit.logSuccess({ ...base, details: { old: previous, new: saved } });
      return plainToInstance(StatusResponseDto, saved);
    } catch (error) {
      await this.audit.logFailure({ ...base, details: { old: previous, new: dto } }, error);
      throw error;
    }
  }

  async delete(id: string, employeeId: number) {
    const base = { employeeId, action: AuditAction.DELETE, module: AuditModule.STATUS, recordId: id };
    let statusName = '';
    try {
      const status = await this.statusRepository.findOne({ where: { id, deleted_at: IsNull() } });
      if (!status) throw new StatusNotFoundException();
      statusName = status.name;
      status.updated_by = { id: employeeId } as Employee;
      await this.statusRepository.save(status);
      await this.statusRepository.softDelete(id);
      await this.redis.del(CacheKeys.statusMap());
      await this.audit.logSuccess({ ...base, details: { name: statusName } });
      return { message: 'Status deleted successfully', success: true };
    } catch (error) {
      await this.audit.logFailure({ ...base, details: statusName ? { name: statusName } : {} }, error);
      throw error;
    }
  }
}
