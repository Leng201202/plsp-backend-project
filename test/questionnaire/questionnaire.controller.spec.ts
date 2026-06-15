import { Test, TestingModule } from '@nestjs/testing';
import { QuestionnaireController } from '../../src/modules/questionnaire/questionnaire.controller';
import { QuestionnaireService } from '../../src/modules/questionnaire/questionnaire.service';

describe('QuestionnaireController', () => {
  let controller: QuestionnaireController;

  const mockQuestionnaireService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionnaireController],
      providers: [
        {
          provide: QuestionnaireService,
          useValue: mockQuestionnaireService,
        },
      ],
    }).compile();

    controller = module.get<QuestionnaireController>(QuestionnaireController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create questionnaire', async () => {
    const dto: any = { title: 'Assessment', status_id: 'status-1' };
    mockQuestionnaireService.create.mockResolvedValue(dto);

    expect(await controller.create(dto)).toEqual(dto);
    expect(mockQuestionnaireService.create).toHaveBeenCalledWith(dto, 1);
  });

  it('should find all questionnaires', async () => {
    mockQuestionnaireService.findAll.mockResolvedValue([]);

    expect(await controller.findAll()).toEqual([]);
    expect(mockQuestionnaireService.findAll).toHaveBeenCalled();
  });

  it('should find one questionnaire', async () => {
    const questionnaire = { id: 'uuid-1', title: 'Assessment' };
    mockQuestionnaireService.findOne.mockResolvedValue(questionnaire);

    expect(await controller.findOne('uuid-1')).toEqual(questionnaire);
    expect(mockQuestionnaireService.findOne).toHaveBeenCalledWith('uuid-1');
  });

  it('should update questionnaire', async () => {
    const dto: any = { title: 'Updated' };
    const questionnaire = { id: 'uuid-1', title: 'Updated' };
    mockQuestionnaireService.update.mockResolvedValue(questionnaire);

    expect(await controller.update('uuid-1', dto)).toEqual(questionnaire);
    expect(mockQuestionnaireService.update).toHaveBeenCalledWith('uuid-1', dto, 1);
  });

  it('should remove questionnaire', async () => {
    const response = {
      success: true,
      message: 'Questionnaire deleted successfully',
    };
    mockQuestionnaireService.delete.mockResolvedValue(response);

    expect(await controller.delete('uuid-1')).toEqual(response);
    expect(mockQuestionnaireService.delete).toHaveBeenCalledWith('uuid-1', 1);
  });
});
