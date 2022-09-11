import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type WindowData = {
    title: string,
    icon: string,
    app: string,
    description: string,

    width: number,
    height: number,


    _isCollapsed: boolean,
    _isMaximized: boolean,
    _isActive: boolean,
    _dragPosition: {
        x: number,
        y: number
    }
};

@Injectable({
    providedIn: 'root'
})
export class WindowManagerService extends Subject<any> {

    constructor() { super() }

    createWindow(args) {
        
    }
    destroyWindow(args) {

    }
}
