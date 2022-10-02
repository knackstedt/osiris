import { Component, ComponentRef, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
// Observables
import { Fetch } from 'client/app/services/fetch.service';

import { ThemeLoaderService } from 'client/app/services/themeloader.service';
import { WindowManagerService, ManagedWindow } from './services/window-manager.service';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'client/environments/environment';
import { KeyboardService } from './services/keyboard.service';
import { WallpaperService } from './services/wallpaper.service';
import interact from 'interactjs';
import { table } from 'console';


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
        this.bindEvents()

        this.windowManager.openWindow({
            appId: "file-manager",
            x: 50,
            y: 800,
            width: 800,
            height: 200,

            // This is an arbitrary data object that gets loaded into the app
            data: {
                basePath: "/home/knackstedt/Downloads/_Test",
                showHidden: false,
                search: ""
            }
        });

        this.windowManager.openWindow({
            appId: "terminal",
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

    private bindEvents() {
        interact('.draggable').resizable({
            margin: 8,
            edges: { top: true, left: true, bottom: true, right: true },
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent'
                })
            ],
            listeners: {
                start: evt => {
                    evt.target.classList.add("dragging");
                },
                end: evt => {
                    evt.target.classList.remove("dragging");
                },
                move: (evt) => {
                    const numId = parseInt(evt.target.id.split('_').pop());
                    const window = this.windowManager.managedWindows.find(w => w.id == numId);
    
                    window.height = evt.rect.height;
                    window.width = evt.rect.width;
                    window.x = evt.rect.left - 64;
                    window.y = evt.rect.top;
                    // debugger;
                }
            }
        })

        let snapCorners = [];
        let snapEdges = [];
        let window: ManagedWindow;

        function createLineSnap(opts: { x: number, y: number, distance: number }, dir: "x" | "y") {
            for (let i = 0; i < opts.distance; i++) {
                snapCorners.push({ 
                    y: (dir == "y" && i || 0) + opts.y, 
                    x: (dir == "x" && i || 0) + opts.x, 
                    range: 15
                });
            }
        }
        interact('.draggable').draggable({
            onstart: evt => {
                const numId = parseInt(evt.target.id.split('_').pop());
                window = this.windowManager.managedWindows.find(w => w.id == numId);

                evt.target.classList.add("dragging");

                this.windowManager.managedWindows
                    .filter(w => w.id != window.id)
                    .forEach(win => {
                        const isWider  = win.width > window.width;
                        const isTaller = win.height > window.height;

                        /**
                         * (TL -> BL)
                         * ▒▒▒▒▒
                         * ▒   ▒
                         * ▒   ▒ 
                         * ▒▒▒▒▒
                         * ███████████
                         * █      -+x█
                         * █         █
                         * █   win   █
                         * █         █
                         * ███████████
                         */
                        // snapCorners.push({ y: win.y - window.height, x: win.x + 64, range: 10 });
                        createLineSnap({ 
                            y: win.y - window.height, 
                            x: isWider 
                                ? win.x + 64 
                                : win.x - (window.width - win.width) + 64, 
                            distance: isWider 
                                ? (win.x + win.width + 64 - window.width) - (win.x + 64)
                                : window.width - win.width
                        }, "x");

                        /**
                         * (TL -> BL)
                         *      ▒▒▒▒▒
                         *      ▒   ▒
                         *      ▒   ▒
                         *      ▒▒▒▒▒
                         * ███████████
                         * █      -+x█
                         * █         █
                         * █   win   █
                         * █         █
                         * ███████████
                         */
                        // snapCorners.push({ y: win.y - window.height, x: win.x + win.width + 64 - window.width, range: 10 });


                        /**
                         * (TL -> TR)
                         * ███████████▒▒▒▒▒
                         * █      -+x█▒   ▒
                         * █         █▒   ▒
                         * █   win   █▒▒▒▒▒
                         * █         █
                         * ███████████
                         */
                        // snapCorners.push({ y: win.y, x: win.x + win.width + 64, range: 10 });
                        createLineSnap({
                            y: isTaller 
                                ? win.y
                                : win.y - (window.height - win.height),
                            x: win.x + win.width + 64,
                            distance: isTaller 
                                ? (win.y + (win.height - window.height)) - (win.y)
                                : window.height - win.height
                        }, "y")

                        /**
                         * (BL -> BR)
                         * ███████████
                         * █      -+x█
                         * █         █▒▒▒▒▒
                         * █   win   █▒   ▒
                         * █         █▒   ▒
                         * ███████████▒▒▒▒▒
                         */
                        // snapCorners.push({ y: win.y + (win.height - window.height), x: win.x + win.width + 64, range: 10 });


                        /**
                         * (TL -> BL)
                         * ██████████
                         * █     -+x█
                         * █        █
                         * █        █
                         * █        █
                         * ██████████
                         *      ▒▒▒▒▒    
                         *      ▒   ▒    
                         *      ▒   ▒    
                         *      ▒▒▒▒▒
                         */
                        // snapCorners.push({ y: win.y + win.height, x: win.x + win.width + 64 - window.width, range: 10 });
                        createLineSnap({
                            y: win.y + win.height,
                            x: isWider
                                ? win.x + 64
                                : win.x - (window.width - win.width) + 64,
                            distance: isWider
                                ? (win.x + win.width + 64 - window.width) - (win.x + 64)
                                : window.width - win.width
                        }, "x")

                        /**
                         * (TL -> BL)
                         * ██████████
                         * █     -+x█
                         * █        █
                         * █        █
                         * █        █
                         * ██████████
                         * ▒▒▒▒▒    
                         * ▒   ▒    
                         * ▒   ▒    
                         * ▒▒▒▒▒
                         */
                        // snapCorners.push({ y: win.y + win.height, x: win.x + 64, range: 10 });


                        /**
                         * (BR -> BL)
                         *      ██████████
                         *      █     -+x█
                         * ▒▒▒▒▒█        █
                         * ▒   ▒█        █
                         * ▒   ▒█        █
                         * ▒▒▒▒▒██████████
                         */
                        // snapCorners.push({ y: win.y + (win.height - window.height), x: win.x - window.width + 64, range: 10 });
                        createLineSnap({
                            y: isTaller
                                ? win.y
                                : win.y - (window.height - win.height),
                            x: win.x - window.width + 64,
                            distance: isTaller
                                ? (win.y + (win.height - window.height)) - (win.y)
                                : window.height - win.height
                        }, "y")

                        /**
                         * (TR -> TL)
                         * ▒▒▒▒▒██████████
                         * ▒   ▒█     -+x█
                         * ▒   ▒█        █
                         * ▒▒▒▒▒█        █
                         *      █        █
                         *      ██████████
                         */
                        // snapCorners.push({ y: win.y, x: win.x - window.width + 64, range: 10 });
                    });
            },
            modifiers: [
                // interact.modifiers.restrictRect({
                //     restriction: 'parent'
                // }),
                interact.modifiers.snap({
                    targets: snapCorners,
                    relativePoints: [{
                        x: 0,
                        y: 0
                    }]
                })
            ],
            listeners: {

                end: evt => {
                    evt.target.classList.remove("dragging");
                    snapCorners.splice(0);
                    window = null;
                },
                move: evt => {
                    window.x += evt.dx;
                    window.y += evt.dy;

                    // event.target.style.transform =
                    //     `translate(${position.x}px, ${position.y}px)`
                },
            }
        })
    }
}
