import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ManagedWindow } from 'client/app/services/window-manager.service';
import io, { Socket } from "socket.io-client";
import { WindowTemplateComponent } from 'client/app/components/window-template/window-template.component';
import { ConfigurationService } from 'client/app/services/configuration.service';

import si from 'systeminformation';
import { TabulatorComponent } from '../../components/tabulator/tabulator.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
    selector: "window-system-monitor",
    templateUrl: './system-monitor.component.html',
    styleUrls: ['./system-monitor.component.scss'],
    imports: [
        WindowTemplateComponent,
        TabulatorComponent,
        MatTabsModule,
        MatIconModule,
        MatButtonModule
    ],
    standalone: true
})
export class SystemMonitorComponent implements OnInit, AfterViewInit {
    @Input("window") window: ManagedWindow;

    socket: Socket;

    staticData: si.Systeminformation.StaticData;
    _staticData: any;
    metricData: si.Systeminformation.DynamicData;
    _metricData: any;

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
            console.log("got static data", data);
            this.staticData = this._staticData = data;
        })

        socket.on("metrics", (data: si.Systeminformation.DynamicData) => {
            console.log("got dynamic data", data);
            this.metricData = this._metricData = data;
        })
    }

}
