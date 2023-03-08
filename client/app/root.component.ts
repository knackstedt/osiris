import { Component, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { debounceTime } from 'rxjs';
import { Fetch } from 'client/app/services/fetch.service';
import { ThemeLoaderService } from 'client/app/services/themeloader.service';
import { WindowManagerService } from './services/window-manager.service';
import { KeyboardService } from './services/keyboard.service';
import { XpraService } from './services/xpra.service';
import { WindowInteractionService } from './services/window-interaction.service';
import { ConfigurationService } from 'client/app/services/configuration.service';

@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss'],
    animations: [
        trigger('activeWorkspace', [
            state('current', style({
                transform: "translate3d(0, 0, 0)"
            })),
            state('above', style({
                transform: "translate3d(0, -100%, 0)"
            })),
            state('below', style({
                transform: "translate3d(0, 100%, 0)"
            })),
            state('left', style({
                transform: "translate3d(-100%, 0, 0)"
            })),
            state('right', style({
                transform: "translate3d(100%, 0, 0)"
            })),
            transition('* <=> *', [
                animate('250ms ease')
            ]),
        ]),
        trigger('switchingWorkspace', [
            state('on', style({
                opacity: 1
            })),
            state('off', style({
                opacity: 0
            })),
            transition('on <=> off', [
                animate('250ms ease')
            ]),
        ])
    ]
})
export class RootComponent {

    taskbarPosition: "top" | "right" | "bottom" | "left" = "left";

    currentWorkspace = 0;

    switchingWorkspace = false;
    showWorkspaceDots = false;

    switchWorkspaceEmitter = new EventEmitter();
    switchWorkspace$ = this.switchWorkspaceEmitter.pipe(debounceTime(800));

    dotEmitter = new EventEmitter();
    showDots$ = this.dotEmitter.pipe(debounceTime(1200));

    constructor(
        private fetch: Fetch,
        private themeLoader: ThemeLoaderService,
        public windowManager: WindowManagerService,
        private keyboard: KeyboardService,
        public xpraService: XpraService,
        private interactionService: WindowInteractionService,
        public config: ConfigurationService
    ) {

        this.windowManager.openWindow({
            appId: "file-manager",
            workspace: 1,
            x: 50,
            y: 600,
            width: 800,
            height: 300,

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

        this.windowManager.openWindow({
            appId: "start-menu",
            workspace: 0,
            x: 900,
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
            if (this.currentWorkspace > 0) {
                this.transitionWorkspaces();

                this.currentWorkspace--;
            }
        })

        keyboard.onKeyCommand({
            key: "ArrowDown",
            window: false,
        }).subscribe(() => {
            if (this.currentWorkspace < (this.config.workspaces.length - 1)) {
                this.transitionWorkspaces();
                this.currentWorkspace++;
            }
        })

        this.showDots$.subscribe(d => {
            this.showWorkspaceDots = false;
        });
        this.switchWorkspace$.subscribe(d => {
            this.switchingWorkspace = false;
        })
    }

    transitionWorkspaces() {
        this.switchingWorkspace = true;
        this.showWorkspaceDots = true;

        this.switchWorkspaceEmitter.next(null);
        this.dotEmitter.next(null);
    }

    selectWorkspace(workspace: number) {
        this.currentWorkspace = workspace;
    }
}
