import { Portal, ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Injectable, EventEmitter } from '@angular/core';
import { WindowOptions } from 'client/types/window';
import { BehaviorSubject } from 'rxjs';
import { AppId, ApplicationLoader, Apps } from '../applications';
import { TaskBarData } from '../components/taskbar/taskbar.component';
import { CdkDragRelease } from '@angular/cdk/drag-drop';
import { FileDescriptor } from '../apps/filemanager/filemanager.component';

const managedWindows: ManagedWindow[] = [];

const isImage = /\.(png|jpe?g|gif|tiff|jfif|webp|svg|ico)$/;
const isAudio = /\.(wav|mp3|ogg|adts|webm|flac)$/;
const isVideo = /\.(mp4|webm|ogv)$/;
const isArchive = /\.(7z|zip|rar|tar\.?(gz|xz)?)$/;
type FileType = "image" | "text" | "video" | "archive" | "binary" | "mixed";


@Injectable({
    providedIn: 'root'
})
export class WindowManagerService extends BehaviorSubject<ManagedWindow[]> {

    private static registeredInstances: WindowManagerService[] = [];

    public managedWindows = managedWindows;
    public taskbarItems: TaskBarData[] = [];

    constructor() {
        super([]);

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
        let taskbarItem = this.taskbarItems.find(t => t.appId == cfg.appId);

        // If not, create one
        if (!taskbarItem)
            this.taskbarItems.push(taskbarItem = { appId: cfg.appId, windows: [], _isActive: false, _isHovered: false });

        // Lastly add to the taskbar item.
        taskbarItem.windows.push(window);

        this.next(this.managedWindows);
    }

    public closeWindow(id: number) {
        WindowManagerService.closeWindow(id);
        this.next(this.managedWindows);
    }

    public static closeWindow(id: number) {
        // Get the instance of the window manager.
        const instance = this.registeredInstances.find(ri => ri.managedWindows.find(mw => mw.id == id));

        // Remove the window from the managed windows list.
        instance.managedWindows.splice(instance.managedWindows.findIndex(mw => mw.id == id), 1);

        // Get the corresponding taskbar group.
        let taskbarGroup = instance.taskbarItems.find(taskbar => taskbar.windows.find(w => w.id == id));

        // Remove the window from the taskbar group.
        taskbarGroup.windows.splice(taskbarGroup.windows.findIndex(w => w.id == id), 1);

        // If the taskbar group is now empty, purge it.
        if (taskbarGroup.windows.length == 0) 
            instance.taskbarItems.splice(instance.taskbarItems.findIndex(tb => tb.appId == taskbarGroup.appId), 1);
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

    private getMimetype(file: FileDescriptor) {
        return (isImage.test(file.name) && "image") ||
            (isAudio.test(file.name) && "video") ||
            (isVideo.test(file.name) && "video") ||
            (isArchive.test(file.name) && "archive") ||
            (file.stats.size > 2 * 1024 * 1024 && "binary") ||
            ("text")
    }

    openFiles(files: FileDescriptor | FileDescriptor[]) {

        const fileArr = Array.isArray(files) ? files : [files];

        // Use a map to deduplicate and get a discrete count of 
        // total mimetypes provided.
        let m = {};
        fileArr.map(d => this.getMimetype(d)).forEach(k => {
            m[k] = true;
        });

        const types = Object.keys(m);

        const isMixed = types.length > 1;
        let fileType: FileType;
        if (isMixed) {
            // Prompt saving as list
            // downloading as (tar/zip/7z/rar)
            // open with other application (...)
            // move -> new location
            fileType = "mixed";
        }
        else {
            fileType = types[0] as any;
            // Single file, can very safely open whatever dialog we need for this.
        }

        // Open dialog!

        switch(fileType) {
            case "image": { return this.openWindow("image-viewer", files) }
            case "video": { return this.openWindow("video-player", files) }
            // case "archive": { return this.openWindow("", files) }
            case "text": { return this.openWindow("code-editor", files) }
            // case "mixed": 
            // case "binary": { this.openWindow("", files) }
        }
        return null;
    }

    downloadFile() {
        // let a = document.createElement("a");

        // a.setAttribute("href", this.getLink());
        // a.setAttribute("download", this.data.file);

        // a.click();
        // a.remove();
    }
}


export class ManagedWindow {
    private static windowIdCounter = 0;
    private static windowZindexCounter = 0;

