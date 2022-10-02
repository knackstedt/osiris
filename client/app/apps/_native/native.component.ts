import { Component, Input, OnInit } from '@angular/core';
import { ManagedWindow } from 'client/app/services/window-manager.service';

@Component({
    templateUrl: './native.component.html',
    styleUrls: ['./native.component.scss']
})
export class NativeComponent implements OnInit {

    @Input() windowRef: ManagedWindow;
    @Input() data: any;

    constructor() { }

    ngOnInit(): void {
        console.log(this.windowRef, this.data);
    }
}
