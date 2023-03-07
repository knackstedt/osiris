import { Component, ContentChild, HostListener, Input, TemplateRef, ViewEncapsulation } from '@angular/core';
import { ManagedWindow } from '../../services/window-manager.service';
import { WindowToolbarComponent } from './window-toolbar/window-toolbar.component';

@Component({
    selector: 'app-window-template',
    templateUrl: './window-template.component.html',
    styleUrls: ['./window-template.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        WindowToolbarComponent
    ],
    standalone: true
})
export class WindowTemplateComponent {
    @Input() window: ManagedWindow;

    @ContentChild("toolbar", {read: TemplateRef}) toolbar: TemplateRef<any>;
    @ContentChild("content", {read: TemplateRef}) content: TemplateRef<any>;

    @HostListener("pointerdown", ["$event"])
    onPointerDown() {
        this.window.activate();
    }
}
