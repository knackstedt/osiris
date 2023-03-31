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
import { initialArray, timeAxis } from 'client/app/apps/system-monitor/data';


@Component({
    selector: "window-system-monitor",
    templateUrl: './system-monitor.component.html',
    styleUrls: ['./system-monitor.component.scss'],
    imports: [
        WindowTemplateComponent,
        TabulatorComponent,
        MatTabsModule,
        MatIconModule,
        MatButtonModule,
        LiveGraphComponent
    ],
    standalone: true
})
export class SystemMonitorComponent implements OnInit, AfterViewInit {
    @Input("window") window: ManagedWindow;

    @ViewChildren(LiveGraphComponent) graphs: LiveGraphComponent[];

    socket: Socket;

    staticData: si.Systeminformation.StaticData;
    _staticData: any;
    metricData: si.Systeminformation.DynamicData;
    _metricData: any;

    cpuData = [];
    networkData = [];
    memoryData = [{
        label: "Memory",
        color: "#ff00ff",
        data: [...initialArray]
    },
    {
        label: "Swap",
        color: "#ff00ff",
        data: [...initialArray]
    }];

    readonly xaxis = timeAxis;

    constructor(private config: ConfigurationService) { }

    ngOnInit(): void {
    }

    ngOnDestroy() {
        this.socket.close();
    }

    ngAfterViewInit(): void {
        const socket = this.socket = io({path: "/ws/metrics.io"});

        // The pty on the remote died
        socket.on("terminate", code => {
            console.log("Pty was killed", code);
        });

        socket.on("static", (data: si.Systeminformation.StaticData) => {
            // console.log("got static data", data);
            this.staticData = this._staticData = data;
            this.cpuData = new Array(data.cpu.cores);
        })

        socket.on("metrics", (data: si.Systeminformation.DynamicData) => {
            console.log("got dynamic data", data);
            this.metricData = this._metricData = data;

            this.parseCpuData();
            this.parseNetworkData();
            this.parseMemoryData();

            this.graphs.forEach(g => g.refresh());
            // console.log(this.cpuData)
        })
    }

    parseCpuData() {
        const cpus = this.metricData.currentLoad.cpus;
        cpus.forEach((c, i) => {
            if (!this.cpuData[i]) {
                this.cpuData[i] = {
                    label: i,
                    color: "#ff00ff",
                    data: [...initialArray]
                };
            }
            this.cpuData[i].data.push(c.load);

            // remove extra data points
            if (this.cpuData[i].data.length >= 59)
                this.cpuData[i].data.splice(0, 1);

        });
    }

    parseNetworkData() {
        const interfaces = this.metricData.networkStats as any as si.Systeminformation.NetworkStatsData[];
        interfaces.forEach((c, index) => {
            const i = index*2;
            if (!this.networkData[i]) {
                this.networkData[i] = {
                    label: c.iface + "_up",
                    color: "#ff00ff",
                    data: [...initialArray]
                };
            }
            if (!this.networkData[i+1]) {
                this.networkData[i+1] = {
                    label: c.iface + "_down",
                    color: "#ff00ff",
                    data: [...initialArray]
                };
            }

            this.networkData[i].data.push(c.tx_bytes);
            this.networkData[i+1].data.push(c.rx_bytes);

            // remove extra data points
            if (this.networkData[i].data.length >= 59)
                this.networkData[i].data.splice(0, 1);
            if (this.networkData[i+1].data.length >= 59)
                this.networkData[i+1].data.splice(0, 1);
        });
    }

    parseMemoryData() {
        const mem = this.metricData.mem;
        this.memoryData[0].data.push(mem.used);
        this.memoryData[1].data.push(mem.swapused);

        // remove extra data points
        if (this.memoryData[0].data.length >= 59)
            this.memoryData[0].data.splice(0, 1);
        if (this.memoryData[1].data.length >= 59)
            this.memoryData[1].data.splice(0, 1);
    }
}
