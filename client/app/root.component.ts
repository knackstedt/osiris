import { Component } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Fetch } from 'client/app/services/fetch.service';
import { ThemeLoaderService } from 'client/app/services/themeloader.service';
import { WindowManagerService } from './services/window-manager.service';
import { KeyboardService } from './services/keyboard.service';
import { XpraService } from './services/xpra.service';
import { WindowInteractionService } from './services/window-interaction.service';

@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss'],
    animations: [
        trigger('activeWorkspace', [
            state('previous', style({
                transform: "translate3d(0, -100%, 0)"
            })),
            state('current', style({
                transform: "translate3d(0, 0, 0)"
            })),
            state('next', style({
                transform: "translate3d(0, 100%, 0)"
            })),
            state('void', style({
                transform: ""
            })),
            transition('previous => current, current => previous, current => next, next => current', [
                animate('250ms ease')
            ]),
        ])
    ]
})
export class RootComponent {

    taskbarPosition: "top" | "right" | "bottom" | "left" = "left";

    workspaces = [
        { label: "default", id: 0 },
        { label: "avalon", id: 1 },
        { label: "gaia", id: 2 },
        { label: "brunhild", id: 3 },
        { label: "kronos", id: 4 },
        { label: "osiris", id: 5 },
        { label: "anubis", id: 6 },
        { label: "thor", id: 7 },
    ]

    isAnimating = true;
    currentWorkspace = 0;

    constructor(
        private fetch: Fetch,
        private themeLoader: ThemeLoaderService,
        public windowManager: WindowManagerService,
        private keyboard: KeyboardService,
        public xpraService: XpraService,
        private interactionService: WindowInteractionService,
    ) {

        this.windowManager.openWindow({
            appId: "file-manager",
            workspace: 1,
            x: 50,
            y: 800,
            width: 800,
            height: 200,

            // This is an arbitrary data object that gets loaded into the app
            data: {
                basePath: "/home/knackstedt/Downloads/",
                showHidden: false,
                search: ""
            }
        });

        this.windowManager.openWindow({
            appId: "terminal",
            workspace: 0,
            x: 500,
            y: 100,
            width: 400,
            height: 400,

            // This is an arbitrary data object that gets loaded into the app
            data: {
                cwd: "/home/knackstedt/Downloads/",
                command: "bash"
            }
        });

        keyboard.onKeyCommand({
            key: "ArrowUp",
            window: false,
        }).subscribe(() => {

            // this.workspaces[this.currentWorkspace].i

            // this.isAnimating = true;
            this.currentWorkspace--;
            console.log(this.currentWorkspace);
            // setTimeout(() => {
            //     this.isAnimating = false;
            // }, 1000);
        })

        keyboard.onKeyCommand({
            key: "ArrowDown",
            window: false,
        }).subscribe(() => {

            // this.workspaces[this.currentWorkspace].i
            // this.isAnimating = true;

            this.currentWorkspace++;
            console.log(this.currentWorkspace);
            // setTimeout(() => {
            //     this.isAnimating = false;
            // }, 1000);
        })
    }
}
