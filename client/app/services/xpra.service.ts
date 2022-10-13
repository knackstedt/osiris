import { HostListener, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { XpraChallengePrompt, XpraClient, XpraConnectionStats, XpraCursor, XpraPointerPosition, XpraWindow, XpraWindowIcon, XpraWindowManager, XpraWindowManagerWindow, XpraWindowMetadataUpdate, XpraXDGReducedMenu, XPRA_KEYBOARD_LAYOUTS } from 'xpra-html5-client';
import { WindowManagerService, ManagedWindow } from './window-manager.service';


@Injectable({
    providedIn: 'root'
})
export class XpraService {

    private static services: XpraService[] = [];

    constructor(private windowManager: WindowManagerService) { 
        this.init(); 

        // Register this service
        XpraService.services.push(this); 
    }

    private worker: Worker;
    private decoder: Worker;
    xpra: XpraClient;
    wm: XpraWindowManager;

    windows: XpraWindowManagerWindow[] = [];

    xdgMenu = new BehaviorSubject<XpraXDGReducedMenu>(null);

    // Startup web workers and connection to server.
    async init() {

        this.worker = new Worker(new URL("../workers/xpra-worker.worker", import.meta.url));
        this.decoder = new Worker(new URL("../workers/xpra-decoder.worker", import.meta.url));

        const xpra = this.xpra = new XpraClient({
            worker: this.worker,
            decoder: this.decoder
        });

        const vm = this.wm = new XpraWindowManager(xpra);

        await xpra.init();
        vm.init();

        const wmEl = document.querySelector(".windowManager") as HTMLElement;
        // ??? Why do we set this
        this.wm.setDesktopElement(wmEl);

        // ! What are these even supposed to be for?
        // wmEl.onmousedown = evt => this.wm.mouseButton(null, evt, true);
        // wmEl.onmouseup = evt => this.wm.mouseButton(null, evt, false);

        this.bindEvents();

        xpra.connect('ws://localhost:3300', {
            keyboard: true,
            mouse: true,
            keyboardLayout: "us",
            // username: 'user',
            // password: 'pass',
        });
    }

    private bindEvents() {
        const xpra = this.xpra;

        // Map event bindings
        xpra.on('updateXDGMenu', evt => this.onXDGMenu(evt));
        xpra.on('newWindow', evt => this.onNewWindow(evt));
        xpra.on('updateWindowMetadata', evt => this.onUpdateWindow(evt));
        xpra.on('removeWindow', evt => this.onRemoveWindow(evt));
        xpra.on('cursor', evt => this.onCursor(evt));
        xpra.on('connect', () => this.onConnect());
        xpra.on('disconnect', () => this.onDisconnect());
        xpra.on('raiseWindow', evt => this.onRaiseWindow(evt));

        xpra.on('pointerPosition', evt => this.onPointerPosition(evt));
        xpra.on('challengePrompt', evt => this.onChallengePrompt(evt));

        xpra.on('pong', evt => this.onPong(evt))
        xpra.on('windowIcon', evt => this.onWindowIcon(evt));
        xpra.on('moveResizeWindow', evt => console.log("__moveResizeWindow", evt));
        xpra.on('initiateMoveResize', evt => console.log("__initiateMoveResize", evt));
        xpra.on('showNotification', evt => console.log("__showNotification", evt));
        xpra.on('hideNotification', evt => console.log("__hideNotification", evt));
        xpra.on('newTray', evt => console.log("__newTray", evt));
        xpra.on('error', evt => console.error("__error", evt));
        xpra.on('sessionStarted', () => console.log("__sessionStarted"));


        xpra.on('eos', (evt) => console.log("__eos", evt));
        xpra.on('infoResponse', (evt) => console.log("__infoResponse", evt));

        // draw
        // drawScroll
        // drawBuffer
        // hello
        // sendFile
        // infoResponse
        // newTray
        // eos
        // bell
        // openUrl
    }

    onXDGMenu(evt: XpraXDGReducedMenu) {
        this.xdgMenu.next(evt);
    }

    onConnect() {

    }

    onPong(evt: XpraConnectionStats) {
        // console.log("pong")
    }

    onDisconnect() {

    }

    onCursor(evt: XpraCursor) {
        if (this.hoverWindow)
            this.hoverWindow.customCss = evt ? `cursor: url(${evt.image}), auto` : '';
    }

    onNewWindow(evt: XpraWindow) {
        console.log("New Window", evt);

        const win = this.wm.getWindow(evt.id);

        const isDialog = win.attributes.metadata['window-type'].includes("DIALOG");

        let x = evt.position[0];
        let y = evt.position[1];
        let width  = Math.min(window.innerWidth, evt.dimension[0]);
        let height = Math.min(window.innerHeight, evt.dimension[1]);

        if (!isDialog) {
            // Make sure the dialog is not drawn clipping off screen.
            x = Math.min(window.innerWidth - width, Math.max(0, x));
            y = Math.min(window.innerHeight - height, Math.max(0, y));
        }

        this.windowManager.openWindow({
            appId: "native",
            data: win,
            width: width,
            height: height,
            x: x,
            y: y,
            title: win.attributes.metadata.title,
            _nativeWindowType: win.attributes.metadata['window-type'],
            _nativeWindow: win
            // _windowStyle: win.attributes.metadata['window-type']
        })
    }

    private getPos(window: ManagedWindow): [number, number] {
        return [window.x, window.y];
    }
    private getDim(window: ManagedWindow): [number, number] {

        if (window._isMaximized)
            return [globalThis.innerWidth, globalThis.innerHeight];

        window.width = Math.min(window.width, globalThis.innerWidth);
        window.height = Math.min(window.height, globalThis.innerHeight);

        return [window.width, window.height];
    }
    private updateGeometry(window: ManagedWindow) {
        this.wm.moveResize(window._nativeWindow, this.getPos(window), this.getDim(window));
    }

    onUpdateWindow(evt: XpraWindowMetadataUpdate) {
        console.log("update window", evt);
        const window = this.windowManager.managedWindows.find(w => w.data.attributes.id == evt.wid);

        if (evt.metadata.maximized == true) {
            window.maximize();
            this.updateGeometry(window);
        }
        else if (evt.metadata.maximized == false) {
            window.unmaximize();
            this.updateGeometry(window);
        }

        if (evt.metadata.iconic == true) {
            window.collapse();
        }
        else if (evt.metadata.iconic == false) {
            window.uncollapse();
            // this.updateGeometry(window);
        }

        if (evt.metadata.title)
            window.title = evt.metadata.title;

        // window.data.attributes.metadata.decorations
        // Basically if it's NOT undefined or zero, we show the window...?
        // missing => none?
        // 0 => standard????????????????????
        // 126 => full?

        window.title = evt.metadata.title || window.title;
    }

    onRemoveWindow(evt: number) {
        const window = this.windowManager.managedWindows.find(w => w.data.attributes.id == evt);

        if (window)
            this.windowManager.closeWindow(window.id);
    }

    onRaiseWindow(evt: number) {
        const window = this.windowManager.managedWindows.find(w => w.data.attributes.id == evt);
        window?.activate();
    }

    onWindowIcon(evt: XpraWindowIcon) {
        const window = this.windowManager.managedWindows.find(w => w.data.attributes.id == evt.wid);
        window.icon = evt.image;
    }

    onPointerPosition(evt: XpraPointerPosition) {
        console.log("__onPointerPosition", evt);
    }

    onChallengePrompt(evt: XpraChallengePrompt) {

    }

    hoverTarget: XpraWindowManagerWindow;
    hoverWindow: ManagedWindow;
    setHoverTarget(win: XpraWindowManagerWindow) {
        this.hoverTarget = win;
        this.hoverWindow = this.windowManager.managedWindows.find(w => w.data.attributes.id == win.attributes.id) || this.hoverWindow;
    }

    /** @hidden */
    static closeWindow(window: ManagedWindow) {
        const id = window.data?.attributes?.id;
        if (!id) return;

        const service = this.services.find(s => s.windows.find(w => w.attributes.id == id));
        const winstance = service.windows.find(w => w.attributes.id == id);

        if (!winstance)
            throw new Error("Could not resolve instance on close request");

        service.wm.close(winstance);
    }
}
globalThis.XpraService = XpraService;