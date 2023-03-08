import { Component } from '@angular/core';
import { RootComponent } from 'client/app/root.component';
import { DialogService } from 'client/app/services/dialog.service';
import { ManagedWindow } from 'client/app/services/window-manager.service';
import { WindowManagerService } from '../../services/window-manager.service';

export type TaskBarData = {
  appId: string,
  windows: ManagedWindow[],

  _isHovered: boolean
  _isActive: boolean
  popupHeight?: number,
  popupWidth?: number
}

@Component({
    selector: 'app-taskbar',
    templateUrl: './taskbar.component.html',
    styleUrls: ['./taskbar.component.scss']
})
export class TaskbarComponent {

    favorites: {
        appId: any,//AppId,
        icon: string,
        title: string,
        taskbar?: TaskBarData
    }[] = [];

    constructor(
        private rootComponent: RootComponent,
        public windowManager: WindowManagerService,
        private dialog: DialogService
    ) {

        // Watch for changes to the list of windows
        windowManager.subscribe(data => {

            // this.favorites = [
            //     { appId: "application-menu", icon: "assets/icons/apps/nautilus-symbolic.svg", title: "Show Applications" }
            // ];

            this.favorites.forEach(f => {
                // Update the favorites so we can keep track of active windows.
                let taskbar = windowManager.taskbarItems.find(tb => tb.appId == f.appId);
                f.taskbar = taskbar;
            });

        });
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

        return `scale3d(${scale}, ${scale}, 1) translate3d(${xTx}px, 0px, 0px)`;
        // return `scale3d(${scale}, ${scale}, 1) translate3d(${xTx}px, ${yTx}px, 0px)`;
    }

    showMenu(menu: TaskBarData) {
        menu._isActive = true
        menu.windows.forEach(w => {
            if (w._isCollapsed)
                w._preview = w._minimizedPreview;
            else
                w._preview = this.getIHTML(w);
        });
        console.log("show Menu")
    }

    hideMenu(menu: TaskBarData) {
        menu._isActive = false;
        this.windowManager.managedWindows.forEach(w => {
            delete w._preview;
        });
    }

    getIHTML(window: ManagedWindow) {
        return window.getIHTML();
    }

    isFavorite(item: TaskBarData) {
        return !!this.favorites.find(f => f.appId == item.appId);
    }

    getTaskbarItems(item) {
        return [this.windowManager.taskbarItems.find(tb => tb.appId == item.appId)];
    }

    openApplicationMenu() {
        // For 1920x1080...

        // width // 168px
        // this.dialog.open(AppMenuComponent, {
        //     width: "65.52vw",
        //     height: "66.38vh"
        // });
        this.dialog.open("start-menu");
    }

    activateWindow(window: ManagedWindow) {
        // TODO: optionally add facility to move window to current workspace.

        if (this.rootComponent.currentWorkspace != window.workspace)
            this.rootComponent.selectWorkspace(window.workspace);

        window.uncollapse();
    }
}
