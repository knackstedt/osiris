import { Component, Input, OnInit } from '@angular/core';
import { ManagedWindow } from '../../../services/window-manager.service';

@Component({
    selector: 'app-image-viewer',
    templateUrl: './image-viewer.component.html',
    styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {
    @Input() windowData: ManagedWindow;

    constructor() { }

    ngOnInit() {
    }

}
