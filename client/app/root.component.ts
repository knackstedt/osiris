import { Component, HostListener, ViewEncapsulation } from '@angular/core';
// Observables
import { Fetch } from 'client/app/services/fetch.service';

import { ThemeLoaderService } from 'client/app/services/themeloader.service';
import { WindowManagerService, ManagedWindow } from './services/window-manager.service';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'client/environments/environment';
import { KeyboardService } from './services/keyboard.service';
import { WallpaperService } from './services/wallpaper.service';
import { XpraService } from './services/xpra.service';
import { WindowInteractionService } from './services/window-interaction.service';


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
        public wallpaper: WallpaperService,
        public xpraService: XpraService,
        private interactionService: WindowInteractionService
    ) {

        // this.windowManager.openWindow({
        //     appId: "file-manager",
        //     x: 50,
        //     y: 800,
        //     width: 800,
        //     height: 200,

        //     // This is an arbitrary data object that gets loaded into the app
        //     data: {
        //         basePath: "/home/knackstedt/Downloads/_Test",
        //         showHidden: false,
        //         search: ""
        //     }
        // });

        // this.windowManager.openWindow({
        //     appId: "terminal",
        //     x: 500,
        //     y: 100,
        //     width: 400,
        //     height: 400,

        //     // This is an arbitrary data object that gets loaded into the app
        //     data: {
        //         cwd: "/home/knackstedt/Downloads/",
        //         command: "bash"
        //     }
        // });

        // this.windowManager.openWindow({
        //     appId: "native",
        //     x: 200,
        //     y: 200,
        //     width: 400,
        //     height: 400,

        //     // This is an arbitrary data object that gets loaded into the app
        //     data: {
        //         cwd: "/home/knackstedt/Downloads/",
        //         command: "bash"
        //     }
        // });

        // this.windowManager.openWindow({
        //     appId: "native",
        //     x: 100,
        //     y: 100,
        //     width: 600,
        //     height: 600,

        //     // This is an arbitrary data object that gets loaded into the app
        //     data: {
        //         cwd: "/home/knackstedt/Downloads/",
        //         command: "gedit"
        //     }
        // });

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
