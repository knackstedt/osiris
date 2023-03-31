import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { EChartsOption, graphic, SeriesOption } from 'echarts';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import si from 'systeminformation';

import 'echarts/theme/dark-bold.js';


let data = [];
let now = new Date();
let oneDay = 1000;
let value = Math.random() * 1000;
function randomData() {
    now = new Date(+now - oneDay);
    value = value + Math.random() * 21 - 10;
    return value;
    return {
        name: now.toString(),
        value: [
            now.toISOString(),
            Math.round(value)
        ]
    };
} 
for (var i = 0; i < 60; i++) {
    data.push(randomData());
}


@Component({
    selector: 'app-live-graph',
    templateUrl: './live-graph.component.html',
    styleUrls: ['./live-graph.component.scss'],
    imports: [
        NgxEchartsModule
    ],
    providers: [
        {
            provide: NGX_ECHARTS_CONFIG,
            useFactory: () => ({ echarts: () => import('echarts') })
        },
    ],
    standalone: true,
})
export class LiveGraphComponent {
    chart: any;

    @Input() dataSource: {
        label: string,
        color: string,
        data: number[]
    }[];
    @Input() xaxis: any[];
    @Input() yaxis: any = [{ type: "value" }];

    chartOption: EChartsOption;

    onChartInit(ec) {
        this.chart = ec;
    }

    ngOnInit() {
        const colors = this.dataSource.map(s => s.color);
        const labels = this.dataSource.map(s => s.label);

        const series = this.dataSource.map(s => {
            return {
                name: s.label,
                type: 'line',
                smooth: true,
                lineStyle: {
                    width: 1
                },
                showSymbol: false,
                data: s.data
            } as SeriesOption
        });

        this.chartOption = {
            color: colors,
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            legend: {
                data: labels
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
                    data: this.xaxis,
                    splitLine: {
                        show: false
                    }
                }
            ],
            yAxis: this.yaxis as any,
            series: series as any
        };
    }

    refresh() {
        const series = this.dataSource.map(s => {
            return {
                name: s.label,
                type: 'line',
                smooth: true,
                lineStyle: {
                    width: 1
                },
                showSymbol: false,
                data: s.data
            };
        });
        this.chart.setOption({ series, animation: false });
    }
}
