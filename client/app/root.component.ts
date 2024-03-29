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

        // this.windowManager.openWindow({
        //     appId: "file-manager",
        //     workspace: 0,
        //     x: 100,
        //     y: 50,
        //     width: 1200,
        //     height: 800,

        //     // This is an arbitrary data object that gets loaded into the app
        //     data: {
        //         // path: "/home/knackstedt/Applications/starcheat",
        //         // path: "/home/knackstedt/Videos",
        //         // path: "/home/knackstedt/Downloads/AssetRipper_linux_x64.zip",
        //         path: "/home/knackstedt/Downloads",
        //         // path: "/home/knackstedt/cache/",
        //         showHidden: false,
        //         search: ""
        //     }
        // });

        // this.windowManager.openWindow({
        //     appId: "welcome",
        //     workspace: 0,
        //     center: true,
        //     width: 600,
        //     height: 400
        // });

        // this.windowManager.openWindow({
        //     appId: "client-settings",
        //     workspace: 0,
        //     x: window.innerWidth/2-500,
        //     y: window.innerHeight/2-400,
        //     width: 1000,
        //     height: 800,
        // });

        this.windowManager.openWindow({
            appId: "music-library",
            workspace: 0,
            x: window.innerWidth / 2 - 500,
            y: window.innerHeight / 2 - 400,
            width: 1000,
            height: 800,
        });

        // https://cdn.dotglitch.dev/music/joystock-firebird.mp3

        // this.windowManager.openWindow({
        //     appId: "material-factory",
        //     workspace: 2,
        //     x: 64,
        //     y: 64,
        //     width: 1600,
        //     height: 900,

        //     _isMaximized: true
        // });


        keyboard.onKeyCommand({
            key: "ArrowUp",
            window: false,
        }).subscribe(() => {
            if (this.config.currentWorkspace > 0) {
                this.transitionWorkspaces();

                this.config.currentWorkspace--;
            }
        })

        keyboard.onKeyCommand({
            key: "ArrowDown",
            window: false,
        }).subscribe(() => {
            if (this.config.currentWorkspace < (this.config.workspaces.length - 1)) {
                this.transitionWorkspaces();
                this.config.currentWorkspace++;
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
        this.transitionWorkspaces();
        this.config.currentWorkspace = workspace;
    }
}
