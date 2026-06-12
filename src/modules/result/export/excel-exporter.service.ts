import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';

import {
  ExportFile,
  ExportResultRow,
  ResultExporter,
} from './interfaces/result-exporter.interface';

import { generateExportFilename } from '../utils/export.util';
import { buildExportSummary } from '../utils/export-summary.util';


@Injectable()
export class ExcelResultExporterService implements ResultExporter{
    async export(
        rows: ExportResultRow[],
        ): Promise<ExportFile> {

        const workbook = new ExcelJS.Workbook();

        const summary = buildExportSummary(rows);

        const summarySheet =
        workbook.addWorksheet('Summary');

        const dataSheet =
        workbook.addWorksheet('Detailed Data');

        //Summary Sheet
        summarySheet.addRow(['PLSP Learning Style Assessment Report']);
        summarySheet.addRow(['Generated:', new Date().toLocaleString('en-GB')]);
        summarySheet.addRow([]);
        summarySheet.addRow(['Summary Statistics']);
        summarySheet.addRow(['Total Results', summary.totalResults]);
        summarySheet.addRow(['Average Percentage', `${summary.avgPercentage}%`]);
        summarySheet.addRow([]);
        summarySheet.addRow(['Classification Distribution']);
        summarySheet.addRow(['Classification', 'Count', 'Percentage']);
        Object.entries(summary.classificationCounts).forEach(([classification, count]) => {
        const percentage =
            summary.totalResults > 0
            ? `${((count / summary.totalResults) * 100).toFixed(2)}%`
            : '0%';
        summarySheet.addRow([classification, count, percentage]);
        });
        summarySheet.columns = [
        { width: 35 },
        { width: 18 },
        { width: 18 },
        ];
        summarySheet.getRow(1).font = { bold: true, size: 16 };
        summarySheet.getRow(4).font = { bold: true };
        summarySheet.getRow(8).font = { bold: true };
        summarySheet.getRow(9).font = { bold: true };

        //Details Data Sheet
        dataSheet.columns = [
        { header: 'Questionnaire Title', key: 'questionnaireTitle', width: 35 },
        { header: 'Submission ID', key: 'submissionId', width: 38 },
        { header: 'Anonymous Session ID', key: 'anonymousSessionId', width: 38 },
        { header: 'Submitted Date', key: 'submittedAt', width: 22 },
        { header: 'Category', key: 'categoryName', width: 20 },
        { header: 'Raw Total Score', key: 'rawTotalScore', width: 16 },
        { header: 'Percentage', key: 'percentage', width: 14 },
        { header: 'Classification', key: 'classification', width: 18 },
        { header: 'Classification Rule', key: 'classificationRule', width: 24 },
        { header: 'Calculated Date', key: 'calculatedAt', width: 22 },
        ];

        rows.forEach((row) => {
        dataSheet.addRow({
            questionnaireTitle: row.questionnaireTitle,
            submissionId: row.submissionId,
            anonymousSessionId: row.anonymousSessionId,
            submittedAt: new Date(row.submittedAt).toLocaleString('en-GB'),
            categoryName: row.categoryName,
            rawTotalScore: row.rawTotalScore,
            percentage: row.percentage,
            classification: row.classification,
            calculatedAt: new Date(row.calculatedAt).toLocaleDateString('en-GB'),
            });
        });
        dataSheet.getRow(1).font = { bold: true };
        dataSheet.getRow(1).alignment = { horizontal: 'center' };

        const buffer = await workbook.xlsx.writeBuffer();

        return {
            file: Buffer.from(buffer),
            fileName: generateExportFilename('plsp-report','xlsx'),
            mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
    }
}