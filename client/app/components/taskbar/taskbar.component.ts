import { Component, Input, OnInit } from '@angular/core';
import { ManagedWindow } from 'client/app/services/window-manager.service';
import { WindowManagerService } from '../../services/window-manager.service';

export type TaskBarData = {
  app: string,
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
export class TaskbarComponent implements OnInit {

    constructor(public windowManager: WindowManagerService) { }

    ngOnInit() {
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
        this.windowManager.managedWindows.forEach(w => {
            delete w._preview;
        });
    }

    getIHTML(window: ManagedWindow) {
        return document.querySelector("#window_" + window.id + " .window")?.innerHTML;
    }
}
