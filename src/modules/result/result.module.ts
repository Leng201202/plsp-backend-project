import { Module } from '@nestjs/common';
import { Result } from './entity/result.entity';
import { Submission } from '../submission/entity/submission.entity';
import { ClassificationRule } from '../classification/entity/classification-rule.entity';
import { Answer } from '../submission/entity/answer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultService } from './result.service';
import { ResultController } from './result.controller';
import { ResultExportService } from './export/result-export.service';
import { CSVExporter } from './export/csv-exporter.service';
import { ExcelResultExporterService } from './export/excel-exporter.service';
import { PdfResultExporterService } from './export/pdf-exporter.service';
import { ChartGeneratorService } from './export/chart-generator.service';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Result,
            Submission,
            Answer,
            ClassificationRule,
        ]),
        AuditLogModule,
    ],
    controllers: [ResultController],
    providers: [
        ResultService,
        ResultExportService,
        CSVExporter,
        ExcelResultExporterService,
        PdfResultExporterService,
        ChartGeneratorService,
    ],
    exports: [ResultService],
})
export class ResultModule {}
