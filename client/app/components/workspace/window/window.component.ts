import { Component, Input, ViewEncapsulation, OnInit } from '@angular/core';
import { ManagedWindow } from '../../../services/window-manager.service';
import { KeyboardService } from '../../../services/keyboard.service';

@Component({
    selector: 'app-window',
    templateUrl: './window.component.html',
    styleUrls: ['./window.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class WindowComponent implements OnInit {

    @Input() window: ManagedWindow;

    inputs: Object;

    constructor(private keyboard: KeyboardService) {
        keyboard.onKeyCommand({
            key: "w",
            ctrl: true,
            window: this.window,
            interrupt: true
        }).subscribe(evt => this.window.close());
    }

    ngOnInit() {
        this.inputs = {
            window: this.window,
            ...this.window.data
        };
    }
}
