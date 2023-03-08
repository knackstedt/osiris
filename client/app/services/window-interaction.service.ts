import { Injectable } from '@angular/core';
import interact from 'interactjs';

import { ManagedWindow, WindowManagerService } from './window-manager.service';
import { ConfigurationService } from './configuration.service';

/**
 * This file contains the window manager interactions for dragging
 * and resizing of windows.
 *
 * TODO:
 * - filter out snap edges that are obscured by other windows
 * - snap to corners where two windows are on snapped to the same edge
 */

@Injectable({
    providedIn: 'root'
})
export class WindowInteractionService {

    constructor(private windowManager: WindowManagerService, private configuration: ConfigurationService) { this.bindEvents() }

    private bindEvents() {
        console.log("binding events")
        // TODO: line intersections.

        let snapPoints = [];
        let resizeBounds = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
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
                y: this.configuration.topOffset,
                x: this.configuration.leftOffset,
                distance: globalThis.innerWidth - (this.configuration.leftOffset + this.configuration.rightOffset + window.width)
            }, "x");

            // right
            createLineSnap({
                y: this.configuration.topOffset,
                x: globalThis.innerWidth - (this.configuration.rightOffset + window.width),
                distance: globalThis.innerHeight - (this.configuration.topOffset + this.configuration.bottomOffset + window.height)
            }, "y");

            // bottom
            createLineSnap({
                y: this.configuration.topOffset + globalThis.innerHeight - window.height,
                x: this.configuration.leftOffset,
                distance: globalThis.innerWidth - (this.configuration.leftOffset + this.configuration.rightOffset + window.width)
            }, "x");

            // left
            createLineSnap({
                y: this.configuration.topOffset,
                x: this.configuration.leftOffset,
                distance: globalThis.innerHeight - (this.configuration.topOffset + this.configuration.bottomOffset + window.height)
            }, "y");

            let snapTargets = this.windowManager.managedWindows
                // Omit the dragged window
                .filter(w => w.id != window.id)
                // Omit collapsed windows
                .filter(w => !w._isCollapsed)
                // Omit windows that declare themselves to not be snapped to
                .filter(w => w._isSnapTarget);

            snapTargets
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
                            ? win.x + this.configuration.leftOffset
                            : win.x - (window.width - win.width) + this.configuration.leftOffset,
                        distance: isWider
                            ? (win.x + win.width + this.configuration.leftOffset - window.width) - (win.x + this.configuration.leftOffset)
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
                        x: win.x + win.width + this.configuration.leftOffset,
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
                            ? win.x + this.configuration.leftOffset
                            : win.x - (window.width - win.width) + this.configuration.leftOffset,
                        distance: isWider
                            ? (win.x + win.width + this.configuration.leftOffset - window.width) - (win.x + this.configuration.leftOffset)
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
                        x: win.x - window.width + this.configuration.leftOffset,
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
                console.log("resizing")

                evt.target.classList.add("resizing");
                const numId = parseInt(evt.target.id.split('_').pop());
                window = this.windowManager.managedWindows.find(w => w.id == numId);

                window.emit("onResizeStart", evt);

                resizeBounds.top = 0;
                resizeBounds.left = 0;
                resizeBounds.right = globalThis.innerWidth;
                resizeBounds.bottom = globalThis.innerHeight;

                calculateEdges();
            },
            onend: evt => {
                evt.target.classList.remove("resizing");
                snapPoints.splice(0);

                window.emit("onResizeEnd", evt);
                window = null;
            },
            onmove: evt => {
                const numId = parseInt(evt.target.id.split('_').pop());
                const window = this.windowManager.managedWindows.find(w => w.id == numId);

                window.height = Math.max(evt.rect.height, window.minHeight);
                window.width = Math.max(evt.rect.width, window.minWidth);

                window.x = evt.rect.left;
                window.y = evt.rect.top;

                window.emit("onResize", evt);
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
                console.log("start dragging");

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
