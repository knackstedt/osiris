import { Component, OnInit, ComponentRef, Input, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { ManagedWindow } from '../../services/window-manager.service';

@Component({
    selector: 'app-window',
    templateUrl: './window.component.html',
    styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit {
    
    @Input() window: ManagedWindow;

    error: any;

    constructor() { }

    ngOnInit() { }
    
    injectPortal(ref, data: ManagedWindow) {
        const component = ref as ComponentRef<any>;
        component.instance["windowData"] = data;
        data._component = component;

        // If we have a decorated __onError handler,
        // we listen for init errors.
        component.instance.__onError?.subscribe(err => {
            // avoid "Expression changed after last checked" error
            setTimeout(() => {
                this.error = err;
            }, 1);
        });
    }
}
