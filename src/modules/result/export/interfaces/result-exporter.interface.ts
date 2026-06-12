
export type ExportFormat='csv'|'pdf'|'excel';

export interface ExportResultRow {
    questionnaireTitle: string;
    submissionId: string;
    anonymousSessionId: string;
    submittedAt: Date;
    categoryName: string;
    rawTotalScore: number;
    percentage: number;
    classification: string;
    calculatedAt: Date;
}
export interface ExportFile {
    file: Buffer;
    fileName: string;
    mimeType: string;
}

export interface ResultExporter {
    export(results: ExportResultRow[]):Promise<ExportFile>;
}