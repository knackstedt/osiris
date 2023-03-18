import { Component, Input, ViewEncapsulation, OnInit, ViewContainerRef } from '@angular/core';
import { ManagedWindow } from '../../../services/window-manager.service';
import { KeyboardService } from '../../../services/keyboard.service';
import { ConfigurationService } from '../../../services/configuration.service';

@Component({
    selector: 'app-window',
    templateUrl: './window.component.html',
    styleUrls: ['./window.component.scss'],
    // encapsulation: ViewEncapsulation.None
})
export class WindowComponent implements OnInit {

    @Input() window: ManagedWindow;

    inputs: Object;

    constructor(
        private keyboard: KeyboardService,
        public config: ConfigurationService,
        private viewContainer: ViewContainerRef
    ) {
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
        this.configChange();

    }

    configChange() {
        const el = this.viewContainer.element.nativeElement;

        el.setAttribute('maxized-width', 'calc(100% - ' + (this.config.leftOffset + this.config.rightOffset) + 'px)');
        el.setAttribute('maxized-height', 'calc(100% - ' + (this.config.topOffset + this.config.bottomOffset) + 'px)');

        // el['--maxized-width'] = 'calc(100% - ' + this.config.leftOffset + this.config.rightOffset + ')';
        // el['--maxized-height'] = 'calc(100% - ' + this.config.topOffset + this.config.bottomOffset + ')';
    }
}
