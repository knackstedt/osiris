import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ManagedWindow } from 'client/app/services/window-manager.service';

@Component({
    templateUrl: './system-settings.component.html',
    styleUrls: ['./system-settings.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SystemSettingsComponent implements OnInit {

    @Input() windowRef: ManagedWindow;
    @Input() data: any;

    constructor() { }

    ngOnInit(): void {
        console.log(this.windowRef, this.data);
    }
}
