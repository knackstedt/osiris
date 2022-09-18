import { Component, Input, OnInit, Output, EventEmitter, TemplateRef } from '@angular/core';
import { ManagedWindow } from 'client/app/services/window-manager.service';

@Component({
    selector: 'app-window-toolbar',
    templateUrl: './window-toolbar.component.html',
    styleUrls: ['./window-toolbar.component.scss']
})
export class WindowToolbarComponent implements OnInit {

    @Input() template: TemplateRef<any>;

    @Input() window: ManagedWindow;

    @Output() onClose = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

}
