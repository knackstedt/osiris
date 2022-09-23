import { ComponentType, Portal, ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Injectable, EventEmitter } from '@angular/core';
import { AppId, WindowOptions } from 'client/types/window';
import { Subject, BehaviorSubject } from 'rxjs';
import { ApplicationLoader } from '../applications';
import { TaskBarData } from '../components/taskbar/taskbar.component';
import { CdkDragRelease } from '@angular/cdk/drag-drop';
import { ResizeEvent } from 'angular-resizable-element';

const managedWindows: ManagedWindow[] = []

@Injectable({
    providedIn: 'root'
})
export class WindowManagerService {

    private static registeredInstances: WindowManagerService[] = [];

    public managedWindows = managedWindows;
    public taskbarItems: TaskBarData[] = [];

    constructor() {
        WindowManagerService.registeredInstances.push(this);
    }

    // public managedWindows$ = new BehaviorSubject<ManagedWindow[]>([]);
    // public taskbarData$ = new BehaviorSubject<ManagedWindow[]>([]);

    public async openWindow(options: Partial<WindowOptions> | AppId, data?) {
        let opts: any = {};
        if (typeof options == "string")
            opts.appId = options;
        else 
            opts = options;

        const cfg = {
            ...{
                appId: "unknown",
                icon: "assets/icons/dialog-question-symbolic.svg",
                description: "No description provided",
                title: "Application",
                width: 300,
                height: 200,
                x: 50,
                y: 50,
            },
            ...opts,
        };
        cfg.data = data || opts.data;

        // this.next(cfg as WindowOptions);

        const window = new ManagedWindow(cfg);

        // Store data in the windows array
        this.managedWindows.push(window);

        // Lookup if we already have a taskbar item
        let taskbarItem = this.taskbarItems.find(t => t.app == cfg.appId);

        // If not, create one
        if (!taskbarItem)
            this.taskbarItems.push(taskbarItem = { app: cfg.appId, windows: [], _isActive: false, _isHovered: false });

        // Lastly add to the taskbar item.
        taskbarItem.windows.push(window);
    }

    public closeWindow(id: number) {

    }

    public blurAllWindows() {
        managedWindows.forEach(w => {
            w._isActive = false;
        });
    }

    public static writeState() {
        // TODO
        // const state = WindowManagerService.registeredInstances;
        // const sState = JSON.stringify(state);
        // console.log("approx. state length", sState.length);

        // history.pushState(sState, null, null);
    }
}


export class ManagedWindow {
    private static windowIdCounter = 0;
    private static windowZindexCounter = 0;

    id: number;
    x = 100;
    y = 100;
    width = 800;
    height = 600;
    data: any = {}; 

    title = "Osiris Application";
    icon = "assets/icons/dialog-information-symbolic.svg";
    description = "";

    _isCollapsed = false;
    _isMaximized = false;
    _isActive = false;
    _isLoading = false;
    _index: number; // z-index
    _isDraggedOver = false; // is something being dragged in front of this window?
    _portal?: Portal<any>;
    _module?: any; // The module that gets loaded
    _component?: ComponentRef<any> // the loaded component
    _initialStyle: string;

    _preview: string;

    // Temp vars for handling resize events
    _x: number;
    _y: number;



    constructor(config: WindowOptions) {
        const data: any = {
            id: ManagedWindow.windowIdCounter++,
            _isCollapsed: false,
            _isMaximized: false,
            _isActive: false,
            _index: ManagedWindow.windowZindexCounter++,
            _isDraggedOver: false,
            _isLoading: true,
            ...config
        };
        Object.keys(data).forEach(k => this[k] = data[k]);

        this._initialStyle = `width: ${data.width}px; height: ${data.height}px;`
        this._x = this.x;
        this._y = this.y;

        ApplicationLoader.LoadApplication(config.appId)
            .then(async module => {
                // no module, there is no remote app to load.
                if (!module) {
                    this._isLoading = false;
                    return;
                }
                this._module = module;

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
                this._portal = new ComponentPortal(component);
                this._isLoading = false;
            });
    }

