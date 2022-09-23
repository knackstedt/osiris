import { Directive, Input, ViewContainerRef, ElementRef, HostListener, TemplateRef } from '@angular/core';
import { ContextMenuItem, ContextMenuComponent } from '../components/context-menu/context-menu.component';
import { MatDialog } from '@angular/material/dialog';

// length in ms for a long touch to activate
const longTouchTime = 600;

@Directive({
    selector: '[contextMenu]'
})
export class ContextMenuDirective {

    /**
     * The data representing the item the context-menu was opened for.
     */
    @Input("contextMenuData") data: any;

    /**
     * The items that will be bound to the context menu.
     */
    @Input("contextMenuItems") menuItems: ContextMenuItem[];

    constructor(
        private element: ElementRef,
        private viewContainerRef: ViewContainerRef,
        private dialog: MatDialog
    ) { 
        
    }

    private calcHeight() {
        return this.menuItems
            .map(i => typeof i == "string" ? 2 : 24)
            .reduce((a, b) => a+b, 0);
    }

    private calcWidth() {

        const items = this.menuItems
            .filter(i => i != "seperator");

        const lName =  (items as any)
            .sort((a, b) => a.label.length - b.label.length)
            .pop().label;
        const lShort = (items as any)
            .sort((a, b) => a.label.length - b.label.length)
            .pop().label;

        // Create dummy div that will calculate the width for us.
        const div = document.createElement("div");
        div.style["font-size"] = "14px";
        div.style["position"] = "absolute";
        div.style["opacity"] = "0";
        div.style["pointer-events"] = "none";
        div.style["left"] = "-1000vw";

        div.innerText = lName + lShort;

        document.body.appendChild(div);

        // Get width
        const w = div.getBoundingClientRect().width;

        // Clear element out of DOM
        div.remove();

        return w;
    }

    @HostListener('contextmenu', ['$event'])
    private onContextMenu(evt: MouseEvent) {
        evt.preventDefault();

        const h = this.calcHeight();
        const w = this.calcWidth();

        const cords = {
            top: null,
            left: null,
            bottom: null,
            right: null
        }

        if (evt.clientY + h > window.innerHeight)
            cords.bottom = (window.innerHeight - evt.clientY) + "px";
        if (evt.clientX + w > window.innerWidth)
            cords.right = (window.innerWidth - evt.clientX) + "px";

        if (!cords.bottom) cords.top = evt.clientY + "px";
        if (!cords.right) cords.left = evt.clientX + "px";

        const dialogRef = this.dialog.open(ContextMenuComponent, {
            data: {
                data: this.data,
                items: this.menuItems
            },
            panelClass: "context-menu",
            position: cords,
            backdropClass: "context-menu-backdrop"
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }

    // private _timer;
    // @HostListener('touchstart', ['$event']) 
    // private onTouchStart(evt) {
    //     this._timer = setTimeout(() => {
    //         if (this._timer) {
    //             clearTimeout(this._timer)
    //             this._timer = null;
    //         }

    //         this.onContextMenu(evt);
    //     }, longTouchTime);
    // } 
    // @HostListener('touchend', ['$event'])
    // private onTouchEnd(evt) {
    //     if (this._timer) {
    //         clearTimeout(this._timer)
    //         this._timer = null;
    //     }
    // }
}
