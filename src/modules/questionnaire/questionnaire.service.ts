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
      const statusMap = await this.getStatusMap();
      const initialStatus = status_id
        ? ({ id: status_id } as Status)
        : statusMap.draft;

      const questionnaire = this.questionnaireRepository.create({
        ...rest,
        ...(initialStatus && { status: initialStatus }),
        open_date: open_date,
        close_date: close_date,
        created_by: { id: employeeId },
        ...(updated_by && { updated_by: { id: updated_by } }),
      } as DeepPartial<Questionnaire>);

      // Resolve status dynamically based on dates before saving
      const resolved = this.resolveDynamicStatus(questionnaire as Questionnaire, statusMap);
      const saved = await this.questionnaireRepository.save(resolved);

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
    const [list, statusMap] = await Promise.all([
      this.questionnaireRepository.find({
        where: { deleted_at: IsNull() },
        relations: {
          status: true,
          created_by: true,
          updated_by: true,
        },
        order: { created_at: 'DESC' },
      }),
      this.getStatusMap(),
    ]);
    return plainToInstance(
      QuestionnaireResponseDto,
      list.map(q => this.resolveDynamicStatus(q, statusMap)),
    );
  }

  async findOne(id: string) {
    const [questionnaire, statusMap] = await Promise.all([
      this.questionnaireRepository.findOne({
        where: { id, deleted_at: IsNull() },
        relations: {
          status: true,
          created_by: true,
          updated_by: true,
        },
      }),
      this.getStatusMap(),
    ]);
    if (!questionnaire) throw new QuestionnaireNotFoundException();
    return plainToInstance(QuestionnaireResponseDto, this.resolveDynamicStatus(questionnaire, statusMap));
  }

  async update(id: string, dto: UpdateQuestionnaireDto, employeeId: number) {
    const base = { employeeId, action: AuditAction.UPDATE, module: AuditModule.QUESTIONNAIRE, recordId: id };
    let previous: Questionnaire | undefined;
    try {
      const [questionnaire, statusMap] = await Promise.all([
        this.questionnaireRepository.findOne({
          where: { id, deleted_at: IsNull() },
          relations: { status: true },
        }),
        this.getStatusMap(),
      ]);
      if (!questionnaire) throw new QuestionnaireNotFoundException();
      previous = { ...questionnaire };

      const { status_id, open_date, close_date, ...rest } = dto;
      const updateData: any = { ...rest };

      if (status_id) updateData.status = { id: status_id };
      if (open_date) updateData.open_date = open_date;
      if (close_date) updateData.close_date = close_date;
      if (employeeId) updateData.updated_by = { id: employeeId };

      const merged = this.questionnaireRepository.merge(questionnaire, updateData);
      
      // Resolve status dynamically based on dates before saving
      const resolved = this.resolveDynamicStatus(merged, statusMap);
      const saved = await this.questionnaireRepository.save(resolved);

      // Detect OPEN / CLOSE status change and emit additional audit action
      if (saved.status?.id !== previous.status?.id) {
        const newStatus = saved.status;
        if (newStatus) {
          const statusName = newStatus.name?.toLowerCase();
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

  private async getStatusMap(): Promise<{ draft?: Status; open?: Status; close?: Status }> {
    const statuses = await this.statusRepository.find();
    return {
      draft: statuses.find(s => s.name.toLowerCase() === 'draft'),
      open: statuses.find(s => s.name.toLowerCase() === 'open'),
      close: statuses.find(s => s.name.toLowerCase() === 'close' || s.name.toLowerCase() === 'closed'),
    };
  }

  private resolveDynamicStatus(
    questionnaire: Questionnaire,
    statusMap: { draft?: Status; open?: Status; close?: Status },
  ): Questionnaire {
    if (!questionnaire) return questionnaire;
    const now = new Date();
    const open = questionnaire.open_date ? new Date(questionnaire.open_date) : null;
    const close = questionnaire.close_date ? new Date(questionnaire.close_date) : null;

    if (open && now < open && statusMap.draft) {
      questionnaire.status = statusMap.draft;
    } else if (close && now > close && statusMap.close) {
      questionnaire.status = statusMap.close;
    } else if (open && now >= open && (!close || now <= close) && statusMap.open) {
      questionnaire.status = statusMap.open;
    }
    return questionnaire;
  }
}
