import { ComponentType, Portal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type WindowOptions = {
    /**
     * Title of the application (how it shows in the menu)
     */
    title: string,
    /**
     * Icon url/base64/etc
     */
    icon: string,
    /**
     * App grouping ID
     */
    appId: string,
    /**
     * A brief description about what the app does
     */
    description: string,
    /**
     * Starting width of a new window
     */
    width: number,
    /**
     * Starting height of a new window
     */
    height: number,
    /**
     * Arbitrary data object that can be passed into the initialized app.
     * Format can be Object/String/Buffer etc.
     */
    data?: any,
    /**
     * Internal app instance Id.
     */
    id: number,

    x: number,
    y: number
};

export type TaskBarData = {
    app: string,
    windows: WindowOptions[]
}

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
