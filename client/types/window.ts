import { AppId } from 'client/app/applications';

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

    

    x: number,
    y: number
};

export declare interface OnResize {
    /**
     * This method is called when a window gets resized.
     * This is very useful for adjusting layouts based on dimensions.
     */
    // onResize(evt: ResizeEvent): void
}

export declare interface OnResizeStart {
    /**
     * This method is called when the dimensions of a window have 
     * been resized by the user. 
     */
    onResizeStart(evt: MouseEvent): void
}
export declare interface OnResizeEnd {
    /**
     * This method is called when the dimensions of a window have 
     * been resized by the user. 
     */
    onResizeEnd(evt: MouseEvent): void
}

export declare interface OnDrag {
    /**
     * This method is called when a user stops dragging a window.
     * Most windows probably don't need to use this.
     */
    onDrag(evt: MouseEvent): void
}
export declare interface OnDragStart {
    /**
     * This method is called when a user stops dragging a window.
     * Most windows probably don't need to use this.
     */
    onDragStart(evt: MouseEvent): void
}
export declare interface OnDragEnd {
    /**
     * This method is called when a user stops dragging a window.
     * Most windows probably don't need to use this.
     */
    onDragEnd(evt: MouseEvent): void
}

export declare interface OnActivateChange {
    /**
     * Emitted when a window is activated (given context)
     * or deactivated (loses context)
     */
    onActivateChange(evt: {isActivated: boolean}): void
}

export declare interface OnCollapseChange {
    /**
     * Emitted when the collapsed state changes
     */
    onCollapseChange(evt: { isCollapsed: boolean }): void
}

export declare interface OnMaximizeChange {
    /**
     * Emitted when the maximized state changes
     */
    onMaximizeChange(evt: { isMaximized: boolean }): void
}

export declare interface OnClose {
    /**
     * This method is invoked when the window is closed.
     */
    onClose(): void
}
export declare interface BeforeClose {
    /**
     * This allows for the window to activate a confirmation prompt.
     * Will time-out after 3 seconds.
     */
    beforeClose(): boolean | Promise<boolean>
}
