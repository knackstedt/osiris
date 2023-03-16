import { Portal, ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// import { AppId, ApplicationLoader, Apps } from '../applications';
import { TaskBarData } from '../components/taskbar/taskbar.component';
// import { FileDescriptor } from '../apps/filemanager/filemanager.component';
import { XpraWindowManagerWindow, XpraWindowMetadataType } from 'xpra-html5-client';
import { ConfigurationService } from 'client/app/services/configuration.service';

const managedWindows: ManagedWindow[] = [];

const isImage = /\.(png|jpe?g|gif|tiff|jfif|webp|svg|ico)$/;
const isAudio = /\.(wav|mp3|ogg|adts|webm|flac)$/;
const isVideo = /\.(mp4|webm|ogv)$/;
const isArchive = /\.(7z|zip|rar|tar\.?(gz|xz)?)$/;
type FileType = "image" | "text" | "video" | "archive" | "binary" | "mixed";
type FileDescriptor = any;


@Injectable({
    providedIn: 'root'
})
export class WindowManagerService extends BehaviorSubject<ManagedWindow[]> {

    private static registeredInstances: WindowManagerService[] = [];

    public managedWindows = managedWindows;
    public taskbarItems: TaskBarData[] = [];

    constructor(
        private config: ConfigurationService
    ) {
        super([]);

        WindowManagerService.registeredInstances.push(this);
    }

    // public managedWindows$ = new BehaviorSubject<ManagedWindow[]>([]);
    // public taskbarData$ = new BehaviorSubject<ManagedWindow[]>([]);

    public async openWindow(options: WindowConfig, data?) {
        let opts: Partial<WindowConfig> = {};
        if (typeof options.workspace != 'number')
            options.workspace = this.config.currentWorkspace;

        if (typeof options == "string")
            opts.appId = options;
        else
            opts = options;

        opts.data = opts.data || data;

        // this.next(cfg as WindowOptions);

        const window = new ManagedWindow(opts);

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
        WindowManagerService.closeWindow(id);
        this.next(this.managedWindows);
    }

    public static closeWindow(id: string) {
        // Get the instance of the window manager.
        const instance = this.registeredInstances.find(ri => ri.managedWindows.find(mw => mw.id == id));

        // Remove the window from the managed windows list.
        instance.managedWindows.splice(instance.managedWindows.findIndex(mw => mw.id == id), 1);

        // Get the corresponding taskbar group.
        let taskbarGroup = instance.taskbarItems.find(taskbar => taskbar.windows.find(w => w.id == id));

        // Remove the window from the taskbar group.
        taskbarGroup?.windows.splice(taskbarGroup.windows.findIndex(w => w.id == id), 1);

        // If the taskbar group is now empty, purge it.
        if (taskbarGroup?.windows.length == 0)
            instance.taskbarItems.splice(instance.taskbarItems.findIndex(tb => tb.appId == taskbarGroup.appId), 1);

        // Last, purge the actual window if it's native.
        globalThis.XpraService.closeWindow(instance);
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
            // case "image": { return this.openWindow("image-viewer", files) }
            // case "video": { return this.openWindow("video-player", files) }
            // case "archive": { return this.openWindow("", files) }
            // case "text": { return this.openWindow("code-editor", files) }
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


type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
// This excludes methods and private properties.
type OmitFunctions<T> = Pick<T, NonFunctionPropertyNames<T>>;

export type WindowConfig = Partial<OmitFunctions<ManagedWindow>>;

export class ManagedWindow {
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
    _index = ManagedWindow.windowZindexCounter++; // z-index
    _isDraggedOver = false; // is something being dragged in front of this window?
    _isBorderless = false;
    _isSnapTarget = true;

    _instance: Object // the loaded component

    _preview: string;
    _minimizedPreview: string;

    _nativeWindowType: XpraWindowMetadataType[];
    _nativeWindow: XpraWindowManagerWindow;

    constructor(config: WindowConfig) {
        Object.keys(config).forEach(k => this[k] = config[k]);
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

        let res = this._instance[name] && this._instance[name](event);

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
        this._index = ManagedWindow.windowZindexCounter++;

        this.emit("onActivateChange", { isActivated: true });
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
