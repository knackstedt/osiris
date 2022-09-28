import { Component, ComponentRef, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
// Observables
import { Fetch } from 'client/app/services/fetch.service';

import { ThemeLoaderService } from 'client/app/services/themeloader.service';
import { WindowManagerService } from './services/window-manager.service';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'client/environments/environment';
import { KeyboardService } from './services/keyboard.service';


@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RootComponent {
    environment = environment;

    constructor(
        private fetch: Fetch,
        private themeLoader: ThemeLoaderService,
        public dialog: MatDialog,
        public windowManager: WindowManagerService,
        private keyboard: KeyboardService
    ) {

        this.windowManager.openWindow({
            title: "My special App",
            description: "My Application V1.0",
            appId: "file-manager",
            x: 100,
            y: 100,
            width: 800,
            height: 600,
            icon: "assets/icons/apps/nautilus-symbolic.svg",

            // This is an arbitrary data object that gets loaded into the app
            data: {
                basePath: "/home/knackstedt/Downloads/_Test",
                showHidden: false,
                search: ""
            }
        });

        this.keyboard.onKeyCommand({
            key: "f11",
            window: false
        }).subscribe((evt) => {
            console.log("CTRL+S", evt)
        })
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
