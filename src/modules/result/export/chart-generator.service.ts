import { Injectable } from '@nestjs/common';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

@Injectable()
export class ChartGeneratorService {
    private readonly width = 600;
    private readonly height = 400;

    async generatePieChart(
        data: { label: string; value: number }[],
    ): Promise<Buffer> {
        const chart = new ChartJSNodeCanvas({
            width: this.width,
            height: this.height,
            backgroundColour: 'white',
        });

        const palette = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#14b8a6', '#0ea5e9'];
        const backgroundColors = data.map((_, i) => palette[i % palette.length]);

        return chart.renderToBuffer({
            type: 'pie',
            data: {
                labels: data.map((d) => d.label),
                datasets: [
                    {
                        data: data.map((d) => d.value),
                        backgroundColor: backgroundColors,
                        borderWidth: 1.5,
                        borderColor: '#ffffff',
                    },
                ],
            },
            options: {
                responsive: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            font: {
                                family: 'Helvetica Neue',
                                size: 12,
                            },
                            boxWidth: 12,
                            padding: 15,
                        },
                    },
                },
            },
        } as any);
    }

    async generateBarChart(
        data: { label: string; value: number }[],
    ): Promise<Buffer> {
        const chart = new ChartJSNodeCanvas({
            width: 800,
            height: 500,
            backgroundColour: 'white',
        });

        return chart.renderToBuffer({
            type: 'bar',
            data: {
                labels: data.map((d) => d.label),
                datasets: [
                    {
                        label: 'Count',
                        data: data.map((d) => d.value),
                        backgroundColor: '#4f46e5',
                        borderRadius: 4,
                        borderWidth: 0,
                        barThickness: 24,
                    },
                ],
            },
            options: {
                responsive: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            font: {
                                family: 'Helvetica Neue',
                                size: 10,
                            },
                            stepSize: 1,
                        },
                    },
                    y: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            font: {
                                family: 'Helvetica Neue',
                                size: 10,
                            },
                        },
                    },
                },
            },
        } as any);
    }
}