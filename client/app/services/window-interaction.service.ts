import { Injectable } from '@angular/core';
import interact from 'interactjs';

import { ManagedWindow, WindowManagerService } from './window-manager.service';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class WindowInteractionService {

    constructor(private windowManager: WindowManagerService) { this.bindEvents() }

    private bindEvents() {

        // TODO: line intersections.

        const topOffset    = environment.taskbarPosition == "top"    ?  64 : 0;
        const rightOffset  = environment.taskbarPosition == "right"  ? -64 : 0;
        const bottomOffset = environment.taskbarPosition == "bottom" ? -64 : 0;
        const leftOffset   = environment.taskbarPosition == "left"   ?  64 : 0;

        let snapPoints = [];
        let resizeBounds = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: 300,
            height: 200
        };
        let window: ManagedWindow;

        const createLineSnap = (opts: { x: number, y: number, distance: number }, dir: "x" | "y") => {
            snapPoints.push({
                y: opts.y,
                x: opts.x,
                range: 15
            });

            for (let i = 15; i < opts.distance - 15; i++) {
                snapPoints.push({
                    y: (dir == "y" && i || 0) + opts.y,
                    x: (dir == "x" && i || 0) + opts.x,
                    range: 15
                });
            }

            snapPoints.push({
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

        const resizable = interact('.resizable');
        resizable.styleCursor(false);

        resizable.resizable({
            // cursorChecker: false,
            margin: 8,
            edges: { top: true, left: true, bottom: true, right: true },
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: resizeBounds
                }),
                interact.modifiers.snap({
                    targets: snapPoints,
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

                window.emit("onResizeStart", evt);

                resizeBounds.top = 0;
                resizeBounds.left = 0;
                resizeBounds.right = globalThis.innerWidth;// - (window.width + window.x) + rightOffset;
                resizeBounds.bottom = globalThis.innerHeight;

                calculateEdges();
            },
            onend: evt => {
                window.emit("onResizeEnd", evt);

                evt.target.classList.remove("resizing");
                snapPoints.splice(0);
                window = null;
            },
            onmove: evt => {
                const numId = parseInt(evt.target.id.split('_').pop());
                const window = this.windowManager.managedWindows.find(w => w.id == numId);
                window.emit("onResize", evt);

                window.height = Math.max(evt.rect.height, 200);
                window.width = Math.max(evt.rect.width, 300);
                window.x = evt.rect.left;
                window.y = evt.rect.top;
            }
        });

        const draggable = interact('.draggable');
        draggable.styleCursor(false);

        draggable.draggable({
            allowFrom: '.draghandle',
            modifiers: [
                // interact.modifiers.restrictRect({
                //     restriction: 'parent'
                // }),
                interact.modifiers.snap({
                    targets: snapPoints,
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
                window.emit("onDragStart", evt);

                calculateEdges();
            },
            onend: evt => {
                evt.target.classList.remove("dragging");
                window.emit("onDragEnd", evt);

                snapPoints.splice(0);
                window = null;
            },
            onmove: evt => {
                window.x += evt.dx;
                window.y += evt.dy;

                this.windowManager.managedWindows.forEach(w => {
                    w._isDraggedOver = false;

                    const dragTop    = window.y;
                    const dragRight  = window.x + window.width;
                    const dragBottom = window.y + window.height;
                    const dragLeft   = window.x;

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
                });

                window.emit("onDrag", evt);
            }
        })
    }
}
