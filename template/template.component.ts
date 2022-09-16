// @ts-nocheck
import { Component } from '@angular/core';
import { OnDragEnd } from 'client/types/window';
import { WindowOptions } from '../../../types/window';

@Component({
    selector: 'app-filetemplate',
    templateUrl: './filetemplate.component.html',
    styleUrls: ['./filetemplate.component.scss']
})
export class TemplateComponent implements OnInit, OnResize, OnDragEnd, On {

    @Input() windowData: WindowOptions;

    constructor() { }

    ngOnInit(): void {
        console.log(this.windowData);
    }
}
