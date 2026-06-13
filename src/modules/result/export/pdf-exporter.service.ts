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
            margins: {
                top: 30,
                bottom: 20,
                left: 30,
                right: 30,
            },
            bufferPages: true,
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));

        const done = new Promise<Buffer>((resolve) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
        });

        const summary = buildExportSummary(rows);

        // Header & Metadata
        this.drawHeader(doc, summary);

        // Generate Charts
        const pieChart = await this.chartGeneratorService.generatePieChart(summary.classificationChartData);
        const barChart = await this.chartGeneratorService.generateBarChart(summary.categoryChartData);

        // Column 1: Summary Cards
        this.drawSummaryCards(doc, summary);

        // Column 2: Classification Chart
        doc.font('Helvetica-Bold')
            .fontSize(11)
            .fillColor('#1e293b')
            .text('Classification Distribution', 280, 85);
        doc.image(pieChart, 280, 102, {
            width: 230,
        });

        // Column 3: Category Chart
        doc.font('Helvetica-Bold')
            .fontSize(11)
            .fillColor('#1e293b')
            .text('Category Distribution', 550, 85);
        doc.image(barChart, 550, 102, {
            width: 250,
        });

        // Detailed Table
        this.drawTable(doc, rows, 290);

        // Page Footer
        this.addFooter(doc);

        doc.end();

        const file = await done;

        return {
            file,
            fileName: generateExportFilename('plsp-report', 'pdf'),
            mimeType: 'application/pdf',
        };
    }

    private drawHeader(doc: PDFKit.PDFDocument, summary: ReturnType<typeof buildExportSummary>) {
        doc.font('Helvetica-Bold')
            .fontSize(20)
            .fillColor('#1e293b')
            .text('PLSP Learning Style Assessment Report', 30, 25);

        const dateStr = new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        doc.font('Helvetica')
            .fontSize(9)
            .fillColor('#64748b')
            .text(`Generated: ${dateStr}   |   Total Results: ${summary.totalResults}   |   Average Percentage: ${summary.avgPercentage}%`, 30, 52);

        // Double accent bar divider
        doc.rect(30, 68, 780, 3).fill('#3b82f6');
        doc.rect(30, 71, 780, 1).fill('#93c5fd');
    }

    private drawSummaryCards(doc: PDFKit.PDFDocument, summary: ReturnType<typeof buildExportSummary>) {
        // Card 1: Total assessments
        doc.roundedRect(30, 85, 230, 44, 4).fill('#f8fafc');
        doc.rect(30, 85, 4, 44).fill('#3b82f6');
        doc.font('Helvetica-Bold')
            .fontSize(8)
            .fillColor('#475569')
            .text('TOTAL ASSESSMENTS', 42, 94);
        doc.font('Helvetica-Bold')
            .fontSize(16)
            .fillColor('#1e293b')
            .text(String(summary.totalResults), 42, 107);

        // Card 2: Average Score
        doc.roundedRect(30, 143, 230, 44, 4).fill('#f8fafc');
        doc.rect(30, 143, 4, 44).fill('#10b981');
        doc.font('Helvetica-Bold')
            .fontSize(8)
            .fillColor('#475569')
            .text('AVERAGE SCORE', 42, 152);
        doc.font('Helvetica-Bold')
            .fontSize(16)
            .fillColor('#1e293b')
            .text(`${summary.avgPercentage}%`, 42, 165);

        // Card 3: Dominant style
        let topClassification = 'N/A';
        let maxClassCount = 0;
        Object.entries(summary.classificationCounts).forEach(([cls, count]) => {
            if (count > maxClassCount) {
                maxClassCount = count;
                topClassification = cls;
            }
        });

        doc.roundedRect(30, 201, 230, 44, 4).fill('#f8fafc');
        doc.rect(30, 201, 4, 44).fill('#8b5cf6');
        doc.font('Helvetica-Bold')
            .fontSize(8)
            .fillColor('#475569')
            .text('DOMINANT LEARNING STYLE', 42, 210);
        doc.font('Helvetica-Bold')
            .fontSize(11)
            .fillColor('#1e293b')
            .text(topClassification, 42, 223, {
                width: 210,
                height: 16,
                ellipsis: true,
            });
    }

    private drawTable(
        doc: PDFKit.PDFDocument,
        rows: ExportResultRow[],
        startY = 290,
    ) {
        let y = startY;

        doc.font('Helvetica-Bold')
            .fontSize(12)
            .fillColor('#1e293b')
            .text('Detailed Results', 30, y);
        y += 20;

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

        const widths = [140, 80, 80, 100, 90, 60, 60, 90, 80];
        const alignments = ['left', 'left', 'left', 'left', 'left', 'right', 'right', 'left', 'left'];
        const xStart = 30;
        const rowHeight = 26;
        const headerHeight = 26;
        const footerLimit = 530;

        const drawHeader = (currentY: number) => {
            let x = xStart;

            // Header Background
            doc.rect(xStart, currentY, 780, headerHeight).fill('#1e293b');

            headers.forEach((header, index) => {
                doc.fillColor('#ffffff')
                    .font('Helvetica-Bold')
                    .fontSize(8);

                const textX = x + 6;
                const textY = currentY + 9;
                const textWidth = widths[index] - 12;

                doc.text(header, textX, textY, {
                    width: textWidth,
                    align: alignments[index] as any,
                });
                x += widths[index];
            });

            return currentY + headerHeight;
        };

        y = drawHeader(y);

        rows.forEach((row, rowIndex) => {
            if (y + rowHeight > footerLimit) {
                doc.addPage();
                y = 40;
                y = drawHeader(y);
            }

            let x = xStart;
            const bg = rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc';

            // Row background
            doc.rect(xStart, y, 780, rowHeight).fill(bg);

            // Thin border bottom
            doc.rect(xStart, y + rowHeight - 1, 780, 1).fill('#e2e8f0');

            const values = [
                row.questionnaireTitle,
                row.submissionId.slice(0, 8) + '...',
                row.anonymousSessionId.slice(0, 8) + '...',
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
                doc.fillColor('#334155')
                    .font('Helvetica')
                    .fontSize(7.5);

                const textX = x + 6;
                const textY = y + 9;
                const textWidth = widths[index] - 12;

                doc.text(value, textX, textY, {
                    width: textWidth,
                    height: rowHeight - 10,
                    align: alignments[index] as any,
                    ellipsis: true,
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

            // Save and temporarily zero out bottom margin to prevent auto page breaks
            const oldBottomMargin = doc.page.margins.bottom;
            doc.page.margins.bottom = 0;

            // Thin line separating footer
            doc.rect(30, 555, 780, 1).fill('#e2e8f0');

            doc.font('Helvetica')
                .fontSize(8)
                .fillColor('#94a3b8')
                .text(`Page ${i - pages.start + 1} of ${pages.count}`, 30, 565);

            doc.font('Helvetica')
                .fontSize(8)
                .fillColor('#94a3b8')
                .text('PLSP Learning Style Assessment Report', 610, 565, {
                    width: 200,
                    align: 'right',
                });

            // Restore bottom margin
            doc.page.margins.bottom = oldBottomMargin;
        }
    }
}