import { Component, Input, OnInit } from '@angular/core';
import { ManagedWindow } from '../../../services/window-manager.service';

@Component({
    selector: 'app-code-editor',
    templateUrl: './code-editor.component.html',
    styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit {
    @Input() windowData: ManagedWindow;

    constructor() { }

    ngOnInit() {
    }

}
