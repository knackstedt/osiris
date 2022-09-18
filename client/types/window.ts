import { Portal } from '@angular/cdk/portal';
import { ComponentRef } from '@angular/core';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { ResizeEvent } from 'angular-resizable-element';

export type AppId = "file-manager" | "file-viewer";


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
    appId: AppId,
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


// export type ManagedWindow = WindowOptions & {
//     _isCollapsed: boolean,
//     _isMaximized: boolean,
//     _isActive: boolean,
//     _isLoading: boolean,
//     _index: number, // z-index
//     _isDraggedOver: boolean, // is something being dragged in front of this window?
//     _portal?: Portal<any>,
//     _module?: any, // The module that gets loaded
//     _component?: ComponentRef<any> // the loaded component
//     _initialStyle: string,


//     _preview: string,
//     // _isTaskbarPreview?: boolean,
//     // _previewTransform: string
//     // _dialogTransform: string,
//     // _preview?: {
//     //     windowWidth: string,
//     //     windowHeight: string,
//     //     margin: string,
//     //     windowPadding: string,
//     //     isFirst: boolean
//     //     isLast: boolean,
//     //     scale: number
//     // }

//     // Temp vars for handling resize events
//     _x: number,
//     _y: number
// }

/**
 * This method is called when a window gets resized.
 * This is very useful for adjusting layouts based on dimensions.
 */
export declare interface OnResize {
    onResize(evt: ResizeEvent): void
}
/**
 * This method is called when a user stops dragging a window.
 * Most windows probably don't need to use this.
 */
export declare interface OnDragEnd {
    onDragEnd(evt: CdkDragEnd): void
}
/**
 * This method is called when the dimensions of a window have 
 * been resized by the user. 
 */
export declare interface OnResizeEnd {
    onResizeEnd(evt: ResizeEvent): void
}

/**
 * This method is invoked when the window is closed.
 * This allows for the window to activate a confirmation prompt.
 * Will time-out after 3 seconds.
 */
export declare interface OnClosing {
    onClosing(): boolean | Promise<boolean>
}
