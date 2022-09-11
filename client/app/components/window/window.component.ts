import { Component, ContentChild, HostListener, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { WindowData, WindowManagerService } from '../../services/window-manager.service';

@Component({
    selector: 'app-window',
    templateUrl: './window.component.html',
    styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit {
    @ContentChild("titlebar", { read: TemplateRef }) titlebarTemplate!: TemplateRef<any>;
    @ContentChild("content", { read: TemplateRef }) rightTemplate!: TemplateRef<any>;
    // @ContentChild("bottomTemplate", { read: TemplateRef }) bottomTemplate!: TemplateRef<any>

    @Input() title: string;

    @Input() id: number;
    @Input() windowData: WindowData;

    isActive = false;

    constructor(private windowManager: WindowManagerService) { }

    ngOnInit(): void {
    }

    minimize(evt: MouseEvent) {

    }
    maximize(evt: MouseEvent) {

    }
    close(evt: MouseEvent) {
        this.windowManager.destroyWindow(this.windowData);
    }

    @HostListener('window:blur', ['$event'])
    private onBlur(event?) {
        this.isActive = false;
    }

    onMouseDown(event: MouseEvent) {
        this.isActive = true;
    }
}
