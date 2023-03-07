import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from 'client/app/services/configuration.service';
import { WindowManagerService } from 'client/app/services/window-manager.service';

@Component({
    selector: 'app-workspace',
    templateUrl: './workspace.component.html',
    styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent {

    public windows: any[] = [];

    constructor(
        public configuration: ConfigurationService,
        public windowManager: WindowManagerService
    ) {
    }
}
