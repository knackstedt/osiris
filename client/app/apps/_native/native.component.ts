import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { XpraClient, XpraWindowManager, XpraWindowManagerWindow } from 'xpra-html5-client';
import { ManagedWindow } from 'client/app/services/window-manager.service';
import { Fetch } from '../../services/fetch.service';
import { ResizeEvent } from 'angular-resizable-element';


@Component({
    templateUrl: './native.component.html',
    styleUrls: ['./native.component.scss']
})
export class NativeComponent implements  AfterViewInit {

    //   const { wm, dispatch, xpra } = useContext(AppContext)
    // winstance = wm.getWindow(id) as XpraWindowManagerWindow


    @ViewChild("xpra") xpraRef: ElementRef<HTMLDivElement>;

    @Input() windowRef: ManagedWindow;
    @Input() data: any;
    private _win: XpraWindowManagerWindow;

    private static worker: Worker;
    private static decoder: Worker;
    private static xpra: XpraClient;
    private static vm: XpraWindowManager;
    private static isInitialized = false;

    windows: XpraWindowManagerWindow[] = [];

    constructor(private fetch: Fetch) {

        // vm.setDesktopElement(document.querySelector("#app"));


        // const client = new XpraClient({
        //     uri: 'ws://localhost:10000',
        //     sound: false,
        //     username: 'username',
        //     password: 'password',
        //     passwords: [],
        //     autologin: true,
        //     bandwidth_limit: 0
        // });
        console.log("_native app loader");
        console.log(this.windowRef, this.data);
    }
    
    // onFileUpload = async () => {
    //     const files = await browserLoadFile()
    //     files.forEach(({ buffer, name, size, type }) =>
    //         xpra.sendFile(name, type, size, buffer)
    //     )
    // }

    async ngAfterViewInit() {
        //wm.close(winstance)
        //wm.minimize(winstance)
        //xx.maximize(winstance)
        
        if (!NativeComponent.isInitialized) 
            await NativeComponent.init();

        NativeComponent.xpra.on('newWindow', evt => {
            console.log("__newWindow", evt);
            const win = NativeComponent.vm.getWindow(evt.id);
            this.windows.push(win);

            win.canvas.onmousedown = e => NativeComponent.vm.mouseButton(null, e, true);
            win.canvas.onmouseup = e => NativeComponent.vm.mouseButton(null, e, false);
            win.canvas.onmousemove = e => NativeComponent.vm.mouseMove(null, e);

            this.xpraRef.nativeElement.onmousedown = e => NativeComponent.vm.mouseButton(null, e, true);
            this.xpraRef.nativeElement.onmouseup = e => NativeComponent.vm.mouseButton(null, e, false);
            this.xpraRef.nativeElement.onmousemove = e => NativeComponent.vm.mouseMove(null, e);

            // win.canvas.onmousedown = e => NativeComponent.vm.mouseButton(null, e, true);
            // win.canvas.onmousedown = e => NativeComponent.vm.mouseButton(null, e, true);
            // win.canvas.onmousedown = e => NativeComponent.vm.mouseButton(null, e, true);
            // win.canvas.onmousedown = e => NativeComponent.vm.mouseButton(null, e, true);

            // Object.assign(win.canvas.style, {
            //     width: `${this.windowRef.width}px`,
            //     height: `${this.windowRef.height}px`,
            // });
        })

        NativeComponent.xpra.on('connect', () => {
            // console.log('connected to host');

            NativeComponent.xpra.sendStartCommand("gedit", "nautilus", false);

        });


        // xpra.sendStartCommand(entry.name, entry.exec, false)
        // NativeComponent.xpra.sendStartCommand(entry.name, entry.exec, false)
        
        // NativeComponent.vm.createWindow({
        //     id: 1,
        //     clientProperties: {
        //         command: "gedit"
        //     },
        //     dimension: [600, 400],
        //     metadata: {
        //         "class-instance": [],
        //         "window-type": ["DESKTOP"],
        //         title: "Lemons R us",
        //     },
        //     overrideRedirect: true,
        //     position: [64, 64]
        // });

        // const win = this._win = NativeComponent.vm.getWindow(1);

        // this.xpraRef.nativeElement.appendChild(win.canvas);

        // NativeComponent.vm.keyPress
    }

