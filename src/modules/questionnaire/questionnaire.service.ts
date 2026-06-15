import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Questionnaire } from './entity/questionnaire.entity';
import { DeepPartial, IsNull, Repository } from 'typeorm';
import { CreateQuestionnaireDto } from './dto/create.questionnaire.dto';
import { plainToInstance } from 'class-transformer';
import { QuestionnaireResponseDto } from './dto/response-questionnaire.dto';
import { QuestionnaireNotFoundException } from 'src/common/exceptions/questionnaire.exception';
import { UpdateQuestionnaireDto } from './dto/update.questionnaire.dto';
import { Employee } from '../employee/entity/employee.entity';
import { Status } from '../status/entity/status.entity';
import { AuditHelper } from '../audit-log/audit-helper.service';
import { AuditAction, AuditModule } from '../audit-log/entity/audit-log.entity';

@Injectable()
export class QuestionnaireService {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
    private readonly audit: AuditHelper,
  ) {}

  async create(dto: CreateQuestionnaireDto, employeeId: number) {
    const base = { employeeId, action: AuditAction.CREATE, module: AuditModule.QUESTIONNAIRE };
    try {
      const {
        status_id,
        open_date,
        close_date,
        updated_by,
        ...rest
      } = dto;
      const questionnaire = this.questionnaireRepository.create({
        ...rest,
        status: { id: status_id },
        open_date: open_date,
        close_date: close_date,
        created_by: { id: employeeId },
        ...(updated_by && { updated_by: { id: updated_by } }),
      } as DeepPartial<Questionnaire>);
      const saved = await this.questionnaireRepository.save(questionnaire as Questionnaire);
      await this.audit.logSuccess({
        ...base,
        recordId: saved.id,
        details: { title: saved.title },
      });
      return plainToInstance(QuestionnaireResponseDto, saved);
    } catch (error) {
      await this.audit.logFailure({ ...base, details: { title: dto.title } }, error);
      throw error;
    }
  }

  async findAll() {
    return plainToInstance(
      QuestionnaireResponseDto,
      await this.questionnaireRepository.find({
        where: { deleted_at: IsNull() },
        relations: {
          status: true,
          created_by: true,
          updated_by: true,
        },
        order: { created_at: 'DESC' },
      }),
    );
  }

  async findOne(id: string) {
    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: {
        status: true,
        created_by: true,
        updated_by: true,
      },
    });
    if (!questionnaire) throw new QuestionnaireNotFoundException();
    return plainToInstance(QuestionnaireResponseDto, questionnaire);
  }

  async update(id: string, dto: UpdateQuestionnaireDto, employeeId: number) {
    const base = { employeeId, action: AuditAction.UPDATE, module: AuditModule.QUESTIONNAIRE, recordId: id };
    let previous: Questionnaire | undefined;
    try {
      const questionnaire = await this.questionnaireRepository.findOne({
        where: { id, deleted_at: IsNull() },
        relations: { status: true },
      });
      if (!questionnaire) throw new QuestionnaireNotFoundException();
      previous = { ...questionnaire };

      const { status_id, open_date, close_date, ...rest } = dto;
      const updateData: any = { ...rest };

      if (status_id) updateData.status = { id: status_id };
      if (open_date) updateData.open_date = open_date;
      if (close_date) updateData.close_date = close_date;
      if (employeeId) updateData.updated_by = { id: employeeId };

      const merged = this.questionnaireRepository.merge(questionnaire, updateData);
      const saved = await this.questionnaireRepository.save(merged);

      // Detect OPEN / CLOSE status change and emit additional audit action
      if (status_id && status_id !== previous.status?.id) {
        const newStatus = await this.statusRepository.findOneBy({ id: status_id });
        if (newStatus) {
          const statusName = newStatus.name.toLowerCase();
          if (statusName === 'open') {
            await this.audit.logSuccess({
              employeeId,
              action: AuditAction.OPEN,
              module: AuditModule.QUESTIONNAIRE,
              recordId: id,
              details: { title: saved.title },
            });
          } else if (statusName === 'close' || statusName === 'closed') {
            await this.audit.logSuccess({
              employeeId,
              action: AuditAction.CLOSE,
              module: AuditModule.QUESTIONNAIRE,
              recordId: id,
              details: { title: saved.title },
            });
          }
        }
      }

      await this.audit.logSuccess({ ...base, details: { old: previous, new: saved } });
      return plainToInstance(QuestionnaireResponseDto, saved);
    } catch (error) {
      await this.audit.logFailure({ ...base, details: { old: previous, new: dto } }, error);
      throw error;
    }
  }

  async delete(id: string, employeeId: number) {
    const base = { employeeId, action: AuditAction.DELETE, module: AuditModule.QUESTIONNAIRE, recordId: id };
    let questionnaireTitle = '';
    try {
      const questionnaire = await this.questionnaireRepository.findOne({
        where: { id, deleted_at: IsNull() },
      });
      if (!questionnaire) throw new QuestionnaireNotFoundException();
      questionnaireTitle = questionnaire.title;
      questionnaire.deleted_by = { id: employeeId } as Employee;

      await this.questionnaireRepository.save(questionnaire);
      await this.questionnaireRepository.softDelete(id);
      await this.audit.logSuccess({ ...base, details: { title: questionnaireTitle } });
      return { message: 'Questionnaire deleted successfully', success: true };
    } catch (error) {
      await this.audit.logFailure({ ...base, details: questionnaireTitle ? { title: questionnaireTitle } : {} }, error);
      throw error;
    }
  }
}
