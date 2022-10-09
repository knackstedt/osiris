import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { ManagedWindow } from 'client/app/services/window-manager.service';
import { XpraService } from 'client/app/services/xpra.service';
import { Fetch } from '../../services/fetch.service';
import { XpraWindowManagerWindow } from 'xpra-html5-client';


@Component({
    // selector: 'native',
    templateUrl: './native.component.html',
    styleUrls: ['./native.component.scss']
})
export class NativeComponent implements  AfterViewInit {
    @ViewChild("canvas", {read: ElementRef}) elementRef;
    @Input() windowRef: ManagedWindow;
    @Input() data: XpraWindowManagerWindow;
    
    constructor(private fetch: Fetch, public xpraService: XpraService) {

    }
    
    // onFileUpload = async () => {
    //     const files = await browserLoadFile()
    //     files.forEach(({ buffer, name, size, type }) =>
    //         xpra.sendFile(name, type, size, buffer)
    //     )
    // }

    async ngAfterViewInit() {
        this.elementRef.nativeElement.appendChild(this.windowRef.data.canvas);

        // win.canvas.onmousedown = e => this.wm.mouseButton(null, e, true);
        // win.canvas.onmouseup = e => this.wm.mouseButton(null, e, false);
        // win.canvas.onmousemove = e => this.wm.mouseMove(null, e);

        this.xpraService.wm.moveResize(this.data, this.getPos(), this.getDim());
    }

    private getPos(): [number,number] {
        return [this.windowRef.x, this.windowRef.y];
    }
    private getDim(): [number, number] {
        return [this.windowRef.width, this.windowRef.height];
    }

    onMaximizeChange(evt) {
        this.xpraService.wm.maximize(this.data, this.getPos(), this.getDim());
        // this.xpraService.wm.maximize(this.data, this.getPos(), this.getDim());
    }

    onCollapse() {

    }

    onClose() {
        this.xpraService.wm.close(this.data);

    }

    // getEvent(evt) {
    //     // debugger
    //     let x = this.data.attributes.position[0] + (evt.clientX - this.windowRef.x);
    //     let y = this.data.attributes.position[1] + (evt.clientY - this.windowRef.y);
    //     return { clientX: x, clientY: y, ...evt}
    // }

    // !! These may need to be on the canvas element...
    // @HostListener("pointerdown", ["$event"])
    @HostListener("pointerup", ["$event"])
    onDesktopPointerEvent(evt) {
        this.xpraService.wm.mouseButton(this.data, evt, false);
    }

    @HostListener("pointerdown", ["$event"])
    // @HostListener("pointerup", ["$event"])
    // @HostListener("mouseup", ["$event"])
    // @HostListener("mousedown", ["$event"])
    onPointerEvent(evt: PointerEvent) {
        this.xpraService.wm.mouseButton(this.data, evt, true);
    }

    @HostListener("pointermove", ["$event"])
    // @HostListener("mousemove", ["$event"])
    onPointerMove(evt: PointerEvent) {
        this.xpraService.wm.mouseMove(this.data, evt);
    }

    @HostListener("keypress", ["$event"])
    onKeypress(evt: KeyboardEvent) {
        this.xpraService.wm.keyPress(this.data, evt, true);
    }

    // @HostListener("resize", ["$event"])
    // onResize(evt: any) {
    //     // console.log("evt_resize")
    //     this.xpraService.wm.moveResize(this.data, [
    //         this.windowRef.x,
    //         this.windowRef.y
    //     ], [
    //         this.windowRef.width,
    //         this.windowRef.height
    //     ]);
    // }
}
