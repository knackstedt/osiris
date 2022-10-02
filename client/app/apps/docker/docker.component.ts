import { Component, Input, OnInit } from '@angular/core';
import { ManagedWindow } from 'client/app/services/window-manager.service';

@Component({
    templateUrl: './docker.component.html',
    styleUrls: ['./docker.component.scss']
})
export class DockerComponent implements OnInit {

    @Input() windowRef: ManagedWindow;
    @Input() data: any;

    constructor() { }

    ngOnInit(): void {
        console.log(this.windowRef, this.data);
    }
}
