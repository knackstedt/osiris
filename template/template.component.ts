// @ts-nocheck
import { Component, Input, OnInit } from '@angular/core';
import { ManagedWindow } from 'client/app/services/window-manager.service';

@Component({
    templateUrl: './filetemplate.component.html',
    styleUrls: ['./filetemplate.component.scss']
})
export class TemplateComponent implements OnInit {

    @Input() windowRef: ManagedWindow;
    @Input() data: any;

    constructor() { }

    ngOnInit(): void {
        console.log(this.windowRef, this.data);
    }
}
