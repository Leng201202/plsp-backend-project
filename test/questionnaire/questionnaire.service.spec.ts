import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuestionnaireService } from '../../src/modules/questionnaire/questionnaire.service';
import { Questionnaire } from '../../src/modules/questionnaire/entity/questionnaire.entity';
import { QuestionnaireNotFoundException } from '../../src/common/exceptions/questionnaire.exception';
import { IsNull } from 'typeorm';

describe('QuestionnaireService', () => {
  let service: QuestionnaireService;

  const mockQuestionnaireRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    softDelete: jest.fn(),
  };

  const questionnaireMock = {
    id: 'questionnaire-uuid-1',
    title: 'Learning Style Assessment',
    description: 'Assess learning styles',
    status: { id: 'status-uuid-1', name: 'Open' },
    open_date: new Date(),
    close_date: new Date(),
    created_by: { id: 1 },
    updated_by: { id: 1 },
    deleted_at: null,
    deleted_by: null,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionnaireService,
        {
          provide: getRepositoryToken(Questionnaire),
          useValue: mockQuestionnaireRepository,
        },
        {
          provide: getRepositoryToken(require('../../src/modules/status/entity/status.entity').Status),
          useValue: {
            find: jest.fn().mockResolvedValue([
              { id: 'status-uuid-2', name: 'Draft' },
              { id: 'status-uuid-1', name: 'Open' },
              { id: 'status-uuid-3', name: 'Close' },
            ]),
          },
        },
        {
          provide: require('../../src/modules/audit-log/audit-helper.service').AuditHelper,
          useValue: {
            logSuccess: jest.fn(),
            logFailure: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<QuestionnaireService>(QuestionnaireService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create questionnaire', async () => {
    const dto = {
      title: 'Learning Style Assessment',
      description: 'Assess learning styles',
      status_id: 'status-uuid-1',
      open_date: questionnaireMock.open_date,
      close_date: questionnaireMock.close_date,
      created_by: 1,
      updated_by: 1,
    };

    mockQuestionnaireRepository.create.mockReturnValue(questionnaireMock);
    mockQuestionnaireRepository.save.mockResolvedValue(questionnaireMock);

    const result = await service.create(dto, 1);

    expect(mockQuestionnaireRepository.create).toHaveBeenCalledWith({
      title: dto.title,
      description: dto.description,
      status: { id: dto.status_id },
      open_date: dto.open_date,
      close_date: dto.close_date,
      created_by: { id: dto.created_by },
      updated_by: { id: dto.updated_by },
    });
    expect(mockQuestionnaireRepository.save).toHaveBeenCalledWith(
      questionnaireMock,
    );
    expect(result).toMatchObject({
      id: questionnaireMock.id,
      title: questionnaireMock.title,
    });
  });

  it('should find all questionnaires (excluding soft-deleted)', async () => {
    mockQuestionnaireRepository.find.mockResolvedValue([questionnaireMock]);

    const result = await service.findAll();

    expect(mockQuestionnaireRepository.find).toHaveBeenCalledWith({
      where: {
        deleted_at: IsNull(),
      },
      relations: {
        status: true,
        created_by: true,
        updated_by: true,
      },
      order: {
        created_at: 'DESC',
      },
    });
    expect(result).toMatchObject([{ id: questionnaireMock.id }]);
  });

  it('should find one questionnaire (excluding soft-deleted)', async () => {
    mockQuestionnaireRepository.findOne.mockResolvedValue(questionnaireMock);

    const result = await service.findOne('questionnaire-uuid-1');

    expect(mockQuestionnaireRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'questionnaire-uuid-1', deleted_at: IsNull() },
      relations: {
        status: true,
        created_by: true,
        updated_by: true,
      },
    });
    expect(result).toMatchObject({ id: questionnaireMock.id });
  });

  it('should throw QuestionnaireNotFoundException when questionnaire not found (or soft-deleted)', async () => {
    mockQuestionnaireRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('questionnaire-uuid-1')).rejects.toThrow(
      QuestionnaireNotFoundException,
    );
  });

  it('should update questionnaire', async () => {
    const dto = { title: 'Updated Questionnaire' };
    const updatedQuestionnaire = {
      ...questionnaireMock,
      title: 'Updated Questionnaire',
    };

    mockQuestionnaireRepository.findOne.mockResolvedValue(questionnaireMock);
    mockQuestionnaireRepository.merge.mockReturnValue(updatedQuestionnaire);
    mockQuestionnaireRepository.save.mockResolvedValue(updatedQuestionnaire);

    const result = await service.update('questionnaire-uuid-1', dto, 1);

    expect(mockQuestionnaireRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'questionnaire-uuid-1', deleted_at: IsNull() },
      relations: { status: true },
    });
    expect(mockQuestionnaireRepository.merge).toHaveBeenCalledWith(
      questionnaireMock,
      {
        title: 'Updated Questionnaire',
        updated_by: { id: 1 },
      },
    );
    expect(mockQuestionnaireRepository.save).toHaveBeenCalledWith(
      updatedQuestionnaire,
    );
    expect(result).toMatchObject({
      id: questionnaireMock.id,
      title: 'Updated Questionnaire',
    });
  });

  it('should throw QuestionnaireNotFoundException when updating missing/soft-deleted questionnaire', async () => {
    mockQuestionnaireRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update('questionnaire-uuid-1', { title: 'test' }, 1),
    ).rejects.toThrow(QuestionnaireNotFoundException);
  });

  it('should soft-delete questionnaire', async () => {
    mockQuestionnaireRepository.findOne.mockResolvedValue(questionnaireMock);
    mockQuestionnaireRepository.softDelete.mockResolvedValue({ affected: 1 });

    const result = await service.delete('questionnaire-uuid-1', 1);

    expect(mockQuestionnaireRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'questionnaire-uuid-1', deleted_at: IsNull() },
    });
    expect(mockQuestionnaireRepository.softDelete).toHaveBeenCalledWith(
      'questionnaire-uuid-1',
    );
    expect(result).toEqual({
      message: 'Questionnaire deleted successfully',
      success: true,
    });
  });

  it('should throw QuestionnaireNotFoundException when deleting missing/soft-deleted questionnaire', async () => {
    mockQuestionnaireRepository.findOne.mockResolvedValue(null);

    await expect(service.delete('questionnaire-uuid-1', 1)).rejects.toThrow(
      QuestionnaireNotFoundException,
    );
  });
});
