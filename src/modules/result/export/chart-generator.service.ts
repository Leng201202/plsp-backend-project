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

        return chart.renderToBuffer({
        type: 'pie',
        data: {
            labels: data.map((d) => d.label),
            datasets: [
            {
                data: data.map((d) => d.value),
            },
            ],
        },
        });
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
            },
            ],
        },
        options: {
            indexAxis: 'y',
        },
        });
    }
}