    /**
     * TODO: Move to service
     */
    static async init() {

        NativeComponent.worker = new Worker(new URL("../../workers/xpra-worker.worker", import.meta.url));
        NativeComponent.decoder = new Worker(new URL("../../workers/xpra-decoder.worker", import.meta.url));

        const xpra = NativeComponent.xpra = new XpraClient({ 
            worker: NativeComponent.worker, 
            decoder: NativeComponent.decoder 
        });

        const vm = NativeComponent.vm = new XpraWindowManager(xpra);

        await xpra.init();
        vm.init();

        // ???
        const wmEl = document.querySelector(".windowManager") as HTMLElement;
        NativeComponent.vm.setDesktopElement(wmEl);

        // xpra.on('disconnect', () => console.warn('disconnected from host'));
        // xpra.on('error', (message) => console.error('connection error', message));
        // xpra.on('sessionStarted', () => console.info('session has been started'));

        // this.vm.setDesktopElement(document.body);

        xpra.on('connect', evt => console.log("__connect", evt))
        xpra.on('disconnect', evt => console.log("__disconnect", evt))

        xpra.on('removeWindow', evt => console.log("__removeWindow", evt))
        xpra.on('windowIcon', evt => console.log("__windowIcon", evt))
        xpra.on('pong', evt => console.log("__pong", evt))
        xpra.on('cursor', evt => console.log("__cursor", evt))
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
    }

    OnResizeStart() {

    }

    OnResize() {
        const window: XpraWindowManagerWindow = null;
        // this.xpra.set;
        // this.vm.setDesktopElement

        // this.xpra.sendConfigureWindow(
        //     window.attributes.id,
        //     window.attributes.position,
        //     window.attributes.dimension,
        //     {},
        //     {},
        //     false
        // );

        // this.vm.raise(window);
    }

    getUrl() {
        return [

            // "lib/xpra/index.html"
        ].join("&")
    }

    // // !! These may need to be on the canvas element...
    // @HostListener("window:pointerdown", ["$event"])
    // @HostListener("window:pointerup", ["$event"])
    // onDesktopPointerEvent(evt) {
    //     // console.log("EVT pointer -- win")
    //     NativeComponent.vm.mouseButton(null, evt, true);
    // }

    // @HostListener("pointerdown", ["$event"])
    // @HostListener("pointerup", ["$event"])
    // @HostListener("mouseup", ["$event"])
    // @HostListener("mousedown", ["$event"])
    // onPointerEvent(evt: PointerEvent) {
    //     // console.log("EVT pointer", evt)
    //     NativeComponent.vm.mouseButton(this._win, evt, evt.buttons != 0);
    // }

    // @HostListener("pointermove", ["$event"])
    // @HostListener("mousemove", ["$event"])
    // onPointerMove(evt: PointerEvent) {
    //     // console.log("EVT pointer move")
    //     NativeComponent.vm.mouseMove(this._win, evt);
    // }

    // @HostListener("keypress", ["$event"])
    // onKeypress(evt: KeyboardEvent) {
    //     // console.log("EVT pointer move")
    //     NativeComponent.vm.keyPress(this._win, evt, true);
    // }

    // @HostListener("resize", ["$event"])
    // onResize(evt: ResizeEvent) {
    //     // console.log("evt_resize")
    //     NativeComponent.vm.moveResize(this._win, [
    //         this.windowRef.x,
    //         this.windowRef.y
    //     ], [
    //         this.windowRef.width,
    //         this.windowRef.height
    //     ]);
    // }
}
