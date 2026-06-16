import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './entity/question.entity';
import { DeepPartial, IsNull, Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create.question.dto';
import { plainToInstance } from 'class-transformer';
import { QuestionResponseDto } from './dto/response-question.dto';
import { UpdateQuestionDto } from './dto/update.question.dto';
import { QuestionNotFoundException } from 'src/common/exceptions/question.exception';
import { Employee } from '../employee/entity/employee.entity';
import { AuditHelper } from '../audit-log/audit-helper.service';
import { AuditAction, AuditModule } from '../audit-log/entity/audit-log.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly audit: AuditHelper,
  ) {}

  async create(dto: CreateQuestionDto, employeeId: number) {
    const base = { employeeId, action: AuditAction.CREATE, module: AuditModule.QUESTION };
    try {
      const { questionnaire_id, category_id, created_by, ...rest } = dto;
      const question = this.questionRepository.create({
        ...rest,
        questionnaire: { id: questionnaire_id },
        category: { id: category_id },
        created_by: { id: employeeId },
      } as DeepPartial<Question>);
      const saved = await this.questionRepository.save(question as Question);
      // Reload with relations
      const reloaded = await this.questionRepository.findOne({
        where: { id: saved.id, deleted_at: IsNull() },
        relations: { questionnaire: true, category: true, created_by: true, updated_by: true },
      });
      if (!reloaded) throw new QuestionNotFoundException();
      await this.audit.logSuccess({
        ...base,
        recordId: saved.id,
        details: { question_text: saved.question_text, questionnaire_id, category_id },
      });
      return plainToInstance(QuestionResponseDto, reloaded);
    } catch (error) {
      await this.audit.logFailure({ ...base, details: { question_text: dto.question_text } }, error);
      throw error;
    }
  }

  async findByQuestionnaire(questionnaireId: string) {
    return plainToInstance(
      QuestionResponseDto,
      await this.questionRepository.find({
        where: { 
          deleted_at: IsNull(),
          questionnaire: { id: questionnaireId }
        },
        relations: {
          questionnaire: true,
          category: true,
          created_by: true,
          updated_by: true,
        },
        order: { order_no: 'ASC' }
      }),
    );
  }

  async findOne(id: string) {
    const question = await this.questionRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: {
        questionnaire: true,
        category: true,
        created_by: true,
        updated_by: true,
      },
    });
    if (!question) throw new QuestionNotFoundException();
    return plainToInstance(QuestionResponseDto, question);
  }

  async update(id: string, dto: UpdateQuestionDto, employeeId: number) {
    const base = { employeeId, action: AuditAction.UPDATE, module: AuditModule.QUESTION, recordId: id };
    let previous: Question | undefined;
    try {
      const question = await this.questionRepository.findOne({ where: { id, deleted_at: IsNull() } });
      if (!question) throw new QuestionNotFoundException();
      previous = { ...question };
      const { questionnaire_id, category_id, created_by, ...rest } = dto;
      const updateData: any = { ...rest };
      if (questionnaire_id) updateData.questionnaire = { id: questionnaire_id };
      if (category_id) updateData.category = { id: category_id };
      if (created_by) updateData.created_by = { id: created_by };
      if (employeeId) updateData.updated_by = { id: employeeId };
      await this.questionRepository.save(this.questionRepository.merge(question, updateData));
      // Reload with relations
      const reloaded = await this.questionRepository.findOne({
        where: { id, deleted_at: IsNull() },
        relations: { questionnaire: true, category: true, created_by: true, updated_by: true },
      });
      if (!reloaded) throw new QuestionNotFoundException();
      await this.audit.logSuccess({ ...base, details: { old: previous, new: reloaded } });
      return plainToInstance(QuestionResponseDto, reloaded);
    } catch (error) {
      await this.audit.logFailure({ ...base, details: { old: previous, new: dto } }, error);
      throw error;
    }
  }

  async delete(id: string, employeeId: number) {
    const base = { employeeId, action: AuditAction.DELETE, module: AuditModule.QUESTION, recordId: id };
    let questionText = '';
    try {
      const question = await this.questionRepository.findOne({ where: { id, deleted_at: IsNull() } });
      if (!question) throw new QuestionNotFoundException();
      questionText = question.question_text;
      question.deleted_by = { id: employeeId } as Employee;
      await this.questionRepository.save(question);
      await this.questionRepository.softDelete(id);
      await this.audit.logSuccess({ ...base, details: { question_text: questionText } });
      return { message: 'Question deleted successfully', success: true };
    } catch (error) {
      await this.audit.logFailure({ ...base, details: questionText ? { question_text: questionText } : {} }, error);
      throw error;
    }
  }
}
