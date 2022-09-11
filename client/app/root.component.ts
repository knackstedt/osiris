import { Component, HostListener, OnInit } from '@angular/core';
import {CdkDragDrop, CdkDragEnd, CdkDragRelease, moveItemInArray} from '@angular/cdk/drag-drop';
// Observables
import { Fetch } from 'client/app/services/fetch.service';

import { ThemeLoaderService } from 'client/app/services/themeloader.service';
import { WindowData } from './services/window-manager.service';
// import { environment } from 'environments/environment';

function windowFactory(data: Partial<WindowData>): WindowData {
    return {
        app: "empty",
        icon: "assets/icons/dialog-question-symbolic.svg",
        description: "",
        title: "",
        width: 300,
        height: 200,
        _isCollapsed: false,
        _isMaximized: false,
        _isActive: false,
        _dragPosition: { x: 50, y: 50 },
        ...data
    }
}

@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss']
})
export class RootComponent implements OnInit {

    windowData: WindowData[] = [
        windowFactory({
            title: "My special App",
            description: "My Dildo Application V1.0"
        }),
        windowFactory({
            title: "My special App -1"
        }),
        windowFactory({
            title: "My special App v2.0",
            app: "something else"
        })
    ];
    taskbarData = [];

    constructor(
        private fetch: Fetch,
        private themeLoader: ThemeLoaderService
    ) {
    }

    ngOnInit() {
        // this.fetch.get<{ Region: string, Version: string }>("/mvc/api/Pages/AppInfo").then(data => {
        //     this.region = data.Region;
        //     this.version = data.Version;
        // }).catch(err => { });
        this.taskbarData = [];
        let apps = this.windowData.map(d => d.app);
        let _map = {};
        apps.forEach(a => _map[a] = true);
        apps = Object.keys(_map);
        apps.forEach(a => {
            let windows = this.windowData.filter(w => w.app == a);
            this.taskbarData.push({
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
        this.windowData.forEach(w => w._isActive = false);
    }

    @HostListener('window:blur', ['$event'])
    private onBlur(event?) {
        this.blurAllWindows();
    }


    drop(evt: CdkDragDrop<string[]>) {
    }

    closeWindow(window: WindowData, evt?: MouseEvent) {

    }
    minimizeWindow(window: WindowData, evt?: MouseEvent) {

    }
    maximizeWindow(window: WindowData, evt?: MouseEvent) {

    }
    collapseWindow(window: WindowData, evt?: MouseEvent) {

    }
    expandWindow(window: WindowData, evt?: MouseEvent) {

    }

    activateWindow(window: WindowData, evt?: MouseEvent) {
        this.blurAllWindows();
        window._isActive = true;
    }

    onDragEnd(window: WindowData, evt?: CdkDragRelease) {

    }
}
