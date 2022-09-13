// @ts-nocheck
import { Component } from '@angular/core';
import { WindowOptions } from '../../services/window-manager.service';

@Component({
    selector: 'app-filetemplate',
    templateUrl: './filetemplate.component.html',
    styleUrls: ['./filetemplate.component.scss']
})
export class TemplateComponent implements OnInit {

    @Input() windowData: WindowOptions;

    constructor() { }

    ngOnInit(): void {
        console.log(this.windowData);
    }
}
