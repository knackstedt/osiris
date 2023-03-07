import { Component, Input, ViewEncapsulation } from '@angular/core';
import { ManagedWindow } from '../../../services/window-manager.service';
import { KeyboardService } from '../../../services/keyboard.service';

@Component({
    selector: 'app-window',
    templateUrl: './window.component.html',
    styleUrls: ['./window.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class WindowComponent {

    @Input() window: ManagedWindow;

    constructor(private keyboard: KeyboardService) {
        keyboard.onKeyCommand({
            key: "w",
            ctrl: true,
            window: this.window,
            interrupt: true
        }).subscribe(evt => this.window.close());
    }
}
