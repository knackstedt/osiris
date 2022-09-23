import { Component, HostListener, Inject, Input, ViewEncapsulation } from '@angular/core';
import { KeyCommand } from 'client/app/services/keyboard.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type ContextMenuItem = {
    /**
     * Label for the menu-item
     */
    label: string,
    /**
     * Callback method that is called when a user activates
     * a context-menu item.
     * Use the `contextMenuData` decorator for passing data.
     */
    action: <T = any>(evt: MouseEvent, data: T) => any,

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
    icon?: string
} | "seperator";


@Component({
    selector: 'app-context-menu',
    templateUrl: './context-menu.component.html',
    styleUrls: ['./context-menu.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ContextMenuComponent {

    public data: any;
    public items: ContextMenuItem[];

    constructor(public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) private _data: any) {
        this.data = _data.data;
        this.items = _data.items;
    }

    onMenuItemClick(item: ContextMenuItem, evt: MouseEvent) {
        if (typeof item == 'string') return;
        item.action(evt, this.data);
        this.close();
    }

    formatLabel(label: string): string {
        return label.replace(/_([a-z0-9])_/i, (match, group) => `<u>${group}</u>`)
    }

    @HostListener("window:resize", ['event'])
    @HostListener("window:blur", ['event'])
    close() {
        this.dialogRef.close();
    }
}
