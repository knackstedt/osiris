import { Component, ComponentRef, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { CdkDragDrop, CdkDragEnd, CdkDragRelease, DragRef, moveItemInArray, Point} from '@angular/cdk/drag-drop';
// Observables
import { Fetch } from 'client/app/services/fetch.service';

import { ThemeLoaderService } from 'client/app/services/themeloader.service';
import { WindowManagerService } from './services/window-manager.service';
import { MatDialog } from '@angular/material/dialog';
// import { environment } from 'environments/environment';
import { ComponentPortal, Portal, PortalModule } from '@angular/cdk/portal';
import { ApplicationLoaderService } from './services/application-loader.service';
import { ResizeEvent } from 'angular-resizable-element';
import { ManagedWindow, WindowOptions } from 'client/types/window';
import { environment } from 'client/environments/environment';

export type TaskBarData = {
    app: string,
    windows: ManagedWindow[],

    _isHovered: boolean
    _isActive: boolean
    popupHeight?: number,
    popupWidth?: number
}

@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RootComponent implements OnInit {
    environment = environment;
    private windowZindexCounter = 1;
    private windowIdCounter = 1;
    snapPx = 5;

    managedWindows: ManagedWindow[] = [];
    taskbarItems: TaskBarData[] = [];



    constructor(
        private fetch: Fetch,
        private themeLoader: ThemeLoaderService,
        public dialog: MatDialog,
        private appLoader: ApplicationLoaderService,
        private windowManager: WindowManagerService
    ) {
        this.windowManager.subscribe(config => {
            console.log("Create new window");
            const data = {
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
                this.taskbarItems.push(taskbarItem = { app: data.appId, windows: [], _isActive: false, _isHovered: false });

            // Lastly add to the taskbar item.
            taskbarItem.windows.push(data);
        })

        this.windowManager.OpenWindow({
            title: "My special App",
            description: "My Application V1.0",
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
        this.windowManager.OpenWindow({
            title: "My special App -1",
            x: 600,
            y: 300
        });
    }

    ngOnInit() {
        // this.fetch.get<{ Region: string, Version: string }>("/mvc/api/Pages/AppInfo").then(data => {
        //     this.region = data.Region;
        //     this.version = data.Version;
        // }).catch(err => { });
        // this.taskbarItems = [];
        // let apps = this.managedWindows.map(d => d.appId);
        // let _map = {};
        // apps.forEach(a => _map[a] = true);
        // apps = Object.keys(_map) as any;
        // apps.forEach(a => {
        //     let windows = this.managedWindows.filter(w => w.appId == a);
        //     this.taskbarItems.push({
        //         app: a,
        //         windows,
        //         _isHovered: false
        //     });
        // })        
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

    @HostListener('window:blur', ['$event'])
    private onBlur(event?) {
        // this.blurAllWindows();
    }

    drop(evt: CdkDragDrop<string[]>) {
    }

    closeWindow(window: ManagedWindow, evt?: MouseEvent) {
        // TODO: move window into history.
        this.managedWindows.splice(this.managedWindows.findIndex(w => w.id == window.id), 1);
    }
    minimizeWindow(window: ManagedWindow, evt?: MouseEvent) {
        window._isMaximized = false;
        // Minimize to taskbar
    }
    maximizeWindow(window: ManagedWindow, evt?: MouseEvent) {
        window._isMaximized = true;
        // Maximize to near-fullscreen
    }
    collapseWindow(window: ManagedWindow, evt?: MouseEvent) {
        window._isCollapsed = true;
        // Collapse from near-fullscreen
    }
    uncollapseWindow(window: ManagedWindow, evt?: MouseEvent) {
        window._isCollapsed = false;
        window._index = this.windowZindexCounter++;
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

        window._component?.instance['onDragEnd'] && window._component.instance['onDragEnd'](evt);
    }

    onResizing(window: ManagedWindow, evt?: ResizeEvent) {
        window.y = window._y + evt.rectangle.top;
        window.x = window._x + evt.rectangle.left - 64;
        window.width = evt.rectangle.width; 
        window.height = evt.rectangle.height;

        window._component?.instance['onResize'] && window._component.instance['onResize'](evt);
    } 

    onResizeEnd(window: ManagedWindow, evt?: ResizeEvent) {
        window.height = evt.rectangle.height;
        window.width = evt.rectangle.width;

        window._y = window.y;
        window._x = window.x;

        window._component?.instance['onResizeEnd'] && window._component.instance['onResizeEnd'](evt);
    }

    injectPortal(ref, data: ManagedWindow) {
        const component = ref as ComponentRef<any>;
        component.instance["windowData"] = data;
        data._component = component;
    }

    calcScale(window: ManagedWindow) {
        const xMax = 250;
        const dxMax = 280;
        const yMax = 135;
        const dyMax = 181;
        const xScale = xMax / window.width;
        const yScale = yMax / window.height;
        
        const scale = Math.min(xScale, yScale);

        const cWidth  = window.width * scale;
        const cHeight = window.width * scale;

        const xTx = xScale > yScale ? ((xMax - cWidth ) / 2 / scale) : 0;
        const yTx = yScale > xScale ? ((yMax - cHeight) / 2 / scale) : 0;

        return `scale3d(${scale}, ${scale}, 1) translate3d(${xTx}px, ${yTx}px, 0px)`;
    }

    showMenu(menu: TaskBarData) {
        menu._isActive = true
        menu.windows.forEach(w => {
            w._preview = this.getIHTML(w);
        });
        console.log("show Menu")
    }

    hideMenu(menu: TaskBarData) {
        menu._isActive = false;
        this.managedWindows.forEach(w => {
            delete w._preview;
        });
    }
    blurAllWindows() {
        console.log("BAW")
        this.taskbarItems.forEach(menu => {
            menu._isActive = false;
        })
        this.managedWindows.forEach(w => {
            w._isActive = false;
        });
    }

    getIHTML(window: ManagedWindow) {
        return document.querySelector("#window_" + window.id + " .window")?.innerHTML;
    }
}
