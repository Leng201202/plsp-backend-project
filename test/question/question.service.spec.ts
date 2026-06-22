import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuestionService } from '../../src/modules/question/question.service';
import { Question } from '../../src/modules/question/entity/question.entity';
import { QuestionNotFoundException } from '../../src/common/exceptions/question.exception';
import { IsNull } from 'typeorm';
import { RedisService } from '../../src/common/redis/redis';

describe('QuestionService', () => {
  let service: QuestionService;

  const mockQuestionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockAuditHelper = {
    logSuccess: jest.fn(),
    logFailure: jest.fn(),
  };

  const mockRedisService = {
    exists: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
    del: jest.fn().mockResolvedValue(undefined),
    getOrSet: jest.fn(),
  };

  const questionMock = {
    id: 'question-uuid-1',
    questionnaire: { id: 'questionnaire-uuid-1' },
    category: { id: 'category-uuid-1' },
    question_text: 'What is your preferred study method?',
    order_no: 1,
    is_required: true,
    weight: 1,
    created_by: { id: 1 },
    updated_by: { id: 1 },
    deleted_at: null,
    deleted_by: null,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        {
          provide: getRepositoryToken(Question),
          useValue: mockQuestionRepository,
        },
        {
          provide: require('../../src/modules/audit-log/audit-helper.service').AuditHelper,
          useValue: mockAuditHelper,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create question', async () => {
    const dto = {
      questionnaire_id: 'questionnaire-uuid-1',
      category_id: 'category-uuid-1',
      question_text: 'What is your preferred study method?',
      order_no: 1,
      is_required: true,
      weight: 1,
      created_by: 1,
    };

    mockQuestionRepository.create.mockReturnValue(questionMock);
    mockQuestionRepository.save.mockResolvedValue(questionMock);
    // create() reloads after save
    mockQuestionRepository.findOne.mockResolvedValue(questionMock);

    const result = await service.create(dto, 1);

    expect(mockQuestionRepository.create).toHaveBeenCalledWith({
      questionnaire: { id: dto.questionnaire_id },
      category: { id: dto.category_id },
      question_text: dto.question_text,
      order_no: dto.order_no,
      is_required: dto.is_required,
      weight: dto.weight,
      created_by: { id: 1 },
    });
    expect(mockQuestionRepository.save).toHaveBeenCalledWith(questionMock);
    expect(mockQuestionRepository.findOne).toHaveBeenCalled();
    expect(mockRedisService.del).toHaveBeenCalledWith(expect.any(String));
    expect(result).toMatchObject({
      id: questionMock.id,
      question_text: questionMock.question_text,
    });
  });

  it('should throw when create reload fails', async () => {
    const dto = {
      questionnaire_id: 'questionnaire-uuid-1',
      category_id: 'category-uuid-1',
      question_text: 'Test',
      created_by: 1,
    };

    mockQuestionRepository.create.mockReturnValue(questionMock);
    mockQuestionRepository.save.mockResolvedValue(questionMock);
    // Reload returns null
    mockQuestionRepository.findOne.mockResolvedValue(null);

    await expect(service.create(dto as any, 1)).rejects.toThrow(
      QuestionNotFoundException,
    );

    expect(mockAuditHelper.logFailure).toHaveBeenCalled();
  });

  it('should find questions by questionnaire (excluding soft-deleted)', async () => {
    mockRedisService.getOrSet.mockImplementation(async (key, factory) => factory());
    mockQuestionRepository.find.mockResolvedValue([questionMock]);

    const result = await service.findByQuestionnaire('questionnaire-uuid-1');

    expect(mockQuestionRepository.find).toHaveBeenCalledWith({
      where: {
        deleted_at: IsNull(),
        questionnaire: { id: 'questionnaire-uuid-1' },
      },
      relations: {
        questionnaire: true,
        category: true,
        created_by: true,
        updated_by: true,
      },
      order: { order_no: 'ASC' },
    });
    expect(result).toMatchObject([{ id: questionMock.id }]);
  });

  it('should find one question (excluding soft-deleted)', async () => {
    mockQuestionRepository.findOne.mockResolvedValue(questionMock);

    const result = await service.findOne('question-uuid-1');

    expect(mockQuestionRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'question-uuid-1', deleted_at: IsNull() },
      relations: {
        questionnaire: true,
        category: true,
        created_by: true,
        updated_by: true,
      },
    });
    expect(result).toMatchObject({ id: questionMock.id });
  });

  it('should throw QuestionNotFoundException when question not found (or soft-deleted)', async () => {
    mockQuestionRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('question-uuid-1')).rejects.toThrow(
      QuestionNotFoundException,
    );
  });

  it('should update question', async () => {
    const dto = { question_text: 'Updated question text' };
    const updatedQuestion = {
      ...questionMock,
      question_text: 'Updated question text',
    };

    mockQuestionRepository.findOne.mockResolvedValueOnce(questionMock);
    mockQuestionRepository.merge.mockReturnValue(updatedQuestion);
    mockQuestionRepository.save.mockResolvedValue(updatedQuestion);
    // update() reloads after save
    mockQuestionRepository.findOne.mockResolvedValueOnce(updatedQuestion);

    const result = await service.update('question-uuid-1', dto, 1);

    expect(mockQuestionRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'question-uuid-1', deleted_at: IsNull() },
    });
    expect(mockQuestionRepository.merge).toHaveBeenCalledWith(questionMock, {
      question_text: 'Updated question text',
      updated_by: { id: 1 },
    });
    expect(mockQuestionRepository.save).toHaveBeenCalledWith(updatedQuestion);
    expect(mockRedisService.del).toHaveBeenCalledWith(expect.any(String));
    expect(result).toMatchObject({
      id: questionMock.id,
      question_text: 'Updated question text',
    });
  });

  it('should throw QuestionNotFoundException when updating missing/soft-deleted question', async () => {
    mockQuestionRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update('question-uuid-1', { question_text: 'test' }, 1),
    ).rejects.toThrow(QuestionNotFoundException);
  });

  it('should soft-delete question', async () => {
    mockQuestionRepository.findOne.mockResolvedValue(questionMock);
    mockQuestionRepository.save.mockResolvedValue(questionMock);
    mockQuestionRepository.softDelete.mockResolvedValue({ affected: 1 });

    const result = await service.delete('question-uuid-1', 1);

    expect(mockQuestionRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'question-uuid-1', deleted_at: IsNull() },
      relations: { questionnaire: true },
    });
    expect(mockQuestionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ deleted_by: { id: 1 } }),
    );
    expect(mockQuestionRepository.softDelete).toHaveBeenCalledWith(
      'question-uuid-1',
    );
    expect(mockRedisService.del).toHaveBeenCalledWith(expect.any(String));
    expect(result).toEqual({
      message: 'Question deleted successfully',
      success: true,
    });
  });

  it('should throw QuestionNotFoundException when deleting missing/soft-deleted question', async () => {
    mockQuestionRepository.findOne.mockResolvedValue(null);

    await expect(service.delete('question-uuid-1', 1)).rejects.toThrow(
      QuestionNotFoundException,
    );
  });
});