import { Component, ComponentRef, HostListener, OnInit } from '@angular/core';
import { CdkDragDrop, CdkDragEnd, CdkDragRelease, DragRef, moveItemInArray, Point} from '@angular/cdk/drag-drop';
// Observables
import { Fetch } from 'client/app/services/fetch.service';

import { ThemeLoaderService } from 'client/app/services/themeloader.service';
import { TaskBarData, WindowOptions } from './services/window-manager.service';
import { MatDialog } from '@angular/material/dialog';
// import { environment } from 'environments/environment';
import { ComponentPortal, Portal } from '@angular/cdk/portal';
import { Apps } from "client/app/services/application-loader.service";
import { ApplicationLoaderService } from './services/application-loader.service';
import { ResizeEvent } from 'angular-resizable-element';

type ManagedWindow = WindowOptions & {
    _isCollapsed: boolean,
    _isMaximized: boolean,
    _isActive: boolean,
    _isLoading: boolean,
    _index: number, // z-index
    _isDraggedOver: boolean, // is something being dragged in front of this window?
    _portal ?: Portal<any>,
    _module ?: any,
    _initialStyle: string,

    // Temp vars for handling resize events
    _x: number,
    _y: number
}

@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss']
})
export class RootComponent implements OnInit {
    private windowZindexCounter = 1;
    private windowIdCounter = 1;
    snapPx = 5;

    managedWindows: ManagedWindow[] = [];
    taskbarItems: TaskBarData[] = [];

    async createWindow(config: Partial<WindowOptions>) {
        const data = {
            appId: "empty",
            icon: "assets/icons/dialog-question-symbolic.svg",
            description: "",
            title: "",
            width: 300,
            height: 200,
            x: 50, 
            y: 50,
            id: this.windowIdCounter++,
            _isCollapsed: false,
            _isMaximized: false,
            _isActive: false,
            _index: this.windowZindexCounter++,
            _isDraggedOver: false,
            _isLoading: true,
            ...config
        } as ManagedWindow;

        data._initialStyle = `width: ${data.width}px; height: ${data.height}px;`
        data._x = data.x;
        data._y = data.y;

        this.appLoader.LoadApplication(config.appId)
            .then(async module => {
                // no module, there is no remote app to load.
                if (!module) {
                    data._isLoading = false;
                    return;
                }
                data._module = module;

                // Parse the APP id so we can do a tolerant match
                const appId = config.appId.toLowerCase().replace(/-/g, '');
                const component = module['ɵmod'].declarations
                    .find(c => {
                        const ccn = c.name.toLowerCase().replace(/-/g, '').replace(/component$/, '');
                        return ccn == appId;
                    });

                if (!component)
                    throw `Could not find appId ${config.appId} on module ${module.name}!`;

                // Create the componentportal and render the elements.
                data._portal = new ComponentPortal(component);
                data._isLoading = false;
            });

        // Store data in the windows array
        this.managedWindows.push(data);
        
        // Lookup if we already have a taskbar item
        let taskbarItem = this.taskbarItems.find(t => t.app == data.appId);

        // If not, create one
        if (!taskbarItem) 
            this.taskbarItems.push(taskbarItem = { app: data.appId, windows: []});
    
        // Lastly add to the taskbar item.
        taskbarItem.windows.push(data);
    }

    constructor(
        private fetch: Fetch,
        private themeLoader: ThemeLoaderService,
        public dialog: MatDialog,
        private appLoader: ApplicationLoaderService
    ) {

        this.createWindow({
            title: "My special App",
            description: "My Dildo Application V1.0",
            appId: "file-manager",
            x: 100,
            y: 100,
            width: 800,
            height: 600,

            // This is an arbitrary data object that gets loaded into the app
            data: {
                basePath: "/home/knackstedt/Downloads",
                showHidden: false,
                search: ""
            }
        });
        this.createWindow({
            title: "My special App -1",
            x: 600,
            y: 300
        });
        // this.createWindow({
        //     title: "My special App v2.0",
        //     app: "something else"
        // });
    }

