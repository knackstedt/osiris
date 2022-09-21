import { Directive, Input, ViewContainerRef, ElementRef, HostListener, TemplateRef } from '@angular/core';
import { ContextMenuItem, ContextMenuComponent } from '../components/context-menu/context-menu.component';
import { MatDialog } from '@angular/material/dialog';

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

    @HostListener('contextmenu', ['$event']) 
    onContextMenu(evt: MouseEvent) {
        evt.preventDefault();

        const dialogRef = this.dialog.open(ContextMenuComponent, {
            data: {
                data: this.data,
                items: this.menuItems
            },
            panelClass: "context-menu",
            position: {
                top: evt.clientY + 'px',
                left: evt.clientX + 'px'
            },
            backdropClass: "context-menu-backdrop"
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }
}
