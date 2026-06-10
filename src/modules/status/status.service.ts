import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from './entity/status.entity';
import { IsNull, Repository } from 'typeorm';
import { CreateStatusDto } from './dto/create.status.dto';
import { plainToInstance } from 'class-transformer';
import { StatusResponseDto } from './dto/response-status.dto';
import { UpdateStatusDto } from './dto/update.status.dto';
import { StatusNotFoundException } from 'src/common/exceptions/status.exception';
import { Employee } from '../employee/entity/employee.entity';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
  ) {}

  async create(dto: CreateStatusDto) {
    const { created_by, ...rest } = dto;
    const status = this.statusRepository.create({
      ...rest,
      ...(created_by && { created_by: { id: created_by } }),
    } as any);
    return plainToInstance(
      StatusResponseDto,
      await this.statusRepository.save(status),
    );
  }

  async findAll() {
    return plainToInstance(
      StatusResponseDto,
      await this.statusRepository.find({
        where: {
          deleted_at: IsNull(),
        },
        relations: {
          created_by: true,
          updated_by: true,
        },
      }),
    );
  }

  async findOne(id: string) {
    const status = await this.statusRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: {
        created_by: true,
        updated_by: true,
      },
    });
    if (!status) {
      throw new StatusNotFoundException();
    }
    return plainToInstance(StatusResponseDto, status);
  }

  async update(id: string, dto: UpdateStatusDto, updated_by: number) {
    const status = await this.statusRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!status) {
      throw new StatusNotFoundException();
    }

    const { ...rest } = dto;
    const updateData: any = { ...rest };
    if (updated_by) updateData.updated_by = { id: updated_by };

    const updatedStatus = this.statusRepository.merge(status, updateData);
    return plainToInstance(
      StatusResponseDto,
      await this.statusRepository.save(updatedStatus),
    );
  }

  async delete(id: string, deleted_by: number) {
    const status = await this.statusRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!status) {
      throw new StatusNotFoundException();
    }
    status.updated_by = { id: deleted_by }as Employee;
    await this.statusRepository.save(status);
    await this.statusRepository.softDelete(id);
    return {
      message: 'Status deleted successfully',
      success: true,
    };
  }
}
