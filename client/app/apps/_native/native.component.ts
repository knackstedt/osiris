import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { ManagedWindow, Window } from 'client/app/services/window-manager.service';
import { XpraService } from 'client/app/services/xpra.service';
import { Fetch } from '../../services/fetch.service';
import { XpraWindowManagerWindow } from 'xpra-html5-client';
import { OnClose, OnCollapseChange, OnDragEnd, OnMaximizeChange, OnResizeEnd } from 'client/types/window';
import { KeyboardService } from '../../services/keyboard.service';
import { EventListenerFocusTrapInertStrategy } from '@angular/cdk/a11y';
import { environment } from '../../../environments/environment';
import { ConfigurationService } from '../../services/configuration.service';

@Window()
@Component({
    // selector: 'native',
    templateUrl: './native.component.html',
    styleUrls: ['./native.component.scss']
})
export class NativeComponent implements AfterViewInit, OnDestroy, OnCollapseChange, OnMaximizeChange, OnClose, OnDragEnd, OnResizeEnd {
    @ViewChild("canvas", {read: ElementRef}) elementRef;
    @Input() windowRef: ManagedWindow;
    @Input() data: XpraWindowManagerWindow;
    
    constructor(
        private fetch: Fetch, 
        public xpraService: XpraService, 
        private keyboard: KeyboardService,
        private configuration: ConfigurationService
        ) {

    }
    
    // onFileUpload = async () => {
    //     const files = await browserLoadFile()
    //     files.forEach(({ buffer, name, size, type }) =>
    //         xpra.sendFile(name, type, size, buffer)
    //     )
    // }

    async ngAfterViewInit() {
        if (!this.data)
            throw new Error("Cannot create native window without data reference!");

        this.elementRef.nativeElement.appendChild(this.data.canvas);
        this.bindEvents();
        this.updateGeometry();
    }

    ngOnDestroy() {
        window.removeEventListener("keydown", (evt) => this.onKeyDown(evt));
        window.removeEventListener("keyup", (evt) => this.onKeyUp(evt));
    }

    private getPos(): [number,number] {
        if (this.windowRef._isMaximized)
            return [
                this.configuration.leftOffset,
                this.configuration.topOffset + (this.windowRef._isBorderless ? 0 : this.configuration.windowToolbarHeight)
            ];

        return [
            this.windowRef.x + this.configuration.leftOffset, 
            this.windowRef.y + (this.windowRef._isBorderless ? 0 : this.configuration.windowToolbarHeight)
        ];
    }
    private getDim(): [number, number] {

        if (this.windowRef._isMaximized)
            return [
                globalThis.innerWidth - (this.configuration.leftOffset + this.configuration.rightOffset), 
                globalThis.innerHeight - (this.configuration.bottomOffset + this.configuration.topOffset + (this.windowRef._isBorderless ? 0 : this.configuration.windowToolbarHeight))
            ];

        this.windowRef.width  = Math.min(this.windowRef.width, window.innerWidth);
        this.windowRef.height = Math.min(this.windowRef.height, window.innerHeight);

        return [this.windowRef.width, this.windowRef.height - (this.windowRef._isBorderless ? 0 : this.configuration.windowToolbarHeight)];
    }
    private updateGeometry() {
        // this.xpraService.wm.moveResize(this.data, this.getPos(), this.getDim());
    }

    private bindEvents() {
        // TODO: offload onto keyboard service
        window.addEventListener("keydown", (evt) => this.onKeyDown(evt));
        window.addEventListener("keyup", (evt) => this.onKeyUp(evt));

        // const el = this.windowRef.getWindowElement();
        // el.onpointerdown = e => e.stopPropagation();
        // el.onpointerup = e => e.stopPropagation();
        // el.onpointermove = e => e.stopPropagation();
    }

    onClose(): void {
        // this.xpraService.wm.close(this.data);
    }    

    onMaximizeChange(evt): void {
        this.updateGeometry();
    }
    
    onCollapseChange(evt: { isCollapsed: boolean; }): void {
        // if (evt.isCollapsed)
        //     this.xpraService.wm.minimize(this.data);
        // else
        //     this.updateGeometry();
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

    @HostListener("mouseup", ["$event"])
    onMouseUp(evt) {
        // this.xpraService.wm.mouseButton(this.data, evt, false);
    }

    @HostListener("mousedown", ["$event"])
    onMouseDown(evt: PointerEvent) {
        this.windowRef.activate();
        // this.xpraService.wm.mouseButton(this.data, evt, true);
    }

    @HostListener("mousemove", ["$event"])
    onPointerMove(evt: PointerEvent) {
        // this.xpraService.setHoverTarget(this.data);
        // this.xpraService.wm.mouseMove(this.data, evt);
    }

    @HostListener("contextmenu", ["$event"])
    onContextMenu(evt: PointerEvent) {
        evt.preventDefault();
    }

    @HostListener("mousewheel", ["$event"])
    onPointerEnter(evt: PointerEvent) {
        // this.xpraService.wm.mouseWheel(this.data, evt);
    }

    /**
     * This is bound on the window level
     */
    onKeyDown(evt: KeyboardEvent) {
        if (this.windowRef._isActive) {
            // this.xpraService.wm.keyPress(this.data, evt, true);
            evt.stopPropagation();
        }
    }
    onKeyUp(evt: KeyboardEvent) {
        if (this.windowRef._isActive) {
            // this.xpraService.wm.keyPress(this.data, evt, false);
            evt.stopPropagation();
        }
    }
}
