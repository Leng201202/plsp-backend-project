import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from './entity/status.entity';
import { Repository } from 'typeorm';
import { CreateStatusDto } from './dto/create.status.dto';
import { plainToInstance } from 'class-transformer';
import { StatusResponseDto } from './dto/response-status.dto';
import { UpdateStatusDto } from './dto/update.status.dto';
import { StatusNotFoundException } from 'src/common/exceptions/status.exception';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
  ) {}

  async create(dto: CreateStatusDto) {
    const { created_by, updated_by, ...rest } = dto;
    const status = this.statusRepository.create({
      ...rest,
      ...(created_by && { created_by: { id: created_by } }),
      ...(updated_by && { updated_by: { id: updated_by } }),
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
        relations: {
          created_by: true,
          updated_by: true,
        },
      }),
    );
  }

  async findOne(id: string) {
    const status = await this.statusRepository.findOne({
      where: { id },
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

  async update(id: string, dto: UpdateStatusDto) {
    const status = await this.statusRepository.findOne({ where: { id } });
    if (!status) {
      throw new StatusNotFoundException();
    }

    const { created_by, updated_by, ...rest } = dto;
    const updateData: any = { ...rest };
    if (created_by) updateData.createdBy = { id: created_by };
    if (updated_by) updateData.updated_by = { id: updated_by };

    const updatedStatus = this.statusRepository.merge(status, updateData);
    return plainToInstance(
      StatusResponseDto,
      await this.statusRepository.save(updatedStatus),
    );
  }

  async delete(id: string) {
    const status = await this.statusRepository.findOne({ where: { id } });
    if (!status) {
      throw new StatusNotFoundException();
    }
    await this.statusRepository.remove(status);
    return {
      message: 'Status deleted successfully',
      success: true,
    };
  }
}
