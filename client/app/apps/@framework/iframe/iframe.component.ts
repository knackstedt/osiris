import { Component, Input, OnInit } from '@angular/core';
import { WindowTemplateComponent } from 'client/app/components/window-template/window-template.component';
import { UrlSanitizer } from 'client/app/pipes/urlsanitizer.pipe';
import { ManagedWindow } from 'client/app/services/window-manager.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-iframe',
    templateUrl: './iframe.component.html',
    styleUrls: ['./iframe.component.scss'],
    imports: [
        UrlSanitizer,
        WindowTemplateComponent
    ],
    standalone: true
})
export class IframeComponent implements OnInit {
    @Input() window: ManagedWindow;
    @Input() url: string;

    ngxShowDistractor$ = new BehaviorSubject(true);

    constructor() { }

    ngOnInit() {
    }

    onLoadComplete() {
        this.ngxShowDistractor$.next(false);

    }
}
