import { Component, Input, OnInit } from '@angular/core';
import { ManagedWindow } from 'client/app/services/window-manager.service';

@Component({
    templateUrl: './kubernetes.component.html',
    styleUrls: ['./kubernetes.component.scss']
})
export class KubernetesComponent implements OnInit {

    @Input() windowRef: ManagedWindow;
    @Input() data: any;

    constructor() { }

    ngOnInit(): void {
        console.log(this.windowRef, this.data);
    }
}
