import { Component, ContentChild, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ManagedWindow } from '../../services/window-manager.service';

@Component({
    selector: 'app-window-template',
    templateUrl: './window-template.component.html',
    styleUrls: ['./window-template.component.scss']
})
export class WindowTemplateComponent implements OnInit {

    @Input() windowData: ManagedWindow;

    @ContentChild("toolbar", {read: TemplateRef}) toolbar: TemplateRef<any>;
    @ContentChild("content", {read: TemplateRef}) content: TemplateRef<any>;

    constructor() { }

    ngOnInit() {
    }
}
