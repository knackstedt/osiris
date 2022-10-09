import { Component, HostListener, ViewEncapsulation } from '@angular/core';
// Observables
import { Fetch } from 'client/app/services/fetch.service';

import { ThemeLoaderService } from 'client/app/services/themeloader.service';
import { WindowManagerService, ManagedWindow } from './services/window-manager.service';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'client/environments/environment';
import { KeyboardService } from './services/keyboard.service';
import { WallpaperService } from './services/wallpaper.service';
import interact from 'interactjs';
import { XpraService } from './services/xpra.service';


@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RootComponent {
    environment = environment;

    taskbarPosition: "top" | "right" | "bottom" | "left" = "right";

    constructor(
        private fetch: Fetch,
        private themeLoader: ThemeLoaderService,
        public dialog: MatDialog,
        public windowManager: WindowManagerService,
        private keyboard: KeyboardService,
        public wallpaper: WallpaperService,
        public xpraService: XpraService
    ) {
        this.bindEvents()

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

        const topOffset = this.taskbarPosition == "top" ? 64 : 0;
        const rightOffset = this.taskbarPosition == "right" ? -64 : 0;
        const bottomOffset = this.taskbarPosition == "bottom" ? -64 : 0;
        const leftOffset = this.taskbarPosition == "left" ? 64 : 0;

        let snapCorners = [];


        const createLineSnap = (opts: { x: number, y: number, distance: number }, dir: "x" | "y") => {
            snapCorners.push({
                y: opts.y,
                x: opts.x,
                range: 15
            });

            for (let i = 15; i < opts.distance - 15; i++) {
                snapCorners.push({
                    y: (dir == "y" && i || 0) + opts.y,
                    x: (dir == "x" && i || 0) + opts.x,
                    range: 15
                });
            }

            snapCorners.push({
                y: (dir == "y" && opts.distance || 0) + opts.y,
                x: (dir == "x" && opts.distance || 0) + opts.x,
                range: 15
            });
        }

        const calculateEdges = () => {

            // top
            createLineSnap({
                y: topOffset,
                x: leftOffset,
                distance: globalThis.innerWidth - (leftOffset + rightOffset + window.width)
            }, "x");

            // right
            createLineSnap({
                y: topOffset,
                x: globalThis.innerWidth - (rightOffset + window.width),
                distance: globalThis.innerHeight - (topOffset + bottomOffset + window.height)
            }, "y");

            // bottom
            createLineSnap({
                y: topOffset + globalThis.innerHeight - window.height,
                x: leftOffset,
                distance: globalThis.innerWidth - (leftOffset + rightOffset + window.width)
            }, "x");

            // left
            createLineSnap({
                y: topOffset,
                x: leftOffset,
                distance: globalThis.innerHeight - (topOffset + bottomOffset + window.height)
            }, "y");

            this.windowManager.managedWindows
                .filter(w => w.id != window.id)
                .forEach(win => {
                    const isWider = win.width > window.width;
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
                    createLineSnap({
                        y: win.y - window.height,
                        x: isWider
                            ? win.x + leftOffset
                            : win.x - (window.width - win.width) + leftOffset,
                        distance: isWider
                            ? (win.x + win.width + leftOffset - window.width) - (win.x + leftOffset)
                            : window.width - win.width
                    }, "x");

                    /**
                     * (TL -> TR)
                     * ███████████▒▒▒▒▒
                     * █      -+x█▒   ▒
                     * █         █▒   ▒
                     * █   win   █▒▒▒▒▒
                     * █         █
                     * ███████████
                     */
                    createLineSnap({
                        y: isTaller
                            ? win.y
                            : win.y - (window.height - win.height),
                        x: win.x + win.width + leftOffset,
                        distance: isTaller
                            ? (win.y + (win.height - window.height)) - (win.y)
                            : window.height - win.height
                    }, "y")

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
                    createLineSnap({
                        y: win.y + win.height,
                        x: isWider
                            ? win.x + leftOffset
                            : win.x - (window.width - win.width) + leftOffset,
                        distance: isWider
                            ? (win.x + win.width + leftOffset - window.width) - (win.x + leftOffset)
                            : window.width - win.width
                    }, "x")


                    /**
                     * (BR -> BL)
                     *      ██████████
                     *      █     -+x█
                     * ▒▒▒▒▒█        █
                     * ▒   ▒█        █
                     * ▒   ▒█        █
                     * ▒▒▒▒▒██████████
                     */
                    createLineSnap({
                        y: isTaller
                            ? win.y
                            : win.y - (window.height - win.height),
                        x: win.x - window.width + leftOffset,
                        distance: isTaller
                            ? (win.y + (win.height - window.height)) - (win.y)
                            : window.height - win.height
                    }, "y")
                });
        }

        interact('.draggable').resizable({
            margin: 8,
            edges: { top: true, left: true, bottom: true, right: true },
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent'
                }),
                interact.modifiers.snap({
                    targets: snapCorners,
                    relativePoints: [{
                        x: 0,
                        y: 0
                    }]
                })
            ],
            onstart: evt => {
                evt.target.classList.add("resizing");
                const numId = parseInt(evt.target.id.split('_').pop());
                window = this.windowManager.managedWindows.find(w => w.id == numId);

                calculateEdges();
            },
            onend: evt => {
                evt.target.classList.remove("resizing");
                snapCorners.splice(0);
                window = null;
            },
            onmove: evt => {
                const numId = parseInt(evt.target.id.split('_').pop());
                const window = this.windowManager.managedWindows.find(w => w.id == numId);

                window.height = evt.rect.height;
                window.width = evt.rect.width;
                window.x = evt.rect.left - leftOffset;
                window.y = evt.rect.top - topOffset;
            }
        })

        let snapEdges = [];
        let window: ManagedWindow;

        interact('.draggable').draggable({
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
            onstart: evt => {
                const numId = parseInt(evt.target.id.split('_').pop());
                window = this.windowManager.managedWindows.find(w => w.id == numId);

                evt.target.classList.add("dragging");
                calculateEdges();
            },

            onend: evt => {
                evt.target.classList.remove("dragging");
                snapCorners.splice(0);
                window = null;
            },
            onmove: evt => {
                window.x += evt.dx;
                window.y += evt.dy;

                this.windowManager.managedWindows.forEach(w => {
                    w._isDraggedOver = false;

                    const dragTop = window.y;
                    const dragRight = window.x + window.width;
                    const dragBottom = window.y + window.height;
                    const dragLeft = window.x;

                    let xOverlap = false;
                    let yOverlap = false;

                    if (dragRight > w.x && dragRight < w.x + w.width)
                        xOverlap = true;
                    else if (dragLeft > w.x && dragLeft < w.x + w.width)
                        xOverlap = true;

                    if (dragTop > w.y && dragTop < w.y + w.height)
                        yOverlap = true;
                    else if (dragBottom > w.y && dragBottom < w.y + w.height)
                        yOverlap = true;
                    
                    if (dragRight > w.x + w.width && dragLeft < w.x)
                        xOverlap = true;
                    if (dragBottom > w.y + w.height && dragTop < w.y)
                        yOverlap = true;

                    if (xOverlap && yOverlap)
                        w._isDraggedOver = true;
                })
            }
        })
    }
}
