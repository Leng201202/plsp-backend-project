import { Injectable, BadRequestException } from "@nestjs/common";
import { ResultExportFormat } from "../dto/result-export.dto";
import { CSVExporter } from "./csv-exporter.service";
import { ExcelResultExporterService } from "./excel-exporter.service";
import { ExportResultRow, ExportFile } from "./interfaces/result-exporter.interface";
import { PdfResultExporterService } from "./pdf-exporter.service";


@Injectable()
export class ResultExportService {
    constructor(
        private readonly csvExporter: CSVExporter,
        private readonly excelExporter: ExcelResultExporterService,
        private readonly pdfExporter: PdfResultExporterService,
    ) {}

    async export(
        format: ResultExportFormat,
        rows: ExportResultRow[],
    ): Promise<ExportFile> {
        switch (format) {
        case ResultExportFormat.CSV:
            return this.csvExporter.export(rows);

        case ResultExportFormat.EXCEL:
            return this.excelExporter.export(rows);

        case ResultExportFormat.PDF:
            return this.pdfExporter.export(rows);

        default:
            throw new BadRequestException(
            `Unsupported export format: ${format}`,
            );
        }
    }
}