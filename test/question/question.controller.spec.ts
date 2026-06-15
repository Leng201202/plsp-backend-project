import { Test, TestingModule } from '@nestjs/testing';
import { QuestionController } from '../../src/modules/question/question.controller';
import { QuestionService } from '../../src/modules/question/question.service';

describe('QuestionController', () => {
  let controller: QuestionController;

  const mockQuestionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionController],
      providers: [
        {
          provide: QuestionService,
          useValue: mockQuestionService,
        },
      ],
    }).compile();

    controller = module.get<QuestionController>(QuestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create question', async () => {
    const dto: any = {
      question_text: 'Text',
      questionnaire_id: 'q-1',
      category_id: 'cat-1',
    };
    mockQuestionService.create.mockResolvedValue(dto);

    expect(await controller.create(dto)).toEqual(dto);
    expect(mockQuestionService.create).toHaveBeenCalledWith(dto, 1);
  });

  it('should find all questions', async () => {
    mockQuestionService.findAll.mockResolvedValue([]);

    expect(await controller.findAll()).toEqual([]);
    expect(mockQuestionService.findAll).toHaveBeenCalled();
  });

  it('should find one question', async () => {
    const question = { id: 'uuid-1', question_text: 'Text' };
    mockQuestionService.findOne.mockResolvedValue(question);

    expect(await controller.findOne('uuid-1')).toEqual(question);
    expect(mockQuestionService.findOne).toHaveBeenCalledWith('uuid-1');
  });

  it('should update question', async () => {
    const dto: any = { question_text: 'Updated Text' };
    const question = { id: 'uuid-1', question_text: 'Updated Text' };
    mockQuestionService.update.mockResolvedValue(question);

    expect(await controller.update('uuid-1', dto)).toEqual(question);
    expect(mockQuestionService.update).toHaveBeenCalledWith('uuid-1', dto, 1);
  });

  it('should remove question', async () => {
    const response = {
      success: true,
      message: 'Question deleted successfully',
    };
    mockQuestionService.delete.mockResolvedValue(response);

    expect(await controller.remove('uuid-1')).toEqual(response);
    expect(mockQuestionService.delete).toHaveBeenCalledWith('uuid-1', 1);
  });
});
