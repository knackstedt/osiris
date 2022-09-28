import { Component, ContentChild, Input, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
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
}
