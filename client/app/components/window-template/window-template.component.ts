import { Component, ContentChild, HostListener, Input, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ManagedWindow } from '../../services/window-manager.service';

@Component({
    selector: 'app-window-template',
    templateUrl: './window-template.component.html',
    styleUrls: ['./window-template.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class WindowTemplateComponent {

    @Input() window: ManagedWindow;

    @ContentChild("toolbar", {read: TemplateRef}) toolbar: TemplateRef<any>;
    @ContentChild("content", {read: TemplateRef}) content: TemplateRef<any>;

    // @HostListener("window:pointerdown", ["$event"])
    // _1(event) {console.log("pointerdown", event)}
    // @HostListener("window:pointerup", ["$event"])
    // _2(event) { console.log("pointerup", event) }
    // @HostListener("window:pointermove", ["$event"])
    // _3(event) { console.log("pointermove", event) }

    // @HostListener("window:mousedown", ["$event"])
    // _1a(event) { console.log("mousedown", event) }
    // @HostListener("window:mouseup", ["$event"])
    // _2a(event) { console.log("mouseup", event) }
    // @HostListener("window:mousemove", ["$event"])
    // _3a(event) { console.log("mousemove", event) }

    // @HostListener("window:touchstart", ["$event"])
    // _4(event) { console.log("touchstart", event) }
    // @HostListener("window:touchend", ["$event"])
    // _5(event) { console.log("touchend", event) }
    
}
