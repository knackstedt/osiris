import { Component, OnInit, ComponentRef, Input, ViewChild, ElementRef, TemplateRef, ViewEncapsulation } from '@angular/core';
import { ManagedWindow } from '../../services/window-manager.service';

@Component({
    selector: 'app-window',
    templateUrl: './window.component.html',
    styleUrls: ['./window.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class WindowComponent {
    
    @Input() window: ManagedWindow;
    @Input() data: any;

    error: any;

    injectPortal(ref) {
        const component = ref as ComponentRef<any>;

        // Bind the window reference
        component.instance["windowRef"] = this.window;
        // Bind arbitrary data
        component.instance["data"] = this.data;
        
        this.window._component = component;

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
