import { HostListener, Injectable, Directive } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { XpraClient } from '../../xpra/xpra';
import { WindowManagerService, ManagedWindow } from './window-manager.service';
import { ConfigurationService } from './configuration.service';
import { XpraDecoderWorkerHost } from 'client/xpra/decoder';


@Injectable({
    providedIn: 'root'
})
export class XpraService {

    private static services: XpraService[] = [];

    constructor(private windowManager: WindowManagerService, private configuration: ConfigurationService) {
        this.init();

        // Register this service
        XpraService.services.push(this);
    }

    private worker: Worker;
    private decoder: XpraDecoderWorkerHost;
    private drawingQueue: [];

    xpra: XpraClient;
    // wm: XpraWindowManager;

    // windows: XpraWindowManagerWindow[] = [];

    xdgMenu = new BehaviorSubject<any>(null);

    // Startup web workers and connection to server.
    async init() {
        this.xpra = new XpraClient(document.querySelector(".windowManager"), '', '');

        this.xpra.open("xpra-ws");

        this.xpra.execute("New WIndow", "gedit");

        this.xpra.on("windowCreate", (wid) => {
            console.log("Create window", wid)
        })

        this.xpra.on('connected', () => {
            // this.connecting = false
            this.decoder = new XpraDecoderWorkerHost(this.xpra.serverCaps['sound.encoders'])
        });

        this.xpra.on("disconnected", () => {
            this.decoder?.close();
            this.decoder = null;
        });

        this.xpra.on("sound", (...args) => {
            // @ts-ignore
            this.decoder?.sound(...args);
        });
    
        this.xpra.on("windowDraw", ({wid, x, y, srcWidth, srcHeight, encoding, data, seqId, rowStride, options}) => {
            if (this.decoder) {
                const start = performance.now()
                const args = [
                    wid, x, y, srcWidth, srcHeight, encoding, data, seqId, rowStride, options,
                    (message = '') => this.xpra.sendDecoderCallback(seqId, wid, srcWidth, srcHeight, start, message),
                ]
                if (wid in this.decoder.windows)
                    // @ts-ignore
                    this.decoder.draw(...args);
                else {
                    console.info('server sent drawing packet, but the window', wid, 'has not prepared.')
                    // @ts-ignore
                    this.drawingQueue.push(args)
                }
            }
        })
    }

    // private bindEvents() {
    //     const xpra = this.xpra;

    //     // Map event bindings
    //     xpra.on('updateXDGMenu', evt => this.onXDGMenu(evt));
    //     xpra.on('newWindow', evt => this.onNewWindow(evt));
    //     xpra.on('updateWindowMetadata', evt => this.onUpdateWindow(evt));
    //     xpra.on('removeWindow', evt => this.onRemoveWindow(evt));
    //     xpra.on('cursor', evt => this.onCursor(evt));
    //     xpra.on('connect', () => this.onConnect());
    //     xpra.on('disconnect', () => this.onDisconnect());
    //     xpra.on('raiseWindow', evt => this.onRaiseWindow(evt));

    //     xpra.on('pointerPosition', evt => this.onPointerPosition(evt));
    //     xpra.on('challengePrompt', evt => this.onChallengePrompt(evt));

    //     xpra.on('pong', evt => this.onPong(evt))
    //     xpra.on('windowIcon', evt => this.onWindowIcon(evt));
    //     xpra.on('moveResizeWindow', evt => console.log("__moveResizeWindow", evt));
    //     xpra.on('initiateMoveResize', evt => console.log("__initiateMoveResize", evt));
    //     xpra.on('showNotification', evt => console.log("__showNotification", evt));
    //     xpra.on('hideNotification', evt => console.log("__hideNotification", evt));
    //     xpra.on('newTray', evt => console.log("__newTray", evt));
    //     xpra.on('error', evt => console.error("__error", evt));
    //     xpra.on('sessionStarted', () => console.log("__sessionStarted"));


    //     xpra.on('eos', (evt) => console.log("__eos", evt));
    //     xpra.on('infoResponse', (evt) => console.log("__infoResponse", evt));

    //     // draw
    //     // drawScroll
    //     // drawBuffer
    //     // hello
    //     // sendFile
    //     // infoResponse
    //     // newTray
    //     // eos
    //     // bell
    //     // openUrl
    // }

    // onXDGMenu(evt: XpraXDGReducedMenu) {
    //     this.xdgMenu.next(evt);
    // }

    // onConnect() {

    // }

    // onPong(evt: XpraConnectionStats) {
    //     // console.log("pong")
    // }

    // onDisconnect() {

    // }

    // onCursor(evt: XpraCursor) {
    //     if (this.hoverWindow)
    //         this.hoverWindow.customCss = evt ? `cursor: url(${evt.image}), auto` : '';
    // }