    ngOnInit() {
        // this.fetch.get<{ Region: string, Version: string }>("/mvc/api/Pages/AppInfo").then(data => {
        //     this.region = data.Region;
        //     this.version = data.Version;
        // }).catch(err => { });
        this.taskbarItems = [];
        let apps = this.managedWindows.map(d => d.appId);
        let _map = {};
        apps.forEach(a => _map[a] = true);
        apps = Object.keys(_map);
        apps.forEach(a => {
            let windows = this.managedWindows.filter(w => w.appId == a);
            this.taskbarItems.push({
                app: a,
                windows
            });
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

    @HostListener('window:resize', ['$event'])
    private onResize(event?) {

    }

    blurAllWindows() {
        this.managedWindows.forEach(w => w._isActive = false);
    }

    @HostListener('window:blur', ['$event'])
    private onBlur(event?) {
        this.blurAllWindows();
    }


    drop(evt: CdkDragDrop<string[]>) {
    }

    closeWindow(window: ManagedWindow, evt?: MouseEvent) {
        // TODO: move window into history.
    }
    minimizeWindow(window: ManagedWindow, evt?: MouseEvent) {
        // Minimize to taskbar
    }
    maximizeWindow(window: ManagedWindow, evt?: MouseEvent) {
        // Maximize to near-fullscreen
    }
    collapseWindow(window: ManagedWindow, evt?: MouseEvent) {
        // Collapse from near-fullscreen
    }

    activateWindow(window: ManagedWindow, evt?: MouseEvent) {
        this.blurAllWindows();
        window._isActive = true;
        window._index = this.windowZindexCounter++;

        if (window._isCollapsed) {
            // TODO: re-activate window
        }
    }

    onDragEnd(window: ManagedWindow, evt?: CdkDragRelease) {
        const bounds = evt.source.getRootElement().getBoundingClientRect();
        window.x = window._x = bounds.x;
        window.y = window._y = bounds.y;
        window.width = bounds.width;
        window.height = bounds.height;

        // this.windowData.forEach(w => w._isDraggedOver = false);
    }

    onResizing(window: ManagedWindow, evt?: ResizeEvent) {
        window.y = window._y + evt.rectangle.top;
        window.x = window._x + evt.rectangle.left - 64;
        window.width = evt.rectangle.width; 
        window.height = evt.rectangle.height;
    } 

    onResizeEnd(window: ManagedWindow, evt?: ResizeEvent) {
        window.height = evt.rectangle.height;
        window.width = evt.rectangle.width;

        window._y = window.y;
        window._x = window.x;
    }

    // /**
    //  * This method is a property assignment, so all local class references 
    //  * must be passed through the element's cdkDragData binding.
    //  */
    // computeDragRenderPos(pos: Point, dragRef: DragRef) {
    //     const e = document.getElementById("e");
    //     // e.style.top = mousePos.y + "px";
    //     // e.style.left = mousePos.x + "px";

    //     // const { dragWindow, windowData, snapPx }: {
    //     //     dragWindow: WindowData,
    //     //     windowData: WindowData[],
    //     //     snapPx: number
    //     // } = dragRef.data.data;

    //     // // const p = dragRef.getFreeDragPosition();
    //     // // const pos = {
    //     // //     x: p.x + 64,
    //     // //     y: p.y
    //     // // };

    //     // const dx = mousePos.x - pos.x;

    //     // const topEdges = [];
    //     // const leftEdges = [];
    //     // const bottomEdges = [];
    //     // const rightEdges = [];

    //     // windowData
    //     //     .filter(w => !w._isCollapsed && w.id != dragWindow.id)
    //     //     .forEach(w => {
    //     //         topEdges.push(w._dragPosition.y);
    //     //         leftEdges.push(w._dragPosition.x);
    //     //         bottomEdges.push(w._dragPosition.y + w.height);
    //     //         rightEdges.push(w._dragPosition.x + w.width);
    //     //         // w._isDraggedOver = false;
    //     //     });

    //     // windowData
    //     //     .filter(w => !w._isCollapsed && w.id != dragWindow.id)
    //     // .filter(w => {

    //     //     // const  = xRight > r.x && xRight < r.x + r.w;
    //     //     // we know that the horizontal pos overlaps
    //     //     const xOverlap =
    //     //         pos.x > w._dragPosition.x && pos.x < w._dragPosition.x + w.width ||
    //     //         pos.x + dragWindow.width > w._dragPosition.x && pos.x + dragWindow.width < w._dragPosition.x + w.width;


    //     //         // pos.x + dragWindow.width > w._dragPosition.x &&
    //     //         // pos.x < w._dragPosition.x + w.width;
    //     //         //  ||
    //     //         // x > pos.x &&
    //     //         // x < pos.x + dragWindow.width;

    //     //     // const y = w._dragPosition.y + w.height;
    //     //     const yOverlap = true
    //     //         // y > pos.y &&
    //     //         // y < pos.y + dragWindow.height;

    //     //     console.log("Overlap state", xOverlap)

    //     //     // If we overlap both on X and Y, then there is some overlap of the windows.
    //     //     return xOverlap && yOverlap;
    //     // })
    //     //     .forEach(w => {
    //     //         w._isDraggedOver = true;
    //     //         console.log("overlap", w.title)
    //     //     })

    //     // // const topEdge = pos.y;
    //     // const leftEdge = pos.x;
    //     // const rightEdge = pos.x + dragWindow.width;
    //     // const bottomEdge = pos.y + dragWindow.height;

    //     // // Check all right window edges against the moving left edge

    //     // const checkEdge = (currentPosEdge, dragBoundEdge) => {
    //     //     const check = (edge) => {
    //     //         let left = currentPosEdge - snapPx;
    //     //         let right = currentPosEdge + snapPx;

    //     //         return edge > left && edge < right;

    //     //         return edge
    //     //         if (
    //     //             currentPosEdge - snapPx < edge &&
    //     //             currentPosEdge + snapPx > edge
    //     //             )
    //     //         return true;
    //     //         return false;
    //     //     }
    //     //     return function(staticEdge) {
    //     //         return check(dragBoundEdge) || check(staticEdge) || null;
    //     //     }
    //     // }

    //     // // We snap to the opposite edges of other windows.
    //     // const snapTopPx = bottomEdges.find(checkEdge(topEdge, 0));
    //     // const snapLeftPx = rightEdges.find(checkEdge(leftEdge, 0));
    //     // const snapBottomPx = topEdges.find(checkEdge(bottomEdge, window.innerHeight));
    //     // const snapRightPx = leftEdges.find(checkEdge(rightEdge, window.innerWidth));

    //     // if (snapTopPx) console.log("snapping to top", snapTopPx);
    //     // if (snapLeftPx) console.log("snapping to left", snapLeftPx);
    //     // if (snapBottomPx) console.log("snapping to bottom", snapBottomPx);
    //     // if (snapRightPx) console.log("snapping to right", snapRightPx);


    //     // if (x == null) ? snapLeftPx : 0) || (snapRightPx ? snapRightPx + dragWindow.width : 0
    //     // return {
    //     //     x: () || pos.x,
    //     //     y: (snapTopPx ? snapTopPx : 0) || (snapBottomPx ? snapBottomPx + dragWindow.height : 0) || pos.y
    //     // };

    //     // return {
    //     //     x: pos.x < 0 ? -pos.x + dx : mousePos.x,
    //     //     y: mousePos.y
    //     // };

    //     const div = dragRef.getFreeDragPosition();
    //     let tx = (div.x + (pos.x - div.x));
    //     let x = tx;
    //     // if (div.x + 300 + 64 < pos.x)
    //     // x = pos.x;
    //     if (div.x <= 0)
    //         tx -=
    //         // pos.x = (div.x + (pos.x - div.x)) + (pos.x + -div.x);
    //         // x = -div.x + 64;
    //         // x = (pos.x - div.x);
        
    //     // px = 57
    //     // dvx = -20

    //     console.log(pos.x, div.x, x);
            
    //     return { x: x, y: pos.y };
    // }

    injectPortal(ref, data: ManagedWindow) {
        const component = ref as ComponentRef<any>;
        component.instance["windowData"] = data;
    }
}
