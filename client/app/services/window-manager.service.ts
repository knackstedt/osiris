import { ComponentType, Portal, ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Injectable, EventEmitter, HostListener } from '@angular/core';
import { WindowOptions } from 'client/types/window';
import { BehaviorSubject } from 'rxjs';
import { ApplicationLoader } from '../applications';
import { TaskBarData } from '../components/taskbar/taskbar.component';
import { CdkDragRelease } from '@angular/cdk/drag-drop';
import { ResizeEvent } from 'angular-resizable-element';
import { FileDescriptor, FSDescriptor } from '../apps/filemanager/filemanager.component';
import { table } from 'console';
import { t } from 'tar';

const managedWindows: ManagedWindow[] = [];

const isImage = /\.(png|jpe?g|gif|tiff|jfif|webp|svg|ico)$/;
const isAudio = /\.(wav|mp3|ogg|adts|webm|flac)$/;
const isVideo = /\.(mp4|webm|ogv)$/;
const isArchive = /\.(7z|zip|rar|tar\.?(gz|xz)?)$/;
type FileType = "image" | "text" | "video" | "archive" | "binary" | "mixed";

export type AppId = "file-manager" | "image-viewer" | "video-viewer" | "code-editor";


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
        WindowManagerService.closeWindow(id);
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
            instance.taskbarItems.splice(instance.taskbarItems.findIndex(tb => tb.app == taskbarGroup.app), 1);
        
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
            case "video": { return this.openWindow("video-viewer", files) }
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
    _module?: any;      // The module that gets loaded
    _component?: ComponentRef<any> // the loaded component

    _initialStyle: string;

    _preview: string;
    _minimizedPreview: string;

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
     */
    close() {
        WindowManagerService.closeWindow(this.id);
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
        this._minimizedPreview = this.getIHTML();
        this._isCollapsed = true;
    }
    
    /**
     * Restore the window from it's collapsed state
     */
    uncollapse() {
        delete this._minimizedPreview;
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
    private getIHTML() {
        return document.querySelector("#window_" + this.id + " .window")?.innerHTML;
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