    // onNewWindow(evt: XpraWindow) {
    //     // console.log("New Window", evt);

    //     const win = this.wm.getWindow(evt.id);

    //     const isNormal = win.attributes.metadata['window-type'].includes("NORMAL") ||
    //         win.attributes.metadata['window-type'].includes("DESKTOP");

    //     let isBorderless =
    //         win.attributes.metadata['window-type'].includes("DIALOG") ||
    //         win.attributes.metadata['window-type'].includes("MENU") ||
    //         win.attributes.metadata['window-type'].includes("COMBO") ||
    //         win.attributes.metadata['window-type'].includes("POPUP_MENU") ||
    //         win.attributes.metadata['window-type'].includes("TOOLTIP") ||
    //         win.attributes.metadata['window-type'].includes("DROPDOWN");

    //     let isSnapTarget =
    //         !(
    //             win.attributes.metadata['window-type'].includes("COMBO") ||
    //             win.attributes.metadata['window-type'].includes("POPUP_MENU") ||
    //             win.attributes.metadata['window-type'].includes("TOOLTIP") ||
    //             win.attributes.metadata['window-type'].includes("DROPDOWN")
    //         );

    //     let x = evt.position[0];
    //     let y = evt.position[1];
    //     let width = Math.min(window.innerWidth, evt.dimension[0]);
    //     let height = Math.min(window.innerHeight, evt.dimension[1] + (isBorderless ? 0 : this.configuration.windowToolbarHeight));

    //     if (isNormal) {
    //         // Make sure the dialog is not drawn clipping off screen.
    //         x = Math.min(window.innerWidth - width, Math.max(this.configuration.leftOffset, x));
    //         y = Math.min(window.innerHeight - height, Math.max(this.configuration.topOffset, y));
    //     }

    //     this.windowManager.openWindow({
    //         appId: "native",
    //         data: win,
    //         width: width,
    //         height: height,
    //         x: x,
    //         y: y,
    //         title: win.attributes.metadata.title,
    //         _nativeWindowType: win.attributes.metadata['window-type'],
    //         _nativeWindow: win,
    //         _isBorderless: isBorderless,
    //         _isSnapTarget: isSnapTarget
    //         // _windowStyle: win.attributes.metadata['window-type']
    //     })
    // }

    // onUpdateWindow(evt: XpraWindowMetadataUpdate) {
    //     // console.log("update window", evt);
    //     const window = this.windowManager.managedWindows.filter(w => w.appId == "native").find(w => w.data.attributes.id == evt.wid);

    //     if (evt.metadata.maximized == true) {
    //         window.maximize();
    //     }
    //     else if (evt.metadata.maximized == false) {
    //         window.unmaximize();
    //     }

    //     if (evt.metadata.iconic == true) {
    //         window.collapse();
    //     }
    //     else if (evt.metadata.iconic == false) {
    //         window.uncollapse();
    //     }

    //     if (evt.metadata.title)
    //         window.title = evt.metadata.title;

    //     window.title = evt.metadata.title || window.title;
    // }

    // onRemoveWindow(evt: number) {
    //     const window = this.windowManager.managedWindows.filter(w => w.appId == "native").find(w => w.data.attributes.id == evt);

    //     if (window)
    //         this.windowManager.closeWindow(window.id);
    // }

    // onRaiseWindow(evt: number) {
    //     const window = this.windowManager.managedWindows.filter(w => w.appId == "native").find(w => w.data.attributes.id == evt);
    //     window?.activate();
    // }

    // onWindowIcon(evt: XpraWindowIcon) {
    //     const window = this.windowManager.managedWindows.filter(w => w.appId == "native").find(w => w.data.attributes.id == evt.wid);
    //     window.icon = evt.image;
    // }

    // onPointerPosition(evt: XpraPointerPosition) {
    //     console.log("__onPointerPosition", evt);
    // }

    // onChallengePrompt(evt: XpraChallengePrompt) {

    // }

    // hoverTarget: XpraWindowManagerWindow;
    // hoverWindow: ManagedWindow;
    // setHoverTarget(win: XpraWindowManagerWindow) {
    //     this.hoverTarget = win;
    //     this.hoverWindow = this.windowManager.managedWindows.filter(w => w.appId == "native").find(w => w.data.attributes.id == win.attributes.id) || this.hoverWindow;
    // }

    // /** @hidden */
    // static closeWindow(window: ManagedWindow) {
    //     const id = window.data?.attributes?.id;
    //     if (!id) return;

    //     const service = this.services.find(s => s.windows.find(w => w.attributes.id == id));
    //     const winstance = service.windows.find(w => w.attributes.id == id);

    //     if (!winstance)
    //         throw new Error("Could not resolve instance on close request");

    //     service.wm.close(winstance);
    // }
}

globalThis.XpraService = XpraService;