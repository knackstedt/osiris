import { Component, ComponentRef, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
// Observables
import { Fetch } from 'client/app/services/fetch.service';

import { ThemeLoaderService } from 'client/app/services/themeloader.service';
import { WindowManagerService } from './services/window-manager.service';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'client/environments/environment';
import { KeyboardService } from './services/keyboard.service';
import { WallpaperService } from './services/wallpaper.service';


@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RootComponent {
    environment = environment;

    taskbarPosition: "top" | "right" | "bottom" | "left" = "left";

    constructor(
        private fetch: Fetch,
        private themeLoader: ThemeLoaderService,
        public dialog: MatDialog,
        public windowManager: WindowManagerService,
        private keyboard: KeyboardService,
        public wallpaper: WallpaperService
    ) {

        this.windowManager.openWindow({
            appId: "file-manager",
            x: 100,
            y: 100,
            width: 800,
            height: 600,

            // This is an arbitrary data object that gets loaded into the app
            data: {
                basePath: "/home/knackstedt/Downloads/_Test",
                showHidden: false,
                search: ""
            }
        });

        this.windowManager.openWindow({
            appId: "terminal",
            x: 100,
            y: 100,
            width: 800,
            height: 600,

            // This is an arbitrary data object that gets loaded into the app
            data: {
                cwd: "/home/knackstedt/Downloads/",
                command: "bash"
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
