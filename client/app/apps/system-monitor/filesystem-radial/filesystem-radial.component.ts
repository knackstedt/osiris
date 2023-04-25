import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { EChartsOption, graphic, SeriesOption } from 'echarts';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';

import 'echarts/theme/dark-bold.js';
import { Fetch } from 'client/app/services/fetch.service';


@Component({
    selector: 'app-filesystem-radial',
    templateUrl: './filesystem-radial.component.html',
    styleUrls: ['./filesystem-radial.component.css'], 
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
export class FilesystemRadialComponent implements OnInit {

    @Input() cwd: string;

    chartOption: EChartsOption;
    chart: any;

    constructor(private fetch: Fetch) {
    }

    onChartInit(ec) {
        this.chart = ec;
    }

    async ngOnInit() {
        // const data = await this.fetch.get(`/api/filesystem/scandir?path=/home/knackstedt/`);
        // var data = [
        //     {
        //         name: 'Grandpa',
        //         children: [
        //             {
        //                 name: 'Uncle Leo',
        //                 value: 15,
        //                 children: [
        //                     {
        //                         name: 'Cousin Jack',
        //                         value: 2
        //                     },
        //                     {
        //                         name: 'Cousin Mary',
        //                         value: 5,
        //                         children: [
        //                             {
        //                                 name: 'Jackson',
        //                                 value: 2
        //                             }
        //                         ]
        //                     },
        //                     {
        //                         name: 'Cousin Ben',
        //                         value: 4
        //                     }
        //                 ]
        //             },
        //             {
        //                 name: 'Father',
        //                 value: 10,
        //                 children: [
        //                     {
        //                         name: 'Me',
        //                         value: 5
        //                     },
        //                     {
        //                         name: 'Brother Peter',
        //                         value: 1
        //                     }
        //                 ]
        //             }
        //         ]
        //     },
        //     {
        //         name: 'Nancy',
        //         children: [
        //             {
        //                 name: 'Uncle Nike',
        //                 children: [
        //                     {
        //                         name: 'Cousin Betty',
        //                         value: 1
        //                     },
        //                     {
        //                         name: 'Cousin Jenny',
        //                         value: 2
        //                     }
        //                 ]
        //             }
        //         ]
        //     }
        // ];
        const data = null;

        const graphData = [];
        this.chartOption = {
            series: {
                type: 'sunburst',
                data: data,
                radius: [60, '90%'],
                itemStyle: {
                    borderRadius: 7,
                    borderWidth: 2
                },
                label: {
                    show: false
                }
            } as any
        };
    }

}
