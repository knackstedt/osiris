import { Component, Input, OnInit } from '@angular/core';
import { ManagedWindow } from 'client/app/services/window-manager.service';
import { OnDragEnd } from 'client/types/window';
import { WindowOptions } from '../../../types/window';

@Component({
    selector: 'app-image-viewer',
    templateUrl: './image-viewer.component.html',
    styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {

    @Input() windowRef: ManagedWindow;

    constructor() { }

    ngOnInit(): void {
        console.log(this.windowRef);
    }
}
