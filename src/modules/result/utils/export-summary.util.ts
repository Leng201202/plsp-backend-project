import { ExportResultRow } from "../export/interfaces/result-exporter.interface";

export interface ChartDataItem{
  label: string;
  value: number;
}

export interface ExportSummary {
  totalResults: number;
  avgPercentage: number;
  classificationCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  classificationChartData: ChartDataItem[];
  categoryChartData: ChartDataItem[];
}

export function buildExportSummary(
  rows: ExportResultRow[],
): ExportSummary {
  const totalResults = rows.length;

  const avgPercentage =
    totalResults > 0
      ? Math.round(
          rows.reduce((sum, row) => sum + row.percentage, 0) /
            totalResults,
        )
      : 0;

  const classificationCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  rows.forEach((row) => {
    classificationCounts[row.classification] =
      (classificationCounts[row.classification] ?? 0) + 1;

    categoryCounts[row.categoryName] =
      (categoryCounts[row.categoryName] ?? 0) + 1;
  });

  return {
    totalResults,
    avgPercentage,
    classificationCounts,
    categoryCounts,
    classificationChartData: Object.entries(classificationCounts).map(([label, value]) => ({
      label,
      value,
    })),
    categoryChartData: Object.entries(categoryCounts).map(([label, value]) => ({
      label,
      value,
    })),
  };
}