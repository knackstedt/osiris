import { Component, ComponentRef, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
// Observables
import { Fetch } from 'client/app/services/fetch.service';

import { ThemeLoaderService } from 'client/app/services/themeloader.service';
import { WindowManagerService } from './services/window-manager.service';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'client/environments/environment';


@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RootComponent implements OnInit {
    environment = environment;

    constructor(
        private fetch: Fetch,
        private themeLoader: ThemeLoaderService,
        public dialog: MatDialog,
        public windowManager: WindowManagerService
    ) {

        this.windowManager.OpenWindow({
            title: "My special App",
            description: "My Application V1.0",
            appId: "file-manager",
            x: 100,
            y: 100,
            width: 800,
            height: 600,

            // This is an arbitrary data object that gets loaded into the app
            data: {
                basePath: "/home/knackstedt/Downloads",
                showHidden: false,
                search: ""
            }
        });
        this.windowManager.OpenWindow({
            title: "My special App -1",
            x: 600,
            y: 300
        });
    }

    ngOnInit() {
        
    }

    titleOverride = "";
    subtitleOverride = "";
    @HostListener('window:message', ['$event'])
    private onMessage(event) {
        const message = event.data;
        switch (message.action) {
            case "setTitle":
                this.titleOverride = message.title;
                break;
            case "setSubtitle":
                this.subtitleOverride = message.subtitle;
                break;
        }
    }

}
