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

/**
 * This method is called when a window gets resized.
 * This is very useful for adjusting layouts based on dimensions.
 */
export declare interface OnResize {
    // onResize(evt: ResizeEvent): void
}

/**
 * This method is called when the dimensions of a window have 
 * been resized by the user. 
 */
export declare interface OnResizeStart {
    onResizeStart(evt: MouseEvent): void
}
/**
 * This method is called when the dimensions of a window have 
 * been resized by the user. 
 */
export declare interface OnResizeEnd {
    onResizeEnd(evt: MouseEvent): void
}

/**
 * This method is called when a user stops dragging a window.
 * Most windows probably don't need to use this.
 */
export declare interface OnDrag {
    onDrag(evt: MouseEvent): void
}
/**
 * This method is called when a user stops dragging a window.
 * Most windows probably don't need to use this.
 */
export declare interface OnDragStart {
    onDragStart(evt: MouseEvent): void
}
/**
 * This method is called when a user stops dragging a window.
 * Most windows probably don't need to use this.
 */
export declare interface OnDragEnd {
    onDragEnd(evt: MouseEvent): void
}

/**
 * Emitted when a window is activated (given context)
 * or deactivated (loses context)
 */
export declare interface OnActivateChange {
    onActivateChange(evt: {isActivated: boolean}): void
}

/**
 * Emitted when the collapsed state changes
 */
export declare interface OnCollapseChange {
    onCollapseChange(evt: { isCollapsed: boolean }): void
}

/**
 * Emitted when the maximized state changes
 */
export declare interface OnMaximizeChange {
    onMaximizeChange(evt: { isMaximized: boolean }): void
}

/**
 * This method is invoked when the window is closed.
 */
export declare interface OnClose {
    onClose(): void
}
/**
 * This allows for the window to activate a confirmation prompt.
 * Will time-out after 3 seconds.
 */
export declare interface beforeClose {
    beforeClose(): boolean | Promise<boolean>
}