    id = ManagedWindow.windowIdCounter++;
    appId: string;

    title = "Osiris Application";
    icon = "assets/icons/dialog-information-symbolic.svg";
    description = "";

    x = 100;
    y = 100;    
    
    isResizable = true;
    isDraggable = true;
    
    maxWidth = "100vw";
    minWidth = "300px"; 
    width = 800;
    
    maxHeight = "100vh";
    minHeight = "200px";
    height = 600;
    
    data: any = {}; 

    _isCollapsed = false;
    _isMaximized = false;
    _isActive = false;
    _isLoading = false;
    _index = ManagedWindow.windowZindexCounter++; // z-index
    _isDraggedOver = false; // is something being dragged in front of this window?

    _portal?: Portal<any>;
    _module?: any;      // The module that gets loaded
    _component?: ComponentRef<any> // the loaded component

    _preview: string;
    _minimizedPreview: string;

    constructor(config: WindowOptions) {
        Object.keys(config).forEach(k => this[k] = config[k]);
        
        const app = Apps.find(a => a.appId == this.appId);
        if (!app)
            throw new Error("Unknown application. Cannot create window");

        this.icon = app.icon;
        this.title = app.title;
        this.description = app.description;

        ApplicationLoader.LoadApplication(this.appId)
            .then(async module => {
                // no module, there is no remote app to load.
                if (!module) {
                    this._isLoading = false;
                    return;
                }
                this._module = module;

                // Parse the APP id so we can do a tolerant match
                const appId = this.appId.toLowerCase().replace(/-/g, '');
                const component = module['ɵmod'].declarations
                    .find(c => {
                        const ccn = c.name.toLowerCase().replace(/-/g, '').replace(/component$/, '');
                        return ccn == appId;
                    });

                if (!component)
                    throw `Could not find appId ${this.appId} on module ${module.name}!`;

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

    emit(name: string, event?: any) {
        // console.log(name, event);
        
        let res = this._component?.instance[name] && this._component.instance[name](event);

        // before and after events should be ignored.
        if (name.startsWith('on'))
            WindowManagerService.writeState();

        return res;
    }

    onError = new EventEmitter();

    /**
     * Close the window.
     */
    async close() {
        let result = await this.emit("beforeClose");

        if (!result) {
            WindowManagerService.closeWindow(this.id);
            this.emit("onClose");
        }
    }

    /**
     * Maximize the window as big as we can 
     */    
    maximize() {
        this.emit("onMaximizeChange", { isMaximized: true });

        this._isMaximized = true;
    }
    /**
     * Restore previous window dimensions
     */
    unmaximize() {
        this.emit("onMaximizeChange", { isMaximized: false });

        this._isMaximized = false;
    }
    /**
     * Collapse the window to the taskbar
     */
    collapse() {
        this.emit("onCollapseChange", { isCollapsed: true });

        this._minimizedPreview = this.getIHTML();
        this._isCollapsed = true;
    }
    
    /**
     * Restore the window from it's collapsed state
     */
    uncollapse() {
        this.emit("onCollapseChange", { isCollapsed: false });

        delete this._minimizedPreview;
        this._isCollapsed = false;
        this._index = ManagedWindow.windowZindexCounter++;
    }

    /**
     * Bring this window to top && grant it context.
     */
    activate() {
        this.blurAllWindows(this);
        this.emit("onActivateChange", { isActivated: true });

        console.log("activate")

        this._isActive = true;
        this._index = ManagedWindow.windowZindexCounter++;
    }

    private blurAllWindows(skip?: ManagedWindow) {
        managedWindows.forEach(w => {
            // Skip if we provide one to ignore
            if ((skip && skip.id != w.id) && w._isActive) {
                w.emit("onActivateChange", { isActivated: false });
                w._isActive = false;
            }
        });
    }
    private getIHTML() {
        return document.querySelector("#window_" + this.id + " .window")?.innerHTML;
    }
}

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
