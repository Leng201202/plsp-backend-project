import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuestionService } from '../../src/modules/question/question.service';
import { Question } from '../../src/modules/question/entity/question.entity';
import { QuestionNotFoundException } from '../../src/common/exceptions/question.exception';
import { IsNull } from 'typeorm';

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

    const result = await service.create(dto);

    expect(mockQuestionRepository.create).toHaveBeenCalledWith({
      questionnaire: { id: dto.questionnaire_id },
      category: { id: dto.category_id },
      question_text: dto.question_text,
      order_no: dto.order_no,
      is_required: dto.is_required,
      weight: dto.weight,
      created_by: { id: dto.created_by },
    });
    expect(mockQuestionRepository.save).toHaveBeenCalledWith(questionMock);
    expect(result).toMatchObject({
      id: questionMock.id,
      question_text: questionMock.question_text,
    });
  });

  it('should find all questions (excluding soft-deleted)', async () => {
    mockQuestionRepository.find.mockResolvedValue([questionMock]);

    const result = await service.findAll();

    expect(mockQuestionRepository.find).toHaveBeenCalledWith({
      where: {
        deleted_at: IsNull(),
      },
      relations: {
        questionnaire: true,
        category: true,
        created_by: true,
        updated_by: true,
      },
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

    await expect(service.findOne('question-uuid-1')).rejects.toThrow(QuestionNotFoundException);
  });

  it('should update question', async () => {
    const dto = { question_text: 'Updated question text' };
    const updatedQuestion = { ...questionMock, question_text: 'Updated question text' };

    mockQuestionRepository.findOne.mockResolvedValue(questionMock);
    mockQuestionRepository.merge.mockReturnValue(updatedQuestion);
    mockQuestionRepository.save.mockResolvedValue(updatedQuestion);

    const result = await service.update('question-uuid-1', dto);

    expect(mockQuestionRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'question-uuid-1', deleted_at: IsNull() },
    });
    expect(mockQuestionRepository.merge).toHaveBeenCalledWith(questionMock, { question_text: 'Updated question text' });
    expect(mockQuestionRepository.save).toHaveBeenCalledWith(updatedQuestion);
    expect(result).toMatchObject({ id: questionMock.id, question_text: 'Updated question text' });
  });

  it('should throw QuestionNotFoundException when updating missing/soft-deleted question', async () => {
    mockQuestionRepository.findOne.mockResolvedValue(null);

    await expect(service.update('question-uuid-1', { question_text: 'test' })).rejects.toThrow(QuestionNotFoundException);
  });

  it('should soft-delete question', async () => {
    mockQuestionRepository.findOne.mockResolvedValue(questionMock);
    mockQuestionRepository.softDelete.mockResolvedValue({ affected: 1 });

    const result = await service.delete('question-uuid-1');

    expect(mockQuestionRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'question-uuid-1', deleted_at: IsNull() },
    });
    expect(mockQuestionRepository.softDelete).toHaveBeenCalledWith('question-uuid-1');
    expect(result).toEqual({
      message: 'Question deleted successfully',
      success: true,
    });
  });

  it('should throw QuestionNotFoundException when deleting missing/soft-deleted question', async () => {
    mockQuestionRepository.findOne.mockResolvedValue(null);

    await expect(service.delete('question-uuid-1')).rejects.toThrow(QuestionNotFoundException);
  });
});
