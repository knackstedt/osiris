import { Component, Input, OnInit, Output, EventEmitter, TemplateRef } from '@angular/core';
import { ManagedWindow } from 'client/app/services/window-manager.service';
import { WindowManagerService } from '../../../services/window-manager.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-window-toolbar',
    templateUrl: './window-toolbar.component.html',
    styleUrls: ['./window-toolbar.component.scss']
})
export class WindowToolbarComponent implements OnInit {

    environment = environment;

    @Input() template: TemplateRef<any>;

    @Input() window: ManagedWindow;

    @Output() onClose = new EventEmitter();

    constructor(public windowManager: WindowManagerService) { }

    ngOnInit() {
    }

}
