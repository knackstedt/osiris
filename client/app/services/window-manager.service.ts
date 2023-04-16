import { Portal, ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// import { AppId, ApplicationLoader, Apps } from '../applications';
import { TaskBarData } from '../components/taskbar/taskbar.component';
// import { FileDescriptor } from '../apps/filemanager/filemanager.component';
import { XpraWindowManagerWindow, XpraWindowMetadataType } from 'xpra-html5-client';
import { ConfigurationService } from 'client/app/services/configuration.service';
import Dexie, { Table } from 'dexie';
import { RegisteredApplications } from 'client/app/app.registry';


class WindowDatabase extends Dexie {
    public windows!: Table<ManagedWindow, number>; // id is number in this case

    public constructor() {
        super("WindowDatabase");
        this.version(1).stores({
            windows: "++id,appId,workspace"
        });
    }
}

@Injectable({
    providedIn: 'root'
})
export class WindowManagerService extends BehaviorSubject<WindowInstance[]> {

    public managedWindows: WindowInstance[] = [];
    public taskbarItems: TaskBarData[] = [];

    db = new WindowDatabase();

    constructor(
        private config: ConfigurationService
    ) {
        super([]);

        window.addEventListener("unload", async e => {
            await this.db.windows.bulkAdd(this.managedWindows);
        });
    }

    public async openWindow(options: WindowConfig, data?) {
        let opts: Partial<WindowConfig> = {};
        if (typeof options.workspace != 'number')
            options.workspace = this.config.currentWorkspace;

        if (typeof options == "string")
            opts.appId = options;
        else
            opts = options;

        opts.data = opts.data || data;

        const window = new WindowInstance(this, opts);

        // Store data in the windows array
        this.managedWindows.push(window);
        this.next(this.managedWindows);

        // If this is a tooltip or otherwise a modal popup, don't add it into the taskbar.
        if (opts.appId == 'native' && !(
                opts.data.attributes.metadata['window-type'].includes("DESKTOP") ||
                opts.data.attributes.metadata['window-type'].includes("NORMAL")
            ))
            return;

        // Grouping for like xpra windows
        if (opts.appId == "native" && opts._nativeWindow.attributes.metadata['class-instance']) {
            const id = opts._nativeWindow.attributes.metadata['class-instance']?.join('_');

            if (!id) {
                // ! Should we destroy the window in this case?
                // Unclear why windows that are "NORMAL" would ever be like this.
                return;
            }

            // Lookup if we already have a taskbar item
            let taskbarItem = this.taskbarItems.find(t => t.appId == id);

            // If not, create one
            if (!taskbarItem)
                this.taskbarItems.push(taskbarItem = { appId: id, windows: [], _isActive: false, _isHovered: false });

            // Lastly add to the taskbar item.
            taskbarItem.windows.push(window);
            return;
        }

        // Lookup if we already have a taskbar item
        let taskbarItem = this.taskbarItems.find(t => t.appId == opts.appId);

        // If not, create one
        if (!taskbarItem)
            this.taskbarItems.push(taskbarItem = { appId: opts.appId, windows: [], _isActive: false, _isHovered: false });

        // Lastly add to the taskbar item.
        taskbarItem.windows.push(window);

    }

    public closeWindow(id: string) {

        // Remove the window from the managed windows list.
        this.managedWindows.splice(this.managedWindows.findIndex(mw => mw.id == id), 1);

        // Get the corresponding taskbar group.
        let taskbarGroup = this.taskbarItems.find(taskbar => taskbar.windows.find(w => w.id == id));

        // Remove the window from the taskbar group.
        taskbarGroup?.windows.splice(taskbarGroup.windows.findIndex(w => w.id == id), 1);

        // If the taskbar group is now empty, purge it.
        if (taskbarGroup?.windows.length == 0)
            this.taskbarItems.splice(this.taskbarItems.findIndex(tb => tb.appId == taskbarGroup.appId), 1);

        // Last, purge the actual window if it's native.
        // globalThis.XpraService.closeWindow(instance);
        this.next(this.managedWindows);
    }

    public blurAllWindows() {
        this.managedWindows.forEach(w => {
            w._isActive = false;
        });
    }
}


type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
// This excludes methods and private properties.
type OmitFunctions<T> = Pick<T, NonFunctionPropertyNames<T>>;

export type WindowConfig = Omit<Partial<OmitFunctions<WindowInstance>>, 'id' | 'zindex' | '_instance'>;

class WindowInstance {
    private static windowZindexCounter = 0;

    // This is simply a unique identifier used to pick this out
    readonly id = crypto.randomUUID();

    workspace: number;
    appId: string;

    // Instance of the angular component
    instance: Object;

    title = "Osiris Application";
    icon = "assets/icons/dialog-information-symbolic.svg";
    description = "";

    x = 100;
    y = 100;
    center = false;

    isResizable = true;
    isDraggable = true;

    maxWidth = "100vw";
    minWidth = 300;
    width = 800;

    maxHeight = "100vh";
    minHeight = 200;
    height = 600;

    customCss: string = "";

    data: any = {};

    _isCollapsed = false;
    _isMaximized = false;
    _isActive = false;
    _isLoading = false;
    zindex = WindowInstance.windowZindexCounter++; // z-index
    _isDraggedOver = false; // is something being dragged in front of this window?
    _isBorderless = false;
    _isSnapTarget = true;

    _instance: Object // the loaded component

    _preview: string;
    _minimizedPreview: string;

    _nativeWindowType: XpraWindowMetadataType[];
    _nativeWindow: XpraWindowManagerWindow;

    constructor(
        private windowManager: WindowManagerService,
        config: WindowConfig
    ) {
        if (!config.appId) throw new Error("Cannot create a window without specifying an appId");

        Object.keys(config).forEach(k => this[k] = config[k]);

        const app = RegisteredApplications.find(a => a.id == config.appId);
        this.title = config.title || (app ? app['label'] : config.appId);
    }

    onInit(instance) {
        this._instance = instance;
        // const app = null;//Apps.find(a => a.appId == this.appId);
        // if (!app)
        //     throw new Error("Unknown application. Cannot create window");

        this.icon = this.icon;
        this.title = this.title;
        this.description = this.description;

        if (this.appId == "native") {
            const data = this._nativeWindow;

            const isDesktop = data?.attributes?.metadata['window-type'].includes("DESKTOP");
            const isNormal = data?.attributes?.metadata['window-type'].includes("NORMAL");

            const isModal = !isDesktop && !isNormal;

            if (isModal) {
                this.isResizable = false;
                this.isDraggable = false;
            }
        }
    }

    toJSON() {
        return {
            id: this.id,
            appId: this.appId,
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
            _index: this.zindex, // z-index
        }
    }

    emit(name: string, event?: any) {
        // console.log(name, event);

        let res = this._instance[name] && this._instance[name](event);

        // // before and after events should be ignored.
        // if (name.startsWith('on'))
        //     this.windowManager.writeState();

        return res;
    }

    onError = new EventEmitter();

    /**
     * Close the window.
     */
    async close() {
        let result = await this.emit("beforeClose");

        if (!result) {
            this.windowManager.closeWindow(this.id);
            this.emit("onClose");
        }
    }

    /**
     * Maximize the window as big as we can
     */
    maximize() {
        this._isMaximized = true;

        this.emit("onMaximizeChange", { isMaximized: true });
        this.activate();
    }

    /**
     * Restore previous window dimensions
     */
    unmaximize() {
        this._isMaximized = false;

        this.emit("onMaximizeChange", { isMaximized: false });
        this.activate();
    }

    /**
     * Collapse the window to the taskbar
     */
    collapse() {
        this._minimizedPreview = this.getIHTML();
        this._isCollapsed = true;

        this.emit("onCollapseChange", { isCollapsed: true });
    }

    /**
     * Restore the window from it's collapsed state
     */
    uncollapse() {
        delete this._minimizedPreview;
        this._isCollapsed = false;

        this.emit("onCollapseChange", { isCollapsed: false });
        this.activate();
    }

    /**
     * Bring this window to top && grant it context.
     */
    activate() {
        // console.log("Activate window")
        this.blurAllWindows(this);

        this._isActive = true;
        this.zindex = WindowInstance.windowZindexCounter++;

        this.emit("onActivateChange", { isActivated: true });
    }

    private blurAllWindows(skip?: WindowInstance) {
        this.windowManager.managedWindows.forEach(w => {
            // Skip if we provide one to ignore
            if ((skip && skip.id != w.id) && w._isActive) {
                w.emit("onActivateChange", { isActivated: false });
                w._isActive = false;
            }
        });
    }

    getIHTML() {
        const srcEl = this.getWindowElement().querySelector(".window");

        // Native apps are just a canvas, so we can use a screenshot.
        if (this.appId == "native")
            return `<img src="${srcEl.querySelector("canvas").toDataURL() }"/>`;

        return srcEl?.innerHTML;
    }

    getWindowElement() {
        return document.getElementById("window_" + this.id) as HTMLDivElement;
    }

    private hibernationValue: string;
    hibernate() {
        const srcEl = document.getElementById("window_" + this.id + " .window");

        // Native apps are just a canvas, so we can use a screenshot.
        if (this.appId == "native") {

            this.hibernationValue = `<img src="${srcEl.querySelector("canvas").toDataURL()}"/>`;
            return;
        }

        this.hibernationValue = srcEl.innerHTML;
    }
}

export type ManagedWindow = Omit<WindowInstance, ''>;

/**
 * Catch lifecycle hook errors on the window contents and send them to
 * the parent Window instance
 */
export function Window(): Function {

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
                            if (match) {
                                const { name, func } = match?.groups;
                                if (name.endsWith("Component")) {

                                    // intercept the error
                                    if (func == "ngOnInit")
                                        return component.__onError?.next(error);
                                }
                            }
                        }
                        throw error;
                    }
                },
            });
        }

        decoratedClass.prototype.__onError = new BehaviorSubject(null);
    };
}