    toJSON() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            data: this.data,

            title: this.title,
            icon: this.icon,
            description: this.description,

            _isCollapsed: this._isCollapsed,
            _isMaximized: this._isMaximized,
            _isActive: this._isActive,
            _isLoading: this._isLoading,
            _index: this._index, // z-index
        }
    }

    onDragEnd(evt?: CdkDragRelease) {
        const bounds = evt.source.getRootElement().getBoundingClientRect();
        this.x = this._x = bounds.x;
        this.y = this._y = bounds.y;
        this.width = bounds.width;
        this.height = bounds.height;

        this._component?.instance['onDragEnd'] && this._component.instance['onDragEnd'](evt);

        WindowManagerService.writeState();
    }

    onResizing(evt?: ResizeEvent) {
        this.y = this._y + evt.rectangle.top;
        this.x = this._x + evt.rectangle.left - 64;
        this.width = evt.rectangle.width;
        this.height = evt.rectangle.height;

        this._component?.instance['onResize'] && this._component.instance['onResize'](evt);

        WindowManagerService.writeState();
    }

    onResizeEnd(evt?: ResizeEvent) {
        this.height = evt.rectangle.height;
        this.width = evt.rectangle.width;

        this._y = this.y;
        this._x = this.x;

        this._component?.instance['onResizeEnd'] && this._component.instance['onResizeEnd'](evt);

        WindowManagerService.writeState();
    }

    onError = new EventEmitter();

    /**
     * Close the window.
     * @deprecated **Use the WindowManager.closeWindow method instead**
     */
    close() {
        managedWindows.splice(managedWindows.findIndex(w => w.id == this.id), 1);
    }
    /**
     * Maximize the window as big as we can 
     */    
    maximize() {
        this._isMaximized = false;
    }
    /**
     * Restore previous window dimensions
     */
    unmaximize() {
        this._isMaximized = true;
    }
    /**
     * Collapse the window to the taskbar
     */
    collapse() {
        this._isCollapsed = true;
    }
    /**
     * Restore the window from it's collapsed state
     */
    uncollapse() {
        this._isCollapsed = false;
        this._index = ManagedWindow.windowZindexCounter++;
    }

    /**
     * Bring this window to top && grant it context.
     */
    activate() {
        this.blurAllWindows();
        this._isActive = true;
        this._index = ManagedWindow.windowZindexCounter++;



        if (this._isCollapsed) {
            // TODO: re-activate window
        }
    }

    private blurAllWindows() {
        managedWindows.forEach(w => {
            w._isActive = false;
        });
    }
}

/**
 * Catch lifecycle hook errors on the window contents and send them to
 * the parent Window instance
 */
export function CatchErrors(): Function {

    return (decoratedClass): any => {
        // find the names of all methods of that class
        const properties: Array<string> = Object.getOwnPropertyNames(decoratedClass.prototype);
        const methodsNames = properties.filter((propertyName): boolean => {
            return typeof decoratedClass.prototype[propertyName] === 'function';
        });

        // Wrap all methods to handle whatever errors are emitted
        for (const methodsName of methodsNames) {
            decoratedClass.prototype[methodsName] = new Proxy(decoratedClass.prototype[methodsName], {
                apply: (method, component, args): void => {

                    try {
                        return method.apply(component, args);
                    } 
                    catch (error) {
                        if (error.stack) {
                            const lines = error.stack.split('\n');
                            const match = lines[1].match(/ (?<name>[a-zA-Z][a-zA-Z0-9]+)\.(?<func>ngOnInit) /);
                            const { name, func } = match?.groups;
                            if (name.endsWith("Component")) {
                                
                                // intercept the error
                                if (func == "ngOnInit")
                                    return component.__onError?.next(error);
                            }
                            // else if (name.endsWith("Module")) {

                            // }
                        }
                        throw error;
                    }
                },
            });
        }

        decoratedClass.prototype.__onError = new BehaviorSubject(null);
    };
}
