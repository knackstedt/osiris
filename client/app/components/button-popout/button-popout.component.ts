import { Component, ContentChild, HostListener, Input, OnInit, TemplateRef, ViewEncapsulation, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-button-popout',
    templateUrl: './button-popout.component.html',
    styleUrls: ['./button-popout.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommonModule
    ],
    standalone: true
})
export class ButtonPopoutComponent {
    @Input() img: string;
    @ContentChild("dialogTemplate", { read: TemplateRef }) content: TemplateRef<any>;

    /**
     * An event emitter that can be provided that upon receiving an event, will trigger
     * the popup.
     */
    @Input() triggerOpen: EventEmitter<any>;

    showDialog = false;


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
