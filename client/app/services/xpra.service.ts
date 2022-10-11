import { HostListener, Injectable } from '@angular/core';
import { XpraClient, XpraWindowManager, XpraWindowManagerWindow } from 'xpra-html5-client';
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

        // ???
        const wmEl = document.querySelector(".windowManager") as HTMLElement;
        this.wm.setDesktopElement(wmEl);

        wmEl.onmousedown = evt => {
            this.wm.mouseButton(null, evt, true)
        };

        wmEl.onmousedown = evt => {
            this.wm.mouseButton(null, evt, false)
        };

        // xpra.on('disconnect', () => console.warn('disconnected from host'));
        // xpra.on('error', (message) => console.error('connection error', message));
        // xpra.on('sessionStarted', () => console.info('session has been started'));

        // this.vm.setDesktopElement(document.body);

        xpra.on('connect', evt => console.log("__connect", evt))
        xpra.on('disconnect', evt => console.log("__disconnect", evt))

        xpra.on('windowIcon', evt => console.log("__windowIcon", evt))
        // xpra.on('pong', evt => console.log("__pong", evt))
        xpra.on('moveResizeWindow', evt => console.log("__moveResizeWindow", evt))
        xpra.on('updateWindowMetadata', evt => console.log("__updateWindowMetadata", evt))
        xpra.on('raiseWindow', evt => console.log("__raiseWindow", evt))
        xpra.on('initiateMoveResize', evt => console.log("__initiateMoveResize", evt))
        xpra.on('showNotification', evt => console.log("__showNotification", evt))
        xpra.on('hideNotification', evt => console.log("__hideNotification", evt))
        xpra.on('pointerPosition', evt => console.log("__pointerPosition", evt))
        xpra.on('newTray', evt => console.log("__newTray", evt))
        xpra.on('updateXDGMenu', evt => console.log("__updateXDGMenu", evt))
        xpra.on('error', evt => console.error("__error", evt))
        xpra.on('sessionStarted', () => console.log("__sessionStarted"))
        xpra.on('challengePrompt', evt => console.log("__challengePrompt", evt))


        xpra.connect('ws://localhost:3300', {
            mouse: true
            // username: 'user',
            // password: 'pass',
        });


        this.xpra.on('newWindow', evt => {
            console.log("__newWindow", evt);
            const win = this.wm.getWindow(evt.id);
            this.windowManager.openWindow({
                appId: "native",
                data: win,
                width: win.attributes.dimension[0],
                height: win.attributes.dimension[1],
                title: win.attributes.metadata.title,
                // _windowStyle: win.attributes.metadata['window-type']
            })
        })

        // In the case of closing a window in the outer frame, this will be invoked redundantly.
        xpra.on('removeWindow', evt => {
            const window = this.windowManager.managedWindows.find(w => w.data.attributes.id == evt);

            if (window)
                this.windowManager.closeWindow(window.id);
        })

        xpra.on('cursor', evt => {
            this.hoverWindow.customCss = evt ? `cursor: url(${evt.image}), auto` : '';
        })

        xpra.on('connect', () => {
            console.log('connected to host');

            setTimeout(() => {
                this.xpra.sendStartCommand("gedit", "nautilus", false);
                this.xpra.sendStartCommand("gedit", "gedit", false);
                this.xpra.sendStartCommand("gedit", "code", false);

            }, 5000)
            // this.xpra.sendStartCommand("gedit", "nautilus", false);

            // this.xpra.sendGeometryWindow
        });
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