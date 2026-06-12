import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import {
  ExportFile,
  ExportResultRow,
  ResultExporter,
} from './interfaces/result-exporter.interface';
import { generateExportFilename } from '../utils/export.util';
import { buildExportSummary } from '../utils/export-summary.util';
import { ChartGeneratorService } from './chart-generator.service';

@Injectable()
export class PdfResultExporterService implements ResultExporter {

    constructor(private readonly chartGeneratorService: ChartGeneratorService) {}

    async export(rows: ExportResultRow[]): Promise<ExportFile> {
        const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 14,
        bufferPages: true,
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));

        const done = new Promise<Buffer>((resolve) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        });

        const summary = buildExportSummary(rows);

        this.drawHeader(doc);
        this.drawSummary(doc, summary);
        const pieChart = await this.chartGeneratorService.generatePieChart(summary.classificationChartData);
        const barChart = await this.chartGeneratorService.generateBarChart(summary.categoryChartData);
        doc.fontSize(11)
            .fillColor('#2c3e50')
            .text('Classification Distribution', 250, 70);
        doc.image(pieChart, 250, 85,{
            width:180,
        });
        doc.fontSize(11)
            .fillColor('#2c3e50')
            .text('Category Distribution', 470, 70);
        doc.image(barChart, 470, 85,{
            width:180,
        });
        this.drawTable(doc, rows, 320);
        this.addFooter(doc);

        doc.end();

        const file = await done;

        return {
        file,
        fileName: generateExportFilename('plsp-report', 'pdf'),
        mimeType: 'application/pdf',
        };
    }

    private drawHeader(doc: PDFKit.PDFDocument) {
        doc
        .fontSize(20)
        .fillColor('#2c3e50')
        .text('PLSP Learning Style Assessment Report', 35, 30);

        doc
        .fontSize(10)
        .fillColor('#666666')
        .text(`Generated: ${new Date().toLocaleString('en-GB')}`, 35, 58);
    }

    private drawSummary(doc: PDFKit.PDFDocument, summary: ReturnType<typeof buildExportSummary>) {
        doc
        .roundedRect(35, 80, 220, 45, 6)
        .fill('#f0f8ff');

        doc
        .fillColor('#2c3e50')
        .fontSize(12)
        .text(`Total Results: ${summary.totalResults}`, 50, 95)
        .text(`Average Percentage: ${summary.avgPercentage}%`, 50, 112);
    }

    private drawClassificationSummary(
        doc: PDFKit.PDFDocument,
        data: { label: string; value: number }[],
    ) {
        let y = 150;

        doc.fontSize(12).fillColor('#2c3e50').text('Classification Distribution', 35, y);

        y += 20;

        data.forEach((item) => {
        doc.fontSize(10).fillColor('#333333').text(`${item.label}: ${item.value}`, 45, y);
        y += 15;
        });
    }

    private drawCategorySummary(
        doc: PDFKit.PDFDocument,
        data: { label: string; value: number }[],
    ) {
        let y = 150;
        const x = 300;

        doc.fontSize(12).fillColor('#2c3e50').text('Category Distribution', x, y);

        y += 20;

        data.forEach((item) => {
        doc.fontSize(10).fillColor('#333333').text(`${item.label}: ${item.value}`, x + 10, y);
        y += 15;
        });
    }

    private drawTable(
        doc: PDFKit.PDFDocument,
        rows: ExportResultRow[],
        startY = 270,
        ) {
        let y = startY;

        doc.fontSize(12).fillColor('#2c3e50').text('Detailed Results', 14, y);
        y += 25;

        const headers = [
            'Questionnaire',
            'Submission ID',
            'Session ID',
            'Submitted',
            'Category',
            'Raw Score',
            'Percentage',
            'Classification',
            'Calculated',
        ];

        const widths =  [130, 100, 100, 95, 90, 60, 70, 95, 80];
        const xStart = 14;
        const rowHeight = 42;
        const headerHeight = 32;
        const footerLimit = 545;

        const drawHeader = () => {
            let x = xStart;

            headers.forEach((header, index) => {
            doc.rect(x, y, widths[index], headerHeight).fill('#3498db');
            doc
                .fillColor('#ffffff')
                .fontSize(8)
                .text(header, x + 4, y + 8, {
                width: widths[index] - 8,
                });
            x += widths[index];
            });

            y += headerHeight;
        };

        drawHeader();

        rows.forEach((row, rowIndex) => {
            if (y + rowHeight > footerLimit) {
            doc.addPage();
            y = 25;
            drawHeader();
            }

            let x = xStart;
            const bg = rowIndex % 2 === 0 ? '#f3f4f6' : '#ffffff';

            const values = [
            row.questionnaireTitle,
            row.submissionId.slice(0, 12) + '...',
            row.anonymousSessionId.slice(0, 12) + '...',
            new Date(row.submittedAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }),
            row.categoryName,
            String(row.rawTotalScore),
            `${row.percentage}%`,
            row.classification,
            new Date(row.calculatedAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }),
            ];

            values.forEach((value, index) => {
            doc.rect(x, y, widths[index], rowHeight).fill(bg);
            doc
                .fillColor('#333333')
                .fontSize(7)
                .text(value, x + 4, y + 8, {
                width: widths[index] - 8,
                height: rowHeight - 8,
                });

            x += widths[index];
            });

            y += rowHeight;
        });
    }

    private addFooter(doc: PDFKit.PDFDocument) {
        const pages = doc.bufferedPageRange();

        for (let i = pages.start; i < pages.start + pages.count; i++) {
            doc.switchToPage(i);

            doc
            .fontSize(8)
            .fillColor('gray')
            .text(`Page ${i - pages.start + 1} of ${pages.count}`, 14, 570);

            doc
            .fontSize(8)
            .fillColor('gray')
            .text('PLSP Report System', 720, 570);
        }
    }
}