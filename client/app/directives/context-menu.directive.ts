import { Directive, Input, HostListener, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { KeyCommand } from '../services/keyboard.service';
import { calcMenuItemBounds, ContextMenuComponent } from 'client/app/components/@framework/context-menu/context-menu.component';

type BaseCtx<T = any> = {
    /**
     * Label for the menu-item
     */
    label: string,

    /**
     * Callback method that is called when a user activates
     * a context-menu item.
     * Use the `contextMenuData` decorator for passing data.
     */
    action?: (evt: MouseEvent, data: T) => any,

    /**
     * Callback method that is called upon a context menu activation
     * that when returning false, will disable menu items.
     */
    canActivate?: (data: T) => boolean,

    /**
     * Set whether the menu item appear disabled.
     */
    disabled?: boolean,

    /**
     * If a shortcut is set, the text-label.
     */
    shortcutLabel?: string,

    /**
     * Keyboard shortcut to activate this item.
     */
    shortcut?: KeyCommand,

    /**
     * Path to an icon to render on the left side of the item.
     */
    icon?: string,

    /**
     * Optional child menu
     */
    children?: ContextMenuItem[],

    /**
     * Instead of an array of children, render a template
     */
    childTemplate?: TemplateRef<any>;
    /**
     * Width of child component
     */
    childWidth?: number,
    /**
     * Height of child component
     */
    childHeight?: number,

    seperator?: boolean;
};

export type ContextMenuItem<T = any> =
    BaseCtx<T> |
    "seperator";

@Directive({
    selector: '[contextMenu]',
    standalone: true
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
        private dialog: MatDialog
    ) { }

    // Needs to be public so we can manually open the dialog
    @HostListener('contextmenu', ['$event'])
    public onContextMenu(evt: MouseEvent) {
        evt.preventDefault();

        const { width, height } = calcMenuItemBounds(this.menuItems);

        const cords = {
            top: null,
            left: null,
            bottom: null,
            right: null
        };

        if (evt.clientY + height > window.innerHeight)
            cords.bottom = (window.innerHeight - evt.clientY) + "px";
        if (evt.clientX + width > window.innerWidth)
            cords.right = (window.innerWidth - evt.clientX) + "px";

        if (!cords.bottom) cords.top = evt.clientY + "px";
        if (!cords.right) cords.left = evt.clientX + "px";

        let items = [];
        this.menuItems.forEach((item: ContextMenuItem) => {
            items.push(typeof item == "string" ? item : {
                ...item,
                active: typeof item.canActivate == "function" ? item.canActivate(this.data) : true
            });
        });

        // Create the context menu
        this.dialog.open(ContextMenuComponent, {
            data: {
                data: this.data,
                items: items
            },
            panelClass: "context-menu",
            position: cords,
            backdropClass: "context-menu-backdrop"
        });
    }
}

// Helper to open the context menu without using the directive.
export const openContextMenu = (dialog: MatDialog, menuItems: ContextMenuItem[], data: any, evt: PointerEvent) => {
    const ctx = new ContextMenuDirective(dialog);
    ctx.data = data;
    ctx.menuItems = menuItems;
    ctx.onContextMenu(evt);

    // TODO: is this disposed properly?
};
