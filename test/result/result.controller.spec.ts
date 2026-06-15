import { Test, TestingModule } from '@nestjs/testing';
import { ResultController } from '../../src/modules/result/result.controller';
import { ResultService } from '../../src/modules/result/result.service';

describe('ResultController', () => {
  let controller: ResultController;

  const mockResultService = {
    search: jest.fn(),
    deleteMany: jest.fn(),
    exportResult: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResultController],
      providers: [
        {
          provide: ResultService,
          useValue: mockResultService,
        },
      ],
    }).compile();

    controller = module.get<ResultController>(ResultController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should search results', async () => {
      const dto = {
        pagination: {
          page: 1,
          limit: 10,
        },
      };

      const response = {
        success: true,
        total: 1,
        page: 1,
        limit: 10,
        data: [],
      };

      mockResultService.search.mockResolvedValue(response);

      const result = await controller.search(dto as any);

      expect(mockResultService.search)
        .toHaveBeenCalledWith(dto);

      expect(result).toEqual(response);
    });
  });

  describe('deleteMany', () => {
    it('should delete selected results', async () => {
      const dto = {
        mode: 'selected',
        resultIds: [
          'result-1',
          'result-2',
        ],
      };

      const response = {
        success: true,
        deletedCount: 2,
      };

      mockResultService.deleteMany.mockResolvedValue(
        response,
      );

      const result = await controller.deleteMany(
        dto as any,
      );

      expect(mockResultService.deleteMany)
        .toHaveBeenCalledWith(dto);

      expect(result).toEqual(response);
    });
  });

  describe('exportResult', () => {
    it('should export csv file', async () => {
      const dto = {
        mode: 'filter',
        format: 'csv',
      };

      const file = {
        file: Buffer.from('csv-data'),
        fileName: 'report.csv',
        mimeType: 'text/csv',
      };

      mockResultService.exportResult.mockResolvedValue(
        file,
      );

      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      await controller.exportResult(
        dto as any,
        res as any,
      );

      expect(mockResultService.exportResult)
        .toHaveBeenCalledWith(dto);

      expect(res.setHeader)
        .toHaveBeenCalledWith(
          'Content-Type',
          'text/csv',
        );

      expect(res.setHeader)
        .toHaveBeenCalledWith(
          'Content-Disposition',
          'attachment; filename="report.csv"',
        );

      expect(res.send)
        .toHaveBeenCalledWith(file.file);
    });

    it('should export excel file', async () => {
      const dto = {
        mode: 'filter',
        format: 'excel',
      };

      const file = {
        file: Buffer.from('excel-data'),
        fileName: 'report.xlsx',
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };

      mockResultService.exportResult.mockResolvedValue(
        file,
      );

      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      await controller.exportResult(
        dto as any,
        res as any,
      );

      expect(res.send)
        .toHaveBeenCalledWith(file.file);
    });

    it('should export pdf file', async () => {
      const dto = {
        mode: 'filter',
        format: 'pdf',
      };

      const file = {
        file: Buffer.from('pdf-data'),
        fileName: 'report.pdf',
        mimeType: 'application/pdf',
      };

      mockResultService.exportResult.mockResolvedValue(
        file,
      );

      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      await controller.exportResult(
        dto as any,
        res as any,
      );

      expect(res.send)
        .toHaveBeenCalledWith(file.file);
    });
  });
});