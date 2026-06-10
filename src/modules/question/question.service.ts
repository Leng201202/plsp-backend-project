import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './entity/question.entity';
import { IsNull, Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create.question.dto';
import { plainToInstance } from 'class-transformer';
import { QuestionResponseDto } from './dto/response-question.dto';
import { UpdateQuestionDto } from './dto/update.question.dto';
import { QuestionNotFoundException } from 'src/common/exceptions/question.exception';
import { Employee } from '../employee/entity/employee.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async create(dto: CreateQuestionDto) {
    const { questionnaire_id, category_id, created_by, ...rest } = dto;
    const question = this.questionRepository.create({
      ...rest,
      questionnaire: { id: questionnaire_id },
      category: { id: category_id },
      created_by: { id: created_by } as any,
    } as any);
    return plainToInstance(
      QuestionResponseDto,
      await this.questionRepository.save(question),
    );
  }

  async findAll() {
    return plainToInstance(
      QuestionResponseDto,
      await this.questionRepository.find({
        where: {
          deleted_at: IsNull(),
        },
        relations: {
          questionnaire: true,
          category: true,
          created_by: true,
          updated_by: true,
        },
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
    if (!question) {
      throw new QuestionNotFoundException();
    }
    return plainToInstance(QuestionResponseDto, question);
  }

  async update(id: string, dto: UpdateQuestionDto, updated_by: number) {
    const question = await this.questionRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!question) {
      throw new QuestionNotFoundException();
    }

    const { questionnaire_id, category_id, created_by, ...rest } =
      dto;

    // Convert IDs to objects for TypeORM relations
    const updateData: any = { ...rest };
    if (questionnaire_id) updateData.questionnaire = { id: questionnaire_id };
    if (category_id) updateData.category = { id: category_id };
    if (created_by) updateData.created_by = { id: created_by };
    if (updated_by) updateData.updated_by = { id: updated_by };

    const updatedQuestion = this.questionRepository.merge(question, updateData);
    return plainToInstance(
      QuestionResponseDto,
      await this.questionRepository.save(updatedQuestion),
    );
  }

  async delete(id: string, deleted_by: number) {
    const question = await this.questionRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!question) {
      throw new QuestionNotFoundException();
    }
    question.deleted_by = { id: deleted_by } as Employee;
    await this.questionRepository.save(question);
    await this.questionRepository.softDelete(id);
    return {
      message: 'Question deleted successfully',
      success: true,
    };
  }
}
