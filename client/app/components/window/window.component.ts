import { Component, OnInit, ComponentRef, Input, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { ManagedWindow } from '../../services/window-manager.service';

@Component({
    selector: 'app-window',
    templateUrl: './window.component.html',
    styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit {
    
    @Input() window: ManagedWindow;

    constructor() { }

    ngOnInit() {
    }
    
    injectPortal(ref, data: ManagedWindow) {
        console.log("we are inject")
        const component = ref as ComponentRef<any>;
        component.instance["windowData"] = data;
        data._component = component;
    }
}
