import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { Submission } from '../entity/submission.entity';
import { Questionnaire } from 'src/modules/questionnaire/entity/questionnaire.entity';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { QuestionnaireNotFoundException } from 'src/common/exceptions/questionnaire.exception';
import { generateSessionID } from '../utils/generateSessionID';
import { AnswerService } from './answer.service';
import { plainToInstance } from 'class-transformer';
import { ResponseSubmissionDto } from '../dto/response-submission.dto';
import { SubmissionNotFoundException } from 'src/common/exceptions/submission.exception';
import { Employee } from 'src/modules/employee/entity/employee.entity';
import { ResultService } from 'src/modules/result/result.service';

@Injectable()
export class SubmissionService {
  constructor(
    private readonly answerService: AnswerService,
    private readonly resultService: ResultService,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,

    @InjectRepository(Questionnaire)
    private readonly questionnaireRepository: Repository<Questionnaire>,
    

    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateSubmissionDto, userAgent: string) {
    const questionnaire = await this.questionnaireRepository.findOneBy({
      id: dto.questionnaire_id,
    });

    if (!questionnaire) {
      throw new QuestionnaireNotFoundException();
    }

    const anonymousSessionId = generateSessionID(
      dto.questionnaire_id,
      dto.fingerprint,
      userAgent,
    );

    const existing = await this.submissionRepository.findOne({
      where: {
        questionnaire: {
          id: dto.questionnaire_id,
        },
        anonymousSessionId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Submission already exists for this session and questionnaire',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const submission = manager.create(Submission, {
        questionnaire: {
          id: dto.questionnaire_id,
        },
        anonymousSessionId,
      });

      const savedSubmission = await manager.save(Submission, submission);

      await this.answerService.saveAnswers(
        manager,
        savedSubmission.id,
        dto.answers,
      );

      const results=await this.resultService.calculate(
        savedSubmission.id,
        manager,
      );

      return {
        success: true,
        message: 'Submission saved successfully',
        submission_id: savedSubmission.id,
        results,
      };
    });
  }

  async findAll(){
    return plainToInstance(
      ResponseSubmissionDto,
      await this.submissionRepository.find({
        where: {
          deleted_at: IsNull(),
        },
        relations:{
          questionnaire: true,
          answers: {
              question: true,
          },
        }
      }),
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async findOne(id: string){
    const submission = await this.submissionRepository.findOne({
      where: {
        id,
      },
      relations:{
        questionnaire: true,
        answers: {
            question: true,
        },
      }
    });
    if(!submission){
        throw new SubmissionNotFoundException();
    }

    return {
        success: true,
        data: plainToInstance(ResponseSubmissionDto, submission)
    };
  }

  async delete(id: string, deleteBy: number) {
    const submission = await this.submissionRepository.findOneBy({ id });
    if (!submission) {
      throw new SubmissionNotFoundException();
    }
    await this.submissionRepository.update(id, {
      deleted_by: { id: deleteBy } as Employee,
    });
    await this.submissionRepository.softDelete(id);
    return {
      success: true,
      message: 'Submission deleted successfully',
    };
  }

  async findByQuestionnaire(questionnaireId: string) {
    const questionnaire= await this.questionnaireRepository.findOneBy({
        id: questionnaireId,
    })
    if(!questionnaire){
        throw new QuestionnaireNotFoundException();
    }
    const submissions= await this.submissionRepository.find({
      where: {
        questionnaire: { id: questionnaireId },
      },
      order: {
        submitted_at: 'DESC',
      },
    });

    return {
      success: true,
      count: submissions.length,
      data: plainToInstance(ResponseSubmissionDto, submissions, {
        excludeExtraneousValues: true,
      }),
    };
  }
}

