import { Injectable } from "@nestjs/common";
import { ExportFile, ExportResultRow, ResultExporter } from "./interfaces/result-exporter.interface";
import { Parser } from 'json2csv';
import { generateExportFilename } from "../utils/export.util";

@Injectable()
export class CSVExporter implements ResultExporter {
    async export(results: ExportResultRow[]): Promise<ExportFile> {
        const csvLines: string[] = [];
        const totalResults = results.length;
        const avgPercentage =
            totalResults > 0
            ? Math.round(
                results.reduce(
                (sum, result) => sum + Number(result.percentage),
                0,
                ) / totalResults,
            )
            : 0;

        csvLines.push('# PLSP Learning Style Assessment Report');
        csvLines.push(`# Generated: ${new Date().toLocaleString('en-GB')}`);
        csvLines.push(`# Total Results: ${totalResults}`);
        csvLines.push(`# Average Percentage: ${avgPercentage}%`);
        csvLines.push('');
        
        
        const parser = new Parser({
            fields: [

                { label: 'Questionnaire Title', value: 'questionnaireTitle' },
                { label: 'Submission ID', value: 'submissionId' },
                { label: 'Anonymous Session ID', value: 'anonymousSessionId' },
                { label: 'Submitted Date', value: 'submittedAt' },
                { label: 'Category', value: 'categoryName' },
                { label: 'Raw Total Score', value: 'rawTotalScore' },
                { label: 'Percentage', value: 'percentage' },
                { label: 'Classification', value: 'classification' },
                { label: 'Calculated Date', value: 'calculatedAt' },

                ],
        });

        csvLines.push(parser.parse(results));

        return {
            file: Buffer.from(csvLines.join('\n'), 'utf-8'),
            fileName: generateExportFilename('plsp-report', 'csv'),
            mimeType: 'text/csv',
        };
    }

}