import { Component, OnInit, Input, HostListener, ContentChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'gtk-icon-button',
    templateUrl: './icon-button.component.html',
    styleUrls: ['./icon-button.component.scss'],
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule
    ],
    standalone: true
})
export class GtkIconButtonComponent {

    @Input() fontIcon: string;
    @ContentChild("dialogTemplate", { read: TemplateRef }) content: TemplateRef<any>;

    @Output() click = new EventEmitter();

    showDialog = false;

    onClick() {
        if (this.content)
            this.showDialog = !this.showDialog;

        this.click.emit();
    }


    @HostListener("blur", ["$event"])
    @HostListener("resize", ["$event"])
    clearDialog(evt: any) {
        this.showDialog = false;
    }

    @HostListener("window:click", ["$event"])
    otherClick(evt: any) {
        if (!this.checkForParentNode("APP-BUTTON-POPOUT", evt.target))
            this.showDialog = false;
    }

    /**
     * Returns true if ANY of the ancestor nodes match the specified test.
     * @param test node name to match. e.g. "APP-MY-COMPONENT"
     * @param currentNode starting Element to search from
     * @returns boolean
     */
    private checkForParentNode(test: string, currentNode: Element) {
        if (!currentNode) return;

        if (currentNode.nodeName == "BODY" || currentNode.nodeName == "HTML")
            return false;
        else if (currentNode.nodeName == test.toUpperCase())
            return true;
        else
            return this.checkForParentNode(test, currentNode.parentElement);
    }

}
