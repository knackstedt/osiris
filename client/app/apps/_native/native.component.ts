import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { ManagedWindow, Window } from 'client/app/services/window-manager.service';
import { XpraService } from 'client/app/services/xpra.service';
import { Fetch } from '../../services/fetch.service';
import { XpraWindowManagerWindow } from 'xpra-html5-client';
import { OnClose, OnCollapseChange, OnDragEnd, OnMaximizeChange, OnResizeEnd } from 'client/types/window';

@Window()
@Component({
    // selector: 'native',
    templateUrl: './native.component.html',
    styleUrls: ['./native.component.scss']
})
export class NativeComponent implements AfterViewInit, OnCollapseChange, OnMaximizeChange, OnClose, OnDragEnd, OnResizeEnd {
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
        if (!this.windowRef.data)
            throw new Error("Cannot create native window without data reference!");

        this.elementRef.nativeElement.appendChild(this.windowRef.data.canvas);

        // win.canvas.onmousedown = e => this.wm.mouseButton(null, e, true);
        // win.canvas.onmouseup = e => this.wm.mouseButton(null, e, false);
        // win.canvas.onmousemove = e => this.wm.mouseMove(null, e);
        this.updateGeometry();
    }

    private getPos(): [number,number] {
        return [this.windowRef.x, this.windowRef.y];
    }
    private getDim(): [number, number] {
        return [this.windowRef.width, this.windowRef.height];
    }
    private updateGeometry() {
        this.xpraService.wm.moveResize(this.data, this.getPos(), this.getDim());

    }

    onClose(): void {
        this.xpraService.wm.close(this.data);
    }    

    onMaximizeChange(evt): void {
        this.xpraService.wm.maximize(this.data, this.getPos(), this.getDim());        
    }
    
    onCollapseChange(evt: { isCollapsed: boolean; }): void {
        this.xpraService.wm.minimize(this.data);        
    }
    onResizeEnd(evt: MouseEvent): void {
        this.updateGeometry();        
    }
    onDragEnd(evt: MouseEvent): void {
        this.updateGeometry();
    }
    
    // getEvent(evt) {
    //     // debugger
    //     let x = this.data.attributes.position[0] + (evt.clientX - this.windowRef.x);
    //     let y = this.data.attributes.position[1] + (evt.clientY - this.windowRef.y);
    //     return { clientX: x, clientY: y, ...evt}
    // }

    @HostListener("pointerup", ["$event"])
    onPointerUp(evt) {
        this.xpraService.wm.mouseButton(this.data, evt, false);
        // evt.stopPropagation();

    }

    @HostListener("pointerdown", ["$event"])
    onPointerDown(evt: PointerEvent) {
        this.xpraService.wm.mouseButton(this.data, evt, true);

        // evt.stopPropagation();
    }

    @HostListener("pointermove", ["$event"])
    onPointerMove(evt: PointerEvent) {
        this.xpraService.wm.mouseMove(this.data, evt);
        this.xpraService.setHoverTarget(this.data);

        // evt.stopPropagation();
    }

    @HostListener("keypress", ["$event"])
    onKeypress(evt: KeyboardEvent) {
        this.xpraService.wm.keyPress(this.data, evt, true);
    }

    @HostListener("mousewheel", ["$event"])
    onPointerEnter(evt: PointerEvent) {
        this.xpraService.wm.mouseWheel(this.data, evt);
    }

    // @HostListener("pointerleave", ["$event"])
    // @HostListener("blur", ["$event"])
    // onPointerLeave(evt: PointerEvent) {
    //     this.xpraService.setHoverTarget(this.data);
    // }

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
