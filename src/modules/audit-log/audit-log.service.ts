import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLog, AuditStatus } from './entity/audit-log.entity';
import { Repository } from 'typeorm';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { ResponseAuditLogDto } from './dto/response-audit-log.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuditLogService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditRepository:Repository<AuditLog>
    ){}
    
    async create(dto: CreateAuditLogDto):Promise<void>{
        const auditLog=this.auditRepository.create({
            ...dto,
            status: dto.status ?? AuditStatus.FAILED,
        })
        await this.auditRepository.save(auditLog);
    }

    async findAll():Promise<ResponseAuditLogDto[]>{
        const auditlogs=await this.auditRepository.find({
            relations: { employee: true },
            order:{
                timestamp: 'DESC',
            }
        });

        return plainToInstance(
            ResponseAuditLogDto,
            auditlogs,
            {
                excludeExtraneousValues:true,
            }
        )
    }
}
