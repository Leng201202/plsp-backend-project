import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Questionnaire } from './entity/questionnaire.entity';
import { Repository } from 'typeorm';
import { CreateQuestionDto } from '../question/dto/create.question.dto';
import { CreateQuestionnaireDto } from './dto/create.questionnaire.dto';
import { plainToInstance } from 'class-transformer';
import { QuestionnaireResponseDto } from './dto/response-questionnaire.dto';
import { QuestionnaireNotFoundException } from 'src/common/exceptions/questionnaire.exception';
import { UpdateQuestionnaireDto } from './dto/update.questionnaire.dto';

@Injectable()
export class QuestionnaireService {
    constructor(
        @InjectRepository(Questionnaire)
        private readonly questionnaireRepository: Repository<Questionnaire>
    ){}

    async create(dto: CreateQuestionnaireDto){
        const { status_id, open_date, close_date, created_by, updated_by, ...rest } = dto;
        const questionnaire = this.questionnaireRepository.create({
            ...rest,
            status: { id: status_id },
            open_date: open_date,
            close_date: close_date,
            created_by: { id: created_by } as any,
            ...(updated_by && { updated_by: { id: updated_by } as any }),
        } as any);
        return plainToInstance(
            QuestionnaireResponseDto,
            await this.questionnaireRepository.save(questionnaire)
        );
    }

    async findAll(){
        return plainToInstance(
            QuestionnaireResponseDto,
            await this.questionnaireRepository.find(
                {
                    relations: {
                        status: true,
                        created_by: true,
                        updated_by: true,
                    },
                    order:{
                        created_at: 'DESC'
                    }
                }
            )
        )
    }

    async findOne(id: string){
        const questionnaire = await this.questionnaireRepository.findOne({
            where: {
                id,
            },
            relations: {
                status: true,
                created_by: true,
                updated_by: true,
            }
        });
        if (!questionnaire) throw new QuestionnaireNotFoundException();
        return plainToInstance(
            QuestionnaireResponseDto,
            questionnaire
        );
    }


    async update(id: string, dto: UpdateQuestionnaireDto){
        const questionnaire = await this.questionnaireRepository.findOne({
            where: {
                id,
            }
        });
        if (!questionnaire) throw new QuestionnaireNotFoundException();

        const { status_id, open_date, close_date, created_by, updated_by, ...rest } = dto;
        const updateData: any = { ...rest };
        
        if (status_id) updateData.status = { id: status_id };
        if (open_date) updateData.open_date = open_date;
        if (close_date) updateData.close_date = close_date;
        if (created_by) updateData.created_by = { id: created_by };
        if (updated_by) updateData.updated_by = { id: updated_by };

        const updatedQuestionnaire = this.questionnaireRepository.merge(questionnaire, updateData);
        return plainToInstance(
            QuestionnaireResponseDto,
            await this.questionnaireRepository.save(updatedQuestionnaire)
        );
    }
    async delete(id: string){
        const questionnaire = await this.questionnaireRepository.findOne({
            where: {
                id,
            }
        });
        if (!questionnaire) throw new QuestionnaireNotFoundException();
        await this.questionnaireRepository.softDelete(id);
        return {
            message: 'Questionnaire deleted successfully',
            success: true
        };
    }
}
