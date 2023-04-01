import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, ViewEncapsulation, ViewChildren } from '@angular/core';
import { ManagedWindow } from 'client/app/services/window-manager.service';
import io, { Socket } from "socket.io-client";
import { WindowTemplateComponent } from 'client/app/components/window-template/window-template.component';
import { ConfigurationService } from 'client/app/services/configuration.service';

import si from 'systeminformation';
import { TabulatorComponent } from '../../components/tabulator/tabulator.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LiveGraphComponent } from './live-graph/live-graph.component';
import { NgxLazyLoaderComponent } from '@dotglitch/ngx-lazy-loader';
import { CellComponent } from 'tabulator-tables';
import { CommonModule } from '@angular/common';

export function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const CpuColors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

const data_interval = 250;
const timeframe = 60 * 1000;
const items = timeframe / data_interval;
const initialArray = new Array(items+1);

const timeAxis = new Array(items);
for (let i = items-1; i >= 0; i--) {
    timeAxis[i] = Math.floor(i) + " seconds";
}
console.log(timeAxis, items, initialArray)

@Component({
    selector: "window-system-monitor",
    templateUrl: './system-monitor.component.html',
    styleUrls: ['./system-monitor.component.scss'],
    imports: [
        CommonModule,
        WindowTemplateComponent,
        TabulatorComponent,
        MatTabsModule,
        MatIconModule,
        MatButtonModule,
        LiveGraphComponent,
        NgxLazyLoaderComponent
    ],
    standalone: true
})
export class SystemMonitorComponent implements OnInit, AfterViewInit {
    @Input("window") window: ManagedWindow;

    @ViewChild('cpuGraph') cpuGraph: LiveGraphComponent;
    @ViewChild('memGraph') memGraph: LiveGraphComponent;
    @ViewChild('networkGraph') networkGraph: LiveGraphComponent;

    socket: Socket;

    staticData: si.Systeminformation.StaticData;
    _staticData: any;
    metricData: si.Systeminformation.DynamicData;
    _metricData: any;

    cpuData = [];
    networkData = [];
    memoryData = [{
        label: "Memory",
        color: "#ab1852",
        data: [...initialArray],
        tooltip: { valueFormatter: formatBytes }
    },
    {
        label: "Swap",
        color: "#49a835",
        data: [...initialArray],
        tooltip: { valueFormatter: formatBytes }
    }];

    readonly xaxis = timeAxis;

    constructor(private config: ConfigurationService) { }

    ngOnInit(): void {
    }

    ngOnDestroy() {
        this.socket.close();
    }

    byteFormatter(cell: CellComponent) {
        return formatBytes(cell.getValue());
    }
    byteFormatterBare(value) {
        return formatBytes(value);
    }
    cpuFormatter(cell: CellComponent) {
        return cell.getValue().toFixed(2);
    }

    ngAfterViewInit(): void {
        const socket = this.socket = io({path: "/ws/metrics.io"});

        // The pty on the remote died
        socket.on("terminate", code => {
            console.log("Pty was killed", code);
        });

        socket.on("static", (data: si.Systeminformation.StaticData) => {
            this.staticData = this._staticData = data;
            this.cpuData = new Array(data.cpu.cores);
        })

        socket.on("metrics", (data: si.Systeminformation.DynamicData) => {
            this.metricData = this._metricData = data;
        })

        socket.on("cpumetrics", (data) => this.parseCpuData(data));
        socket.on("memmetrics", (data) => this.parseMemoryData(data));
        socket.on("networkmetrics", (data) => this.parseNetworkData(data));
    }

    parseCpuData(cpuData) {
        const cpus: si.Systeminformation.CurrentLoadCpuData[] = cpuData.cpus;
        cpus.forEach((c, i) => {
            if (!this.cpuData[i]) {
                this.cpuData[i] = {
                    label: i,
                    color: CpuColors[i],
                    tooltip: { valueFormatter: value => value?.toFixed(2) + '%'},
                    data: [...initialArray],
                };
            }
            this.cpuData[i].data.push(c.load);

            // remove extra data points
            if (this.cpuData[i].data.length >= items)
                this.cpuData[i].data.splice(0, 1);
        });
        this.cpuGraph?.refresh();
    }

    parseNetworkData(networkData: si.Systeminformation.NetworkStatsData[]) {
        const interfaces = networkData;
        interfaces.forEach((c, index) => {
            const i = index*2;
            if (!this.networkData[i]) {
                this.networkData[i] = {
                    label: c.iface + "_up",
                    color: "#ee1d00",
                    tooltip: { valueFormatter: formatBytes },
                    data: [...initialArray],
                };
            }

            if (!this.networkData[i+1]) {
                this.networkData[i+1] = {
                    label: c.iface + "_down",
                    color: "#2d7db3",
                    tooltip: { valueFormatter: formatBytes },
                    data: [...initialArray],
                };
            }

            // TODO: this logic may very well be flawed
            // Most probably, as Inf is returned decently frequently.
            const tx = Math.round(c.tx_bytes / c.tx_sec * data_interval / 1000);
            const rx = Math.round(c.rx_bytes / c.rx_sec * data_interval / 1000);

            this.networkData[i].data.push(!Number.isFinite(tx) ? null : Number.isNaN(tx) ? null : tx);
            this.networkData[i+1].data.push(!Number.isFinite(rx) ? null : Number.isNaN(rx) ? null : rx);

            // remove extra data points
            if (this.networkData[i].data.length >= items)
                this.networkData[i].data.splice(0, 1);
            if (this.networkData[i+1].data.length >= items)
                this.networkData[i+1].data.splice(0, 1);
        });

        this.networkGraph?.refresh();
    }

    parseMemoryData(mem: si.Systeminformation.MemData) {
        this.memoryData[0].data.push(mem.used);
        this.memoryData[1].data.push(mem.swapused);

        // remove extra data points
        if (this.memoryData[0].data.length >= items)
            this.memoryData[0].data.splice(0, 1);
        if (this.memoryData[1].data.length >= items)
            this.memoryData[1].data.splice(0, 1);

        this.memGraph?.refresh();
    }
}
